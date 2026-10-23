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
