import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  GET,
  POST,
  checkFidelity,
  resetAssistant,
  resetNewsCache,
  setAssistantClient,
  ASSISTANT_MODEL,
  type AssistOutput,
} from "../api/news.ts";
import { aiDraft, splitTitle, PLACEHOLDER } from "../src/data.ts";

// Sama rakenne kuin Kalevan oikeassa syötteessä (tarkistettu 24.10.2026).
const feed = `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>Maksuttomat sisällöt</title>
<item><title>Parkkipaten työntekijät lakkoon ensi kuussa</title><link>https://www.kaleva.fi/parkkipaten-tyontekijat/13718839?utm_source=Kaleva</link><description>Viisipäiväinen lakko alkaa 5. marraskuuta. Lakko koskee kaikkia yhtiössä tehtäviä töitä.</description><pubDate>Wed, 21 Oct 2026 12:40:00 +0000</pubDate><guid>https://www.kaleva.fi/linkki/13718839</guid></item>
<item><title>Naamioitunut seurue häiriköi keskustassa</title><link>https://www.kaleva.fi/naamioitunut/13722723</link><description>Naamioitunut seurue häiriköi keskustassa</description><pubDate>Sat, 24 Oct 2026 04:33:14 +0000</pubDate><guid>https://www.kaleva.fi/linkki/13722723</guid></item>
<item><title>IS: Google lobbasi hallitusta</title><link>https://www.kaleva.fi/is-google/13721477</link><description>Yhtiö pyrki tapaamaan ministereitä.</description><pubDate>Fri, 23 Oct 2026 07:02:55 +0000</pubDate><guid>https://www.kaleva.fi/linkki/13721477</guid></item>
</channel></rss>`;
const good: AssistOutput = {
  headline_en: "Parkkipate employees to strike next month",
  description_en:
    "The five-day strike begins on 5 November. The strike covers all work done in the company.",
  topics: ["work", "transport"],
  relevance: { students: "low", families: "medium" },
  relevance_explanation:
    "The headline reports a strike by Parkkipate employees; the description says it starts on 5 November and covers all work in the company.",
  evidence_sufficient: false,
  missing_information: [
    "Which parking services in Oulu are affected?",
    "Will parking fees or enforcement change during the strike?",
  ],
  unsupported_assumptions: [
    "That parking in Oulu will be free during the strike.",
  ],
  style_references_used: ["R9"],
};
const originalFetch = globalThis.fetch;
type Params = {
  model: string;
  messages: { content: string }[];
  output_config: { effort: string; format: { type: string } };
  fallbacks: unknown;
  betas: string[];
  max_tokens: number;
  system: string;
};
let sent: Params[] = [];
function mock(reply: (p: Params) => unknown) {
  sent = [];
  setAssistantClient({
    create: async (p) => {
      sent.push(p as unknown as Params);
      return reply(p as unknown as Params) as never;
    },
  });
}
const ok = (output: unknown) => () => ({
  stop_reason: "end_turn",
  content: [{ type: "text", text: JSON.stringify(output) }],
  usage: { input_tokens: 420, output_tokens: 180 },
});
// Testin pääsykoodi; ei käytössä missään ympäristössä.
const CODE = "test-access-code-0123456789abcdef";
const post = (id: unknown, code: string | null = CODE) =>
  POST(
    new Request("http://x/api/news", {
      method: "POST",
      headers: code === null ? {} : { Authorization: `Bearer ${code}` },
      body: JSON.stringify({ id }),
    }),
  );
const ENV = [
  "ANTHROPIC_API_KEY",
  "NEWSROOM_ACCESS_CODE",
  "ASSISTANT_MAX_CALLS_PER_HOUR",
  "ASSISTANT_MAX_CALLS_PER_DAY",
] as const;
const savedEnv = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));
beforeEach(() => {
  resetNewsCache();
  resetAssistant();
  setAssistantClient(null);
  for (const k of ENV) delete process.env[k];
  process.env.NEWSROOM_ACCESS_CODE = CODE;
  globalThis.fetch = async () => new Response(feed);
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  setAssistantClient(null);
  for (const k of ENV)
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
});

test("without credentials the assistant is reported unavailable and nothing is generated", async () => {
  const feedRes = await (await GET()).json();
  assert.equal(feedRes.assistant.available, false);
  const res = await post("kaleva-13718839");
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: "unavailable" });
});

test("sends only the feed's own headline and description; source URL and date come from the feed, not the model", async () => {
  mock(ok(good));
  const res = await post("kaleva-13718839");
  assert.equal(res.status, 200);
  const { draft, cached } = await res.json();
  assert.equal(cached, false);
  assert.equal(sent.length, 1);
  const p = sent[0];
  assert.equal(p.model, ASSISTANT_MODEL);
  assert.equal(p.messages.length, 1);
  // Lähde on viestin alussa; mahdollinen tyyliosio tulee sen jälkeen eikä sisällä Kalevan tekstiä.
  assert.ok(
    p.messages[0].content.startsWith(
      "Finnish headline: Parkkipaten työntekijät lakkoon ensi kuussa\nKaleva feed description: Viisipäiväinen lakko alkaa 5. marraskuuta. Lakko koskee kaikkia yhtiössä tehtäviä töitä.",
    ),
  );
  assert.equal(p.output_config.format.type, "json_schema");
  assert.equal(p.output_config.effort, "low");
  assert.equal(p.fallbacks, "default");
  assert.deepEqual(p.betas, ["server-side-fallback-2026-07-01"]);
  assert.ok(p.max_tokens <= 4000);
  assert.match(p.system, /must not use outside knowledge/);
  assert.deepEqual(draft.source, {
    title: "Parkkipaten työntekijät lakkoon ensi kuussa",
    description:
      "Viisipäiväinen lakko alkaa 5. marraskuuta. Lakko koskee kaikkia yhtiössä tehtäviä töitä.",
    url: "https://www.kaleva.fi/parkkipaten-tyontekijat/13718839",
    publishedAt: "2026-10-21T12:40:00.000Z",
  });
  assert.deepEqual(draft.fidelityWarnings, []);
  assert.deepEqual(draft.usage, { inputTokens: 420, outputTokens: 180 });
});

test("a story without a feed description is sent as '(none)' and an invented description is flagged", async () => {
  mock(
    ok({
      ...good,
      headline_en: "Masked group caused trouble in the city centre",
      description_en: "Police arrested three people.",
      relevance_explanation: "The headline reports a disturbance.",
    }),
  );
  const { draft } = await (await post("kaleva-13722723")).json();
  assert.match(
    sent[0].messages[0].content,
    /Kaleva feed description: \(none\)(\n|$)/,
  );
  assert.equal(draft.source.description, null);
  assert.ok(
    draft.fidelityWarnings.some((w: string) => w.includes("no description")),
  );
});

test("fidelity checks flag new numbers, dropped attribution, padding and personal advice", () => {
  const src = {
    title: "IS: Google lobbasi hallitusta",
    description: "Yhtiö pyrki tapaamaan ministereitä.",
  };
  const w = checkFidelity(src, {
    ...good,
    headline_en: "Google lobbied the government 12 times",
    description_en: "The company tried to meet ministers. ".repeat(6),
    relevance_explanation: "You should check your electricity contract.",
  });
  assert.ok(w.some((x) => x.includes("“12”")));
  assert.ok(w.some((x) => x.includes("“IS:”")));
  assert.ok(w.some((x) => x.includes("much longer")));
  assert.ok(w.some((x) => x.includes("advice")));
  // Lähteen omat luvut (5. marraskuuta) eivät aiheuta varoitusta.
  assert.deepEqual(
    checkFidelity(
      {
        title: "Parkkipaten työntekijät lakkoon",
        description: "Lakko alkaa 5. marraskuuta.",
      },
      { ...good, description_en: "The strike begins on 5 November." },
      ["R9"],
    ),
    [],
  );
});

test("AI draft cannot be approved as generated: editor notes, fidelity warnings and missing information stay visible", () => {
  const draft = {
    itemId: "kaleva-13718839",
    source: {
      title: "Parkkipaten työntekijät lakkoon ensi kuussa",
      description: "Viisipäiväinen lakko alkaa 5. marraskuuta.",
      url: "https://www.kaleva.fi/x/13718839",
      publishedAt: "2026-10-21T12:40:00.000Z",
    },
    output: good,
    fidelityWarnings: [
      "The number “7” in the English text does not appear in the Finnish source.",
    ],
    model: ASSISTANT_MODEL,
    promptVersion: "assist-v1",
    generatedAt: "2026-10-24T08:00:00.000Z",
    usage: null,
  };
  const copy = aiDraft(draft);
  // Hyväksyntäportti (PLACEHOLDER) estää julkaisun molemmilla kielillä.
  assert.ok(PLACEHOLDER.test(copy.en));
  assert.ok(PLACEHOLDER.test(copy.fi));
  assert.match(copy.en, /\[EDITOR: AI fidelity check – The number “7”/);
  assert.match(copy.en, /not enough to say who is affected/);
  assert.match(copy.en, /– Which parking services in Oulu are affected\?/);
  assert.match(
    copy.en,
    /Source: Kaleva, “Parkkipaten työntekijät lakkoon ensi kuussa” \(original Finnish headline\), published 21\/10\/2026/,
  );
  assert.ok(
    !copy.en.includes("free during the strike"),
    "Unsupported assumption leaked into reader text",
  );
  // Suomenkielinen versio käyttää Kalevan omaa tekstiä, ei konekäännöstä.
  assert.equal(
    splitTitle(copy.fi).title,
    "Parkkipaten työntekijät lakkoon ensi kuussa",
  );
  assert.equal(splitTitle(copy.en).title, good.headline_en);
});

test("unknown or malformed ids never reach the model", async () => {
  mock(ok(good));
  assert.equal((await post("kaleva-99999999")).status, 404);
  assert.equal((await post("../etc")).status, 400);
  assert.equal(
    (
      await POST(
        new Request("http://x", {
          method: "POST",
          headers: { Authorization: `Bearer ${CODE}` },
          body: "not json",
        }),
      )
    ).status,
    400,
  );
  assert.equal(sent.length, 0);
});

test("results are cached and concurrent requests share one model call", async () => {
  mock(ok(good));
  const [a, b] = await Promise.all([
    post("kaleva-13718839"),
    post("kaleva-13718839"),
  ]);
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  assert.equal(sent.length, 1);
  const again = await (await post("kaleva-13718839")).json();
  assert.equal(again.cached, true);
  assert.equal(sent.length, 1);
});

test("hourly call budget returns 429 without calling the model", async () => {
  process.env.ASSISTANT_MAX_CALLS_PER_HOUR = "1";
  mock(ok({ ...good, headline_en: "Translated headline" }));
  assert.equal((await post("kaleva-13718839")).status, 200);
  const res = await post("kaleva-13721477");
  assert.equal(res.status, 429);
  assert.deepEqual(await res.json(), { error: "budget" });
  assert.equal(sent.length, 1);
});

test("model failures return specific errors, are not cached and can be retried", async () => {
  const cases: [unknown, string][] = [
    [{ stop_reason: "refusal", content: [] }, "refusal"],
    [
      { stop_reason: "max_tokens", content: [{ type: "text", text: "{" }] },
      "truncated",
    ],
    [
      {
        stop_reason: "end_turn",
        content: [{ type: "text", text: "Here is your draft" }],
      },
      "invalid_output",
    ],
    [
      {
        stop_reason: "end_turn",
        content: [
          {
            type: "text",
            text: JSON.stringify({ ...good, topics: ["weather"] }),
          },
        ],
      },
      "invalid_output",
    ],
    [
      {
        stop_reason: "end_turn",
        content: [
          { type: "text", text: JSON.stringify({ ...good, headline_en: " " }) },
        ],
      },
      "invalid_output",
    ],
  ];
  for (const [reply, code] of cases) {
    resetAssistant();
    mock(() => reply);
    const res = await post("kaleva-13718839");
    assert.equal(res.status, 502, code);
    assert.deepEqual(await res.json(), { error: code });
  }
  resetAssistant();
  setAssistantClient({
    create: async () => {
      throw new Error("network down");
    },
  });
  assert.deepEqual(await (await post("kaleva-13718839")).json(), {
    error: "model_error",
  });
  mock(ok(good));
  const retry = await post("kaleva-13718839");
  assert.equal(retry.status, 200);
  assert.equal(sent.length, 1);
});

test("assistant does not run when Kaleva's feed is unreachable and nothing is cached", async () => {
  mock(ok(good));
  globalThis.fetch = async () => new Response("down", { status: 503 });
  assert.equal((await post("kaleva-13718839")).status, 404);
  assert.equal(sent.length, 0);
});

test("fails closed when the editor access code is missing or too short", async () => {
  mock(ok(good));
  for (const value of [undefined, "short-code"]) {
    if (value === undefined) delete process.env.NEWSROOM_ACCESS_CODE;
    else process.env.NEWSROOM_ACCESS_CODE = value;
    const feedRes = await (await GET()).json();
    assert.equal(feedRes.assistant.available, false);
    assert.equal(feedRes.assistant.reason, "no_access_code");
    const res = await post("kaleva-13718839", value ?? "");
    assert.equal(res.status, 503);
  }
  assert.equal(sent.length, 0);
});

test("requests without the right access code are rejected before any feed or model work", async () => {
  mock(ok(good));
  let feedCalls = 0;
  globalThis.fetch = async () => {
    feedCalls++;
    return new Response(feed);
  };
  for (const code of [null, "", "wrong-code-0123456789abcdefgh", `${CODE}x`]) {
    const res = await post("kaleva-13718839", code);
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: "unauthorized" });
  }
  assert.equal(sent.length, 0);
  assert.equal(feedCalls, 0);
  assert.equal((await post("kaleva-13718839")).status, 200);
});

test("repeated wrong codes lock the endpoint, even for the right code, until the window passes", async () => {
  mock(ok(good));
  for (let i = 0; i < 10; i++)
    assert.equal((await post("kaleva-13718839", "guess-" + i)).status, 401);
  const locked = await post("kaleva-13718839");
  assert.equal(locked.status, 429);
  assert.deepEqual(await locked.json(), { error: "locked" });
  assert.equal(sent.length, 0);
  const realNow = Date.now;
  Date.now = () => realNow() + 11 * 60 * 1000;
  try {
    assert.equal((await post("kaleva-13718839")).status, 200);
  } finally {
    Date.now = realNow;
  }
});

test("daily cap applies across hours and limits are configurable", async () => {
  process.env.ASSISTANT_MAX_CALLS_PER_DAY = "1";
  process.env.ASSISTANT_MAX_CALLS_PER_HOUR = "5";
  mock(ok({ ...good, headline_en: "Translated headline" }));
  assert.equal((await post("kaleva-13718839")).status, 200);
  const realNow = Date.now;
  Date.now = () => realNow() + 2 * 3.6e6;
  try {
    const res = await post("kaleva-13721477");
    assert.equal(res.status, 429);
    assert.deepEqual(await res.json(), { error: "budget" });
  } finally {
    Date.now = realNow;
  }
  assert.equal(sent.length, 1);
});

test("no more than three different stories are generated at once", async () => {
  const release: (() => void)[] = [];
  sent = [];
  setAssistantClient({
    create: (p) =>
      new Promise((resolve) => {
        sent.push(p as never);
        release.push(() => resolve(ok(good)() as never));
      }),
  });
  const more = feed.replace(
    "</channel>",
    [1, 2, 3]
      .map(
        (n) =>
          `<item><title>Juttu ${n}</title><link>https://www.kaleva.fi/j/1000000${n}</link><pubDate>Wed, 21 Oct 2026 12:40:00 +0000</pubDate><guid>https://www.kaleva.fi/linkki/1000000${n}</guid></item>`,
      )
      .join("") + "</channel>",
  );
  globalThis.fetch = async () => new Response(more);
  const ids = ["kaleva-13718839", "kaleva-13722723", "kaleva-13721477"];
  const running = ids.map((id) => post(id));
  await new Promise((r) => setTimeout(r, 10));
  const fourth = await post("kaleva-10000001");
  assert.equal(fourth.status, 429);
  assert.deepEqual(await fourth.json(), { error: "busy" });
  release.forEach((r) => r());
  for (const res of await Promise.all(running)) assert.equal(res.status, 200);
  assert.equal(sent.length, 3);
});
