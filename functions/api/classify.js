import { makeGemini } from '../../lib/gemini.js';
import { classifyBatch } from '../../lib/prompts.js';

const MAX_ITEMS = 25;
const MAX_CHARS = 500;

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  const reviews = body?.reviews;
  if (!Array.isArray(reviews) || reviews.length === 0 || reviews.length > MAX_ITEMS) {
    return Response.json({ error: `Send 1 to ${MAX_ITEMS} reviews per request` }, { status: 400 });
  }
  const items = reviews.map((text, i) => ({ id: i + 1, text: String(text).slice(0, MAX_CHARS) }));

  try {
    const results = await classifyBatch(makeGemini(env), items);
    return Response.json({ results: results.map((r, i) => ({ ...r, text: items[i].text })) });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'The AI service failed. Try again in a moment.' }, { status: 502 });
  }
}
