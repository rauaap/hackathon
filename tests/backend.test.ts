import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  GET,
  POST,
  resetAssistant,
  resetNewsCache,
  setAssistantClient,
  type AssistOutput,
} from "../api/news.ts";
import { aiDraft, PLACEHOLDER } from "../src/data.ts";

// Taustapalvelun asiakas ja saatavuus ilman oikeaa verkkoa tai mallia.
const BACKEND = "https://agent.example.test";
const SECRET = "backend-secret-0123456789abcdef";
const CODE = "test-access-code-0123456789abcdef";
const title = "Parkkipaten työntekijät lakkoon ensi kuussa";
const feed = `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>Maksuttomat sisällöt</title>
<item><title>${title}</title><link>https://www.kaleva.fi/parkkipaten-tyontekijat/13718839</link><description>Viisipäiväinen lakko alkaa 5. marraskuuta.</description><pubDate>Wed, 21 Oct 2026 12:40:00 +0000</pubDate><guid>https://www.kaleva.fi/linkki/13718839</guid></item>
</channel></rss>`;
const good: AssistOutput = {
  headline_en: "Parkkipate Employees to Strike Next Month",
  description_en: "The five-day strike begins on 5 November.",
  topics: ["work"],
  relevance: { students: "low", families: "medium" },
  relevance_explanation: "The headline reports a strike.",
  evidence_sufficient: false,
  missing_information: ["Where the strike applies."],
  unsupported_assumptions: [],
  style_references_used: [],
};

type Call = { url: string; method: string; auth: string | null; body: unknown };
let calls: Call[] = [];
let healthReply: () => Response | Promise<Response>;
let generateReply: () => Response;
const originalFetch = globalThis.fetch;
const env = [
  "AGENT_BACKEND_URL",
  "AGENT_BACKEND_SECRET",
  "NEWSROOM_ACCESS_CODE",
];
const saved = Object.fromEntries(env.map((k) => [k, process.env[k]]));

beforeEach(() => {
  resetNewsCache();
  resetAssistant();
  setAssistantClient(null);
  calls = [];
  process.env.AGENT_BACKEND_URL = BACKEND;
  process.env.AGENT_BACKEND_SECRET = SECRET;
  process.env.NEWSROOM_ACCESS_CODE = CODE;
  healthReply = () =>
    Response.json({ ok: true, model: "claude-backend-model" });
  generateReply = () =>
    Response.json({
      stop_reason: "end_turn",
      content: [{ type: "text", text: JSON.stringify(good) }],
      usage: { input_tokens: 1200, output_tokens: 300 },
    });
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    const headers = new Headers(init?.headers);
    calls.push({
      url,
      method: init?.method ?? "GET",
      auth: headers.get("authorization"),
      body: init?.body ? JSON.parse(String(init.body)) : null,
    });
    if (url === `${BACKEND}/health`) return healthReply();
    if (url === `${BACKEND}/generate`) return generateReply();
    return new Response(feed);
  }) as typeof fetch;
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const k of env)
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
});
const generateCalls = () => calls.filter((c) => c.url.endsWith("/generate"));
const post = (code = CODE) =>
  POST(
    new Request("http://x/api/news", {
      method: "POST",
      headers: { Authorization: `Bearer ${code}` },
      body: JSON.stringify({ id: "kaleva-13718839" }),
    }),
  );

test("configuration alone is not availability: the backend must answer /health", async () => {
  healthReply = () => new Response("down", { status: 502 });
  const body = await (await GET()).json();
  assert.deepEqual(
    [body.assistant.available, body.assistant.reason],
    [false, "backend_unreachable"],
  );
  healthReply = () => Promise.reject(new TypeError("fetch failed"));
  resetAssistant();
  assert.equal((await (await GET()).json()).assistant.available, false);
  // Kun palvelin ei vastaa, oikeallakaan koodilla ei yritetä mallikutsua.
  const res = await post();
  assert.equal(res.status, 503);
  assert.equal(generateCalls().length, 0);
});

test("a healthy backend makes the assistant available and reports the backend's model", async () => {
  const body = await (await GET()).json();
  assert.deepEqual(
    [body.assistant.available, body.assistant.reason, body.assistant.model],
    [true, null, "claude-backend-model"],
  );
  // Saatavuuden tarkistus ei koskaan tee mallikutsua.
  assert.equal(generateCalls().length, 0);
  assert.equal(calls.filter((c) => c.url.endsWith("/health")).length, 1);
  await GET();
  assert.equal(
    calls.filter((c) => c.url.endsWith("/health")).length,
    1,
    "health not cached",
  );
});

test("missing backend settings fail closed without contacting the backend", async () => {
  delete process.env.AGENT_BACKEND_SECRET;
  const body = await (await GET()).json();
  assert.deepEqual(
    [body.assistant.available, body.assistant.reason],
    [false, "no_backend"],
  );
  assert.equal(calls.filter((c) => c.url.startsWith(BACKEND)).length, 0);
});

test("a wrong editor code is rejected before any model request", async () => {
  const res = await post("wrong-code-wrong-code-wrong-code");
  assert.equal(res.status, 401);
  assert.equal(generateCalls().length, 0);
});

test("generation posts the prompt with the backend secret and returns an unpublished draft", async () => {
  const res = await post();
  assert.equal(res.status, 200);
  const { draft } = await res.json();
  const [call] = generateCalls();
  assert.equal(call.method, "POST");
  assert.equal(call.auth, `Bearer ${SECRET}`);
  const sent = call.body as { system: string; prompt: string; schema: object };
  assert.ok(sent.system.length > 0 && typeof sent.schema === "object");
  assert.ok(sent.prompt.startsWith(`Finnish headline: ${title}`));
  assert.equal(draft.model, "claude-backend-model");
  assert.deepEqual(draft.usage, { inputTokens: 1200, outputTokens: 300 });
  // Luonnos ei ohita ihmistä: siinä on hyväksynnän estävät merkinnät.
  const copy = aiDraft(draft);
  assert.ok(PLACEHOLDER.test(copy.en) && PLACEHOLDER.test(copy.fi));
});

test("a backend auth or model failure returns an error and no draft", async () => {
  for (const status of [401, 502]) {
    resetAssistant();
    generateReply = () => Response.json({ detail: "x" }, { status });
    const res = await post();
    assert.equal(res.status, 502);
    const body = await res.json();
    assert.equal(body.draft, undefined);
    assert.equal(body.error, "model_error");
  }
});

test("one feed read plus one backend wait fits inside the Vercel function limit", async () => {
  const { BACKEND_TIMEOUT_MS, FEED_TIMEOUT_MS } =
    await import("../api/news.ts");
  const { readFileSync } = await import("node:fs");
  const vercel = JSON.parse(
    readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
  );
  const limitMs = vercel.functions["api/news.ts"].maxDuration * 1000;
  // Marginaali vastauksen muodostamiselle.
  assert.ok(
    FEED_TIMEOUT_MS + BACKEND_TIMEOUT_MS <= limitMs - 5_000,
    `${FEED_TIMEOUT_MS + BACKEND_TIMEOUT_MS} ms vs ${limitMs} ms`,
  );
});
