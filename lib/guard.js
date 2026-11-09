// Safety gate for AI replies. Fails closed: anything unclear is blocked.

const AMC_NAMES =
  /\b(HDFC|ICICI|SBI|Axis|Nippon|Kotak|Mirae|Parag Parikh|PPFAS|UTI|Quant|Motilal|Tata|Aditya Birla|DSP|Franklin|Invesco|Bandhan|Edelweiss|Canara Robeco)\b/i;

const RULES = [
  {
    id: 'investment_advice',
    re: /\byou (should|must|ought to|need to|had better) (buy|sell|invest|switch|redeem|stop|continue|pause|increase|top up|hold)\b|\bI (recommend|suggest|advise)\b|\bbest time to\b|\b(buy|sell|invest) (more|now|today)\b/i,
  },
  {
    id: 'fear_or_urgency',
    re: /\b(hurry|act now|act fast|don'?t miss|do not miss|last chance|limited time|before it'?s too late|miss out|missing out|running out of time|panic)\b/i,
  },
  {
    id: 'guaranteed_or_predicted_returns',
    re: /(?<!not )(?<!no )guarantee[ds]?\b|\b(will|going to|bound to|certain to) (recover|rebound|bounce back|go up|rise|grow|double|beat)\b|\b(assured|sure) returns?\b/i,
  },
  { id: 'specific_fund_or_ticker', re: AMC_NAMES },
];

const ALLOWED_CAPS = new Set([
  'SIP', 'NAV', 'AMFI', 'SEBI', 'UPI', 'RBI', 'KYC', 'NSE', 'BSE', 'PAN', 'FAQ', 'AMC', 'ETF', 'ELSS', 'EMI', 'AI', 'INR', 'DEMO',
]);

// Returns the ids of rules the text breaks (empty array means clean).
export function deterministicChecks(text) {
  const hits = RULES.filter((r) => r.re.test(text)).map((r) => r.id);
  const caps = text.match(/\b[A-Z]{3,6}\b/g) ?? [];
  if (caps.some((c) => !ALLOWED_CAPS.has(c)) && !hits.includes('specific_fund_or_ticker')) {
    hits.push('specific_fund_or_ticker');
  }
  return hits;
}

export const JUDGE_SYSTEM = `You are a strict compliance reviewer for a mutual fund app. You review a reply the app is about to show to a first-time investor who wants to pause a SIP.
The reply FAILS if it does any of these:
- investment_advice: tells the user what to buy, sell, hold, continue, pause, switch or invest, or says what is best for them personally.
- specific_fund_or_ticker: names or hints at a specific fund, company, stock or ticker.
- fear_or_urgency: uses fear, FOMO, urgency, guilt or pressure to change the user's decision.
- guaranteed_or_predicted_returns: promises or predicts returns or market direction.
- other: invents facts, claims certainty about the user's account, or is manipulative.
General education about how SIPs work, neutral information, and pointing to official sources are fine.
Return JSON only.`;

export const JUDGE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    passes: { type: 'BOOLEAN' },
    violations: {
      type: 'ARRAY',
      items: {
        type: 'STRING',
        enum: ['investment_advice', 'specific_fund_or_ticker', 'fear_or_urgency', 'guaranteed_or_predicted_returns', 'other'],
      },
    },
  },
  required: ['passes', 'violations'],
};

export async function checkDraft(gen, text) {
  const deterministic = deterministicChecks(text);
  if (deterministic.length) {
    return { passed: false, deterministic, judge: null, reason: 'rule_violation' };
  }
  let judge;
  try {
    judge = await gen({
      system: JUDGE_SYSTEM,
      user: `Reply to review:\n"""${text}"""`,
      schema: JUDGE_SCHEMA,
    });
  } catch {
    return { passed: false, deterministic, judge: null, reason: 'judge_unavailable' };
  }
  const passed = judge?.passes === true && (judge.violations ?? []).length === 0;
  return { passed, deterministic, judge, reason: passed ? 'ok' : 'judge_violation' };
}
