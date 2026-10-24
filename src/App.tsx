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
  SOURCE_PUBLISHED,
  SOURCE_ACCESSED,
  HISTORICAL_SOURCE,
  PREPARED_QUESTION_ID,
  readerNeeds,
  type SourceLead,
  title,
  standfirst,
  background,
  interpretation,
  knownClaims,
  unknowns,
  followUp,
  contexts,
  unsupported,
  supportedReplacement,
  draftInitial,
  leadBrief,
  aiDraft,
  splitTitle,
  PLACEHOLDER,
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
  type Question,
  type QuestionStatus,
  type QuestionRejection,
  questionStatus,
  checkQuestion,
  evakaInsight,
  QUESTION_LIMITS,
} from "./data";

import type { AssistDraft } from "../api/news.ts";
import LiveSources from "./LiveSources";
import NewsFeed from "./NewsFeed";
import AssistantPanel from "./AssistantPanel";
import PresenterMode from "./PresenterMode";

type View = "reader" | "offers" | "newsroom" | "presenter" | "ai" | "notfound";
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
    const trigger = document.activeElement as HTMLElement | null;
    el?.showModal();
    (
      el?.querySelector<HTMLElement>("textarea") ||
      el?.querySelector<HTMLElement>("button")
    )?.focus();
    return () => {
      el?.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);
  return (
    <dialog
      aria-labelledby={dialogTitle}
      ref={ref}
      onCancel={onClose}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const nodes = [
          ...e.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
          ),
        ];
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
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
  // Etusivu painottaa ensisijaista yleisöä; muut yleisöt ovat yhden napin päässä.
  const [group, setGroup] = useState<Group>("working");
  const [answerLang, setAnswerLang] = useState<Lang>("en");
  const viewFromHash = (): View =>
    location.pathname !== "/" ||
    ![
      "",
      "#news",
      "#offers",
      "#newsroom",
      "#presenter",
      "#ai",
      "#main-content",
    ].includes(location.hash)
      ? "notfound"
      : location.hash === "#offers"
        ? "offers"
        : location.hash === "#newsroom"
          ? "newsroom"
          : location.hash === "#presenter"
            ? "presenter"
            : location.hash === "#ai"
              ? "ai"
              : "reader";
  const [view, setView] = useState<View>(viewFromHash);
  const [modal, setModal] = useState<
    "question" | "checkout" | "error" | "reset" | null
  >(null);
  const [story, setStory] = useState<Story | "main" | null>(null);
  const [toast, setToast] = useState("");
  const [questionError, setQuestionError] = useState<QuestionRejection | null>(
    null,
  );
  // Uusi lomake alkaa ilman edellistä virhettä.
  useEffect(() => setQuestionError(null), [modal]);
  const rejectionText: Record<QuestionRejection, Copy> = {
    "too-short": {
      en: `Please write at least ${QUESTION_LIMITS.min} characters so an editor can understand the question.`,
      fi: `Kirjoita vähintään ${QUESTION_LIMITS.min} merkkiä, jotta toimittaja ymmärtää kysymyksen.`,
    },
    "too-long": {
      en: `Please keep it under ${QUESTION_LIMITS.max} characters.`,
      fi: `Pidä viesti alle ${QUESTION_LIMITS.max} merkissä.`,
    },
    "no-words": {
      en: "Please write your question in words.",
      fi: "Kirjoita kysymyksesi sanoin.",
    },
    "repeated-characters": {
      en: "Please remove repeated characters.",
      fi: "Poista toistuvat merkit.",
    },
    link: {
      en: "Links are not accepted. Describe the issue in your own words; the editor finds the sources.",
      fi: "Linkkejä ei hyväksytä. Kuvaa asia omin sanoin; toimittaja etsii lähteet.",
    },
    "contact-details": {
      en: "Please remove email addresses and phone numbers. We never need your contact details.",
      fi: "Poista sähköpostiosoitteet ja puhelinnumerot. Emme tarvitse yhteystietojasi.",
    },
    duplicate: {
      en: "This question is already in the queue. You can support the existing one instead.",
      fi: "Tämä kysymys on jo jonossa. Voit tukea olemassa olevaa kysymystä.",
    },
    "too-fast": {
      en: "Please wait a moment before sending another question.",
      fi: "Odota hetki ennen seuraavan kysymyksen lähettämistä.",
    },
    "too-many": {
      en: `You can send ${QUESTION_LIMITS.perWindow} questions per 10 minutes from this browser. Please try again later.`,
      fi: `Tästä selaimesta voi lähettää ${QUESTION_LIMITS.perWindow} kysymystä 10 minuutissa. Yritä myöhemmin uudelleen.`,
    },
  };
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
  const formatDate = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(
      lang === "en" ? "en-GB" : "fi-FI",
      {
        day: "numeric",
        month: lang === "en" ? "short" : "numeric",
        year: "numeric",
      },
    );
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
    const pageTitle = story
      ? story === "main"
        ? title[lang]
        : story.title[lang]
      : view === "offers"
        ? t("Membership & employer pilot", "Jäsenyys ja työnantajapilotti")
        : view === "newsroom"
          ? t("Newsroom demo", "Toimitusdemo")
          : view === "presenter"
            ? t("Presenter Mode", "Esittäjänäkymä")
            : view === "ai"
              ? t("AI transparency", "Tekoälyn käyttö")
              : view === "notfound"
                ? t("Page not found", "Sivua ei löytynyt")
                : t("Oulu, explained", "Oulu, ymmärrettävästi");
    document.title = `${pageTitle} | Kaleva Local`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        t(
          "An independent hackathon concept: local Oulu reporting in English and Finnish, community questions and human editorial review.",
          "Riippumaton hackathon-konsepti: Oulun paikallisjournalismia suomeksi ja englanniksi, yhteisökysymyksiä ja ihmisen toimituksellinen tarkistus.",
        ),
      );
  }, [lang, view, story]);
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
    if (location.pathname !== "/") history.replaceState(null, "", "/");
    location.hash = v === "reader" ? "news" : v;
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const groupName = (g: Group) =>
    g === "students"
      ? t("Students", "Opiskelijat")
      : g === "working"
        ? t("Professionals & families", "Työ ja perhe")
        : t("Everyone", "Kaikki");
  const hasUnsupported = Object.values(unsupported).some((s) =>
    Object.values(state.draft).some((body) =>
      body.toLowerCase().includes(s.toLowerCase()),
    ),
  );
  const hasPlaceholders = PLACEHOLDER.test(state.draft.en + state.draft.fi);
  const draftLead = state.questions.find(
    (q) => q.id === state.draftFor,
  )?.source;
  const selectedQuestion = state.questions.find((q) => q.id === state.selected);
  const statusName: Record<QuestionStatus, Copy> = {
    submitted: { en: "Submitted", fi: "Lähetetty" },
    review: { en: "Under editorial review", fi: "Toimituksen arvioitavana" },
    investigating: { en: "Being investigated", fi: "Selvitettävänä" },
    published: { en: "Answer published", fi: "Vastaus julkaistu" },
  };
  const statusPill = (q: Question) => {
    const st = questionStatus(q, state.stories);
    return <span className={`radar-status ${st}`}>{c(statusName[st])}</span>;
  };
  const answerFor = (id: string) =>
    state.stories.find((st) => st.questionId === id);
  // Yksi tuki kysymystä kohden tässä selaimessa.
  function supportQuestion(id: string) {
    setState((s) => ({
      ...s,
      questions: s.questions.map((q) =>
        q.id === id && !q.supported
          ? { ...q, supported: true, supports: q.supports + 1 }
          : q,
      ),
    }));
  }
  // Tila etenee vain toimittajan omista toimista, ei koskaan taaksepäin.
  function advanceQuestion(id: string, status: "review" | "investigating") {
    setState((s) => ({
      ...s,
      questions: s.questions.map((q) =>
        q.id === id && !(status === "review" && q.status === "investigating")
          ? { ...q, status }
          : q,
      ),
    }));
  }
  const validApproval =
    !!state.approval &&
    state.approval.revision === state.revision &&
    state.approval.body.en === state.draft.en &&
    state.approval.body.fi === state.draft.fi &&
    state.fact &&
    state.language &&
    !hasUnsupported &&
    !hasPlaceholders &&
    !state.rejected;
  // Toimittajan toiminnot. Toimitusnäkymä ja Presenter Mode käyttävät samoja funktioita,
  // joten tarkistusportit ovat molemmissa täsmälleen samat.
  const canApprove =
    state.fact &&
    state.language &&
    !hasUnsupported &&
    !hasPlaceholders &&
    !state.rejected &&
    !!state.draft.en.trim() &&
    !!state.draft.fi.trim();
  function selectForCoverage(id: string) {
    setState((s) => ({
      ...s,
      selected: id,
      approval: null,
      fact: false,
      language: false,
      rejected: false,
    }));
    advanceQuestion(id, "review");
    setDraftOpen(false);
  }
  function setReason(reason: string) {
    setState((s) => ({
      ...s,
      reason,
      approval: null,
      fact: false,
      language: false,
    }));
  }
  function openSelectedDraft() {
    openDraft(state.selected);
    advanceQuestion(state.selected, "investigating");
    setDraftOpen(true);
  }
  function replaceUnsupported() {
    setState((s) => ({
      ...s,
      draft: {
        en: s.draft.en.replace(unsupported.en, supportedReplacement.en),
        fi: s.draft.fi.replace(unsupported.fi, supportedReplacement.fi),
      },
      revision: s.revision + 1,
      approval: null,
      fact: false,
      language: false,
    }));
  }
  function setReview(kind: "fact" | "language", checked: boolean) {
    setState((s) => ({ ...s, [kind]: checked, approval: null }));
  }
  // Palauttaa vain eVaka-esityksen alkutilaan; muut kysymykset, jutut ja asetukset säilyvät.
  function resetPresenterDemo() {
    setState((s) => {
      const fresh = initialState();
      const prepared = fresh.questions.find(
        (q) => q.id === PREPARED_QUESTION_ID,
      )!;
      const isDemoAnswer = (st: Story) =>
        st.questionId === PREPARED_QUESTION_ID ||
        st.question?.en === prepared.text.en;
      const removed = new Set(
        s.stories.filter(isDemoAnswer).map((st) => st.id),
      );
      const drafts = { ...s.drafts };
      delete drafts[PREPARED_QUESTION_ID];
      const ai = { ...s.ai };
      delete ai[PREPARED_QUESTION_ID];
      return {
        ...s,
        questions: s.questions.some((q) => q.id === PREPARED_QUESTION_ID)
          ? s.questions.map((q) =>
              q.id === PREPARED_QUESTION_ID ? prepared : q,
            )
          : [prepared, ...s.questions],
        stories: s.stories.filter((st) => !removed.has(st.id)),
        reports: s.reports.filter((x) => !removed.has(x.storyId)),
        selected: "",
        reason: "",
        readerNeed: fresh.readerNeed,
        draft: { ...draftInitial },
        draftFor: PREPARED_QUESTION_ID,
        drafts,
        ai,
        revision: s.revision + 1,
        fact: false,
        language: false,
        approval: null,
        rejected: false,
      };
    });
    setDraftOpen(false);
    setToast(
      t(
        "Presenter demo reset. Other local data was kept.",
        "Esitys palautettu alkuun. Muut paikalliset tiedot säilyivät.",
      ),
    );
  }
  function approveDraft() {
    if (!canApprove) return;
    setState((s) => ({
      ...s,
      approval: { revision: s.revision, body: { ...s.draft } },
    }));
  }
  // Tallentaa avustajan tuloksen luonnokseksi; hyväksynnät nollataan ja julkaisu vaatii ihmistarkistuksen.
  function applyAiDraft(questionId: string, d: AssistDraft, cached: boolean) {
    setState((s) =>
      s.draftFor === questionId
        ? {
            ...s,
            ai: { ...s.ai, [questionId]: d },
            draft: aiDraft(d),
            revision: s.revision + 1,
            approval: null,
            fact: false,
            language: false,
            rejected: false,
          }
        : {
            ...s,
            ai: { ...s.ai, [questionId]: d },
            drafts: { ...s.drafts, [questionId]: aiDraft(d) },
          },
    );
    setToast(
      cached
        ? t(
            "AI draft loaded from the server cache and saved as an unpublished draft.",
            "AI-luonnos ladattiin palvelimen välimuistista ja tallennettiin julkaisemattomana luonnoksena.",
          )
        : t(
            "AI draft saved. It is not published; both human reviews are required.",
            "AI-luonnos tallennettu. Sitä ei ole julkaistu; molemmat ihmistarkistukset vaaditaan.",
          ),
    );
  }
  // Vaihtaa työpöydälle valitun kysymyksen luonnoksen. Saman kysymyksen luonnos ei muutu.
  function openDraft(id: string) {
    setState((s) => {
      if (s.draftFor === id) return s;
      const lead = s.questions.find((q) => q.id === id)?.source;
      const drafts = { ...s.drafts, [s.draftFor]: s.draft };
      const next =
        drafts[id] ??
        (id === PREPARED_QUESTION_ID
          ? { ...draftInitial }
          : lead
            ? leadBrief(lead)
            : null);
      if (!next) return s;
      return {
        ...s,
        drafts,
        draftFor: id,
        draft: next,
        revision: s.revision + 1,
        approval: null,
        fact: false,
        language: false,
        rejected: false,
      };
    });
  }
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
    const now = Date.now();
    const rejection = checkQuestion(
      text,
      state.questions,
      state.submittedAt,
      now,
    );
    setQuestionError(rejection);
    if (rejection) return;
    setState((s) => ({
      ...s,
      submittedAt: [
        ...s.submittedAt.filter((at) => now - at < QUESTION_LIMITS.windowMs),
        now,
      ],
      questions: [
        ...s.questions,
        {
          id: crypto.randomUUID(),
          text: { en: text, fi: text },
          supports: 0,
          supported: false,
          private: true,
          kind:
            data.get("contribution") === "observation"
              ? "observation"
              : "question",
          // Jatkokysymys luetusta jutusta kytketään juttuun.
          ...(story ? { storyId: story === "main" ? "main" : story.id } : {}),
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
  function queueSource(source: SourceLead) {
    setState((s) =>
      s.questions.some((q) => q.source?.url === source.url)
        ? s
        : {
            ...s,
            questions: [
              ...s.questions,
              {
                id: crypto.randomUUID(),
                text: {
                  en: `What does this development mean for our Oulu community? ${source.title}`,
                  fi: `Mitä tämä kehitys tarkoittaa Oulun yhteisöllemme? ${source.title}`,
                },
                supports: 0,
                supported: false,
                private: true,
                source,
              },
            ],
          },
    );
    setToast(
      t(
        "Source lead saved to the local queue. New reporting is required.",
        "Lähdevihje tallennettu paikalliseen jonoon. Se vaatii uutta tiedonhankintaa.",
      ),
    );
  }
  function publish() {
    if (!validApproval || !state.approval) return;
    const body = { ...state.approval.body };
    setState((s) => {
      const question = s.questions.find((q) => q.id === s.draftFor);
      const lead = question?.source;
      const ai = s.ai[s.draftFor];
      // AI-luonnoksessa otsikko on hyväksytyn version ensimmäinen rivi.
      const en = splitTitle(body.en);
      const fi = splitTitle(body.fi);
      return {
        ...s,
        stories: [
          {
            id: crypto.randomUUID(),
            title: ai
              ? { en: en.title, fi: fi.title }
              : lead
                ? { en: `From Kaleva: ${lead.title}`, fi: lead.title }
                : { ...title },
            body: ai ? { en: en.body, fi: fi.body } : body,
            kind: "published",
            category: ai
              ? {
                  en: "Kaleva story explained",
                  fi: "Kalevan juttu selitettynä",
                }
              : lead
                ? {
                    en: "Kaleva lead · reviewed",
                    fi: "Kaleva-vihje · tarkistettu",
                  }
                : { en: "Community explained", fi: "Yhteisö kysyi" },
            ...(ai
              ? {
                  ai: {
                    model: ai.model,
                    generatedAt: ai.generatedAt,
                    promptVersion: ai.promptVersion,
                    mode: ai.mode,
                    styleRefs: (ai.styleReferences ?? []).map(
                      ({ id, title, url, publishedAt }) => ({
                        id,
                        title,
                        url,
                        publishedAt,
                      }),
                    ),
                  },
                }
              : {}),
            group: "everyone",
            corrections: [],
            review: "Alex North — fictional demo editor",
            readerNeed: s.readerNeed,
            question: question?.text,
            questionId: question?.id,
            reason: s.reason.trim(),
            ...(lead ? { sourceLead: lead } : { followUp: { ...followUp } }),
          },
          ...s.stories,
        ],
        approval: null,
        rejected: true,
      };
    });
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
  function StoryCard({ item }: { item: Story }) {
    return (
      <article className="story-card">
        <button className="card-open" onClick={() => showStory(item)}>
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
            {item.kind === "published"
              ? t("Read the story", "Lue juttu")
              : t("Explore the example", "Tutustu esimerkkiin")}{" "}
            <Icon name="arrow" />
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
          question: state.questions.find((q) => q.id === PREPARED_QUESTION_ID)
            ?.text,
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
                "FAMILIES · SERVICE CHANGE EXPLAINER",
                "PERHEET · PALVELUMUUTOKSEN SELITYS",
              )
            : c(item.category)}
        </div>
        <h1>{main ? c(title) : c(item.title)}</h1>
        {item.ai && item.sourceLead && (
          <p className="ai-disclosure">
            <span className="badge">
              {t(
                "AI-assisted translation · human-approved",
                "AI-avusteinen käännös · ihmisen hyväksymä",
              )}
            </span>{" "}
            {t("Original Kaleva headline: ", "Kalevan alkuperäinen otsikko: ")}
            <span lang="fi">{item.sourceLead.title}</span>
          </p>
        )}
        {item.readerNeed && (
          <p className="eyebrow">
            {readerNeeds.find((need) => need.id === item.readerNeed)?.[lang]}
          </p>
        )}
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
                    "City of Oulu notice, 14 Oct 2026 · prepared 24 Oct 2026",
                    "Oulun kaupungin tiedote 14.10.2026 · koottu 24.10.2026",
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
            {item.question && (
              <section className="context-box">
                <span className="eyebrow">
                  {t(
                    "THE READER QUESTION WE CHOSE",
                    "VALITSEMAMME LUKIJAN KYSYMYS",
                  )}
                </span>
                <p>{c(item.question)}</p>
                {item.questionId && (
                  <div className="bilingual-note">
                    <strong>
                      {t(
                        "One verified answer, two language communities",
                        "Yksi tarkistettu vastaus, kaksi kieliryhmää",
                      )}
                    </strong>
                    <p>
                      {t(
                        "The editor approved this exact English and Finnish text together.",
                        "Toimittaja hyväksyi täsmälleen tämän englannin- ja suomenkielisen tekstin yhdessä.",
                      )}{" "}
                      {item.questionId === PREPARED_QUESTION_ID &&
                        c(evakaInsight.crossCommunity)}
                    </p>
                    <button
                      className="secondary"
                      lang={lang === "en" ? "fi" : "en"}
                      onClick={() => setLang(lang === "en" ? "fi" : "en")}
                    >
                      {lang === "en" ? "Lue suomeksi" : "Read in English"}
                    </button>
                  </div>
                )}
                {item.questionId && (
                  <small className="radar-link">
                    {t(
                      "Community Radar: this answer closes the reader question above. ",
                      "Community Radar: tämä vastaus koskee yllä olevaa lukijan kysymystä. ",
                    )}
                    {(() => {
                      const q = state.questions.find(
                        (x) => x.id === item.questionId,
                      );
                      return q
                        ? t(
                            `${q.supports} support${q.supports === 1 ? "" : "s"} in this browser.`,
                            `${q.supports} tukea tässä selaimessa.`,
                          )
                        : "";
                    })()}
                  </small>
                )}
                {item.reason && (
                  <small>
                    {t(
                      "Editor’s selection reason (original language): ",
                      "Toimittajan valintaperuste (alkuperäinen kieli): ",
                    )}
                    {item.reason}
                  </small>
                )}
              </section>
            )}
            <h2>{t("What happened", "Mitä tapahtui")}</h2>
            <p className="preserve">
              {main ? c(state.mainBody) : c(item.body)}
            </p>
            {(main || item.kind === "published") && !item.sourceLead && (
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
                    {t(
                      "Stated in the city’s notice:",
                      "Kaupungin tiedotteessa todetaan:",
                    )}
                  </strong>
                </p>
                <ul className="known-list">
                  {knownClaims.map((claim) => (
                    <li key={claim.en}>{c(claim)}</li>
                  ))}
                </ul>
                <p>
                  <strong>
                    {t(
                      "What we don’t know yet (not in the notice):",
                      "Mitä ei vielä tiedetä (ei tiedotteessa):",
                    )}
                  </strong>
                </p>
                <ul className="known-list">
                  {unknowns.map((gap) => (
                    <li key={gap.en}>{c(gap)}</li>
                  ))}
                </ul>
                <p>
                  {t(
                    "We have not interviewed the city or users. Nothing above is an answer from the City of Oulu.",
                    "Emme ole haastatelleet kaupunkia tai käyttäjiä. Mikään yllä oleva ei ole Oulun kaupungin vastaus.",
                  )}
                </p>
                <h2>
                  {t("One useful next step", "Yksi hyödyllinen seuraava askel")}
                </h2>
                <p>
                  {t(
                    "Open the city’s notice below for its full setup steps. This explainer does not replace the city’s own eVaka guidance. Ask us what still needs an independent explanation.",
                    "Avaa kaupungin tiedote alta, siinä ovat koko käyttöönotto-ohjeet. Tämä juttu ei korvaa kaupungin omaa eVaka-ohjeistusta. Kerro meille, mikä kaipaa vielä riippumatonta selitystä.",
                  )}
                </p>
                <section className="context-box follow-up">
                  <span className="eyebrow">
                    {t(
                      "OPEN FOLLOW-UP QUESTION · CITY OF OULU",
                      "AVOIN JATKOKYSYMYS · OULUN KAUPUNKI",
                    )}
                  </span>
                  <p>{c(item.followUp || followUp)}</p>
                  <span className="badge">
                    {t("Not yet answered", "Ei vielä vastattu")}
                  </span>
                  <small>
                    {t(
                      "Demo: this question has not been sent to the city. No answer is shown until one is received and checked.",
                      "Demo: kysymystä ei ole lähetetty kaupungille. Vastausta ei näytetä ennen kuin se on saatu ja tarkistettu.",
                    )}
                  </small>
                </section>
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
            {item.kind === "published" && (
              <p className="privacy-note">
                {(() => {
                  const n = state.questions.filter(
                    (q) => q.storyId === item.id,
                  ).length;
                  return n
                    ? t(
                        `${n} reader question${n > 1 ? "s" : ""} about this story ${n > 1 ? "are" : "is"} waiting in the private newsroom queue.`,
                        `${n} lukijan kysymys${n > 1 ? "tä" : ""} tästä jutusta odottaa yksityisessä toimitusjonossa.`,
                      )
                    : t(
                        "Something still unclear? Ask the newsroom to explain more.",
                        "Jäikö jotain epäselväksi? Pyydä toimitusta selittämään lisää.",
                      );
                })()}
              </p>
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
              {item.sourceLead ? (
                <>
                  <span className="eyebrow">
                    {t("ORIGINAL SOURCE", "ALKUPERÄINEN LÄHDE")}
                  </span>
                  <a
                    lang="fi"
                    href={item.sourceLead.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Kaleva: {item.sourceLead.title}{" "}
                    <Icon name="external" size={14} />
                  </a>
                  <p>
                    {item.sourceLead.publishedAt
                      ? `${t("Published", "Julkaistu")} ${new Date(item.sourceLead.publishedAt).toLocaleString(lang === "en" ? "en-GB" : "fi-FI", { timeZone: "Europe/Helsinki" })}. `
                      : ""}
                    {t(
                      "Found through Kaleva’s free-news RSS. The original article is Kaleva’s; this brief was written and reviewed in this local demo.",
                      "Löytyi Kalevan maksuttomien uutisten RSS-syötteestä. Alkuperäinen juttu on Kalevan; tämä tiivistys kirjoitettiin ja tarkistettiin tässä paikallisessa demossa.",
                    )}
                  </p>
                </>
              ) : main || item.kind === "published" ? (
                <>
                  <span className="eyebrow">
                    {t("ORIGINAL SOURCE", "ALKUPERÄINEN LÄHDE")}
                  </span>
                  <a href={SOURCE} target="_blank" rel="noreferrer">
                    {t(
                      "City of Oulu: eVaka notice",
                      "Oulun kaupunki: eVaka-tiedote",
                    )}{" "}
                    <Icon name="external" size={14} />
                  </a>
                  <p>
                    {t("Published", "Julkaistu")} {formatDate(SOURCE_PUBLISHED)}{" "}
                    · {t("accessed", "luettu")} {formatDate(SOURCE_ACCESSED)}.{" "}
                    {t(
                      "A City of Oulu notice in English, not a Kaleva article. The Finnish text of this explainer is our translation.",
                      "Oulun kaupungin englanninkielinen tiedote, ei Kalevan juttu. Tämän jutun suomenkielinen teksti on käännöksemme.",
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
                {item.ai
                  ? `${t(
                      `Claude (${item.ai.model}) translated Kaleva’s headline and feed description into English and drafted the relevance note on`,
                      `Claude (${item.ai.model}) käänsi Kalevan otsikon ja syötekuvauksen englanniksi ja luonnosteli merkitysarvion`,
                    )} ${new Date(item.ai.generatedAt).toLocaleDateString(lang === "en" ? "en-GB" : "fi-FI", { timeZone: "Europe/Helsinki" })}. ${t(
                      "The model did not read the full article. A human editor checked the facts and both languages and approved this exact version.",
                      "Malli ei lukenut koko juttua. Ihmistoimittaja tarkisti faktat ja molemmat kieliversiot ja hyväksyi tämän täsmällisen version.",
                    )} ${
                      item.ai.styleRefs?.length
                        ? t(
                            `English phrasing and terminology were guided by ${item.ai.styleRefs.length} historical (2012) Kaleva English-language article${item.ai.styleRefs.length > 1 ? "s" : ""}, used for style only.`,
                            `Englanninkielistä ilmaisua ja termejä ohjasi ${item.ai.styleRefs.length} Kalevan historiallista (2012) englanninkielistä juttua, vain tyyliviitteenä.`,
                          )
                        : t(
                            "Standard translation: no Kaleva English style reference was used.",
                            "Tavallinen käännös: Kalevan englanninkielistä tyyliviitettä ei käytetty.",
                          )
                    }`
                  : item.sourceLead
                    ? t(
                        "No AI was used for this brief. It was written and reviewed by hand.",
                        "Tähän tiivistykseen ei käytetty tekoälyä. Se kirjoitettiin ja tarkistettiin käsin.",
                      )
                    : t(
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
      {view !== "presenter" && (
        <header className="wrap site-header">
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
          <nav aria-label={t("Main navigation", "Päävalikko")}>
            <button
              className={view === "reader" ? "nav-item selected" : "nav-item"}
              onClick={() => navigate("reader")}
              aria-current={view === "reader" ? "page" : undefined}
            >
              {t("Your Oulu", "Sinun Oulusi")}
            </button>
            <button
              className={view === "offers" ? "nav-item selected" : "nav-item"}
              onClick={() => navigate("offers")}
              aria-current={view === "offers" ? "page" : undefined}
            >
              {t("Membership & business", "Jäsenyys ja yritykset")}
            </button>
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
          </nav>
        </header>
      )}
      <div id="main-content" tabIndex={-1} />
      {view === "presenter" ? (
        <PresenterMode
          lang={lang}
          state={state}
          question={
            state.questions.find((q) => q.id === PREPARED_QUESTION_ID) ??
            initialState().questions[0]
          }
          status={questionStatus(
            state.questions.find((q) => q.id === PREPARED_QUESTION_ID) ??
              initialState().questions[0],
            state.stories,
          )}
          answer={answerFor(PREPARED_QUESTION_ID)}
          hasUnsupported={hasUnsupported}
          canApprove={canApprove}
          validApproval={validApproval}
          statusName={statusName}
          actions={{
            support: () => supportQuestion(PREPARED_QUESTION_ID),
            select: () => selectForCoverage(PREPARED_QUESTION_ID),
            setReason,
            openDraft: openSelectedDraft,
            replaceUnsupported,
            editDraft,
            setReview,
            approve: approveDraft,
            publish,
            reset: resetPresenterDemo,
            exit: () => navigate("reader"),
          }}
        />
      ) : view === "ai" ? (
        <main className="wrap ai-view">
          <section className="page-heading">
            <span className="eyebrow">
              {t("AI TRANSPARENCY", "TEKOÄLYN KÄYTTÖ")}
            </span>
            <h1>{t("How we use AI.", "Miten käytämme tekoälyä.")}</h1>
            <p>
              {t(
                "Where AI is used in Kaleva Local, what is rule-based or prepared in advance, and what a person checks before anything is published. Checked against the implementation on 24 Oct 2026.",
                "Missä Kaleva Local käyttää tekoälyä, mikä on sääntöpohjaista tai valmiiksi tehtyä ja mitä ihminen tarkistaa ennen julkaisua. Tarkistettu toteutusta vasten 24.10.2026.",
              )}
            </p>
          </section>
          <div className="ai-legend" aria-label={t("Labels", "Merkinnät")}>
            <span className="badge green">
              {t("Implemented", "Toteutettu")}
            </span>
            <span className="badge">{t("Simulated", "Simuloitu")}</span>
            <span className="badge planned">
              {t("Planned", "Suunnitteilla")}
            </span>
          </div>
          <section className="ai-section">
            <h2>{t("1. AI in the news workflow", "1. Tekoäly uutistyössä")}</h2>
            <ul>
              <li>
                <span className="badge green">
                  {t("Implemented", "Toteutettu")}
                </span>
                <span>
                  <strong>{t("What it reads:", "Mitä se lukee:")}</strong>{" "}
                  {t(
                    "one item from Kaleva’s free RSS feed, meaning the Finnish headline and the short feed description. It does not see the full article. Notes from Kaleva’s English articles from 2012 guide phrasing only, never facts.",
                    "yhden jutun Kalevan maksuttomasta RSS-syötteestä eli suomenkielisen otsikon ja lyhyen syötekuvauksen. Koko artikkelia se ei näe. Kalevan vuoden 2012 englanninkielisistä jutuista tehdyt muistiinpanot ohjaavat vain sanamuotoja, eivät tietosisältöä.",
                  )}
                </span>
              </li>
              <li>
                <span className="badge green">
                  {t("Implemented", "Toteutettu")}
                </span>
                <span>
                  <strong>{t("What it produces:", "Mitä se tuottaa:")}</strong>{" "}
                  {t(
                    "an unpublished draft: an English translation of the headline and description, topics, likely relevance for students and families, missing information and claims the source does not support. The server compares the draft with the source and shows warnings.",
                    "julkaisemattoman luonnoksen: otsikon ja kuvauksen englanninkielisen käännöksen, aiheet, arvion merkityksestä opiskelijoille ja perheille, puuttuvat tiedot sekä väitteet, joita lähde ei tue. Palvelin vertaa luonnosta lähteeseen ja näyttää varoitukset.",
                  )}
                </span>
              </li>
              <li>
                <span className="badge green">
                  {t("Implemented", "Toteutettu")}
                </span>
                <span>
                  <strong>{t("How it runs:", "Miten se toimii:")}</strong>{" "}
                  {t(
                    "Claude (claude-opus-5-5) through the team’s Agent SDK server. Only an editor with the access code can start it, and calls are capped. One real end-to-end generation has succeeded (24 Oct 2026). That is one test, not proven translation quality.",
                    "Claude (claude-opus-5-5) tiimin Agent SDK -palvelimen kautta. Vain pääsykoodin tietävä toimittaja voi käynnistää sen, ja kutsujen määrä on rajattu. Yksi oikea generointi alusta loppuun on onnistunut (24.10.2026). Se on yksi testi, ei näyttö käännösten laadusta.",
                  )}
                </span>
              </li>
            </ul>
          </section>
          <section className="ai-section">
            <h2>
              {t(
                "2. Rule-based or prepared in advance",
                "2. Sääntöpohjaista tai valmiiksi tehtyä",
              )}
            </h2>
            <ul>
              <li>
                <span className="badge green">
                  {t("Implemented", "Toteutettu")}
                </span>
                <span>
                  {t(
                    "News ranking uses fixed rules (keywords, place names, recency), not AI. Every story shows why it ranks where it does.",
                    "Uutisten järjestys perustuu kiinteisiin sääntöihin (avainsanat, paikannimet, tuoreus), ei tekoälyyn. Jokainen juttu näyttää, miksi se on listalla siinä kohdassa.",
                  )}
                </span>
              </li>
              <li>
                <span className="badge green">
                  {t("Implemented", "Toteutettu")}
                </span>
                <span>
                  {t(
                    "Community Radar question checks (length, links, contact details, duplicates) are rules that run in your browser.",
                    "Community Radarin kysymystarkistukset (pituus, linkit, yhteystiedot, kaksoiskappaleet) ovat selaimessa toimivia sääntöjä.",
                  )}
                </span>
              </li>
              <li>
                <span className="badge">{t("Simulated", "Simuloitu")}</span>
                <span>
                  {t(
                    "The eVaka demo draft, in English and Finnish, was written by the team in advance. It is not output from the AI assistant.",
                    "eVaka-demon luonnos englanniksi ja suomeksi on tiimin etukäteen kirjoittama. Se ei ole tekoälyavustajan tuottama.",
                  )}
                </span>
              </li>
              <li>
                <span className="badge">{t("Simulated", "Simuloitu")}</span>
                <span>
                  {t(
                    "The sample questions, the parent who asks and the editor Alex North are fictional. Supports, statuses and publications are stored only in this browser.",
                    "Esimerkkikysymykset, kysymyksen esittänyt vanhempi ja toimittaja Alex North ovat kuvitteellisia. Tuet, tilat ja julkaisut tallentuvat vain tähän selaimeen.",
                  )}
                </span>
              </li>
            </ul>
          </section>
          <section className="ai-section">
            <h2>
              {t(
                "3. What a person checks before publishing",
                "3. Mitä ihminen tarkistaa ennen julkaisua",
              )}
            </h2>
            <ul>
              <li>
                <span className="badge green">
                  {t("Implemented", "Toteutettu")}
                </span>
                <span>
                  {t(
                    "Approval stays blocked while the draft has an unsupported claim or an [EDITOR] placeholder.",
                    "Hyväksyntä on estetty niin kauan kuin luonnoksessa on lähteen tukematon väite tai [TOIMITTAJA]-paikkamerkki.",
                  )}
                </span>
              </li>
              <li>
                <span className="badge green">
                  {t("Implemented", "Toteutettu")}
                </span>
                <span>
                  {t(
                    "The editor must tick both a fact review and a language review, then approve that exact version. Any edit cancels the approval. Nothing is published automatically.",
                    "Toimittajan on merkittävä sekä faktojen että kielen tarkistus ja hyväksyttävä juuri se versio. Jokainen muokkaus kumoaa hyväksynnän. Mitään ei julkaista automaattisesti.",
                  )}
                </span>
              </li>
              <li>
                <span className="badge">{t("Simulated", "Simuloitu")}</span>
                <span>
                  {t(
                    "In this demo the checks run in the browser and the editor is fictional. Kaleva journalists have not reviewed anything here.",
                    "Tässä demossa tarkistukset tehdään selaimessa ja toimittaja on kuvitteellinen. Kalevan toimittajat eivät ole tarkistaneet tämän sivuston sisältöä.",
                  )}
                </span>
              </li>
              <li>
                <span className="badge planned">
                  {t("Planned", "Suunnitteilla")}
                </span>
                <span>
                  {t(
                    "For a real pilot: Kaleva’s permission for AI processing, personal editor accounts, publishing checked on the server, and a wider test of translation quality.",
                    "Oikeaa pilottia varten: Kalevan lupa tekoälykäsittelyyn, henkilökohtaiset toimittajatunnukset, palvelimella tarkistettu julkaisu ja laajempi käännösten laadun testi.",
                  )}
                </span>
              </li>
            </ul>
          </section>
          <section className="ai-section">
            <h2>
              {t(
                "4. How AI helped build this project",
                "4. Miten tekoäly auttoi projektin tekemisessä",
              )}
            </h2>
            <ul>
              <li>
                <span>
                  <strong>{t("Planning:", "Suunnittelu:")}</strong>{" "}
                  {t(
                    "the team used ChatGPT for ideas and planning.",
                    "tiimi käytti ChatGPT:tä ideointiin ja suunnitteluun.",
                  )}
                </span>
              </li>
              <li>
                <span>
                  <strong>{t("Programming:", "Ohjelmointi:")}</strong>{" "}
                  {t(
                    "most of the app’s code and interface text was written with Claude Code (Claude Opus 5.5), which is credited as co-author in the commits. The team also used other AI coding assistants, including for the Agent SDK server.",
                    "suurin osa sovelluksen koodista ja käyttöliittymäteksteistä tehtiin Claude Codella (Claude Opus 5.5), joka on merkitty commiteissa toiseksi tekijäksi. Tiimi käytti myös muita tekoälyavusteisia ohjelmointityökaluja, myös Agent SDK -palvelimen tekemisessä.",
                  )}
                </span>
              </li>
              <li>
                <span>
                  <strong>{t("Materials:", "Materiaalit:")}</strong>{" "}
                  {t(
                    "the pitch decks and the pitch script were made with AI help.",
                    "pitch-esitykset ja puheen käsikirjoitus tehtiin tekoälyn avulla.",
                  )}
                </span>
              </li>
              <li>
                <span>
                  <strong>{t("Responsibility:", "Vastuu:")}</strong>{" "}
                  {t(
                    "the team made the product decisions and is responsible for the content. Code changes are checked with automated tests.",
                    "tiimi teki tuotepäätökset ja vastaa sisällöstä. Koodimuutokset tarkistetaan automaattisilla testeillä.",
                  )}
                </span>
              </li>
            </ul>
          </section>
          <button className="primary" onClick={() => navigate("reader")}>
            {t("Back to Oulu", "Takaisin Ouluun")}
          </button>
        </main>
      ) : view === "notfound" ? (
        <main className="wrap page-heading not-found">
          <span className="eyebrow">404</span>
          <h1>{t("This page is not here.", "Tätä sivua ei löytynyt.")}</h1>
          <p>
            {t(
              "Return to the Oulu reader view to continue.",
              "Jatka palaamalla Oulun lukijanäkymään.",
            )}
          </p>
          <button className="primary" onClick={() => navigate("reader")}>
            {t("Back to Oulu", "Takaisin Ouluun")}
          </button>
        </main>
      ) : view === "reader" ? (
        story ? (
          renderStory()
        ) : (
          <main className="wrap reader-view">
            <section className="section-intro dashboard-intro">
              <h1>
                {t(
                  "Your Oulu. Your news. Your voice.",
                  "Sinun Oulusi. Sinun uutisesi. Sinun äänesi.",
                )}
              </h1>
              <p className="intro-sub">
                {t(
                  "Understand local news, ask what matters, and get answers you can trust.",
                  "Ymmärrä paikalliset uutiset, kysy tärkeistä asioista ja saa vastauksia, joihin voit luottaa.",
                )}
              </p>
            </section>
            <div className="dashboard">
              <div className="dashboard-news">
                <NewsFeed
                  lang={lang}
                  group={group}
                  onGroup={setGroup}
                  onQueue={queueSource}
                  onOpenNewsroom={() => navigate("newsroom")}
                  explained={Object.fromEntries(
                    state.stories.flatMap((x) =>
                      x.sourceLead ? [[x.sourceLead.url, x.id]] : [],
                    ),
                  )}
                  onRead={(id) => {
                    const found = state.stories.find((x) => x.id === id);
                    if (found) showStory(found);
                  }}
                  queuedUrls={state.questions.flatMap((q) =>
                    q.source ? [q.source.url] : [],
                  )}
                />
              </div>
              <aside className="dashboard-side">
                <section
                  className="community-card radar"
                  id="community-radar"
                  aria-labelledby="radar-title"
                >
                  <span className="eyebrow">COMMUNITY RADAR</span>
                  <h2 id="radar-title">
                    {t(
                      "Ask what matters. Shape what gets covered.",
                      "Kysy tärkeistä asioista. Vaikuta siihen, mitä selvitetään.",
                    )}
                  </h2>
                  <ul className="radar-list">
                    {[
                      ...state.questions.filter(
                        (q) => q.id === PREPARED_QUESTION_ID,
                      ),
                      ...state.questions.filter(
                        (q) => q.id !== PREPARED_QUESTION_ID && !q.private,
                      ),
                      ...state.questions.filter((q) => q.private).slice(-3),
                    ].map((q, i) => {
                      const answer = answerFor(q.id);
                      const item = (
                        <li key={q.id} className="community-question">
                          <span className="micro-label">
                            {q.private
                              ? q.source
                                ? t(
                                    "YOUR QUESTION ABOUT A KALEVA STORY · ONLY VISIBLE TO YOU",
                                    "KYSYMYKSESI KALEVAN JUTUSTA · NÄKYY VAIN SINULLE",
                                  )
                                : t(
                                    "YOUR QUESTION · ONLY VISIBLE TO YOU",
                                    "KYSYMYKSESI · NÄKYY VAIN SINULLE",
                                  )
                              : t(
                                  "ILLUSTRATIVE READER QUESTION",
                                  "HAVAINNOLLISTAVA LUKIJAKYSYMYS",
                                )}
                            {q.persona && ` · ${c(q.persona).toUpperCase()}`}
                          </span>
                          <h3>{c(q.text)}</h3>
                          {q.id === PREPARED_QUESTION_ID && (
                            <p className="radar-why">{c(evakaInsight.why)}</p>
                          )}
                          <div className="radar-row">
                            {statusPill(q)}
                            {!q.private && (
                              <button
                                className={`support-button ${q.supported ? "supported" : ""}`}
                                disabled={q.supported}
                                onClick={() => supportQuestion(q.id)}
                              >
                                <Icon
                                  name={q.supported ? "check" : "plus"}
                                  size={14}
                                />
                                {q.supported
                                  ? t("Supported", "Tuettu")
                                  : t(
                                      "I wonder this too",
                                      "Minäkin mietin tätä",
                                    )}
                                <span>{q.supports}</span>
                              </button>
                            )}
                          </div>
                          {answer && (
                            <button
                              className="text-button"
                              onClick={() => showStory(answer)}
                            >
                              {t(
                                "Read the checked answer",
                                "Lue tarkistettu vastaus",
                              )}{" "}
                              <Icon name="arrow" size={14} />
                            </button>
                          )}
                          {q.id === PREPARED_QUESTION_ID && (
                            <button
                              className="text-button lead-open"
                              onClick={() => showStory("main")}
                            >
                              {t(
                                "Background: what the city’s notice says (concept explainer)",
                                "Taustaa: mitä kaupungin tiedote kertoo (konseptijuttu)",
                              )}{" "}
                              <Icon name="arrow" size={14} />
                            </button>
                          )}
                        </li>
                      );
                      return i === 0 || q.private ? item : null;
                    })}
                  </ul>
                  {(() => {
                    const rest = state.questions.filter(
                      (q) => q.id !== PREPARED_QUESTION_ID && !q.private,
                    );
                    return rest.length > 0 ? (
                      <details className="radar-more">
                        <summary>
                          {t(
                            `More sample questions (${rest.length})`,
                            `Lisää esimerkkikysymyksiä (${rest.length})`,
                          )}
                        </summary>
                        <ul className="radar-list">
                          {rest.map((q) => {
                            const answer = answerFor(q.id);
                            return (
                              <li key={q.id} className="community-question">
                                <span className="micro-label">
                                  {q.private
                                    ? q.source
                                      ? t(
                                          "YOUR QUESTION ABOUT A KALEVA STORY · ONLY VISIBLE TO YOU",
                                          "KYSYMYKSESI KALEVAN JUTUSTA · NÄKYY VAIN SINULLE",
                                        )
                                      : t(
                                          "YOUR QUESTION · ONLY VISIBLE TO YOU",
                                          "KYSYMYKSESI · NÄKYY VAIN SINULLE",
                                        )
                                    : t(
                                        "ILLUSTRATIVE READER QUESTION",
                                        "HAVAINNOLLISTAVA LUKIJAKYSYMYS",
                                      )}
                                </span>
                                <h3>{c(q.text)}</h3>
                                <div className="radar-row">
                                  {statusPill(q)}
                                  {!q.private && (
                                    <button
                                      className={`support-button ${q.supported ? "supported" : ""}`}
                                      disabled={q.supported}
                                      onClick={() => supportQuestion(q.id)}
                                    >
                                      <Icon
                                        name={q.supported ? "check" : "plus"}
                                        size={14}
                                      />
                                      {q.supported
                                        ? t("Supported", "Tuettu")
                                        : t(
                                            "I wonder this too",
                                            "Minäkin mietin tätä",
                                          )}
                                      <span>{q.supports}</span>
                                    </button>
                                  )}
                                </div>
                                {answer && (
                                  <button
                                    className="text-button"
                                    onClick={() => showStory(answer)}
                                  >
                                    {t(
                                      "Read the checked answer",
                                      "Lue tarkistettu vastaus",
                                    )}{" "}
                                    <Icon name="arrow" size={14} />
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    ) : null;
                  })()}
                  <button
                    className="primary full"
                    onClick={() => setModal("question")}
                  >
                    {t("Ask a question", "Lähetä kysymys")}
                    <Icon name="arrow" size={16} />
                  </button>
                  <small className="radar-note">
                    {t(
                      "Sample questions are illustrative. Support counts in this browser only. An editor decides what to investigate; your question stays private.",
                      "Esimerkkikysymykset ovat havainnollistavia. Tuki lasketaan vain tässä selaimessa. Toimittaja päättää, mitä selvitetään; kysymyksesi pysyy yksityisenä.",
                    )}
                  </small>
                </section>
                <section
                  className="verified-answers"
                  aria-labelledby="answers-title"
                >
                  <span className="eyebrow">
                    {t("VERIFIED ANSWERS", "TARKISTETUT VASTAUKSET")}
                  </span>
                  <h2 id="answers-title">
                    {t(
                      "Checked against sources, reviewed by an editor",
                      "Lähteistä tarkistettu, toimittajan hyväksymä",
                    )}
                  </h2>
                  {state.stories.length === 0 ? (
                    <p className="answers-empty">
                      {t(
                        "No verified answers yet. When an editor publishes a checked answer to a community question, it appears here.",
                        "Tarkistettuja vastauksia ei vielä ole. Kun toimittaja julkaisee tarkistetun vastauksen yhteisön kysymykseen, se näkyy tässä.",
                      )}
                    </p>
                  ) : (
                    <div className="published-section">
                      {[...state.stories]
                        .sort(
                          (a, b) =>
                            Number(!!b.questionId) - Number(!!a.questionId),
                        )
                        .slice(0, 3)
                        .map((item, i) => {
                          const l: Lang = i === 0 ? answerLang : lang;
                          const excerpt = item.body[l].split("\n\n")[0];
                          return (
                            <article
                              key={item.id}
                              className={`answer-item ${i === 0 ? "featured" : ""}`}
                              lang={l}
                            >
                              {i === 0 && (
                                <div
                                  className="answer-lang"
                                  role="group"
                                  aria-label="Language / Kieli"
                                >
                                  {(["en", "fi"] as Lang[]).map((x) => (
                                    <button
                                      key={x}
                                      aria-pressed={answerLang === x}
                                      className={
                                        answerLang === x ? "active" : ""
                                      }
                                      onClick={() => setAnswerLang(x)}
                                    >
                                      {x.toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                              )}
                              <h3>{item.title[l]}</h3>
                              {item.question && (
                                <p className="answer-question">
                                  {l === "en" ? "Answers: " : "Vastaa: "}“
                                  {item.question[l]}”
                                </p>
                              )}
                              {i === 0 && (
                                <p className="answer-excerpt">
                                  {excerpt.length > 280
                                    ? `${excerpt.slice(0, 277)}…`
                                    : excerpt}
                                </p>
                              )}
                              <p className="answer-trust">
                                {item.sourceLead ? (
                                  <a
                                    href={item.sourceLead.url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {l === "en"
                                      ? "Source: Kaleva ↗"
                                      : "Lähde: Kaleva ↗"}
                                  </a>
                                ) : (
                                  <a
                                    href={SOURCE}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {l === "en"
                                      ? "Source: City of Oulu notice (not a Kaleva article) ↗"
                                      : "Lähde: Oulun kaupungin tiedote (ei Kalevan juttu) ↗"}
                                  </a>
                                )}
                                <span>
                                  {item.ai
                                    ? l === "en"
                                      ? "AI-assisted, then fact- and language-checked in this browser by a fictional demo editor. Not reviewed by Kaleva journalists."
                                      : "Tekoälyn avustama, faktat ja kieli tarkistettu tässä selaimessa kuvitteellisen demotoimittajan toimesta. Ei Kalevan toimittajien tarkistama."
                                    : l === "en"
                                      ? "Fact- and language-checked in this browser by a fictional demo editor. Not reviewed by Kaleva journalists."
                                      : "Faktat ja kieli tarkistettu tässä selaimessa kuvitteellisen demotoimittajan toimesta. Ei Kalevan toimittajien tarkistama."}
                                </span>
                              </p>
                              <button
                                className="text-button card-open"
                                onClick={() => showStory(item)}
                              >
                                {l === "en"
                                  ? "Read the full answer"
                                  : "Lue koko vastaus"}{" "}
                                <Icon name="arrow" size={14} />
                              </button>
                            </article>
                          );
                        })}
                    </div>
                  )}
                </section>
              </aside>
            </div>
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
            <h1>
              {t(
                "Support independent local reporting.",
                "Tue riippumatonta paikallisjournalismia.",
              )}
            </h1>
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
          <section className="value-for-kaleva" aria-labelledby="value-title">
            <h2 id="value-title">
              {t("What Kaleva could gain", "Mitä Kaleva voisi saada")}
            </h2>
            <ol className="value-grid">
              {[
                [
                  t("Audience growth", "Uusi yleisö"),
                  t(
                    "Reach international residents who may not use Kaleva today, with journalism Kaleva already produces.",
                    "Tavoita kansainvälisiä asukkaita, jotka eivät ehkä käytä Kalevaa nyt, journalismilla, jota Kaleva jo tekee.",
                  ),
                ],
                [
                  t("Editorial insight", "Toimituksellinen näkymä"),
                  t(
                    "Community questions reveal unmet local information needs that also matter to Finnish-speaking readers.",
                    "Yhteisön kysymykset paljastavat paikallisia tiedontarpeita, joilla on merkitystä myös suomenkielisille lukijoille.",
                  ),
                ],
                [
                  t("New revenue potential", "Uusi tulomahdollisuus"),
                  t(
                    "Test one employer-funded pilot for companies hiring international professionals. A hypothesis, not confirmed demand.",
                    "Testaa yksi työnantajan rahoittama pilotti kansainvälisiä osaajia palkkaaville yrityksille. Hypoteesi, ei vahvistettu kysyntä.",
                  ),
                ],
              ].map(([h, p]) => (
                <li key={h}>
                  <strong>{h}</strong>
                  <p>{p}</p>
                </li>
              ))}
            </ol>
            <p className="privacy-note">
              {t(
                "Evidence so far: one interview. One international resident we spoke to did not know Kaleva existed and got local information mainly through WhatsApp, Instagram, TikTok, Google and Yle. One interview is a lead to test, not market evidence.",
                "Näyttö tähän mennessä: yksi haastattelu. Haastattelemamme kansainvälinen asukas ei tiennyt Kalevan olemassaolosta ja sai paikallistietonsa lähinnä WhatsAppista, Instagramista, TikTokista, Googlesta ja Yleltä. Yksi haastattelu on testattava vihje, ei markkinanäyttöä.",
              )}
            </p>
          </section>
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
                  "An Oulu briefing for your international team.",
                  "Oulu-viikkokirje kansainväliselle tiimillesi.",
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
              {state.pilotInterests.length > 0 && (
                <p className="persistent-success" role="status">
                  {t(
                    "Pilot interest recorded in this browser. No request has been sent.",
                    "Pilottikiinnostus tallennettu tähän selaimeen. Pyyntöä ei ole lähetetty.",
                  )}
                </p>
              )}
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
                  "Preview of a clearly separated local ad placement. Fictional advertiser, no booking.",
                  "Esikatselu selvästi erotetusta paikallismainoksesta. Kuvitteellinen mainostaja, ei varausta.",
                )}
              </small>
            </div>
          </section>
          <section className="pilot-evaluation">
            <h2>
              {t(
                "What the six-week pilot must prove",
                "Mitä kuuden viikon pilotin pitää osoittaa",
              )}
            </h2>
            <div className="evaluation-grid">
              <div>
                <h3>
                  {t("Build it with the community", "Rakenna yhteisön kanssa")}
                </h3>
                <p>
                  {t(
                    "Proposed recruitment: invite international workers, family members and students to separate listening sessions. Ask participants to choose useful topics and review whether explanations make sense. No community partner is confirmed.",
                    "Ehdotettu rekrytointi: kutsu kansainvälisiä työntekijöitä, perheenjäseniä ja opiskelijoita erillisiin kuuntelutilaisuuksiin. Pyydä osallistujia valitsemaan hyödyllisiä aiheita ja arvioimaan selitysten ymmärrettävyyttä. Yhteisökumppaneita ei ole vahvistettu.",
                  )}
                </p>
              </div>
              <div>
                <h3>
                  {t(
                    "Meet people where they are",
                    "Tavoita ihmiset heidän arjessaan",
                  )}
                </h3>
                <p>
                  {t(
                    "Start with a mobile web link: no app installation and essential sources stay open. English serves the first selected audience; Finnish lets their questions reach local readers too. Ask the pilot group which distribution channel they actually use before building delivery.",
                    "Aloita mobiiliverkon linkistä: sovellusta ei tarvitse asentaa ja olennaiset lähteet pysyvät avoimina. Englanti palvelee ensimmäistä kohderyhmää; suomi tuo sen kysymykset myös paikallisten luettaviksi. Selvitä pilotissa käytetyt jakelukanavat ennen lähetysjärjestelmän rakentamista.",
                  )}
                </p>
              </div>
              <div>
                <h3>
                  {t(
                    "Measure the cost of trust",
                    "Mittaa luottamuksen kustannus",
                  )}
                </h3>
                <p>
                  {t(
                    "Track reporting, source checks, both language reviews, corrections, support and hosting. The €900 test fee must cover the total six-week delivery cost before a margin exists. Costs are not yet measured. Compare repeat use and trust by reader group; a simulated checkout is not willingness to pay.",
                    "Kirjaa tiedonhankinta, lähdetarkistus, molempien kielten tarkistus, oikaisut, tuki ja ylläpito. 900 euron testihinnan pitää kattaa koko kuuden viikon toimituskustannus ennen katetta. Kuluja ei ole vielä mitattu. Vertaa toistuvaa käyttöä ja luottamusta lukijaryhmittäin; simuloitu kassa ei todista maksuhalukkuutta.",
                  )}
                </p>
              </div>
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
          <section className="more-stories">
            <div className="section-title">
              <h2>
                {t("Ideas for future coverage", "Ideoita tuleviin juttuihin")}
              </h2>
              <span>
                {t("Demo scenarios, not news", "Demoesimerkkejä, ei uutisia")}
              </span>
            </div>
            <div className="story-grid">
              {[...scenarios, briefingPreview].map((item) => (
                <StoryCard key={item.id} item={item} />
              ))}
            </div>
          </section>
          {editorialPromise}
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
            <div className="sim-notice" role="note">
              <strong>
                {t(
                  "Newsroom simulation, open to anyone with the link",
                  "Toimitussimulaatio, avoin kaikille, joilla on linkki",
                )}
              </strong>
              <p>
                {t(
                  "There is no sign-in. Everything you select, approve or publish here is stored only in this browser and never reaches other readers or Kaleva. The only server-side protection is the editor access code for the paid AI step. A real newsroom would need individual editor accounts and server-checked publishing.",
                  "Sisäänkirjautumista ei ole. Kaikki täällä valittu, hyväksytty tai julkaistu tallentuu vain tähän selaimeen eikä näy muille lukijoille tai Kalevalle. Ainoa palvelimen suojaus on toimittajan pääsykoodi maksulliseen AI-vaiheeseen. Oikea toimitus tarvitsisi henkilökohtaiset toimittajatunnukset ja palvelimen tarkistaman julkaisun.",
                )}
              </p>
              <div className="sim-notice-actions">
                <button
                  className="text-button"
                  onClick={() => navigate("presenter")}
                >
                  {t("Open Presenter Mode →", "Avaa esittäjänäkymä →")}
                </button>
                <button
                  className="text-button"
                  onClick={() => setModal("reset")}
                >
                  {t("Reset demo to the start ↻", "Palauta demo alkuun ↻")}
                </button>
              </div>
            </div>
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
          <LiveSources
            lang={lang}
            onQueue={queueSource}
            queuedUrls={state.questions.flatMap((q) =>
              q.source ? [q.source.url] : [],
            )}
          />
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
                    {q.persona && ` · ${c(q.persona).toUpperCase()}`}
                  </span>
                  <h3>{c(q.text)}</h3>
                  {statusPill(q)}
                  {q.kind === "observation" && (
                    <span className="badge">
                      {t(
                        "Unverified community observation",
                        "Tarkistamaton yhteisön havainto",
                      )}
                    </span>
                  )}
                  {q.storyId && (
                    <p className="source-lead">
                      {t("Follow-up to: ", "Jatkokysymys jutusta: ")}
                      {c(
                        q.storyId === "main"
                          ? title
                          : (state.stories.find((x) => x.id === q.storyId)
                              ?.title ?? {
                              en: "a story no longer in this demo",
                              fi: "juttu, jota ei enää ole demossa",
                            }),
                      )}
                    </p>
                  )}
                  {q.source && (
                    <p className="source-lead">
                      <a href={q.source.url} target="_blank" rel="noreferrer">
                        {t("Inspect source ↗", "Tarkista lähde ↗")}
                      </a>
                      <br />
                      {t(
                        "Unreported lead. A new source-based draft is required; the prepared eVaka draft cannot answer this item.",
                        "Selvittämätön vihje. Tarvitaan uusi lähteisiin perustuva juttu; valmis eVaka-luonnos ei vastaa tähän aiheeseen.",
                      )}
                    </p>
                  )}
                  <div>
                    <span>
                      {q.supports}{" "}
                      {t("local demo supports", "paikallista demotukea")}
                    </span>
                    <button
                      className="text-button"
                      onClick={() => selectForCoverage(q.id)}
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
                  "OFFICIAL SOURCE · DATED SERVICE CHANGE",
                  "VIRALLINEN LÄHDE · PÄIVÄTTY PALVELUMUUTOS",
                )}
              </span>
              <h3>
                {t(
                  "City of Oulu: eVaka notice",
                  "Oulun kaupunki: eVaka-tiedote",
                )}
              </h3>
              <p>{c(background)}</p>
              <a href={SOURCE} target="_blank" rel="noreferrer">
                {t("Inspect original notice", "Tarkista alkuperäinen tiedote")}{" "}
                <Icon name="external" size={14} />
              </a>
              <small>
                {t("Published", "Julkaistu")} {formatDate(SOURCE_PUBLISHED)} ·{" "}
                {t("accessed", "luettu")} {formatDate(SOURCE_ACCESSED)}
              </small>
              <blockquote lang="en">
                “On iPhone, notifications work only when eVaka is opened from
                the home screen icon.”
              </blockquote>
              <small>
                {t(
                  "Short source excerpt, in its original language.",
                  "Lyhyt lähdeote alkuperäisellä kielellä.",
                )}
              </small>
              <p className="privacy-note">
                {t(
                  "Historical background only, not evidence for this story: ",
                  "Vain historiallista taustaa, ei tämän jutun todiste: ",
                )}
                <a href={HISTORICAL_SOURCE} target="_blank" rel="noreferrer">
                  {t(
                    "International House Oulu survey, spring 2024",
                    "International House Oulun kysely, kevät 2024",
                  )}{" "}
                  ↗
                </a>
              </p>
              <hr />
              <h3>{t("Relevance editor", "Aihevalinta")}</h3>
              <label>
                {t(
                  "Reader need this story serves",
                  "Jutun palvelema lukijatarve",
                )}
                <select
                  value={state.readerNeed}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      readerNeed: e.target.value,
                      approval: null,
                      fact: false,
                      language: false,
                    }))
                  }
                >
                  {readerNeeds.map((need) => (
                    <option key={need.id} value={need.id}>
                      {need[lang]}
                    </option>
                  ))}
                </select>
              </label>
              <small>
                {t(
                  "Kaleva Media’s six reader needs guide the editorial choice. Community support alone never decides publication.",
                  "Kaleva Median kuusi lukijatarvetta ohjaavat aihevalintaa. Yhteisön kannatus ei yksin ratkaise julkaisemista.",
                )}
              </small>
              {selectedQuestion ? (
                <section className="insight" aria-labelledby="insight-title">
                  <h3 id="insight-title">
                    {t("Community Insight", "Yhteisön näkökulma")}
                  </h3>
                  <p className="insight-question">{c(selectedQuestion.text)}</p>
                  <dl>
                    <dt>{t("1 · Community need", "1 · Tiedontarve")}</dt>
                    <dd>
                      {selectedQuestion.id === PREPARED_QUESTION_ID
                        ? c(evakaInsight.need)
                        : t(
                            "As asked by the reader above; not yet assessed by an editor.",
                            "Kuten lukija yllä kysyy; toimittaja ei ole vielä arvioinut.",
                          )}
                    </dd>
                    {selectedQuestion.id === PREPARED_QUESTION_ID && (
                      <>
                        <dt>
                          {t("2 · Audience affected", "2 · Keitä asia koskee")}{" "}
                          <span className="insight-tag">
                            {t("editorial assessment", "toimituksen arvio")}
                          </span>
                        </dt>
                        <dd>{c(evakaInsight.audience)}</dd>
                      </>
                    )}
                    <dt>
                      {t("3 · Community signal", "3 · Yhteisön signaali")}
                    </dt>
                    <dd>
                      {t(
                        `${selectedQuestion.supports} support${selectedQuestion.supports === 1 ? "" : "s"} in this browser`,
                        `${selectedQuestion.supports} tukea tässä selaimessa`,
                      )}
                      {!selectedQuestion.private &&
                        t(
                          " · illustrative seeded question",
                          " · havainnollistava esimerkkikysymys",
                        )}
                      {t(
                        ". A signal, not a decision.",
                        ". Signaali, ei päätös.",
                      )}
                    </dd>
                    <dt>
                      {t("4 · Verified evidence", "4 · Tarkistettu näyttö")}
                    </dt>
                    <dd>
                      {selectedQuestion.id === PREPARED_QUESTION_ID ? (
                        <>
                          <ul>
                            {evakaInsight.evidence.map((i) => (
                              <li key={i}>{c(knownClaims[i])}</li>
                            ))}
                          </ul>
                          <a href={SOURCE} target="_blank" rel="noreferrer">
                            {t(
                              "City of Oulu notice, 14 Oct 2026 (not a Kaleva article)",
                              "Oulun kaupungin tiedote 14.10.2026 (ei Kalevan juttu)",
                            )}{" "}
                            ↗
                          </a>
                        </>
                      ) : selectedQuestion.source ? (
                        t(
                          "Only Kaleva’s headline and feed summary. The editor must read the full article.",
                          "Vain Kalevan otsikko ja syötekuvaus. Toimittajan pitää lukea koko juttu.",
                        )
                      ) : (
                        t(
                          "No verified source yet. New reporting is required.",
                          "Tarkistettua lähdettä ei vielä ole. Tarvitaan uutta tiedonhankintaa.",
                        )
                      )}
                    </dd>
                    {selectedQuestion.id === PREPARED_QUESTION_ID && (
                      <>
                        <dt>{t("5 · Reporting gap", "5 · Avoin kysymys")}</dt>
                        <dd>
                          <ul>
                            {evakaInsight.gaps.map((i) => (
                              <li key={i}>{c(unknowns[i])}</li>
                            ))}
                          </ul>
                        </dd>
                        <dt>
                          {t(
                            "6 · Cross-community value",
                            "6 · Hyöty molemmille kieliryhmille",
                          )}{" "}
                          <span className="insight-tag">
                            {t("editorial assessment", "toimituksen arvio")}
                          </span>
                        </dt>
                        <dd>{c(evakaInsight.crossCommunity)}</dd>
                      </>
                    )}
                  </dl>
                </section>
              ) : (
                <p>
                  {t(
                    "Select a question from the queue.",
                    "Valitse kysymys jonosta.",
                  )}
                </p>
              )}
              <label>
                {t(
                  "Why this question deserves coverage",
                  "Miksi aihe ansaitsee käsittelyn",
                )}
                <textarea
                  value={state.reason}
                  maxLength={700}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t(
                    "Explain the public interest and the limits of the source.",
                    "Perustele yleinen etu ja lähteen rajoitukset.",
                  )}
                />
              </label>
              {state.selected === PREPARED_QUESTION_ID && (
                <button
                  className="text-button"
                  onClick={() => setReason(c(evakaInsight.reason))}
                >
                  {t(
                    "Use the Community Insight as the reason (editable)",
                    "Käytä yhteisön näkökulmaa perusteluna (muokattavissa)",
                  )}
                </button>
              )}
              <p className="privacy-note" id="prepared-draft-scope">
                {selectedQuestion?.source
                  ? t(
                      "Source lead: opens a brief built only from Kaleva’s headline, date and feed description. The editor must read the full article and replace every [EDITOR] note before review.",
                      "Lähdevihje: avaa pohjan, jossa on vain Kalevan otsikko, päiväys ja syötteen kuvaus. Toimittajan pitää lukea koko juttu ja korvata jokainen [TOIMITTAJA]-kohta ennen tarkistusta.",
                    )
                  : state.selected && state.selected !== PREPARED_QUESTION_ID
                    ? t(
                        "This question needs new reporting. The prepared draft answers only the eVaka notification question.",
                        "Tämä kysymys vaatii uutta tiedonhankintaa. Valmis luonnos vastaa vain eVaka-ilmoituksia koskevaan kysymykseen.",
                      )
                    : t(
                        "The prepared draft answers only the eVaka notification question, using the city’s notice. Other questions need new reporting.",
                        "Valmis luonnos vastaa vain eVaka-ilmoituksia koskevaan kysymykseen kaupungin tiedotteen pohjalta. Muut kysymykset vaativat uutta tiedonhankintaa.",
                      )}
              </p>
              <button
                className="primary"
                aria-describedby="prepared-draft-scope"
                disabled={
                  (state.selected !== PREPARED_QUESTION_ID &&
                    !selectedQuestion?.source) ||
                  state.reason.trim().length < 10
                }
                onClick={openSelectedDraft}
              >
                {selectedQuestion?.source
                  ? t("Open source brief", "Avaa lähdepohja")
                  : t("Open prepared draft", "Avaa valmis luonnos")}{" "}
                <Icon name="arrow" />
              </button>
            </section>
          </div>
          {draftOpen && (
            <section className="panel draft-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">
                    {state.ai[state.draftFor]
                      ? t(
                          "AI-ASSISTED DRAFT · HUMAN DECISION",
                          "AI-AVUSTEINEN LUONNOS · IHMISEN PÄÄTÖS",
                        )
                      : draftLead
                        ? t(
                            "SOURCE BRIEF · HUMAN DECISION",
                            "LÄHDEPOHJA · IHMISEN PÄÄTÖS",
                          )
                        : t(
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
              {draftLead && (
                <AssistantPanel
                  key={state.draftFor}
                  lang={lang}
                  lead={draftLead}
                  existing={state.ai[state.draftFor]}
                  onDraft={(d, cached) =>
                    applyAiDraft(state.draftFor, d, cached)
                  }
                />
              )}
              {draftLead ? (
                <div className="claim-list">
                  <div>
                    <Icon name="check" />
                    <span lang="fi">{draftLead.title}</span>
                    <a href={draftLead.url} target="_blank" rel="noreferrer">
                      {t("Kaleva article", "Kalevan juttu")} ↗
                    </a>
                  </div>
                  <div>
                    <Icon name="check" />
                    <span>
                      {t(
                        "Feed date and description",
                        "Syötteen päiväys ja kuvaus",
                      )}
                      {draftLead.description
                        ? ""
                        : t(" (no description)", " (ei kuvausta)")}
                    </span>
                    <b>{t("FROM RSS", "RSS-SYÖTTEESTÄ")}</b>
                  </div>
                  {state.ai[state.draftFor] && (
                    <div className="unknown">
                      <strong>AI</strong>
                      <span>
                        {t(
                          "English headline, description and relevance note: machine-generated from the feed text only. Compare with the Finnish source.",
                          "Englanninkielinen otsikko, kuvaus ja merkitysarvio: kone tuottanut pelkästä syötetekstistä. Vertaa suomenkieliseen lähteeseen.",
                        )}
                      </span>
                      <b>
                        {t("NEEDS HUMAN REVIEW", "VAATII IHMISTARKISTUKSEN")}
                      </b>
                    </div>
                  )}
                  <div className="unknown">
                    <strong>?</strong>
                    <span>
                      {t(
                        "Full article content: not read by this system. The editor must open and read it.",
                        "Jutun koko sisältö: järjestelmä ei lue sitä. Toimittajan pitää avata ja lukea se.",
                      )}
                    </span>
                    <b>{t("NOT IN FEED", "EI SYÖTTEESSÄ")}</b>
                  </div>
                  <div className={hasPlaceholders ? "unsupported" : "resolved"}>
                    <strong>{hasPlaceholders ? "!" : "✓"}</strong>
                    <span>
                      {t(
                        "Editor notes in the draft",
                        "Toimittajan merkinnät luonnoksessa",
                      )}
                    </span>
                    <b>
                      {hasPlaceholders
                        ? t(
                            "UNFINISHED · BLOCKS PUBLICATION",
                            "KESKEN · ESTÄÄ JULKAISUN",
                          )
                        : t("REPLACED", "KORVATTU")}
                    </b>
                  </div>
                </div>
              ) : (
                <div className="claim-list">
                  {knownClaims.map((claim) => (
                    <div key={claim.en}>
                      <Icon name="check" />
                      <span>{c(claim)}</span>
                      <a href={SOURCE} target="_blank" rel="noreferrer">
                        {t("City notice", "Tiedote")} ↗
                      </a>
                    </div>
                  ))}
                  {unknowns.map((gap) => (
                    <div key={gap.en} className="unknown">
                      <strong>?</strong>
                      <span>{c(gap)}</span>
                      <b>{t("NOT IN SOURCE", "EI LÄHTEESSÄ")}</b>
                    </div>
                  ))}
                  <div className={hasUnsupported ? "unsupported" : "resolved"}>
                    <strong>{hasUnsupported ? "!" : "✓"}</strong>
                    <span>“{c(unsupported)}”</span>
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
              )}
              {hasPlaceholders && (
                <div className="warning-box">
                  <p>
                    {t(
                      "Replace every [EDITOR] note in English and every [TOIMITTAJA] note in Finnish with text you have checked against the full article. Unfinished notes block approval and publication.",
                      "Korvaa jokainen englanninkielinen [EDITOR]- ja suomenkielinen [TOIMITTAJA]-merkintä tekstillä, jonka olet tarkistanut koko jutusta. Keskeneräiset merkinnät estävät hyväksynnän ja julkaisun.",
                    )}
                  </p>
                </div>
              )}
              {hasUnsupported && (
                <div className="warning-box">
                  <p>
                    {t(
                      "The notice contradicts this: it names Android and iOS, recommends Chrome on Android and limits iPhone notifications to the home screen icon. Remove the seeded assertion in both languages or use the supported replacement. All other edits still require factual review.",
                      "Tiedote on ristiriidassa väitteen kanssa: se mainitsee Androidin ja iOS:n, suosittelee Androidilla Chromea ja rajaa iPhonen ilmoitukset aloitusnäytön kuvakkeeseen. Poista väite molemmista kieliversioista tai käytä lähteen mukaista korvausta. Muutkin muokkaukset vaativat faktantarkistuksen.",
                    )}
                  </p>
                  <button className="secondary" onClick={replaceUnsupported}>
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
                    onChange={(e) => setReview("fact", e.target.checked)}
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
                    onChange={(e) => setReview("language", e.target.checked)}
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
                    disabled={!canApprove}
                    onClick={approveDraft}
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
                {answerFor(state.draftFor) && (
                  <button
                    className="secondary"
                    onClick={() => showStory(answerFor(state.draftFor)!)}
                  >
                    {t("Open the published answer", "Avaa julkaistu vastaus")}{" "}
                    <Icon name="arrow" />
                  </button>
                )}
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
      {view !== "presenter" && (
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
            <button className="text-button" onClick={() => navigate("ai")}>
              {t("AI transparency", "Tekoälyn käyttö")}
            </button>
            <span>
              {t(
                "Local to this browser. No payments. No messages sent.",
                "Vain tässä selaimessa. Ei maksuja. Ei lähetettyjä viestejä.",
              )}
            </span>
          </div>
        </footer>
      )}
      {storageError && (
        <div className="storage-warning" role="alert">
          {t(
            "Browser storage unavailable. Changes will not survive refresh.",
            "Selaintallennus ei ole käytettävissä. Muutokset eivät säily päivityksessä.",
          )}
        </div>
      )}
      {toast && view !== "presenter" && (
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
              {t("Contribution type", "Osallistumisen tapa")}
              <select name="contribution" defaultValue="question">
                <option value="question">
                  {t("Ask a question", "Kysy kysymys")}
                </option>
                <option value="observation">
                  {t(
                    "Share local knowledge for verification",
                    "Jaa paikallinen havainto tarkistettavaksi",
                  )}
                </option>
              </select>
            </label>
            <label>
              {t(
                "Your question or local observation",
                "Kysymyksesi tai paikallinen havaintosi",
              )}
              <textarea
                autoFocus
                name="question"
                required
                minLength={QUESTION_LIMITS.min}
                maxLength={QUESTION_LIMITS.max}
                aria-invalid={questionError ? true : undefined}
                aria-describedby={questionError ? "question-error" : undefined}
                onInput={() => setQuestionError(null)}
                placeholder={t(
                  "What is missing from the local conversation?",
                  "Mitä paikallisesta keskustelusta puuttuu?",
                )}
              />
            </label>
            {questionError && (
              <p className="form-error" id="question-error" role="alert">
                {c(rejectionText[questionError])}
              </p>
            )}
            <p className="privacy-note">
              {t(
                "Do not include names, contact details or sensitive personal information. Length, links, contact details, duplicates and sending speed are checked in this browser only: a demo safeguard, not server-side protection.",
                "Älä lisää nimiä, yhteystietoja tai arkaluonteisia henkilötietoja. Pituus, linkit, yhteystiedot, kaksoiskappaleet ja lähetystahti tarkistetaan vain tässä selaimessa: demon suoja, ei palvelimen suojausta.",
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
