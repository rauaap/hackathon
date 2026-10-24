import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  GET,
  POST,
  HOUSE_STYLE,
  STYLE_REFERENCES,
  checkFidelity,
  resetAssistant,
  resetNewsCache,
  selectStyleReferences,
  setAssistantClient,
  styleBlock,
  type AssistOutput,
} from "../api/news.ts";
import { aiDraft, PLACEHOLDER } from "../src/data.ts";

// Otsikot ja kuvaukset Kalevan oikeasta syötteestä 24.10.2026.
const strike = {
  title: "Parkkipaten työntekijät lakkoon ensi kuussa",
  description:
    "Viisipäiväinen lakko alkaa 5. marraskuuta. Lakko koskee kaikkia yhtiössä tehtäviä töitä.",
};
const ids = (m: { id: string }[]) => m.map((x) => x.id);

test("selects relevant 2012 references by topic and terminology", () => {
  assert.equal(
    selectStyleReferences(strike, ["work", "transport"])[0].id,
    "R9",
  );
  assert.deepEqual(
    ids(
      selectStyleReferences(
        {
          title: "Yksi otettu kiinni Kiimingin keskiviikkoillan ammuskelusta",
          description: "Poliisi on ottanut kiinni yhden henkilön.",
        },
        ["safety"],
      ),
    ),
    ["R8"],
  );
  const traffic = selectStyleReferences(
    {
      title:
        "Rekan perävaunusta irtosi ovi Pohjantiellä, liikenteeseen sinkoutui penkkejä",
      description: null,
    },
    ["transport", "safety"],
  );
  assert.equal(traffic[0].id, "R4");
  assert.ok(traffic[0].terms.some((t) => t.en === "traffic"));
  const daycare = selectStyleReferences(
    { title: "Lapsiperheköyhyys näkyy Oulun päiväkodeissa", description: null },
    ["family"],
  );
  assert.equal(daycare[0].id, "R2");
  // Vanha termi tulee varoituksen kanssa: nykyinen virallinen termi on etusijalla.
  assert.match(daycare[0].terms[0].note ?? "", /ECEC/);
  assert.ok(selectStyleReferences(strike, ["work"], 5).length <= 5);
});

test("falls back to standard mode when nothing relevant matches", () => {
  assert.deepEqual(
    selectStyleReferences(
      {
        title: "Helsinki sai yleisurheilun EM-kilpailut",
        description: "Kilpailut järjestetään 2030.",
      },
      ["sport", "events"],
    ),
    [],
  );
  assert.deepEqual(
    selectStyleReferences(
      { title: "Kysely: millaiset hautajaiset pitäisit?", description: null },
      [],
    ),
    [],
  );
  // "keskustan" puolueena ei ole paikka.
  assert.deepEqual(
    selectStyleReferences(
      {
        title: "Oppositio teki välikysymyksen",
        description: "SDP:n, keskustan ja vihreiden edustajat.",
      },
      ["politics"],
    ),
    [],
  );
  assert.equal(styleBlock([]), "");
});

test("prompt guidance contains only the newsroom's own notes, never Kaleva text or reference facts", () => {
  const block = styleBlock(
    selectStyleReferences(strike, ["work", "transport", "economy"]),
  );
  assert.match(block, /style only, not facts about this story/);
  assert.match(block, /Never add a place, person, role, figure or event/);
  for (const ref of STYLE_REFERENCES) {
    assert.ok(
      !block.includes(ref.title),
      `Kaleva headline sent to model: ${ref.title}`,
    );
    for (const e of ref.entities)
      assert.ok(!block.includes(e), `Reference fact sent to model: ${e}`);
  }
  for (const rule of HOUSE_STYLE) assert.ok(block.includes(rule.id));
});

test("every reference is a verified Kaleva archive article with metadata", () => {
  assert.ok(STYLE_REFERENCES.length >= 5 && STYLE_REFERENCES.length <= 10);
  for (const r of STYLE_REFERENCES) {
    assert.match(r.url, /^https:\/\/www\.kaleva\.fi\/[a-z0-9-]+\/\d{7}$/);
    assert.match(r.publishedAt, /^2012-0[56]-\d\d$/);
    assert.ok(r.title && r.notes.length && r.topics.length);
  }
});

const good: AssistOutput = {
  headline_en: "Parkkipate Employees to Strike Next Month",
  description_en:
    "The five-day strike begins on 5 November. It covers all work done in the company.",
  topics: ["work"],
  relevance: { students: "low", families: "medium" },
  relevance_explanation:
    "The headline reports a strike by Parkkipate employees.",
  evidence_sufficient: false,
  missing_information: [],
  unsupported_assumptions: [],
  style_references_used: ["R9", "H1"],
};

test("facts from historical references are flagged when they appear in a new story", () => {
  assert.deepEqual(checkFidelity(strike, good, ["R9", "R10"]), []);
  const leaked = checkFidelity(
    strike,
    {
      ...good,
      description_en:
        "The strike begins on 5 November, as at Kastelli in Oulu.",
    },
    ["R9"],
  );
  assert.ok(
    leaked.some((w) =>
      w.includes("“Kastelli” comes from the 2012 style reference R2"),
    ),
  );
  const invented = checkFidelity(
    strike,
    { ...good, style_references_used: ["R3"] },
    ["R9"],
  );
  assert.ok(invented.some((w) => w.includes("not provided: R3")));
  // Sama nimi on sallittu, kun se on lähteessä.
  assert.deepEqual(
    checkFidelity(
      { title: "Ilmarinen ostaa talon", description: null },
      {
        ...good,
        headline_en: "Ilmarinen Buys Building",
        description_en: "",
        relevance_explanation: "",
        style_references_used: [],
      },
      [],
    ),
    [],
  );
});

const feed = `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>Maksuttomat sisällöt</title>
<item><title>${strike.title}</title><link>https://www.kaleva.fi/parkkipaten-tyontekijat/13718839</link><description>${strike.description}</description><pubDate>Wed, 21 Oct 2026 12:40:00 +0000</pubDate><guid>https://www.kaleva.fi/linkki/13718839</guid></item>
<item><title>Helsinki sai yleisurheilun EM-kilpailut</title><link>https://www.kaleva.fi/helsinki-sai/13720195</link><description>Yleisurheilun Euroopan mestaruuskilpailut järjestetään Helsingissä 2030.</description><pubDate>Thu, 22 Oct 2026 09:37:00 +0000</pubDate><guid>https://www.kaleva.fi/linkki/13720195</guid></item>
</channel></rss>`;
const CODE = "test-access-code-0123456789abcdef";
const post = (id: string) =>
  POST(
    new Request("http://x/api/news", {
      method: "POST",
      headers: { Authorization: `Bearer ${CODE}` },
      body: JSON.stringify({ id }),
    }),
  );
const originalFetch = globalThis.fetch;
const savedCode = process.env.NEWSROOM_ACCESS_CODE;
let sent: string[] = [];
beforeEach(() => {
  resetNewsCache();
  resetAssistant();
  process.env.NEWSROOM_ACCESS_CODE = CODE;
  globalThis.fetch = async () => new Response(feed);
  sent = [];
  setAssistantClient({
    create: async (p) => {
      sent.push(String((p.messages[0] as { content: string }).content));
      return {
        stop_reason: "end_turn",
        content: [{ type: "text", text: JSON.stringify(good) }],
      };
    },
  });
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  setAssistantClient(null);
  if (savedCode === undefined) delete process.env.NEWSROOM_ACCESS_CODE;
  else process.env.NEWSROOM_ACCESS_CODE = savedCode;
});

test("style-grounded and standard modes are both explicit in the draft and the feed", async () => {
  const feedRes = await (await GET()).json();
  assert.equal(
    feedRes.styleGuide.archiveUrl,
    "https://www.kaleva.fi/aihe/news-in-english/16976",
  );
  assert.match(feedRes.styleGuide.caveat, /2012/);
  assert.equal(
    feedRes.items.find((i: { id: string }) => i.id === "kaleva-13718839")
      .styleReferences[0].id,
    "R9",
  );
  assert.deepEqual(
    feedRes.items.find((i: { id: string }) => i.id === "kaleva-13720195")
      .styleReferences,
    [],
  );

  const grounded = (await (await post("kaleva-13718839")).json()).draft;
  assert.equal(grounded.mode, "style-grounded");
  assert.equal(
    grounded.styleReferences[0].title,
    "Tough Competition for Motor Vehicle Inspection in Oulu Region",
  );
  assert.match(sent[0], /STYLE GUIDANCE/);
  // Lähde on edelleen ainoa faktalähde ja tulee ensin.
  assert.ok(sent[0].startsWith(`Finnish headline: ${strike.title}`));

  const standard = (await (await post("kaleva-13720195")).json()).draft;
  assert.equal(standard.mode, "standard");
  assert.deepEqual(standard.styleReferences, []);
  assert.ok(!sent[1].includes("STYLE GUIDANCE"));
});

test("a style-grounded draft still needs human approval", async () => {
  const draft = (await (await post("kaleva-13718839")).json()).draft;
  const copy = aiDraft(draft);
  assert.ok(PLACEHOLDER.test(copy.en) && PLACEHOLDER.test(copy.fi));
  // Viitteiden otsikot eivät päädy lukijalle näkyvään tekstiin.
  for (const r of STYLE_REFERENCES) assert.ok(!copy.en.includes(r.title));
});
