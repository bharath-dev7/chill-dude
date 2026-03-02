import React, { useMemo, useState } from 'react';
import { BellRing, CalendarClock, Plus, SquareCheckBig } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import { useAppState } from '../context/AppStateContext';

export default function TasksPage() {
  const { tasks, addTask, toggleTask, timetableLoadToday, setTimetableLoad } = useAppState();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const pendingCount = tasks.filter((task) => !task.completed).length;

  const heavyDayMessage = useMemo(() => {
    if (timetableLoadToday === 'heavy' || pendingCount >= 4) {
      return 'Today is going to be a drag. Start with one smaller task to build momentum.';
    }
    if (pendingCount >= 2) {
      return 'Moderate load today. Keep sessions short and consistent.';
    }
    return 'Day load is manageable. You can use Focus mode for deep work blocks.';
  }, [pendingCount, timetableLoadToday]);

  const deadlineNudge = useMemo(() => {
    const urgent = tasks.find((task) => !task.completed && task.dueDate <= new Date().toISOString().slice(0, 10));
    if (!urgent) {
      return null;
    }
    return `I think today is the day for "${urgent.title}".`;
  }, [tasks]);

  const onSubmit = (event) => {
    event.preventDefault();
    void addTask(title, dueDate);
    setTitle('');
    setDueDate('');
  };

  return (
    <AppShell
      title="Tasks and Timetable"
      subtitle="Daily load drives reminders and contributes to future recommendation signals."
    >
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-4">
          <article className="panel-strong p-5">
            <h2 className="section-title text-slate-800">Add task</h2>
            <form className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]" onSubmit={onSubmit}>
              <input
                className="input-control"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Task title"
              />
              <input className="input-control" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
              <button className="btn-primary" type="submit">
                <Plus size={16} />
                <span>Add</span>
              </button>
            </form>
          </article>

          <article className="panel-strong p-5">
            <h2 className="section-title text-slate-800">Timetable load</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {['light', 'medium', 'heavy'].map((load) => (
                <button
                  key={load}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition-colors',
                    timetableLoadToday === load
                      ? 'border-blue-300 bg-blue-100 text-blue-700'
                      : 'border-blue-100 bg-white text-slate-600',
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    void setTimetableLoad(load);
                  }}
                >
                  {load}
                </button>
              ))}
            </div>
            <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {heavyDayMessage}
            </p>
            {deadlineNudge ? (
              <p className="mt-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">{deadlineNudge}</p>
            ) : null}
          </article>
        </section>

        <section className="panel-strong p-5">
          <h2 className="section-title text-slate-800">Task list</h2>
          <p className="mt-1 text-sm text-slate-500">Pending: {pendingCount}</p>

          <ul className="mt-4 space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={[
                  'flex items-center justify-between gap-3 rounded-xl border px-3 py-2',
                  task.completed ? 'border-emerald-200 bg-emerald-50' : 'border-blue-100 bg-white',
                ].join(' ')}
              >
                <div>
                  <p className={['text-sm font-semibold', task.completed ? 'text-emerald-700 line-through' : 'text-slate-700'].join(' ')}>
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500">Due {task.dueDate || 'unspecified'}</p>
                </div>
                <button className="btn-soft" type="button" onClick={() => { void toggleTask(task.id); }}>
                  <SquareCheckBig size={15} />
                </button>
              </li>
            ))}
          </ul>

          <article className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <BellRing size={16} />
              Notification behavior
            </p>
            <p className="mt-2 text-sm text-slate-600">Heavy-day and deadline nudges are generated from this screen state.</p>
            <p className="mt-1 text-xs text-slate-500">Later, these can be delivered through backend notifications.</p>
          </article>
        </section>
      </div>

      <article className="panel mt-5 p-4">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarClock size={15} />
          This data is part of V2 recommendation logic alongside sleep and activity signals.
        </p>
      </article>
    </AppShell>
  );
}
