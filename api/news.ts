import { XMLParser, XMLValidator } from "fast-xml-parser";
import type Anthropic from "@anthropic-ai/sdk";
import { createHash, timingSafeEqual } from "node:crypto";

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
export type Locality =
  "oulu" | "region" | "elsewhere" | "national" | "international" | "uncertain";
// Osuma vain syötekuvauksessa tai pelkkä maininta painaa vähemmän kuin otsikon aihe.
export type MatchContext = "headline" | "summary-only" | "mention-only";
export type Reason =
  | {
      type: "topic";
      topic: TopicId;
      points: number;
      matched: string[];
      context: MatchContext;
    }
  | {
      type: "locality";
      level: Locality;
      points: number;
      matched: string[];
      context: MatchContext;
    }
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
  // "uncertain": otsikko ja kuvaus eivät riitä luotettavaan luokitteluun.
  confidence: "clear" | "uncertain";
  relevance: Record<Audience, { score: number; reasons: Reason[] }>;
};
export type NewsResponse = {
  status: "ok" | "stale";
  feed: { url: string; title: string | null; lastBuildDate: string | null };
  fetchedAt: string;
  servedAt: string;
  method: string;
  assistant: {
    available: boolean;
    model: string;
    reason: "no_api_key" | "no_access_code" | null;
  };
  items: (NewsItem & { styleReferences: StyleMatch[] })[];
  styleGuide: {
    archiveUrl: string;
    caveat: string;
    houseStyle: HouseRule[];
    references: Pick<
      StyleRef,
      "id" | "title" | "url" | "publishedAt" | "topics"
    >[];
  };
};
type Normalized = Omit<
  NewsItem,
  "topics" | "locality" | "confidence" | "relevance"
>;

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
    "mestaruuskilpailu",
  ],
};
// Oulun kaupunki ja sen kaupunginosat (myös vuoden 2013 kuntaliitoksen alueet).
const OULU = [
  "oulu",
  "oulun",
  "oulussa",
  "oulusta",
  "ouluun",
  "kiiminki",
  "kiimingi",
  "haukipu",
  "yli-ii",
  "ritaharju",
  "ideapark",
  "pohjantie",
  "toppila",
  "kaakkuri",
  "linnanmaa",
  "hiukkavaara",
  "raksila",
  "tuira",
  // Oulun Kärpät.
  "kärpät",
  "kärppi",
];
// Oulun seutu: naapurikunnat, joista moni käy Oulussa töissä tai koulussa.
// Lyhyet nimet täsmäävät vain kokonaisina sanoina ("ii" ei osu muihin sanoihin).
const REGION = [
  "muhos",
  "muhoks",
  "kempele",
  "liminga",
  "liminka",
  "tyrnävä",
  "lumijo",
  "utajärv",
  "pohjois-pohjanmaa",
];
const REGION_EXACT = ["ii", "iin", "iissä", "iistä", "iihin"];
// Muut paikkakunnat: juttu koskee muuta kuin Oulun aluetta.
const ELSEWHERE = [
  "raahe",
  "kajaan",
  "nivala",
  "ylivieska",
  "tornio",
  "rovanie",
  "pudasjärv",
  "kuusamo",
  "kalajo",
  "haapaje",
  "helsin",
  "tampere",
  "turku",
  "turun",
  "turussa",
  "espoo",
  "vantaa",
  "vantaal",
  "jyväskyl",
  "kuopio",
  "joensuu",
  "vaasa",
  "seinäjo",
  "lappeenran",
  "hämeenlin",
];
// "kemi" alkuosana osuisi sanaan "kemikaali", joten vain taivutusmuodot.
// Muiden kaupunkien urheiluseurat kertovat paikasta, vaikka kaupunkia ei mainita.
const ELSEWHERE_EXACT = [
  "kemi",
  "kemin",
  "kemissä",
  "kemistä",
  "kemiin",
  "hifk",
  "hifk:n",
  "tappara",
  "tapparan",
  "jokerit",
  "ilves",
  "lukko",
  "ässät",
  "jyp",
  "kalpa",
  "saipa",
  "hpk",
];
// Ulkomaat ja kansainväliset toimijat.
const INTERNATIONAL = [
  "ukrain",
  "venäj",
  "kiova",
  "kiovan",
  "moskova",
  "yhdysval",
  "washington",
  "kiina",
  "kiinan",
  "euroopan unioni",
  "eu-maiden",
  "nato",
  "zelensk",
  "putin",
  "trump",
  "maailmaa",
  "maailmanlaajui",
  "ulkomail",
];
// Valtakunnalliset toimijat: koskee koko maata, ei erityisesti Oulua.
const NATIONAL = [
  "hallitus",
  "hallituk",
  "eduskun",
  "ministeri",
  "pääministeri",
  "puolue",
  "perussuomalai",
  "kokoomu",
  "oppositio",
  "välikysym",
  "kela",
  "valtakunnalli",
];
// Poliisin maininta ei yksin tee jutusta turvallisuusuutista (esim. tutkintapyyntö).
const SAFETY_INCIDENT = [
  "ammusk",
  "laukau",
  "tulipalo",
  "palossa",
  "savu",
  "onnettomuu",
  "häirik",
  "rikos",
  "pahoinpite",
  "ryöst",
  "loukkaant",
  "pelastu",
  "varoitu",
  "tietoturv",
  "haavoittuvuu",
];
// Sanat, jotka näyttävät aiheen vartalolta mutta tarkoittavat muuta.
const NOT_TOPIC = [
  "sähköpost",
  "pilvipalvel",
  "kaupunginos",
  "lentopallo",
  "katum",
  "katua",
  "katuu",
  "katui",
  "katuvat",
];
const placeMatch = (words: string[], stems: string[], exact: string[]) =>
  words.filter((w) => exact.includes(w) || stems.some((s) => w.startsWith(s)));
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
// Paikallisuus painaa: Oulun juttu nousee, muualla tapahtuva tai paikaton laskee.
const LOCALITY_POINTS: Record<Locality, number> = {
  oulu: 2,
  region: 1,
  uncertain: -0.5,
  national: -1,
  elsewhere: -2,
  international: -2,
};
// Pelkästä syötekuvauksesta tai maininnasta löytynyt osuma saa puolet pisteistä.
const CONTEXT_FACTOR: Record<MatchContext, number> = {
  headline: 1,
  "summary-only": 0.5,
  "mention-only": 0.5,
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
  const titleWords = tokens(item.title);
  const words = tokens(`${item.title} ${item.description ?? ""}`);
  const topicWords = words.filter(
    (w) => !NOT_TOPIC.some((x) => w.startsWith(x)),
  );
  const inTitle = (found: string[]) =>
    found.some((w) => titleWords.includes(w));
  const topics = (Object.keys(TOPICS) as TopicId[]).flatMap((id) => {
    const matched = match(topicWords, TOPICS[id]);
    if (!matched.length) return [];
    const context: MatchContext =
      id === "safety" &&
      !matched.some((w) => SAFETY_INCIDENT.some((x) => w.startsWith(x)))
        ? "mention-only"
        : inTitle(matched)
          ? "headline"
          : "summary-only";
    return [{ id, matched, context }];
  });
  // Paikka päätellään tärkeysjärjestyksessä: Oulu voittaa, vaikka muukin paikka mainitaan.
  const places = (ws: string[]): [Locality, string[]][] => {
    const text = ws.join(" ");
    return [
      ["oulu", match(ws, OULU)],
      ["region", placeMatch(ws, REGION, REGION_EXACT)],
      ["elsewhere", placeMatch(ws, ELSEWHERE, ELSEWHERE_EXACT)],
      [
        "international",
        INTERNATIONAL.flatMap((x) =>
          x.includes(" ")
            ? text.includes(x)
              ? [x]
              : []
            : ws.filter((w) => w.startsWith(x)),
        ),
      ],
      ["national", placeMatch(ws, NATIONAL, [])],
    ];
  };
  const first = (c: [Locality, string[]][]) => c.find(([, m]) => m.length);
  // Otsikossa nimetty muu paikkakunta tai ulkomaa voittaa kuvauksen sivumaininnan Oulusta.
  const headlinePlace = first(places(titleWords));
  const [level, matched] =
    headlinePlace &&
    (headlinePlace[0] === "elsewhere" || headlinePlace[0] === "international")
      ? headlinePlace
      : (first(places(words)) ?? ["uncertain", []]);
  const locality = { level, matched: [...new Set(matched)] };
  const localityContext: MatchContext =
    (level === "oulu" || level === "region") && !inTitle(matched)
      ? "summary-only"
      : "headline";
  const confidence: NewsItem["confidence"] =
    level === "uncertain" || !topics.some((t) => t.context === "headline")
      ? "uncertain"
      : "clear";
  const hours = item.publishedAt
    ? Math.max(0, (now.valueOf() - Date.parse(item.publishedAt)) / 3.6e6)
    : null;
  const relevance = {} as NewsItem["relevance"];
  for (const audience of ["students", "families"] as Audience[]) {
    const reasons: Reason[] = topics.map((t) => ({
      type: "topic",
      topic: t.id,
      points: WEIGHTS[audience][t.id] * CONTEXT_FACTOR[t.context],
      matched: t.matched,
      context: t.context,
    }));
    // Myönteiset paikkapisteet puolittuvat, jos paikka on vain kuvauksessa.
    const base = LOCALITY_POINTS[locality.level];
    reasons.push({
      type: "locality",
      level: locality.level,
      points: base > 0 ? base * CONTEXT_FACTOR[localityContext] : base,
      matched: locality.matched,
      context: localityContext,
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
  return {
    ...item,
    topics: topics.map(({ id, matched }) => ({ id, matched })),
    locality,
    confidence,
    relevance,
  };
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
    assistant: {
      available: assistantAvailable(),
      model: ASSISTANT_MODEL,
      reason: assistantReason(),
    },
    items: cache.feed.items.map((item) => {
      const classified = classify(item, new Date(now));
      return {
        ...classified,
        styleReferences: selectStyleReferences(
          item,
          classified.topics.map((t) => t.id),
        ),
      };
    }),
    styleGuide: {
      archiveUrl: STYLE_ARCHIVE_URL,
      caveat: STYLE_CAVEAT,
      houseStyle: HOUSE_STYLE,
      references: STYLE_REFERENCES.map(
        ({ id, title, url, publishedAt, topics }) => ({
          id,
          title,
          url,
          publishedAt,
          topics,
        }),
      ),
    },
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
// Kalevan englanninkielinen arkisto tyyliviitteenä (2012). Tarkistettu 24.10.2026 osoitteesta
// https://www.kaleva.fi/aihe/news-in-english/16976. Artikkelitekstiä ei tallenneta eikä lähetetä mallille:
// mallille menevät vain tiimin omin sanoin kirjoittamat tyylihavainnot ja termiparit.
export const STYLE_ARCHIVE_URL =
  "https://www.kaleva.fi/aihe/news-in-english/16976";
export const STYLE_CAVEAT =
  "Historical reference: Kaleva's English-language articles from May–June 2012. Used only for phrasing, headline form and terminology, never as facts about current stories. They may not reflect Kaleva's current editorial standards, and institution names may have changed since 2012.";
export type HouseRule = { id: string; rule: string; refs: string[] };
// Tiimin havainnot arkistosta; ei lainauksia.
export const HOUSE_STYLE: HouseRule[] = [
  {
    id: "H1",
    rule: "Headlines in Title Case and compact headline grammar: drop articles and auxiliary verbs, present tense for news, 'to' + verb for planned events.",
    refs: ["R4", "R5", "R8", "R10"],
  },
  {
    id: "H2",
    rule: "When the Finnish source names a place, keep it prominent in the headline. Never add a place the source does not name.",
    refs: ["R4", "R8", "R9"],
  },
  {
    id: "H3",
    rule: "Keep Finnish proper names (people, districts, streets, companies, campaigns) in Finnish; add an English generic word or a short gloss in brackets where it helps readers abroad.",
    refs: ["R1", "R4", "R6"],
  },
  {
    id: "H4",
    rule: "When the source gives a person's role or an organisation's type, keep it next to the name. Never add descriptions the source does not give.",
    refs: ["R2", "R5", "R7", "R10"],
  },
  {
    id: "H5",
    rule: "Keep the source's attributions ('according to', 'says', a leading outlet prefix). Never add an attribution the source does not contain.",
    refs: ["R7", "R8"],
  },
  {
    id: "H6",
    rule: "Money as a figure followed by 'euros', thousands separated by a space, clock times as '11 pm'.",
    refs: ["R2", "R5", "R7"],
  },
];
export type StyleRef = {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  topics: TopicId[];
  notes: string[];
  // Termiparit: suomenkieliset vartalot → arkistossa käytetty englanninkielinen termi.
  terms: { fi: string[]; label: string; en: string; note?: string }[];
  // Viiteartikkelin omat nimet ja luvut, jotka eivät saa päätyä uuteen juttuun.
  entities: string[];
};
export const STYLE_REFERENCES: StyleRef[] = [
  {
    id: "R1",
    title: "Oulu Luring New Residents to City",
    url: "https://www.kaleva.fi/oulu-luring-new-residents-to-city/1661179",
    publishedAt: "2012-05-11",
    topics: ["work", "housing", "education", "immigration"],
    notes: [
      "Finnish campaign and organisation names are kept, with an English gloss in brackets on first mention.",
      "Domestic media and institutions are explained with a short appositive for readers abroad.",
    ],
    terms: [
      { fi: ["kansainväli"], label: "kansainvälinen", en: "international" },
    ],
    entities: [
      "Pikkujämsä",
      "BusinessOulu",
      "Töölö",
      "Canary",
      "1.3 million",
      "250 000",
    ],
  },
  {
    id: "R2",
    title: "Past Gives Way to New Large School Complex",
    url: "https://www.kaleva.fi/past-gives-way-to-new-large-school-complex/1645730",
    publishedAt: "2012-06-01",
    topics: ["education", "family", "services"],
    notes: [
      "A named source is introduced with the job title before the name.",
      "Costs and timelines are stated plainly (a figure in euros, 'by mid-June').",
    ],
    terms: [
      {
        fi: ["kaupunginvaltuust"],
        label: "kaupunginvaltuusto",
        en: "City Council (e.g. Oulu City Council)",
      },
      {
        fi: ["yhtenäiskoulu"],
        label: "yhtenäiskoulu",
        en: "comprehensive school",
      },
      {
        fi: ["päiväkod", "päiväkoti"],
        label: "päiväkoti",
        en: "kindergarten (2012 usage)",
        note: "The City of Oulu's current English pages use 'early childhood education and care (ECEC) centre' (eVaka notice, 14 Oct 2026); prefer the current official term.",
      },
    ],
    entities: ["Kastelli", "Karjasilta", "Lemminkäinen", "Simi", "43 million"],
  },
  {
    id: "R3",
    title: "Tablets Increasingly Popular Teaching Tools",
    url: "https://www.kaleva.fi/tablets-increasingly-popular-teaching-tools/1650923",
    publishedAt: "2012-05-25",
    topics: ["education", "family"],
    notes: [
      "A new term is defined once in plain words.",
      "School years are expressed as grades ('eighth grader').",
    ],
    terms: [
      { fi: ["koulu"], label: "koulu", en: "school" },
      { fi: ["opettaj"], label: "opettaja", en: "teacher" },
    ],
    entities: [
      "Walsh",
      "Johnson",
      "Paasovaara",
      "Kuismin",
      "Posti",
      "60 tablet",
    ],
  },
  {
    id: "R4",
    title: "Bridge Repairs Expected to Obstruct Traffic in Oulu",
    url: "https://www.kaleva.fi/bridge-repairs-expected-to-obstruct-traffic-in-oul/1661132",
    publishedAt: "2012-05-11",
    topics: ["transport", "services"],
    notes: [
      "The headline states the practical consequence and the place.",
      "Road numbers use the English form; district names stay in Finnish.",
    ],
    terms: [
      {
        fi: ["valtatie", "valtatiellä"],
        label: "valtatie",
        en: "Highway (e.g. valtatie 20 → Highway 20)",
      },
      { fi: ["ylikulkusil"], label: "ylikulkusilta", en: "overpass" },
      { fi: ["alikulku"], label: "alikulku", en: "underpass" },
      {
        fi: ["kevyen"],
        label: "kevyen liikenteen väylä",
        en: "light traffic route",
      },
      { fi: ["liikente", "liikenne"], label: "liikenne", en: "traffic" },
    ],
    entities: [
      "Laanila",
      "Kaukovainio",
      "Tervahovintie",
      "Siikaluoma",
      "Möljänsilta",
      "Hupisaaret",
      "Toppilansalmi",
    ],
  },
  {
    id: "R5",
    title: "May to See City’s Streets Swept",
    url: "https://www.kaleva.fi/may-to-see-citys-streets-swept/1661136",
    publishedAt: "2012-05-11",
    topics: ["services", "transport"],
    notes: [
      "Planned events are headlined with 'to' + verb.",
      "Quantities use a space as the thousands separator.",
    ],
    terms: [
      { fi: ["katupöly"], label: "katupöly", en: "street dust" },
      {
        fi: ["lumenkaatopaik"],
        label: "lumenkaatopaikka",
        en: "snow dumping site",
      },
    ],
    entities: ["Rajakangas", "4 000 tons"],
  },
  {
    id: "R6",
    title: "Renovation of Kiiminki Downtown Finished by Autumn",
    url: "https://www.kaleva.fi/renovation-of-kiiminki-downtown-finished-by-autumn/1645736",
    publishedAt: "2012-06-01",
    topics: ["services", "transport", "housing"],
    notes: [
      "Street names keep the Finnish name plus an English generic word ('… Road').",
      "Disruption to residents is described concretely (detours, schedule).",
    ],
    terms: [
      { fi: ["kiertotie"], label: "kiertotie", en: "detour" },
      {
        fi: ["keskustassa", "keskustaan", "keskustasta"],
        label: "keskusta (place)",
        en: "town centre / downtown",
      },
    ],
    entities: ["Saarinen", "Ramboll", "Opintie"],
  },
  {
    id: "R7",
    title: "Assaults Concentrated Around City Centrum and Market Square Area",
    url: "https://www.kaleva.fi/assaults-concentrated-around-city-centrum-and-mark/1661143",
    publishedAt: "2012-05-11",
    topics: ["safety"],
    notes: [
      "Police figures are attributed to a named officer with an official title.",
      "Times of day are written as '11 pm', '2 am'.",
    ],
    terms: [
      {
        fi: ["poliisilaito"],
        label: "poliisilaitos",
        en: "Police Department (e.g. Oulu Police Department)",
      },
      { fi: ["pahoinpitel"], label: "pahoinpitely", en: "assault" },
      { fi: ["kauppator"], label: "kauppatori", en: "Market Square" },
      {
        fi: ["kaupunginteatt"],
        label: "kaupunginteatteri",
        en: "City Theater",
      },
    ],
    entities: [
      "Rissanen",
      "Autoranta",
      "Hallituskatu",
      "Kaarlenväylä",
      "Saaristonkatu",
    ],
  },
  {
    id: "R8",
    title: "Oulu Sees 10% of All Robberies in Country",
    url: "https://www.kaleva.fi/oulu-sees-10-of-all-robberies-in-country/1645726",
    publishedAt: "2012-06-01",
    topics: ["safety"],
    notes: [
      "Local figures are compared with the national figure for context.",
      "Percentages use digits and % in the headline.",
    ],
    terms: [
      { fi: ["ryöst"], label: "ryöstö", en: "robbery" },
      { fi: ["törke"], label: "törkeä pahoinpitely", en: "aggravated assault" },
      { fi: ["poliisi"], label: "poliisi", en: "police" },
    ],
    entities: ["52 robberies", "530"],
  },
  {
    id: "R9",
    title: "Tough Competition for Motor Vehicle Inspection in Oulu Region",
    url: "https://www.kaleva.fi/tough-competition-for-motor-vehicle-inspection-in/1645734",
    publishedAt: "2012-06-01",
    topics: ["work", "economy", "transport"],
    notes: [
      "Business stories lead with the situation in the region, then a named entrepreneur.",
    ],
    terms: [
      {
        fi: ["katsastu"],
        label: "katsastus",
        en: "(motor) vehicle inspection",
      },
      { fi: ["yrittäj"], label: "yrittäjä", en: "entrepreneur" },
      { fi: ["työntekij"], label: "työntekijä", en: "employee" },
    ],
    entities: ["Laukka", "Hiironen", "Haapalehto", "160 000"],
  },
  {
    id: "R10",
    title: "Ilmarinen Purchases Pekurinkulma Building from Dutch Redevco",
    url: "https://www.kaleva.fi/ilmarinen-purchases-pekurinkulma-building-from-dut/1655962",
    publishedAt: "2012-05-18",
    topics: ["economy", "housing"],
    notes: [
      "Companies are introduced with a short descriptor ('the pension insurance firm …').",
    ],
    terms: [
      {
        fi: ["eläkevakuutu"],
        label: "eläkevakuutusyhtiö",
        en: "pension insurance company",
      },
      { fi: ["kiinteistö"], label: "kiinteistö", en: "property / real estate" },
      { fi: ["yhtiö"], label: "yhtiö", en: "company" },
    ],
    entities: [
      "Ilmarinen",
      "Redevco",
      "Pekurinkulma",
      "Aimonen",
      "Kirkkokatu 12",
    ],
  },
];
export type StyleMatch = {
  id: string;
  score: number;
  topics: TopicId[];
  terms: { label: string; en: string; note?: string }[];
};
// Kevyt haku: aiheiden päällekkäisyys (2 p./aihe) + lähdetekstistä löytyvät termiparit (3 p./termi). Enintään 3 viitettä.
export function selectStyleReferences(
  item: { title: string; description: string | null },
  topics: TopicId[],
  max = 3,
): StyleMatch[] {
  const words = tokens(`${item.title} ${item.description ?? ""}`);
  return STYLE_REFERENCES.map((ref) => {
    const sharedTopics = ref.topics.filter((t) => topics.includes(t));
    const terms = ref.terms
      .filter((term) => match(words, term.fi).length > 0)
      .map(({ label, en, note }) => ({ label, en, ...(note ? { note } : {}) }));
    return {
      id: ref.id,
      score: sharedTopics.length * 2 + terms.length * 3,
      topics: sharedTopics,
      terms,
    };
  })
    .filter((m) => m.score >= 3)
    .sort(
      (a, b) =>
        b.score - a.score || a.id.localeCompare(b.id, "en", { numeric: true }),
    )
    .slice(0, max);
}
// Mallille menevä tyyliosio: vain omat havainnot ja termiparit, ei Kalevan otsikoita tai tekstiä.
export function styleBlock(matches: StyleMatch[]): string {
  if (!matches.length) return "";
  const refs = matches.map((m) => STYLE_REFERENCES.find((r) => r.id === m.id)!);
  const terms = new Map<string, string>();
  for (const m of matches)
    for (const t of m.terms)
      terms.set(t.label, `${t.label} → ${t.en}${t.note ? ` (${t.note})` : ""}`);
  return [
    "STYLE GUIDANCE (from Kaleva's 2012 English-language archive, summarised by the newsroom; style only, not facts about this story):",
    ...HOUSE_STYLE.map((h) => `- ${h.id}: ${h.rule}`),
    ...refs.map(
      (r) => `- ${r.id} (${r.publishedAt.slice(0, 4)}): ${r.notes.join(" ")}`,
    ),
    ...(terms.size
      ? [
          "Terminology seen in those articles (use only if it fits this source):",
          ...[...terms.values()].map((t) => `- ${t}`),
        ]
      : []),
    "Never add a place, person, role, figure or event that the Finnish source does not contain.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Toimituksen AI-avustaja (Claude). Kutsutaan vain palvelimella; avain luetaan ympäristömuuttujasta.
// Lähdeaineisto on aina syötteen oma otsikko ja kuvaus palvelimen välimuistista, ei selaimen lähettämä teksti.
export const ASSISTANT_MODEL = "claude-opus-5-5";
export const PROMPT_VERSION = "assist-v2-style";
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
  style_references_used: string[];
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
  // "style-grounded": tyyliviitteet annettiin mallille; "standard": ei osuvaa viitettä.
  mode: "style-grounded" | "standard";
  styleReferences: (StyleMatch & {
    title: string;
    url: string;
    publishedAt: string;
  })[];
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
    "style_references_used",
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
    style_references_used: { type: "array", items: { type: "string" } },
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
- unsupported_assumptions: claims a writer might be tempted to make about this item that the source text does not support.
- style_references_used: the IDs (such as "R4") of the style guidance entries you actually followed. Use an empty list if no style guidance was given or none applied.

The message may contain STYLE GUIDANCE summarised from Kaleva's English-language articles from 2012. Use it only for headline form, phrasing and terminology. It is not about this story: never take names, places, numbers, events or claims from it. If a listed term does not fit the Finnish source, ignore it. The Finnish source is the only factual source.`;

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
// Avustaja on käytössä vain, kun sekä API-avain että toimituksen pääsykoodi on määritetty (fail closed).
const MIN_CODE_LENGTH = 24;
const accessCode = () => process.env.NEWSROOM_ACCESS_CODE ?? "";
function assistantReason(): "no_api_key" | "no_access_code" | null {
  if (!clientOverride && !process.env.ANTHROPIC_API_KEY) return "no_api_key";
  if (accessCode().length < MIN_CODE_LENGTH) return "no_access_code";
  return null;
}
export function assistantAvailable() {
  return assistantReason() === null;
}
// Vakioaikainen vertailu tiivisteillä, jotta pituus tai sisältö ei vuoda ajoituksesta.
function authorized(request: Request) {
  const given =
    request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1] ?? "";
  const digest = (v: string) => createHash("sha256").update(v).digest();
  return (
    given.length > 0 && timingSafeEqual(digest(given), digest(accessCode()))
  );
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
let failures: number[] = [];
export function resetAssistant() {
  drafts.clear();
  inFlight.clear();
  calls = [];
  failures = [];
}
const limit = (name: string, fallback: number) => {
  const v = Number(process.env[name] ?? fallback);
  return Number.isFinite(v) && v >= 0 ? v : fallback;
};
// Oletusrajat yhtä palvelininstanssia kohti. Kova kokonaisraja asetetaan Anthropic Consolen kulurajalla.
const maxCallsPerHour = () => limit("ASSISTANT_MAX_CALLS_PER_HOUR", 20);
const maxCallsPerDay = () => limit("ASSISTANT_MAX_CALLS_PER_DAY", 60);
const MAX_CONCURRENT = 3;
const MAX_FAILURES = 10;
const FAILURE_WINDOW_MS = 10 * 60 * 1000;

type AssistErrorCode =
  "refusal" | "truncated" | "invalid_output" | "model_error";
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
    !strings(v.unsupported_assumptions) ||
    !strings(v.style_references_used)
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
    style_references_used: [...new Set(v.style_references_used)].slice(0, 5),
  };
}
// Deterministiset lähdeuskollisuuden tarkistukset. Varoitukset menevät luonnokseen toimittajan merkintöinä.
export function checkFidelity(
  source: { title: string; description: string | null },
  output: AssistOutput,
  styleRefIds: string[] = [],
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
  // Tyyliviitteen omat nimet tai luvut eivät saa siirtyä uuteen juttuun faktoina.
  const lowerSource = sourceText.toLowerCase();
  const lowerEnglish = english.toLowerCase();
  for (const ref of STYLE_REFERENCES)
    for (const entity of ref.entities)
      if (
        lowerEnglish.includes(entity.toLowerCase()) &&
        !lowerSource.includes(entity.toLowerCase())
      )
        warnings.push(
          `“${entity}” comes from the 2012 style reference ${ref.id}, not from this Finnish source.`,
        );
  const unknownRefs = output.style_references_used.filter(
    (id) => !styleRefIds.includes(id) && !HOUSE_STYLE.some((h) => h.id === id),
  );
  if (unknownRefs.length)
    warnings.push(
      `The model cited style references that were not provided: ${unknownRefs.join(", ")}.`,
    );
  return warnings;
}

async function generate(item: Normalized): Promise<AssistDraft> {
  const client = await assistantClient();
  const source = { title: item.title, description: item.description };
  const matches = selectStyleReferences(
    source,
    classify(item, new Date()).topics.map((t) => t.id),
  );
  const guidance = styleBlock(matches);
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
          content: `Finnish headline: ${item.title}\nKaleva feed description: ${item.description ?? "(none)"}${guidance ? `\n\n${guidance}` : ""}`,
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
    fidelityWarnings: checkFidelity(
      source,
      output,
      matches.map((m) => m.id),
    ),
    model: ASSISTANT_MODEL,
    promptVersion: PROMPT_VERSION,
    generatedAt: new Date().toISOString(),
    usage: response.usage
      ? {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        }
      : null,
    mode: matches.length ? "style-grounded" : "standard",
    styleReferences: matches.map((m) => {
      const ref = STYLE_REFERENCES.find((r) => r.id === m.id)!;
      return {
        ...m,
        title: ref.title,
        url: ref.url,
        publishedAt: ref.publishedAt,
      };
    }),
  };
}

export async function POST(request: Request) {
  if (!assistantAvailable()) return json({ error: "unavailable" }, 503);
  const now = Date.now();
  failures = failures.filter((t) => now - t < FAILURE_WINDOW_MS);
  if (failures.length >= MAX_FAILURES) return json({ error: "locked" }, 429);
  if (!authorized(request)) {
    failures.push(now);
    return json({ error: "unauthorized" }, 401);
  }
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
  await getFeed(now);
  const item = cache?.feed.items.find((i) => i.id === id);
  if (!item) return json({ error: "not_in_feed" }, 404);
  const key = `${PROMPT_VERSION}:${item.id}:${item.title}:${item.description ?? ""}`;
  const hit = drafts.get(key);
  if (hit && now - hit.at <= DRAFT_TTL_MS)
    return json({ draft: hit.draft, cached: true });
  let pending = inFlight.get(key);
  if (!pending) {
    calls = calls.filter((t) => now - t < 24 * 3.6e6);
    if (
      calls.filter((t) => now - t < 3.6e6).length >= maxCallsPerHour() ||
      calls.length >= maxCallsPerDay()
    )
      return json({ error: "budget" }, 429);
    if (inFlight.size >= MAX_CONCURRENT) return json({ error: "busy" }, 429);
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
