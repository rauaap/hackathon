export type Lang = "en" | "fi";
export type Group = "everyone" | "students" | "working";
export type Copy = { en: string; fi: string };
export const SOURCE =
  "https://oulu.com/ihoulu/uutiset-ja-tapahtumat/international-house-oulun-monikielisen-kyselyn-tulokset/";
export const title: Copy = {
  en: "Finding your way in Oulu: what local information still fails to explain",
  fi: "Oma paikka Oulussa: mitä paikallinen tieto ei vielä selitä",
};
export const standfirst: Copy = {
  en: "A local headline is only the beginning. Understanding what it means for your everyday life is what matters.",
  fi: "Paikallinen uutinen on vasta alku. Olennaista on ymmärtää, mitä se tarkoittaa omassa arjessa.",
};
export const background: Copy = {
  en: "International House Oulu surveyed 448 people in spring 2024, in ten languages. Its report says 26% identified information missing or unavailable in English as a barrier to settling in. These are the experiences of survey respondents, not a measure of every international resident today.",
  fi: "International House Oulu keräsi keväällä 2024 vastauksia 448 ihmiseltä kymmenellä kielellä. Raportin mukaan 26 % mainitsi kotoutumisen esteeksi sen, ettei tietoa löydy tai ole saatavilla englanniksi. Tulokset kuvaavat vastaajien kokemuksia, eivät kaikkien kansainvälisten asukkaiden nykytilannetta.",
};
export const interpretation: Copy = {
  en: "Our editorial interpretation: local reporting should explain the context behind a development, identify the responsible organisation and make the original source easy to find. Translation alone does not answer a reader’s next question.",
  fi: "Toimituksellinen tulkintamme: paikallisen journalismin pitää avata tapahtuman tausta, kertoa vastuullinen taho ja auttaa löytämään alkuperäinen lähde. Pelkkä käännös ei vastaa lukijan seuraavaan kysymykseen.",
};
export const contexts: Record<Group, Copy> = {
  everyone: {
    en: "New to Oulu, or simply looking for clarity? Start with the source, check when it was published and tell us what still needs explaining.",
    fi: "Uusi Oulussa vai kaipaatko muuten selkeyttä? Aloita alkuperäisestä lähteestä, tarkista ajankohta ja kerro, mitä pitäisi vielä selittää.",
  },
  students: {
    en: "For students, a useful follow-up is how to distinguish university guidance from city services. This report does not establish your eligibility for any service; check your own institution’s current guidance.",
    fi: "Opiskelijalle hyödyllinen jatkokysymys on, miten korkeakoulun ohjeet eroavat kaupungin palveluista. Raportti ei määritä oikeuttasi palveluihin. Tarkista oman oppilaitoksesi ajantasaiset ohjeet.",
  },
  working: {
    en: "For workers and families, a useful follow-up is where to find local information beyond workplace onboarding. An employer can fund access to journalism, but must never see individual reading activity or control coverage.",
    fi: "Työssäkäyvälle ja perheelle hyödyllinen jatkokysymys on, mistä paikallista tietoa löytyy työpaikan perehdytyksen lisäksi. Työnantaja voi rahoittaa journalismin käyttöä, mutta ei valvoa lukemista tai ohjata sisältöä.",
  },
};
export const unsupported: Copy = {
  en: "All international residents have this problem.",
  fi: "Kaikilla kansainvälisillä asukkailla on tämä ongelma.",
};
export const draftInitial: Copy = {
  en: `${background.en}\n\n${interpretation.en}\n\n${unsupported.en}`,
  fi: `${background.fi}\n\n${interpretation.fi}\n\n${unsupported.fi}`,
};
export type SourceLead = {
  title: string;
  url: string;
  publishedAt: string | null;
};
export const readerNeeds = [
  {
    id: "information",
    en: "Information — what happened",
    fi: "Tieto — mitä tapahtui",
  },
  {
    id: "understanding",
    en: "Understanding — why it matters",
    fi: "Ymmärrys — miksi se merkitsee",
  },
  {
    id: "usefulness",
    en: "Usefulness — help in everyday life",
    fi: "Hyöty — apua arkeen",
  },
  {
    id: "emotion",
    en: "Emotion — move or inspire",
    fi: "Tunne — kosketa tai innosta",
  },
  {
    id: "break",
    en: "Break — a moment to unwind",
    fi: "Tauko — hetki hengähtää",
  },
  {
    id: "community",
    en: "Community — connection and voice",
    fi: "Yhteisö — yhteys ja oma ääni",
  },
] as const;
export type Question = {
  source?: SourceLead;
  kind?: "question" | "observation";
  id: string;
  text: Copy;
  supports: number;
  supported: boolean;
  private: boolean;
};
export type Correction = { note: Copy; date: string };
export type Story = {
  id: string;
  title: Copy;
  body: Copy;
  kind: "published" | "scenario" | "premium";
  category: Copy;
  group: Group;
  corrections: Correction[];
  review?: string;
  saved?: boolean;
  readerNeed?: string;
};
export const scenarios: Story[] = [
  {
    id: "s1",
    title: {
      en: "Your first winter, without the guesswork",
      fi: "Ensimmäinen talvi ilman arvailua",
    },
    body: {
      en: "Demo scenario: a future explainer could help a newcomer find official winter maintenance information and separate practical tips from verified local notices. No weather alert, road closure or service change is being reported here.",
      fi: "Demoesimerkki: tuleva juttu voisi auttaa löytämään virallista talvikunnossapidon tietoa ja erottamaan käytännön vinkit vahvistetuista tiedotteista. Tässä ei uutisoida säävaroituksesta, tiesulusta tai palvelumuutoksesta.",
    },
    kind: "scenario",
    category: { en: "Everyday Oulu", fi: "Oulun arki" },
    group: "everyone",
    corrections: [],
  },
  {
    id: "s2",
    title: {
      en: "Campus life is one part of the city. What’s beyond it?",
      fi: "Kampus on vain osa kaupunkia. Mitä muuta Oulussa on?",
    },
    body: {
      en: "Demo scenario: a student asks how to discover local activities beyond campus. A future reported guide would verify organisers, dates, costs and access before listing anything. There are no real event listings in this example.",
      fi: "Demoesimerkki: opiskelija kysyy, miten löytää tekemistä kampuksen ulkopuolelta. Tuleva opas tarkistaisi järjestäjät, ajankohdat, hinnat ja osallistumisen ehdot. Tässä ei ole oikeita tapahtumailmoituksia.",
    },
    kind: "scenario",
    category: { en: "Student life", fi: "Opiskelijaelämä" },
    group: "students",
    corrections: [],
  },
  {
    id: "s3",
    title: {
      en: "Settling in doesn’t stop at the office door",
      fi: "Kotiutuminen jatkuu työpäivän jälkeenkin",
    },
    body: {
      en: "Demo scenario: a family wants local context beyond an employer’s welcome pack. A future explainer would investigate that need independently. This is not an interview, a service promise or a statement about employment rights.",
      fi: "Demoesimerkki: perhe kaipaa paikallista tietoa työnantajan perehdytyspaketin lisäksi. Tuleva juttu selvittäisi tarvetta riippumattomasti. Tämä ei ole haastattelu, palvelulupaus tai väite työelämän oikeuksista.",
    },
    kind: "scenario",
    category: { en: "Work & family", fi: "Työ ja perhe" },
    group: "working",
    corrections: [],
  },
];
export const premium: Story = {
  id: "plus",
  title: { en: "Your Oulu week, made personal", fi: "Sinun Oulu-viikkosi" },
  body: {
    en: "Premium demonstration collection: your saved stories and followed topics would form a weekly digest. This example has no live delivery or additional verified reporting. Essential information and all original sources remain free.",
    fi: "Premium-kokoelman esimerkki: tallennetut jutut ja seuratut aiheet kokoaisivat henkilökohtaisen viikkokirjeen. Demossa ei ole lähetystä tai lisää vahvistettua uutisointia. Olennainen tieto ja alkuperäislähteet pysyvät maksuttomina.",
  },
  kind: "premium",
  category: { en: "Local Plus · demo", fi: "Local Plus · demo" },
  group: "everyone",
  corrections: [],
};
export type DemoState = {
  version: 1;
  questions: Question[];
  selected: string;
  reason: string;
  readerNeed: string;
  draft: Copy;
  revision: number;
  fact: boolean;
  language: boolean;
  approval: null | { revision: number; body: Copy };
  rejected: boolean;
  stories: Story[];
  reports: { id: string; storyId: string; text: string; resolved: boolean }[];
  mainBody: Copy;
  mainCorrections: Correction[];
  member: boolean;
  ad: { name: string; message: Copy };
  saved: string[];
  followed: boolean;
  interests: number;
  pilotInterests: { organisation: string; note: string }[];
  checkoutIntents: number;
};
export function initialState(): DemoState {
  return {
    version: 1,
    questions: [
      {
        id: "q1",
        text: {
          en: "Where can I find local information I can actually understand?",
          fi: "Mistä löydän paikallista tietoa, jota oikeasti ymmärrän?",
        },
        supports: 0,
        supported: false,
        private: false,
      },
      {
        id: "q2",
        text: {
          en: "How can I discover Oulu beyond my campus?",
          fi: "Miten tutustun Ouluun kampuksen ulkopuolella?",
        },
        supports: 0,
        supported: false,
        private: false,
      },
    ],
    selected: "",
    reason: "",
    readerNeed: "understanding",
    draft: { ...draftInitial },
    revision: 0,
    fact: false,
    language: false,
    approval: null,
    rejected: false,
    stories: [],
    reports: [],
    mainBody: { ...background },
    mainCorrections: [],
    member: false,
    ad: {
      name: "Northside Coffee",
      message: {
        en: "A little pause. A little more local.",
        fi: "Pieni tauko. Hieman paikallisempi.",
      },
    },
    saved: [],
    followed: false,
    interests: 0,
    pilotInterests: [],
    checkoutIntents: 0,
  };
}
export const STORAGE_KEY = "kaleva-local-demo-v1";
export function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (
        s.version === 1 &&
        Array.isArray(s.questions) &&
        Array.isArray(s.stories) &&
        s.draft &&
        s.mainBody
      )
        return { ...initialState(), ...s };
    }
  } catch {
    /* Fresh state if storage is unavailable or corrupt. */
  }
  return initialState();
}

export const briefingPreview: Story = {
  id: "briefing-preview",
  title: {
    en: "The local briefing: a free preview",
    fi: "Paikallinen viikkokirje: maksuton esikatselu",
  },
  body: {
    en: "Demonstration format — not a live news bulletin.\n\nUNDERSTAND: Our main explainer looks at the limits of local information, using the dated International House Oulu survey as background. Read the full story and its original source for free.\n\nASK: Where can you find local information you can actually understand? Share a question with the local demo desk.\n\nNEXT: Winter, life beyond campus and settling in after work are illustrative topics for future reporting. No events or service changes have been verified for this preview.\n\nA full Local Plus digest would collect deeper reporting, your saved stories and followed topics. No email is sent in this demo.",
    fi: "Havainnollistava muoto — ei ajantasainen uutiskirje.\n\nYMMÄRRÄ: Pääjuttumme käsittelee paikallisen tiedon puutteita International House Oulun aiemman kyselyn pohjalta. Koko jutun ja alkuperäisen lähteen voi lukea maksutta.\n\nKYSY: Mistä löydät paikallista tietoa, jota oikeasti ymmärrät? Jätä kysymys paikalliseen demotoimitukseen.\n\nSEURAAVAKSI: Talvi, elämä kampuksen ulkopuolella ja kotiutuminen työpäivän jälkeen ovat havainnollistavia aiheideoita tulevaan uutisointiin. Esikatselua varten ei ole vahvistettu tapahtumia tai palvelumuutoksia.\n\nLocal Plus -viikkokirje kokoaisi syvällisemmät jutut, tallennuksesi ja seuratut aiheet. Demossa ei lähetetä sähköpostia.",
  },
  kind: "scenario",
  category: {
    en: "Free briefing preview · demo",
    fi: "Maksuton viikkokirje · demo",
  },
  group: "everyone",
  corrections: [],
};
