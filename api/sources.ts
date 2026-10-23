import { XMLParser, XMLValidator } from "fast-xml-parser";

const RSS = "https://www.kaleva.fi/feedit/rss/managed-listing/rss-maksuttomat/";
const CITY =
  "https://api.ouka.fi/v1/library_yearly_stats?select=measure,value,year&order=year.desc&limit=3";
const parser = new XMLParser({
  ignoreAttributes: true,
  processEntities: false,
  parseTagValue: false,
});

async function readSource(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(9000),
    headers: { Accept: "application/rss+xml, application/json, text/xml" },
    redirect: "error",
  });
  if (!response.ok) throw new Error(`Upstream HTTP ${response.status}`);
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty response");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 1024 * 1024) {
      await reader.cancel();
      throw new Error("Source too large");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
async function readRss() {
  const xml = await readSource(RSS);
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true)
    throw new Error("Invalid RSS");
  const parsed = parser.parse(xml);
  const raw = parsed?.rss?.channel?.item;
  if (!raw) throw new Error("Missing RSS items");
  const items = (Array.isArray(raw) ? raw : [raw])
    .slice(0, 30)
    .flatMap((item: Record<string, unknown>) => {
      if (typeof item.title !== "string" || typeof item.link !== "string")
        return [];
      try {
        const url = new URL(item.link);
        if (
          url.protocol !== "https:" ||
          !["www.kaleva.fi", "kaleva.fi"].includes(url.hostname)
        )
          return [];
        url.search = "";
        url.hash = "";
        const date =
          typeof item.pubDate === "string" ? new Date(item.pubDate) : null;
        return [
          {
            title: item.title.replace(/<[^>]*>/g, "").slice(0, 250),
            url: url.href,
            publishedAt:
              date && !Number.isNaN(date.valueOf()) ? date.toISOString() : null,
          },
        ];
      } catch {
        return [];
      }
    });
  return {
    status: "ok",
    url: RSS,
    total: items.length,
    items: items.slice(0, 6),
  };
}
async function readCity() {
  const data: unknown = JSON.parse(await readSource(CITY));
  if (!Array.isArray(data)) throw new Error("Invalid city data");
  const rows = data
    .filter(
      (row) =>
        typeof row?.measure === "string" &&
        Number.isFinite(Number(row.value)) &&
        Number.isInteger(Number(row.year)),
    )
    .map((row) => ({
      measure: row.measure.slice(0, 100),
      value: Number(row.value),
      year: Number(row.year),
    }));
  if (!rows.length) throw new Error("No dated city data");
  return {
    status: "ok",
    url: CITY,
    rows,
    newestReturnedYear: Math.max(...rows.map((row) => row.year)),
  };
}
export async function GET() {
  const results = await Promise.allSettled([readRss(), readCity()]);
  const result = (index: number, url: string) => {
    const r = results[index];
    if (r.status === "fulfilled") return r.value;
    console.error("Source fetch failed", {
      source: index === 0 ? "kaleva-rss" : "oulu-api",
      error:
        r.reason instanceof Error ? r.reason.message : "Unknown source error",
    });
    return { status: "unavailable", url };
  };
  const allFailed = results.every((r) => r.status === "rejected");
  return Response.json(
    {
      fetchedAt: new Date().toISOString(),
      rss: result(0, RSS),
      city: result(1, CITY),
    },
    {
      status: allFailed ? 502 : 200,
      headers: {
        "Cache-Control": allFailed
          ? "no-store"
          : "public, s-maxage=120, stale-while-revalidate=60",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
