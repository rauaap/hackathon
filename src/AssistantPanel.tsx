import { useRef, useState } from "react";
import type { AssistDraft, NewsResponse, StyleMatch } from "../api/news.ts";
import type { Lang, SourceLead } from "./data";

type Failure =
  | "unavailable"
  | "budget"
  | "not_in_feed"
  | "refusal"
  | "truncated"
  | "invalid_output"
  | "model_error"
  | "network"
  | "unauthorized"
  | "locked"
  | "busy";
// Pääsykoodi säilyy vain tämän välilehden istunnossa, ei pysyvästi selaimessa.
const CODE_KEY = "kaleva-local-editor-code";
const readCode = () => {
  try {
    return sessionStorage.getItem(CODE_KEY) ?? "";
  } catch {
    return "";
  }
};
const writeCode = (value: string) => {
  try {
    if (value) sessionStorage.setItem(CODE_KEY, value);
    else sessionStorage.removeItem(CODE_KEY);
  } catch {
    /* Ilman istuntotallennusta koodi pitää syöttää uudelleen. */
  }
};

// Kalevan juttunumero osoitteen lopusta; sama tunniste kuin palvelimen syötteessä.
export const leadId = (lead: SourceLead) => {
  const n = lead.url.match(/\/(\d{5,})\/?$/)?.[1];
  return n ? `kaleva-${n}` : null;
};
function cachedFeed(): Partial<NewsResponse> | null {
  try {
    const raw = localStorage.getItem("kaleva-local-news-cache-v1");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function cachedAvailability(): boolean | null {
  const available = cachedFeed()?.assistant?.available;
  return typeof available === "boolean" ? available : null;
}

export default function AssistantPanel({
  lang,
  lead,
  existing,
  onDraft,
}: {
  lang: Lang;
  lead: SourceLead;
  existing?: AssistDraft;
  onDraft: (draft: AssistDraft, cached: boolean) => void;
}) {
  const t = (en: string, fi: string) => (lang === "en" ? en : fi);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(
    cachedAvailability() === false ? "unavailable" : null,
  );
  const pending = useRef(false);
  const [code, setCode] = useState(readCode);
  const id = leadId(lead);
  // Tyyliviitteiden haku on deterministinen ja näkyy toimittajalle jo ennen mallikutsua.
  const feed = cachedFeed();
  const planned: StyleMatch[] | null = id
    ? (feed?.items?.find((i) => i.id === id)?.styleReferences ?? null)
    : null;
  const catalog = feed?.styleGuide?.references ?? [];
  const refList = (
    matches: StyleMatch[],
    used: string[] = [],
    showUse = false,
  ) => (
    <ul className="style-refs">
      {matches.map((m) => {
        const ref =
          catalog.find((r) => r.id === m.id) ??
          (m as StyleMatch & {
            title?: string;
            url?: string;
            publishedAt?: string;
          });
        return (
          <li key={m.id}>
            <strong>{m.id}</strong>{" "}
            {ref?.url ? (
              <a href={ref.url} target="_blank" rel="noreferrer" lang="en">
                {ref.title} ↗
              </a>
            ) : (
              m.id
            )}{" "}
            <span className="muted">
              · {ref?.publishedAt?.slice(0, 10)} ·{" "}
              {t("historical, style only", "historiallinen, vain tyyli")}
            </span>
            <br />
            <small>
              {t("Matched on", "Osuma")}:{" "}
              {[
                ...m.topics,
                ...m.terms.map((x) => `“${x.label}” → ${x.en}`),
              ].join(", ")}
              {showUse &&
                ` · ${used.includes(m.id) ? t("model reports using it", "malli kertoo käyttäneensä") : t("model did not cite it", "malli ei maininnut")}`}
            </small>
          </li>
        );
      })}
    </ul>
  );
  const caveat = t(
    "Kaleva’s English-language archive is from 2012: a historical style and terminology reference, not necessarily current editorial standards and never evidence for this story. Only the newsroom’s own style notes and term pairs are sent to the model, not Kaleva’s article text.",
    "Kalevan englanninkielinen arkisto on vuodelta 2012: historiallinen tyyli- ja termiviite, ei välttämättä nykyinen linja eikä koskaan todiste tästä jutusta. Mallille lähetetään vain toimituksen omat tyylihavainnot ja termiparit, ei Kalevan artikkelitekstiä.",
  );
  async function run() {
    if (pending.current || !id) return;
    pending.current = true;
    setBusy(true);
    setFailure(null);
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${code.trim()}`,
        },
        body: JSON.stringify({ id }),
        signal: AbortSignal.timeout(60000),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.draft) {
        writeCode(code.trim());
        onDraft(data.draft, !!data.cached);
      } else {
        if (data.error === "unauthorized") writeCode("");
        setFailure((data.error as Failure) || "model_error");
      }
    } catch {
      setFailure("network");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  const messages: Record<Failure, string> = {
    unavailable: t(
      "AI assistant unavailable: the server has no LLM backend or editor access code configured. Nothing is generated or simulated. Continue with the manual brief below.",
      "AI-avustaja ei ole käytettävissä: palvelimelle ei ole määritetty kielimallin API-avainta tai toimituksen pääsykoodia. Mitään ei tuoteta eikä simuloida. Jatka alla olevalla käsin tehtävällä pohjalla.",
    ),
    unauthorized: t(
      "The editor access code was not accepted.",
      "Toimituksen pääsykoodia ei hyväksytty.",
    ),
    locked: t(
      "Too many wrong access codes. The assistant is locked for a few minutes.",
      "Liian monta väärää pääsykoodia. Avustaja on lukittu muutamaksi minuutiksi.",
    ),
    busy: t(
      "The assistant is already handling other requests. Try again in a moment.",
      "Avustaja käsittelee jo muita pyyntöjä. Yritä hetken päästä uudelleen.",
    ),
    budget: t(
      "The server’s AI budget for this hour or day is used up. Try later or continue manually.",
      "Palvelimen tunti- tai päiväkohtainen AI-kiintiö on käytetty. Yritä myöhemmin tai jatka käsin.",
    ),
    not_in_feed: t(
      "This story is no longer in Kaleva’s current feed. The assistant only works on stories it can re-read from the feed itself.",
      "Juttu ei ole enää Kalevan nykyisessä syötteessä. Avustaja käsittelee vain juttuja, jotka se voi lukea syötteestä itse.",
    ),
    refusal: t(
      "The model declined this item. Continue manually.",
      "Malli kieltäytyi käsittelemästä juttua. Jatka käsin.",
    ),
    truncated: t(
      "The model’s answer was cut off. Try again or continue manually.",
      "Mallin vastaus katkesi. Yritä uudelleen tai jatka käsin.",
    ),
    invalid_output: t(
      "The model returned output that failed validation, so it was discarded. Try again or continue manually.",
      "Mallin vastaus ei läpäissyt tarkistusta, joten se hylättiin. Yritä uudelleen tai jatka käsin.",
    ),
    model_error: t(
      "The AI service did not respond. Try again or continue manually.",
      "AI-palvelu ei vastannut. Yritä uudelleen tai jatka käsin.",
    ),
    network: t(
      "The request did not reach the server. Check the connection and try again.",
      "Pyyntö ei tavoittanut palvelinta. Tarkista yhteys ja yritä uudelleen.",
    ),
  };
  const level = (r: string) =>
    lang === "en"
      ? r
      : ((
          {
            high: "korkea",
            medium: "keskitaso",
            low: "matala",
            unclear: "epäselvä",
          } as Record<string, string>
        )[r] ?? r);
  return (
    <section className="assistant-panel" aria-labelledby="assistant-title">
      <div className="panel-heading">
        <h3 id="assistant-title">
          {t("Editorial AI assistant", "Toimituksen AI-avustaja")}
        </h3>
        <span className={`badge ${existing ? "green" : ""}`}>
          {existing
            ? t(
                "AI draft saved · unreviewed",
                "AI-luonnos tallennettu · tarkistamatta",
              )
            : failure === "unavailable"
              ? t("Unavailable", "Ei käytettävissä")
              : t("Claude · server-side", "Claude · palvelimella")}
        </span>
      </div>
      <p>
        {t(
          "Sends only this story’s Finnish headline and Kaleva’s feed description, re-read on the server from the live feed, to Claude. It returns an English translation, a relevance note and what the source does not say. The model never sees the full article. Its output becomes an unpublished draft that needs both human reviews.",
          "Lähettää Claudelle vain tämän jutun suomenkielisen otsikon ja Kalevan syötekuvauksen, jotka palvelin lukee uudelleen syötteestä. Vastauksena tulee englanninkielinen käännös, arvio merkityksestä ja lista siitä, mitä lähde ei kerro. Malli ei näe koko juttua. Tulos on julkaisematon luonnos, joka vaatii molemmat ihmistarkistukset.",
        )}
      </p>
      {!existing && failure !== "unavailable" && (
        <label className="assistant-code">
          {t("Editor access code", "Toimituksen pääsykoodi")}
          <input
            type="password"
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <small>
            {t(
              "Only newsroom editors can run the paid AI step. The code is kept for this browser tab only.",
              "Maksullista AI-vaihetta voivat käyttää vain toimittajat. Koodi säilyy vain tässä välilehdessä.",
            )}
          </small>
        </label>
      )}
      {!existing && (
        <button
          className="secondary"
          disabled={busy || !id || failure === "unavailable" || !code.trim()}
          onClick={run}
        >
          {busy
            ? t(
                "Generating English draft…",
                "Luodaan englanninkielistä luonnosta…",
              )
            : t(
                "Generate English draft with Claude",
                "Luo englanninkielinen luonnos Claudella",
              )}
        </button>
      )}
      {!id && (
        <p className="warning-box">
          {t(
            "This lead has no Kaleva story number, so the assistant cannot verify it against the feed.",
            "Vihjeellä ei ole Kalevan juttunumeroa, joten avustaja ei voi tarkistaa sitä syötteestä.",
          )}
        </p>
      )}
      <div role="status">
        {failure && <p className="warning-box">{messages[failure]}</p>}
      </div>
      {!existing && planned && (
        <div className="assistant-plan">
          <strong>
            {planned.length
              ? t(
                  `Translation mode: historical Kaleva style-grounded, 2012 (${planned.length} reference${planned.length > 1 ? "s" : ""})`,
                  `Käännöstila: Kalevan historialliseen tyyliin pohjautuva, 2012 (${planned.length} viite${planned.length > 1 ? "ttä" : ""})`,
                )
              : t(
                  "Translation mode: standard translation (no relevant Kaleva English reference found)",
                  "Käännöstila: tavallinen käännös (osuvaa Kalevan englanninkielistä viitettä ei löytynyt)",
                )}
          </strong>
          {planned.length > 0 && refList(planned)}
          <p className="privacy-note">{caveat}</p>
        </div>
      )}
      {existing && (
        <div className="assistant-result">
          <div className="source-compare">
            <div>
              <span className="eyebrow">
                {t("FINNISH SOURCE (FEED)", "SUOMENKIELINEN LÄHDE (SYÖTE)")}
              </span>
              <p lang="fi">
                <strong>{existing.source.title}</strong>
                <br />
                {existing.source.description ??
                  t("(no description in the feed)", "(syötteessä ei kuvausta)")}
              </p>
            </div>
            <div>
              <span className="eyebrow">
                {t("PROPOSED ENGLISH (AI)", "EHDOTETTU ENGLANTI (AI)")}
              </span>
              <p lang="en">
                <strong>{existing.output.headline_en}</strong>
                <br />
                {existing.output.description_en ||
                  t("(no description)", "(ei kuvausta)")}
              </p>
            </div>
          </div>
          <p>
            <strong>
              {existing.mode === "style-grounded"
                ? t(
                    "Translation guided by historical (2012) Kaleva English style references",
                    "Käännöstä ohjasivat Kalevan historialliset (2012) englanninkieliset tyyliviitteet",
                  )
                : t(
                    "Standard translation: no relevant Kaleva English reference was found, so no Kaleva-specific style was applied.",
                    "Tavallinen käännös: osuvaa Kalevan englanninkielistä viitettä ei löytynyt, joten Kalevan tyyliä ei käytetty.",
                  )}
            </strong>
          </p>
          {existing.mode === "style-grounded" && (
            <>
              {refList(
                existing.styleReferences,
                existing.output.style_references_used,
                true,
              )}
              <p className="privacy-note">{caveat}</p>
            </>
          )}
          <p className="privacy-note">
            {t("Generated by", "Tuottanut")} {existing.model} ·{" "}
            {new Date(existing.generatedAt).toLocaleString(
              lang === "en" ? "en-GB" : "fi-FI",
              { timeZone: "Europe/Helsinki" },
            )}{" "}
            · {existing.promptVersion}
            {existing.usage &&
              ` · ${existing.usage.inputTokens}+${existing.usage.outputTokens} tokens`}
          </p>
          <p>
            <strong>
              {t("Relevance (model’s judgement):", "Merkitys (mallin arvio):")}
            </strong>{" "}
            {t("students", "opiskelijat")}{" "}
            {level(existing.output.relevance.students)},{" "}
            {t("professionals & families", "työ ja perhe")}{" "}
            {level(existing.output.relevance.families)} ·{" "}
            {existing.output.evidence_sufficient
              ? t(
                  "source text judged sufficient",
                  "lähdeteksti arvioitu riittäväksi",
                )
              : t("source text NOT sufficient", "lähdeteksti EI riitä")}
          </p>
          {existing.fidelityWarnings.length > 0 && (
            <>
              <strong>
                {t(
                  "Automatic fidelity checks",
                  "Automaattiset uskollisuustarkistukset",
                )}
              </strong>
              <ul>
                {existing.fidelityWarnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </>
          )}
          {existing.output.unsupported_assumptions.length > 0 && (
            <>
              <strong>
                {t(
                  "Do not write (not supported by the source):",
                  "Älä kirjoita (lähde ei tue):",
                )}
              </strong>
              <ul>
                {existing.output.unsupported_assumptions.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}
