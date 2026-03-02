import { RecommendationMode } from '@prisma/client';

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
} as const;

function countKeywordHits(text: string, keywords: string[]): number {
  return keywords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface ScanSignalInput {
  emotion: string;
  confidence: number;
}

export interface RecommendationResult {
  mode: RecommendationMode;
  stressScore: number;
  reasons: string[];
  summary: string;
  signals: {
    face: string;
    journalStress: number;
    stressHits: number;
    calmHits: number;
  };
}

export function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLastDateKeys(days = 7, baseDate = new Date()): string[] {
  const keys: string[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - i);
    keys.push(getDateKey(date));
  }

  return keys;
}

export function summarizeJournal(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return 'No journal content found for today.';
  }

  const sentence = cleaned
    .split(/[.!?]/)
    .map((part) => part.trim())
    .find(Boolean);

  if (!sentence) {
    return cleaned.slice(0, 140);
  }

  return sentence.length > 160 ? `${sentence.slice(0, 157)}...` : sentence;
}

function analyzeJournal(text: string): {
  stressScore: number;
  stressHits: number;
  calmHits: number;
  summary: string;
} {
  const content = text.toLowerCase();
  const stressHits = countKeywordHits(content, STRESS_TERMS);
  const calmHits = countKeywordHits(content, CALM_TERMS);

  const stressScore = clamp(45 + stressHits * 8 - calmHits * 5, 5, 95);

  return {
    stressScore,
    stressHits,
    calmHits,
    summary: summarizeJournal(text),
  };
}

export function decideRecommendation(signal: ScanSignalInput, journalText: string): RecommendationResult {
  const journal = analyzeJournal(journalText);
  const rawFaceScore = FACE_STRESS_WEIGHT[signal.emotion as keyof typeof FACE_STRESS_WEIGHT];
  const faceScore = rawFaceScore ?? 44;
  const weightedStress = Math.round(journal.stressScore * 0.65 + faceScore * 0.35);

  const mode = weightedStress >= 58 ? RecommendationMode.relax : RecommendationMode.focus;
  const reasons = [
    `Face signal: ${signal.emotion} (${faceScore}/100)`,
    `Journal stress estimate: ${journal.stressScore}/100`,
    weightedStress >= 58
      ? 'Recommendation leans toward recovery to reduce strain.'
      : 'Recommendation leans toward focused progress with moderate load.',
  ];

  return {
    mode,
    stressScore: weightedStress,
    reasons,
    summary: journal.summary,
    signals: {
      face: signal.emotion,
      journalStress: journal.stressScore,
      stressHits: journal.stressHits,
      calmHits: journal.calmHits,
    },
  };
}
