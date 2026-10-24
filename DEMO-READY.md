# Kaleva Local: demo cheat sheet

Production: https://kaleva-local.vercel.app · PR: https://github.com/rauaap/hackathon/pull/1

## 1. One sentence

**Don't just read the news. Shape it.** International residents in Oulu ask what they need to know, Kaleva journalists verify the answers, and the explanation is published in English and Finnish so the whole city benefits.

Supporting line: *"International residents help reveal what Oulu needs to know. Journalists verify the facts and make the answers accessible across languages."*

## 2. Primary audience

- **Readers:** international parents, professionals and students in Oulu who don't read Finnish well, and the Finnish-speaking readers who share the same questions.
- **Customer (hypothesis):** Kaleva Media. A possible pilot funder is an Oulu-area employer hiring international staff.

## 3. The feedback loop

**International resident asks → community interest → journalist investigates → verified bilingual explanation → both communities benefit**

| Stage in the product | What it shows |
|---|---|
| Community Radar: Submitted, with "I wonder this too" | The question and its interest signal (one support per browser) |
| Under editorial review → Community Insight panel | Need, audience, signal, **verified evidence**, reporting gap, value to Finnish-speaking families |
| Being investigated → prepared draft | Unsupported claim blocks publication; fact and language reviews are both required |
| Answer published | English and Finnish versions, the City of Oulu source, a link back to the question; the city's follow-up is still *Not yet answered* |

Support is a signal; the editor decides. No status changes because of votes.

## 4. The 45-second demo: exact clicks

**Start:** click **Reset demo ↻** in the footer or in the newsroom notice, then go to **Your Oulu**.

| Time | Click | Say |
|---|---|---|
| 0–10 s | 1. **Community Radar: shape what we cover ↓**<br>2. **I wonder this too** on the eVaka iPhone question | "A parent asks. Others support it. The question shows why it matters, and its status is still *Submitted*." |
| 10–20 s | 3. **Newsroom demo ↗**<br>4. **Select for coverage** (first item) | "The Community Insight panel shows the need, the signal (*a signal, not a decision*), and the verified evidence from the City of Oulu notice, which is not a Kaleva article." |
| 20–35 s | 5. **Use the Community Insight as the reason**<br>6. **Open prepared draft**<br>7. **Replace unsupported assertion**<br>8–9. Tick **I checked both drafts** and **I reviewed the English**<br>10. **Approve reviewed version** | "The claim *works on every phone* blocks publication until it is fixed. Facts and language must both be checked, and any edit resets the approval." |
| 35–45 s | 11. **Publish to reader feed**<br>12. **Open the published answer**<br>13. **Lue suomeksi**<br>14. **Your Oulu** | "One verified answer, two language communities. Back on the Radar, the question now reads *Answer published* and links to the answer." |

That is 14 clicks. Automated runs pass on desktop and at 390 px on mobile. Rehearse once: with narration it takes about 45–55 seconds. If time is short, skip click 13.

## 5. Three-minute pitch (English)

| Time | Say | Show |
|---|---|---|
| 0:00–0:30 | "International residents aren't just missing Finnish news. They're missing a voice in local journalism." Then: one interviewee didn't know Kaleva existed and got local information from WhatsApp, Instagram, TikTok, Google and Yle. Say it is one interview. | Landing page and its core message |
| 0:30–1:15 | The 45-second loop above. | Radar → Insight → approval → bilingual answer |
| 1:15–1:45 | Daily relevance: real Kaleva RSS ranked per audience, with visible reasons; uncertain stories are marked as such. AI translation is server-side, guided by historical Kaleva English style, and always needs human approval. | Feed: **Professionals & families**, then **Why it ranks here** |
| 1:45–2:20 | Value for Kaleva: audience growth, editorial insight, and a paid employer pilot. **All three are hypotheses.** | **Membership & business** → "What Kaleva could gain" |
| 2:20–3:00 | "Kaleva Local gives them that voice and turns their questions into verified journalism that connects the whole city." | Radar showing *Answer published* |

## 6. Business value and unvalidated assumptions

- **Audience growth:** reach international residents who may not use Kaleva today.
- **Editorial insight:** questions reveal unmet local information needs, which also matter to Finnish-speaking readers.
- **Revenue potential:** a six-week employer-funded pilot (€900 test fee) plus clearly separated local ads.
- **Not validated:**
  - Demand: our evidence is a single interview.
  - Employer willingness to pay.
  - Repeat use.
  - Editor time per answer.
  - AI cost per story, which is unmeasured.
  - Kaleva's permission to reuse its content.

## 7. What is real, what is simulated

| Real | Simulated or unverified |
|---|---|
| Live Kaleva RSS and explainable per-audience ranking | Seeded questions, labelled *illustrative*; the eVaka parent is fictional |
| City of Oulu eVaka notice (14 Oct 2026) as the only evidence | Supports and statuses exist **only in this browser**; nothing is shared |
| Review gates in the newsroom workflow: blocked claim, both reviews, version-specific approval, corrections | The newsroom is a **public simulation** with no sign-in; editor Alex North is fictional |
| Server-side AI endpoint protection (access code, caps) | The real Claude translation has **never run**: there is no API key. Mocked responses are only used in tests |
| Browser-side spam checks on questions | They are UX safeguards, not server security (see `SECURITY.md`) |

Never say Kaleva's newsroom published the story.

## 8. Fallbacks

- **RSS changed or down:** the demo loop needs no RSS. If Kaleva is unreachable, the feed shows the last saved copy or a clear error.
- **AI unavailable:** the loop uses the prepared eVaka draft, which was written by the team, is labelled as a concept, and is never presented as AI output.
- **Network down:** use the screenshots in `output/playwright/demo45-2026-10-24/`.

## 9. Why a translation button is not enough

A translation button translates what Kaleva already chose to publish. Kaleva Local adds:
1. **Reader questions that reveal gaps**: what newcomers need that nobody has explained yet.
2. **Editorial verification**: what the source says versus what it leaves open, with a follow-up question to the city.
3. **Answers for both language communities**: the same checked text in English and Finnish.

Machine translation, an AI aggregator or a chatbot produces text; this produces accountable journalism that the community asked for.

## 10. Before a real Kaleva pilot

1. Get Kaleva's permission for content reuse and AI processing, since `robots.txt` opts out of AI crawlers.
2. Add shared participation with server-side protections: database-level duplicate votes, rate limits, moderation, bot checks. Design: `SECURITY.md`.
3. Add editor accounts (SSO) and server-validated publishing in place of the public simulation.
4. Add an `ANTHROPIC_API_KEY` with a spend limit, then run the six-call comparison of standard and style-grounded translation.
5. Have a team member review the 25 relevance labels (`reviewed: false`), then label a fresh RSS snapshot as a held-out test.
6. Run a six-week pilot with one employer: measure repeat use, trust, editor time and willingness to pay.
