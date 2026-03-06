import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CircleCheck, LoaderCircle } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import { useAppState } from '../context/AppStateContext';
import {
  ensureFaceExpressionDetector,
  getFaceExpressionConfig,
  inferFaceExpression,
} from '../lib/faceExpression';

const SCAN_DURATION_MS = 3200;
const SAMPLE_INTERVAL_MS = 230;
const PROGRESS_TICK_MS = 110;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function waitForVideoReady(videoElement, timeoutMs = 5000) {
  if (!videoElement) {
    return Promise.resolve();
  }

  if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(new Error('Camera stream did not become ready in time.'));
    }, timeoutMs);

    const onReady = () => {
      if (settled || videoElement.videoWidth <= 0) {
        return;
      }
      settled = true;
      cleanup();
      resolve();
    };

    const onError = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(new Error('Video element failed to load camera stream.'));
    };

    const cleanup = () => {
      window.clearTimeout(timer);
      videoElement.removeEventListener('loadedmetadata', onReady);
      videoElement.removeEventListener('loadeddata', onReady);
      videoElement.removeEventListener('canplay', onReady);
      videoElement.removeEventListener('error', onError);
    };

    videoElement.addEventListener('loadedmetadata', onReady);
    videoElement.addEventListener('loadeddata', onReady);
    videoElement.addEventListener('canplay', onReady);
    videoElement.addEventListener('error', onError);
  });
}

function aggregateSignal(samples) {
  if (!samples.length) {
    return {
      signal: {
        emotion: 'neutral',
        confidence: 0.55,
      },
      usedFallback: true,
      sampleCount: 0,
      totalSamples: 0,
    };
  }

  const reliableSamples = samples.filter((sample) => sample.confidence >= 0.54);
  const source = reliableSamples.length >= 4 ? reliableSamples : samples;
  const weighted = new Map();

  source.forEach((sample) => {
    const current = weighted.get(sample.emotion) || { confidenceTotal: 0, weightedScore: 0, count: 0 };
    const weight = clamp(sample.confidence, 0.35, 1);
    weighted.set(sample.emotion, {
      confidenceTotal: current.confidenceTotal + sample.confidence,
      weightedScore: current.weightedScore + weight,
      count: current.count + 1,
    });
  });

  const ranked = [...weighted.entries()]
    .map(([emotion, data]) => ({
      emotion,
      score: data.weightedScore + data.count * 0.035,
      confidence: data.confidenceTotal / Math.max(data.count, 1),
      count: data.count,
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const second = ranked[1] || { score: 0 };
  const dominance = best.count / source.length;
  const margin = best.score - second.score;
  const unstable = source.length < 3 || dominance < 0.34 || margin < 0.06;

  if (unstable) {
    return {
      signal: {
        emotion: 'neutral',
        confidence: clamp(0.56 + dominance * 0.12, 0.56, 0.72),
      },
      usedFallback: true,
      sampleCount: source.length,
      totalSamples: samples.length,
    };
  }

  return {
    signal: {
      emotion: best.emotion,
      confidence: clamp(best.confidence * (0.78 + dominance * 0.24), 0.45, 0.99),
    },
    usedFallback: false,
    sampleCount: source.length,
    totalSamples: samples.length,
  };
}

export default function MoodScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const sampleRef = useRef([]);
  const sampleInFlightRef = useRef(false);
  const sampleErrorShownRef = useRef(false);
  const lastSampleAtRef = useRef(0);
  const modelConfig = useMemo(() => getFaceExpressionConfig(), []);

  const { hasTodayFaceScan, todayFaceScan, setFaceScan, syncError } = useAppState();

  const [isPreparing, setIsPreparing] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [scanMeta, setScanMeta] = useState(null);

  const stopScanTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
            width: { ideal: 960 },
            height: { ideal: 540 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch {
            // Browsers can reject autoplay; readiness listener still handles streamed frames.
          }
          await waitForVideoReady(videoRef.current);
        }
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        setCameraReady(true);

        try {
          await ensureFaceExpressionDetector();
          if (!cancelled) {
            setModelReady(true);
          }
        } catch (modelError) {
          if (!cancelled) {
            setError(modelError?.message || 'Face model did not load. Scan will save a neutral fallback signal.');
          }
        }
      } catch {
        if (!cancelled) {
          setCameraReady(false);
          setError('Camera access was blocked. Scan will save a neutral fallback signal.');
        }
      } finally {
        if (!cancelled) {
          setIsPreparing(false);
        }
      }
    }

    setupCamera();

    return () => {
      cancelled = true;
      stopScanTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stopScanTimer]);

  const captureSample = async () => {
    if (sampleInFlightRef.current || !videoRef.current) {
      return;
    }

    sampleInFlightRef.current = true;
    try {
      const sample = await inferFaceExpression(videoRef.current);
      if (sample) {
        sampleRef.current.push(sample);
      }
    } catch {
      if (!sampleErrorShownRef.current) {
        setError('Could not read expression reliably. Scan will save a neutral fallback signal.');
        sampleErrorShownRef.current = true;
      }
    } finally {
      sampleInFlightRef.current = false;
    }
  };

  const completeScan = async () => {
    await captureSample();
    const {
      signal,
      usedFallback,
      sampleCount,
      totalSamples,
    } = aggregateSignal(sampleRef.current);
    setScanMeta({
      sampleCount,
      totalSamples,
      usedFallback,
    });

    if (usedFallback) {
      setError('No stable face signal detected. Saved neutral fallback for today.');
    }

    const saved = await setFaceScan(signal);
    if (!saved) {
      setError('Could not save scan on this device. Press Start scan again.');
    }
    setIsScanning(false);
    setProgress(100);
  };

  const startScan = () => {
    stopScanTimer();
    setError('');
    setIsScanning(true);
    setProgress(0);
    setScanMeta(null);
    sampleRef.current = [];
    sampleInFlightRef.current = false;
    sampleErrorShownRef.current = false;
    lastSampleAtRef.current = 0;

    if (!cameraReady) {
      void completeScan();
      return;
    }

    const startedAt = performance.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const nextProgress = Math.min(100, Math.round((elapsed / SCAN_DURATION_MS) * 100));
      setProgress(nextProgress);

      if (elapsed - lastSampleAtRef.current >= SAMPLE_INTERVAL_MS) {
        lastSampleAtRef.current = elapsed;
        void captureSample();
      }

      if (elapsed >= SCAN_DURATION_MS) {
        stopScanTimer();
        void completeScan();
      }
    }, PROGRESS_TICK_MS);
  };

  return (
    <AppShell
      title="Daily Face Scan"
      subtitle="Capture expression signal before journal submission."
      compact
      flowStep={1}
      hideNav
    >
      <section className="panel-strong mx-auto max-w-3xl p-4 sm:p-6">
        <div className="grid gap-5 md:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-blue-100 bg-slate-900">
              <video ref={videoRef} className="h-[260px] w-full object-cover sm:h-[320px]" autoPlay muted playsInline />
            </div>
            {error ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>
            ) : null}
            {!error && syncError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{syncError}</p>
            ) : null}
          </div>

          <div className="space-y-4">
            <article className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-rose-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-blue-700">Status</p>
                <p className="chip">Step 1 of 3</p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-slate-700">
                {isPreparing ? <LoaderCircle className="animate-spin" size={18} /> : <CircleCheck size={18} />}
                <span className="text-sm">
                  {isPreparing ? 'Preparing camera' : cameraReady ? 'Camera ready' : 'Camera unavailable (fallback enabled)'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Expression model: {modelReady ? 'ready (local JS model)' : 'loading or fallback mode'}
              </p>
              <p className="mt-1 break-all text-[11px] text-slate-500">
                Model path: {modelConfig.faceModelPath}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full bg-gradient-to-r from-rose-500 to-blue-600 transition-all duration-150" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">Scan runs for about 3 seconds and saves only on this device before you move to the journal page.</p>
              {scanMeta ? (
                <p className="mt-1 text-xs text-slate-500">
                  Frames used: {scanMeta.sampleCount}/{scanMeta.totalSamples}
                </p>
              ) : null}
            </article>

            {hasTodayFaceScan ? (
              <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-700">Today&apos;s signal captured</p>
                <p className="mt-1 text-sm text-slate-700">
                  Emotion: <strong>{todayFaceScan.emotion}</strong> | Confidence: {Math.round(todayFaceScan.confidence * 100)}%
                </p>
              </article>
            ) : null}

            <button
              className="btn-primary w-full"
              type="button"
              onClick={startScan}
              disabled={isPreparing || isScanning}
            >
              <Camera size={16} />
              <span>{isScanning ? 'Scanning...' : cameraReady ? 'Start scan' : 'Save fallback scan'}</span>
            </button>

            <button
              className="btn-soft w-full"
              type="button"
              onClick={() => navigate('/journal')}
              disabled={!hasTodayFaceScan}
            >
              Continue to journal
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
