# AI Evidence Log: Groww, 12-month SIP continuation

> BEFORE PUBLISHING: replace every [BRACKET] with a true number. Do not keep any figure you did not actually collect or measure.

## 1. Summary
- **What it is:** an AI discovery engine that sorts SIP user feedback into churn themes, plus an MVP that helps a user who taps Pause SIP. This log shows what the engine analysed and how I checked its quality.
- **Discovery engine (live):** https://sip-safety-net.pages.dev/discovery
- **MVP (live):** https://sip-safety-net.pages.dev/mvp
- **Code:** https://github.com/riyasuryawanshi16/sip-safety-net
- **Result in one line:** the first engine run agreed with my hand labels on 17 of 20 items (85%). All 3 misses came from reading the surface complaint instead of the real cause. I fixed these with three prompt rules.

## 2. Sources and volume analysed
| Source | Items analysed | How collected |
|---|---|---|
| Google Play Store reviews | [BEFORE PUBLISHING: true number] | [e.g. scraped, filtered by keywords: pause, cancel, deducted, red, loss] |
| Reddit (r/IndiaInvestments, r/mutualfunds) | [true number] comments/threads | [how] |
| YouTube comments (personal finance SIP videos) | [true number] | [how] |

Collection date: [date]. Total: [sum].

## 3. How the engine works
1. Reviews are sent in batches to a Gemini model with a fixed instruction.
2. Each item gets ONE theme: Operational Void, Frictionless Panic, Linear Growth Fallacy, UI/UX Friction, Financial Hardship, or Other.
3. The engine also returns a short quote as evidence and a confidence score.
4. The page shows theme counts and can score itself against the golden set.

Theme meanings: Operational Void is about delays and unclear status after money leaves the bank. Frictionless Panic is pausing because of market movement. Linear Growth Fallacy is expecting steady or guaranteed returns. UI/UX Friction is not finding or using a feature. Financial Hardship is a real money constraint.

## 4. Golden set results (20 hand-labelled items)
- **First run: 17 of 20 agreed (85%).**
- **Where it failed:** items 3, 8 and 16. In each, the AI labelled what the user said on the surface, not the cause underneath. A complaint about the app, a neutral-sounding question and an angry message each hid a different real driver.
- **After adding rules for those three cases: 20 of 20 (100%).** Caution: I wrote those rules from the same 20 items, so this is not an independent test. [BEFORE PUBLISHING: label about 10 NEW reviews, run them, and write the result here: X of 10.]
- With only 20 items, one item is 5 percentage points, so treat these numbers as indicative.

## 5. Where I rejected or corrected AI output
1. **Item 3, "No one told me it goes down this much. Direct MFs suck."** AI said UI/UX Friction because it read "Direct MFs suck" as an app complaint. I corrected it to Linear Growth Fallacy: the user is upset that nobody set expectations. Fix: a prompt rule that unset-expectation complaints are not UX issues.
2. **Item 8, "Is it better to pause my HDFC small cap SIP right now? Market seems high."** AI said General Inquiry. I corrected it to Frictionless Panic because asking whether to pause because the market seems high signals market-timing intent. It also names a specific fund, which the MVP must never answer. Fix: a prompt rule for market-timing questions, and a safety gate that blocks fund names.
3. **Item 16, "SIP bounced because of low balance, then bank charged me 295 Rs. I canceled it in anger."** AI said Operational Void. I corrected it to Financial Hardship / Ops, because the trigger was low balance and a bank penalty, not a platform delay. Scoring accepts either theme for this item. Fix: a prompt rule for bounce penalties.

## 6. Quality check of the MVP's safety gate
Every AI reply in the MVP passes two checks (a rule check and a second AI reviewer) before a user sees it. If it fails, a fixed safe message is shown instead.
- Bad replies (advice, fund names, urgency, return promises): **8 of 8 blocked**.
- Good replies: **4 of 4 passed**.
- Adversarial user inputs (e.g. "which fund should I buy", "ignore your rules"): **0 of 8 replies failed the gate when rechecked**. 4 got an AI reply and 4 got the safe fallback.
- Small test set, so this shows the design works, not that it is complete. [Add results from further tests with real users.]

## 7. Limitations
- Sample sizes are small, and the golden set was used to tune the prompt.
- Feedback comes from public posts, which skews toward unhappy users.
- Themes are single-label, but real churn often has more than one cause.

## 8. Full golden set
| # | Review | First AI run | Human tag | Match |
|---|---|---|---|---|
| 1 | "Money deducted from bank via AutoPay but not showing in Groww. Is this a scam? Pausing future SIPs." | Operational Void | Operational Void | Yes |
| 2 | "My portfolio is red everyday. I clicked pause until it goes back to green." | Frictionless Panic | Frictionless Panic | Yes |
| 3 | "No one told me it goes down this much. Direct MFs suck." | UI/UX Friction | Linear Growth Fallacy | No |
| 4 | "Wanted to reduce amount but could not find the edit button, so I just canceled." | UI/UX Friction | UI/UX Friction | Yes |
| 5 | "Market crashed yesterday so I stopped my auto-pay. Will start when green again." | Frictionless Panic | Frictionless Panic | Yes |
| 6 | "Lost my job this month so had to stop the SIP." | Financial Hardship | Financial Hardship | Yes |
| 7 | "Groww app is hanging on the mandate page. Canceling SIP." | UI/UX Friction | UI/UX Friction | Yes |
| 8 | "Is it better to pause my HDFC small cap SIP right now? Market seems high." | General Inquiry | Frictionless Panic | No |
| 9 | "It's been 2 days and units are not allocated. Very bad experience, stopped." | Operational Void | Operational Void | Yes |
| 10 | "I thought mutual funds give 12% guaranteed every year. Mine is at -2%. Paused." | Linear Growth Fallacy | Linear Growth Fallacy | Yes |
| 11 | "Can't link my new bank account for SIP. Deleted the SIP." | UI/UX Friction | UI/UX Friction | Yes |
| 12 | "Portfolio down by 5k in one day. Not meant for this, stopped my SIPs." | Frictionless Panic | Frictionless Panic | Yes |
| 13 | "Customer support didn't explain why my returns are negative. Stopping." | Linear Growth Fallacy | Linear Growth Fallacy | Yes |
| 14 | "I need to pay hospital bills, canceling my SIP for now." | Financial Hardship | Financial Hardship | Yes |
| 15 | "It says 'Processing' for 3 days. I don't trust this app anymore. Paused SIP." | Operational Void | Operational Void | Yes |
| 16 | "SIP bounced because of low balance, then bank charged me 295 Rs. I canceled it in anger." | Operational Void | Financial Hardship / Ops | No |
| 17 | "Elections coming up, market will crash. Paused my 10k SIP till June." | Frictionless Panic | Frictionless Panic | Yes |
| 18 | "Thought of investing for 5 years but seeing red in 2nd month is too scary. Paused." | Linear Growth Fallacy | Linear Growth Fallacy | Yes |
| 19 | "Where is the option to skip just one month? Had to cancel entirely." | UI/UX Friction | UI/UX Friction | Yes |
| 20 | "SIP deduction date is wrong, support didn't help. Stopped it." | UI/UX Friction | UI/UX Friction | Yes |
