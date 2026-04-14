'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  userEmail: string;
}

export default function Navbar({ userEmail }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { isDark, toggle, c } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initial = userEmail[0]?.toUpperCase() ?? 'U';

  return (
    <nav
      style={{
        background: c.navBg,
        borderBottom: `1px solid ${c.border}`,
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background 0.25s ease',
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8, #6366f1)',
              boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2zM16 6l3 4H9" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold block leading-tight" style={{ color: c.textPrimary }}>
              Auto Verkauf Manager
            </span>
            <span className="text-xs leading-tight hidden sm:block" style={{ color: c.textDim }}>
              Fahrzeugverwaltung &amp; Provisionen
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={isDark ? 'Helles Design' : 'Dunkles Design'}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: c.elevated,
              border: `1px solid ${c.border}`,
              color: c.textSecondary,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}
          >
            {isDark ? (
              /* Sun icon */
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" strokeWidth={1.8} />
                <path strokeLinecap="round" strokeWidth={1.8}
                  d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              /* Moon icon */
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {/* User pill */}
          <div
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
            style={{
              background: c.elevatedAlt,
              border: `1px solid ${c.border}`,
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
            >
              {initial}
            </div>
            <span className="text-sm" style={{ color: c.textSecondary }}>{userEmail}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.18)',
              color: '#f87171',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.14)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.07)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.18)';
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Abmelden
          </button>
        </div>
      </div>
    </nav>
  );
}
