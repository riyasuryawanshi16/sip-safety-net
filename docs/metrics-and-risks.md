# Success metrics and risks

## Success metrics

| Type | Metric | Definition |
|---|---|---|
| North star | 12-month SIP continuation | First-time investors with at least one successful instalment in the last 30 days, 12 months after their first SIP |
| Leading | Pause-save rate | Pause attempts where the user keeps or lowers the SIP after the note, divided by all pause attempts |
| Leading | 60-day resume rate | Paused SIPs restarted within 60 days |
| Guardrail | Pausing stays easy | One extra step at most to pause, and no rise in pause-related support tickets |
| AI quality | Gate and accuracy checks | Bad replies blocked (target 100%), agreement on fresh labelled items (target 90%+), share of replies that fall back to the safe message |

## Risks and mitigations

| Risk | What could go wrong | Mitigation |
|---|---|---|
| Feels like a nudge to stay | Users read the note as pressure | No urgency or fear words, pause always one tap, test the wording with users and watch pause complaints |
| AI slips into advice | A fund name or "you should" reaches a user | Two-layer safety check, fixed safe message on any doubt, tested on tricky prompts |
| AI service is down or out of quota | The free tier limits daily requests | Fall back to the safe message, try other models, move to a paid plan at scale |
| Evidence is thin | Small labelled set, public posts skew unhappy, small survey | Label more data, run more research, A/B test before any rollout |
| The note is ignored | Users pause anyway | Track pause-save rate, tailor by reason, add "skip a month" so a break is not a cancel |
