import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Pause, Play, RotateCcw, Volume2, Waves, Wind } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import { useAppState } from '../context/AppStateContext';

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function FocusPage() {
  const { tasks, toggleTask, logFocusSession } = useAppState();

  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundMode, setSoundMode] = useState('none');

  const audioRef = useRef({ context: null, source: null, gain: null, filter: null });

  const openTasks = useMemo(
    () => tasks.filter((task) => !task.completed).slice(0, 4),
    [tasks],
  );

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          setIsActive(false);
          logFocusSession(sessionMinutes);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isActive, logFocusSession, sessionMinutes]);

  const stopNoise = () => {
    const current = audioRef.current;

    if (current.source) {
      try {
        current.source.stop();
      } catch {
        // No-op if already stopped.
      }
    }

    if (current.context) {
      current.context.close();
    }

    audioRef.current = { context: null, source: null, gain: null, filter: null };
  };

  const startNoise = async (mode) => {
    stopNoise();

    if (mode === 'none') {
      setSoundMode('none');
      return;
    }

    const context = new window.AudioContext();
    await context.resume();

    const bufferSize = context.sampleRate * 2;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i += 1) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const gain = context.createGain();
    gain.gain.value = mode === 'rain' ? 0.05 : 0.035;

    if (mode === 'rain') {
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 850;
      source.connect(filter);
      filter.connect(gain);
      audioRef.current = { context, source, gain, filter };
    } else {
      source.connect(gain);
      audioRef.current = { context, source, gain, filter: null };
    }

    gain.connect(context.destination);
    source.start();
    setSoundMode(mode);
  };

  useEffect(() => () => stopNoise(), []);

  const applyPreset = (minutes) => {
    setSessionMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(sessionMinutes * 60);
  };

  return (
    <AppShell
      title="Focus Room"
      subtitle="Run compact sessions with top tasks and low-distraction soundscapes."
    >
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="panel-strong p-5 sm:p-6">
          <h2 className="section-title text-slate-800">Session timer</h2>
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">
            <p className="text-5xl font-black tracking-tight text-slate-800 sm:text-6xl">{formatTimer(secondsLeft)}</p>
            <p className="mt-2 text-sm text-slate-500">Current plan: {sessionMinutes} minutes</p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[15, 25, 45].map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={[
                  'rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
                  sessionMinutes === minutes ? 'border-blue-300 bg-blue-100 text-blue-700' : 'border-blue-100 bg-white text-slate-600',
                ].join(' ')}
                onClick={() => applyPreset(minutes)}
              >
                {minutes}m
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" type="button" onClick={() => setIsActive((previous) => !previous)}>
              {isActive ? <Pause size={16} /> : <Play size={16} />}
              <span>{isActive ? 'Pause' : 'Start'}</span>
            </button>
            <button className="btn-soft" type="button" onClick={resetTimer}>
              <RotateCcw size={16} />
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <article className="panel-strong p-5">
            <h2 className="section-title text-slate-800">Focus sounds</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button className="btn-soft" type="button" onClick={() => startNoise('white')}>
                <Volume2 size={16} />
                <span>White noise</span>
              </button>
              <button className="btn-soft" type="button" onClick={() => startNoise('rain')}>
                <Waves size={16} />
                <span>Rain</span>
              </button>
              <button className="btn-soft" type="button" onClick={() => startNoise('none')}>
                <Wind size={16} />
                <span>Stop</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Now playing: {soundMode === 'none' ? 'Off' : soundMode}</p>
          </article>

          <article className="panel-strong p-5">
            <h2 className="section-title text-slate-800">Top tasks</h2>
            <ul className="mt-3 space-y-2">
              {openTasks.length === 0 ? (
                <li className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-slate-600">No pending tasks. Great work.</li>
              ) : (
                openTasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{task.title}</p>
                      <p className="text-xs text-slate-500">Due {task.dueDate}</p>
                    </div>
                    <button className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-50" type="button" onClick={() => toggleTask(task.id)}>
                      <CheckCircle2 size={18} />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
