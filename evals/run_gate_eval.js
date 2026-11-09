// Scores the MVP safety gate.
// Part A: labelled draft replies. Bad drafts must be blocked, good drafts must pass.
// Part B: adversarial user inputs through the full pipeline. The reply shown must itself pass the gate.
// Usage: npm run eval:gate   (needs GEMINI_API_KEY in .dev.vars or the environment)
import { readFileSync, existsSync } from 'node:fs';
import { makeGemini } from '../lib/gemini.js';
import { checkDraft } from '../lib/guard.js';
import { runAssist } from '../lib/assist.js';

for (const file of ['.dev.vars', '.env.local']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const gen = makeGemini(process.env);
const pause = () => new Promise((r) => setTimeout(r, 3000)); // stay under free-tier rate limits
const cases = JSON.parse(readFileSync('evals/gate_cases.json', 'utf8'));

// Part A
let blockedBad = 0, passedGood = 0;
const bad = cases.drafts.filter((d) => d.shouldBlock);
const good = cases.drafts.filter((d) => !d.shouldBlock);
for (const d of cases.drafts) {
  await pause();
  const g = await checkDraft(gen, d.text);
  if (g.reason === 'judge_unavailable') console.log(`ERROR (AI unavailable, result invalid): ${d.text}`);
  const blocked = !g.passed;
  if (d.shouldBlock && blocked) blockedBad++;
  if (!d.shouldBlock && !blocked) passedGood++;
  if (blocked !== d.shouldBlock) console.log(`MISS (${d.shouldBlock ? 'leaked' : 'false block'}): ${d.text}`);
}
console.log(`\nA. Bad drafts blocked: ${blockedBad}/${bad.length}`);
console.log(`A. Good drafts passed: ${passedGood}/${good.length}`);

// Part B
let leaks = 0, aiReplies = 0, fallbacks = 0;
for (const p of cases.probes) {
  await pause();
  const res = await runAssist(gen, { reason: p.reason, text: p.text, portfolioPct: -4.2 });
  if (res.source === 'ai') aiReplies++; else fallbacks++;
  // Recheck what was actually shown. Static fallbacks must also be clean.
  await pause();
  const recheck = await checkDraft(gen, res.message);
  if (recheck.reason === 'judge_unavailable') console.log('ERROR (AI unavailable, recheck invalid)');
  if (!recheck.passed) {
    leaks++;
    console.log(`LEAK for "${p.text}": ${res.message}`);
  }
  console.log(`- [${res.source}${res.fallbackWhy ? ':' + res.fallbackWhy : ''}] ${p.text}`);
}
console.log(`\nB. Replies that failed the gate when rechecked: ${leaks}/${cases.probes.length}`);
console.log(`B. AI replies shown: ${aiReplies}, safe fallbacks shown: ${fallbacks}`);
