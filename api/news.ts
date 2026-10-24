import { XMLParser, XMLValidator } from "fast-xml-parser";
import type Anthropic from "@anthropic-ai/sdk";

// Kalevan maksuttomien sisältöjen RSS. Syöte ei sisällä <category>-kenttiä eikä artikkelitekstiä.
export const FEED_URL =
  "https://www.kaleva.fi/feedit/rss/managed-listing/rss-maksuttomat/";
const FRESH_MS = 5 * 60 * 1000;
const MAX_STALE_MS = 24 * 60 * 60 * 1000;
const parser = new XMLParser({
  ignoreAttributes: true,
  processEntities: false,
  parseTagValue: false,
});

export type Audience = "students" | "families";
export type TopicId =
  | "housing"
  | "work"
  | "education"
  | "family"
  | "transport"
  | "safety"
  | "events"
  | "services"
  | "immigration"
  | "economy"
  | "politics"
  | "sport";
export type Locality = "oulu" | "region" | "none";
export type Reason =
  | { type: "topic"; topic: TopicId; points: number; matched: string[] }
  | { type: "locality"; level: Locality; points: number; matched: string[] }
  | { type: "recency"; hours: number; points: number }
  | { type: "kind"; kind: ItemKind; points: number };
export type ItemKind = "news" | "editorial" | "poll" | "syndicated";
export type NewsItem = {
  id: string;
  title: string;
  description: string | null;
  publishedAt: string | null;
  url: string;
  kind: ItemKind;
  feedCategories: string[];
  topics: { id: TopicId; matched: string[] }[];
  locality: { level: Locality; matched: string[] };
  relevance: Record<Audience, { score: number; reasons: Reason[] }>;
};
export type NewsResponse = {
  status: "ok" | "stale";
  feed: { url: string; title: string | null; lastBuildDate: string | null };
  fetchedAt: string;
  servedAt: string;
  method: string;
  assistant: { available: boolean; model: string };
  items: NewsItem[];
};
type Normalized = Omit<NewsItem, "topics" | "locality" | "relevance">;

// Suomenkieliset sanavartalot. Sana täsmää, jos se alkaa vartalolla
// tai (vähintään 5 merkin vartalolla) sisältää sen yhdyssanan osana.
const TOPICS: Record<TopicId, string[]> = {
  housing: [
    "vuokra",
    "asuntomarkkin",
    "asuntokaup",
    "asuntoja",
    "asumi",
    "asumis",
    "opiskelija-asun",
    "asuntola",
    "kerrostalo",
    "asuntotuotan",
  ],
  work: [
    "työntekij",
    "työnantaj",
    "työpaik",
    "työttöm",
    "työllisy",
    "lakko",
    "palkka",
    "palkko",
    "irtisano",
    "rekrytoi",
    "muutosneuvottel",
  ],
  education: [
    "koulu",
    "opiskelij",
    "yliopisto",
    "ammattikorkeakoul",
    "oamk",
    "lukio",
    "opettaj",
    "tutkija",
    "tutkijoi",
    "tutkimu",
    "matematiik",
    "oppilaitok",
  ],
  family: [
    "perhe",
    "lapsi",
    "lapse",
    "lasten",
    "päiväkod",
    "päiväkoti",
    "varhaiskasvatu",
    "neuvola",
    "vanhemp",
    "nuorten",
    "nuoria",
  ],
  transport: [
    "liikente",
    "liikenne",
    "joukkoliikente",
    "bussi",
    "juna",
    "rautatie",
    "lentoase",
    "lento",
    "parkki",
    "pysäköi",
    "kylätie",
    "tieverk",
    "pohjantie",
    "katu",
    "rekan",
    "rekka",
    "moottoritie",
  ],
  safety: [
    "poliisi",
    "ammusk",
    "laukau",
    "tulipalo",
    "palossa",
    "palo",
    "savu",
    "onnettomuu",
    "häirik",
    "rikos",
    "pahoinpite",
    "pelastu",
    "varoitu",
    "tietoturv",
    "haavoittuvuu",
  ],
  events: [
    "tapahtum",
    "festivaal",
    "konsert",
    "näyttely",
    "messut",
    "kilpailut",
    "juhla",
    "valofestivaal",
    "ohjelmaa",
  ],
  services: [
    "kaupungin",
    "verkkopalvelu",
    "palvelu",
    "sosiaaliturv",
    "eläke",
    "eläkke",
    "terveys",
    "terveyde",
    "kela",
    "hyvinvointialue",
    "kirjasto",
    "myymälä",
    "kauppakeskus",
    "päivittäistavara",
  ],
  immigration: [
    "maahanmuut",
    "ulkomaalai",
    "oleskelulu",
    "kotoutu",
    "kansainväli",
    "työperäi",
  ],
  economy: [
    "liikevaihto",
    "liikevoitto",
    "yhtiö",
    "yritys",
    "yrityks",
    "datakeskus",
    "investoin",
    "sähkö",
    "talous",
  ],
  politics: [
    "hallitus",
    "hallituk",
    "eduskunt",
    "välikysymy",
    "ministeri",
    "puolue",
    "oppositio",
    "perussuomalai",
    "pääministeri",
  ],
  sport: [
    "urheilu",
    "yleisurheilu",
    "jääkiekko",
    "liiga",
    "kärpät",
    "valmentaj",
    "em-kilpailu",
  ],
};
const OULU = [
  "oulu",
  "oulun",
  "oulussa",
  "oulusta",
  "ouluun",
  "kiiminki",
  "kiimingi",
  "haukipu",
  "ritaharju",
  "ideapark",
  "pohjantie",
  "toppila",
  "kaakkuri",
  "linnanmaa",
  "hiukkavaara",
];
const REGION = [
  "muhos",
  "kempele",
  "liminga",
  "liminka",
  "ii",
  "iin",
  "raahe",
  "kajaani",
  "nivala",
  "ylivieska",
  "kemi",
  "kemissä",
  "tornio",
  "rovaniemi",
  "pudasjärv",
  "kuusamo",
  "tyrnävä",
  "lumijoe",
  "pohjois-pohjanmaa",
];
// Painot kertovat, kuinka paljon aihe merkitsee kullekin yleisölle. Ne ovat demon oletuksia, eivät mitattua tietoa.
export const WEIGHTS: Record<Audience, Record<TopicId, number>> = {
  students: {
    education: 3,
    housing: 3,
    immigration: 3,
    events: 2.5,
    transport: 2.5,
    work: 2,
    economy: 1,
    services: 1,
    safety: 1,
    politics: 0.5,
    sport: 0.5,
    family: 0,
  },
  families: {
    family: 3.5,
    work: 3,
    immigration: 3,
    housing: 2,
    safety: 2,
    services: 2,
    transport: 1.5,
    economy: 1.5,
    education: 1,
    events: 1,
    politics: 0.5,
    sport: 0.5,
  },
};
const LOCALITY_POINTS: Record<Locality, number> = {
  oulu: 2,
  region: 0.5,
  none: 0,
};
const KIND_POINTS: Record<ItemKind, number> = {
  news: 0,
  editorial: -0.5,
  poll: -1.5,
  syndicated: -0.5,
};

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};
function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) =>
      e[0] === "#"
        ? String.fromCodePoint(
            e[1].toLowerCase() === "x"
              ? parseInt(e.slice(2), 16)
              : Number(e.slice(1)),
          )
        : ENTITIES[e.toLowerCase()],
    )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
const tokens = (text: string) =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}-]+/u)
    .filter(Boolean);
function match(words: string[], stems: string[]) {
  const found = new Set<string>();
  for (const word of words)
    for (const stem of stems)
      if (
        word === stem ||
        word.startsWith(stem) ||
        (stem.length >= 5 && word.includes(stem))
      )
        found.add(word);
  return [...found];
}

export function normalize(xml: string): {
  title: string | null;
  lastBuildDate: string | null;
  items: Normalized[];
} {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true)
    throw new Error("Invalid RSS");
  const channel = parser.parse(xml)?.rss?.channel;
  const raw = channel?.item;
  if (!raw) throw new Error("Missing RSS items");
  const seen = new Set<string>();
  const items = (Array.isArray(raw) ? raw : [raw])
    .slice(0, 60)
    .flatMap((item: Record<string, unknown>): Normalized[] => {
      const title = clean(item.title, 250);
      if (!title || typeof item.link !== "string") return [];
      let url: URL;
      try {
        url = new URL(clean(item.link, 2000));
      } catch {
        return [];
      }
      if (
        url.protocol !== "https:" ||
        !["www.kaleva.fi", "kaleva.fi"].includes(url.hostname)
      )
        return [];
      url.search = "";
      url.hash = "";
      // Vakaa tunniste: Kalevan artikkelinumero guidista tai osoitteesta.
      const guid = clean(item.guid, 500);
      const number =
        guid.match(/\/(\d{5,})$/)?.[1] ||
        url.pathname.match(/\/(\d{5,})\/?$/)?.[1];
      const id = number ? `kaleva-${number}` : `kaleva-${url.pathname}`;
      const key = title.toLowerCase();
      if (seen.has(id) || seen.has(url.href) || seen.has(key)) return [];
      seen.add(id).add(url.href).add(key);
      const description = clean(item.description, 400);
      const date =
        typeof item.pubDate === "string" ? new Date(item.pubDate) : null;
      const categories = (
        Array.isArray(item.category)
          ? item.category
          : item.category
            ? [item.category]
            : []
      )
        .map((c) => clean(c, 60))
        .filter(Boolean);
      return [
        {
          id,
          title,
          // Kuvaus, joka toistaa otsikon, ei tuo lisätietoa.
          description:
            description && description !== title ? description : null,
          publishedAt:
            date && !Number.isNaN(date.valueOf()) ? date.toISOString() : null,
          url: url.href,
          kind: /^pääkirjoitus\b/i.test(description)
            ? "editorial"
            : /^kysely:/i.test(title)
              ? "poll"
              : /^[A-ZÅÄÖ]{2,4}:\s/.test(title)
                ? "syndicated"
                : "news",
          feedCategories: categories,
        },
      ];
    });
  return {
    title: clean(channel.title, 120) || null,
    lastBuildDate: (() => {
      const d =
        typeof channel.lastBuildDate === "string"
          ? new Date(channel.lastBuildDate)
          : null;
      return d && !Number.isNaN(d.valueOf()) ? d.toISOString() : null;
    })(),
    items,
  };
}

export function classify(item: Normalized, now: Date): NewsItem {
  const words = tokens(`${item.title} ${item.description ?? ""}`);
  const topics = (Object.keys(TOPICS) as TopicId[]).flatMap((id) => {
    const matched = match(words, TOPICS[id]);
    return matched.length ? [{ id, matched }] : [];
  });
  const oulu = match(words, OULU);
  const region = words.filter((w) =>
    REGION.some((r) => (r.length <= 3 ? w === r : w.startsWith(r))),
  );
  const locality = oulu.length
    ? { level: "oulu" as const, matched: oulu }
    : region.length
      ? { level: "region" as const, matched: region }
      : { level: "none" as const, matched: [] };
  const hours = item.publishedAt
    ? Math.max(0, (now.valueOf() - Date.parse(item.publishedAt)) / 3.6e6)
    : null;
  const relevance = {} as NewsItem["relevance"];
  for (const audience of ["students", "families"] as Audience[]) {
    const reasons: Reason[] = topics.map((t) => ({
      type: "topic",
      topic: t.id,
      points: WEIGHTS[audience][t.id],
      matched: t.matched,
    }));
    if (locality.level !== "none")
      reasons.push({
        type: "locality",
        level: locality.level,
        points: LOCALITY_POINTS[locality.level],
        matched: locality.matched,
      });
    if (hours !== null)
      reasons.push({
        type: "recency",
        hours: Math.round(hours),
        points: Math.round(Math.max(0, 1 - hours / 72) * 10) / 10,
      });
    if (KIND_POINTS[item.kind])
      reasons.push({
        type: "kind",
        kind: item.kind,
        points: KIND_POINTS[item.kind],
      });
    const score =
      Math.round(reasons.reduce((sum, r) => sum + r.points, 0) * 10) / 10;
    relevance[audience] = {
      score,
      reasons: reasons.filter((r) => r.points !== 0),
    };
  }
  return { ...item, topics, locality, relevance };
}

async function readFeed() {
  const response = await fetch(FEED_URL, {
    signal: AbortSignal.timeout(9000),
    headers: { Accept: "application/rss+xml, text/xml" },
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

// Palvelimen muistivälimuisti: tuore 5 min, viimeisin onnistunut haku näytetään vanhentuneena enintään 24 h.
let cache: { fetchedAt: number; feed: ReturnType<typeof normalize> } | null =
  null;
export function resetNewsCache() {
  cache = null;
}
// Hakee syötteen välimuistin kautta. Palauttaa null, jos tuoretta tai kelvollista vanhaa kopiota ei ole.
async function getFeed(now: number): Promise<"ok" | "stale" | null> {
  if (cache && now - cache.fetchedAt <= FRESH_MS) return "ok";
  try {
    cache = { fetchedAt: now, feed: normalize(await readFeed()) };
    return "ok";
  } catch (error) {
    console.error("Kaleva RSS fetch failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return cache && now - cache.fetchedAt <= MAX_STALE_MS ? "stale" : null;
  }
}
const json = (body: unknown, status = 200, cacheControl = "no-store") =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
    },
  });

export async function GET() {
  const now = Date.now();
  const status = await getFeed(now);
  if (!status || !cache)
    return json({ status: "unavailable", feed: { url: FEED_URL } }, 502);
  const body: NewsResponse = {
    status,
    feed: {
      url: FEED_URL,
      title: cache.feed.title,
      lastBuildDate: cache.feed.lastBuildDate,
    },
    fetchedAt: new Date(cache.fetchedAt).toISOString(),
    servedAt: new Date(now).toISOString(),
    method:
      "rules-v1: Finnish keyword stems in headline and feed description, Oulu/region place names, recency and item type. No AI model.",
    assistant: { available: assistantAvailable(), model: ASSISTANT_MODEL },
    items: cache.feed.items.map((item) => classify(item, new Date(now))),
  };
  return json(
    body,
    200,
    status === "ok"
      ? "public, s-maxage=120, stale-while-revalidate=300"
      : "no-store",
  );
}

// ---------------------------------------------------------------------------
// Toimituksen AI-avustaja (Claude). Kutsutaan vain palvelimella; avain luetaan ympäristömuuttujasta.
// Lähdeaineisto on aina syötteen oma otsikko ja kuvaus palvelimen välimuistista, ei selaimen lähettämä teksti.
export const ASSISTANT_MODEL = "claude-opus-5-5";
export const PROMPT_VERSION = "assist-v1";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_DRAFTS = 200;
const RELEVANCE = ["high", "medium", "low", "unclear"] as const;
export type AssistOutput = {
  headline_en: string;
  description_en: string;
  topics: TopicId[];
  relevance: Record<Audience, (typeof RELEVANCE)[number]>;
  relevance_explanation: string;
  evidence_sufficient: boolean;
  missing_information: string[];
  unsupported_assumptions: string[];
};
export type AssistDraft = {
  itemId: string;
  source: {
    title: string;
    description: string | null;
    url: string;
    publishedAt: string | null;
  };
  output: AssistOutput;
  fidelityWarnings: string[];
  model: string;
  promptVersion: string;
  generatedAt: string;
  usage: { inputTokens: number; outputTokens: number } | null;
};
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "headline_en",
    "description_en",
    "topics",
    "relevance",
    "relevance_explanation",
    "evidence_sufficient",
    "missing_information",
    "unsupported_assumptions",
  ],
  properties: {
    headline_en: { type: "string" },
    description_en: { type: "string" },
    topics: {
      type: "array",
      items: { type: "string", enum: Object.keys(TOPICS) },
    },
    relevance: {
      type: "object",
      additionalProperties: false,
      required: ["students", "families"],
      properties: {
        students: { type: "string", enum: [...RELEVANCE] },
        families: { type: "string", enum: [...RELEVANCE] },
      },
    },
    relevance_explanation: { type: "string" },
    evidence_sufficient: { type: "boolean" },
    missing_information: { type: "array", items: { type: "string" } },
    unsupported_assumptions: { type: "array", items: { type: "string" } },
  },
};
const SYSTEM = `You help a local newsroom in Oulu, Finland, prepare English drafts for international residents. A human editor reviews everything you write before anything is published.

You receive one item from Kaleva's free-news RSS feed: a Finnish headline and, if present, Kaleva's short feed description. That is the only source material. You have not seen the article, and you must not use outside knowledge about the events, people or places.

Return JSON with these fields:
- headline_en: a faithful English translation of the headline. Keep names, numbers, places, quotation marks and attributions (such as a leading "IS:") exactly. Add nothing.
- description_en: a faithful English translation of the description. Use an empty string if there is no description.
- topics: the topics the source text itself is about, from the allowed list. Use an empty list if none apply.
- relevance: for international students in Oulu, and for international professionals and their families in Oulu, how relevant the item is likely to be, judged only from the source text. Use "unclear" when the source text does not show who is affected.
- relevance_explanation: one to three sentences explaining that judgement using only what the source text states, phrased as "The headline reports..." or "The description says...". Do not give advice, predict consequences, or describe what the item means for the reader personally. If the source text is not enough to explain why it matters, say so plainly.
- evidence_sufficient: true only if the headline and description alone state who is affected and what changes; otherwise false.
- missing_information: short questions a reader would need answered that the source text does not answer.
- unsupported_assumptions: claims a writer might be tempted to make about this item that the source text does not support.`;

type AssistParams = Anthropic.Beta.Messages.MessageCreateParamsNonStreaming;
// Testikorvike tarvitsee vain nämä vastauksen kentät.
type AssistReply = {
  stop_reason: string | null;
  content: { type: string; text?: string }[];
  usage?: { input_tokens: number; output_tokens: number } | null;
};
type AssistClient = { create: (params: AssistParams) => Promise<AssistReply> };
let clientOverride: AssistClient | null = null;
let sdkClient: AssistClient | null = null;
// Testit voivat korvata asiakkaan; tuotannossa käytetään virallista SDK:ta.
export function setAssistantClient(client: AssistClient | null) {
  clientOverride = client;
}
export function assistantAvailable() {
  return !!clientOverride || !!process.env.ANTHROPIC_API_KEY;
}
async function assistantClient(): Promise<AssistClient> {
  if (clientOverride) return clientOverride;
  if (!sdkClient) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({ timeout: 45_000, maxRetries: 1 });
    sdkClient = {
      create: (params) => anthropic.beta.messages.create(params),
    };
  }
  return sdkClient;
}

// Kustannusrajat: valmiit luonnokset välimuistissa, samanaikaiset pyynnöt yhdistetään, tuntikohtainen enimmäismäärä.
const drafts = new Map<string, { at: number; draft: AssistDraft }>();
const inFlight = new Map<string, Promise<AssistDraft>>();
let calls: number[] = [];
export function resetAssistant() {
  drafts.clear();
  inFlight.clear();
  calls = [];
}
const maxCallsPerHour = () =>
  Math.max(0, Number(process.env.ASSISTANT_MAX_CALLS_PER_HOUR ?? 20) || 0);

type AssistErrorCode = "refusal" | "truncated" | "invalid_output" | "model_error";
class AssistError extends Error {
  code: AssistErrorCode;
  constructor(code: AssistErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
function validate(value: unknown): AssistOutput {
  const v = value as AssistOutput;
  const strings = (a: unknown) =>
    Array.isArray(a) && a.every((x) => typeof x === "string");
  if (
    !v ||
    typeof v.headline_en !== "string" ||
    !v.headline_en.trim() ||
    typeof v.description_en !== "string" ||
    !Array.isArray(v.topics) ||
    !v.topics.every((t) => t in TOPICS) ||
    !v.relevance ||
    !RELEVANCE.includes(v.relevance.students) ||
    !RELEVANCE.includes(v.relevance.families) ||
    typeof v.relevance_explanation !== "string" ||
    typeof v.evidence_sufficient !== "boolean" ||
    !strings(v.missing_information) ||
    !strings(v.unsupported_assumptions)
  )
    throw new AssistError(
      "invalid_output",
      "Model output did not match the schema",
    );
  const trim = (s: string, n: number) => s.trim().slice(0, n);
  return {
    headline_en: trim(v.headline_en, 300),
    description_en: trim(v.description_en, 600),
    topics: [...new Set(v.topics)],
    relevance: {
      students: v.relevance.students,
      families: v.relevance.families,
    },
    relevance_explanation: trim(v.relevance_explanation, 700),
    evidence_sufficient: v.evidence_sufficient,
    missing_information: v.missing_information
      .slice(0, 6)
      .map((s) => trim(s, 240)),
    unsupported_assumptions: v.unsupported_assumptions
      .slice(0, 6)
      .map((s) => trim(s, 240)),
  };
}
// Deterministiset lähdeuskollisuuden tarkistukset. Varoitukset menevät luonnokseen toimittajan merkintöinä.
export function checkFidelity(
  source: { title: string; description: string | null },
  output: AssistOutput,
): string[] {
  const warnings: string[] = [];
  const sourceText = `${source.title} ${source.description ?? ""}`;
  const numbers = (text: string) =>
    (text.match(/\d+(?:[.,:]\d+)*/g) ?? []).map((n) => n.replace(/[.,:]/g, ""));
  const sourceNumbers = new Set(numbers(sourceText));
  const english = `${output.headline_en} ${output.description_en} ${output.relevance_explanation}`;
  for (const n of new Set(numbers(english)))
    if (!sourceNumbers.has(n))
      warnings.push(
        `The number “${n}” in the English text does not appear in the Finnish source.`,
      );
  if (!source.description && output.description_en)
    warnings.push("The feed has no description, but the model returned one.");
  if (
    source.description &&
    output.description_en.length > source.description.length * 2.5 + 40
  )
    warnings.push(
      "The English description is much longer than the Finnish one; check for added content.",
    );
  const prefix = source.title.match(/^([A-ZÅÄÖ]{2,4}):/)?.[1];
  if (prefix && !output.headline_en.startsWith(`${prefix}:`))
    warnings.push(
      `The source headline is attributed to “${prefix}:”, but the translation drops that attribution.`,
    );
  if (
    /\b(you should|you must|you need to|make sure|we recommend|this means (that )?you)\b/i.test(
      output.relevance_explanation,
    )
  )
    warnings.push(
      "The relevance note contains advice or personal implications, which the source does not support.",
    );
  return warnings;
}

async function generate(item: Normalized): Promise<AssistDraft> {
  const client = await assistantClient();
  const source = { title: item.title, description: item.description };
  let response;
  try {
    response = await client.create({
      model: ASSISTANT_MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: `Finnish headline: ${item.title}\nKaleva feed description: ${item.description ?? "(none)"}`,
        },
      ],
    });
  } catch (error) {
    console.error("Assistant request failed", {
      error: error instanceof Error ? error.name : "Unknown error",
    });
    throw new AssistError("model_error", "The model request failed");
  }
  if (response.stop_reason === "refusal")
    throw new AssistError("refusal", "The model declined this item");
  if (response.stop_reason === "max_tokens")
    throw new AssistError("truncated", "The model output was cut off");
  const text = response.content.find((b) => b.type === "text")?.text;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text ?? "");
  } catch {
    throw new AssistError("invalid_output", "The model did not return JSON");
  }
  const output = validate(parsed);
  return {
    itemId: item.id,
    source: { ...source, url: item.url, publishedAt: item.publishedAt },
    output,
    fidelityWarnings: checkFidelity(source, output),
    model: ASSISTANT_MODEL,
    promptVersion: PROMPT_VERSION,
    generatedAt: new Date().toISOString(),
    usage: response.usage
      ? {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        }
      : null,
  };
}

export async function POST(request: Request) {
  let id: unknown;
  try {
    const text = await request.text();
    if (text.length > 2000) throw new Error("Too large");
    id = JSON.parse(text)?.id;
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  if (typeof id !== "string" || !/^kaleva-[\w/-]{1,200}$/.test(id))
    return json({ error: "bad_request" }, 400);
  if (!assistantAvailable()) return json({ error: "unavailable" }, 503);
  const now = Date.now();
  await getFeed(now);
  const item = cache?.feed.items.find((i) => i.id === id);
  if (!item) return json({ error: "not_in_feed" }, 404);
  const key = `${PROMPT_VERSION}:${item.id}:${item.title}:${item.description ?? ""}`;
  const hit = drafts.get(key);
  if (hit && now - hit.at <= DRAFT_TTL_MS)
    return json({ draft: hit.draft, cached: true });
  let pending = inFlight.get(key);
  if (!pending) {
    calls = calls.filter((t) => now - t < 3.6e6);
    if (calls.length >= maxCallsPerHour())
      return json({ error: "budget" }, 429);
    calls.push(now);
    pending = generate(item).finally(() => inFlight.delete(key));
    inFlight.set(key, pending);
  }
  try {
    const draft = await pending;
    drafts.set(key, { at: now, draft });
    if (drafts.size > MAX_DRAFTS) drafts.delete(drafts.keys().next().value!);
    return json({ draft, cached: false });
  } catch (error) {
    const code = error instanceof AssistError ? error.code : "model_error";
    return json({ error: code }, 502);
  }
}
