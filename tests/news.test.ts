import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { GET, classify, normalize, resetNewsCache } from "../api/news.ts";

// Rakenne vastaa Kalevan oikeaa syötettä (tarkistettu 24.10.2026): title, link utm-parametreilla,
// description, pubDate, guid /linkki/<numero>, enclosure. Ei <category>-kenttiä.
const item = (
  n: number,
  title: string,
  description: string,
  date: string,
  link = `https://www.kaleva.fi/juttu/${n}?utm_source=Kaleva&amp;utm_medium=RSS`,
) =>
  `<item><title>${title}</title><link>${link}</link><description>${description}</description><pubDate>${date}</pubDate><guid>https://www.kaleva.fi/linkki/${n}</guid><enclosure length="0" type="image/jpeg" url="https://kuvat.kaleva.media/x.jpg"/></item>`;
const feed = (...items: string[]) =>
  `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>Maksuttomat sisällöt</title><link>https://www.kaleva.fi</link><lastBuildDate>Sat, 24 Oct 2026 04:33:14 +0000</lastBuildDate>${items.join("")}</channel></rss>`;
const sample = feed(
  item(
    13718839,
    "Parkkipaten työntekijät lakkoon ensi kuussa",
    "Viisipäiväinen lakko alkaa 5. marraskuuta.",
    "Wed, 21 Oct 2026 12:40:00 +0000",
  ),
  item(
    13718336,
    "Lapsiperheköyhyys näkyy Oulun päiväkodeissa",
    "Pääkirjoitus lapsiperheköyhyydestä torstaille 22.10.",
    "Wed, 21 Oct 2026 12:05:00 +0000",
  ),
  item(
    13716906,
    "Tekoäly selätti tutkijoita askarruttaneen kysymyksen",
    "Matematiikka tieteenalana on murroksessa.",
    "Wed, 21 Oct 2026 10:48:00 +0000",
  ),
  item(
    13722723,
    "Naamioitunut seurue häiriköi &amp; juoksi karkuun",
    "Naamioitunut seurue häiriköi &amp; juoksi karkuun",
    "Sat, 24 Oct 2026 04:33:14 +0000",
  ),
  // Kaksoiskappale samalla numerolla ja vieras linkki hylätään.
  item(
    13718839,
    "Parkkipaten työntekijät lakkoon ensi kuussa",
    "Toisto",
    "Wed, 21 Oct 2026 12:40:00 +0000",
  ),
  item(
    1,
    "Vieras linkki",
    "x",
    "Wed, 21 Oct 2026 12:40:00 +0000",
    "https://example.org/a",
  ),
);
const now = new Date("2026-10-24T08:00:00Z");
const originalFetch = globalThis.fetch;
let calls = 0;
beforeEach(() => {
  resetNewsCache();
  calls = 0;
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("normalizes Kaleva RSS into stable, deduplicated records with clean links", () => {
  const { items, title, lastBuildDate } = normalize(sample);
  assert.equal(title, "Maksuttomat sisällöt");
  assert.equal(lastBuildDate, "2026-10-24T04:33:14.000Z");
  assert.deepEqual(
    items.map((i) => i.id),
    [
      "kaleva-13718839",
      "kaleva-13718336",
      "kaleva-13716906",
      "kaleva-13722723",
    ],
  );
  assert.equal(items[0].url, "https://www.kaleva.fi/juttu/13718839");
  assert.equal(items[0].publishedAt, "2026-10-21T12:40:00.000Z");
  assert.equal(
    items[0].description,
    "Viisipäiväinen lakko alkaa 5. marraskuuta.",
  );
  assert.deepEqual(items[0].feedCategories, []);
  // Otsikon toistava kuvaus ei ole lisätietoa; entiteetit puretaan.
  assert.equal(items[3].title, "Naamioitunut seurue häiriköi & juoksi karkuun");
  assert.equal(items[3].description, null);
  assert.equal(items[1].kind, "editorial");
  assert.equal(items[0].kind, "news");
});

test("rejects entity declarations and invalid XML", () => {
  assert.throws(() => normalize('<!DOCTYPE rss [<!ENTITY x "y">]>' + sample));
  assert.throws(() => normalize("<rss><channel><item>"));
});

test("derives explainable topics and Oulu locality from headline and description only", () => {
  const [strike, poverty, ai] = normalize(sample).items.map((i) =>
    classify(i, now),
  );
  assert.deepEqual(
    strike.topics.map((t) => t.id),
    ["work", "transport"],
  );
  assert.ok(
    strike.topics.find((t) => t.id === "work")?.matched.includes("lakkoon"),
  );
  assert.equal(strike.locality.level, "none");
  assert.ok(poverty.topics.some((t) => t.id === "family"));
  assert.equal(poverty.locality.level, "oulu");
  assert.deepEqual(poverty.locality.matched, ["oulun"]);
  assert.ok(ai.topics.some((t) => t.id === "education"));
  // Pisteet ovat syiden summa, joten järjestys on selitettävissä.
  for (const a of ["students", "families"] as const) {
    const r = poverty.relevance[a];
    assert.equal(
      Math.round(r.reasons.reduce((s, x) => s + x.points, 0) * 10) / 10,
      r.score,
    );
  }
});

test("audiences get meaningfully different rankings", () => {
  const items = normalize(sample).items.map((i) => classify(i, now));
  const top = (a: "students" | "families") =>
    [...items]
      .sort((x, y) => y.relevance[a].score - x.relevance[a].score)
      .map((i) => i.id);
  assert.notDeepEqual(top("students"), top("families"));
  const poverty = items.find((i) => i.id === "kaleva-13718336")!;
  const ai = items.find((i) => i.id === "kaleva-13716906")!;
  assert.ok(
    poverty.relevance.families.score > poverty.relevance.students.score,
  );
  assert.ok(ai.relevance.students.score > ai.relevance.families.score);
});

test("caches a fresh result instead of refetching", async () => {
  globalThis.fetch = async () => {
    calls++;
    return new Response(sample);
  };
  const first = await (await GET()).json();
  const second = await (await GET()).json();
  assert.equal(calls, 1);
  assert.equal(first.status, "ok");
  assert.equal(second.fetchedAt, first.fetchedAt);
  assert.equal(first.items.length, 4);
  assert.ok(first.items[0].relevance.students.reasons.length > 0);
});

test("serves the last good copy as stale when Kaleva fails, without inventing data", async () => {
  globalThis.fetch = async () => new Response(sample);
  await GET();
  // Pakotetaan välimuisti vanhaksi siirtämällä kelloa.
  const realNow = Date.now;
  Date.now = () => realNow() + 10 * 60 * 1000;
  globalThis.fetch = async () => new Response("Unavailable", { status: 503 });
  try {
    const res = await GET();
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.status, "stale");
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(data.items.length, 4);
  } finally {
    Date.now = realNow;
  }
});

test("returns retryable 502 when Kaleva fails and nothing is cached", async () => {
  globalThis.fetch = async () => {
    throw new Error("offline");
  };
  const res = await GET();
  assert.equal(res.status, 502);
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.equal((await res.json()).status, "unavailable");
});
