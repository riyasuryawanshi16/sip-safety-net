const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Free tier allows only a small number of requests per day per model, so we accept
// a comma-separated list and move to the next model when one is out of quota.
const DEFAULT_MODELS = 'gemini-3.1-flash-lite,gemini-3.5-flash-lite,gemini-3.5-flash';

async function callModel({ apiKey, model, body }) {
  const res = await fetch(`${BASE}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body,
    signal: AbortSignal.timeout(30000),
  });
  if (res.ok) {
    const data = await res.json();
    const text = (data?.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('');
    return { ok: true, json: JSON.parse(text) };
  }
  const detail = (await res.text()).slice(0, 200);
  // Out of quota, overloaded, or model retired: try the next model.
  const skip = [404, 429, 500, 503].includes(res.status);
  return { ok: false, skip, error: new Error(`Gemini ${res.status} (${model}): ${detail}`) };
}

// Calls Gemini and returns parsed JSON that matches `schema`.
async function generateJson({ apiKey, models, system, user, schema, temperature = 0 }) {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: {
      temperature,
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });

  let lastError = new Error('No model configured');
  for (const model of models) {
    try {
      const out = await callModel({ apiKey, model, body });
      if (out.ok) return out.json;
      lastError = out.error;
      if (!out.skip) throw out.error;
    } catch (err) {
      lastError = err; // timeout, bad JSON, or network error: try the next model
    }
  }
  throw lastError;
}

// Works with Cloudflare's `env` and with Node's `process.env`.
// Returns gen({ system, user, schema, temperature }) with the key bound.
export function makeGemini(env) {
  const models = (env.GEMINI_MODEL || DEFAULT_MODELS)
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  return (opts) => generateJson({ apiKey: env.GEMINI_API_KEY, models, ...opts });
}
