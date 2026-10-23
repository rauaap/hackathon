# Team Added Value hackathon project

## Kaleva Local — Understand Oulu. Feel at home.

An independent hackathon concept for international residents of Oulu. **Not an official launched Kaleva service.** A standalone React + TypeScript + Vite demo; no changes to the team's existing DigitalOcean server.

### Run locally

Use Node.js 22.12+ (Node 24 LTS recommended).

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
- **Newsroom** (`#newsroom`): select a question and explain its relevance; inspect the official source and claim list; edit a bilingual draft; resolve a deliberately unsupported assertion; reject or explicitly approve both factual and language review; publish the exact approved revision. Editing invalidates approval. Reported errors enter a queue, with reviewed bilingual amendments and visible correction notes.
- **Membership & business** (`#offers`): primary €900/six-week employer hypothesis; free/€5.90 monthly consumer comparison; simulated membership unlocks a premium item, saving and topic following; €300/month advertising hypothesis with a live editable fictional example. Employer-interest entries are recorded only in local browser storage.
- State persists in localStorage under `kaleva-local-demo-v1`. **Reset demo** restores the starting fixtures. There is no shared state across users.

### Deliberate boundaries

Prepared fixtures simulate AI source selection, drafting and translation. No live model, crawler, payment processor, authentication, email delivery, tracking service or database is connected. Alex North is a fictional reviewer. Public newsroom controls demonstrate review responsibility; they are not secure production administration. The seeded assertion detector covers the known demo assertion; arbitrary text still needs genuine human fact checking.

Questions and forms stay on the device. Membership activation takes no money. Prices are proposed test offers, not Kaleva's prices. There are no asserted customers, partnerships, audience figures or revenue. Employers fund access, never coverage decisions or individual reading surveillance.

The lead background article is labelled a concept preview rather than falsely claiming real editorial approval. Published newsroom versions are explicitly approved only inside this local simulation. Essential information, the main article and original sources stay free.

### Sources and visual provenance

- [International House Oulu multilingual survey](https://oulu.com/ihoulu/uutiset-ja-tapahtumat/international-house-oulun-monikielisen-kyselyn-tulokset/): inspected 23 October 2026. The survey was conducted in spring 2024; 448 respondents, ten languages; the source reports 26% identifying missing information or lack of English-language information as an integration barrier. Used as dated background, never a new 2026 event or paid-demand evidence. Publication date was not displayed on the inspected page.
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

### Three-minute demonstration

- **0:00–0:45 — Understand Oulu.** Open the lead article, show the 2024 source and uncertainty, switch Finnish/English and compare the student/family context. Submit “Where can I find local information I can actually understand?”
- **0:45–2:00 — Earn trust.** Open Newsroom demo, select that question and write a brief public-interest reason. Open the prepared draft. Show the unsupported assertion and disabled publication. Replace it, check factual and language review, approve, then edit one word to demonstrate invalidation. Review again, approve and publish. Show the new story in the reader feed.
- **2:00–3:00 — Make the experiment concrete.** Open Membership & business. Lead with the €900 employer pilot: up to 100 employees/family members, two explainers per week and one digest, editorial independence. Briefly activate simulated Plus and change the clearly labelled ad. End with the proposed test: sell one employer pilot and separate local advertising; measure repeat use, trust, editorial workload and actual willingness to pay.

### Vercel

`vercel.json` configures Vite, `npm run build`, and output `dist`. All application views use root hash navigation, so there is no catch-all rewrite. Unknown paths use the custom static `404.html`; unknown hashes show an in-app recovery view. Deploy this repository to a **new, dedicated** project. No secrets or environment variables are required. With Vercel CLI already authenticated:

```sh
npx vercel --prod
```

Choose the dedicated Kaleva Local project; do not select an unrelated existing application.
