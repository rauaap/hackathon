# Kaleva Local: demo cheat sheet

Production: https://kaleva-local.vercel.app · PR: https://github.com/rauaap/hackathon/pull/1

## 1. One sentence

Kaleva Local turns Kaleva's Finnish local news into trustworthy English explainers for Oulu's international residents: stories are ranked by what matters to them, translated with AI assistance, and published only after a human editor checks every fact.

## 2. Audience

- **Readers:** international students, professionals and families in Oulu who don't read Finnish well.
- **Buyer (hypothesis):** Oulu-area employers that recruit international staff and want them to settle in and stay.

## 3. Three-minute pitch outline

| Time | Say | Show |
|---|---|---|
| 0:00–0:30 | Oulu has thousands of international residents, but local news about daycare, transport, strikes and city services is published in Finnish. People miss things that affect their daily lives. | Landing page: the headline and one-line value proposition |
| 0:30–1:45 | Real Kaleva RSS, ranked per audience with visible reasons. An editor opens a story; the AI translation is guided by historical Kaleva English style references; a human verifies and approves. | Feed → newsroom → source brief → approval (clicks below) |
| 1:45–2:20 | Proposed B2B model: a paid six-week pilot with one employer (€900 test fee), plus clearly separated local advertising. This is a hypothesis: we have no customer validation yet. | "Membership & business" tab |
| 2:20–3:00 | Different from machine translation: sources stay visible, gaps are stated, nothing publishes without human review, and reader questions guide coverage. Kaleva gains a new audience and a new revenue test. | Published story with source link and review note |

## 4. Exact clicks

Before the demo, open the site once and click **Reset demo ↻** in the footer.

1. Landing page: point at the value proposition. Click **Professionals & families**, then **Today's Kaleva news, ranked for you ↓**.
2. Open **Why it ranks here** on the top story to show the scoring reasons, e.g. "Oulu +2" or "Transport +1.5".
3. Toggle **Students** to show that the order changes. Toggle **Everyone** to show the plain chronological feed.
4. On the example story, click **Ask the newsroom to explain**, then **Open newsroom demo**.
5. In the queue: on that story, click **Select for coverage**. Type a reason, e.g. "Affects commuters in Oulu." Then click **Open source brief**.
6. AI assistant panel: show **Translation mode: historical Kaleva style-grounded, 2012**, the linked references and the "historical, style only" labels.
   - **API key configured:** enter the access code and click **Generate English draft**. Show the Finnish source and the proposed English side by side, and the `[EDITOR: …]` placeholders that block approval.
   - **No key:** show the "AI unavailable" message. Say plainly that the AI is not connected in this demo.
7. Human verification, the most reliable path:
   1. Click **Your Oulu → Newsroom demo ↗**.
   2. Select the first queue item (eVaka) with **Select for coverage**, type a reason, then click **Open prepared draft**.
   3. Tick both review checkboxes and show that approval is still blocked by the claim marked **BLOCKS PUBLICATION**.
   4. Click **Replace unsupported assertion**, tick both checkboxes again, click **Approve reviewed version**, then **Publish to reader feed**.
8. Click **Your Oulu**. Open the published eVaka story to show the source link, the "what we don't know yet" section and the open follow-up question. Click **Ask a question** to show the private question queue.

## 4b. Community Radar loop (45 seconds)

Message: **"Don't just read the news. Shape it."** Reader question → community interest → editorial selection → verified explanation → published answer.

1. On the landing page, click **Community Radar: shape what we cover ↓**. Show the four stages: Submitted → Under editorial review → Being investigated → Answer published.
2. On the eVaka iPhone question, click **I wonder this too**. The count goes to 1 and the button locks: one support per question in this browser.
3. **Newsroom demo ↗** → **Select for coverage**. The status changes to *Under editorial review*. Say: "Support is a signal; the editor decides."
4. Type a reason and click **Open prepared draft**. The status changes to *Being investigated*, and the dated City of Oulu notice is the source.
5. Click **Replace unsupported assertion**, tick both checkboxes, then **Approve reviewed version** → **Publish to reader feed**. The status changes to *Answer published*.
6. **Your Oulu** → Radar → **Read the checked answer**. Show the reader's question, the back-link and the city question still marked *Not yet answered*.

## 5. Strongest example stories

- **Live RSS (24 Oct):** "Rekan perävaunusta irtosi ovi Pohjantiellä…". It is an Oulu story about traffic and safety, ranks first for students, and matches style reference R4 with the term "traffic".
  - **Alternatives:** the Parkkipate strike (work, R9) and "Lapsiperheköyhyys näkyy Oulun päiväkodeissa" (families, R2). R2 also shows the 2012 term "kindergarten" flagged in favour of the current "ECEC centre".
- **Complete end-to-end story:** the eVaka explainer. It has a dated City of Oulu source, a known/unknown split, a blocked unsupported claim and a follow-up question to the city.

## 6. Backup plan

- **RSS changed:** the feed shows whatever Kaleva publishes that day. Pick any Oulu story near the top of either audience. If Kaleva is unreachable, the page shows the last saved copy or a clear error with a link to kaleva.fi. The eVaka path (step 7) needs no RSS.
- **AI unavailable:** the panel says so, and nothing fake is shown. Continue with step 7. The prepared eVaka draft was written by the team and is labelled as a concept. Never call it AI output.
- **No network:** use the screenshots in `output/playwright/`.

## 7. Three benefits for Kaleva

1. **New audience:** reaches international residents Kaleva doesn't serve today, using journalism it already publishes.
2. **New revenue test:** an employer pilot and local advertising aimed at a clearly defined group.
3. **Trust as a differentiator:** visible sources, mandatory human review and stated gaps protect the brand, unlike raw machine translation.

## 8. Business model (unverified)

- **Model:** a six-week paid employer pilot (€900 test fee) plus clearly separated local ads.
- **Unverified assumptions:**
  - Employers will pay.
  - International residents will return weekly.
  - Editor time per story fits within the price.
  - AI cost per story is small. This has not been measured, because no real model call has run.
  - Kaleva allows this use of its content.

## 9. Likely judge questions

- **"Is the AI real?"** The integration calls Claude on the server, behind an access code and call caps. On demo day it is [live / not configured: say which]. We never show simulated AI output as real.
- **"Why not just Google Translate?"** Translation is the easy part. We choose what matters to each audience, state what the source doesn't say, and nothing publishes without an editor.
- **"Can old 2012 articles introduce wrong facts?"** No. Only our own style notes and term pairs reach the model, never Kaleva's article text. Reference names and figures that appear in a draft are flagged automatically.
- **"How does ranking work?"** Transparent rules: topic weights per audience, plus points for Oulu, the Oulu region and recency, minus points for other towns and opinion pieces. Every reason is shown to the reader.
- **"Who pays?"** Our hypothesis is employers recruiting international talent. The next step is one paid pilot, not a scale-up.

## 10. Status

| Feature | Status |
|---|---|
| Live Kaleva RSS feed, per-audience ranking with reasons | **Working** (production) |
| Selection of historical 2012 style references | **Working** (production) |
| Newsroom queue, version-specific two-step approval, publish, corrections | **Working**, but stored only in this browser (localStorage) |
| eVaka explainer and its draft | **Prepared by the team**, labelled as a concept, not AI |
| Community Radar: question stages, editor-driven status, link from published answer back to question | **Working** in the demo, stored only in this browser |
| Reader questions and "I wonder this too" support | **Simulated**: seeded questions are illustrative, supports start at 0 and count only in this browser, nothing is sent |
| Editor "Alex North", approvals | **Fictional**: not a Kaleva journalist |
| Live Claude translation | **Built and tested with mocks; unverified with a real model**: no API key in production |
| Better quality from style references | **Unverified**: no real model comparison has been run |
| Business model, willingness to pay | **Hypothesis** |
