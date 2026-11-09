# Project NextStep: Optimizing Long-Term SIP Continuation on Groww

An AI-powered discovery engine and a safety-checked MVP that help first-time investors keep their SIP going past month 12. Built as a Growth Team case study for Groww.

> **Prototype only.** This is not Groww's product. Nothing here is investment advice, and it never recommends funds or stocks.

## Live links

| What | Link |
|---|---|
| AI Discovery Engine | https://sip-safety-net.pages.dev/discovery |
| MVP: Contextual Safety Net | https://sip-safety-net.pages.dev/mvp |
| AI Evidence Log | https://docs.google.com/document/d/1laF68KGPUpQl4HOiRaski36pD20x19bCIZAExka9gH0/edit |

## The problem in short

Many first-time investors start a SIP with good intent and then pause it in a worried moment. In our research, pausing clusters in the first 6 months, and people rarely use in-app support when they feel unsure. Pausing is one tap, so it becomes the quickest way to feel in control.

Goal: increase the share of first-time investors who still have an active SIP 12 months after starting.

## What is in this repo

### 1. Discovery Engine (`/discovery`)
Paste user feedback, one item per line. AI tags each item with one churn theme and a short piece of evidence:

- Operational Void (delays or unclear status after money leaves the bank)
- Frictionless Panic (pausing because of market movement)
- Linear Growth Fallacy (expecting steady or guaranteed returns)
- UI/UX Friction (cannot find or use a feature)
- Financial Hardship (a real money constraint)
- Other

A **Run on golden set** button scores the engine against 20 hand-labelled items and shows where it disagrees.

### 2. MVP: Contextual Safety Net (`/mvp`)
A mock "Pause SIP" screen. The user picks a reason and AI writes a short, calm note. The user can always keep, lower or pause in one tap.

Every AI reply passes **two checks** before the user sees it:

1. **Rule check:** blocks fund or company names, advice phrases, urgency or fear words, and return promises.
2. **AI reviewer:** a second model call that judges the same risks.

If either check blocks the reply, the AI is unsure, or the AI service is down, a fixed safe message is shown instead, pointing to official sources. The page shows which checks ran.

## Results so far

| Check | Result |
|---|---|
| Discovery engine, first run on the 20-item golden set | 17 of 20 (85%) |
| After prompt rules from the 3 corrections | 20 of 20 (100%). Not independent, because the rules were written from the same items |
| 10 additional test items not used to tune the rules | 10 of 10 |
| Safety gate, bad replies blocked | 8 of 8 |
| Safety gate, good replies passed | 4 of 4 |
| Safety gate, tricky user prompts that leaked | 0 of 8 |

These are small test sets. They show the design works, not that it is complete. See the Evidence Log for sources, the full golden set, and the corrections.

## Project structure

```
public/          Static pages (home, discovery, mvp), CSS and JS
  data/          Golden set (served to the discovery page, read by the eval)
functions/api/   Cloudflare Pages Functions that call the AI (the key never reaches the browser)
lib/             Gemini client, prompts, safety guard, assist pipeline
evals/           Golden-set eval (engine) and gate eval (MVP safety)
docs/            Evidence Log, research guide, metrics and risks, deck PDF
data/raw/        Raw collected data (git-ignored)
```

## Run locally

Requirements: Node.js and a free Gemini API key from https://aistudio.google.com/apikey

```bash
cp .dev.vars.example .dev.vars   # then set GEMINI_API_KEY
npm run dev                      # opens a local Cloudflare Pages server
```

Never commit `.dev.vars`. It is git-ignored.

## Run the evals

```bash
npm run eval        # discovery engine vs the golden set
npm run eval:gate   # MVP safety gate
```

## Deploy (Cloudflare Pages, free)

```bash
npx wrangler login
npx wrangler pages project create sip-safety-net --production-branch main
npx wrangler pages secret put GEMINI_API_KEY --project-name sip-safety-net
npm run deploy
```

## Tech

- Front end: plain HTML, CSS and JavaScript, no build step
- Back end: Cloudflare Pages Functions
- AI: Google Gemini API. The client tries a list of models in order, because the free tier limits requests per model per day

## Limitations

- The free AI tier allows only a small number of requests per day, so heavy testing can exhaust it. When that happens the MVP shows the safe fixed message.
- Test sets are small, and the golden set was also used to tune the prompt.
- Public posts skew toward unhappy users.
- User testing of the MVP with real users is the next step and has not been completed.
- The AI never gives investment advice. For personal guidance, speak to a SEBI-registered investment adviser.
