// Scores the discovery engine against the hand-labelled golden set.
// Usage: npm run eval   (needs GEMINI_API_KEY in .dev.vars or the environment)
import { readFileSync, existsSync } from 'node:fs';
import { makeGemini } from '../lib/gemini.js';
import { classifyBatch } from '../lib/prompts.js';
import { parseCsv, acceptedThemes } from '../public/js/csv.js';

for (const file of ['.dev.vars', '.env.local']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const rows = parseCsv(readFileSync('public/data/golden_set.csv', 'utf8'));
const items = rows.map((r, i) => ({ id: i + 1, text: r.review }));
const results = await classifyBatch(makeGemini(process.env), items);

let agree = 0;
const misses = [];
results.forEach((res, i) => {
  const ok = acceptedThemes(rows[i].human_tag).includes(res.theme);
  if (ok) agree++;
  else misses.push({ id: i + 1, review: rows[i].review, human: rows[i].human_tag, ai: res.theme });
});

console.log(`Agreement: ${agree}/${rows.length} (${((agree / rows.length) * 100).toFixed(0)}%)`);
for (const m of misses) {
  console.log(`\n#${m.id} human="${m.human}" ai="${m.ai}"\n  ${m.review}`);
}
