# Kaleva Local: demo cheat sheet

Production: https://kaleva-local.vercel.app · PR: https://github.com/rauaap/hackathon/pull/1

## 1. One sentence

**Your Oulu. Your news. Your voice.** A community-powered local news dashboard for international residents in Oulu: relevant Kaleva news, questions that shape coverage, and verified answers in English and Finnish.

| | |
|---|---|
| **Who** | International professionals and their families in Oulu (primary); students as a secondary audience |
| **Problem** | Local news is in Finnish, and newcomers have no voice in what gets explained |
| **Solution** | Community-informed, human-verified, bilingual local journalism |
| **Differentiation** | Reader questions can shape what the newsroom investigates |
| **Value for Kaleva** | New audience, editorial insight and testable revenue. All three are hypotheses |

## 2. The feedback loop

**Resident asks → community interest → journalist investigates → verified bilingual explanation → both language communities benefit**

Supporting a question never changes its status. An editor decides.

## Preferred demo flow (three minutes)

1. **Open the dashboard** (https://kaleva-local.vercel.app). It has three areas: **Your News** on the left (real Kaleva RSS, *Professionals & families* by default), **Community Radar** on the right, and **Verified Answers** below it.
2. **Highlight Community Radar.** Click **I wonder this too** on the eVaka question and say: "Readers influence what gets covered."
3. **Open Presenter Mode:** **Newsroom demo ↗ → Open Presenter Mode →**, or go straight to `/#presenter`.
4. **Publish the answer.** Use the walkthrough below; the reader panel updates instantly.
5. **Conclude.** Click **Exit to Kaleva Local**: the dashboard's **Verified Answers** now shows the checked answer (EN/FI) and the Radar says *Answer published*.

Business content (the employer pilot, ads and demo scenarios) now lives under **Membership & business**, not on the dashboard.

# Presenter Mode — Live Split-Screen Demo

**URL:** https://kaleva-local.vercel.app/#presenter. You can also open it from **Newsroom demo ↗ → Open Presenter Mode →**.

### Before presenting

- **Browser:** Chrome or Edge, full screen (F11), zoom 100%, one tab only.
- **Resolution:** 1920×1080 is best; 1280×720 works. Newsroom on the left (about 58%), reader on the right (about 42%).
- **Reset:** click **Reset Presenter Demo ↻** at the top right. It resets only the eVaka demo; your other local data stays.
- **Expected start:**
  - The question shows *Submitted* on both sides, with 0 supports.
  - The reader panel says *Waiting for editorial review*.
  - Step 1 of the stepper is active.
  - No answer is visible.
- **Unstable internet:** the page needs the network only for its first load. Load it before you start presenting.

### During presentation: 5 moments, 9 clicks

| # | Click | Say |
|---|---|---|
| 1 | **1 · Select for coverage** | "An international parent asked this. The newsroom picks it up, and the reader sees it move to *Under editorial review*." |
| 2 | **Use the Community Insight as the reason**, then **2 · Open prepared draft** | "The insight shows verified evidence from the City of Oulu notice and what is still unknown. The reader now sees *Being investigated*, but none of the draft." |
| 3 | **3 · Replace unsupported assertion** | "The draft claimed it works on every phone. The source doesn't say that, so approval stays blocked until it is fixed." |
| 4 | Tick **Fact review** and **Language review**, then **Approve this exact version** | "Two explicit human checks approve this exact version. The reader still sees nothing." |
| 5 | **5 · Publish reviewed answer →**, then **FI** on the right | "Published. The reader gets the checked answer instantly, in English and Finnish." |

**Timing:** the automated run takes about 2 s. With narration, expect about 35–45 s; time one rehearsal. Every safeguard stays explicit. Nothing is pre-ticked or combined.

### The WOW moment

When you click **Publish**, the right panel changes immediately, with no reload:
- The status turns to green *Answer published*.
- *Waiting…* becomes **Read the checked answer ↓**.
- A green-edged answer card slides in, showing the approved English text, the question it answers, "Our question to the City of Oulu: not yet answered", the City of Oulu source link and the review disclosure.
- **EN | FI** switches between the approved texts.

### Honest limitations

- Both panels share one browser's local state. This is not cross-device or real-time synchronisation.
- The eVaka draft was prepared by the team, not by AI. One separate real AI generation, on a different RSS story, has succeeded.
- The newsroom is a demonstration, not Kaleva's CMS. The fictional editor's approval is not a Kaleva journalist's approval.

### Fallback

If Presenter Mode fails, use the verified walkthrough below: Community Radar → Newsroom → Published Answer.

## 3. The 45–60-second walkthrough: exact clicks

**Start:** click **Reset demo ↻** in the footer and confirm. This also clears stale data from earlier rehearsals. Then you are on **Your Oulu**.

| Time | Click | Say |
|---|---|---|
| 0–10 s | 1. Point at **Community Radar** in the right column<br>2. **I wonder this too** on the eVaka iPhone question | "A parent (fictional, labelled) asks. Others support it. It is still *Submitted*: support is a signal, not a decision." |
| 10–20 s | 3. **Newsroom demo ↗**<br>4. **Select for coverage** on the first item | "Community Insight shows the need, the signal, and the **verified evidence** from the City of Oulu notice, which is not a Kaleva article. Assessments are labelled." |
| 20–35 s | 5. **Use the Community Insight as the reason**<br>6. **Open prepared draft**<br>7. **Replace unsupported assertion**<br>8. Tick **I checked both drafts**<br>9. Tick **I reviewed the English**<br>10. **Approve reviewed version** | "*Works on every phone* blocked publication. Facts and language must both be checked. Any edit resets the approval." |
| 35–50 s | 11. **Publish to reader feed**<br>12. **Open the published answer**<br>13. **Lue suomeksi**<br>14. **Your Oulu** | "One verified answer, two language communities. The city's follow-up stays *Not yet answered*. Back on the Radar it shows *Answer published* with a link." |

That is 14 clicks. Automated runs pass at 320 px, 390 px and 1440 px. Time a rehearsal; expect about 45–55 s. **If you are over 60 s, skip click 13.** Do not skip any verification click.

## 4. Three-minute pitch (English)

| Time | Say | Show |
|---|---|---|
| 0:00–0:25 | **Problem.** "Oulu's international professionals and families aren't just missing Finnish news. They're missing a voice in local journalism." One person we interviewed didn't know Kaleva existed and got local information from WhatsApp, Instagram, TikTok, Google and Yle. Say it is one interview. | Dashboard: *Your Oulu. Your news. Your voice.* |
| 0:25–0:35 | **Audience.** International professionals and their families, plus the Finnish-speaking neighbours who share their questions. | Hero text |
| 0:35–1:30 | **Product, differentiator and reliability.** The walkthrough above. | Radar → Insight → approval → bilingual answer |
| 1:30–1:55 | **Daily relevance.** Real Kaleva RSS ranked per audience, with visible reasons and uncertain stories marked. AI translation runs on the server, guided by historical 2012 Kaleva English style, and always needs human approval. | **Professionals & families**, then **Why it ranks here** |
| 1:55–2:35 | **Business value.** New audience, editorial insight, and a six-week **employer-funded pilot (€900 test fee)**, with separated local ads or subscriptions later. "These are hypotheses we want to test with Kaleva, not revenue." | **Membership & business** → "What Kaleva could gain" |
| 2:35–3:00 | **Close.** "Kaleva Local gives international residents a voice and turns their questions into verified journalism that connects the whole city." | Radar showing *Answer published* |

## 5. Fallbacks

| Situation | What to do |
|---|---|
| RSS feed unavailable | The walkthrough needs no RSS. The feed shows the last saved copy or a clear error with a link to kaleva.fi; say so and continue. |
| Expected live article gone from the feed | The feed changes daily. Pick any Oulu story near the top of **Professionals & families**; its reasons explain the ranking. |
| AI backend unavailable | The panel says "unavailable… Nothing is generated or simulated." The 45-second walkthrough never needs AI: it uses the team-written eVaka draft, labelled as a concept. Never call that draft AI output. |
| Unstable internet | After the first load, the walkthrough runs from the browser. Backup screenshots: `output/playwright/demo45-2026-10-24/` and `audit-2026-10-24/`. |
| Stale localStorage from rehearsals | Click **Reset demo ↻** in the footer or in the newsroom notice. The audit tests confirm that old and corrupt saved data load without errors and that reset restores the start. |

## 6. Judge questions

1. **Why is this better than Google Translate?** Translation only converts what was already published. We find what newcomers need explained, verify it against the source, state what is still unknown, and publish the same checked answer in two languages.
2. **What makes the AI workflow trustworthy?**
   - The model sees only the headline and feed summary.
   - Output is a draft with `[EDITOR]` placeholders that block approval.
   - Fact and language reviews are both mandatory and tied to the exact version.
   - 2012 Kaleva references guide style only.
   - *Status:* one real end-to-end generation succeeded on 24 Oct (10.4 s, no fidelity warnings, all unsupported details listed as missing). That is one test, not proven quality.
3. **Who pays?** Our hypothesis is employers hiring international staff, starting with one paid pilot. Ads and subscriptions come later. Nothing is validated yet.
4. **How do you attract international residents?** A hypothesis to test: through employers' onboarding and the channels people already use. Our interviewee named WhatsApp, Instagram and TikTok. Share links to answers; no app is needed.
5. **How does the community influence decisions?** Questions and support are signals the editor sees in Community Insight. Editors decide using reader needs and the available sources; popularity alone never decides.
6. **How do you prevent spam and manipulation?**
   - *Implemented (browser only):* length and content checks, no links or contact details, duplicate rejection, 3 questions per 10 min, private by default.
   - *Required for shared use (designed in `SECURITY.md`):* database-level duplicate votes, server rate limits, bot checks, and moderation before anything is public.
7. **What would Kaleva need for a real pilot?** See section 8.

## 7. Real, simulated, unverified

| Real (implemented) | Simulated (labelled) | Unverified |
|---|---|---|
| Live Kaleva RSS and explainable ranking (6 geography levels, uncertain marking) | Seeded questions and the fictional parent | Translation quality beyond **one** successful real test (24 Oct: 10.4 s, 5,683 + 629 tokens, no fidelity warnings) |
| City of Oulu notice as the only evidence; fact and language gates; version-specific approval; corrections | Newsroom: public, no sign-in, browser-only; editor Alex North is fictional | Better quality from 2012 style references |
| Real AI drafts through the team's Agent SDK server, behind the editor access code and caps; "available" requires a backend health check | Supports, statuses and publications exist only in this browser | Ranking accuracy on new stories: the 25-item set has `reviewed: false` and was used for tuning |
| Browser-side question checks | | Demand, willingness to pay, repeat use |

The AI call runs on the team's Agent SDK server with the team's own Claude subscription, for this personal demo only. Generation needs the editor access code. **Never share the code with judges.** Say "one verified test generation", not "proven translation quality".

## 8. Before a real Kaleva pilot

1. Get Kaleva's permission for content reuse and AI processing (`robots.txt` opts out of AI crawlers).
2. Decide on the AI backend (direct API key or the teammate's Agent SDK server), set a spend limit, then run one authorised test and the six-call style comparison.
3. Add shared participation with server-side protections (`SECURITY.md`), plus editor SSO accounts and server-validated publishing.
4. Have a team member review the 25 relevance labels and label a fresh feed as a held-out test.
5. Run a six-week pilot with one employer and measure repeat use, trust, editor time and willingness to pay.
