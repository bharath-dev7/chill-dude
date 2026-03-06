import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpenText, CalendarClock, MoonStar, Sparkles, Zap } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import { useAppState } from '../context/AppStateContext';
import { decideRecommendation } from '../lib/recommendation';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    todayEntry,
    todayFaceScan,
    hasTodayJournal,
    isHydrating,
    notifications,
    syncError,
    tasks,
    timetableLoadToday,
  } = useAppState();

  if (isHydrating) {
    return (
      <AppShell title="Today's Recommendation" subtitle="Syncing recommendation data...">
        <section className="panel-strong p-6 text-sm text-slate-600">Loading recommendation...</section>
      </AppShell>
    );
  }

  if (!hasTodayJournal || !todayEntry) {
    return <Navigate to="/journal" replace />;
  }

  const recommendation = todayFaceScan
    ? decideRecommendation({
      faceSignal: todayFaceScan,
      journalText: todayEntry.text,
    })
    : todayEntry.recommendation;
  const isRelax = recommendation.mode === 'relax';
  const nextRoute = isRelax ? '/relax' : '/focus';
  const nextLabel = isRelax ? 'Continue to Relax Room' : 'Continue to Focus Room';
  const heroClasses = isRelax
    ? 'border-rose-200 bg-gradient-to-br from-rose-50 via-white to-blue-50'
    : 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50';
  const heroChipClasses = isRelax
    ? 'border border-rose-200 bg-rose-100 text-rose-700'
    : 'border border-blue-200 bg-blue-100 text-blue-700';
  const reasonClasses = isRelax
    ? 'border-rose-100 bg-rose-50/70'
    : 'border-blue-50 bg-blue-50/50';

  return (
    <AppShell
      title="Today&apos;s Recommendation"
      subtitle="Generated automatically from face signal + journal summary. This page now leads to one next action."
      flowStep={3}
      hideNav
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel-strong space-y-4 p-5 sm:p-6">
          {syncError ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{syncError}</p>
          ) : null}
          {notifications.length > 0 ? (
            <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-700">Today&apos;s nudges</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {notifications.map((note) => (
                  <li key={note}>- {note}</li>
                ))}
              </ul>
            </article>
          ) : null}
          <article className={['rounded-2xl p-4 sm:p-5', heroClasses].join(' ')}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={['chip', heroChipClasses].join(' ')}>Auto mode</p>
              <p className="chip">Step 3 of 3</p>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-slate-800 sm:text-3xl">
              {isRelax ? 'Relax mode first' : 'Focus mode first'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Stress score today: <strong>{recommendation.stressScore}/100</strong>
            </p>
            <p className="mt-3 text-sm text-slate-600">
              The app should move you forward, not make you choose between branches here. This is the single next page for today.
            </p>
            <button className="btn-primary mt-4 w-full sm:w-auto" type="button" onClick={() => navigate(nextRoute)}>
              {isRelax ? <MoonStar size={16} /> : <Zap size={16} />}
              <span>{nextLabel}</span>
            </button>
          </article>

          <article className="rounded-2xl border border-blue-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-700">Why this was selected</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {recommendation.reasons.map((reason) => (
                <li key={reason} className={['rounded-lg border px-3 py-2', reasonClasses].join(' ')}>
                  {reason}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="space-y-4">
          <article className="panel-strong p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <BookOpenText size={16} />
              Diary summary
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{todayEntry.summary}</p>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700" type="button" onClick={() => navigate('/diary')}>
              View full diary timeline
              <ArrowRight size={15} />
            </button>
          </article>

          <article className="panel-strong p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CalendarClock size={16} />
              Day pressure preview
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Timetable load today: <strong className="capitalize">{timetableLoadToday}</strong>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Pending tasks: <strong>{tasks.filter((task) => !task.completed).length}</strong>
            </p>
          </article>

          <article className="panel-strong p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Sparkles size={16} />
              Next step
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Finish the recommended room first. After that, review tasks or insights if you need them.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-blue-700">
              <button className="inline-flex items-center gap-2" type="button" onClick={() => navigate(nextRoute)}>
                Go to today&apos;s room
                <ArrowRight size={15} />
              </button>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
