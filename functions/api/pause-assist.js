import { makeGemini } from '../../lib/gemini.js';
import { runAssist } from '../../lib/assist.js';

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.reason !== 'string') {
    return Response.json({ error: 'Send a reason' }, { status: 400 });
  }
  const pct = Number.isFinite(body.portfolioPct) ? body.portfolioPct : 0;
  const result = await runAssist(makeGemini(env), {
    reason: body.reason,
    text: body.text,
    portfolioPct: pct,
  });
  return Response.json(result);
}
