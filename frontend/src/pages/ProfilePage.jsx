import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, HeartPulse, LogOut, ShieldCheck, Users } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import { setAuthToken } from '../lib/apiClient';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [allowTrustedAlerts, setAllowTrustedAlerts] = useState(false);
  const [allowHealthSignals, setAllowHealthSignals] = useState(false);

  return (
    <AppShell
      title="Profile and Safety"
      subtitle="Control permissions, integrations, and trusted-contact behavior."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel-strong p-5">
          <h2 className="section-title text-slate-800">Safety controls</h2>
          <div className="mt-4 space-y-3">
            <article className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <Users size={16} />
                Trusted contact nudges
              </p>
              <p className="mt-2 text-sm text-slate-600">When enabled, future backend logic can send low-frequency alerts if stress stays high.</p>
              <button
                className="btn-soft mt-3"
                type="button"
                onClick={() => setAllowTrustedAlerts((previous) => !previous)}
              >
                {allowTrustedAlerts ? 'Disable' : 'Enable'}
              </button>
            </article>

            <article className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                <HeartPulse size={16} />
                Health signal usage
              </p>
              <p className="mt-2 text-sm text-slate-600">Allow sleep and steps (V2) to influence recommendation quality.</p>
              <button
                className="btn-soft mt-3"
                type="button"
                onClick={() => setAllowHealthSignals((previous) => !previous)}
              >
                {allowHealthSignals ? 'Disable' : 'Enable'}
              </button>
            </article>
          </div>
        </section>

        <section className="space-y-4">
          <article className="panel-strong p-5">
            <h2 className="section-title text-slate-800">Integrations</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="rounded-xl border border-blue-100 bg-white px-3 py-2">Google Fit: connect in next backend step</li>
              <li className="rounded-xl border border-blue-100 bg-white px-3 py-2">Spotify links: available via Relax mode curated cards</li>
              <li className="rounded-xl border border-blue-100 bg-white px-3 py-2">Reminder channel: in-app now, email later</li>
            </ul>
          </article>

          <article className="panel-strong p-5">
            <h2 className="section-title text-slate-800">Account actions</h2>
            <div className="mt-3 grid gap-2">
              <button className="btn-soft justify-start" type="button">
                <ShieldCheck size={16} />
                <span>Review privacy settings</span>
              </button>
              <button className="btn-soft justify-start" type="button">
                <Bell size={16} />
                <span>Manage reminder preferences</span>
              </button>
              <button
                className="inline-flex items-center justify-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700"
                type="button"
                onClick={() => {
                  setAuthToken(null);
                  navigate('/login', { replace: true });
                }}
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
