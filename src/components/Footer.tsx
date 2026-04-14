'use client';

import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';

export default function Footer() {
  const { c } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto"
      style={{
        borderTop: `1px solid ${c.borderSubtle}`,
        background: c.navBg,
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left — branding */}
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #6366f1)', boxShadow: '0 2px 10px rgba(59,130,246,0.35)' }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-tight" style={{ color: c.textPrimary }}>
              Auto Verkauf Manager
            </p>
            <p className="text-xs leading-tight" style={{ color: c.textDim }}>
              Fahrzeugverwaltung &amp; Provisionen
            </p>
          </div>
        </div>

        {/* Center — copyright */}
        <p className="text-xs text-center" style={{ color: c.textDim }}>
          © {year} Auto Verkauf Manager. Alle Rechte vorbehalten.
        </p>

        {/* Right — RWG badge */}
        <a
          href="https://www.rwg.one"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="text-xs" style={{ color: c.textDim }}>Entwickelt von</span>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(99,102,241,0.1))',
              border: '1px solid rgba(99,102,241,0.25)',
            }}
          >
            <Image
              src="/logo.png"
              alt="RWG Logo"
              width={22}
              height={22}
              className="object-contain"
            />
            <span
              className="text-xs font-bold tracking-wide"
              style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              RWG
            </span>
            <span className="text-xs font-medium" style={{ color: c.textMuted }}>Real Web Growth</span>
          </div>
        </a>
      </div>
    </footer>
  );
}
