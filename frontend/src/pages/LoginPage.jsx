import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { apiFetch, LOCAL_DEMO_TOKEN, setAuthToken } from '../lib/apiClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const enterLocalMode = () => {
    setAuthToken(LOCAL_DEMO_TOKEN);
    navigate('/', { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!payload?.token) {
        throw new Error('Authentication succeeded but token was not returned.');
      }

      setAuthToken(payload.token);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to continue right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex items-center justify-center">
      <div className="page-wrap grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel hidden p-7 lg:block">
          <Logo />
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-slate-800">Build calmer days with better structure.</h1>
          <p className="mt-3 max-w-xl text-slate-600">
            Daily face scan and journaling drive an automatic recommendation for Focus or Relax mode.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <article className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="chip">Automatic Flow</p>
              <p className="mt-3 text-sm text-slate-600">Scan, submit one journal, get mode recommendation instantly.</p>
            </article>
            <article className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="chip">Read-only Diary</p>
              <p className="mt-3 text-sm text-slate-600">Each day becomes immutable, creating a genuine emotional timeline.</p>
            </article>
          </div>
        </section>

        <section className="panel-strong w-full max-w-xl p-6 sm:p-7 lg:justify-self-end">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="mt-1 text-sm text-slate-500">Secure login to continue your daily flow.</p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input-control"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input-control"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
              />
            </div>

            {error ? (
              <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}

            <button className="btn-primary w-full" disabled={loading} type="submit">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Sign up'}
            </button>

            <button className="btn-soft w-full" type="button" onClick={enterLocalMode}>
              Continue in local mode
            </button>

            <button
              className="btn-soft w-full"
              type="button"
              onClick={() => {
                setMode((previous) => (previous === 'login' ? 'register' : 'login'));
                setError('');
              }}
            >
              {mode === 'login' ? 'Create a new account' : 'Use existing account'}
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-500">
            Local mode keeps data on this device when backend auth or database access is unavailable.
          </p>
        </section>
      </div>
    </div>
  );
}
