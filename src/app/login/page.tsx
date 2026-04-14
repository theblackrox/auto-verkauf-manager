'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Ungültige E-Mail-Adresse oder falsches Passwort.');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{ background: '#050d1f' }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute blur-3xl rounded-full"
          style={{
            width: 600, height: 600,
            top: '-10%', left: '20%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute blur-3xl rounded-full"
          style={{
            width: 500, height: 500,
            bottom: '-10%', right: '15%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute blur-3xl rounded-full"
          style={{
            width: 300, height: 300,
            bottom: '20%', left: '5%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.22)',
              color: '#60a5fa',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }}
            />
            Auto Verkauf Manager
          </div>
        </div>

        {/* Icon + Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #6366f1 100%)',
                boxShadow: '0 12px 40px rgba(59,130,246,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset',
              }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2zM16 6l3 4H9" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Willkommen zurück</h1>
          <p className="mt-2 text-sm" style={{ color: '#64748b' }}>
            Melden Sie sich in Ihrem Konto an
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(8,16,40,0.9)',
            border: '1px solid rgba(59,130,246,0.16)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset',
            backdropFilter: 'blur(20px)',
          }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="ihre@email.com"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all num"
                style={{
                  background: 'rgba(4,10,26,0.8)',
                  border: '1px solid rgba(59,130,246,0.15)',
                  color: '#f1f5f9',
                  caretColor: '#3b82f6',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.55)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)')}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(4,10,26,0.8)',
                  border: '1px solid rgba(59,130,246,0.15)',
                  color: '#f1f5f9',
                  caretColor: '#3b82f6',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.55)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)')}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-xl p-3.5 text-sm flex items-center gap-2"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.22)',
                  color: '#fca5a5',
                }}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: loading
                  ? 'rgba(37,99,235,0.4)'
                  : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                boxShadow: loading ? 'none' : '0 8px 32px rgba(59,130,246,0.3)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Wird angemeldet…
                </>
              ) : (
                'Anmelden'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
