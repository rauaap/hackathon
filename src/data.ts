import type { AssistDraft } from "../api/news.ts";
export type Lang = "en" | "fi";
export type Group = "everyone" | "students" | "working";
export type Copy = { en: string; fi: string };
// Pääjutun lähde: Oulun kaupungin tiedote 14.10.2026, luettu raakana HTML:nä 24.10.2026.
export const SOURCE =
  "https://www.ouka.fi/en/news/using-evaka-getting-easier-receive-notifications-directly-your-phone";
export const SOURCE_PUBLISHED = "2026-10-14";
export const SOURCE_ACCESSED = "2026-10-24";
// Kevään 2024 kysely jää vain historialliseksi taustaksi, ei pääjutun todisteeksi.
export const HISTORICAL_SOURCE =
  "https://oulu.com/ihoulu/uutiset-ja-tapahtumat/international-house-oulun-monikielisen-kyselyn-tulokset/";
// Ainoa kysymys, johon valmisteltu luonnos vastaa.
export const PREPARED_QUESTION_ID = "q-evaka";
export const title: Copy = {
  en: "eVaka notifications on your phone: what Oulu’s notice confirms, and what it leaves open",
  fi: "eVaka-ilmoitukset puhelimeen: mitä Oulun tiedote kertoo ja mitä se jättää auki",
};
export const standfirst: Copy = {
  en: "A reader asked whether the new notifications will work on an iPhone. We separated what the City of Oulu’s 14 October notice states from what it does not say, and turned the gaps into one question for the city.",
  fi: "Lukija kysyi, toimivatko uudet ilmoitukset iPhonella. Erottelimme, mitä Oulun kaupungin 14.10. tiedote kertoo ja mitä se jättää sanomatta, ja muotoilimme aukoista yhden kysymyksen kaupungille.",
};
export const background: Copy = {
  en: "On 14 October 2026 the City of Oulu announced that eVaka, its electronic service for early childhood education, can now be added to a phone’s home screen with notifications enabled on the device. eVaka runs in the web browser, so no separate app is needed. The notice says the feature is available on Android and iOS devices (iPhone and iPad). Email notifications continue as before; on eVaka’s My Information page, users choose email, phone, both or neither.",
  fi: "Oulun kaupunki kertoi 14.10.2026, että varhaiskasvatuksen sähköisen palvelun eVakan voi nyt lisätä puhelimen aloitusnäytölle ja ottaa ilmoitukset käyttöön laitteessa. eVaka toimii selaimessa, joten erillistä sovellusta ei tarvita. Tiedotteen mukaan ominaisuus on käytettävissä Android- ja iOS-laitteilla (iPhone ja iPad). Sähköposti-ilmoitukset toimivat kuten ennenkin; eVakan omien tietojen sivulla (englanninkielisessä tiedotteessa My Information) voi valita sähköpostin, puhelimen, molemmat tai ei kumpaakaan.",
};
export const interpretation: Copy = {
  en: "Our editorial interpretation: the notice gives clear setup steps, but its answer depends on the device. On iPhone, notifications work only from the home screen icon, not a Safari tab. For Android, Chrome is recommended and other browsers may need different steps. A reader who has to set this up still has questions the notice does not answer, so we list them separately and ask the city.",
  fi: "Toimituksellinen tulkintamme: tiedotteen ohjeet ovat selkeät, mutta vastaus riippuu laitteesta. iPhonella ilmoitukset toimivat vain aloitusnäytön kuvakkeesta, eivät Safarin välilehdestä. Androidilla suositellaan Chromea, ja muissa selaimissa vaiheet voivat poiketa. Käyttöönottoa miettivällä lukijalla jää kysymyksiä, joihin tiedote ei vastaa, joten listaamme ne erikseen ja kysymme kaupungilta.",
};
// Väitteet, jotka tarkistettiin tiedotteen raakatekstistä 24.10.2026.
export const knownClaims: Copy[] = [
  {
    en: "Published 14 October 2026 by the City of Oulu.",
    fi: "Oulun kaupungin tiedote, julkaistu 14.10.2026.",
  },
  {
    en: "eVaka runs in the browser; no separate app is needed. Available on Android and iOS (iPhone and iPad).",
    fi: "eVaka toimii selaimessa; erillistä sovellusta ei tarvita. Käytettävissä Androidilla ja iOS:llä (iPhone ja iPad).",
  },
  {
    en: "Example notifications: a new message or announcement from the ECEC centre, missing attendance reservations or a closing holiday survey, a new calendar event, a discussion appointment, a new decision or document.",
    fi: "Esimerkkejä ilmoituksista: uusi viesti tai tiedote päiväkodilta, puuttuvat läsnäolovaraukset tai sulkeutuva lomakysely, uusi kalenteritapahtuma, keskusteluaika, uusi päätös tai asiakirja.",
  },
  {
    en: "Email notifications continue. On the My Information page, users choose email, phone, both or neither.",
    fi: "Sähköposti-ilmoitukset jatkuvat. Omien tietojen (My Information) sivulla valitaan sähköposti, puhelin, molemmat tai ei kumpaakaan.",
  },
  {
    en: "On iPhone, notifications work only when eVaka is opened from the home screen icon, not in a Safari tab.",
    fi: "iPhonella ilmoitukset toimivat vain, kun eVaka avataan aloitusnäytön kuvakkeesta, eivät Safarin välilehdessä.",
  },
  {
    en: "Setup: remove an old eVaka icon, open varhaiskasvatus.ouka.fi (Android: Chrome; iPhone/iPad: Safari) and sign in, add it to the home screen, open the new icon, tap “Enable” and allow notifications. “Send Test Notification” checks that they work.",
    fi: "Käyttöönotto: poista vanha eVaka-kuvake, avaa varhaiskasvatus.ouka.fi (Android: Chrome; iPhone/iPad: Safari) ja kirjaudu, lisää aloitusnäytölle, avaa uudesta kuvakkeesta, paina ”Enable” ja salli ilmoitukset. ”Send Test Notification” testaa toimivuuden.",
  },
  {
    en: "On Android, Chrome is recommended; with another browser the setup steps may differ.",
    fi: "Androidilla suositellaan Chromea; muilla selaimilla vaiheet voivat poiketa.",
  },
];
// Aukot: tiedote ei kerro näitä. Vastauksia ei keksitä.
export const unknowns: Copy[] = [
  {
    en: "Which iOS, Android or browser versions are supported.",
    fi: "Mitkä iOS-, Android- tai selainversiot ovat tuettuja.",
  },
  {
    en: "Whether notifications work in Android browsers other than Chrome; the notice only says the steps may differ.",
    fi: "Toimivatko ilmoitukset muissa Android-selaimissa kuin Chromessa; tiedote kertoo vain vaiheiden voivan poiketa.",
  },
  {
    en: "Why an old home screen icon must be removed first.",
    fi: "Miksi vanha aloitusnäytön kuvake pitää poistaa ensin.",
  },
  {
    en: "How often notifications are sent.",
    fi: "Kuinka usein ilmoituksia tulee.",
  },
  {
    en: "Whether notifications work on a computer.",
    fi: "Toimivatko ilmoitukset tietokoneella.",
  },
];
export const followUp: Copy = {
  en: "Which phone operating system and browser versions do eVaka notifications support, do they work in Android browsers other than Chrome, and why must an old home screen icon be removed first?",
  fi: "Mitä puhelimen käyttöjärjestelmä- ja selainversioita eVaka-ilmoitukset tukevat, toimivatko ne muissa Android-selaimissa kuin Chromessa ja miksi vanha aloitusnäytön kuvake pitää poistaa ensin?",
};
// Community Insight eVaka-kysymykselle. Todisteet ja aukot ovat viittauksia tarkistettuihin
// listoihin, joten paneeli ei voi esittää todisteena mitään, mitä tiedotteesta ei tarkistettu.
// Yleisö- ja hyötyrivit ovat toimituksen arvioita, eivät todisteita.
export const evakaInsight = {
  need: {
    en: "Whether eVaka phone notifications work on an iPhone, and what a parent must do to get them.",
    fi: "Toimivatko eVakan puhelinilmoitukset iPhonella ja mitä vanhemman pitää tehdä saadakseen ne.",
  },
  audience: {
    en: "Parents with a child in early childhood education in Oulu, including newcomers setting up eVaka for the first time. Setup depends on the device; a missed step means no phone notifications.",
    fi: "Vanhemmat, joiden lapsi on varhaiskasvatuksessa Oulussa, myös eVakan ensimmäistä kertaa käyttöön ottavat tulijat. Käyttöönotto riippuu laitteesta; väliin jäänyt vaihe tarkoittaa, ettei puhelinilmoituksia tule.",
  },
  why: {
    en: "Why it matters: setup depends on the device, and the same open questions affect every family using eVaka.",
    fi: "Miksi tällä on väliä: käyttöönotto riippuu laitteesta, ja samat avoimet kysymykset koskevat jokaista eVakaa käyttävää perhettä.",
  },
  evidence: [1, 4, 5],
  gaps: [0, 1, 2],
  crossCommunity: {
    en: "Finnish-speaking families use the same eVaka service and face the same unanswered device questions. One verified answer, published in English and Finnish, serves both.",
    fi: "Suomenkieliset perheet käyttävät samaa eVaka-palvelua, ja heillä on samat vastaamattomat laitekysymykset. Yksi tarkistettu vastaus englanniksi ja suomeksi palvelee molempia.",
  },
  reason: {
    en: "An international parent asked, and Finnish-speaking families use the same service. The city’s notice explains setup but leaves device support open, so we separate what is known from what is not and ask the city.",
    fi: "Kansainvälinen vanhempi kysyi, ja suomenkieliset perheet käyttävät samaa palvelua. Kaupungin tiedote kertoo käyttöönotosta, mutta jättää laitetuen auki, joten erottelemme tiedetyn tuntemattomasta ja kysymme kaupungilta.",
  },
};
export const contexts: Record<Group, Copy> = {
  everyone: {
    en: "This concerns you only if you use eVaka for a child in early childhood education in Oulu. Start with the city’s notice, check its date and tell us what still needs explaining.",
    fi: "Asia koskee sinua vain, jos käytät eVakaa lapsesi varhaiskasvatukseen Oulussa. Aloita kaupungin tiedotteesta, tarkista sen päiväys ja kerro, mitä pitäisi vielä selittää.",
  },
  students: {
    en: "This notice is about early childhood education, not university services. It is relevant to a student only if they use eVaka for their own child. It does not say anything about your eligibility for any service.",
    fi: "Tiedote koskee varhaiskasvatusta, ei korkeakoulujen palveluja. Opiskelijalle se on ajankohtainen vain, jos hän käyttää eVakaa oman lapsensa asioissa. Tiedote ei kerro oikeudestasi mihinkään palveluun.",
  },
  working: {
    en: "If your child is in early childhood education in Oulu, the notice describes phone notifications you can choose to enable. Email notifications continue as before. The notice does not say which device versions are supported.",
    fi: "Jos lapsesi on varhaiskasvatuksessa Oulussa, tiedote kuvaa puhelinilmoitukset, jotka voit halutessasi ottaa käyttöön. Sähköposti-ilmoitukset jatkuvat ennallaan. Tiedote ei kerro, mitkä laiteversiot ovat tuettuja.",
  },
};
// Siemenväite on ristiriidassa tiedotteen kanssa, ja julkaisulukko estää sen.
export const unsupported: Copy = {
  en: "eVaka notifications work on every phone and browser.",
  fi: "eVaka-ilmoitukset toimivat kaikilla puhelimilla ja selaimilla.",
};
export const supportedReplacement: Copy = {
  en: "The notice names Android and iOS (iPhone and iPad). It recommends Chrome on Android, and on iPhone notifications work only from the home screen icon, not in a Safari tab.",
  fi: "Tiedote mainitsee Androidin ja iOS:n (iPhone ja iPad). Androidilla se suosittelee Chromea, ja iPhonella ilmoitukset toimivat vain aloitusnäytön kuvakkeesta, eivät Safarin välilehdessä.",
};
const list = (items: Copy[], l: Lang) =>
  items.map((item) => `– ${item[l]}`).join("\n");
export const draftInitial: Copy = {
  en: `${background.en}\n\n${unsupported.en}\n\nWhat the notice says\n${list(knownClaims.slice(4), "en")}\n\nWhat we don’t know yet\n${list(unknowns, "en")}\n\nOur question to the City of Oulu\n${followUp.en}`,
  fi: `${background.fi}\n\n${unsupported.fi}\n\nMitä tiedote kertoo\n${list(knownClaims.slice(4), "fi")}\n\nMitä ei vielä tiedetä\n${list(unknowns, "fi")}\n\nKysymyksemme Oulun kaupungille\n${followUp.fi}`,
};
export type SourceLead = {
  title: string;
  url: string;
  publishedAt: string | null;
  description?: string | null;
};
// Toimittajan täytettävät kohdat estävät hyväksynnän, kunnes ne on korvattu.
export const PLACEHOLDER = /\[(EDITOR|TOIMITTAJA):/;
// RSS-vihjeen luonnospohja: vain syötteen otsikko, päiväys ja kuvaus. Ei keksittyä sisältöä.
// AI-luonnos: ensimmäinen rivi on otsikko, jonka toimittaja tarkistaa ja voi muokata.
// Suomenkielinen versio käyttää Kalevan omaa tekstiä; selitys jätetään toimittajalle.
export function aiDraft(d: AssistDraft): Copy {
  const o = d.output;
  const date = (locale: string) =>
    d.source.publishedAt
      ? new Date(d.source.publishedAt).toLocaleDateString(locale, {
          timeZone: "Europe/Helsinki",
        })
      : null;
  const missing = o.missing_information.length
    ? o.missing_information.map((m) => `– ${m}`).join("\n")
    : "– [EDITOR: List what the source does not say.]";
  const checks = d.fidelityWarnings.map(
    (w) => `[EDITOR: AI fidelity check – ${w}]`,
  );
  return {
    en: [
      o.headline_en,
      "",
      `Kaleva’s feed description, translated: ${o.description_en || "Kaleva’s feed has no description for this story."}`,
      "",
      `Who this may concern, judged from the headline and description only: international students – ${o.relevance.students}; international professionals and families – ${o.relevance.families}. ${o.relevance_explanation}`,
      ...(o.evidence_sufficient
        ? []
        : [
            "The feed text alone is not enough to say who is affected or what changes.",
          ]),
      "",
      "What the source does not tell us yet",
      missing,
      "",
      `Source: Kaleva, “${d.source.title}” (original Finnish headline), published ${date("en-GB") ?? "date not given in the feed"}.`,
      ...checks,
      "[EDITOR: Read the full Kaleva article. Add verified context here or confirm the feed text is enough, then delete this note.]",
    ].join("\n"),
    fi: [
      d.source.title,
      "",
      `Kalevan syötteen kuvaus: ${d.source.description ? `”${d.source.description}”` : "syötteessä ei ole kuvausta."}`,
      "",
      "[TOIMITTAJA: Kirjoita suomeksi, ketä juttu voi koskea, tarkistetun englanninkielisen selityksen pohjalta.]",
      "",
      "Mitä lähde ei vielä kerro",
      "[TOIMITTAJA: Suomenna tai tarkista avoimet kysymykset.]",
      "",
      `Lähde: Kaleva, julkaistu ${date("fi-FI") ?? "päiväys puuttuu syötteestä"}.`,
    ].join("\n"),
  };
}
// Erottaa hyväksytyn luonnoksen ensimmäisen rivin otsikoksi.
export function splitTitle(body: string): { title: string; body: string } {
  const [first, ...rest] = body.split("\n");
  return { title: first.trim(), body: rest.join("\n").trim() };
}
export function leadBrief(source: SourceLead): Copy {
  const date = (locale: string) =>
    source.publishedAt
      ? new Date(source.publishedAt).toLocaleDateString(locale, {
          timeZone: "Europe/Helsinki",
        })
      : null;
  return {
    en: `[EDITOR: Write a short, factual English explanation only after reading the full Kaleva article. Do not rely on the headline alone.]\n\nSource: Kaleva, “${source.title}” (original Finnish headline), published ${date("en-GB") ?? "date not given in the feed"}.\nKaleva’s feed description (Finnish): ${source.description ? `“${source.description}”` : "none"}\n\nWhat we still need to establish\n– [EDITOR: What does the full article establish, and who in Oulu is affected?]\n– [EDITOR: Is there an official source to check before publishing?]`,
    fi: `[TOIMITTAJA: Kirjoita lyhyt, asiallinen selitys vasta luettuasi koko Kalevan jutun. Älä nojaa pelkkään otsikkoon.]\n\nLähde: Kaleva, ”${source.title}”, julkaistu ${date("fi-FI") ?? "päiväys puuttuu syötteestä"}.\nKalevan syötteen kuvaus: ${source.description ? `”${source.description}”` : "ei kuvausta"}\n\nMitä pitää vielä selvittää\n– [TOIMITTAJA: Mitä koko juttu kertoo, ja ketä Oulussa asia koskee?]\n– [TOIMITTAJA: Onko virallinen lähde, joka pitää tarkistaa ennen julkaisua?]`,
  };
}
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
  // Merkintä fiktiivisestä esimerkkipersoonasta.
  persona?: Copy;
  // Lukijan jatkokysymys julkaistusta jutusta.
  storyId?: string;
  // Toimituksen vaihe tässä selaimessa. Julkaisu päätellään jutuista.
  status?: "review" | "investigating";
};
// Selaimen omat roskapostitarkistukset. Ne ohjaavat rehellistä käyttäjää, mutta eivät ole
// tietoturvaa: jaettu versio tarvitsee samat ja tiukemmat tarkistukset palvelimella (SECURITY.md).
export const QUESTION_LIMITS = {
  min: 15,
  max: 400,
  perWindow: 3,
  windowMs: 10 * 60_000,
  gapMs: 20_000,
};
export type QuestionRejection =
  | "too-short"
  | "too-long"
  | "no-words"
  | "repeated-characters"
  | "link"
  | "contact-details"
  | "duplicate"
  | "too-fast"
  | "too-many";
const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export function checkQuestion(
  text: string,
  questions: Question[],
  submittedAt: number[],
  now: number,
): QuestionRejection | null {
  const value = text.trim();
  if (value.length < QUESTION_LIMITS.min) return "too-short";
  if (value.length > QUESTION_LIMITS.max) return "too-long";
  if ((value.match(/\p{L}{2,}/gu) ?? []).length < 3) return "no-words";
  if (/(.)\1{5,}/u.test(value)) return "repeated-characters";
  // Yhteystietoja ei tarvita, joten niitä ei tallenneta.
  if (
    /[\w.+-]+@[\w-]+\.[\w.]+/.test(value) ||
    /(?:\+\d{1,3}|\b0)[\s-]?\d{1,4}(?:[\s-]?\d){5,}/.test(value)
  )
    return "contact-details";
  if (
    /https?:\/\/|www\.|\b[\w-]+\.(com|fi|net|org|io|ru|ly|xyz)\b/i.test(value)
  )
    return "link";
  const normalized = normalizeText(value);
  if (
    questions.some(
      (q) =>
        normalizeText(q.text.en) === normalized ||
        normalizeText(q.text.fi) === normalized,
    )
  )
    return "duplicate";
  const recent = submittedAt.filter(
    (at) => now - at < QUESTION_LIMITS.windowMs,
  );
  if (recent.length >= QUESTION_LIMITS.perWindow) return "too-many";
  if (recent.some((at) => now - at < QUESTION_LIMITS.gapMs)) return "too-fast";
  return null;
}
export type QuestionStatus =
  "submitted" | "review" | "investigating" | "published";
// Kysymyksen tila Community Radarissa: julkaistu vain, jos hyväksytty juttu vastaa siihen.
export function questionStatus(q: Question, stories: Story[]): QuestionStatus {
  if (stories.some((st) => st.questionId === q.id)) return "published";
  return q.status ?? "submitted";
}
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
  // Julkaisun ketju: lukijan kysymys, valintaperuste ja avoin jatkokysymys.
  question?: Copy;
  // Mihin jonon kysymykseen julkaisu vastaa (linkki takaisin kysymykseen).
  questionId?: string;
  reason?: string;
  followUp?: Copy;
  // Julkaistu RSS-vihjeestä: alkuperäinen Kalevan juttu.
  sourceLead?: SourceLead;
  // AI-avustuksen tiedot lukijalle näytettävää ilmoitusta varten.
  ai?: {
    model: string;
    generatedAt: string;
    promptVersion: string;
    mode?: "style-grounded" | "standard";
    styleRefs?: {
      id: string;
      title: string;
      url: string;
      publishedAt: string;
    }[];
  };
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
  // Mihin jonon kysymykseen työpöydän luonnos kuuluu; muiden luonnokset säilyvät drafts-kentässä.
  draftFor: string;
  drafts: Record<string, Copy>;
  // Claude-avustajan tuottamat luonnokset kysymyksittäin. Tallennetaan luonnoksina, ei julkaisuina.
  ai: Record<string, AssistDraft>;
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
  // Lähetysajat tässä selaimessa nopeusrajoitusta varten.
  submittedAt: number[];
};
export function initialState(): DemoState {
  return {
    version: 1,
    questions: [
      {
        id: PREPARED_QUESTION_ID,
        text: {
          en: "Will eVaka notifications work on my iPhone? Do I need to do something?",
          fi: "Toimivatko eVaka-ilmoitukset iPhonellani? Pitääkö minun tehdä jotain?",
        },
        persona: {
          en: "Fictional parent persona",
          fi: "Kuvitteellinen vanhempi",
        },
        supports: 0,
        supported: false,
        private: false,
      },
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
    readerNeed: "usefulness",
    draft: { ...draftInitial },
    draftFor: PREPARED_QUESTION_ID,
    drafts: {},
    ai: {},
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
    submittedAt: [],
  };
}
// v2: pääjuttu vaihtui eVaka-tiedotteeseen, joten vanhaa kyselyluonnosta ei ladata.
export const STORAGE_KEY = "kaleva-local-demo-v2";
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
        return {
          ...initialState(),
          ...s,
          submittedAt: Array.isArray(s.submittedAt)
            ? s.submittedAt.filter((x: unknown) => typeof x === "number")
            : [],
        };
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
    en: "Demonstration format — not a live news bulletin.\n\nUNDERSTAND: Our main explainer separates what the City of Oulu’s 14 October 2026 eVaka notice says about phone notifications from what it leaves open. Read the full story and its original source for free.\n\nASK: Will eVaka notifications work on your phone? Share a question with the local demo desk.\n\nNEXT: Winter, life beyond campus and settling in after work are illustrative topics for future reporting. No events or service changes have been verified for this preview.\n\nA full Local Plus digest would collect deeper reporting, your saved stories and followed topics. No email is sent in this demo.",
    fi: "Havainnollistava muoto — ei ajantasainen uutiskirje.\n\nYMMÄRRÄ: Pääjuttumme erottelee, mitä Oulun kaupungin 14.10.2026 eVaka-tiedote kertoo puhelinilmoituksista ja mitä se jättää auki. Koko jutun ja alkuperäisen lähteen voi lukea maksutta.\n\nKYSY: Toimivatko eVaka-ilmoitukset puhelimellasi? Jätä kysymys paikalliseen demotoimitukseen.\n\nSEURAAVAKSI: Talvi, elämä kampuksen ulkopuolella ja kotiutuminen työpäivän jälkeen ovat havainnollistavia aiheideoita tulevaan uutisointiin. Esikatselua varten ei ole vahvistettu tapahtumia tai palvelumuutoksia.\n\nLocal Plus -viikkokirje kokoaisi syvällisemmät jutut, tallennuksesi ja seuratut aiheet. Demossa ei lähetetä sähköpostia.",
  },
  kind: "scenario",
  category: {
    en: "Free briefing preview · demo",
    fi: "Maksuton viikkokirje · demo",
  },
  group: "everyone",
  corrections: [],
};
