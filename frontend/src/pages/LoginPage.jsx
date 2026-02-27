import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { apiFetch, setAuthToken } from '../lib/apiClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!payload?.token) {
        throw new Error('Login succeeded but no auth token was returned.');
      }

      setAuthToken(payload.token);
      navigate('/scan');
    } catch (error) {
      setErrorMessage(error.message || 'Unable to login right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-blue-50 to-lavender-100 p-4">
      <div className="absolute top-6 left-6 md:top-8 md:left-8">
        <Logo />
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/20">
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-2 font-serif hidden">Chill Dude</h1>
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2 font-sans tracking-tight">
          Welcome Back
        </h2>
        <p className="text-center text-blue-600/60 mb-8">Your companion for a calmer day</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-900/70 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all bg-white/50"
              placeholder="hello@chilldude.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900/70 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all bg-white/50"
              placeholder="********"
              required
            />
          </div>
          {errorMessage ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {errorMessage}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing In...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
