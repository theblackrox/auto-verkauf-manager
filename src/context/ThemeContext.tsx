'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const DARK = {
  page:          '#050d1f',
  card:          'rgba(8,16,38,0.85)',
  cardInner:     'rgba(4,10,26,0.7)',
  cardSolid:     'rgba(8,16,38,0.9)',
  cardHeader:    'rgba(8,16,38,0.6)',
  cardFooter:    'rgba(8,16,38,0.5)',
  input:         'rgba(4,10,26,0.8)',
  elevated:      'rgba(12,22,50,0.8)',
  elevatedAlt:   'rgba(15,25,55,0.75)',
  rowOdd:        'rgba(4,10,26,0.3)',
  rowHover:      'rgba(59,130,246,0.05)',
  navBg:         'rgba(4,9,24,0.92)',
  border:        'rgba(59,130,246,0.12)',
  borderSubtle:  'rgba(59,130,246,0.08)',
  borderInput:   'rgba(59,130,246,0.15)',
  borderFocus:   'rgba(59,130,246,0.5)',
  borderAccent:  'rgba(59,130,246,0.13)',
  tooltipBg:     '#0a1628',
  tooltipBorder: 'rgba(59,130,246,0.22)',
  textPrimary:   '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted:     '#475569',
  textDim:       '#334155',
  textVdim:      '#1e3a5f',
  shadow:        '0 4px 32px rgba(0,0,0,0.5)',
  shadowCard:    '0 4px 24px rgba(0,0,0,0.4)',
  shadow2xl:     '0 8px 48px rgba(59,130,246,0.1)',
  grandBg:       'linear-gradient(135deg, rgba(12,22,55,0.98) 0%, rgba(20,14,55,0.98) 100%)',
  grandBorder:   'rgba(99,102,241,0.22)',
  cardGradBase:  'rgba(8,16,38,0.95)',
  inputBg:       '#1e293b',  // Tailwind slate-800 equivalent
  inputBorder:   '#334155',  // slate-700
  inputText:     '#f1f5f9',
  inputPlaceholder: '#64748b',
  modalBg:       '#1e293b',
  modalBorder:   '#334155',
  checkboxBg:    'rgba(51,65,85,0.3)',
  checkboxBorder: 'rgba(71,85,105,0.4)',
  colorPos:       '#10b981',
  colorNeg:       '#ef4444',
  colorAmber:     '#f59e0b',
  colorBlue:      '#3b82f6',
};

export const LIGHT = {
  page:          '#eef2ff',
  card:          'rgba(255,255,255,0.97)',
  cardInner:     'rgba(238,242,255,0.95)',
  cardSolid:     'rgba(248,250,255,0.99)',
  cardHeader:    'rgba(238,242,255,0.97)',
  cardFooter:    'rgba(245,248,255,0.95)',
  input:         'rgba(238,242,255,0.95)',
  elevated:      'rgba(224,232,255,0.9)',
  elevatedAlt:   'rgba(224,232,255,0.85)',
  rowOdd:        'rgba(224,232,255,0.5)',
  rowHover:      'rgba(59,130,246,0.06)',
  navBg:         'rgba(255,255,255,0.97)',
  border:        'rgba(59,130,246,0.2)',
  borderSubtle:  'rgba(59,130,246,0.1)',
  borderInput:   'rgba(59,130,246,0.25)',
  borderFocus:   'rgba(59,130,246,0.55)',
  borderAccent:  'rgba(59,130,246,0.18)',
  tooltipBg:     '#ffffff',
  tooltipBorder: 'rgba(59,130,246,0.3)',
  textPrimary:   '#0f172a',
  textSecondary: '#1e3a5f',
  textMuted:     '#3d5a80',
  textDim:       '#4d6990',
  textVdim:      '#9ab4d0',
  shadow:        '0 4px 32px rgba(59,130,246,0.08)',
  shadowCard:    '0 4px 24px rgba(59,130,246,0.07)',
  shadow2xl:     '0 8px 48px rgba(59,130,246,0.12)',
  grandBg:       'linear-gradient(135deg, rgba(224,232,255,0.98) 0%, rgba(220,214,255,0.98) 100%)',
  grandBorder:   'rgba(99,102,241,0.3)',
  cardGradBase:  'rgba(255,255,255,0.98)',
  inputBg:       '#f0f4ff',
  inputBorder:   '#c7d7f4',
  inputText:     '#0f172a',
  inputPlaceholder: '#94a3b8',
  modalBg:       '#f8faff',
  modalBorder:   '#c7d7f4',
  checkboxBg:    'rgba(219,234,254,0.4)',
  checkboxBorder: 'rgba(147,197,253,0.5)',
  colorPos:       '#059669',
  colorNeg:       '#dc2626',
  colorAmber:     '#b45309',
  colorBlue:      '#1d4ed8',
};

export type ThemeColors = typeof DARK;

interface ThemeCtx {
  isDark: boolean;
  toggle: () => void;
  c: ThemeColors;
}

const Ctx = createContext<ThemeCtx>({ isDark: true, toggle: () => {}, c: DARK });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('av-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = stored !== null ? stored === 'dark' : prefersDark;
    setIsDark(useDark);
    document.documentElement.setAttribute('data-theme', useDark ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    setIsDark(d => {
      const next = !d;
      localStorage.setItem('av-theme', next ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <Ctx.Provider value={{ isDark, toggle, c: isDark ? DARK : LIGHT }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
