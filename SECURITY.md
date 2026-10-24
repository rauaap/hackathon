# Security: what is enforced today, and what production needs

Kaleva Local is a hackathon demo. Most of it runs in the browser and stores state in `localStorage`. This file separates **real, server-enforced protection** from **demo safeguards** that only guide honest users, and describes the architecture a production version would need.

## 1. What is enforced today

| Area | Where it runs | Real security? |
|---|---|---|
| AI generation (`POST /api/news`) | Vercel Function | **Yes.** It fails closed without `ANTHROPIC_API_KEY` and a 24+ character `NEWSROOM_ACCESS_CODE`. The bearer code is compared in constant time. 10 wrong codes in 10 minutes give `429 locked`. Calls are capped at 20/hour, 60/day and 3 concurrent, and drafts are cached for 24 h. The server re-reads the story from Kaleva's feed itself, so a client cannot inject text. Counters are per server instance, not global. |
| API key | Server environment only | **Yes.** It never reaches the browser bundle. |
| Newsroom (`#newsroom`) | Browser | **No.** It is public: anyone with the link can open it. Selecting, approving and publishing change only that visitor's `localStorage`. The page says this on screen. |
| Approval gates (both reviews, version-specific approval, `[EDITOR]` placeholders) | Browser | **No.** They model the editorial process correctly but can be bypassed in DevTools. They protect nothing shared, because nothing is shared. |
| Community Radar question checks (length, links, contact details, duplicates, 3 per 10 min, 20 s gap) | Browser | **No.** These are UX safeguards. Clearing storage or calling code directly bypasses them. |
| One support per question | Browser (`supported` flag) | **No.** Clearing storage allows another vote. Counts are local and visible only to that browser. |

Nothing users submit leaves their browser, so today there is no shared data an attacker could change.

## 2. Production newsroom: authentication and authorisation

The newsroom must not become a shared admin area by hiding a route or checking a password in the browser. Security has to live on the server.

1. **Identity.** Individual editor accounts through Kaleva's identity provider (SSO/OIDC) or Supabase Auth with SSO. No shared passwords. MFA is required for editors.
2. **Roles.** Stored server-side:
   - `editor`: select questions, draft and review
   - `publisher`: publish
   - `moderator`: approve reader questions
   - `admin`: manage roles
3. **Every write goes through an API route** that verifies the session (JWT or HttpOnly cookie) and the role on each request. Hiding UI is cosmetic.
4. **Server-validated publishing.** The publish endpoint:
   - loads the draft by ID and computes a hash of the exact text
   - requires a fact approval and a language approval recorded against that hash, by authenticated editors (optionally two different people)
   - rejects anything that still contains `[EDITOR` / `[TOIMITTAJA` placeholders
   - stores an immutable published version and writes an audit log entry recording who, when and which hash
5. **Database rules as a second barrier.** Row-level security (RLS) on every table. The browser gets no direct write access; only server routes using the service role write.
6. **AI step.** Replace the shared access code with the editor's session and role, and keep the per-editor and global budget caps.
7. **CSRF and CORS.** Use same-site cookies and an origin check on every write route.

## 3. Shared Community Radar: server-side design

Required before supports and questions are shared between users:

| Threat | Control |
|---|---|
| Duplicate votes | Database: `supports(question_id, voter_id)` with `UNIQUE(question_id, voter_id)`, inserted with `ON CONFLICT DO NOTHING`. The count is computed by the server, never sent by the client. |
| Anonymous sessions | `voter_id` = random 128-bit ID in an HttpOnly, Secure, SameSite=Lax cookie signed with HMAC (`VOTER_SECRET`). No accounts or personal data. Because clearing cookies creates a new ID, add the next row too. |
| Vote and submit flooding | Rate limits per voter ID **and** per IP hash: for example 30 supports/hour and 3 questions per 10 min. Use a Postgres counter table or Upstash Redis, global rather than per instance. IP addresses are stored only as a salted hash with a short retention period. |
| Automated submissions | A bot challenge on submit (Cloudflare Turnstile or Vercel BotID), a hidden honeypot field, and a minimum time-to-submit. All are verified on the server. |
| Unsafe or personal content | The server repeats the client checks: length, links, contact details and normalised-duplicate detection. New questions are stored as `pending`. **Nothing is public until a moderator approves it**, and the moderator can edit out personal details. Rejected questions are deleted after a short retention period. |
| Vote-driven coverage | Status changes (`review`, `investigating`, `published`) are editor actions on authenticated routes. Supports are shown to editors as one signal only; no threshold changes a status automatically. |
| Unauthenticated admin changes | Status and moderation routes require an editor role (section 2). Shared tables have no anonymous write path except the two rate-limited public routes: *support* and *submit question → pending*. |
| Backend outage | If the API is unreachable, the reader UI falls back to the current browser-local mode, clearly labelled "Offline: counted in this browser only". |

## 4. Remaining risks in the current deployment

- Anyone can open `#newsroom`. This is acceptable only because it changes nothing shared. Do not connect shared data to it without section 2.
- The AI access code is a single shared secret. If it leaks, rotate it in Vercel and redeploy. The budget caps limit the damage, but because they are per instance they are approximate.
- No real model call has been made yet, so the cost of each request is unmeasured. Set a spend limit in the Anthropic Console.
- The RSS feed is third-party input. The parser rejects entity declarations and foreign links, and React escapes all text.
