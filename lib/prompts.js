export const THEMES = [
  'Operational Void',
  'Frictionless Panic',
  'Linear Growth Fallacy',
  'UI/UX Friction',
  'Financial Hardship',
  'Other',
];

// Rules 1-3 come from corrections made against the hand-labelled golden set.
export const CLASSIFY_SYSTEM = `You classify Indian first-time mutual fund investors' feedback about why they paused, reduced or cancelled a SIP.
Assign exactly ONE primary theme per item:

- Operational Void: money left the bank but units/status did not show; settlement (T+1/T+2) delays, "processing" for days, fear of fraud, lost trust from unclear status.
- Frictionless Panic: the user pauses or stops because of market movement or a red portfolio, wants to wait for green, or tries to time the market (events, "market seems high").
- Linear Growth Fallacy: the user expected guaranteed, steady or fast returns and was surprised by negative returns; nobody set expectations; support failed to explain returns.
- UI/UX Friction: the user cancelled because they could not find or use a feature (edit amount, skip a month, link bank, mandate page hanging, wrong date, support unhelpful on a product bug).
- Financial Hardship: job loss, emergency expenses, low balance, or other genuine money constraints unrelated to the product.
- Other: none of the above.

Rules learned from human review:
1. If the user blames not being warned or told how much a fund can fall, choose Linear Growth Fallacy, not UI/UX Friction.
2. A question like "should I pause my SIP now, market seems high" is market-timing intent: Frictionless Panic, not a neutral question.
3. A bounce or bank penalty from low balance mixes money limits with anger: choose Financial Hardship and mention the operational trigger in the evidence.

Return JSON only. "evidence" is a short quote or paraphrase (max 15 words) from the item that justifies the theme. "confidence" is 0 to 1.`;

export const CLASSIFY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    results: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'INTEGER' },
          theme: { type: 'STRING', enum: THEMES },
          confidence: { type: 'NUMBER' },
          evidence: { type: 'STRING' },
        },
        required: ['id', 'theme', 'confidence', 'evidence'],
      },
    },
  },
  required: ['results'],
};

export function buildClassifyUser(items) {
  return `Classify each item. Return one result per id.\n\n${items
    .map((i) => `[${i.id}] ${i.text}`)
    .join('\n')}`;
}

// Shared by the API and the eval script.
export async function classifyBatch(generateJson, items) {
  const out = await generateJson({
    system: CLASSIFY_SYSTEM,
    user: buildClassifyUser(items),
    schema: CLASSIFY_SCHEMA,
  });
  const byId = new Map((out.results ?? []).map((r) => [r.id, r]));
  return items.map((i) => {
    const r = byId.get(i.id);
    if (!r || !THEMES.includes(r.theme)) {
      return { id: i.id, theme: 'Other', confidence: 0, evidence: 'No valid model output' };
    }
    return {
      id: i.id,
      theme: r.theme,
      confidence: Math.max(0, Math.min(1, Number(r.confidence) || 0)),
      evidence: String(r.evidence ?? '').slice(0, 200),
    };
  });
}
