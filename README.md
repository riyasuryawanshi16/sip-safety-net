# SIP Safety Net (Groww, 12-month SIP continuation)

Two things in one free-to-host web app:

1. **Discovery Engine** (`public/discovery.html`): classifies user feedback into churn themes and compares the AI against a hand-labelled golden set.
2. **MVP: Contextual Safety Net** (`public/mvp.html`): a mock "Pause SIP" flow. The user says why they want to pause, AI writes a calm reply, and a two-layer safety gate (rules + an AI reviewer) checks it. If the gate blocks it, the AI is unsure, or the AI is down, a static safe message is shown instead. The user can always pause in one tap.

This is not investment advice and does not recommend funds or stocks.

## Structure

```
public/        static pages (landing, discovery, mvp), css, js
  data/        golden set (served to the discovery page, read by the eval)
functions/api/ Cloudflare Pages Functions (hold the API key, never the browser)
lib/           Gemini client, prompts, safety guard, assist pipeline
evals/         golden-set eval (engine) and gate eval (MVP safety)
data/raw/      raw scraped reviews (git-ignored)
scripts/       data collection helpers
docs/          evidence log, research guides, metrics, deck
```

## Setup

1. Free key: https://aistudio.google.com/apikey
2. `cp .dev.vars.example .dev.vars` and set `GEMINI_API_KEY`
3. `npm run dev` and open the printed local URL

## Evals

```
npm run eval        # discovery engine vs golden set
npm run eval:gate   # MVP safety gate
```

## Deploy (Cloudflare Pages, free)

```
npx wrangler login
npx wrangler pages project create sip-safety-net --production-branch main
npx wrangler pages secret put GEMINI_API_KEY --project-name sip-safety-net
npm run deploy
```
