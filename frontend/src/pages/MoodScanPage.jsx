import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CircleCheck, LoaderCircle } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import { useAppState } from '../context/AppStateContext';
import { randomFaceSignal } from '../lib/recommendation';

export default function MoodScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const { hasTodayFaceScan, todayFaceScan, setFaceScan } = useAppState();

  const [isPreparing, setIsPreparing] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setError('Camera access was blocked. You can still continue with a neutral scan signal.');
      } finally {
        setIsPreparing(false);
      }
    }

    setupCamera();

    return () => {
      cancelled = true;
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const completeScan = async () => {
    const signal = randomFaceSignal();
    await setFaceScan(signal);
    setIsScanning(false);
    setProgress(100);
  };

  const startScan = () => {
    setIsScanning(true);
    setProgress(0);

    const startedAt = Date.now();
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(100, Math.round((elapsed / 3200) * 100));
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        window.clearInterval(timerRef.current);
        completeScan();
      }
    }, 120);
  };

  return (
    <AppShell
      title="Daily Face Scan"
      subtitle="Capture expression signal before journal submission."
      compact
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
          </div>

          <div className="space-y-4">
            <article className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-700">Status</p>
              <div className="mt-2 flex items-center gap-2 text-slate-700">
                {isPreparing ? <LoaderCircle className="animate-spin" size={18} /> : <CircleCheck size={18} />}
                <span className="text-sm">{isPreparing ? 'Preparing camera' : 'Camera ready'}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full bg-blue-600 transition-all duration-150" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">Scan runs for about 3 seconds.</p>
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
              <span>{isScanning ? 'Scanning...' : 'Start scan'}</span>
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
