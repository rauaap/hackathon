import { useEffect, useRef, useState } from "react";
import {
  SOURCE,
  SOURCE_PUBLISHED,
  PREPARED_QUESTION_ID,
  evakaInsight,
  interpretation,
  knownClaims,
  unknowns,
  unsupported,
  type Copy,
  type DemoState,
  type Lang,
  type Question,
  type QuestionStatus,
  type Story,
} from "./data";

// Esittäjänäkymä: vasemmalla toimitus, oikealla lukija. Molemmat lukevat samaa React-tilaa
// ja käyttävät App.tsx:n toimittajafunktioita, joten tarkistusportit ovat samat kuin toimitusnäkymässä.
export type PresenterActions = {
  support: () => void;
  select: () => void;
  setReason: (text: string) => void;
  openDraft: () => void;
  replaceUnsupported: () => void;
  editDraft: (l: Lang, value: string) => void;
  setReview: (kind: "fact" | "language", checked: boolean) => void;
  approve: () => void;
  publish: () => void;
  reset: () => void;
  exit: () => void;
};
type Props = {
  lang: Lang;
  state: DemoState;
  question: Question;
  status: QuestionStatus;
  answer: Story | undefined;
  hasUnsupported: boolean;
  canApprove: boolean;
  validApproval: boolean;
  statusName: Record<QuestionStatus, Copy>;
  actions: PresenterActions;
};
type Stage = "question" | "investigation" | "review" | "publish" | "done";
const STAGES: { id: Exclude<Stage, "done">; en: string; fi: string }[] = [
  { id: "question", en: "Question", fi: "Kysymys" },
  { id: "investigation", en: "Investigation", fi: "Selvitys" },
  { id: "review", en: "Review", fi: "Tarkistus" },
  { id: "publish", en: "Publish", fi: "Julkaisu" },
];

export default function PresenterMode({
  lang,
  state,
  question,
  status,
  answer,
  hasUnsupported,
  canApprove,
  validApproval,
  statusName,
  actions,
}: Props) {
  const t = (en: string, fi: string) => (lang === "en" ? en : fi);
  const c = (copy: Copy) => copy[lang];
  // Lukijapaneelin kieli on oma valintansa; se vaihtaa vain hyväksyttyä tekstiä, ei kutsu mallia.
  const [readerLang, setReaderLang] = useState<Lang>("en");
  const r = (en: string, fi: string) => (readerLang === "en" ? en : fi);
  const draftReady = state.draftFor === PREPARED_QUESTION_ID;
  const stage: Stage = answer
    ? "done"
    : validApproval && draftReady
      ? "publish"
      : status === "investigating" && draftReady
        ? "review"
        : state.selected === PREPARED_QUESTION_ID
          ? "investigation"
          : "question";
  const stageIndex =
    stage === "done" ? STAGES.length : STAGES.findIndex((s) => s.id === stage);
  const approvedNotPublished = validApproval && !answer;
  // Julkaisun korostus näkyy vain siirtymähetkellä.
  const [justPublished, setJustPublished] = useState(false);
  const previous = useRef(answer?.id);
  useEffect(() => {
    if (answer && previous.current !== answer.id) setJustPublished(true);
    previous.current = answer?.id;
  }, [answer]);
  // Vasen paneeli vierittää aktiivisen vaiheen näkyviin, jotta esittäjän ei tarvitse etsiä nappia.
  const questionRef = useRef<HTMLDivElement>(null);
  const insightRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLDivElement>(null);
  const publishRef = useRef<HTMLDivElement>(null);
  const firstStage = useRef(true);
  const behavior = (): ScrollBehavior =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
  useEffect(() => {
    if (firstStage.current) {
      firstStage.current = false;
      return;
    }
    const target =
      stage === "investigation"
        ? insightRef.current
        : stage === "review"
          ? draftRef.current
          : stage === "publish"
            ? publishRef.current
            : stage === "question"
              ? questionRef.current
              : null;
    target?.scrollIntoView({
      block: stage === "publish" ? "nearest" : "start",
      behavior: behavior(),
    });
  }, [stage]);
  const readerStatus = approvedNotPublished
    ? r(
        "Being investigated · answer not yet published",
        "Selvitettävänä · vastausta ei ole vielä julkaistu",
      )
    : statusName[status][readerLang];

  return (
    <main className="presenter" id="main-content">
      <div className="presenter-bar">
        <div>
          <strong>
            {t(
              "HACKATHON DEMO — SIMULATED EDITORIAL WORKFLOW",
              "HACKATHON-DEMO — SIMULOITU TOIMITUSPROSESSI",
            )}
          </strong>
          <span>
            {t(
              "Both panels share browser-local demo state. This is not a live multi-user newsroom.",
              "Molemmat paneelit käyttävät tämän selaimen demotilaa. Tämä ei ole monen käyttäjän live-toimitus.",
            )}
          </span>
        </div>
        <div className="presenter-bar-actions">
          <button className="secondary" onClick={actions.reset}>
            {t("Reset Presenter Demo ↻", "Palauta esitys alkuun ↻")}
          </button>
          <button className="text-button" onClick={actions.exit}>
            {t("Exit to Kaleva Local", "Palaa Kaleva Localiin")}
          </button>
        </div>
      </div>

      <div className="presenter-grid">
        <section
          className="presenter-newsroom"
          aria-labelledby="presenter-newsroom-title"
        >
          <header className="presenter-panel-head">
            <span className="eyebrow">{t("NEWSROOM", "TOIMITUS")}</span>
            <h1 id="presenter-newsroom-title">
              {t(
                "From a community question to a checked answer",
                "Yhteisön kysymyksestä tarkistetuksi vastaukseksi",
              )}
            </h1>
            <ol
              className="presenter-steps"
              aria-label={t("Workflow progress", "Työn eteneminen")}
            >
              {STAGES.map((s, i) => (
                <li
                  key={s.id}
                  className={
                    i < stageIndex ? "done" : i === stageIndex ? "active" : ""
                  }
                  aria-current={i === stageIndex ? "step" : undefined}
                >
                  <span>{i + 1}</span>
                  {lang === "en" ? s.en : s.fi}
                </li>
              ))}
            </ol>
          </header>

          <div className="presenter-card" ref={questionRef}>
            <span className="micro-label">
              {t(
                "ILLUSTRATIVE READER QUESTION · FICTIONAL PARENT PERSONA",
                "HAVAINNOLLISTAVA LUKIJAKYSYMYS · KUVITTEELLINEN VANHEMPI",
              )}
            </span>
            <h2>{c(question.text)}</h2>
            <p className="presenter-meta">
              <span className={`radar-status ${status}`}>
                {c(statusName[status])}
              </span>
              {t(
                `${question.supports} support${question.supports === 1 ? "" : "s"} in this browser · a signal, not a decision`,
                `${question.supports} tukea tässä selaimessa · signaali, ei päätös`,
              )}
            </p>
            <p className="presenter-why">
              {t(
                "Audience: international families in Oulu. ",
                "Yleisö: kansainväliset perheet Oulussa. ",
              )}
              {c(evakaInsight.why)}
            </p>
            {stage === "question" && (
              <button className="primary" onClick={actions.select}>
                {t("1 · Select for coverage", "1 · Valitse käsittelyyn")}
              </button>
            )}
          </div>

          {stageIndex >= 1 && (
            <div className="presenter-card" ref={insightRef}>
              {/* Selvitysvaiheen jälkeen näkökulma tiivistyy, jotta luonnos ja tarkistus mahtuvat näkyviin. */}
              <details
                className="presenter-insight-wrap"
                key={String(stage === "investigation")}
                open={stage === "investigation" || undefined}
              >
                <summary>
                  <h2 className="presenter-h">
                    {t("Community Insight", "Yhteisön näkökulma")}
                  </h2>
                  {stage !== "investigation" && (
                    <span>
                      {t(
                        "Need, audience, signal, verified evidence, unanswered questions, value for Finnish-speaking families",
                        "Tarve, yleisö, signaali, tarkistettu näyttö, avoimet kysymykset, hyöty suomenkielisille perheille",
                      )}
                    </span>
                  )}
                </summary>
                <dl className="presenter-insight">
                  <dt>{t("Need", "Tarve")}</dt>
                  <dd>{c(evakaInsight.need)}</dd>
                  <dt>
                    {t("Audience", "Yleisö")}{" "}
                    <span className="insight-tag">
                      {t("editorial assessment", "toimituksen arvio")}
                    </span>
                  </dt>
                  <dd>{c(evakaInsight.audience)}</dd>
                  <dt>{t("Signal", "Signaali")}</dt>
                  <dd>
                    {t(
                      `${question.supports} support${question.supports === 1 ? "" : "s"} in this browser (seeded, illustrative question).`,
                      `${question.supports} tukea tässä selaimessa (havainnollistava esimerkkikysymys).`,
                    )}
                  </dd>
                  <dt>{t("Verified evidence", "Tarkistettu näyttö")}</dt>
                  <dd>
                    <ul>
                      {evakaInsight.evidence.map((i) => (
                        <li key={i}>{c(knownClaims[i])}</li>
                      ))}
                    </ul>
                    <a href={SOURCE} target="_blank" rel="noreferrer">
                      {t(
                        "City of Oulu notice, 14 Oct 2026 (not a Kaleva article) ↗",
                        "Oulun kaupungin tiedote 14.10.2026 (ei Kalevan juttu) ↗",
                      )}
                    </a>
                  </dd>
                  <dt>{t("Unanswered", "Vastaamatta")}</dt>
                  <dd>
                    <ul>
                      {evakaInsight.gaps.map((i) => (
                        <li key={i}>{c(unknowns[i])}</li>
                      ))}
                    </ul>
                  </dd>
                  <dt>
                    {t(
                      "Value for Finnish-speaking families",
                      "Hyöty suomenkielisille perheille",
                    )}{" "}
                    <span className="insight-tag">
                      {t("editorial assessment", "toimituksen arvio")}
                    </span>
                  </dt>
                  <dd>{c(evakaInsight.crossCommunity)}</dd>
                </dl>
              </details>
              {stage === "investigation" && (
                <div className="presenter-action">
                  <label>
                    {t(
                      "Why this question deserves coverage",
                      "Miksi aihe ansaitsee käsittelyn",
                    )}
                    <textarea
                      value={state.reason}
                      maxLength={700}
                      rows={3}
                      onChange={(e) => actions.setReason(e.target.value)}
                    />
                  </label>
                  <div className="presenter-buttons">
                    <button
                      className="text-button"
                      onClick={() => actions.setReason(c(evakaInsight.reason))}
                    >
                      {t(
                        "Use the Community Insight as the reason (editable)",
                        "Käytä yhteisön näkökulmaa perusteluna (muokattavissa)",
                      )}
                    </button>
                    <button
                      className="primary"
                      disabled={state.reason.trim().length < 10}
                      onClick={actions.openDraft}
                    >
                      {t(
                        "2 · Open prepared draft",
                        "2 · Avaa valmisteltu luonnos",
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {stageIndex >= 2 && draftReady && (
            <div className="presenter-card" ref={draftRef}>
              <h2 className="presenter-h">
                {t(
                  "Prepared draft · unpublished",
                  "Valmisteltu luonnos · julkaisematon",
                )}
              </h2>
              <p className="presenter-note">
                {t(
                  "Written by the team for this demo, not generated by AI. It stays invisible to readers until it is published.",
                  "Tiimin tätä demoa varten kirjoittama, ei tekoälyn tuottama. Lukijat eivät näe sitä ennen julkaisua.",
                )}
              </p>
              <ul className="presenter-claims">
                <li className="ok">
                  <strong>{t("Source-backed", "Lähteeseen perustuva")}</strong>
                  {t(
                    `${knownClaims.length} statements checked against the `,
                    `${knownClaims.length} väitettä tarkistettu: `,
                  )}
                  <a href={SOURCE} target="_blank" rel="noreferrer">
                    {t(
                      "City of Oulu notice, 14 Oct 2026 (not a Kaleva article) ↗",
                      "Oulun kaupungin tiedote 14.10.2026 (ei Kalevan juttu) ↗",
                    )}
                  </a>
                </li>
                <li className={hasUnsupported ? "blocked" : "ok"}>
                  <strong>
                    {hasUnsupported
                      ? t(
                          "Unsupported assertion · blocks approval",
                          "Perusteeton väite · estää hyväksynnän",
                        )
                      : t(
                          "Unsupported assertion replaced",
                          "Perusteeton väite korvattu",
                        )}
                  </strong>
                  {hasUnsupported ? (
                    <>
                      “{c(unsupported)}”{" "}
                      <button
                        className="secondary"
                        onClick={actions.replaceUnsupported}
                      >
                        {t(
                          "3 · Replace unsupported assertion",
                          "3 · Korvaa perusteeton väite",
                        )}
                      </button>
                    </>
                  ) : (
                    t(
                      "Replaced with what the notice actually says.",
                      "Korvattu sillä, mitä tiedote todella sanoo.",
                    )
                  )}
                </li>
                <li className="open">
                  <strong>
                    {t("Open reporting questions", "Avoimet kysymykset")}
                  </strong>
                  {t(
                    `${unknowns.length} gaps stay in the article as “What we don’t know yet”, plus one question to the city: not yet answered.`,
                    `${unknowns.length} aukkoa jää juttuun kohtana ”Mitä ei vielä tiedetä” sekä yksi kysymys kaupungille: ei vielä vastattu.`,
                  )}
                </li>
                <li className="assess">
                  <strong>
                    {t("Editorial assessment", "Toimituksen arvio")}
                  </strong>
                  {c(interpretation).split(". ")[0]}.
                </li>
              </ul>
              <details className="presenter-edit">
                <summary>
                  {t(
                    "Edit draft text (any edit resets approval)",
                    "Muokkaa luonnosta (muokkaus nollaa hyväksynnän)",
                  )}
                </summary>
                {(["en", "fi"] as Lang[]).map((l) => (
                  <label key={l}>
                    {l === "en" ? "English draft" : "Suomenkielinen luonnos"}
                    <textarea
                      value={state.draft[l]}
                      rows={6}
                      onChange={(e) => actions.editDraft(l, e.target.value)}
                    />
                  </label>
                ))}
              </details>
              <fieldset className="presenter-review">
                <legend>
                  {t(
                    "4 · Human review (both required)",
                    "4 · Ihmisen tarkistus (molemmat pakollisia)",
                  )}
                </legend>
                <label>
                  <input
                    type="checkbox"
                    checked={state.fact}
                    onChange={(e) =>
                      actions.setReview("fact", e.target.checked)
                    }
                  />
                  {t(
                    "Fact review: I checked both drafts against the source.",
                    "Faktatarkistus: tarkistin molemmat luonnokset lähdettä vasten.",
                  )}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={state.language}
                    onChange={(e) =>
                      actions.setReview("language", e.target.checked)
                    }
                  />
                  {t(
                    "Language review: English and Finnish say the same thing clearly.",
                    "Kielitarkistus: englanti ja suomi sanovat saman selkeästi.",
                  )}
                </label>
                <button
                  className="secondary"
                  disabled={!canApprove || validApproval}
                  onClick={actions.approve}
                >
                  {validApproval
                    ? t(
                        `Approved · revision ${state.revision}`,
                        `Hyväksytty · versio ${state.revision}`,
                      )
                    : t("Approve this exact version", "Hyväksy tämä versio")}
                </button>
              </fieldset>
              <div className="presenter-publish" ref={publishRef}>
                <button
                  className="primary"
                  disabled={!validApproval || !!answer}
                  onClick={actions.publish}
                >
                  {t(
                    "5 · Publish reviewed answer →",
                    "5 · Julkaise tarkistettu vastaus →",
                  )}
                </button>
                <span>
                  {answer
                    ? t(
                        "Published in this browser.",
                        "Julkaistu tässä selaimessa.",
                      )
                    : validApproval
                      ? t(
                          "Approved but not published: readers still see nothing.",
                          "Hyväksytty mutta julkaisematon: lukijat eivät vielä näe mitään.",
                        )
                      : t(
                          "Locked until both reviews approve this exact version.",
                          "Lukittu, kunnes molemmat tarkistukset hyväksyvät tämän version.",
                        )}
                </span>
              </div>
            </div>
          )}
        </section>

        <section
          className="presenter-reader"
          aria-labelledby="presenter-reader-title"
          lang={readerLang}
        >
          <header className="presenter-panel-head">
            <span className="eyebrow">
              {r("READER EXPERIENCE", "LUKIJAN NÄKYMÄ")}
            </span>
            <h1 id="presenter-reader-title">
              Kaleva Local<span className="masthead-dot">.</span>
            </h1>
          </header>
          <p className="sr-only" aria-live="polite">
            {r("Question status: ", "Kysymyksen tila: ")}
            {readerStatus}
          </p>
          <div className="presenter-radar">
            <span className="eyebrow">COMMUNITY RADAR</span>
            <span className="micro-label">
              {r(
                "ILLUSTRATIVE READER QUESTION · FICTIONAL PARENT PERSONA",
                "HAVAINNOLLISTAVA LUKIJAKYSYMYS · KUVITTEELLINEN VANHEMPI",
              )}
            </span>
            <h2>{question.text[readerLang]}</h2>
            <div className="radar-row">
              <span
                className={`radar-status ${approvedNotPublished ? "investigating" : status}`}
              >
                {readerStatus}
              </span>
              <button
                className={`support-button ${question.supported ? "supported" : ""}`}
                disabled={question.supported}
                onClick={actions.support}
              >
                {question.supported
                  ? r("Supported", "Tuettu")
                  : r("I wonder this too", "Minäkin mietin tätä")}
                <span>{question.supports}</span>
              </button>
            </div>
            {answer ? (
              <button
                className="text-button"
                onClick={() =>
                  document
                    .getElementById("presenter-answer")
                    ?.scrollIntoView({ block: "start", behavior: behavior() })
                }
              >
                {r("Read the checked answer ↓", "Lue tarkistettu vastaus ↓")}
              </button>
            ) : (
              <p className="presenter-waiting">
                {status === "submitted"
                  ? r(
                      "Waiting for editorial review",
                      "Odottaa toimituksen arviota",
                    )
                  : r(
                      "The newsroom is working on this. No answer has been published yet.",
                      "Toimitus selvittää asiaa. Vastausta ei ole vielä julkaistu.",
                    )}
              </p>
            )}
          </div>

          {answer && (
            <article
              id="presenter-answer"
              className={`presenter-answer ${justPublished ? "fresh" : ""}`}
              onAnimationEnd={() => setJustPublished(false)}
              tabIndex={-1}
            >
              <div className="presenter-answer-head">
                <span className="eyebrow">
                  {r("ANSWER PUBLISHED", "VASTAUS JULKAISTU")}
                </span>
                <div
                  className="presenter-lang"
                  role="group"
                  aria-label="Language / Kieli"
                >
                  {(["en", "fi"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      aria-pressed={readerLang === l}
                      className={readerLang === l ? "active" : ""}
                      onClick={() => setReaderLang(l)}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <h2>{answer.title[readerLang]}</h2>
              <p className="presenter-answer-to">
                {r(
                  "Answers the community question: ",
                  "Vastaa yhteisön kysymykseen: ",
                )}
                “{question.text[readerLang]}”
              </p>
              <div className="preserve presenter-answer-body">
                {answer.body[readerLang]}
              </div>
              <p className="presenter-open">
                <strong>
                  {r(
                    "Our question to the City of Oulu:",
                    "Kysymyksemme Oulun kaupungille:",
                  )}
                </strong>{" "}
                {r("Not yet answered.", "Ei vielä vastattu.")}
              </p>
              <footer className="presenter-trust">
                <a href={SOURCE} target="_blank" rel="noreferrer">
                  {r(
                    `Source: City of Oulu notice, ${SOURCE_PUBLISHED} (not a Kaleva article) ↗`,
                    `Lähde: Oulun kaupungin tiedote, ${SOURCE_PUBLISHED} (ei Kalevan juttu) ↗`,
                  )}
                </a>
                <span>
                  {r(
                    "Fact and language reviewed in this browser by a fictional demo editor. Not reviewed or published by Kaleva journalists. Draft prepared by the team, not by AI.",
                    "Faktat ja kieli tarkistettu tässä selaimessa kuvitteellisen demotoimittajan toimesta. Ei Kalevan toimittajien tarkistama tai julkaisema. Luonnoksen kirjoitti tiimi, ei tekoäly.",
                  )}
                </span>
              </footer>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
