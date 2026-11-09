const $ = (id) => document.getElementById(id);
const PORTFOLIO_PCT = -4.2;

const dlg = $('dlg');

function openDialog() {
  $('step1').hidden = false;
  $('step2').hidden = true;
  $('note').value = '';
  $('ask').disabled = false;
  $('ask').textContent = 'Continue';
  dlg.showModal();
}

function checkLines(res) {
  const g = res.gate;
  if (!g) {
    return ['No AI reply was shown. A standard message was used instead.'];
  }
  const lines = [];
  lines.push(
    g.deterministic.length
      ? `Rule check: blocked (${g.deterministic.join(', ')})`
      : 'Rule check: passed (no fund names, advice phrases, urgency or return promises)'
  );
  if (g.judge) {
    lines.push(
      g.judge.passes && !g.judge.violations.length
        ? 'AI reviewer: passed'
        : `AI reviewer: blocked (${g.judge.violations.join(', ') || 'unspecified'})`
    );
  } else if (g.reason === 'judge_unavailable') {
    lines.push('AI reviewer: unavailable, so the reply was blocked to be safe');
  }
  return lines;
}

function showReply(res) {
  $('step1').hidden = true;
  $('step2').hidden = false;
  $('msg').textContent = res.message;
  $('badge').className = res.source === 'ai' ? 'badge ok' : 'badge info';
  $('badge').textContent =
    res.source === 'ai'
      ? '✔ Safety check passed. This reply was written by AI.'
      : 'ℹ Standard guidance shown. The AI reply was not used (' + (res.fallbackWhy || 'safety') + ').';
  $('checks').innerHTML = '';
  for (const line of checkLines(res)) {
    const li = document.createElement('li');
    li.textContent = line;
    $('checks').appendChild(li);
  }
  if (res.source === 'fallback' && !res.gate) {
    const li = document.createElement('li');
    li.textContent = `Reason: ${res.fallbackWhy}`;
    $('checks').appendChild(li);
  }
}

$('pause').addEventListener('click', openDialog);
$('cancel1').addEventListener('click', () => dlg.close());

$('ask').addEventListener('click', async () => {
  const reason = document.querySelector('input[name="reason"]:checked').value;
  $('ask').disabled = true;
  $('ask').textContent = 'Thinking...';
  try {
    const r = await fetch('/api/pause-assist', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason, text: $('note').value, portfolioPct: PORTFOLIO_PCT }),
    });
    if (!r.ok) throw new Error('bad status');
    showReply(await r.json());
  } catch {
    showReply({
      message: 'We could not load a note just now. You can still choose below. For personal guidance, speak to a SEBI-registered investment adviser.',
      source: 'fallback',
      fallbackWhy: 'network_error',
      gate: null,
    });
  }
});

const OUTCOMES = {
  continue: 'Your SIP stays active. (Demo)',
  reduce: 'This would open the edit-amount screen. (Demo)',
  pause: 'Your SIP is paused. You can resume it any time. (Demo)',
};

dlg.querySelectorAll('[data-choice]').forEach((b) =>
  b.addEventListener('click', () => {
    $('outcome').textContent = OUTCOMES[b.dataset.choice];
    dlg.close();
  })
);
