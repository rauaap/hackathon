import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import {
  SOURCE,
  title,
  standfirst,
  background,
  interpretation,
  contexts,
  unsupported,
  scenarios,
  premium,
  briefingPreview,
  initialState,
  loadState,
  STORAGE_KEY,
  type Copy,
  type Lang,
  type Group,
  type Story,
  type DemoState,
} from "./data";

type View = "reader" | "offers" | "newsroom";
function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    arrow: (
      <>
        <path d="M4 12h15M13 5l7 7-7 7" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    book: (
      <>
        <path d="M6 3h12v19l-6-4-6 4Z" />
      </>
    ),
    chat: <path d="M21 11a9 9 0 0 1-9 9H4l1-5a9 9 0 1 1 16-4Z" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    external: (
      <>
        <path d="M14 3h7v7M21 3l-12 12M11 3H3v18h18v-8" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}
function CityArt({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={`city-art ${small ? "small" : ""}`}
      viewBox="0 0 800 390"
      role="img"
      aria-label="Original illustration of a northern waterfront, inspired by Oulu"
    >
      <defs>
        <pattern
          id="water"
          width="100"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 11h65" stroke="#769594" strokeWidth="1" opacity=".38" />
        </pattern>
        <pattern
          id="windows"
          width="21"
          height="25"
          patternUnits="userSpaceOnUse"
        >
          <rect x="7" y="7" width="5" height="10" fill="#f3e8d6" />
        </pattern>
      </defs>
      <path fill="#e8ebe3" d="M0 0h800v390H0z" />
      <circle cx="600" cy="106" r="60" fill="#ed7848" />
      <path
        d="M0 230 100 207l120 16 150-23 140 26 130-15 160 19v160H0Z"
        fill="#b7c6ba"
      />
      <path d="M0 274h800v116H0z" fill="#a8c1bb" />
      <path d="M0 288h800v102H0z" fill="url(#water)" />
      <g fill="#718778">
        <path d="m60 232 14-48 15 48Zm23 3 17-65 18 65Zm601 0 17-65 18 65Zm30 2 17-77 18 77Z" />
      </g>
      <path d="M160 181h103v84H160z" fill="#b6573c" />
      <path d="m150 182 62-42 63 42Z" fill="#454d45" />
      <path d="M167 185h89v73h-89z" fill="url(#windows)" />
      <path d="M275 201h98v64h-98z" fill="#c38658" />
      <path d="m267 202 57-31 58 31Z" fill="#586158" />
      <path d="M284 206h81v52h-81z" fill="url(#windows)" />
      <path d="M406 167h86v97h-86z" fill="#e3d4bb" />
      <path d="m395 168 54-38 54 38Z" fill="#626d60" />
      <path d="M441 76h17v59h-17z" fill="#e3d4bb" />
      <path d="m435 77 14-44 15 44Z" fill="#626d60" />
      <path d="M447 26v15M441 31h12" stroke="#626d60" strokeWidth="2" />
      <path d="M420 180h59v73h-59z" fill="url(#windows)" />
      <path d="M524 213h104v52H524z" fill="#a95840" />
      <path d="m514 214 63-33 63 33Z" fill="#424e44" />
      <path d="M535 219h83v40h-83z" fill="url(#windows)" />
      <path d="M0 271h800" stroke="#495f51" strokeWidth="6" />
      <path
        d="M53 272v27m0-19h85m0-8v27M640 272v27m0-19h85m0-8v27"
        stroke="#495f51"
        strokeWidth="4"
      />
      <g fill="none" stroke="#fff8e8" strokeWidth="2" opacity=".6">
        <path d="m176 310 68 0m161 30h76m54-26h62M71 360h125m323 5h130" />
      </g>
      <path d="M0 351q63-34 120-11l81 50H0Z" fill="#6c846d" />
      <path d="m0 362 42-19 64 47H0Z" fill="#4c6958" />
    </svg>
  );
}
function Dialog({
  title: heading,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogTitle = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      aria-labelledby={dialogTitle}
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-top">
        <span className="eyebrow">KALEVA LOCAL</span>
        <button
          className="icon-button"
          aria-label="Close / Sulje"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      <h2 id={dialogTitle}>{heading}</h2>
      {children}
    </dialog>
  );
}
const groups: Group[] = ["everyone", "students", "working"];
export default function App() {
  const [state, setState] = useState<DemoState>(loadState);
  const [lang, setLang] = useState<Lang>("en");
  const [group, setGroup] = useState<Group>("everyone");
  const viewFromHash = (): View =>
    location.hash === "#offers"
      ? "offers"
      : location.hash === "#newsroom"
        ? "newsroom"
        : "reader";
  const [view, setView] = useState<View>(viewFromHash);
  const [modal, setModal] = useState<
    "question" | "checkout" | "error" | "reset" | null
  >(null);
  const [story, setStory] = useState<Story | "main" | null>(null);
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [correctionId, setCorrectionId] = useState("");
  const [correctionBody, setCorrectionBody] = useState<Copy>({
    en: "",
    fi: "",
  });
  const [correctionNote, setCorrectionNote] = useState<Copy>({
    en: "",
    fi: "",
  });
  const [correctionFact, setCorrectionFact] = useState(false);
  const [correctionLanguage, setCorrectionLanguage] = useState(false);
  const t = (en: string, fi: string) => (lang === "en" ? en : fi);
  const c = (copy: Copy) => copy[lang];
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    const fn = () => {
      setView(viewFromHash());
      setStory(null);
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 5500);
    return () => clearTimeout(timer);
  }, [toast]);
  const navigate = (v: View) => {
    setView(v);
    setStory(null);
    location.hash = v === "reader" ? "news" : v;
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const groupName = (g: Group) =>
    g === "students"
      ? t("Students", "Opiskelijat")
      : g === "working"
        ? t("Working & family", "Työ ja perhe")
        : t("Everyone", "Kaikki");
  const hasUnsupported = Object.values(unsupported).some((s) =>
    Object.values(state.draft).some((body) =>
      body.toLowerCase().includes(s.toLowerCase()),
    ),
  );
  const validApproval =
    !!state.approval &&
    state.approval.revision === state.revision &&
    state.approval.body.en === state.draft.en &&
    state.approval.body.fi === state.draft.fi &&
    state.fact &&
    state.language &&
    !hasUnsupported &&
    !state.rejected;
  function editDraft(l: Lang, value: string) {
    setState((s) => ({
      ...s,
      draft: { ...s.draft, [l]: value },
      revision: s.revision + 1,
      approval: null,
      fact: false,
      language: false,
      rejected: false,
    }));
  }
  function submitQuestion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = String(data.get("question") || "").trim();
    if (!text) return;
    setState((s) => ({
      ...s,
      questions: [
        ...s.questions,
        {
          id: crypto.randomUUID(),
          text: { en: text, fi: text },
          supports: 0,
          supported: false,
          private: true,
        },
      ],
    }));
    setModal(null);
    setToast(
      t(
        "Question added privately to the local editorial queue.",
        "Kysymys lisätty yksityisesti paikalliseen toimitusjonoon.",
      ),
    );
  }
  function publish() {
    if (!validApproval || !state.approval) return;
    const body = { ...state.approval.body };
    setState((s) => ({
      ...s,
      stories: [
        {
          id: crypto.randomUUID(),
          title: { ...title },
          body,
          kind: "published",
          category: { en: "Community explained", fi: "Yhteisö kysyi" },
          group: "everyone",
          corrections: [],
          review: "Alex North — fictional demo editor",
        },
        ...s.stories,
      ],
      approval: null,
      rejected: true,
    }));
    setToast(
      t(
        "The exact reviewed version is now in the reader feed.",
        "Tarkalleen tarkistettu versio on nyt lukijanäkymässä.",
      ),
    );
  }
  function openCorrection(id: string) {
    const report = state.reports.find((r) => r.id === id);
    if (!report) return;
    const body =
      report.storyId === "main"
        ? state.mainBody
        : state.stories.find((s) => s.id === report.storyId)?.body;
    if (!body) return;
    setCorrectionId(id);
    setCorrectionBody({ ...body });
    setCorrectionNote({ en: "", fi: "" });
    setCorrectionFact(false);
    setCorrectionLanguage(false);
  }
  function publishCorrection() {
    const report = state.reports.find((r) => r.id === correctionId);
    if (
      !report ||
      !correctionNote.en.trim() ||
      !correctionNote.fi.trim() ||
      !correctionBody.en.trim() ||
      !correctionBody.fi.trim() ||
      !correctionFact ||
      !correctionLanguage
    )
      return;
    const note = {
      note: { ...correctionNote },
      date: new Date().toISOString(),
    };
    setState((s) => ({
      ...s,
      mainBody: report.storyId === "main" ? { ...correctionBody } : s.mainBody,
      mainCorrections:
        report.storyId === "main"
          ? [...s.mainCorrections, note]
          : s.mainCorrections,
      stories: s.stories.map((item) =>
        item.id === report.storyId
          ? {
              ...item,
              body: { ...correctionBody },
              corrections: [...item.corrections, note],
            }
          : item,
      ),
      reports: s.reports.map((r) =>
        r.id === report.id ? { ...r, resolved: true } : r,
      ),
    }));
    setCorrectionId("");
    setToast(
      t(
        "Correction published with a visible note.",
        "Oikaisu julkaistu näkyvällä huomautuksella.",
      ),
    );
  }
  const ad = (
    <aside className="ad">
      <div className="ad-label">
        {t(
          "ADVERTISEMENT · FICTIONAL EXAMPLE",
          "MAINOS · KUVITTEELLINEN ESIMERKKI",
        )}
      </div>
      <div className="ad-inner">
        <span className="coffee-mark">n.</span>
        <div>
          <strong>{state.ad.name}</strong>
          <p>{c(state.ad.message)}</p>
          <span>{t("Oulu · sample placement", "Oulu · esimerkkimainos")}</span>
        </div>
        <Icon name="arrow" size={22} />
      </div>
    </aside>
  );
  const editorialPromise = (
    <div className="promise">
      <Icon name="shield" size={25} />
      <div>
        <strong>
          {t(
            "Your questions. Our responsibility.",
            "Sinun kysymyksesi. Meidän vastuumme.",
          )}
        </strong>
        <p>
          {t(
            "Sources you can open. AI assistance you can see. Final decisions by a human editor. Community support informs coverage; it never verifies a claim.",
            "Avattavat lähteet. Näkyvä AI-avustus. Lopulliset päätökset ihmistoimittajalta. Yhteisön tuki ohjaa aihevalintaa, ei vahvista väitteitä.",
          )}
        </p>
      </div>
    </div>
  );
  function save(id: string) {
    if (!state.member) {
      setModal("checkout");
      return;
    }
    setState((s) => ({
      ...s,
      saved: s.saved.includes(id)
        ? s.saved.filter((x) => x !== id)
        : [...s.saved, id],
    }));
  }
  function showStory(item: Story | "main") {
    if (item !== "main" && item.kind === "premium" && !state.member) {
      setModal("checkout");
      return;
    }
    setView("reader");
    history.replaceState(null, "", "#news");
    setStory(item);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function StoryCard({ item, index }: { item: Story; index: number }) {
    return (
      <article className={`story-card tone-${index % 3}`}>
        <button className="card-open" onClick={() => showStory(item)}>
          <div className="card-visual" aria-hidden="true">
            <span className="visual-number">0{index + 1}</span>
            <Icon
              name={index === 1 ? "chat" : index === 2 ? "book" : "globe"}
              size={52}
            />
            <span className="visual-line" />
          </div>
          <div className="category">{c(item.category)}</div>
          <span className="scenario-label">
            {item.kind === "published"
              ? t("Human approved · demo", "Ihmisen hyväksymä · demo")
              : item.kind === "premium"
                ? t("Premium demonstration", "Premium-esimerkki")
                : t("Demo scenario · not news", "Demoesimerkki · ei uutinen")}
          </span>
          <h3>{c(item.title)}</h3>
          <div className="card-meta">
            {t("3 min read", "3 min lukuaika")} <Icon name="arrow" />
          </div>
        </button>
      </article>
    );
  }
  function renderStory() {
    const main = story === "main";
    const item: Story = main
      ? {
          id: "main",
          title,
          body: state.mainBody,
          kind: "scenario",
          category: { en: "Local life", fi: "Paikallinen elämä" },
          group: "everyone",
          corrections: state.mainCorrections,
        }
      : state.stories.find((s) => s.id === (story as Story)?.id) ||
        (story as Story);
    const notes = main ? state.mainCorrections : item.corrections;
    return (
      <main className="article-page wrap">
        <button className="text-button back" onClick={() => setStory(null)}>
          ← {t("Back to Oulu", "Takaisin Ouluun")}
        </button>
        <div className="article-kicker">
          {main
            ? t(
                "LOCAL LIFE · BACKGROUND EXPLAINER",
                "PAIKALLINEN ELÄMÄ · TAUSTAJUTTU",
              )
            : c(item.category)}
        </div>
        <h1>{main ? c(title) : c(item.title)}</h1>
        <p className="article-deck">
          {main
            ? c(standfirst)
            : item.kind === "scenario"
              ? t(
                  "A demonstration of a possible future story. No real event is being reported.",
                  "Esimerkki mahdollisesta tulevasta jutusta. Tässä ei uutisoida oikeasta tapahtumasta.",
                )
              : t(
                  "A local demonstration of a reviewed community explainer.",
                  "Paikallinen esimerkki tarkistetusta yhteisöjutusta.",
                )}
        </p>
        <div className="article-byline">
          <span className="avatar">KL</span>
          <div>
            <strong>
              {t(
                "Kaleva Local concept desk",
                "Kaleva Localin konseptitoimitus",
              )}
            </strong>
            <span>
              {main
                ? t(
                    "2024 background · prepared 23 Oct 2026",
                    "Tausta vuodelta 2024 · koottu 23.10.2026",
                  )
                : t("Demonstration content", "Demon sisältö")}
            </span>
          </div>
          <span className="review-label">
            {main
              ? t(
                  "Concept preview · not human-approved",
                  "Konseptin esikatselu · ei ihmisen hyväksymä",
                )
              : item.kind === "published"
                ? t(
                    "Human-approved in this browser",
                    "Ihmisen hyväksymä tässä selaimessa",
                  )
                : t("Demo scenario", "Demoesimerkki")}
          </span>
        </div>
        {main && <CityArt />}
        <div className="article-layout">
          <div className="article-body">
            <h2>{t("What happened", "Mitä tapahtui")}</h2>
            <p className="preserve">
              {main ? c(state.mainBody) : c(item.body)}
            </p>
            {(main || item.kind === "published") && (
              <>
                <h2>
                  {t("Why it matters in Oulu", "Miksi tämä koskee Oulua")}
                </h2>
                <p>{c(interpretation)}</p>
                <section className="context-box">
                  <span className="eyebrow">
                    {t("FOR YOU", "SINULLE")} · {groupName(group)}
                  </span>
                  <p>{c(contexts[group])}</p>
                </section>
                <h2>
                  {t(
                    "What we know. What we don’t.",
                    "Mitä tiedämme. Mitä emme.",
                  )}
                </h2>
                <p>
                  <strong>
                    {t("Verified background: ", "Vahvistettu tausta: ")}
                  </strong>
                  {t(
                    "The official report describes a spring 2024 survey. It is dated evidence, not a new 2026 development.",
                    "Virallinen raportti kuvaa kevään 2024 kyselyä. Se on historiallista taustatietoa, ei uusi tapahtuma vuodelta 2026.",
                  )}
                </p>
                <p>
                  <strong>
                    {t("Still unverified: ", "Vielä selvittämättä: ")}
                  </strong>
                  {t(
                    "Whether these experiences persist today, how needs differ between reader groups, and whether readers or employers would pay. No original interviews have been conducted for this concept.",
                    "Jatkuvatko kokemukset tänään, miten eri lukijaryhmien tarpeet eroavat ja maksaisivatko lukijat tai työnantajat palvelusta. Konseptia varten ei ole tehty haastatteluja.",
                  )}
                </p>
                <h2>
                  {t("One useful next step", "Yksi hyödyllinen seuraava askel")}
                </h2>
                <p>
                  {t(
                    "Open the original report below. For a personal service question, use current guidance from the responsible organisation. Ask us which local issue needs an independent explanation.",
                    "Avaa alkuperäinen raportti alta. Henkilökohtaista palveluasiaa varten tarkista vastuullisen tahon ajantasainen ohje. Kerro meille, mikä paikallinen asia kaipaa riippumatonta selitystä.",
                  )}
                </p>
              </>
            )}
            {notes.length > 0 && (
              <section className="corrections">
                <h2>{t("Corrections", "Oikaisut")}</h2>
                {notes.map((n, i) => (
                  <div key={i}>
                    <span>
                      {new Date(n.date).toLocaleDateString(
                        lang === "en" ? "en-GB" : "fi-FI",
                      )}
                    </span>
                    <p>{c(n.note)}</p>
                  </div>
                ))}
              </section>
            )}
            <div className="article-actions">
              <button className="primary" onClick={() => setModal("question")}>
                <Icon name="chat" />
                {t("Ask a follow-up", "Kysy lisää")}
              </button>
              {(main || item.kind === "published") && (
                <button className="secondary" onClick={() => setModal("error")}>
                  {t("Report an error", "Ilmoita virheestä")}
                </button>
              )}
              <button
                className="icon-button"
                aria-label={t("Save story", "Tallenna juttu")}
                onClick={() => save(main ? "main" : item.id)}
              >
                <Icon name="book" />
              </button>
            </div>
          </div>
          <aside className="source-sidebar">
            <div className="source-box">
              <Icon name="shield" />
              <h3>{t("Behind this story", "Jutun taustalla")}</h3>
              {main || item.kind === "published" ? (
                <>
                  <span className="eyebrow">
                    {t("ORIGINAL SOURCE", "ALKUPERÄINEN LÄHDE")}
                  </span>
                  <a href={SOURCE} target="_blank" rel="noreferrer">
                    International House Oulu <Icon name="external" size={14} />
                  </a>
                  <p>
                    {t(
                      "Multilingual survey results. Survey: spring 2024. Publication date not shown on source page. Accessed 23 Oct 2026.",
                      "Monikielisen kyselyn tulokset. Kysely: kevät 2024. Julkaisupäivä ei näy lähdesivulla. Luettu 23.10.2026.",
                    )}
                  </p>
                </>
              ) : (
                <p>
                  {t(
                    "Fictional demonstration. No real source is offered as proof of this scenario.",
                    "Kuvitteellinen esimerkki. Oikeaa lähdettä ei esitetä todisteena tästä tapahtumasta.",
                  )}
                </p>
              )}
              <hr />
              <strong>{t("AI assistance", "AI-avustus")}</strong>
              <p>
                {t(
                  "Prepared fixtures simulate source selection, drafting and translation. No live AI reporting or autonomous publishing.",
                  "Valmiit esimerkit simuloivat lähdevalintaa, luonnostelua ja käännöstä. Ei reaaliaikaista AI-uutisointia tai automaattista julkaisua.",
                )}
              </p>
              <strong>
                {t("Editorial review", "Toimituksellinen tarkistus")}
              </strong>
              <p>
                {item?.review ||
                  t(
                    "Prepared concept, no real journalist’s approval claimed. Use Newsroom demo to review and publish locally.",
                    "Valmis konsepti. Oikean journalistin hyväksyntää ei väitetä. Tarkista ja julkaise paikallisesti toimitusdemossa.",
                  )}
              </p>
              <a
                href="https://jsn.fi/en/journalists-guidelines/"
                target="_blank"
                rel="noreferrer"
              >
                {t("Journalist’s Guidelines", "Journalistin ohjeet")} ↗
              </a>
            </div>
          </aside>
        </div>
      </main>
    );
  }
  return (
    <>
      <a className="skip-link" href="#main-content">
        {t("Skip to content", "Siirry sisältöön")}
      </a>
      <div className="concept-bar">
        <span>
          <span className="status-dot" />
          {t("HACKATHON CONCEPT", "HACKATHON-KONSEPTI")}
        </span>
        <span>
          {t(
            "Not an official launched Kaleva service",
            "Ei Kalevan virallisesti julkaisema palvelu",
          )}
        </span>
      </div>
      <header className="wrap">
        <div className="utility">
          <span>
            <Icon name="pin" size={14} /> OULU, FINLAND
          </span>
          <div>
            <button
              className="newsroom-link"
              onClick={() => navigate("newsroom")}
            >
              <span className="tiny-square" />
              {t("Newsroom demo", "Toimitusdemo")} <span>↗</span>
            </button>
            <span className="utility-divider" />
            <button
              className={lang === "en" ? "language active" : "language"}
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
            <button
              className={lang === "fi" ? "language active" : "language"}
              onClick={() => setLang("fi")}
              aria-pressed={lang === "fi"}
            >
              FI
            </button>
          </div>
        </div>
        <div className="masthead-row">
          <button
            className="masthead"
            onClick={() => navigate("reader")}
            aria-label="Kaleva Local home"
          >
            Kaleva
            <span>
              Local<span className="masthead-dot">.</span>
            </span>
          </button>
          <p>
            {t("Understand Oulu.", "Ymmärrä Oulua.")}
            <br />
            <em>{t("Feel at home.", "Tunne olevasi kotona.")}</em>
          </p>
          <button
            className="primary masthead-cta"
            onClick={() => navigate("offers")}
          >
            {t("Discover Local Plus", "Tutustu Local Plussaan")}{" "}
            <Icon name="arrow" size={16} />
          </button>
        </div>
        <nav aria-label={t("Main navigation", "Päävalikko")}>
          <div>
            <button
              className={view === "reader" ? "nav-item selected" : "nav-item"}
              onClick={() => navigate("reader")}
            >
              {t("Your Oulu", "Sinun Oulusi")}
            </button>
            <button
              className={view === "offers" ? "nav-item selected" : "nav-item"}
              onClick={() => navigate("offers")}
            >
              {t("Membership & business", "Jäsenyys ja yritykset")}
            </button>
          </div>
          <span className="nav-note">
            <span className="status-dot" />
            {t("Independent by design", "Riippumattomuus ensin")}
          </span>
        </nav>
      </header>
      <div id="main-content" tabIndex={-1} />
      {view === "reader" ? (
        story ? (
          renderStory()
        ) : (
          <main className="wrap reader-view">
            <section className="section-intro">
              <div>
                <span className="eyebrow">
                  {t("A LOCAL PERSPECTIVE", "PAIKALLINEN NÄKÖKULMA")}
                </span>
                <h1>
                  {t("A little closer to home.", "Hieman lähempänä kotia.")}
                </h1>
                <span className="intro-sub">
                  {t(
                    "Local stories, with the context you need.",
                    "Paikalliset jutut ja tarvitsemasi taustat.",
                  )}
                </span>
              </div>
              <div className="reader-filter">
                <span>
                  {t(
                    "Make it relevant to you",
                    "Sinulle merkitykselliset jutut",
                  )}
                </span>
                <div
                  className="segmented"
                  role="group"
                  aria-label={t("Reader filter", "Lukijaryhmä")}
                >
                  {groups.map((g) => (
                    <button
                      key={g}
                      aria-pressed={g === group}
                      className={g === group ? "active" : ""}
                      onClick={() => setGroup(g)}
                    >
                      {groupName(g)}
                    </button>
                  ))}
                </div>
              </div>
            </section>
            <div className="lead-grid">
              <article className="lead-story">
                <button className="lead-open" onClick={() => showStory("main")}>
                  <div className="hero-image">
                    <CityArt />
                    <span className="image-caption">
                      {t(
                        "OULU · ORIGINAL CONCEPT ILLUSTRATION",
                        "OULU · ALKUPERÄINEN KONSEPTIKUVITUS",
                      )}
                    </span>
                    <span className="image-tag">
                      {t("THE BIG PICTURE", "KOKONAISKUVA")}
                    </span>
                  </div>
                  <div className="lead-copy">
                    <div className="category">
                      {t("Local life", "Paikallinen elämä")}
                      <span className="category-divider" />
                      {t(
                        "2024 survey background",
                        "Vuoden 2024 kyselyn taustaa",
                      )}
                    </div>
                    <h2>{c(title)}</h2>
                    <p>{c(standfirst)}</p>
                    <div className="lead-meta">
                      <span>
                        <Icon name="clock" size={14} />
                        {t("4 min read", "4 min lukuaika")}
                      </span>
                      <span>
                        {t(
                          "Sources open to everyone",
                          "Lähteet avoinna kaikille",
                        )}
                      </span>
                      <span className="read-link">
                        {t("Read the explainer", "Lue taustajuttu")}{" "}
                        <Icon name="arrow" size={18} />
                      </span>
                    </div>
                  </div>
                </button>
                <div className="reader-context">
                  <span className="context-dot" />
                  <p>{c(contexts[group])}</p>
                </div>
              </article>
              <aside className="right-rail">
                <section className="community-card">
                  <div className="rail-heading">
                    <Icon name="chat" />
                    <span className="eyebrow">
                      {t("THE COMMUNITY ASKS", "YHTEISÖ KYSYY")}
                    </span>
                  </div>
                  <h2>
                    {t(
                      "What should we explain next?",
                      "Mitä meidän pitäisi selittää seuraavaksi?",
                    )}
                  </h2>
                  <p className="muted">
                    {t(
                      "Good local journalism starts with a question. Yours could be next.",
                      "Hyvä paikallisjournalismi alkaa kysymyksestä. Seuraava voi olla sinun.",
                    )}
                  </p>
                  <div className="community-question">
                    <span className="micro-label">
                      {t(
                        "ILLUSTRATIVE READER QUESTION",
                        "HAVAINNOLLISTAVA LUKIJAKYSYMYS",
                      )}
                    </span>
                    <h3>{c(state.questions[0].text)}</h3>
                    <button
                      className={`support-button ${state.questions[0].supported ? "supported" : ""}`}
                      disabled={state.questions[0].supported}
                      onClick={() =>
                        setState((s) => ({
                          ...s,
                          questions: s.questions.map((q, i) =>
                            i === 0
                              ? {
                                  ...q,
                                  supported: true,
                                  supports: q.supports + 1,
                                }
                              : q,
                          ),
                        }))
                      }
                    >
                      <Icon
                        name={state.questions[0].supported ? "check" : "plus"}
                        size={14}
                      />
                      {state.questions[0].supported
                        ? t("Supported", "Tuettu")
                        : t("I wonder this too", "Minäkin mietin tätä")}
                      <span>{state.questions[0].supports}</span>
                    </button>
                    <small>
                      {t(
                        "Support recorded in this browser only.",
                        "Tuki tallentuu vain tähän selaimeen.",
                      )}
                    </small>
                  </div>
                  <button
                    className="primary full"
                    onClick={() => setModal("question")}
                  >
                    {t("Ask a question", "Lähetä kysymys")}
                    <Icon name="arrow" size={16} />
                  </button>
                  <p className="privacy-note">
                    {t(
                      "Private editorial queue. A human editor chooses what to investigate.",
                      "Yksityinen toimitusjono. Ihmistoimittaja valitsee tutkittavat aiheet.",
                    )}
                  </p>
                </section>
                <div className="briefing-card">
                  <span className="eyebrow">
                    {t("THE LOCAL BRIEFING", "PAIKALLINEN VIIKKOKIRJE")}
                  </span>
                  <h3>
                    {t(
                      "Less searching. More understanding.",
                      "Vähemmän etsimistä. Enemmän ymmärrystä.",
                    )}
                  </h3>
                  <p>
                    {t(
                      "A preview of a calmer, more useful week in Oulu.",
                      "Esikatselu selkeämmästä Oulu-viikosta.",
                    )}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => showStory(briefingPreview)}
                  >
                    {t(
                      "Preview the weekly digest",
                      "Katso viikkokirjeen esimerkki",
                    )}{" "}
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              </aside>
            </div>
            {state.stories.length > 0 && (
              <section className="published-section">
                <div className="section-title">
                  <h2>
                    {t("From your questions", "Kysymyksistäsi syntynyttä")}
                  </h2>
                  <span className="badge green">
                    {t(
                      "Human-approved · local demo",
                      "Ihmisen hyväksymä · paikallinen demo",
                    )}
                  </span>
                </div>
                <div className="story-grid">
                  {state.stories.map((item, i) => (
                    <StoryCard key={item.id} item={item} index={i} />
                  ))}
                </div>
              </section>
            )}
            <section className="more-stories">
              <div className="section-title">
                <h2>{t("Life around you", "Elämää ympärilläsi")}</h2>
                <span>
                  {t(
                    "Ideas for future reporting · demo scenarios",
                    "Ideoita tuleviin juttuihin · demoesimerkkejä",
                  )}
                </span>
              </div>
              <div className="story-grid">
                {scenarios
                  .filter(
                    (s) =>
                      group === "everyone" ||
                      s.group === "everyone" ||
                      s.group === group,
                  )
                  .map((item, i) => (
                    <StoryCard key={item.id} item={item} index={i} />
                  ))}
              </div>
            </section>
            {ad}
            {editorialPromise}
          </main>
        )
      ) : view === "offers" ? (
        <main className="wrap offers-view">
          <section className="page-heading">
            <span className="eyebrow">
              {t(
                "A SUSTAINABLE LOCAL NEWSROOM",
                "KESTÄVÄ PAIKALLINEN TOIMITUS",
              )}
            </span>
            <h1>{t("A place to belong.", "Paikka, johon kuulua.")}</h1>
            <p>
              {t(
                "Independent local journalism, supported by the people who need it.",
                "Riippumatonta paikallisjournalismia sitä tarvitsevien tuella.",
              )}
            </p>
          </section>
          <div className="hypothesis-note">
            <Icon name="chat" />
            <span>
              {t(
                "All prices are test hypotheses, not Kaleva’s actual prices. No confirmed customers, partners or revenue.",
                "Kaikki hinnat ovat testihypoteeseja, eivät Kalevan oikeita hintoja. Ei vahvistettuja asiakkaita, kumppaneita tai liikevaihtoa.",
              )}
            </span>
          </div>
          <section className="employer-offer">
            <div>
              <span className="eyebrow">
                {t(
                  "PRIMARY PROPOSAL · EMPLOYER PILOT",
                  "PÄÄEHDOTUS · TYÖNANTAJAPILOTTI",
                )}
              </span>
              <h2>
                {t(
                  "Help your people feel at home in Oulu.",
                  "Auta ihmisiäsi kotiutumaan Ouluun.",
                )}
              </h2>
              <p>
                {t(
                  "Six weeks of independent, English-language local journalism for up to 100 employees and family members.",
                  "Kuusi viikkoa riippumatonta englanninkielistä paikallisjournalismia enintään 100 työntekijälle ja perheenjäsenelle.",
                )}
              </p>
              <div className="offer-deliverables">
                <span>
                  <Icon name="check" />
                  {t("Two explainers per week", "Kaksi taustajuttua viikossa")}
                </span>
                <span>
                  <Icon name="check" />
                  {t("One weekly digest", "Yksi viikkokirje")}
                </span>
                <span>
                  <Icon name="check" />
                  {t("A clear pilot evaluation", "Selkeä pilotin arviointi")}
                </span>
              </div>
              <div className="independence">
                <Icon name="shield" />
                <p>
                  {t(
                    "You fund access. Editors decide coverage. No suppression of stories, favourable coverage selection or individual employee reading reports.",
                    "Rahoitat käyttöoikeuden. Toimitus päättää sisällöistä. Ei juttujen estämistä, myönteisen uutisoinnin valintaa tai työntekijäkohtaisia lukuraportteja.",
                  )}
                </p>
              </div>
            </div>
            <div className="pilot-form">
              <span className="price">
                €900<span>/ {t("six weeks", "kuusi viikkoa")}</span>
              </span>
              <span className="micro-label">
                {t("PROPOSED TEST PACKAGE", "EHDOTETTU TESTIPAKETTI")}
              </span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  const interest = {
                    organisation: String(data.get("organisation") || "").trim(),
                    note: String(data.get("pilot-note") || "").trim(),
                  };
                  if (!interest.organisation || !interest.note) return;
                  setState((s) => ({
                    ...s,
                    interests: s.interests + 1,
                    pilotInterests: [...s.pilotInterests, interest],
                  }));
                  e.currentTarget.reset();
                  setToast(
                    t(
                      "Pilot interest saved locally. No request was sent.",
                      "Pilottikiinnostus tallennettu paikallisesti. Pyyntöä ei lähetetty.",
                    ),
                  );
                }}
              >
                <label>
                  {t("Organisation (demo entry)", "Organisaatio (demosyöte)")}
                  <input
                    name="organisation"
                    required
                    maxLength={100}
                    placeholder={t("Your team in Oulu", "Tiimisi Oulussa")}
                  />
                </label>
                <label>
                  {t(
                    "What would you like to learn?",
                    "Mitä haluaisit selvittää?",
                  )}
                  <textarea
                    name="pilot-note"
                    required
                    maxLength={500}
                    placeholder={t(
                      "A short note is enough",
                      "Lyhyt viesti riittää",
                    )}
                  />
                </label>
                <button className="primary full" type="submit">
                  {t("Record pilot interest", "Tallenna pilottikiinnostus")}{" "}
                  <Icon name="arrow" />
                </button>
                <small>
                  {t(
                    "Local-only form. Nothing is sent. Do not enter personal information.",
                    "Vain paikallinen lomake. Mitään ei lähetetä. Älä syötä henkilötietoja.",
                  )}
                </small>
              </form>
            </div>
          </section>
          <div className="section-title">
            <h2>{t("For you, the reader", "Sinulle, lukija")}</h2>
            <span>
              {t("Additional pricing hypothesis", "Toinen hintahypoteesi")}
            </span>
          </div>
          <div className="membership-grid">
            <section className="plan">
              <span className="eyebrow">
                {t("ESSENTIALS FOR EVERYONE", "OLENNAINEN KUULUU KAIKILLE")}
              </span>
              <h3>{t("Local, free.", "Paikallista, maksutta.")}</h3>
              <div className="plan-price">€0</div>
              <ul>
                <li>
                  {t(
                    "Essential reporting & safety information",
                    "Olennainen uutisointi ja turvallisuustieto",
                  )}
                </li>
                <li>
                  {t("All original sources", "Kaikki alkuperäiset lähteet")}
                </li>
                <li>
                  {t(
                    "Community questions & digest preview",
                    "Yhteisökysymykset ja viikkokirjeen esikatselu",
                  )}
                </li>
              </ul>
              <button className="secondary" onClick={() => navigate("reader")}>
                {t("Explore your Oulu", "Tutustu Ouluusi")}{" "}
                <Icon name="arrow" />
              </button>
            </section>
            <section className="plan plus-plan">
              <span className="eyebrow">
                {t("GO A LITTLE DEEPER", "YMMÄRRÄ HIEMAN ENEMMÄN")}
              </span>
              <h3>
                Local Plus<span className="plus-tag">+</span>
              </h3>
              <div className="plan-price">
                €5.90{" "}
                <span>/ {t("month · test price", "kk · testihinta")}</span>
              </div>
              <ul>
                <li>
                  {t(
                    "Deeper local reporting",
                    "Syvällisemmät paikalliset jutut",
                  )}
                </li>
                <li>
                  {t(
                    "Saved stories & followed-topic collections",
                    "Tallennetut jutut ja seurattujen aiheiden kokoelmat",
                  )}
                </li>
                <li>
                  {t(
                    "A personal weekly digest",
                    "Henkilökohtainen viikkokirje",
                  )}
                </li>
              </ul>
              <button
                className="primary"
                onClick={() => {
                  if (state.member) showStory(premium);
                  else {
                    setState((s) => ({
                      ...s,
                      checkoutIntents: s.checkoutIntents + 1,
                    }));
                    setModal("checkout");
                  }
                }}
              >
                {state.member
                  ? t("Open your premium demo", "Avaa premium-demo")
                  : t("Try the demo membership", "Kokeile demojäsenyyttä")}{" "}
                <Icon name="arrow" />
              </button>
            </section>
          </div>
          {state.member && (
            <section className="member-library">
              <span className="badge green">
                {t(
                  "Demo membership active · no payment taken",
                  "Demojäsenyys aktiivinen · maksua ei otettu",
                )}
              </span>
              <h3>
                {t("Your local collection", "Oma paikallinen kokoelmasi")}
              </h3>
              <p>
                {t("Saved stories", "Tallennetut jutut")}: {state.saved.length}
              </p>
              <button
                className="secondary"
                onClick={() =>
                  setState((s) => ({ ...s, followed: !s.followed }))
                }
              >
                {state.followed ? "✓ " : "+ "}
                {t("Follow everyday Oulu", "Seuraa Oulun arkea")}
                {state.followed ? t(" · following", " · seurannassa") : ""}
              </button>
              <button
                className="text-button"
                onClick={() => showStory(premium)}
              >
                {t("Open demonstration digest", "Avaa viikkokirjeen esimerkki")}{" "}
                →
              </button>
              {state.saved.map((id) => (
                <button
                  key={id}
                  className="text-button"
                  onClick={() =>
                    showStory(
                      id === "main"
                        ? "main"
                        : [
                            ...state.stories,
                            ...scenarios,
                            briefingPreview,
                          ].find((s) => s.id === id) || premium,
                    )
                  }
                >
                  {id === "main"
                    ? c(title)
                    : c(
                        [...state.stories, ...scenarios, briefingPreview].find(
                          (s) => s.id === id,
                        )?.title || premium.title,
                      )}{" "}
                  →
                </button>
              ))}
            </section>
          )}
          <section className="advertiser-section">
            <div>
              <span className="eyebrow">
                {t("LOCAL ADVERTISING PILOT", "PAIKALLINEN MAINOSPILOTTI")}
              </span>
              <h2>
                {t("Be part of the neighbourhood.", "Ole osa naapurustoa.")}
              </h2>
              <div className="plan-price">
                €300 <span>/ {t("month · test price", "kk · testihinta")}</span>
              </div>
              <p>
                {t(
                  "One labelled briefing placement and one contextual reader placement. No guaranteed reach, leads or return. Advertising never changes story ranking or editorial approval.",
                  "Yksi merkitty mainos viikkokirjeessä ja yksi aiheeseen sopiva lukijamainos. Ei tavoittavuus-, liidi- tai tuottolupausta. Mainonta ei vaikuta juttujen järjestykseen tai hyväksyntään.",
                )}
              </p>
            </div>
            <div className="ad-editor">
              <span className="eyebrow">
                {t(
                  "EDIT THE FICTIONAL EXAMPLE",
                  "MUOKKAA KUVITTEELLISTA ESIMERKKIÄ",
                )}
              </span>
              <label>
                {t("Fictional business name", "Kuvitteellisen yrityksen nimi")}
                <input
                  value={state.ad.name}
                  maxLength={65}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      ad: { ...s.ad, name: e.target.value },
                    }))
                  }
                />
              </label>
              <label>
                {t("English message", "Englanninkielinen viesti")}
                <input
                  value={state.ad.message.en}
                  maxLength={140}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      ad: {
                        ...s.ad,
                        message: { ...s.ad.message, en: e.target.value },
                      },
                    }))
                  }
                />
              </label>
              <label>
                {t("Finnish message", "Suomenkielinen viesti")}
                <input
                  value={state.ad.message.fi}
                  maxLength={140}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      ad: {
                        ...s.ad,
                        message: { ...s.ad.message, fi: e.target.value },
                      },
                    }))
                  }
                />
              </label>
              {ad}
              <small>
                {t(
                  "Changes appear immediately in Your Oulu. Fictional advertiser, no booking.",
                  "Muutokset näkyvät heti Sinun Oulusi -näkymässä. Kuvitteellinen mainostaja, ei varausta.",
                )}
              </small>
            </div>
          </section>
          <section className="experiment">
            <span className="eyebrow">
              {t("THE NEXT COMMERCIAL EXPERIMENT", "SEURAAVA KAUPALLINEN KOE")}
            </span>
            <h2>
              {t(
                "Test one paid employer pilot. Learn before scaling.",
                "Testaa yksi maksullinen työnantajapilotti. Opi ennen skaalaamista.",
              )}
            </h2>
            <p>
              {t(
                "Sell clearly separated local advertising alongside it. Measure repeat reader use, trust, editorial workload and actual willingness to pay. No immediate revenue is promised.",
                "Myy rinnalla selvästi erotettua paikallismainontaa. Mittaa toistuvaa käyttöä, luottamusta, toimitustyön määrää ja todellista maksuhalukkuutta. Välitöntä liikevaihtoa ei luvata.",
              )}
            </p>
          </section>
        </main>
      ) : (
        <main className="wrap newsroom-view">
          <section className="page-heading">
            <span className="eyebrow">
              {t(
                "PUBLIC SIMULATION · NOT A SECURE ADMIN SYSTEM",
                "JULKINEN SIMULAATIO · EI TURVALLINEN HALLINTAJÄRJESTELMÄ",
              )}
            </span>
            <h1>{t("From a question to a story.", "Kysymyksestä jutuksi.")}</h1>
            <p>
              {t(
                "Simulated agent work. Real review gates. All state stays in this browser.",
                "Simuloitu AI-työ. Toimivat tarkistusportit. Kaikki tieto pysyy tässä selaimessa.",
              )}
            </p>
          </section>
          <div className="workflow-strip">
            {[
              t("Community question", "Yhteisökysymys"),
              t("Source monitor", "Lähdeseuranta"),
              t("Relevance editor", "Aihevalinta"),
              t("Explanatory draft", "Luonnos"),
              t("Fact & language", "Faktat ja kieli"),
              t("Human approval", "Ihmisen hyväksyntä"),
              t("Publication", "Julkaisu"),
            ].map((s, i) => (
              <span key={s}>
                <b>{String(i + 1).padStart(2, "0")}</b>
                {s}
                {i < 6 && <span className="workflow-arrow">→</span>}
              </span>
            ))}
          </div>
          <div className="newsroom-grid">
            <section className="queue panel">
              <div className="panel-heading">
                <h2>{t("Community queue", "Yhteisöjono")}</h2>
                <span className="count">{state.questions.length}</span>
              </div>
              <p className="muted">
                {t(
                  "Seeded questions are illustrative. New questions stay private to this demo queue. Support is not evidence.",
                  "Alkukysymykset ovat esimerkkejä. Uudet kysymykset pysyvät demon yksityisessä jonossa. Kannatus ei ole näyttöä.",
                )}
              </p>
              {state.questions.map((q) => (
                <div
                  key={q.id}
                  className={`queue-item ${state.selected === q.id ? "chosen" : ""}`}
                >
                  <span className="micro-label">
                    {q.private
                      ? t(
                          "PRIVATE · USER ENTRY (ORIGINAL LANGUAGE)",
                          "YKSITYINEN · KÄYTTÄJÄN ALKUPERÄINEN KIELI",
                        )
                      : t("ILLUSTRATIVE QUESTION", "HAVAINNOLLISTAVA KYSYMYS")}
                  </span>
                  <h3>{c(q.text)}</h3>
                  <div>
                    <span>
                      {q.supports}{" "}
                      {t("local demo supports", "paikallista demotukea")}
                    </span>
                    <button
                      className="text-button"
                      onClick={() => {
                        setState((s) => ({
                          ...s,
                          selected: q.id,
                          approval: null,
                          fact: false,
                          language: false,
                          rejected: false,
                        }));
                        setDraftOpen(false);
                      }}
                    >
                      {state.selected === q.id
                        ? t("Selected ✓", "Valittu ✓")
                        : t("Select for coverage", "Valitse käsittelyyn")}
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="secondary full"
                onClick={() => setModal("question")}
              >
                <Icon name="plus" />
                {t("Add a question", "Lisää kysymys")}
              </button>
            </section>
            <section className="panel source-monitor">
              <div className="panel-heading">
                <h2>{t("Source monitor", "Lähdeseuranta")}</h2>
                <span className="badge">{t("Simulated", "Simuloitu")}</span>
              </div>
              <span className="eyebrow">
                {t(
                  "OFFICIAL BACKGROUND · NOT BREAKING NEWS",
                  "VIRALLINEN TAUSTA · EI TUORE UUTINEN",
                )}
              </span>
              <h3>International House Oulu</h3>
              <p>{c(background)}</p>
              <a href={SOURCE} target="_blank" rel="noreferrer">
                {t("Inspect original report", "Tarkista alkuperäinen raportti")}{" "}
                <Icon name="external" size={14} />
              </a>
              <small>
                {t(
                  "Survey: spring 2024 · accessed 23 Oct 2026. No publication date displayed.",
                  "Kysely: kevät 2024 · luettu 23.10.2026. Julkaisupäivää ei ilmoiteta.",
                )}
              </small>
              <blockquote lang="fi">
                “Kyselyyn vastasi yhteensä 448 henkilöä”
              </blockquote>
              <small>
                {t(
                  "Short source excerpt, in its original language.",
                  "Lyhyt lähdeote alkuperäisellä kielellä.",
                )}
              </small>
              <hr />
              <h3>{t("Relevance editor", "Aihevalinta")}</h3>
              <p>
                {state.selected
                  ? c(
                      state.questions.find((q) => q.id === state.selected)!
                        .text,
                    )
                  : t(
                      "Select a question from the queue.",
                      "Valitse kysymys jonosta.",
                    )}
              </p>
              <label>
                {t(
                  "Why this question deserves coverage",
                  "Miksi aihe ansaitsee käsittelyn",
                )}
                <textarea
                  value={state.reason}
                  maxLength={700}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      reason: e.target.value,
                      approval: null,
                      fact: false,
                      language: false,
                    }))
                  }
                  placeholder={t(
                    "Explain the public interest and the limits of the source.",
                    "Perustele yleinen etu ja lähteen rajoitukset.",
                  )}
                />
              </label>
              <p className="privacy-note">
                {t(
                  "The prepared draft covers information access only. Unrelated questions need new reporting; this fixture cannot answer them.",
                  "Valmis luonnos käsittelee vain tiedon saatavuutta. Muut kysymykset vaativat uutta tiedonhankintaa; tämä esimerkki ei vastaa niihin.",
                )}
              </p>
              <button
                className="primary"
                disabled={!state.selected || state.reason.trim().length < 10}
                onClick={() => setDraftOpen(true)}
              >
                {t("Open prepared draft", "Avaa valmis luonnos")}{" "}
                <Icon name="arrow" />
              </button>
            </section>
          </div>
          {draftOpen && (
            <section className="panel draft-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">
                    {t(
                      "SIMULATED DRAFT · HUMAN DECISION",
                      "SIMULOITU LUONNOS · IHMISEN PÄÄTÖS",
                    )}
                  </span>
                  <h2>{t("The editor’s desk", "Toimittajan työpöytä")}</h2>
                </div>
                <span className={`badge ${validApproval ? "green" : ""}`}>
                  {validApproval
                    ? t("Approved snapshot", "Hyväksytty versio")
                    : `${t("Revision", "Versio")} ${state.revision}`}
                </span>
              </div>
              <p>
                {t(
                  "Reviewer: Alex North — fictional demo editor. Approval here is a local simulation, not approval by a Kaleva journalist.",
                  "Tarkistaja: Alex North — kuvitteellinen demotoimittaja. Paikallinen hyväksyntä ei ole Kalevan journalistin hyväksyntä.",
                )}
              </p>
              <div className="claim-list">
                <div>
                  <Icon name="check" />
                  <span>
                    {t(
                      "448 respondents; spring 2024",
                      "448 vastaajaa; kevät 2024",
                    )}
                  </span>
                  <a href={SOURCE} target="_blank" rel="noreferrer">
                    {t("Report: respondents", "Raportti: vastaajat")} ↗
                  </a>
                </div>
                <div>
                  <Icon name="check" />
                  <span>
                    {t(
                      "26%: information barrier",
                      "26 %: tiedon saatavuuden este",
                    )}
                  </span>
                  <a href={SOURCE} target="_blank" rel="noreferrer">
                    {t(
                      "Report: integration barriers",
                      "Raportti: kotoutumisen esteet",
                    )}{" "}
                    ↗
                  </a>
                </div>
                <div className={hasUnsupported ? "unsupported" : "resolved"}>
                  <strong>{hasUnsupported ? "!" : "✓"}</strong>
                  <span>
                    {t(
                      "“All international residents have this problem.”",
                      "”Kaikilla kansainvälisillä asukkailla on tämä ongelma.”",
                    )}
                  </span>
                  <b>
                    {hasUnsupported
                      ? t(
                          "UNSUPPORTED · BLOCKS PUBLICATION",
                          "EI LÄHDETUKEA · ESTÄÄ JULKAISUN",
                        )
                      : t("REMOVED / CORRECTED", "POISTETTU / KORJATTU")}
                  </b>
                </div>
              </div>
              {hasUnsupported && (
                <div className="warning-box">
                  <p>
                    {t(
                      "A survey cannot establish a universal claim. Remove the seeded assertion in both languages or use the supported replacement. All other edits still require factual review.",
                      "Kysely ei tue kaikkia koskevaa väitettä. Poista väite molemmista kieliversioista tai käytä lähteen mukaista korvausta. Muutkin muokkaukset vaativat faktantarkistuksen.",
                    )}
                  </p>
                  <button
                    className="secondary"
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        draft: {
                          en: s.draft.en.replace(
                            unsupported.en,
                            "The report describes respondents’ experiences; it cannot represent everyone.",
                          ),
                          fi: s.draft.fi.replace(
                            unsupported.fi,
                            "Raportti kuvaa vastaajien kokemuksia eikä edusta kaikkia.",
                          ),
                        },
                        revision: s.revision + 1,
                        approval: null,
                        fact: false,
                        language: false,
                      }))
                    }
                  >
                    {t(
                      "Replace unsupported assertion",
                      "Korvaa perusteeton väite",
                    )}
                  </button>
                </div>
              )}
              <div className="draft-editors">
                {(["en", "fi"] as Lang[]).map((l) => (
                  <label key={l}>
                    {l === "en" ? "English draft" : "Suomenkielinen luonnos"}
                    <textarea
                      aria-label={
                        l === "en" ? "English draft" : "Suomenkielinen luonnos"
                      }
                      value={state.draft[l]}
                      onChange={(e) => editDraft(l, e.target.value)}
                    />
                  </label>
                ))}
              </div>
              <div className="review-gate">
                <h3>
                  {t(
                    "Human review before publication",
                    "Ihmisen tarkistus ennen julkaisua",
                  )}
                </h3>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={state.fact}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        fact: e.target.checked,
                        approval: null,
                      }))
                    }
                  />
                  {t(
                    "I checked both drafts against the source, dates, interpretation and unresolved claims.",
                    "Tarkistin molemmat luonnokset, lähteen, ajankohdat, tulkinnat ja avoimet väitteet.",
                  )}
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={state.language}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        language: e.target.checked,
                        approval: null,
                      }))
                    }
                  />
                  {t(
                    "I reviewed the English and Finnish for clarity and equivalent meaning.",
                    "Tarkistin englannin ja suomen selkeyden ja merkityksen vastaavuuden.",
                  )}
                </label>
                <div className="review-actions">
                  <button
                    className="secondary"
                    onClick={() => {
                      setState((s) => ({
                        ...s,
                        rejected: true,
                        approval: null,
                      }));
                      setToast(
                        t(
                          "Draft rejected. Edit it to begin another review.",
                          "Luonnos hylätty. Muokkaa sitä aloittaaksesi uuden tarkistuksen.",
                        ),
                      );
                    }}
                  >
                    {t("Reject draft", "Hylkää luonnos")}
                  </button>
                  <button
                    className="secondary"
                    disabled={
                      !state.fact ||
                      !state.language ||
                      hasUnsupported ||
                      state.rejected ||
                      !state.draft.en.trim() ||
                      !state.draft.fi.trim()
                    }
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        approval: {
                          revision: s.revision,
                          body: { ...s.draft },
                        },
                      }))
                    }
                  >
                    {t(
                      "Approve reviewed version",
                      "Hyväksy tarkistettu versio",
                    )}
                  </button>
                  <button
                    className="primary"
                    disabled={!validApproval}
                    onClick={publish}
                  >
                    {t("Publish to reader feed", "Julkaise lukijanäkymään")}{" "}
                    <Icon name="arrow" />
                  </button>
                </div>
                <p className="privacy-note">
                  {state.rejected
                    ? t(
                        "Draft closed or rejected. Edit the draft to reopen review.",
                        "Luonnos suljettu tai hylätty. Muokkaa sitä avataksesi tarkistuksen.",
                      )
                    : t(
                        "Any draft edit invalidates approval. Publication uses the exact reviewed snapshot, in both languages.",
                        "Luonnoksen muokkaus mitätöi hyväksynnän. Julkaisu käyttää tarkalleen tarkistettua versiota molemmilla kielillä.",
                      )}
                </p>
              </div>
            </section>
          )}
          <section className="panel correction-panel">
            <div className="panel-heading">
              <h2>{t("Corrections & accountability", "Oikaisut ja vastuu")}</h2>
              <span className="count">
                {state.reports.filter((r) => !r.resolved).length}
              </span>
            </div>
            {state.reports.length === 0 ? (
              <p className="muted">
                {t(
                  "No reports yet. Open the main story and choose “Report an error” to demonstrate a correction.",
                  "Ei ilmoituksia. Avaa pääjuttu ja valitse ”Ilmoita virheestä” kokeillaksesi oikaisua.",
                )}
              </p>
            ) : (
              state.reports.map((r) => (
                <div key={r.id} className="report-row">
                  <div>
                    <span className="micro-label">
                      {t(
                        "USER REPORT · ORIGINAL LANGUAGE",
                        "KÄYTTÄJÄN ILMOITUS · ALKUPERÄINEN KIELI",
                      )}
                    </span>
                    <p>{r.text}</p>
                  </div>
                  <button
                    disabled={r.resolved}
                    className="secondary"
                    onClick={() => openCorrection(r.id)}
                  >
                    {r.resolved
                      ? t("Correction published ✓", "Oikaisu julkaistu ✓")
                      : t("Review correction", "Käsittele oikaisu")}
                  </button>
                </div>
              ))
            )}
            {correctionId && (
              <div className="correction-editor">
                <h3>
                  {t(
                    "Amend the story and explain the change",
                    "Korjaa juttu ja kerro muutoksesta",
                  )}
                </h3>
                <div className="draft-editors">
                  {(["en", "fi"] as Lang[]).map((l) => (
                    <div key={l}>
                      <label>
                        {l === "en"
                          ? "Amended English text"
                          : "Korjattu suomenkielinen teksti"}
                        <textarea
                          value={correctionBody[l]}
                          onChange={(e) => {
                            setCorrectionBody((b) => ({
                              ...b,
                              [l]: e.target.value,
                            }));
                            setCorrectionFact(false);
                            setCorrectionLanguage(false);
                          }}
                        />
                      </label>
                      <label>
                        {l === "en"
                          ? "Visible correction note (English)"
                          : "Näkyvä oikaisuhuomautus (suomi)"}
                        <textarea
                          value={correctionNote[l]}
                          onChange={(e) => {
                            setCorrectionNote((n) => ({
                              ...n,
                              [l]: e.target.value,
                            }));
                            setCorrectionFact(false);
                            setCorrectionLanguage(false);
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={correctionFact}
                    onChange={(e) => setCorrectionFact(e.target.checked)}
                  />
                  {t(
                    "I verified the amended facts against the original source.",
                    "Tarkistin korjatut tiedot alkuperäisestä lähteestä.",
                  )}
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={correctionLanguage}
                    onChange={(e) => setCorrectionLanguage(e.target.checked)}
                  />
                  {t(
                    "I reviewed both language versions and the correction notes.",
                    "Tarkistin molemmat kieliversiot ja oikaisuhuomautukset.",
                  )}
                </label>
                <button
                  className="primary"
                  disabled={
                    !correctionFact ||
                    !correctionLanguage ||
                    !correctionNote.en.trim() ||
                    !correctionNote.fi.trim() ||
                    !correctionBody.en.trim() ||
                    !correctionBody.fi.trim()
                  }
                  onClick={publishCorrection}
                >
                  {t("Publish visible correction", "Julkaise näkyvä oikaisu")}
                </button>
              </div>
            )}
          </section>
          <div className="local-state-note">
            <Icon name="shield" />
            <p>
              {t(
                "Local browser storage, no shared database, no production authentication. This public simulation demonstrates editorial responsibility; it does not establish real editorial oversight.",
                "Paikallinen selaintallennus, ei yhteistä tietokantaa tai tuotannon kirjautumista. Julkinen simulaatio havainnollistaa toimituksellista vastuuta, ei muodosta oikeaa toimitusvalvontaa.",
              )}
            </p>
            <button className="text-button" onClick={() => setModal("reset")}>
              {t("Reset demo", "Nollaa demo")}
            </button>
          </div>
        </main>
      )}
      <footer className="wrap">
        <div className="footer-top">
          <button
            className="footer-masthead"
            onClick={() => navigate("reader")}
          >
            Kaleva Local<span>.</span>
          </button>
          <span>
            {t(
              "A clearer view of the place you call home.",
              "Selkeämpi kuva paikasta, jota kutsut kodiksi.",
            )}
          </span>
          <button className="text-button" onClick={() => setModal("reset")}>
            {t("Reset demo", "Nollaa demo")} ↻
          </button>
        </div>
        <div className="footer-bottom">
          <span>
            {t(
              "Independent hackathon concept · Oulu · 2026",
              "Riippumaton hackathon-konsepti · Oulu · 2026",
            )}
          </span>
          <span>
            {t(
              "Local to this browser. No payments. No messages sent.",
              "Vain tässä selaimessa. Ei maksuja. Ei lähetettyjä viestejä.",
            )}
          </span>
        </div>
      </footer>
      {storageError && (
        <div className="storage-warning" role="alert">
          {t(
            "Browser storage unavailable. Changes will not survive refresh.",
            "Selaintallennus ei ole käytettävissä. Muutokset eivät säily päivityksessä.",
          )}
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label={t("Dismiss", "Sulje")}
            onClick={() => setToast("")}
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
      {modal === "question" && (
        <Dialog
          title={t(
            "What would you like to understand?",
            "Mitä haluaisit ymmärtää?",
          )}
          onClose={() => setModal(null)}
        >
          <p>
            {t(
              "Your question enters a private, local editorial queue. It is not posted publicly or sent to a newsroom.",
              "Kysymys tallentuu yksityiseen, paikalliseen toimitusjonoon. Sitä ei julkaista tai lähetetä toimitukseen.",
            )}
          </p>
          <form onSubmit={submitQuestion}>
            <label>
              {t("Your question", "Kysymyksesi")}
              <textarea
                autoFocus
                name="question"
                required
                minLength={8}
                maxLength={500}
                placeholder={t(
                  "What is missing from the local conversation?",
                  "Mitä paikallisesta keskustelusta puuttuu?",
                )}
              />
            </label>
            <p className="privacy-note">
              {t(
                "Do not include names, contact details or sensitive personal information.",
                "Älä lisää nimiä, yhteystietoja tai arkaluonteisia henkilötietoja.",
              )}
            </p>
            <button className="primary full" type="submit">
              {t("Add to the editorial queue", "Lisää toimitusjonoon")}{" "}
              <Icon name="arrow" />
            </button>
          </form>
        </Dialog>
      )}
      {modal === "checkout" && (
        <Dialog
          title={
            state.member
              ? t(
                  "Your Local Plus demo is active",
                  "Local Plus -demosi on aktiivinen",
                )
              : t("A little more local.", "Hieman enemmän paikallista.")
          }
          onClose={() => setModal(null)}
        >
          <span className="badge">
            {t("SIMULATED CHECKOUT", "SIMULOITU KASSA")}
          </span>
          <div className="checkout-price">
            Local Plus{" "}
            <strong>
              €5.90<span>/{t("month", "kk")}</span>
            </strong>
          </div>
          <p>
            {t(
              "Proposed test price, not an actual Kaleva offer. No card details, no real subscription and no payment.",
              "Ehdotettu testihinta, ei Kalevan oikea tarjous. Ei korttitietoja, oikeaa tilausta tai maksua.",
            )}
          </p>
          <button
            className="primary full"
            onClick={() => {
              setState((s) => ({ ...s, member: true }));
              setModal(null);
              setToast(
                t(
                  "Demo membership activated — no payment taken",
                  "Demojäsenyys aktivoitu — maksua ei otettu",
                ),
              );
            }}
          >
            {t("Activate demo membership", "Aktivoi demojäsenyys")}{" "}
            <Icon name="arrow" />
          </button>
        </Dialog>
      )}
      {modal === "error" && (
        <Dialog
          title={t("Help us get it right.", "Auta meitä korjaamaan.")}
          onClose={() => setModal(null)}
        >
          <p>
            {t(
              "This report stays in the local review queue. No message is sent.",
              "Ilmoitus pysyy paikallisessa tarkistusjonossa. Viestiä ei lähetetä.",
            )}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = String(
                new FormData(e.currentTarget).get("error") || "",
              ).trim();
              if (!text) return;
              setState((s) => ({
                ...s,
                reports: [
                  ...s.reports,
                  {
                    id: crypto.randomUUID(),
                    storyId: story === "main" ? "main" : (story as Story).id,
                    text,
                    resolved: false,
                  },
                ],
              }));
              setModal(null);
              setToast(
                t(
                  "Error report added to the local review queue.",
                  "Virheilmoitus lisätty paikalliseen tarkistusjonoon.",
                ),
              );
            }}
          >
            <label>
              {t("What needs checking?", "Mikä kaipaa tarkistusta?")}
              <textarea
                autoFocus
                name="error"
                minLength={5}
                maxLength={700}
                required
              />
            </label>
            <button className="primary full" type="submit">
              {t(
                "Submit local error report",
                "Tallenna paikallinen virheilmoitus",
              )}
            </button>
          </form>
        </Dialog>
      )}
      {modal === "reset" && (
        <Dialog
          title={t(
            "Start the demonstration again?",
            "Aloitetaanko demo alusta?",
          )}
          onClose={() => setModal(null)}
        >
          <p>
            {t(
              "This clears questions, approvals, publications, membership, ad edits and corrections saved by this demo in this browser.",
              "Tämä tyhjentää tämän demon kysymykset, hyväksynnät, julkaisut, jäsenyyden, mainosmuokkaukset ja oikaisut tästä selaimesta.",
            )}
          </p>
          <div className="review-actions">
            <button className="secondary" onClick={() => setModal(null)}>
              {t("Keep exploring", "Jatka tutustumista")}
            </button>
            <button
              className="primary"
              onClick={() => {
                setState(initialState());
                setDraftOpen(false);
                setCorrectionId("");
                setModal(null);
                setGroup("everyone");
                navigate("reader");
                setToast(
                  t(
                    "Demo reset to its starting state.",
                    "Demo palautettu alkutilaan.",
                  ),
                );
              }}
            >
              {t("Reset demo", "Nollaa demo")}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
