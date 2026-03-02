import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenText, CalendarDays } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import { useAppState } from '../context/AppStateContext';

function formatDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DiaryPage() {
  const navigate = useNavigate();
  const { diaryEntries } = useAppState();

  return (
    <AppShell
      title="Diary Timeline"
      subtitle="Daily submitted entries stay read-only to preserve your emotional history."
    >
      <section className="mx-auto max-w-4xl space-y-4">
        {diaryEntries.length === 0 ? (
          <article className="panel-strong p-6 text-center">
            <BookOpenText className="mx-auto text-blue-600" size={28} />
            <p className="mt-3 text-sm text-slate-600">No entries yet. Submit today&apos;s journal to start your timeline.</p>
            <button className="btn-primary mx-auto mt-4" type="button" onClick={() => navigate('/journal')}>
              Write today&apos;s journal
            </button>
          </article>
        ) : (
          diaryEntries.map((entry) => (
            <article key={entry.id} className="panel-strong p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-800">{formatDate(entry.dateKey)}</h2>
                <p className="chip">Read-only</p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{entry.text}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Auto summary</p>
                  <p className="mt-1 text-sm text-slate-700">{entry.summary}</p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Mode outcome</p>
                  <p className="mt-1 text-sm text-slate-700 capitalize">{entry.recommendation.mode} mode</p>
                  <p className="text-xs text-slate-500">Stress score: {entry.recommendation.stressScore}/100</p>
                </div>
              </div>
            </article>
          ))
        )}

        <article className="panel p-4">
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays size={15} />
            One entry per day keeps the trend meaningful and comparable.
          </p>
        </article>
      </section>
    </AppShell>
  );
}
