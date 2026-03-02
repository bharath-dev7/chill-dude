import React, { useEffect, useState } from 'react';
import { ExternalLink, MessageCircleHeart, Play, Wind } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import { useAppState } from '../context/AppStateContext';

const BREATHING_OPTIONS = [2, 5, 10];

const BOT_REPLIES = [
  'You are not behind. Small calm actions are still progress.',
  'Pause your shoulders and jaw, then continue one task at a time.',
  'A heavy day does not define your ability. You are recovering, not failing.',
  'Do one slow breath cycle now. It can reset your pace in under a minute.',
];

const CALM_MEDIA = [
  {
    id: 'spotify-calm',
    title: 'Soft Focus Playlist',
    source: 'Spotify',
    url: 'https://open.spotify.com/search/calm%20focus%20playlist',
  },
  {
    id: 'youtube-feelgood',
    title: 'Feel Good Calm Video',
    source: 'YouTube',
    url: 'https://www.youtube.com/results?search_query=feel+good+calm+music',
  },
];

function breathingText(step) {
  if (step % 3 === 0) {
    return 'Inhale for 4 seconds';
  }
  if (step % 3 === 1) {
    return 'Hold for 4 seconds';
  }
  return 'Exhale for 6 seconds';
}

export default function RelaxPage() {
  const { logRelaxSession } = useAppState();

  const [minutes, setMinutes] = useState(5);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [sessionStep, setSessionStep] = useState(0);
  const [messages, setMessages] = useState([{ id: 'b0', sender: 'bot', text: BOT_REPLIES[0] }]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!isSessionRunning) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSessionStep((previous) => {
        const next = previous + 1;
        const totalCycles = Math.ceil((minutes * 60) / 14);
        if (next >= totalCycles * 3) {
          window.clearInterval(interval);
          setIsSessionRunning(false);
          logRelaxSession(minutes);
        }
        return next;
      });
    }, 4000);

    return () => window.clearInterval(interval);
  }, [isSessionRunning, logRelaxSession, minutes]);

  const sendMessage = (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) {
      return;
    }

    const nextUser = { id: `u-${Date.now()}`, sender: 'user', text };
    const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];

    setMessages((previous) => [
      ...previous,
      nextUser,
      { id: `b-${Date.now()}`, sender: 'bot', text: reply },
    ]);
    setInput('');
  };

  return (
    <AppShell
      title="Relax Room"
      subtitle="Breathing support, companion chat, and calm media recommendations."
    >
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-4">
          <article className="panel-strong p-5 sm:p-6">
            <h2 className="section-title text-slate-800">Guided breathing</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {BREATHING_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
                    minutes === option ? 'border-blue-300 bg-blue-100 text-blue-700' : 'border-blue-100 bg-white text-slate-600',
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setMinutes(option);
                    setSessionStep(0);
                    setIsSessionRunning(false);
                  }}
                >
                  {option} min
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center">
              <p className="text-sm font-semibold text-blue-700">Current cycle</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{breathingText(sessionStep)}</p>
              <p className="mt-2 text-xs text-slate-500">Session length: {minutes} minutes</p>
            </div>

            <button
              className="btn-primary mt-4 w-full"
              type="button"
              onClick={() => {
                setSessionStep(0);
                setIsSessionRunning(true);
              }}
            >
              <Play size={16} />
              <span>{isSessionRunning ? 'Session running...' : 'Start breathing session'}</span>
            </button>
          </article>

          <article className="panel-strong p-5">
            <h2 className="section-title text-slate-800">Calm media picks</h2>
            <ul className="mt-3 space-y-2">
              {CALM_MEDIA.map((item) => (
                <li key={item.id} className="rounded-xl border border-blue-100 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-700"
                  >
                    Open on {item.source}
                    <ExternalLink size={13} />
                  </a>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="panel-strong flex flex-col p-5 sm:p-6">
          <h2 className="section-title text-slate-800">Companion chat</h2>
          <p className="mt-1 text-sm text-slate-500">If voice rooms are unavailable, this bot keeps the support loop active.</p>

          <div className="mt-4 min-h-[360px] flex-1 space-y-2 overflow-y-auto rounded-2xl border border-blue-100 bg-blue-50 p-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={[
                  'max-w-[90%] rounded-xl px-3 py-2 text-sm',
                  message.sender === 'user'
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-blue-100',
                ].join(' ')}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form className="mt-3 flex gap-2" onSubmit={sendMessage}>
            <input
              className="input-control"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Share what feels heavy right now"
            />
            <button className="btn-primary" type="submit">
              <MessageCircleHeart size={16} />
            </button>
          </form>

          <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <Wind size={13} />
            Breathing + reflection together generally works better than either alone.
          </p>
        </section>
      </div>
    </AppShell>
  );
}

