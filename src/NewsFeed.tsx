import { useEffect, useRef, useState } from "react";
import type {
  Audience,
  ItemKind,
  NewsItem,
  NewsResponse,
  Reason,
  MatchContext,
  TopicId,
} from "../api/news.ts";
import type { Group, Lang, SourceLead } from "./data";

const CACHE_KEY = "kaleva-local-news-cache-v1";
const LIMIT = 6;
const MIN_SCORE = 3;
export const topicNames: Record<TopicId, { en: string; fi: string }> = {
  housing: { en: "Housing", fi: "Asuminen" },
  work: { en: "Work", fi: "Työ" },
  education: { en: "Education", fi: "Koulutus" },
  family: { en: "Family", fi: "Perhe" },
  transport: { en: "Transport", fi: "Liikenne" },
  safety: { en: "Safety", fi: "Turvallisuus" },
  events: { en: "Events", fi: "Tapahtumat" },
  services: { en: "Services", fi: "Palvelut" },
  immigration: { en: "Immigration", fi: "Maahanmuutto" },
  economy: { en: "Economy", fi: "Talous" },
  politics: { en: "Politics", fi: "Politiikka" },
  sport: { en: "Sport", fi: "Urheilu" },
};
const kindNames: Record<ItemKind, { en: string; fi: string } | null> = {
  news: null,
  editorial: { en: "Editorial · opinion", fi: "Pääkirjoitus · mielipide" },
  poll: { en: "Reader poll", fi: "Lukijakysely" },
  syndicated: {
    en: "Credited to another outlet",
    fi: "Toisen median tietoihin perustuva",
  },
};
function readCache(): NewsResponse | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && Array.isArray(data.items) && data.fetchedAt ? data : null;
  } catch {
    return null;
  }
}

export default function NewsFeed({
  lang,
  group,
  onGroup,
  onQueue,
  onOpenNewsroom,
  queuedUrls,
  explained,
  onRead,
}: {
  lang: Lang;
  group: Group;
  onGroup: (g: Group) => void;
  onQueue: (source: SourceLead) => void;
  onOpenNewsroom: () => void;
  queuedUrls: string[];
  // Kalevan juttuosoite → julkaistu, ihmisen hyväksymä selitys.
  explained: Record<string, string>;
  onRead: (storyId: string) => void;
}) {
  const [data, setData] = useState<NewsResponse | null>(readCache);
  // "saved" = näytetään selaimeen tallennettu kopio, koska tuore haku epäonnistui.
  const [state, setState] = useState<"loading" | "ok" | "error" | "saved">(
    "loading",
  );
  const [showAll, setShowAll] = useState(false);
  const pending = useRef<AbortController | null>(null);
  const t = (en: string, fi: string) => (lang === "en" ? en : fi);
  const locale = lang === "en" ? "en-GB" : "fi-FI";
  async function load() {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setState("loading");
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("/api/news", { signal: controller.signal });
      if (!response.ok) throw new Error("Unavailable");
      const result: NewsResponse = await response.json();
      if (!Array.isArray(result.items) || !result.fetchedAt)
        throw new Error("Invalid feed");
      setData(result);
      setState("ok");
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      } catch {
        /* Välimuisti on vain mukavuus; syöte toimii ilman sitä. */
      }
    } catch {
      if (pending.current === controller)
        setState(readCache() ? "saved" : "error");
    } finally {
      clearTimeout(timeout);
      if (pending.current === controller) pending.current = null;
    }
  }
  useEffect(() => {
    load();
    return () => {
      pending.current?.abort();
      pending.current = null;
    };
  }, []);
  useEffect(() => setShowAll(false), [group]);

  const audience: Audience | null =
    group === "students" ? "students" : group === "working" ? "families" : null;
  const items = data?.items ?? [];
  const ranked = audience
    ? items
        .filter((item) => item.relevance[audience].score >= MIN_SCORE)
        .sort(
          (a, b) =>
            b.relevance[audience].score - a.relevance[audience].score ||
            (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
        )
    : [...items].sort((a, b) =>
        (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
      );
  const visible = showAll ? ranked : ranked.slice(0, LIMIT);
  const time = (iso: string) =>
    new Date(iso).toLocaleString(locale, {
      timeZone: "Europe/Helsinki",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  const ago = (iso: string) => {
    const hours = Math.max(0, (Date.now() - Date.parse(iso)) / 3.6e6);
    return hours < 1
      ? t("less than an hour ago", "alle tunti sitten")
      : hours < 48
        ? t(`${Math.floor(hours)} h ago`, `${Math.floor(hours)} t sitten`)
        : t(
            `${Math.floor(hours / 24)} days ago`,
            `${Math.floor(hours / 24)} pv sitten`,
          );
  };
  const points = (n: number) => `${n > 0 ? "+" : "−"}${Math.abs(n)}`;
  const reasonText = (r: Reason) => {
    const words = (m: string[]) =>
      m
        .slice(0, 3)
        .map((w) => `“${w}”`)
        .join(", ");
    const where = (context: MatchContext) =>
      context === "summary-only"
        ? t(" · feed summary only", " · vain syötekuvauksessa")
        : context === "mention-only"
          ? t(
              " · police mentioned, no incident word",
              " · poliisi mainitaan, ei tapahtumasanaa",
            )
          : "";
    if (r.type === "topic")
      return `${topicNames[r.topic][lang]} ${points(r.points)} · ${t("matched", "osuma")} ${words(r.matched)}${where(r.context)}`;
    if (r.type === "locality")
      return r.level === "uncertain"
        ? `${t("Location not stated in headline or summary", "Paikkaa ei mainita otsikossa eikä kuvauksessa")} ${points(r.points)}`
        : `${
            {
              oulu: t("Oulu", "Oulu"),
              region: t("Oulu region", "Oulun seutu"),
              elsewhere: t("Elsewhere in Finland", "Muualla Suomessa"),
              national: t("National story", "Valtakunnallinen juttu"),
              international: t("International story", "Kansainvälinen juttu"),
            }[r.level]
          } ${points(r.points)} · ${t("matched", "osuma")} ${words(r.matched)}${where(r.context)}`;
    if (r.type === "recency")
      return `${t("Recency", "Tuoreus")} ${points(r.points)} · ${t(`${r.hours} h old`, `${r.hours} t vanha`)}`;
    return `${kindNames[r.kind]?.[lang] ?? r.kind} ${points(r.points)}`;
  };
  const card = (item: NewsItem, rank: number) => {
    const rel = audience ? item.relevance[audience] : null;
    const queued = queuedUrls.includes(item.url);
    const kind = kindNames[item.kind];
    return (
      <li key={item.id} className="feed-item" data-id={item.id}>
        <div className="feed-meta">
          {audience && <span className="feed-rank">{rank}</span>}
          {item.publishedAt ? (
            <time dateTime={item.publishedAt}>
              {time(item.publishedAt)} · {ago(item.publishedAt)}
            </time>
          ) : (
            <span>
              {t("Publication date missing", "Julkaisupäivä puuttuu")}
            </span>
          )}
          {kind && <span className="badge">{kind[lang]}</span>}
          {item.confidence === "uncertain" && (
            <span
              className="badge"
              title={t(
                "The headline and feed summary do not say enough to classify this story reliably.",
                "Otsikko ja syötekuvaus eivät riitä jutun luotettavaan luokitteluun.",
              )}
            >
              {t("Uncertain match", "Epävarma luokitus")}
            </span>
          )}
        </div>
        <h3 lang="fi">
          <a href={item.url} target="_blank" rel="noreferrer">
            {item.title}
            <span className="sr-only">
              {t(
                " (opens Kaleva in a new tab)",
                " (avaa Kalevan uuteen välilehteen)",
              )}
            </span>{" "}
            ↗
          </a>
        </h3>
        {item.description && (
          <p lang="fi" className="feed-description">
            {item.description}
          </p>
        )}
        <p className="feed-attribution">
          {t("Source: Kaleva", "Lähde: Kaleva")} ·{" "}
          {t(
            "original Finnish headline and feed description, not translated · no summary generated",
            "alkuperäinen otsikko ja syötteen kuvaus · ei tiivistelmää",
          )}
        </p>
        {item.topics.length > 0 && (
          <ul className="topic-chips" aria-label={t("Topics", "Aiheet")}>
            {item.topics.map((topic) => (
              <li key={topic.id}>{topicNames[topic.id][lang]}</li>
            ))}
          </ul>
        )}
        {explained[item.url] && (
          <button
            className="primary feed-read"
            onClick={() => onRead(explained[item.url])}
          >
            {t(
              "Read the reviewed English explanation",
              "Lue tarkistettu englanninkielinen selitys",
            )}{" "}
            →
          </button>
        )}
        <div className="feed-actions">
          {rel && (
            <details className="feed-why">
              <summary>
                {t("Why it ranks here", "Miksi tässä")} ·{" "}
                {t("score", "pisteet")} {rel.score}
              </summary>
              <ul>
                {rel.reasons.map((r, i) => (
                  <li key={i}>{reasonText(r)}</li>
                ))}
              </ul>
            </details>
          )}
          <button
            className="text-button"
            disabled={queued}
            onClick={() =>
              onQueue({
                title: item.title,
                url: item.url,
                publishedAt: item.publishedAt,
                description: item.description,
              })
            }
          >
            {queued
              ? t("In the newsroom queue ✓", "Toimitusjonossa ✓")
              : t(
                  "Ask the newsroom to explain",
                  "Pyydä toimitusta selittämään",
                )}
          </button>
          {queued && (
            <button className="text-button" onClick={onOpenNewsroom}>
              {t("Open newsroom demo", "Avaa toimitusdemo")} →
            </button>
          )}
        </div>
      </li>
    );
  };
  return (
    <section className="news-feed" aria-labelledby="news-feed-title">
      <div className="section-title">
        <div>
          <span className="eyebrow">
            {t(
              "LIVE · KALEVA FREE-NEWS RSS",
              "LIVE · KALEVAN MAKSUTTOMAT UUTISET",
            )}
          </span>
          <h2 id="news-feed-title">
            {audience
              ? t(
                  "Kaleva today, ranked for you",
                  "Kaleva tänään, sinulle järjestettynä",
                )
              : t(
                  "Kaleva today, latest first",
                  "Kaleva tänään, uusimmat ensin",
                )}
          </h2>
        </div>
        <div
          className="segmented"
          role="group"
          aria-label={t("Rank the feed for", "Järjestä syöte")}
        >
          {(
            [
              ["everyone", t("Everyone", "Kaikki")],
              ["students", t("Students", "Opiskelijat")],
              ["working", t("Professionals & families", "Työ ja perhe")],
            ] as [Group, string][]
          ).map(([g, label]) => (
            <button
              key={g}
              aria-pressed={g === group}
              className={g === group ? "active" : ""}
              onClick={() => onGroup(g)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div role="status" className="source-status feed-status">
        {state === "loading" && !data
          ? t(
              "Loading Kaleva’s free-news feed…",
              "Ladataan Kalevan maksuttomien uutisten syötettä…",
            )
          : state === "loading"
            ? t(
                "Refreshing… showing the previous copy meanwhile.",
                "Päivitetään… sillä välin näytetään edellinen kopio.",
              )
            : state === "error"
              ? t(
                  "Kaleva’s feed could not be loaded and no saved copy exists.",
                  "Kalevan syötettä ei voitu ladata, eikä tallennettua kopiota ole.",
                )
              : data
                ? `${state === "saved" || data.status === "stale" ? t("Saved copy, not live: fetched", "Tallennettu kopio, ei tuore: haettu") : t("Live feed fetched", "Syöte haettu")} ${time(data.fetchedAt)} (${t("Helsinki time", "Helsingin aikaa")})`
                : ""}
      </div>
      {(state === "saved" || data?.status === "stale") && (
        <p className="warning-box feed-warning">
          {t(
            "The live refresh failed. These headlines may be out of date; open Kaleva for the latest.",
            "Tuore haku epäonnistui. Otsikot voivat olla vanhentuneita; avaa Kaleva nähdäksesi uusimmat.",
          )}{" "}
          <button className="text-button" onClick={load}>
            {t("Try again", "Yritä uudelleen")}
          </button>
        </p>
      )}
      {state === "error" && (
        <p className="warning-box feed-warning">
          {t(
            "Try again, or open the feed directly.",
            "Yritä uudelleen tai avaa syöte suoraan.",
          )}{" "}
          <button className="text-button" onClick={load}>
            {t("Try again", "Yritä uudelleen")}
          </button>{" "}
          <a
            href="https://www.kaleva.fi/feedit/rss/managed-listing/rss-maksuttomat/"
            target="_blank"
            rel="noreferrer"
          >
            {t("Open feed ↗", "Avaa syöte ↗")}
          </a>
        </p>
      )}
      {state === "loading" && !data && (
        <ol className="feed-list" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="feed-item feed-skeleton" />
          ))}
        </ol>
      )}
      {data && items.length > 0 && ranked.length === 0 && (
        <p className="muted">
          {t(
            `None of the ${items.length} stories in the current feed matched this audience’s topics strongly enough. Choose “Everyone” to see every headline.`,
            `Yksikään syötteen ${items.length} jutusta ei osunut tämän ryhmän aiheisiin riittävästi. Valitse ”Kaikki” nähdäksesi kaikki otsikot.`,
          )}
        </p>
      )}
      {data && items.length === 0 && (
        <p className="muted">
          {t(
            "The feed returned no valid stories.",
            "Syöte ei palauttanut kelvollisia juttuja.",
          )}
        </p>
      )}
      {visible.length > 0 && (
        <ol className="feed-list">
          {visible.map((item, i) => card(item, i + 1))}
        </ol>
      )}
      {ranked.length > LIMIT && (
        <button className="secondary" onClick={() => setShowAll((v) => !v)}>
          {showAll
            ? t("Show fewer", "Näytä vähemmän")
            : t(`Show all ${ranked.length}`, `Näytä kaikki ${ranked.length}`)}
        </button>
      )}
      {data && (
        <details className="feed-method">
          <summary>{t("How this feed is made", "Miten syöte syntyy")}</summary>
          <p>
            {audience
              ? t(
                  `Showing ${Math.min(visible.length, ranked.length)} of ${items.length} stories that scored at least ${MIN_SCORE} for this audience.`,
                  `Näytetään ${Math.min(visible.length, ranked.length)}/${items.length} juttua, jotka saivat tälle ryhmälle vähintään ${MIN_SCORE} pistettä.`,
                )
              : t(
                  `All ${items.length} stories, newest first. Not personalised.`,
                  `Kaikki ${items.length} juttua, uusimmat ensin. Ei personointia.`,
                )}
          </p>
          <p>
            {t(
              "Ranking is rule-based, not AI: Finnish keyword stems in each headline and Kaleva’s feed description, place names (Oulu and the Oulu region rank higher; other towns, national and international stories rank lower), recency and story type. Matches only in Kaleva’s feed summary count half, and a police mention without an incident word is not treated as a safety story. When the headline and summary say too little, the story is marked “Uncertain match”. Topic weights per audience are our demo assumptions, not measured reader data. The feed has no categories of its own, so topics are derived and can be wrong. We do not read article text, translate it or bypass any paywall. Nothing here is sent to Kaleva.",
              "Järjestys perustuu sääntöihin, ei tekoälyyn: suomenkieliset avainsanat otsikossa ja Kalevan syötekuvauksessa, paikannimet (Oulu ja Oulun seutu nostavat; muut paikkakunnat, valtakunnalliset ja kansainväliset jutut laskevat), tuoreus ja jutun tyyppi. Pelkästä syötekuvauksesta löytynyt osuma painaa puolet, eikä poliisin maininta ilman tapahtumasanaa tee jutusta turvallisuusuutista. Jos otsikko ja kuvaus kertovat liian vähän, juttu merkitään epävarmaksi. Aiheiden painot ovat demon oletuksia, eivät mitattua lukijatietoa. Syötteessä ei ole omia luokkia, joten aiheet on päätelty ja voivat olla väärin. Emme lue artikkelien tekstiä, käännä sitä tai kierrä maksumuuria. Mitään ei lähetetä Kalevalle.",
            )}
          </p>
          <a href={data.feed.url} target="_blank" rel="noreferrer">
            {t("Open the original RSS feed ↗", "Avaa alkuperäinen RSS-syöte ↗")}
          </a>
        </details>
      )}
    </section>
  );
}
