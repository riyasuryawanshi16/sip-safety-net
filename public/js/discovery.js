import { parseCsv, acceptedThemes } from '/js/csv.js';

const $ = (id) => document.getElementById(id);
const BATCH = 15;
const MAX_ITEMS = 60;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function setBusy(busy) {
  $('run').disabled = busy;
  $('golden').disabled = busy;
}

async function classify(texts) {
  const out = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    $('status').textContent = `Classifying ${Math.min(i + BATCH, texts.length)} of ${texts.length}...`;
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reviews: texts.slice(i, i + BATCH) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    out.push(...data.results);
  }
  return out;
}

function renderSummary(results) {
  const counts = {};
  for (const r of results) counts[r.theme] = (counts[r.theme] || 0) + 1;
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = rows[0]?.[1] || 1;
  $('summary').innerHTML =
    '<div class="card"><h2>Theme counts</h2>' +
    rows
      .map(
        ([theme, n]) => `<div class="bar-row">
          <span>${esc(theme)}</span>
          <div class="bar-track"><div class="bar" style="width:${(n / max) * 100}%" role="img" aria-label="${esc(theme)}: ${n}"></div></div>
          <span>${n} (${Math.round((n / results.length) * 100)}%)</span>
        </div>`
      )
      .join('') +
    '</div>';
}

function renderTable(results, golden) {
  const head = golden
    ? '<th>#</th><th>Review</th><th>AI theme</th><th>Human tag</th><th>Match</th>'
    : '<th>#</th><th>Review</th><th>Theme</th><th>Evidence</th><th>Conf.</th>';
  const body = results
    .map((r, i) =>
      golden
        ? `<tr><td>${i + 1}</td><td>${esc(r.text)}</td><td><span class="pill">${esc(r.theme)}</span></td><td><span class="pill">${esc(golden[i].human_tag)}</span></td><td>${r.match ? '<span class="match-yes">✔ Yes</span>' : '<span class="match-no">✖ No</span>'}</td></tr>`
        : `<tr><td>${i + 1}</td><td>${esc(r.text)}</td><td><span class="pill">${esc(r.theme)}</span></td><td>${esc(r.evidence)}</td><td>${r.confidence.toFixed(2)}</td></tr>`
    )
    .join('');
  $('results').innerHTML = `<h2>Results</h2><div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

async function run(texts, golden = null) {
  setBusy(true);
  $('agreement').innerHTML = '';
  $('summary').innerHTML = '';
  $('results').innerHTML = '';
  try {
    const results = await classify(texts);
    if (golden) {
      results.forEach((r, i) => (r.match = acceptedThemes(golden[i].human_tag).includes(r.theme)));
      const n = results.filter((r) => r.match).length;
      $('agreement').innerHTML = `<div class="card"><h2>Agreement with human labels</h2><div class="stat-row"><div class="stat"><b>${Math.round((n / results.length) * 100)}%</b>agreement</div><div class="stat"><b>${n} / ${results.length}</b>items matched</div></div><p class="muted small">Rows marked No show where the engine failed. Note: the engine's rules were tuned using these same items, so also test on fresh items.</p></div>`;
    }
    renderSummary(results);
    renderTable(results, golden);
    $('status').textContent = 'Done.';
  } catch (err) {
    $('status').innerHTML = `<span class="error">${esc(err.message)}</span>`;
  } finally {
    setBusy(false);
  }
}

$('run').addEventListener('click', () => {
  const texts = $('input').value.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, MAX_ITEMS);
  if (!texts.length) {
    $('status').textContent = 'Paste at least one review first.';
    return;
  }
  run(texts);
});

$('golden').addEventListener('click', async () => {
  try {
    const csv = await (await fetch('/data/golden_set.csv')).text();
    const rows = parseCsv(csv);
    run(rows.map((r) => r.review), rows);
  } catch {
    $('status').innerHTML = '<span class="error">Could not load the golden set.</span>';
  }
});
