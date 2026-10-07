# Deployment checklist (sign off before release)
- [ ] `npm test` passes; coverage >= 50% (current: src/ 100%)
- [ ] `ANTHROPIC_API_KEY` set in Vercel env vars, not committed (`git log -p | grep sk-ant` is empty)
- [ ] Production URL loads on mobile and desktop; add/complete habit works
- [ ] Get Insights works with key; with key removed it shows "Computed locally" (error state screenshot)
- [ ] Lighthouse mobile >= 85 (target 90); axe/WAVE: no AA violations
- [ ] README setup verified from a fresh clone
- [ ] Rollback known: promote previous Vercel deployment / `git revert`
- [ ] Monitoring: Vercel logs checked for `/api/insights` 5xx after release
Signed off by: ______  Date: ______
