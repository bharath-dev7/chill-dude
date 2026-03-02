import React, { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AppShell from '../components/layout/AppShell';
import { useAppState } from '../context/AppStateContext';

export default function InsightsPage() {
  const { insights, diaryEntries } = useAppState();

  const stressData = useMemo(
    () => insights.stressTrend.map((item) => ({ ...item, stress: item.stress ?? 0 })),
    [insights.stressTrend],
  );

  const focusData = useMemo(() => insights.focusTrend, [insights.focusTrend]);

  const avgStress = Math.round(
    stressData.reduce((sum, item) => sum + item.stress, 0) / Math.max(stressData.length, 1),
  );

  const totalFocus = focusData.reduce((sum, item) => sum + item.minutes, 0);

  return (
    <AppShell
      title="Weekly Insights"
      subtitle="Track stress trend and focus minutes from your daily records."
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel-strong p-5 sm:p-6">
          <h2 className="section-title text-slate-800">Stress trend (7 days)</h2>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe7ff" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="stress" stroke="#2563eb" strokeWidth={3} fill="#bfdbfe" fillOpacity={0.55} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="space-y-4">
          <article className="panel-strong p-5">
            <h2 className="section-title text-slate-800">Focus minutes</h2>
            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={focusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe7ff" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel-strong p-5">
            <h2 className="section-title text-slate-800">This week summary</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                Average stress: <strong>{avgStress}/100</strong>
              </li>
              <li className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">
                Total focus logged: <strong>{totalFocus} minutes</strong>
              </li>
              <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                Submitted journal days: <strong>{diaryEntries.length}</strong>
              </li>
            </ul>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
