# Deployment checklist
- [x] `npm test` passes: 30 tests, 100% coverage on logic and API files
- [x] `GEMINI_API_KEY` set in Vercel environment variables, not committed to the repo
- [x] Production URL loads on mobile and desktop; adding and completing a habit works
- [x] Get Insights works with the key; without the AI it shows "Computed locally" (error state screenshot saved)
- [x] Lighthouse mobile 100 / 100 / 100 / 100; axe DevTools 0 issues (WCAG 2.1 AA, best practices on)
- [ ] README setup verified from a fresh clone
- [x] Rollback known: promote the previous deployment in Vercel, or `git revert` and push to main
- [x] Monitoring: Vercel runtime logs checked for /api/insights errors after release

Signed off by: Qazi Abdul Muiz    Date: 8 October 2026