# Web Product Quality Instructions

Purpose: build a distinctive, credible website or application whose real workflows work. Visual polish, truthful content, accessibility, and functional correctness are part of the same deliverable.

## Installation and scope

For Codex, use this content in the project's `AGENTS.md`. For Claude Code, use it in `CLAUDE.md`. If that file already exists, merge the relevant sections without replacing project instructions. A differently named reference file needs an explicit instruction to read it; merely adding it does not make it active.

Apply these rules to the requested scope. A single-page fix is not permission to redesign the whole product. A site-wide redesign includes every relevant route, shared shell, and interaction state, not just the homepage. Preserve working business logic, content, integrations, and project conventions.

Current explicit user requirements and project-specific constraints take precedence over the aesthetic defaults below. Truthful claims, working interactions, and accessibility must remain acceptance criteria. Explain material conflicts and resolve them with the smallest suitable change.

## 1. Understand the product before choosing its appearance

Inspect existing instructions, routes, components, styles, real assets, data sources, and available test commands. Reuse an established design system before introducing another one.

Establish a short working brief from available context:

- Product and audience: what is this, and who needs it?
- Primary task: what should someone accomplish here?
- Main action and result: what happens after the click?
- Product stage: prototype, demo, MVP, or production?
- Content: which claims, screenshots, photographs, and data are verified?
- Constraints: brand, language, platform, devices, existing architecture, time budget.
- Visual direction: two or three concrete characteristics, supported by relevant references when available.

Ask only when a missing answer materially changes scope or behavior. Otherwise state a reasonable assumption and proceed. Do not require a lengthy PRD for a small task.

Choose composition for the product. An editorial publication, commerce store, booking service, developer tool, and data dashboard should not all receive the same SaaS landing-page template. Familiar navigation and form conventions are useful; novelty must not make a task harder.

Use references to explain hierarchy, density, imagery, or interaction. Do not copy proprietary content, branding, or an entire interface. Make at least one visible, product-specific choice using real content rather than decoration.

## 2. Prevent generic visual defaults

Do not automatically generate:

- Purple/blue neon gradients, glowing background orbs, glass panels, gradient headings, or animated background meshes.
- A centered hero followed by interchangeable logo rows, three-card grids, testimonials, pricing, and FAQs regardless of the actual story.
- Cards nested inside cards, oversized pill labels, excessive rounding, borders, or shadows without grouping or interaction meaning.
- Sparkles, decorative emoji bullets, an icon beside every sentence, or arbitrary multicolored feature icons.
- Giant empty hero areas, enormous headlines with little information, or repeated full-screen sections that delay the useful content.
- Scroll-jacking, custom cursors, compulsory entrance animations, or hover effects on non-interactive objects.

These are warning signs of unexamined defaults, not evidence of AI authorship. A gradient, centered composition, white background, dark mode, Inter, Geist, Lucide, or any other legitimate tool may be appropriate. Keep it when it serves the brief; do not replace it merely to appear unusual. Do not substitute a mandatory beige editorial template for a mandatory neon SaaS template.

For a proposed effect, ask: does it communicate identity, hierarchy, state, or action? If it only adds noise, remove it. Review the whole composition; avoiding one color does not create good design.

## 3. Establish a small visual design system

Record or reuse tokens before styling many screens. Use the project's current CSS variables, theme, or equivalent system. Do not add a new styling library solely for this task.

Define:

- Color roles: canvas, surface, text, secondary text, border, primary action, focus, success, warning, error. Separate semantic states from brand decoration. Define foreground colors for each interactive surface.
- Typography roles: display, page title, section title, body, label, caption, and numeric data where needed. Specify family, weight, line height, and responsive size.
- Spacing and layout: a consistent scale, gutters, content widths, columns, and section rhythm.
- Component rules: button hierarchy, input geometry, icon sizes, radii, borders, elevation, and interaction states.
- Motion: when it helps, how it behaves, and how reduced-motion preferences are respected.

If no design system exists, start with adaptable defaults: one primary accent plus semantic colors; one or two font families; a 4px spacing base with common 8px increments; approximately 16–18px body text with comfortable leading; roughly 45–75 characters for long prose. These are starting points, not universal accessibility thresholds or reasons to overwrite a suitable brand.

Use a clear difference between headings, body text, labels, and secondary information. Choose fonts for readability, language coverage, brand, and loading cost. Never make essential labels illegibly small to create a premium appearance.

Align related content consistently. Use spacing to communicate relationships. Long body text normally reads best left-aligned in left-to-right languages. Center short content only when appropriate. Avoid arbitrary line breaks that fail on other widths or translations.

Use cards for meaningful groups or selectable objects. Use lists for lists, tables for comparable data, and open layouts where wrappers add no value. Vary marketing sections when their content calls for it; retain consistent layouts in repetitive operational interfaces.

Reuse components across all affected routes. Style hover, focus-visible, active, disabled, selected, loading, and error states where relevant. A disabled control must have an understandable reason or route forward.

## 4. Write specific copy and show honest evidence

Explain the actual task, intended user, and useful result. Replace empty claims such as “Unlock your potential,” “Seamless AI-powered solutions,” and “Revolutionize your workflow” with concrete information.

Example only, not a claim to publish: “Create assigned tasks from meeting notes” says more than “The future of productivity.” Use action labels such as “Create invoice” or “View available times” when those actions exist. Do not label a waitlist button “Start free” if no usable product follows.

Use the requested language consistently, including validation, dates, currencies, metadata, and empty states. Follow the user's supplied writing references when available. Do not invent their experiences or opinions. Avoid forced marketing language and filler sections.

Never fabricate customer counts, logos, testimonials, review scores, revenue, certifications, security guarantees, savings, uptime, scarcity, or endorsements. Omit unsupported proof. Do not invent privacy or legal commitments just to fill footer links.

Prefer actual product screenshots, genuine photographs, and understandable examples. Do not show a fictional dashboard as a live product. Label illustrative screens or synthetic data as demo/sample content. Keep internal mock fixtures clearly separated from real accounts and production data. Use assets with appropriate permission.

If real content is unavailable, use a restrained layout that works without it and identify the missing asset in the handoff. Never publish lorem ipsum, TODOs, template company names, or developer instructions as finished copy. A useful form hint is allowed; it must not replace a persistent label.

## 5. Make responsive behavior intentional

Design from a narrow viewport upward and inspect intermediate widths. Breakpoints should respond to content rather than imitate a fixed set of devices.

- Prevent accidental page-level horizontal scrolling. Locate the overflowing element; do not conceal the defect with blanket `overflow-x: hidden`.
- Allow legitimate two-dimensional content such as a wide data table to scroll inside a labeled, usable region without breaking the page. Preserve data and keyboard access.
- Check long words, URLs, localization, large values, missing images, and user-generated text. Use wrapping and flexible grid/flex children where appropriate.
- Recompose columns and navigation for small screens. Do not merely shrink a desktop screenshot or remove essential features.
- If navigation collapses, provide a labeled toggle with an accurate expanded state and reachable links. A simple disclosure need not behave like a modal. A modal drawer must have appropriate dialog behavior.
- Keep sticky headers, banners, chat widgets, and bottom actions from covering content, focused controls, or mobile form fields. Account for the on-screen keyboard and safe areas where relevant.
- Preserve browser zoom and readable text. Test 200% text enlargement and reflow at a width equivalent to 320 CSS pixels, including a 1280px viewport at 400% zoom. Essential two-dimensional content has specific exceptions. [S4]

For a new responsive site, a useful inspection set is 320, 390, 768, 1024, and 1440 CSS pixels, plus a short landscape viewport. For a scoped fix, cover the changed layout and its breakpoint boundaries rather than blindly multiplying screenshots.

## 6. Accessibility is part of implementation

Target applicable WCAG 2.2 AA criteria; this checklist is not a full conformance audit. [S5]

- Prefer native HTML controls and meaningful landmarks. Use links for navigation and buttons for actions. Maintain logical headings and reading order; add a skip link for repeated navigation.
- Ensure keyboard access, visible focus, logical focus order, and no accidental keyboard traps. Focused controls must remain visible when sticky UI is present.
- Provide persistent form labels, instructions, appropriate input types and autocomplete. Associate errors with their fields; do not communicate errors by color alone.
- Give informative images useful alternative text and decorative images empty alt text. Label icon-only controls with their action; hide decorative icons from assistive technology.
- Check normal text at 4.5:1 contrast and qualifying large text at 3:1; large text means at least 24 CSS px regular or approximately 18.7 CSS px bold. Required control boundaries and meaningful graphics generally need 3:1 against adjacent colors. Verify actual colors, including state variants. [S5, S6]
- Prefer approximately 44×44 CSS px touch targets for important standalone controls. WCAG 2.2 AA's target-size minimum is 24×24 CSS px with defined spacing and other exceptions; 44px is a practical preference here, not the AA minimum. [S7]
- For modal dialogs, provide an accessible name, place focus inside, contain the tab sequence, support Escape, make the background inert, and restore focus to the trigger or a logical successor. Use a tested native or library implementation where possible. [S8]
- Respect reduced motion, avoid flashing effects, and keep content usable when animation is removed. Do not autoplay sound.
- Announce asynchronous status changes appropriately without repeatedly interrupting the user. Important outcomes must remain understandable beyond a disappearing toast.

Run automated accessibility checks when available and inspect keyboard behavior manually. Do not claim complete accessibility from an automated score alone.

## 7. Build real workflows and credible states

For each important interaction, define its input, observable outcome, failure behavior, and recovery. Trace the main journey through the actual boundary: route, form, API, persistence, and any external service involved.

Model the states the feature can actually reach:

- Initial and loading: indicate what is loading, avoid indefinite spinners, and reserve space to reduce jumps. Show progress only when measurable.
- First-use empty: explain what belongs here and offer the first useful action.
- No results: preserve the query and allow filters or search to be adjusted.
- Success: confirm only what the system has established. A stored request is not proof that an email was delivered or a payment settled.
- Invalid input: give specific, actionable field errors; for multi-field forms, use an accessible summary when helpful. Preserve entered values. [S9]
- Service failure, timeout, or offline: explain the interruption and offer a safe retry or alternative. Do not expose stack traces or secrets.
- Authentication, permission, and expired-session states: provide an appropriate route forward without leaking another user's data.
- Partial or stale data: state the limitation or update time where it changes decisions.

Prevent accidental duplicate submissions. For consequential operations, implement suitable server-side duplicate protection. If using optimistic updates, roll back on failure. Handle rapid repeated actions, stale responses, and navigation during requests where relevant.

Search, filters, sorting, pagination, tabs, downloads, and settings must change the right content or persisted state. Check reloads, direct links, and browser Back/Forward when the workflow depends on them. Never use a success toast, local-only flag, or fake delay as a substitute for a required integration.

If a feature is deliberately mocked for a demo, label it and explain the boundary. Do not advertise or enable an unfinished production action as if it worked. Never send real messages, charge cards, or change production records merely to test an interface without authorization; use test environments and report any unverified boundary.

## 8. The original image's 20-point release checklist

The following preserves every item from the user's supplied image, in its original order, with an observable acceptance condition. Mark each applicable item Pass, Fail, or Not verified; use Not applicable with a reason where the product does not need it. Do not add irrelevant features just to tick a box.

1. **No horizontal scroll:** no unintended page-level overflow on supported widths; legitimate wide regions remain contained and usable.
2. **Find broken links:** check internal destinations, anchors, assets, redirects, and relevant external destinations. Distinguish unavailable external verification from a confirmed broken link; an HTTP HEAD rejection alone is inconclusive.
3. **Add mobile menu:** when desktop navigation no longer fits, all required destinations remain accessible through a usable, keyboard-operable mobile treatment.
4. **Add favicon:** use a suitable product mark; verify its asset loads and appears in the browser. Remove framework starter branding.
5. **Fix page titles:** meaningful, route-specific titles match the page and language; no starter-template titles. [S10]
6. **Add meta description:** write accurate descriptions for indexable public pages where relevant. Do not imply control over the exact search snippet or add SEO boilerplate to private application screens.
7. **Fix footer links:** actual destinations work, including relevant contact or policy pages. Omit unavailable links instead of pointing them to `#`.
8. **Custom 404 page:** unknown routes provide clear recovery and the appropriate not-found response where the platform supports it; do not silently render a successful homepage.
9. **Copyright year:** if displayed, use the correct owner and current year or an accurate date range. Avoid hard-coded stale dates and server/client date mismatches. Do not invent a founding year.
10. **Compress images:** serve appropriately sized, optimized assets with preserved visual quality; include responsive sources and dimensions as appropriate. Lazy-load below-the-fold media, not the main above-the-fold image. [S11]
11. **Fix broken buttons:** every enabled control has an actual, meaningful result; no empty handlers, misleading affordances, or accidental form submission.
12. **Success messages:** visible, accessible confirmation follows a verified successful action and describes its actual outcome.
13. **Error messages:** failures produce actionable feedback and a recovery path while preserving useful input.
14. **No placeholder text:** remove unfinished public copy, dummy branding, and misleading sample proof. Clearly labeled demonstration data and purposeful input hints are different cases.
15. **No unused navigation:** remove dead, duplicate, or unsupported destinations; preserve useful navigation and working routes. Do not delete functionality simply to pass a link audit.
16. **Fix mobile overflow:** inspect menus, dialogs, forms, tables, media, long strings, and sticky UI in open and error states, not only the initial screen.
17. **Clickable logo:** link the main site logo to the appropriate home or application start route with an accessible name, unless a documented focused workflow intentionally omits navigation.
18. **Clickable number:** when a public phone number is offered, use a valid `tel:` link and keep a human-readable display format. Never invent a phone number.
19. **Clickable email:** when a public email is offered, use a correct `mailto:` link or another explicit contact method. Opening a mail client does not verify message delivery. Never expose a private address by assumption.
20. **Mobile optimise:** complete the main journey with touch, readable content, practical target sizes, fast assets, and unobscured controls; verify more than a screenshot.

## 9. Performance and engineering quality

Use the existing framework and components. Keep fixes focused; do not introduce a new architecture, animation dependency, or custom component framework for cosmetic novelty.

Optimize the main loading bottleneck, image delivery, font loading, and unnecessary client JavaScript. Reserve media dimensions, avoid layout-shifting content insertion, and test behavior on a slower network or CPU when available. Do not delay useful content behind a decorative loading sequence.

Aim for good Core Web Vitals: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1, assessed at the 75th percentile of real visits. Lab results help diagnose problems but do not prove field performance; report missing field data honestly. Do not treat a Lighthouse score as a complete product-quality verdict. [S12]

Fix introduced runtime errors, unhandled promise rejections, hydration problems, failing requests, missing assets, and relevant build/type errors. Diagnose causes instead of suppressing diagnostics. Keep secrets server-side; validate inputs and enforce authorization at the trusted server boundary where applicable.

## 10. Verify before declaring completion

Scale verification to the change's risk. A reversible copy edit needs inspection and relevant existing checks; authentication, checkout, persistence, or a site-wide redesign needs deeper journey testing.

1. Inventory the changed routes, components, and important states. Identify the primary journey and the most consequential failure case.
2. Run the project's relevant build, lint, type, and existing test checks. Add targeted regression coverage for meaningful bugs or risky behavior; do not add tests that merely repeat CSS declarations.
3. Open the implementation in a real browser. Inspect representative mobile and desktop widths, breakpoint boundaries, keyboard use, actual content, and open/error states. For site-wide work, cover every affected route, with deeper state checks on distinct templates.
4. Complete the primary workflow, including a meaningful success and failure scenario. Verify the persisted result where relevant. For example: submit invalid input, correct it, submit successfully, then reload and verify the saved record using safe test data.
5. For automated journeys, prefer accessible role/label locators, observable assertions, isolated data, and condition-based waits. Avoid arbitrary sleeps and tests coupled to private implementation details. Label mocked-service tests; they do not prove the live integration. [S13]
6. Inspect console errors, failed network calls, broken links, and accessibility findings. Inspect screenshots visually; a saved screenshot is not evidence that someone reviewed it.
7. Fix task-related defects found, repeat the checks affected by the fix, and avoid unrelated refactors. Do not weaken tests to obtain a green result.

If the environment prevents a check, say which check was not run, why, and what remains unverified. Never claim to have opened a browser, run tests, verified delivery, deployed, or passed accessibility checks without direct evidence. Local success does not establish production success.

Completion report: briefly state what changed, which journeys/routes and environments were checked, what passed, and any remaining material limitation. Distinguish implementation complete from integration or production verified.

## 11. Project-specific flexibility and stopping rule

For a hackathon or prototype, prioritize one complete, convincing journey, clear demo boundaries, mobile usability, and recoverable failures. Use existing components and time-box decoration. Do not build speculative enterprise infrastructure.

For production, cover the actual data, integration, permission, and recovery boundaries required by the product. Do not call a demo production-ready because the happy-path screenshot looks finished.

For an established product, extend its visual language and preserve behavior. For a deliberately expressive brand, stronger color, unusual type, illustration, or animation can be appropriate when readable, performant, and useful. For dense operational tools, prioritize scanning, consistency, and efficient tasks over marketing-page spaciousness.

Stop polishing when the requested scope, primary journey, applicable checklist items, and meaningful checks pass. Further visual changes should solve an observed problem or explicit design requirement. The goal is a useful, credible product with intentional decisions, not a claim that nobody can detect AI assistance.

## Sources and evidence boundaries

Prepared 2026-10-22. These instructions are an original practical synthesis, not a validated AI-authorship detector. Visual articles provide practitioner observations, not statistical proof that a font or color reveals AI generation. Numerical accessibility and performance requirements come from primary technical sources. The 20-point list was read directly from the image attached to the user's “Vinkkejä hackathoniin” conversation; the acceptance conditions are expanded here.

- [S1: The Fountain Institute — 7 Signs a UI Has Been Vibe Coded](https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui). Practitioner critique of repeated decorative patterns; aesthetic context for section 2.
- [S2: VibeMole — How to Avoid Building Apps That Look Vibe Coded](https://vibemole.com/resources/avoid-vibecoded-app-design). Commercial practitioner perspective on nested containers, generic grids, and product evidence.
- [S3: Abhijay Vuyyuru — How can YOUR Vibe Coded Website not look like AI Slop?](https://abhijayvuyyuru.substack.com/p/how-can-your-vibe-coded-website-not). Practitioner guidance on concrete copy, actual assets, and an explicit brief. No font/color blacklist is treated as a standard.
- [S4: W3C — Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- [S5: W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- [S6: W3C — Understanding Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).
- [S7: W3C — Understanding Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- [S8: W3C ARIA Authoring Practices — Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
- [S9: GOV.UK Design System — Error Summary](https://design-system.service.gov.uk/components/error-summary/). Practical pattern, not a universal requirement to copy GOV.UK styling.
- [S10: Google Search Central — Title Links](https://developers.google.com/search/docs/appearance/title-link).
- [S11: MDN — Multimedia: Images](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Multimedia).
- [S12: web.dev — Core Web Vitals Thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds).
- [S13: Playwright — Best Practices](https://playwright.dev/docs/best-practices).
