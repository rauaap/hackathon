import { useRef, useState, useEffect } from "react";
import type { Lang, SourceLead } from "./data";
type Feed = {
  fetchedAt: string;
  rss: { status: string; url: string; total?: number; items?: SourceLead[] };
  city: {
    status: string;
    url: string;
    newestReturnedYear?: number;
    rows?: { measure: string; value: number; year: number }[];
  };
};
export default function LiveSources({
  lang,
  onQueue,
  queuedUrls,
}: {
  lang: Lang;
  onQueue: (source: SourceLead) => void;
  queuedUrls: string[];
}) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const pending = useRef<AbortController | null>(null);
  const t = (en: string, fi: string) => (lang === "en" ? en : fi);
  useEffect(() => () => pending.current?.abort(), []);
  async function refresh() {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError(false);
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("/api/sources", {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Unavailable");
      const result = await response.json();
      if (!result.rss || !result.city || !result.fetchedAt)
        throw new Error("Invalid feed");
      setFeed(result);
    } catch {
      if (!controller.signal.aborted || pending.current === controller)
        setError(true);
    } finally {
      clearTimeout(timeout);
      pending.current = null;
      setBusy(false);
    }
  }
  return (
    <section
      className="live-sources panel"
      aria-labelledby="live-sources-title"
    >
      <div className="panel-heading">
        <div>
          <span className="eyebrow">
            {t(
              "CONNECTED SOURCES · EDITORIAL INPUT",
              "YHDISTETYT LÄHTEET · TOIMITUKSEN AINEISTO",
            )}
          </span>
          <h2 id="live-sources-title">
            {t("What the sources are saying", "Mitä lähteissä tapahtuu")}
          </h2>
        </div>
        <button className="secondary" disabled={busy} onClick={refresh}>
          {busy
            ? t("Checking sources…", "Tarkistetaan lähteitä…")
            : t("Check live sources", "Tarkista lähteet nyt")}
        </button>
      </div>
      <p>
        {t(
          "Fetch Kaleva’s free-news RSS and a dated sample from Oulu’s open data. These are source leads, not translated or approved Kaleva Local stories. No agent publishes them.",
          "Hae Kalevan maksuttomien uutisten RSS ja päivätty otos Oulun avoimesta datasta. Ne ovat lähdevihjeitä, eivät käännettyjä tai hyväksyttyjä Kaleva Local -juttuja. Agentti ei julkaise niitä.",
        )}
      </p>
      <div role="status" className="source-status">
        {busy
          ? t(
              "Loading two public sources. The prepared demo stays available.",
              "Ladataan kahta julkista lähdettä. Valmis demo pysyy käytettävissä.",
            )
          : error
            ? t(
                "Sources could not be refreshed. Retry or open the original source. Any previous results below are from the earlier check.",
                "Lähteiden päivitys epäonnistui. Yritä uudelleen tai avaa alkuperäinen lähde. Mahdolliset aiemmat tulokset ovat edellisestä tarkistuksesta.",
              )
            : feed
              ? `${t("Fetched", "Haettu")} ${new Date(feed.fetchedAt).toLocaleString(lang === "en" ? "en-GB" : "fi-FI", { timeZone: "Europe/Helsinki" })} · ${t("Helsinki time · may be cached for up to 3 minutes", "Helsingin aika · välimuisti enintään 3 minuuttia")}`
              : t(
                  "Choose “Check live sources” to make a real request. No live data has been loaded yet.",
                  "Valitse ”Tarkista lähteet nyt” tehdäksesi oikean haun. Reaaliaikaista aineistoa ei ole vielä ladattu.",
                )}
      </div>
      <div className="live-source-grid">
        <div>
          <h3>Kaleva RSS</h3>
          <a
            href="https://www.kaleva.fi/feedit/rss/managed-listing/rss-maksuttomat/"
            target="_blank"
            rel="noreferrer"
          >
            {t("Open original feed ↗", "Avaa alkuperäinen syöte ↗")}
          </a>
          <p className="privacy-note">
            {t(
              "Original Finnish headlines. Feed date is shown; inclusion does not mean a story is relevant to Oulu or your selected community.",
              "Alkuperäiset suomenkieliset otsikot ja syötteen päivämäärät. Syötteessä oleminen ei tarkoita jutun koskevan Oulua tai valittua yhteisöä.",
            )}
          </p>
          {feed?.rss.status === "unavailable" && (
            <p className="warning-box">
              {t(
                "Kaleva RSS is unavailable. Try again or open the feed directly.",
                "Kalevan RSS ei vastaa. Yritä uudelleen tai avaa syöte suoraan.",
              )}
            </p>
          )}
          {feed?.rss.items?.length === 0 && (
            <p>
              {t(
                "No valid headlines returned.",
                "Kelvollisia otsikoita ei palautunut.",
              )}
            </p>
          )}
          <ol className="source-headlines">
            {feed?.rss.items?.map((item) => (
              <li key={item.url}>
                <time>
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleString(
                        lang === "en" ? "en-GB" : "fi-FI",
                        { timeZone: "Europe/Helsinki" },
                      )
                    : t("Publication date missing", "Julkaisupäivä puuttuu")}
                </time>
                <a lang="fi" href={item.url} target="_blank" rel="noreferrer">
                  {item.title} ↗
                </a>
                <button
                  className="text-button"
                  disabled={queuedUrls.includes(item.url)}
                  onClick={() => onQueue(item)}
                >
                  {queuedUrls.includes(item.url)
                    ? t(
                        "Added to reporting queue ✓",
                        "Lisätty toimitusjonoon ✓",
                      )
                    : t("Flag for reporting", "Nosta selvitettäväksi")}
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3>{t("Oulu open data", "Oulun avoin data")}</h3>
          <a
            href="https://api.ouka.fi/ohje/index.html"
            target="_blank"
            rel="noreferrer"
          >
            {t("Read API documentation ↗", "Lue rajapinnan kuvaus ↗")}
          </a>
          <p>
            {t(
              "Library statistics are a small source-quality example. Check the year before using a returned number as a fact about today.",
              "Kirjastotilasto on pieni esimerkki lähteen laadun arvioinnista. Tarkista vuosi ennen kuin käytät lukua nykytilanteen kuvauksena.",
            )}
          </p>
          {feed?.city.status === "ok" && (
            <>
              <div className="warning-box">
                <strong>
                  {t("Newest year returned:", "Uusin palautunut vuosi:")}{" "}
                  {feed.city.newestReturnedYear}
                </strong>
                <p>
                  {t(
                    "Historical data. This is not a current service count or evidence of a new local event.",
                    "Historiallista aineistoa. Tämä ei ole palveluiden nykyinen määrä tai näyttö uudesta paikallisesta tapahtumasta.",
                  )}
                </p>
              </div>
              <ul>
                {feed.city.rows?.map((row) => (
                  <li key={row.measure}>
                    <span lang="fi">{row.measure}</span>: {row.value} (
                    {row.year})
                  </li>
                ))}
              </ul>
              <a href={feed.city.url} target="_blank" rel="noreferrer">
                {t("Inspect exact JSON query ↗", "Tarkista tarkka JSON-haku ↗")}
              </a>
            </>
          )}
          {feed?.city.status === "unavailable" && (
            <p className="warning-box">
              {t(
                "City data is unavailable. No current values are inferred.",
                "Kaupungin aineisto ei vastaa. Nykyisiä arvoja ei päätellä.",
              )}
            </p>
          )}
          <p className="privacy-note">
            {t(
              "Live retrieval is working software. Relevance decisions, translation and reporting still need a human. The prepared workflow below uses the City of Oulu’s 14 Oct 2026 eVaka notice, checked by hand, instead of these new leads.",
              "Lähdehaku on toimivaa ohjelmistoa. Aihevalinta, käännös ja uutisointi vaativat edelleen ihmisen. Alla oleva valmis työnkulku käyttää käsin tarkistettua Oulun kaupungin eVaka-tiedotetta (14.10.2026) näiden uusien vihjeiden sijaan.",
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
