# LEVELUP

Habit tracker that turns daily logs into XP, streaks and levels, then uses Claude to explain your patterns.

**Problem / user / why:** _(1 paragraph: who needs this, what it solves, why you chose it)_
**Live:** _<your Vercel URL>_

## Run locally (under 5 minutes)
```bash
npm install
cp .env.example .env.local     # add ANTHROPIC_API_KEY
npx vercel dev                 # runs site + /api/insights (or `npm run dev` for UI only: AI falls back to local)
npm test                       # unit tests;  npm run coverage  # coverage report
```

## Architecture
| Path | Role |
|---|---|
| `index.html` + `src/main.js` | Accessible UI (landmarks, labelled controls, focus kept after actions, reduced motion), state in `localStorage` |
| `src/logic.js` | Pure functions: XP, levels, streaks, rates, `buildFacts`, `localInsights` |
| `src/validate.js` | Schema and grounding check for AI output |
| `src/insights-client.js` | Calls `/api/insights`, validates, falls back locally |
| `api/insights.js` | Serverless proxy: keeps API key server-side, calls Claude |

## AI integration
The browser computes numeric facts (per-habit rate, streak, weakest weekday) and sends only those. `api/insights.js` calls `claude-haiku-4-5-20251001` with a forced tool call (`report_insights`) so the reply is structured JSON: headline, explanation, one suggestion, evidence. The system prompt says to use only supplied numbers. `validateInsights` then rejects any evidence value not present in the input, so invented statistics never reach the screen. Haiku keeps latency and cost low for a short summarisation task. Habit names are sent to the API.

## Failure modes (fails safely)
Timeout (8 s server, 9 s client), HTTP error, missing key, malformed or ungrounded output: all show locally computed insights labelled "Computed locally". Covered by `tests/ai.test.js`.

## Testing evidence
`npm run coverage`: 21 tests pass, 100% line coverage on `src/` logic modules. Paste your own terminal screenshot here. E2E flow is not included; add one Playwright test if time allows.

## Performance & accessibility
Lighthouse (mobile): _fill in_ · axe/WAVE: _fill in_ · One fix made from the audit: _describe before/after_

## Deployment & rollback
See `docs/DEPLOYMENT_CHECKLIST.md`. Rollback: Vercel dashboard -> Deployments -> promote previous deployment (or `git revert` and push `main`).

## Known limitations / next steps
Only today can be logged; data is per-browser; insights need ~2 weeks of history to be meaningful.
