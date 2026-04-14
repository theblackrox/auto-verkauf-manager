'use client';

import { useState, useMemo } from 'react';
import { Auto } from '@/types';
import { formatCurrency, calculateStatistics, calculateVerdienst } from '@/utils/calculations';

const BRAND_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#06b6d4','#a855f7'];
import { useTheme } from '@/context/ThemeContext';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface Props {
  autos: Auto[];
  filterYear: string;
  filterMonth: string;
  filterDay: string;
  setFilterYear: (v: string) => void;
  setFilterMonth: (v: string) => void;
  setFilterDay: (v: string) => void;
}

type TabKey = 'eigene_fz' | 'vermittlungen';

interface StatCardProps {
  label: string;
  value: string;
  subtitle: string;
  color: 'green' | 'amber' | 'orange' | 'blue';
  wide?: boolean;
}

function StatCard({ label, value, subtitle, color, wide }: StatCardProps) {
  const { isDark, c } = useTheme();
  const cfg = {
    green:  { border: 'rgba(16,185,129,0.2)',  val: isDark ? '#10b981' : '#059669', bg: 'rgba(16,185,129,0.04)' },
    amber:  { border: 'rgba(245,158,11,0.2)',  val: isDark ? '#f59e0b' : '#b45309', bg: 'rgba(245,158,11,0.04)' },
    orange: { border: 'rgba(249,115,22,0.2)',  val: isDark ? '#f97316' : '#c2410c', bg: 'rgba(249,115,22,0.04)' },
    blue:   { border: 'rgba(59,130,246,0.2)',  val: isDark ? '#60a5fa' : '#2563eb', bg: 'rgba(59,130,246,0.04)' },
  }[color];

  return (
    <div
      className={`rounded-2xl p-5 transition-transform hover:scale-[1.015] ${wide ? 'col-span-2' : ''}`}
      style={{
        background: `linear-gradient(135deg, ${c.cardGradBase} 0%, ${cfg.bg} 100%)`,
        border: `1px solid ${cfg.border}`,
        boxShadow: c.shadowCard,
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>
        {label}
      </p>
      <p className="text-3xl font-bold num" style={{ color: cfg.val }}>{value}</p>
      <p className="text-xs mt-1.5" style={{ color: c.textDim }}>{subtitle}</p>
    </div>
  );
}

interface StatCardEinkaufProps {
  gesamt: number;
  aktuell: number;
}

function StatCardEinkauf({ gesamt, aktuell }: StatCardEinkaufProps) {
  const { isDark, c } = useTheme();
  const [tab, setTab] = useState<'gesamt' | 'offen'>('gesamt');
  const val = tab === 'gesamt' ? gesamt : aktuell;
  const color = isDark ? '#f97316' : '#c2410c';
  return (
    <div
      className="rounded-2xl p-5 transition-transform hover:scale-[1.015]"
      style={{
        background: `linear-gradient(135deg, ${c.cardGradBase} 0%, rgba(249,115,22,0.04) 100%)`,
        border: '1px solid rgba(249,115,22,0.2)',
        boxShadow: c.shadowCard,
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
        Totaler Einkaufspreis
      </p>
      {/* mini tab */}
      <div className="flex gap-1 mb-3">
        {([{ key: 'gesamt', label: 'Alle' }, { key: 'offen', label: 'Noch offen' }] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-2.5 py-0.5 rounded-lg text-xs font-medium transition-all"
            style={
              tab === t.key
                ? { background: 'rgba(249,115,22,0.18)', color: color, border: '1px solid rgba(249,115,22,0.35)' }
                : { color: c.textDim, border: '1px solid transparent' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-3xl font-bold num" style={{ color }}>{formatCurrency(val)}</p>
      <p className="text-xs mt-1.5" style={{ color: c.textDim }}>
        {tab === 'gesamt' ? 'Alle Eigene FZ' : 'Noch nicht verkauft'}
      </p>
    </div>
  );
}

function CustomPieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  const { c } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-4 py-3 rounded-xl text-sm"
      style={{
        background: c.tooltipBg,
        border: `1px solid ${c.tooltipBorder}`,
        color: c.textPrimary,
      }}
    >
      <p style={{ color: c.textSecondary }}>{payload[0].name}</p>
      <p className="font-bold text-base" style={{ color: c.textPrimary }}>{payload[0].value}</p>
    </div>
  );
}

export default function StatisticsPanel({ autos, filterYear, filterMonth, filterDay, setFilterYear, setFilterMonth, setFilterDay }: Props) {
  const { c } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('eigene_fz');
  const isEigeneFZ = activeTab === 'eigene_fz';
  const hasFilter = !!(filterYear || filterMonth || filterDay);

  const statistics = useMemo(() => calculateStatistics(autos), [autos]);
  const pieColors = [c.colorPos, c.colorBlue];

  const [brandTab, setBrandTab] = useState<'anzahl' | 'verdienst'>('anzahl');
  const brandPieData = useMemo(() => {
    const sold = autos.filter(a => a.bereits_verkauft);
    const map = new Map<string, { anzahl: number; verdienst: number }>();
    for (const a of sold) {
      const v = calculateVerdienst(a) ?? 0;
      const existing = map.get(a.marke) ?? { anzahl: 0, verdienst: 0 };
      existing.anzahl += 1;
      existing.verdienst += v;
      map.set(a.marke, existing);
    }
    return Array.from(map.entries())
      .map(([marke, val]) => ({ marke, ...val }))
      .sort((a, b) => b.anzahl - a.anzahl);
  }, [autos]);

  const pieData = isEigeneFZ
    ? [
        { name: 'Verkauft', value: statistics.eigene_fahrzeuge.verkauft },
        { name: 'Noch offen', value: statistics.eigene_fahrzeuge.noch_nicht_verkauft },
      ]
    : [
        { name: 'Verkauft', value: statistics.vermittlungen.verkauft },
        { name: 'Noch offen', value: statistics.vermittlungen.noch_nicht_verkauft },
      ];

  const totalInTab = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-4">
      {/* Filtro data */}
      <div
        className="rounded-2xl px-5 py-4 flex flex-wrap gap-3 items-end"
        style={{ background: c.card, border: `1px solid ${c.border}`, boxShadow: c.shadowCard }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: c.textMuted }}>Jahr</label>
          <input
            type="number"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            placeholder="2025"
            min="2000" max="2099"
            className="px-3 py-2 rounded-xl text-sm outline-none transition-all num"
            style={{ background: c.cardSolid, border: `1px solid ${filterYear ? 'rgba(59,130,246,0.5)' : c.borderInput}`, color: c.textPrimary, width: 90 }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: c.textMuted }}>Monat</label>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none transition-all"
            style={{ background: c.cardSolid, border: `1px solid ${filterMonth ? 'rgba(59,130,246,0.5)' : c.borderInput}`, color: filterMonth ? c.textPrimary : c.textMuted, minWidth: 130 }}
          >
            <option value="">Alle Monate</option>
            {['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
              .map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: c.textMuted }}>Tag</label>
          <input
            type="number"
            value={filterDay}
            onChange={e => setFilterDay(e.target.value)}
            placeholder="1"
            min="1" max="31"
            className="px-3 py-2 rounded-xl text-sm outline-none transition-all num"
            style={{ background: c.cardSolid, border: `1px solid ${filterDay ? 'rgba(59,130,246,0.5)' : c.borderInput}`, color: c.textPrimary, width: 72 }}
          />
        </div>
        {hasFilter && (
          <button
            onClick={() => { setFilterYear(''); setFilterMonth(''); setFilterDay(''); }}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
          >
            × Reset
          </button>
        )}
        {hasFilter && (
          <span
            className="text-xs px-3 py-2 rounded-xl"
            style={{ background: 'rgba(59,130,246,0.08)', color: c.colorBlue, border: `1px solid rgba(59,130,246,0.2)` }}
          >
            {autos.filter(a => a.bereits_verkauft).length} verkaufte FZ im Zeitraum
          </span>
        )}
      </div>

      {/* Tab selector */}
      <div
        className="flex gap-1 p-1 rounded-xl w-full sm:w-fit"
        style={{ background: c.cardSolid, border: `1px solid ${c.borderAccent}` }}
      >
        {([
          { key: 'eigene_fz' as TabKey, label: 'Eigene Fahrzeuge' },
          { key: 'vermittlungen' as TabKey, label: 'Vermittlungen' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 sm:flex-initial px-3 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all text-center"
            style={
              activeTab === tab.key
                ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }
                : { color: c.textMuted }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 min-[440px]:grid-cols-2 gap-4">
          {isEigeneFZ ? (
            <>
              <StatCard label="Eigene FZ Verkauft" value={statistics.eigene_fahrzeuge.verkauft.toString()} subtitle="Fahrzeuge abgeschlossen" color="green" />
              <StatCard label="Eigene FZ Noch offen" value={statistics.eigene_fahrzeuge.noch_nicht_verkauft.toString()} subtitle="Im Bestand" color="amber" />
              <StatCardEinkauf
                gesamt={statistics.eigene_fahrzeuge.totaler_einkaufspreis_gesamt}
                aktuell={statistics.eigene_fahrzeuge.totaler_einkaufspreis_aktuell}
              />
              <StatCard label="Total verdient" value={formatCurrency(statistics.eigene_fahrzeuge.total_verdient)} subtitle="Mit Eigene FZ" color="blue" />
            </>
          ) : (
            <>
              <StatCard label="Vermittlungen Verkauft" value={statistics.vermittlungen.verkauft.toString()} subtitle="Abgeschlossene Aufträge" color="green" />
              <StatCard label="Noch nicht Verkauft" value={statistics.vermittlungen.noch_nicht_verkauft.toString()} subtitle="Aktive Aufträge" color="amber" />
              <StatCard label="Total verdient" value={formatCurrency(statistics.vermittlungen.total_verdient)} subtitle="Mit Vermittlungen" color="blue" wide />
            </>
          )}
        </div>

        {/* Pie chart */}
        {totalInTab > 0 ? (
          <div
            className="rounded-2xl p-5 flex flex-col items-center justify-center"
            style={{ background: c.card, border: `1px solid ${c.border}`, boxShadow: c.shadowCard }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: c.textMuted }}>
              Übersicht
            </p>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-5 mt-1">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: pieColors[i] }} />
                  <span className="text-xs" style={{ color: c.textMuted }}>
                    {d.name}: <strong style={{ color: c.textSecondary }}>{d.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-5 flex items-center justify-center"
            style={{ background: c.card, border: `1px solid ${c.borderSubtle}` }}
          >
            <p className="text-sm" style={{ color: c.textDim }}>Noch keine Daten</p>
          </div>
        )}
      </div>

      {/* Kommissionen + Aufwände + Beste Monate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4">
          <StatCard
            label="Totale Kommissionen bezahlt"
            value={formatCurrency(statistics.total_kommissionen)}
            subtitle="Summe Kommissionsgebühr aller verkauften FZ"
            color="orange"
          />
          <StatCard
            label="Aufwände / Rep. / Transport"
            value={formatCurrency(statistics.total_aufwaende)}
            subtitle="Gesamtkosten aller Fahrzeuge"
            color="amber"
          />
        </div>

        {/* Beste Verkaufsmonate */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: c.card, border: `1px solid ${c.border}`, boxShadow: c.shadowCard }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>
            Beste Verkaufsmonate
          </p>
          {statistics.beste_monate.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={statistics.beste_monate} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.borderSubtle} />
                <XAxis dataKey="monat" tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} width={60}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 12, color: c.textSecondary, fontSize: 12 }}
                  labelStyle={{ color: c.textMuted }}
                  itemStyle={{ color: c.textSecondary }}
                  cursor={{ fill: c.rowHover }}
                  formatter={(value, name) =>
                    name === 'anzahl'
                      ? [Number(value), 'Verkäufe']
                      : [formatCurrency(Number(value)), 'Verdienst']
                  }
                />
                <Bar yAxisId="left"  dataKey="anzahl"    fill={c.colorBlue} radius={[4,4,0,0]} maxBarSize={32} />
                <Bar yAxisId="right" dataKey="verdienst" fill={c.colorPos} radius={[4,4,0,0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm" style={{ color: c.textDim }}>Noch keine Verkäufe</p>
            </div>
          )}
          <div className="flex gap-5 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.colorBlue }} />
              <span className="text-xs" style={{ color: c.textMuted }}>Anzahl Verkäufe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.colorPos }} />
              <span className="text-xs" style={{ color: c.textMuted }}>Verdienst (CHF)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Marken Verteilung */}
      {brandPieData.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{ background: c.card, border: `1px solid ${c.border}`, boxShadow: c.shadowCard }}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>
              Marken Verteilung (Verkaufte FZ)
            </p>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: c.cardSolid, border: `1px solid ${c.borderAccent}` }}>
              {(['anzahl', 'verdienst'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setBrandTab(t)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                  style={
                    brandTab === t
                      ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff' }
                      : { color: c.textMuted }
                  }
                >
                  {t === 'anzahl' ? 'Anzahl FZ' : 'Verdienst'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:max-w-[240px] mx-auto md:mx-0 shrink-0">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={brandPieData}
                    dataKey={brandTab}
                    nameKey="marke"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {brandPieData.map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, entry) => {
                      const n = Number(value) || 0;
                      const label = brandTab === 'anzahl' ? `${n} FZ` : formatCurrency(n);
                      return [label, (entry?.payload as { marke?: string })?.marke ?? ''];
                    }}
                    contentStyle={{
                      background: c.tooltipBg,
                      border: `1px solid ${c.tooltipBorder}`,
                      borderRadius: 12,
                      color: c.textPrimary,
                      fontSize: 13,
                    }}
                    labelStyle={{ color: c.textPrimary, fontWeight: 700, fontSize: 14, marginBottom: 4 }}
                    labelFormatter={(_label, payload) =>
                      (payload?.[0]?.payload as { marke?: string })?.marke ?? ''
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {brandPieData.map((b, i) => (
                <div
                  key={b.marke}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                  style={{ background: c.elevated, border: `1px solid ${c.border}` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: BRAND_COLORS[i % BRAND_COLORS.length] }} />
                  <span className="font-semibold" style={{ color: c.textPrimary }}>{b.marke}</span>
                  <span className="num" style={{ color: c.textMuted }}>
                    {brandTab === 'anzahl' ? `${b.anzahl} FZ` : formatCurrency(b.verdienst)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grand Total hero */}
      <div
        className="rounded-2xl py-8 px-6 text-center relative overflow-hidden"
        style={{
          background: c.grandBg,
          border: `1px solid ${c.grandBorder}`,
          boxShadow: `${c.shadow2xl}, 0 0 0 1px rgba(99,102,241,0.08) inset`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-72 h-72 rounded-full blur-3xl"
            style={{ top: '-50%', right: '-5%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
          <div className="absolute w-64 h-64 rounded-full blur-3xl"
            style={{ bottom: '-50%', left: '-5%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-3" style={{ color: c.textMuted }}>
            Total Vermittlungen + Eigene FZ — Gesamtverdienst
          </p>
          <p
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight num"
            style={{
              color: statistics.grand_total >= 0 ? c.colorPos : c.colorNeg,
              textShadow: statistics.grand_total >= 0 ? '0 0 48px rgba(16,185,129,0.3)' : '0 0 48px rgba(239,68,68,0.3)',
            }}
          >
            {formatCurrency(statistics.grand_total)}
          </p>
        </div>
      </div>
    </div>
  );
}