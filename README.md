# LEVELUP

Habit tracker that turns daily logs into XP, streaks and levels, then uses Gemini to explain your patterns.

**Problem / user / why:** _(1 paragraph: who needs this, what it solves, why you chose it)_
**Live:** https://level-up-eta-six.vercel.app

## Run locally (under 5 minutes)
Requires Node 18+ (check with `node -v`).

```bash
npm install
npm run dev        # site only: opens http://localhost:5173, AI insights fall back to local
npm test           # unit tests
npm run coverage   # coverage report
```

To try the real AI locally, copy `.env.example` to `.env.local`, add your `GEMINI_API_KEY` (free key from aistudio.google.com), and run `npx vercel dev` instead of `npm run dev`.


## Architecture
| Path | Role |
|---|---|
| `index.html` + `src/main.js` | Accessible UI (landmarks, labelled controls, focus kept after actions, reduced motion), state in `localStorage` |
| `src/logic.js` | Pure functions: XP, levels, streaks, rates, `buildFacts`, `localInsights` |
| `src/validate.js` | Schema and grounding check for AI output |
| `src/insights-client.js` | Calls `/api/insights`, validates, falls back locally |
| `api/insights.js` | Serverless proxy: keeps API key server-side, calls Gemini |

## AI integration
The browser computes numeric facts (per-habit rate, streak, weakest weekday) and sends only those. `api/insights.js` calls `Gemini-haiku-4-5-20251001` with a forced tool call (`report_insights`) so the reply is structured JSON: headline, explanation, one suggestion, evidence. The system prompt says to use only supplied numbers. `validateInsights` then rejects any evidence value not present in the input, so invented statistics never reach the screen. Haiku keeps latency and cost low for a short summarisation task. Habit names are sent to the API.

## Failure modes (fails safely)
Timeout (15 s server, 18 s client), HTTP error, missing key, malformed or ungrounded output: all show locally computed insights labelled "Computed locally". Covered by `tests/ai.test.js`.

## Testing evidence
`npm run coverage`: 30 tests pass; 100% statement and line coverage on `src/logic.js`, `src/validate.js`, `src/insights-client.js` and `api/insights.js`. Tests cover XP, levels and streaks, the AI-output validator (including rejecting invented numbers), the client fallback, and the serverless endpoint (bad input, missing key, model retry, upstream errors, timeouts).

Not unit-tested: the UI code (`src/main.js`). It was checked with axe DevTools, Lighthouse and a manual keyboard test. A Playwright end-to-end test is a possible next step.

## Performance & accessibility
   Lighthouse (mobile, live URL, three runs): Performance 100, Accessibility 100, Best Practices 100, SEO 100. One earlier run scored 65 on performance; I re-ran in a clean private window and it did not repeat, so I treated it as noise from browser extensions.

   axe DevTools (WCAG 2.1 AA, best practices on): 0 issues.

   Improvements: the automated audits found no violations. Fixes came from reading the code and from my own review: focus was lost after marking a habit done (now restored), the habit button label changed with its state (now a fixed label plus aria-pressed), and a CSS media-query typo broke the desktop layout (found by viewing the page, then fixed).

## Deployment & rollback
See `docs/DEPLOYMENT_CHECKLIST.md`. Rollback: Vercel dashboard -> Deployments -> promote previous deployment (or `git revert` and push `main`).

## Known limitations / next steps
Only today can be logged; data is per-browser; insights need ~2 weeks of history to be meaningful.
