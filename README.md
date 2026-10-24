# Team Added Value hackathon project

## Kaleva Local — Understand Oulu. Feel at home.

An independent hackathon concept for international residents of Oulu. **Not an official launched Kaleva service.** A standalone React + TypeScript + Vite demo; no changes to the team's existing DigitalOcean server.

### Run locally

Use Node.js 24 LTS (also required for the TypeScript API tests).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. For the production build:

```sh
npm run build
npm run preview
```

### What works

- **Reader** (`#news`): English/Finnish content, student and working/family filters, a source-based main explainer, three explicitly fictional story scenarios, free briefing preview, private questions, one support per browser demo, labelled advertising.
- **Kaleva today, ranked for you** (reader view, added 24 October 2026): real stories from Kaleva's free-news RSS via `/api/news`. Original Finnish headlines, Kaleva's feed descriptions, timestamps and links. The audience switch (students / professionals & families / latest) re-ranks and re-selects stories. Each card explains its score. Topics and scores come from rule-based keyword matching (`rules-v1`) because the feed has no categories. **No AI, no translation, no generated summaries.** “Ask the newsroom to explain” puts a story into the newsroom queue. There it opens a source brief that blocks approval until the editor replaces every `[EDITOR]`/`[TOIMITTAJA]` note. After fact and language review it publishes with Kaleva attribution.
- **Newsroom** (`#newsroom`): inspect live Kaleva RSS headlines and a dated Oulu data sample; flag source leads to the local queue; collect unverified local observations; choose one of Kaleva’s six reader needs; select a question and explain its relevance; inspect the official source and claim list; edit a bilingual draft; resolve a deliberately unsupported assertion; reject or explicitly approve both factual and language review; publish the exact approved revision. Editing invalidates approval. Reported errors enter a queue, with reviewed bilingual amendments and visible correction notes.
- **Membership & business** (`#offers`): primary €900/six-week employer hypothesis; free/€5.90 monthly consumer comparison; simulated membership unlocks a premium item, saving and topic following; €300/month advertising hypothesis with a live editable fictional example. Employer-interest entries are recorded only in local browser storage.
- State persists in localStorage under `kaleva-local-demo-v2` (bumped on 24 October 2026 when the main story changed, so old survey drafts are not reloaded). **Reset demo** restores the starting fixtures. There is no shared state across users.

### Editorial AI assistant (Claude, added 24 October 2026)

For a Kaleva RSS story that has been put in the newsroom queue, the source brief has a **Generate English draft with Claude** button. `POST /api/news` with `{ "id": "kaleva-<number>" }` looks up the item in the server's own feed cache. The browser never supplies source text. Only the Finnish headline and Kaleva's feed description are sent to `claude-opus-5-5` through the official `@anthropic-ai/sdk`, with low effort, JSON-schema output and server-side refusal fallback (`fallbacks: "default"`). The model returns:

- an English headline and description translation
- topics and a relevance rating for each audience
- a source-bound relevance note
- whether the evidence is sufficient
- what the source does not say
- assumptions the source does not support

The URL and date come from the feed, not the model. Deterministic fidelity checks flag new numbers, dropped attributions (`IS:`), padding and advice phrasing. Each warning becomes an `[EDITOR: …]` note, which blocks approval until a person resolves it. The result is stored as an unpublished draft. Publication still requires the existing factual and language reviews of the exact version. The reader sees the approved English text, the original Kaleva headline and link, and an AI-assistance disclosure. Readers can ask a follow-up, which is linked to the story in the newsroom queue.

The model call runs on a separate server with the Claude Agent SDK (`agent-server/`). Vercel only forwards the prompt and schema there with a shared secret over HTTPS, so the Vercel project needs no Anthropic API key.

Configuration (server only; never prefix with `VITE_`):

```sh
# .env.local (gitignored) for local dev/preview, or Vercel project environment variables
AGENT_BACKEND_URL=https://178-62-229-130.sslip.io   # Agent SDK backend (agent-server/)
AGENT_BACKEND_SECRET=...          # shared secret, same value as in agent-server/.env
NEWSROOM_ACCESS_CODE=...          # required, at least 24 characters; editors enter it in the newsroom
ASSISTANT_MAX_CALLS_PER_HOUR=20   # optional, default 20 per server instance
ASSISTANT_MAX_CALLS_PER_DAY=60    # optional, default 60 per server instance
```

**Access control.** The generation endpoint fails closed. Without both the agent backend settings and an access code of at least 24 characters, `GET /api/news` reports `assistant.available: false` with a `reason`, `POST` returns 503 and the desk shows a labelled “unavailable” state. Nothing is generated or simulated. Each `POST` must send `Authorization: Bearer <NEWSROOM_ACCESS_CODE>`, which is compared in constant time. A wrong or missing code returns 401 before any feed or model work. Ten failures within 10 minutes lock the endpoint (429) for that server instance. The editor types the code in the assistant panel, and it is kept in `sessionStorage` for that tab only.

**Cost controls.**
- Only items currently in Kaleva's feed can be processed.
- One call per story per prompt version (24 h server cache plus a draft saved in the browser).
- Concurrent duplicate requests are merged.
- At most 3 different stories are generated at once.
- Hourly and daily call caps.
- `max_tokens` 4000, 45 s timeout with one retry, Vercel `maxDuration` 60 s.

At the default caps the worst case is about 60 × (4,000 output × $20/M + ~1,500 input × $4/M) ≈ **$5 per server instance per day**. Caches, caps and lockout are per server instance. **For a hard global ceiling, also set a monthly spend limit for the API key's workspace in the Anthropic Console.**

### Kaleva English style references (added 24 October 2026)

The assistant can ground its English in Kaleva's own [News in English archive](https://www.kaleva.fi/aihe/news-in-english/16976). The archive lists 21 English articles, all freely readable and published in May–June 2012. Ten articles on local government, schools, work, services, traffic and safety in Oulu were read, and their metadata is stored in `STYLE_REFERENCES` in `api/news.ts`.

- **What is stored and sent.** The repository and the model get only metadata (title, URL, date, topics), **the team's own style notes** and Finnish→English term pairs seen in those articles. The model never receives article text or headlines. Kaleva's `robots.txt` disallows AI crawlers (including `anthropic-ai`), so no article text is persisted.
- **Retrieval.** Retrieval is deterministic, with no embeddings. A reference scores 2 points per shared topic and 3 per matching term pair. References scoring at least 3 are kept, up to 3. Otherwise the draft is labelled **standard translation**.
- **Prompt order.** The Finnish source comes first. The style guidance says it is not about the story, and that no place, person, role, figure or event may be added.
- **Checks.** Fidelity checks flag any name or figure from a reference article that is not in the source, and any reference ID the model cites that was not provided.
- **Transparency.** The editor sees the matched references before generation, even without the AI backend. After generation they also see the Finnish source next to the proposed English, the mode, and which references the model reports using. Readers see a one-line disclosure.
- **Caveat.** These are historical 2012 references, not necessarily current standards. For example, the 2012 term "kindergarten" is shown with a note to prefer the City of Oulu's current "ECEC centre".

### Deliberate boundaries

The eVaka story and survey workflow use prepared fixtures, labelled as simulations. The only real model integration is the editorial AI assistant described below; it works only when the Agent SDK backend is configured. No crawler, payment processor, authentication, email delivery, tracking service or database is connected. The source desk makes real read-only requests to Kaleva RSS and one Oulu open-data endpoint via `/api/sources`; drafts and translations remain simulated. Alex North is a fictional reviewer. Public newsroom controls demonstrate review responsibility; they are not secure production administration. The seeded assertion detector covers the known demo assertion; arbitrary text still needs genuine human fact checking.

Questions and forms stay on the device. New live RSS leads and other queue questions are blocked from the prepared eVaka draft: they require new reporting, not automatic publication. Membership activation takes no money. Prices are proposed test offers, not Kaleva's prices. There are no asserted customers, partnerships, audience figures or revenue. Employers fund access, never coverage decisions or individual reading surveillance.

The lead background article is labelled a concept preview rather than falsely claiming real editorial approval. Published newsroom versions are explicitly approved only inside this local simulation. Essential information, the main article and original sources stay free.

### Sources and visual provenance

- [City of Oulu: Using eVaka is getting easier – receive notifications directly on your phone](https://www.ouka.fi/en/news/using-evaka-getting-easier-receive-notifications-directly-your-phone): published 14 October 2026; raw page text inspected 24 October 2026. Since 24 October 2026 this is the source of the main explainer and the prepared draft. Every claim in the app was checked against the English page text; the Finnish text is the team's translation. Gaps the notice does not answer (supported OS/browser versions, other Android browsers, why the old icon must be removed, notification frequency, computer use) are shown as unknowns, and the follow-up question to the city is marked unsent and unanswered.

- [International House Oulu multilingual survey](https://oulu.com/ihoulu/uutiset-ja-tapahtumat/international-house-oulun-monikielisen-kyselyn-tulokset/): inspected 23 October 2026. Since 24 October 2026 linked only as historical background in the newsroom source monitor, not as evidence for the main story. The survey was conducted in spring 2024; 448 respondents, ten languages; the source reports 26% identifying missing information or lack of English-language information as an integration barrier. Used as dated background, never a new 2026 event or paid-demand evidence. Publication date was not displayed on the inspected page.
- [Journalist's Guidelines](https://jsn.fi/en/journalists-guidelines/): informs visible sourcing, corrections, editorial responsibility and advertising separation. No claim of formal compliance review.
- [Kaleva](https://www.kaleva.fi/): editorial visual reference. Waterfront SVG illustration and layouts are original. No proprietary article text or imagery copied. Google Fonts serves DM Sans and Source Serif 4, with local serif/sans fallbacks.

### Browser verification

Production build (`tsc --noEmit && vite build`) passes. Chromium browser checks performed:

1. Student/worker filters change both explanatory context and supporting stories.
2. EN/FI navigation and full main article switch correctly.
3. The seeded unresolved assertion blocks approval and publication even with review boxes checked.
4. Editing a reviewed draft invalidates approval; rejected drafts cannot be approved until edited.
5. Both published language versions exactly match the reviewed snapshot.
6. Simulated membership confirms no payment and unlocks the premium demonstration.
7. Edited ad name and message propagate to the labelled reader placement.
8. An error enters review; reviewed text and a visible correction note appear on the story.
9. Refresh preserves publication, membership, ad edits and support; reset clears the demo state.
10. At 390px, all three views and article detail have no horizontal overflow. Desktop reader visually reviewed at 1440px.

After the supplied product-quality instructions, refined the typography, removed decorative story-card artwork and redundant containers, and made all three views more editorial. Also checked 320/390/768/1024/1440px layouts, Finnish at 320px, short landscape, 200% text-size enlargement, modal initial focus/Tab containment/Escape/focus restoration, route/language titles and unknown-hash recovery. Automated axe WCAG A/AA checks found no violations in the three main desktop views; this is not a full accessibility conformance audit. Free briefing access, private questions, one-time support, and local-only pilot confirmation also passed. See [QUALITY-CHECK.md](QUALITY-CHECK.md) for the applicable release checklist. Temporary browser artifacts are ignored under `output/playwright/`.

### Sponsor brief and live source additions

The supplied `Junction_Kaleva_Media.pdf` places this concept in **Challenge 2: News for Everyone**. The implementation now makes the six reader needs explicit, adds private community observations and describes pilot co-design, distribution and cost measurement. See [CHALLENGE-FIT.md](CHALLENGE-FIT.md).

- The live source desk fetches original Finnish headlines, dates and links from the [free-news RSS](https://www.kaleva.fi/feedit/rss/managed-listing/rss-maksuttomat/). It does not reproduce articles, translate them or imply they all concern Oulu.
- The [Oulu API](https://api.ouka.fi/ohje/index.html) sample requests library statistics with an explicit year. The latest year returned in this query was **2016** on 24 October 2026. The UI marks the result historical, not current. Other endpoints were not exhaustively audited.
- `/api/sources` uses only two fixed public URLs, a nine-second upstream timeout, a 1MiB response bound, safe RSS parsing and host-checked article links. One source can fail without hiding the other. No browser questions or form entries are forwarded. Results may be cached for up to three minutes.
- The same API handler runs through a small Vite middleware locally and as a Vercel Function in deployment. No API keys or environment variables are required.
- `npm test` verifies source metadata, foreign-link rejection, partial/complete upstream failures and rejection of XML entity declarations. These unit tests mock upstream responses; separate browser checks exercised real source retrieval.

### Three-minute demonstration

- **0:00–0:45 — Understand Oulu.** Open the lead eVaka article: the fictional parent's question, the dated city notice, “what we know / what we don't” and the unanswered follow-up question. Switch Finnish/English and compare the student/family context.
- **0:45–2:00 — Earn trust.** Open Newsroom demo, briefly check live sources and point out the historical-data warning. Select the eVaka question (other questions cannot open the prepared draft) and write a brief public-interest reason. Open the prepared draft. Show claims marked “not in source” and the seeded assertion “eVaka notifications work on every phone and browser”, which contradicts the notice and blocks publication. Replace it, check factual and language review, approve, then edit one word to demonstrate invalidation. Review again, approve and publish. Show the new story in the reader feed with the chosen question, selection reason, source date and open follow-up question.
- **2:00–3:00 — Make the experiment concrete.** Open Membership & business. Lead with the €900 employer pilot: up to 100 employees/family members, two explainers per week and one digest, editorial independence. Briefly activate simulated Plus and change the clearly labelled ad. End with the proposed test: sell one employer pilot and separate local advertising; measure repeat use, trust, editorial workload and actual willingness to pay.

### Vercel

`vercel.json` configures Vite, `npm run build`, and output `dist`. All application views use root hash navigation, so there is no catch-all rewrite. Unknown paths use the custom static `404.html`; unknown hashes show an in-app recovery view. Deploy this repository to a **new, dedicated** project. No secrets or environment variables are required. With Vercel CLI already authenticated:

```sh
npx vercel --prod
```

Choose the dedicated Kaleva Local project; do not select an unrelated existing application.

Live demo: https://kaleva-local.vercel.app · source: https://github.com/rauaap/hackathon

As checked on 24 October 2026, the Vercel project `kaleva-local` has **no Git integration**, so no production branch is configured. Pushes and merges do not deploy anything. Production changes only through `vercel deploy --prod` from a clean export of a commit.

The current Vercel GitHub app connection cannot read this repository, so releases were deployed from the exact committed source files through the Vercel API. GitHub `main` is updated, but future pushes are **not automatically deployed** until the repository owner enables that Vercel Git integration.
