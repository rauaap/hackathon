# Kaleva Local quality check

Checked 24 October 2026 (Europe/Helsinki). Scope: this standalone hackathon prototype. Design follows the project `AGENTS.md`; local Chromium checks and production build, not a full accessibility audit or field-performance study.

## Product-specific decisions

The lead source-based explainer comes first, with an original Oulu-inspired waterfront illustration. Supporting story ideas use plain editorial columns on desktop and a list on mobile. Source notes, correction records, the newsroom queue and the employer offer have distinct roles. Orange marks actions and categories; green marks review outcomes. Essential copy and controls were enlarged. The primary commercial proposal remains the employer pilot.

## The 20-item checklist

| Item | Result | Evidence / boundary |
|---|---|---|
| 1. No horizontal scroll | Pass | All three EN views at 320, 390, 768, 1024, 1440px; all FI views at 320px. |
| 2. Broken links | Pass for local paths; external availability not rechecked in this pass | Main views, original-source links, favicon and home recovery implemented. Original official source and JSN reference inspected during research. External availability can change. |
| 3. Mobile menu | Pass | Both reader destinations fit; separate newsroom and language controls remain accessible. No collapsed menu is needed. |
| 4. Favicon | Pass | Custom KL SVG; browser GET returns 200. |
| 5. Page titles | Pass | Reader, offers, newsroom, article and not-found titles follow view/language. |
| 6. Meta description | Pass | Accurate concept description; translated with the language switch. |
| 7. Footer links | Pass | Home and Reset demo work. No dummy contact/policy links. |
| 8. Custom 404 | Pass locally; production HTTP status verified separately at release | Unknown hashes have recovery. `public/404.html` handles unmatched paths on Vercel; no catch-all homepage rewrite. |
| 9. Copyright year | Not applicable | No invented copyright owner. 2026 denotes the actual concept year. |
| 10. Images | Pass | Original inline SVG with reserved aspect ratio; no large raster files or broken remote images. |
| 11. Buttons | Pass | Filters, language, questions/support, review gates, publication, correction, membership, ad editor, local employer form and reset exercised. |
| 12. Success messages | Pass | Accessible status toasts plus persisted queue/story/correction/membership results. Employer form also has durable local-only confirmation. |
| 13. Error messages | Pass for demo scope | Native required/min-length validation, explicit unsupported-claim gate, storage-unavailable warning and 404 recovery. No network submission is represented as real. |
| 14. Placeholder text | Pass | No unfinished public text. Fictional stories, businesses, reviewer and prices explicitly labelled. |
| 15. Navigation | Pass | Three supported views only; no unsupported language or dead destinations. |
| 16. Mobile overflow | Pass | Main layouts, article, forms and dialogs checked. Finnish long heading fixed. 200% text-size emulation at 1280px reflows to 1280px after header wrapping. |
| 17. Clickable logo | Pass | Accessible home control returns to reader view. |
| 18. Phone | Not applicable | No public phone number supplied or invented. |
| 19. Email | Not applicable | No contact address supplied or invented. Local-only forms send nothing. |
| 20. Mobile optimisation | Pass for tested prototype | 390px full journey, 320px reflow and 844×390 landscape dialog. Controls remain reachable. |

## Accessibility and workflow evidence

- Three main views: axe-core 4.10.3, WCAG 2 A/AA, 2.1 AA and 2.2 AA tags; **zero automated violations** in those states. Other states are not claimed to have a complete automated audit.
- Native dialog with accessible title, focus on entry, explicit Tab loop, Escape dismissal, inert backdrop and focus restoration; keyboard journey verified.
- Normal text accent/action colors were darkened; visible keyboard focus and persistent form labels.
- All ten original requested journeys repeated successfully after the design changes, including exact bilingual approved publication, approval invalidation, visible corrections, local persistence and reset.
- Local development HMR briefly logged a hook-dependency-size warning while editing the effect; full reload resolved it. Release verification uses the built app.
- Real field Core Web Vitals, assistive-technology audit, real AI, real payment, shared persistence and message delivery: **not verified / outside this explicitly simulated demo**.

Browser artifacts are local and gitignored under `output/playwright/`. The code and documentation contain no credentials.

## Sponsor-source extension (24 October 2026)

- Read all six pages of the supplied sponsor PDF. Kept the product on Challenge 2; added six reader needs, private unverified observations, pilot co-design/distribution/cost explanations.
- Actual local API + Chromium requests returned six Kaleva RSS headlines and Oulu library rows dated 2016. Historical status and original Finnish headlines are explicit. The source desk does not claim an approved translation or a current city-service count.
- Four Node tests passed: trustworthy metadata/URL handling, partial upstream failure, complete outage, XML entity rejection. They mock upstreams and are distinct from the live checks.
- Browser checks passed: source-to-private-queue and duplicate prevention; RSS leads blocked from unrelated prepared survey draft; local observation labelled unverified; changed reader need invalidates approval and reviewed need appears on publication; persisted source lead; failed refresh + retry; Finnish controls.
- Changed newsroom/offers views checked at 320/390/768/1440px with no horizontal overflow; Finnish live sources at390px. New newsroom loaded state had zero axe WCAG A/AA findings and no page exceptions. Screenshots inspected visually.
- An intentional 502 during the failure test is expected; this is not a production outage claim. External sources can change or be unavailable; the app exposes that state and retains the deterministic demonstration.

## eVaka main-story change (24 October 2026)

- Main story and prepared draft switched from the spring 2024 survey to the City of Oulu eVaka notice published 14 October 2026. Raw HTML of the notice was fetched and each claim compared with the page text before use. The survey stays as labelled historical background in the source monitor.
- `npm run build` passed. `npm test`: 4/4 passed on **Node 26.5** (Node 24 is not installed on this machine; not rerun on 24).
- Playwright (Chromium, built app via `vite preview`), results in `output/playwright/evaka-2026-10-24/` (gitignored): reader lead and fictional persona label; main article known/unknown lists and unanswered follow-up in EN and FI; unrelated question cannot open the eVaka draft; seeded claim blocks approval/publication; supported replacement resets review; approval needs both fact and language review; editing invalidates approval; exact EN/FI snapshot published with question, selection reason and open follow-up; reviewed correction with visible note; reload keeps publication and correction; Reset demo clears and persists; question/error dialogs keep focus, close on Escape and restore focus; mocked `/api/sources` 502 shows retryable error while the prepared draft stays usable; no page-level horizontal overflow at 320/390/768/1440px in EN and FI (reader, article, newsroom with draft open); no page or console errors apart from the intentional 502.
- axe-core 4.10.3 (WCAG 2 A/AA, 2.1 AA, 2.2 AA tags): zero violations in reader EN, main article EN/FI, blocked newsroom draft EN, published story FI and newsroom source-error state. Not a full accessibility audit.
- Not rechecked in this pass: live RSS/Oulu API retrieval, offers view, 1024px and landscape, 200% text size, production deployment. Nothing was sent to the City of Oulu.

## Kaleva RSS personalised feed (24 October 2026)

- Inspected the live feed on 24 October 2026: HTTP 200, RSS 2.0, 25 items with `title`, `link` (utm parameters), `description`, `pubDate`, `guid` (`/linkki/<number>`) and `enclosure`. **No `<category>` elements and no article body.** Topics are therefore derived from headline + feed description and labelled as such. Images are not shown. No fallback feed was needed or added.
- New `api/news.ts` (Vercel Function, local Vite middleware): 9 s timeout, 1 MiB bound, DOCTYPE/entity rejection, Kaleva-only HTTPS links, utm stripping, stable `kaleva-<number>` IDs, dedupe by ID/URL/title, 5-minute in-memory cache, last good copy served as `stale` for up to 24 h, otherwise 502 `no-store`. Browser keeps a localStorage copy for a labelled "saved copy" state.
- `npm run build` passed. `npm test` 11/11 on Node 26.5 (7 new feed tests: normalisation, dedupe, entity rejection, explainable classification, different audience rankings, cache hit, stale fallback, 502). Upstream is mocked in unit tests.
- Playwright against the built app with the **real feed** (`output/playwright/news-feed-2026-10-24/`, gitignored): 25 real items; every card links to kaleva.fi with timestamp and attribution; displayed headlines are exactly the feed titles; students and professionals/families feeds differ in both selection and order; "Latest" is chronological; the score shown equals the API score; the method disclosure is present; FI labels work; there is no page-level overflow at 320/390/768/1440 (EN+FI, both audiences, explanation open); the RSS story → queue → source brief path blocks unfinished notes, needs both reviews and publishes the exact approved text with the Kaleva source; the eVaka draft is restored unchanged afterwards. Mocked states: 502 with no copy (error + retry, eVaka unaffected), failed refresh after a load and server `stale` (labelled saved copy), no matching stories (explained empty state). axe: 0 violations in four new states. The eVaka regression script also passed 12/12 again.
- Not verified: Vercel production behaviour of `/api/news`, multi-instance cache behaviour, keyword accuracy beyond the 25 inspected items, real reader usefulness of the weights.

## Editorial AI assistant (24 October 2026)

- Added `@anthropic-ai/sdk` 1.3.0 (the only new dependency) and `POST /api/news` in `api/news.ts`. The key is read from server environment only; `vite.config.ts` copies `ANTHROPIC_API_KEY` from `.env.local` into the server process. The built client bundle was searched: no SDK code, `x-api-key` or key variable name.
- **No API credentials were available on this machine. No real Claude request was made, and output quality, latency and cost are unverified.** The SDK request shape (`betas`, `fallbacks: "default"`, `output_config.effort/format`) type-checks against SDK 1.3.0 types.
- `npm test`: 21/21 on Node 26.5. 10 new assistant tests with a mocked model client:
  - unavailable without credentials
  - exact source text sent; URL and date taken from the feed
  - missing description sent as `(none)` and invented descriptions flagged
  - fidelity checks (numbers, `IS:` attribution, padding, advice)
  - the draft cannot pass the approval gate as generated
  - unknown or malformed IDs never reach the model
  - result cache and in-flight merge
  - hourly budget 429
  - refusal, truncation, non-JSON, schema violations and client errors produce specific errors and are not cached
  - no call when the feed is unreachable
- Playwright (`output/playwright/ai-assist-2026-10-24/`), 8/8:
  - **Real, unmocked:** with no key the desk shows "unavailable", the button is disabled, no POST is sent, the server returns 503 and the manual brief still works.
  - **Mocked server response (labelled TEST FIXTURE):** budget, refusal and network errors are recoverable; the draft is saved unpublished and persists across reload without a new call; approval is blocked until notes are resolved; both reviews are required; an edit invalidates approval; the exact approved title and body are published; the reader sees the AI disclosure, original Kaleva headline and link; the feed card links to the explanation; a reader follow-up appears linked in the queue; no overflow at 320/390.
  - axe: 0 violations in three new states.
- Regression: the eVaka browser suite 12/12 and the RSS feed suite 11/11 pass again.
