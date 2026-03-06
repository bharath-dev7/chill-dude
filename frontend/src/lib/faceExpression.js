const DEFAULT_VISION_WASM_PATH = '/mediapipe/wasm';
const DEFAULT_FACE_MODEL_PATH = '/mediapipe/models/face_landmarker.task';

let detectorPromise = null;
let visionTasksModulePromise = null;

function resolveAssetPath(value, fallback) {
  const raw = (value || '').trim() || fallback;
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('/')) {
    return raw;
  }

  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  return `${base}${raw.replace(/^\/+/, '')}`;
}

const FACE_EXPRESSION_CONFIG = {
  visionWasmPath: resolveAssetPath(import.meta.env.VITE_FACE_WASM_PATH, DEFAULT_VISION_WASM_PATH),
  faceModelPath: resolveAssetPath(import.meta.env.VITE_FACE_MODEL_PATH, DEFAULT_FACE_MODEL_PATH),
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function average(...values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) {
    return 0;
  }
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function toScoreMap(categories) {
  return categories.reduce((acc, item) => {
    acc[item.categoryName] = item.score;
    return acc;
  }, {});
}

function applyStabilityRule(scores) {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const second = sorted[1] || { score: 0 };
  const margin = best.score - second.score;
  const weakSignal = best.score < 0.24;
  const weakMargin = margin < 0.055;

  if (weakSignal || weakMargin) {
    const neutralBoost = clamp(0.56 + (0.055 - margin) * 1.4, 0.56, 0.78);
    return {
      emotion: 'neutral',
      confidence: neutralBoost,
    };
  }

  return {
    emotion: best.emotion,
    confidence: clamp(0.45 + best.score * 0.55, 0.45, 0.99),
  };
}

export function classifyExpressionFromBlendshapes(categories) {
  const scoreMap = toScoreMap(categories);

  const smile = average(
    scoreMap.mouthSmileLeft,
    scoreMap.mouthSmileRight,
    scoreMap.cheekSquintLeft,
    scoreMap.cheekSquintRight,
  );
  const eyeBlink = average(scoreMap.eyeBlinkLeft, scoreMap.eyeBlinkRight);
  const eyeWide = average(scoreMap.eyeWideLeft, scoreMap.eyeWideRight);
  const browDown = average(scoreMap.browDownLeft, scoreMap.browDownRight);
  const browInnerUp = scoreMap.browInnerUp ?? 0;
  const jawOpen = scoreMap.jawOpen ?? 0;
  const frown = average(
    scoreMap.mouthFrownLeft,
    scoreMap.mouthFrownRight,
    scoreMap.mouthLowerDownLeft,
    scoreMap.mouthLowerDownRight,
  );
  const noseSneer = average(scoreMap.noseSneerLeft, scoreMap.noseSneerRight);

  const stressedScore = clamp(
    (browDown * 0.42)
      + (eyeWide * 0.24)
      + (frown * 0.19)
      + (jawOpen * 0.14)
      + (browInnerUp * 0.1)
      + (noseSneer * 0.07)
      - (smile * 0.26),
    0,
    1,
  );

  const tiredScore = clamp(
    (eyeBlink * 0.56)
      + (jawOpen * 0.2)
      + (browInnerUp * 0.13)
      + (frown * 0.08)
      - (eyeWide * 0.12),
    0,
    1,
  );

  const happyScore = clamp(
    (smile * 0.8)
      + (eyeWide * 0.06)
      - (frown * 0.16)
      - (browDown * 0.08),
    0,
    1,
  );

  const calmScore = clamp(
    ((1 - stressedScore) * 0.42)
      + ((1 - tiredScore) * 0.28)
      + ((1 - jawOpen) * 0.2)
      + ((1 - eyeWide) * 0.1),
    0,
    1,
  );

  const neutralScore = clamp(1 - Math.max(stressedScore, tiredScore, happyScore) * 0.92, 0, 1);

  const scores = [
    { emotion: 'calm', score: calmScore },
    { emotion: 'neutral', score: neutralScore },
    { emotion: 'tired', score: tiredScore },
    { emotion: 'stressed', score: stressedScore },
    { emotion: 'happy', score: happyScore },
  ];

  return applyStabilityRule(scores);
}

function formatDetectorError(error) {
  const detail = error instanceof Error ? error.message : 'Unknown detector error';
  return `Face expression model failed to initialize. Check local asset paths. ${detail}`;
}

async function loadVisionTasksModule() {
  if (!visionTasksModulePromise) {
    visionTasksModulePromise = import('@mediapipe/tasks-vision').catch((error) => {
      visionTasksModulePromise = null;
      throw error;
    });
  }

  return visionTasksModulePromise;
}

export function getFaceExpressionConfig() {
  return {
    ...FACE_EXPRESSION_CONFIG,
  };
}

export async function ensureFaceExpressionDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FaceLandmarker, FilesetResolver } = await loadVisionTasksModule();
      const vision = await FilesetResolver.forVisionTasks(FACE_EXPRESSION_CONFIG.visionWasmPath);
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: FACE_EXPRESSION_CONFIG.faceModelPath,
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
      });
    })().catch((error) => {
      detectorPromise = null;
      throw new Error(formatDetectorError(error));
    });
  }

  return detectorPromise;
}

export async function inferFaceExpression(videoElement) {
  if (!videoElement || videoElement.readyState < 2 || !videoElement.videoWidth) {
    return null;
  }

  const detector = await ensureFaceExpressionDetector();
  const timestampMs = Math.max(0, videoElement.currentTime * 1000);
  const result = detector.detectForVideo(videoElement, timestampMs);
  const categories = result?.faceBlendshapes?.[0]?.categories;

  if (!categories || categories.length === 0) {
    return null;
  }

  return classifyExpressionFromBlendshapes(categories);
}
