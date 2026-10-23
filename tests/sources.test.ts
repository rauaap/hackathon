import { test } from "node:test";
import assert from "node:assert/strict";
import { GET } from "../api/sources.ts";
const rss = `<rss><channel><item><title>Test headline</title><link>https://www.kaleva.fi/example/123?utm_source=rss</link><pubDate>Fri, 23 Oct 2026 10:50:00 +0000</pubDate></item><item><title>Unsafe link</title><link>https://example.org/</link></item></channel></rss>`;
const city = JSON.stringify([
  { measure: "Pääkirjastoja", value: 1, year: 2016 },
]);
const originalFetch = globalThis.fetch;
test("returns dated RSS metadata, strips tracking, rejects foreign links and preserves old city year", async () => {
  globalThis.fetch = async (input) =>
    new Response(String(input).includes("kaleva.fi") ? rss : city);
  try {
    const res = await GET();
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.rss.items.length, 1);
    assert.equal(data.rss.items[0].url, "https://www.kaleva.fi/example/123");
    assert.equal(data.rss.items[0].publishedAt, "2026-10-23T10:50:00.000Z");
    assert.equal(data.city.newestReturnedYear, 2016);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
test("one upstream outage preserves the other source without inventing data", async () => {
  globalThis.fetch = async (input) =>
    String(input).includes("kaleva.fi")
      ? new Response(rss)
      : new Response("Unavailable", { status: 503 });
  try {
    const res = await GET();
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.rss.status, "ok");
    assert.equal(data.city.status, "unavailable");
    assert.equal(data.city.rows, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
test("complete outage returns retryable 502 with no-store", async () => {
  globalThis.fetch = async () => {
    throw new Error("Test upstream offline");
  };
  try {
    const res = await GET();
    const data = await res.json();
    assert.equal(res.status, 502);
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(data.rss.status, "unavailable");
    assert.equal(data.city.status, "unavailable");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
test("entity declarations are rejected instead of expanded", async () => {
  globalThis.fetch = async (input) =>
    new Response(
      String(input).includes("kaleva.fi")
        ? '<!DOCTYPE rss [<!ENTITY x "example">]>' + rss
        : city,
    );
  try {
    const data = await (await GET()).json();
    assert.equal(data.rss.status, "unavailable");
    assert.equal(data.city.status, "ok");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
