const STRESS_TERMS = [
  'stress',
  'anxious',
  'panic',
  'overwhelmed',
  'burnout',
  'tired',
  'exhausted',
  'drained',
  'deadline',
  'pressure',
  'afraid',
  'worried',
  'sad',
  'lonely',
  'angry',
];

const CALM_TERMS = [
  'calm',
  'good',
  'great',
  'stable',
  'grateful',
  'better',
  'focused',
  'productive',
  'relaxed',
  'clear',
  'peaceful',
  'confident',
];

const FACE_STRESS_WEIGHT = {
  stressed: 78,
  tired: 64,
  neutral: 44,
  calm: 26,
  happy: 22,
};

function countKeywordHits(text, keywords) {
  return keywords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function summarizeJournal(text) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return 'No journal content found for today.';
  }

  const sentence = cleaned.split(/[.!?]/).map((part) => part.trim()).find(Boolean);
  if (!sentence) {
    return cleaned.slice(0, 140);
  }

  return sentence.length > 160 ? `${sentence.slice(0, 157)}...` : sentence;
}

export function analyzeJournal(text) {
  const content = (text || '').toLowerCase();
  const stressHits = countKeywordHits(content, STRESS_TERMS);
  const calmHits = countKeywordHits(content, CALM_TERMS);
  const base = 45;
  const stressScore = clamp(base + stressHits * 8 - calmHits * 5, 5, 95);

  return {
    stressScore,
    stressHits,
    calmHits,
    summary: summarizeJournal(text),
  };
}

export function decideRecommendation({ faceSignal, journalText }) {
  const journal = analyzeJournal(journalText);
  const faceScore = FACE_STRESS_WEIGHT[faceSignal?.emotion] ?? FACE_STRESS_WEIGHT.neutral;
  const weightedStress = Math.round(journal.stressScore * 0.65 + faceScore * 0.35);

  const mode = weightedStress >= 58 ? 'relax' : 'focus';
  const reasons = [
    `Face signal: ${faceSignal?.emotion || 'neutral'} (${faceScore}/100)` ,
    `Journal stress estimate: ${journal.stressScore}/100`,
  ];

  if (weightedStress >= 58) {
    reasons.push('Recommendation leans toward recovery to reduce strain.');
  } else {
    reasons.push('Recommendation leans toward focused progress with moderate load.');
  }

  return {
    mode,
    stressScore: weightedStress,
    reasons,
    summary: journal.summary,
    signals: {
      face: faceSignal?.emotion || 'neutral',
      journalStress: journal.stressScore,
      stressHits: journal.stressHits,
      calmHits: journal.calmHits,
    },
  };
}
