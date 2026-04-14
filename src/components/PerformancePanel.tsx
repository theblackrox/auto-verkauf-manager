'use client';

import { useState, useMemo } from 'react';
import { Auto, BrandPerformance } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { useTheme } from '@/context/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface Props {
  brandPerformance: BrandPerformance[];
  autos: Auto[];
}

interface TooltipPayload {
  name: string;
  value: number;
  fill: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  const { c } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm"
      style={{
        background: c.tooltipBg,
        border: `1px solid ${c.tooltipBorder}`,
        boxShadow: c.shadow,
        color: c.textPrimary,
        minWidth: 220,
      }}
    >
      <p className="font-semibold mb-2 text-base" style={{ color: c.textPrimary }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between items-center gap-6 mb-1">
          <span style={{ color: p.fill }} className="font-medium">{p.name}</span>
          <span className="font-bold num" style={{ color: c.textPrimary }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

const BRANDS_PER_PAGE = 6;
const CARS_PER_CARD   = 5;

/* ── Card paginata per singola marca ── */
function BrandCard({ gruppe }: { gruppe: { marke: string; autos: Auto[]; total: number } }) {
  const { c } = useTheme();
  const [cardPage, setCardPage] = useState(1);
  const totalCardPages = Math.max(1, Math.ceil(gruppe.autos.length / CARS_PER_CARD));
  const safeCardPage   = Math.min(cardPage, totalCardPages);
  const visibleAutos   = gruppe.autos.slice((safeCardPage - 1) * CARS_PER_CARD, safeCardPage * CARS_PER_CARD);

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: c.cardInner, border: `1px solid ${c.border}` }}
    >
      {/* Brand header */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: `1px solid ${c.borderSubtle}`, background: c.cardHeader }}
      >
        <span className="font-bold text-base" style={{ color: c.textPrimary }}>{gruppe.marke}</span>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          {gruppe.autos.length} FZ
        </span>
      </div>

      {/* Car list */}
      <div className="flex-1 divide-y" style={{ borderColor: c.borderSubtle }}>
        {visibleAutos.map(a => (
          <div key={a.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: c.textPrimary }}>{a.modell}</p>
              {a.interne_nummer && (
                <p className="text-xs font-mono" style={{ color: c.textDim }}>{a.interne_nummer}</p>
              )}
            </div>
            <span className="text-sm num font-semibold shrink-0" style={{ color: c.colorAmber }}>
              {formatCurrency(a.einkaufspreis)}
            </span>
          </div>
        ))}
      </div>

      {/* Card pagination */}
      {totalCardPages > 1 && (
        <div
          className="px-4 py-2 flex items-center justify-between shrink-0"
          style={{ borderTop: `1px solid ${c.borderSubtle}`, background: c.cardFooter }}
        >
          <button onClick={() => setCardPage(p => Math.max(1, p - 1))} disabled={safeCardPage === 1}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
            style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.08)' }}>
            ←
          </button>
          <span className="text-xs" style={{ color: c.textMuted }}>{safeCardPage} / {totalCardPages}</span>
          <button onClick={() => setCardPage(p => Math.min(totalCardPages, p + 1))} disabled={safeCardPage === totalCardPages}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
            style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.08)' }}>
            →
          </button>
        </div>
      )}

      {/* Brand total */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ borderTop: `1px solid ${c.border}`, background: c.cardFooter }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>Gesamt Einkauf</span>
        <span className="text-base font-bold num" style={{ color: c.colorAmber }}>{formatCurrency(gruppe.total)}</span>
      </div>
    </div>
  );
}

export default function PerformancePanel({ brandPerformance, autos }: Props) {
  const { c } = useTheme();
  const [tab, setTab] = useState<'performance' | 'bestand'>('performance');
  const [brandPage, setBrandPage] = useState(1);

  // --- Bestand-Tab: raggruppa per marca ---
  const bestand = useMemo(() => {
    const map = new Map<string, { autos: Auto[]; total: number }>();
    for (const a of autos) {
      const existing = map.get(a.marke) ?? { autos: [], total: 0 };
      existing.autos.push(a);
      existing.total += a.einkaufspreis;
      map.set(a.marke, existing);
    }
    return Array.from(map.entries())
      .map(([marke, val]) => ({ marke, autos: val.autos, total: val.total }))
      .sort((a, b) => b.total - a.total);
  }, [autos]);

  const totalBrandPages = Math.max(1, Math.ceil(bestand.length / BRANDS_PER_PAGE));
  const safeBrandPage   = Math.min(brandPage, totalBrandPages);
  const visibleBrands   = bestand.slice((safeBrandPage - 1) * BRANDS_PER_PAGE, safeBrandPage * BRANDS_PER_PAGE);

  if (brandPerformance.length === 0 && autos.length === 0) return null;

  const chartData = brandPerformance.map(b => ({
    name: b.marke,
    Investiert: b.total_investiert,
    Verdient: b.total_verdient,
    anzahl: b.anzahl,
    roi: b.total_investiert > 0 ? (b.total_verdient / b.total_investiert * 100) : 0,
  }));

  const chartHeight = Math.max(260, brandPerformance.length * 68 + 60);

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: c.card,
        border: `1px solid ${c.border}`,
        boxShadow: c.shadow,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-6 rounded-full"
            style={{ background: 'linear-gradient(180deg, #3b82f6, #6366f1)' }}
          />
          <div>
            <h2 className="text-lg font-semibold" style={{ color: c.textPrimary }}>Performance nach Marke</h2>
            <p className="text-xs" style={{ color: c.textMuted }}>
              {tab === 'performance' ? 'Investition vs. Verdienst' : 'Bestand & Einkaufspreise'}
            </p>
          </div>
        </div>
        {/* Tab selector */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{
            background: c.cardSolid,
            border: `1px solid ${c.borderAccent}`,
          }}
        >
          {([
            { key: 'performance', label: 'Performance' },
            { key: 'bestand',     label: 'Bestand' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-5 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={
                tab === t.key
                  ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }
                  : { color: c.textMuted }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'performance' ? (
        <>
          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
              barCategoryGap="30%"
              barGap={4}
            >
              <CartesianGrid strokeDasharray="2 6" stroke={c.borderSubtle} horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                tick={{ fill: c.textDim, fontSize: 11 }}
                axisLine={{ stroke: c.borderSubtle }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: c.textSecondary, fontSize: 13, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={78}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: c.rowHover }} />
              <Legend wrapperStyle={{ paddingTop: 18, fontSize: 13, color: c.textMuted }} />
              <Bar dataKey="Investiert" name="Investiert" fill={c.colorBlue} radius={[0, 6, 6, 0]} maxBarSize={16} />
              <Bar dataKey="Verdient"   name="Verdient"   fill={c.colorPos}   radius={[0, 6, 6, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>

          {/* ROI badges — scrollabile orizzontalmente */}
          <div
            className="mt-5 pt-5"
            style={{ borderTop: `1px solid ${c.borderSubtle}` }}
          >
          <div
            className="flex gap-2.5 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'thin', scrollbarColor: `${c.borderSubtle} transparent` }}
          >
            {brandPerformance.map(brand => {
              const roi = brand.total_investiert > 0
                ? (brand.total_verdient / brand.total_investiert * 100).toFixed(1)
                : '0.0';
              const positive = brand.total_verdient >= 0;
              return (
                <div
                  key={brand.marke}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                  style={{
                    background: c.elevated,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <span className="font-semibold" style={{ color: c.textPrimary }}>{brand.marke}</span>
                  <span style={{ color: c.textVdim }}>·</span>
                  <span style={{ color: c.textMuted }}>{brand.anzahl} FZ</span>
                  <span style={{ color: c.textVdim }}>·</span>
                  <span className="font-bold text-xs num" style={{ color: positive ? c.colorPos : c.colorBlue }}>
                    {positive ? '+' : ''}{roi}%
                  </span>
                </div>
              );
            })}
          </div>
          </div>
        </>
      ) : (
        /* ── Bestand Tab ── */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleBrands.map(gruppe => (
              <BrandCard key={gruppe.marke} gruppe={gruppe} />
            ))}
          </div>

          {/* Brand-level pagination */}
          {totalBrandPages > 1 && (
            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: `1px solid ${c.borderSubtle}` }}
            >
              <button
                onClick={() => setBrandPage(p => Math.max(1, p - 1))}
                disabled={safeBrandPage === 1}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
                style={{ background: c.elevated, color: '#60a5fa', border: `1px solid ${c.border}` }}
              >
                ← Zurück
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalBrandPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setBrandPage(n)}
                    className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
                    style={
                      n === safeBrandPage
                        ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff' }
                        : { color: c.textMuted, background: 'transparent' }
                    }
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setBrandPage(p => Math.min(totalBrandPages, p + 1))}
                disabled={safeBrandPage === totalBrandPages}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
                style={{ background: c.elevated, color: '#60a5fa', border: `1px solid ${c.border}` }}
              >
                Weiter →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
