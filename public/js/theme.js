// Light/dark toggle. Falls back to the system setting if storage is unavailable.
const root = document.documentElement;
const btn = document.getElementById('theme');

function stored() {
  try { return localStorage.getItem('theme'); } catch { return null; }
}
function save(v) {
  try { localStorage.setItem('theme', v); } catch { /* ignore */ }
}
function current() {
  return root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
function paint() {
  if (btn) {
    const dark = current() === 'dark';
    btn.textContent = dark ? '☀' : '☾';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
}

const saved = stored();
if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
paint();

btn?.addEventListener('click', () => {
  const next = current() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  save(next);
  paint();
});
