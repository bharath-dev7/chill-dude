import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, SendHorizontal } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import { useAppState } from '../context/AppStateContext';

export default function JournalPage() {
  const navigate = useNavigate();
  const {
    draftJournal,
    hasTodayFaceScan,
    isHydrating,
    saveJournalDraft,
    submitTodayJournal,
    todayEntry,
    todayFaceScan,
  } = useAppState();

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dateLabel = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
    [],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await submitTodayJournal(draftJournal);
    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    navigate('/recommendation');
    setIsSubmitting(false);
  };

  if (isHydrating) {
    return (
      <AppShell title="Daily Journal" subtitle="Syncing your journal state...">
        <section className="panel-strong mx-auto max-w-3xl p-6 text-sm text-slate-600">Loading journal data...</section>
      </AppShell>
    );
  }

  if (todayEntry) {
    return (
      <AppShell
        title="Daily Journal"
        subtitle="Today is already submitted and locked to preserve diary authenticity."
      >
        <section className="panel-strong mx-auto max-w-3xl space-y-4 p-5 sm:p-7">
          <article className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-800">{dateLabel}</h2>
              <p className="chip">Read-only</p>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{todayEntry.text}</p>
          </article>

          <article className="rounded-2xl border border-indigo-100 bg-white p-4">
            <p className="text-sm font-semibold text-indigo-700">Auto summary</p>
            <p className="mt-2 text-sm text-slate-700">{todayEntry.summary}</p>
            <p className="mt-3 text-xs text-slate-500">
              Face signal used: <strong>{todayEntry.recommendation.signals.face}</strong>
            </p>
          </article>

          <button className="btn-primary w-full" type="button" onClick={() => navigate('/recommendation')}>
            Open recommendation
          </button>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Daily Journal"
      subtitle="One honest entry for today. After submit it becomes immutable."
    >
      <section className="panel-strong mx-auto max-w-3xl p-5 sm:p-7">
        {!hasTodayFaceScan ? (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Face scan is not captured yet. You can still submit, but scan improves recommendation quality.
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="field-label" htmlFor="daily-journal">
              {dateLabel}
            </label>
            <textarea
              id="daily-journal"
              className="input-control min-h-[220px] resize-y leading-6"
              placeholder="Write your day honestly: energy, stress triggers, and what helped."
              value={draftJournal}
              onChange={(event) => saveJournalDraft(event.target.value)}
            />
          </div>

          <article className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-600">
            <p className="flex items-center gap-2 font-semibold text-slate-700">
              <Lock size={16} />
              Journal rule
            </p>
            <p className="mt-2">After submission, this entry will remain read-only to keep your diary timeline trustworthy.</p>
            {hasTodayFaceScan ? (
              <p className="mt-2 text-xs text-blue-700">
                Scan captured: <strong>{todayFaceScan.emotion}</strong> ({Math.round(todayFaceScan.confidence * 100)}% confidence)
              </p>
            ) : null}
          </article>

          {error ? <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
            <SendHorizontal size={16} />
            <span>{isSubmitting ? 'Submitting...' : "Submit today's journal"}</span>
          </button>
        </form>
      </section>
    </AppShell>
  );
}
