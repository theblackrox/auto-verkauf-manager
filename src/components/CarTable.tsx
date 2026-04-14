'use client';

import { useState, useMemo } from 'react';
import { Auto, FahrzeugTyp } from '@/types';
import { calculateVerdienst, calculateProvision, formatCurrency } from '@/utils/calculations';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  autos: Auto[];
  onAdd: () => void;
  onEdit: (auto: Auto) => void;
  onDelete: (id: string) => void;
}

const PAGE_SIZE = 5;
type FilterType = 'all' | FahrzeugTyp;
type SortDir = 'asc' | 'desc';
type SortKey =
  | 'marke' | 'modell' | 'interne_nummer' | 'created_at'
  | 'einkaufspreis' | 'aufwaende' | 'zession_verdient' | 'verkaufspreis'
  | 'bereits_verkauft' | 'datum_verkauft' | 'kommissionsgebuehr'
  | 'verdient_total' | 'zahlung_erhalten';

export default function CarTable({ autos, onAdd, onEdit, onDelete }: Props) {
  const { c } = useTheme();
  const [page, setPage]       = useState(1);
  const [filter, setFilter]   = useState<FilterType>('all');
  const [search, setSearch]   = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Filtri avanzati
  const [filterBrand,    setFilterBrand]    = useState('');
  const [filterYear,     setFilterYear]     = useState('');
  const [filterMonth,    setFilterMonth]    = useState('');
  const [filterDay,      setFilterDay]      = useState('');
  const [filterUnsold,   setFilterUnsold]   = useState(false);
  const [showAdvanced,   setShowAdvanced]   = useState(false);

  // Marche disponibili dinamicamente
  const availableBrands = useMemo(
    () => Array.from(new Set(autos.map(a => a.marke))).sort(),
    [autos]
  );

  const handleFilterChange = (f: FilterType) => { setFilter(f); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const resetAdvanced = () => {
    setFilterBrand(''); setFilterYear(''); setFilterMonth('');
    setFilterDay(''); setFilterUnsold(false); setPage(1);
  };
  const hasAdvanced = filterBrand || filterYear || filterMonth || filterDay || filterUnsold;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const q = search.trim().toLowerCase();

  const processed = useMemo(() => {
    let list = filter === 'all' ? autos : autos.filter(a => a.fahrzeug_typ === filter);

    // Ricerca testo
    if (q) {
      list = list.filter(a =>
        a.marke.toLowerCase().includes(q) ||
        a.modell.toLowerCase().includes(q) ||
        (a.interne_nummer ?? '').toLowerCase().includes(q)
      );
    }

    // Filtri avanzati
    if (filterBrand)  list = list.filter(a => a.marke === filterBrand);
    if (filterUnsold) list = list.filter(a => !a.bereits_verkauft);
    if (filterYear || filterMonth || filterDay) {
      list = list.filter(a => {
        const d = a.datum_verkauft ? new Date(a.datum_verkauft) : null;
        if (filterYear  && (!d || d.getFullYear()  !== parseInt(filterYear)))  return false;
        if (filterMonth && (!d || d.getMonth() + 1 !== parseInt(filterMonth))) return false;
        if (filterDay   && (!d || d.getDate()       !== parseInt(filterDay)))   return false;
        return true;
      });
    }

    list = [...list].sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortKey) {
        case 'marke':              av = a.marke;              bv = b.marke;              break;
        case 'modell':             av = a.modell;             bv = b.modell;             break;
        case 'interne_nummer':     av = a.interne_nummer??''; bv = b.interne_nummer??''; break;
        case 'created_at':         av = a.created_at;         bv = b.created_at;         break;
        case 'einkaufspreis':      av = a.einkaufspreis;      bv = b.einkaufspreis;      break;
        case 'aufwaende':          av = a.aufwaende;          bv = b.aufwaende;          break;
        case 'zession_verdient':   av = a.zession_verdient;   bv = b.zession_verdient;   break;
        case 'verkaufspreis':      av = a.verkaufspreis;      bv = b.verkaufspreis;      break;
        case 'bereits_verkauft':   av = a.bereits_verkauft?1:0; bv = b.bereits_verkauft?1:0; break;
        case 'datum_verkauft':     av = a.datum_verkauft??''; bv = b.datum_verkauft??''; break;
        case 'kommissionsgebuehr':
          av = a.fahrzeug_typ === 'vermittlung' ? calculateProvision(a) : a.kommissionsgebuehr;
          bv = b.fahrzeug_typ === 'vermittlung' ? calculateProvision(b) : b.kommissionsgebuehr;
          break;
        case 'verdient_total':     av = calculateVerdienst(a) ?? -Infinity; bv = calculateVerdienst(b) ?? -Infinity; break;
        case 'zahlung_erhalten':   av = a.zahlung_erhalten?1:0; bv = b.zahlung_erhalten?1:0; break;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });

    return list;
  }, [autos, filter, q, sortKey, sortDir, filterBrand, filterUnsold, filterYear, filterMonth, filterDay]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = processed.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const isVermittlung = filter === 'vermittlung';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: c.card,
        border: `1px solid ${c.border}`,
        boxShadow: c.shadow,
      }}
    >
      {/* Toolbar */}
      <div
        className="px-6 py-4 flex flex-col gap-3"
        style={{ borderBottom: `1px solid ${c.borderSubtle}` }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: c.textPrimary }}>
              {isVermittlung ? 'Vermittlungen' : filter === 'eigenes_fahrzeug' ? 'Eigene Fahrzeuge' : 'Fahrzeugliste'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>{processed.length} Fahrzeuge</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter tabs */}
            <div
              className="flex p-1 gap-1 rounded-xl"
              style={{ background: c.input, border: `1px solid ${c.border}` }}
            >
              {([
                { value: 'all',              label: 'Alle' },
                { value: 'eigenes_fahrzeug', label: 'Eigene FZ' },
                { value: 'vermittlung',      label: 'Vermittlungen' },
              ] as { value: FilterType; label: string }[]).map(f => (
                <button
                  key={f.value}
                  onClick={() => handleFilterChange(f.value)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                  style={
                    filter === f.value
                      ? { background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', boxShadow: '0 2px 12px rgba(59,130,246,0.3)' }
                      : { color: c.textMuted }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
            {/* Add */}
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
              </svg>
              Fahrzeug hinzufügen
            </button>
          </div>
        </div>

        {/* Search bar + Advanced filter toggle */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: '#334155' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Suchen nach Marke, Modell, Interne Nr. …"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all num"
              style={{
                background: c.input,
                border: `1px solid ${c.borderInput}`,
                color: c.textPrimary,
                caretColor: '#3b82f6',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = c.borderFocus)}
              onBlur={e  => (e.currentTarget.style.borderColor = c.borderInput)}
            />
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#475569' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: (showAdvanced || hasAdvanced) ? 'rgba(59,130,246,0.15)' : c.input,
              border: `1px solid ${(showAdvanced || hasAdvanced) ? 'rgba(59,130,246,0.4)' : c.borderInput}`,
              color: (showAdvanced || hasAdvanced) ? '#60a5fa' : c.textMuted,
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Filter
            {hasAdvanced && (
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            )}
          </button>
        </div>

        {/* Advanced filters panel */}
        {showAdvanced && (
          <div
            className="rounded-xl p-4 flex flex-wrap gap-3 items-end"
            style={{ background: c.cardInner, border: `1px solid ${c.border}` }}
          >
            {/* Marca */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: c.textMuted }}>Marke</label>
              <select
                value={filterBrand}
                onChange={e => { setFilterBrand(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-lg text-sm outline-none transition-all"
                style={{ background: c.cardSolid, border: `1px solid ${c.borderInput}`, color: filterBrand ? c.textPrimary : c.textMuted }}
              >
                <option value="">Alle Marken</option>
                {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Jahr */}
            <div className="flex flex-col gap-1 min-w-[100px]">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: c.textMuted }}>Jahr</label>
              <input
                type="number"
                value={filterYear}
                onChange={e => { setFilterYear(e.target.value); setPage(1); }}
                placeholder="2024"
                min="2000" max="2099"
                className="px-3 py-2 rounded-lg text-sm outline-none transition-all num"
                style={{ background: c.cardSolid, border: `1px solid ${c.borderInput}`, color: c.textPrimary, width: 90 }}
              />
            </div>

            {/* Monat */}
            <div className="flex flex-col gap-1 min-w-[120px]">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: c.textMuted }}>Monat</label>
              <select
                value={filterMonth}
                onChange={e => { setFilterMonth(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-lg text-sm outline-none transition-all"
                style={{ background: c.cardSolid, border: `1px solid ${c.borderInput}`, color: filterMonth ? c.textPrimary : c.textMuted }}
              >
                <option value="">Alle Monate</option>
                {['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
                  .map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>

            {/* Tag */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: c.textMuted }}>Tag</label>
              <input
                type="number"
                value={filterDay}
                onChange={e => { setFilterDay(e.target.value); setPage(1); }}
                placeholder="1–31"
                min="1" max="31"
                className="px-3 py-2 rounded-lg text-sm outline-none transition-all num"
                style={{ background: c.cardSolid, border: `1px solid ${c.borderInput}`, color: c.textPrimary, width: 76 }}
              />
            </div>

            {/* Nur nicht verkauft */}
            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition-all"
              style={{ background: filterUnsold ? 'rgba(59,130,246,0.12)' : c.cardSolid, border: `1px solid ${c.borderInput}` }}
            >
              <input
                type="checkbox"
                checked={filterUnsold}
                onChange={e => { setFilterUnsold(e.target.checked); setPage(1); }}
                className="accent-blue-500 w-4 h-4"
              />
              <span className="text-sm font-medium" style={{ color: filterUnsold ? '#60a5fa' : c.textMuted }}>
                Nur nicht verkauft
              </span>
            </label>

            {/* Reset */}
            {hasAdvanced && (
              <button
                onClick={resetAdvanced}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1400px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${c.borderSubtle}`, background: c.cardHeader }}>
              <SortTh k="marke"            cur={sortKey} dir={sortDir} onSort={handleSort} align="left">Marke</SortTh>
              <SortTh k="modell"           cur={sortKey} dir={sortDir} onSort={handleSort} align="left">Modell</SortTh>
              <SortTh k="interne_nummer"   cur={sortKey} dir={sortDir} onSort={handleSort} align="left">Int. Nr.</SortTh>
              {!isVermittlung && <Th align="left">Typ</Th>}
              <SortTh k="created_at"       cur={sortKey} dir={sortDir} onSort={handleSort} align="left">Datum eingekauft</SortTh>
              <SortTh k="einkaufspreis"    cur={sortKey} dir={sortDir} onSort={handleSort} align="right">Einkaufspreis</SortTh>
              {!isVermittlung && <SortTh k="aufwaende" cur={sortKey} dir={sortDir} onSort={handleSort} align="right">Aufwände / Rep. / Transport</SortTh>}
              <SortTh k="zession_verdient" cur={sortKey} dir={sortDir} onSort={handleSort} align="right">Zession verdient</SortTh>
              <SortTh k="verkaufspreis"    cur={sortKey} dir={sortDir} onSort={handleSort} align="right">Verkaufspreis</SortTh>
              {!isVermittlung && <SortTh k="bereits_verkauft" cur={sortKey} dir={sortDir} onSort={handleSort} align="center">Bereits Verkauft?</SortTh>}
              {!isVermittlung && <SortTh k="datum_verkauft"   cur={sortKey} dir={sortDir} onSort={handleSort} align="left">Datum Verkauft</SortTh>}
              <SortTh k="kommissionsgebuehr" cur={sortKey} dir={sortDir} onSort={handleSort} align="right">
                {isVermittlung ? 'Provision' : 'Kommissionsgebühr'}
              </SortTh>
              {!isVermittlung && <SortTh k="verdient_total" cur={sortKey} dir={sortDir} onSort={handleSort} align="right">Verdient Total</SortTh>}
              <SortTh k="zahlung_erhalten" cur={sortKey} dir={sortDir} onSort={handleSort} align="center">
                {isVermittlung ? 'Provision Erhalten?' : 'Zahlung erhalten?'}
              </SortTh>
              <Th align="center">Aktionen</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={isVermittlung ? 9 : 15} className="text-center py-16" style={{ color: c.textDim }}>
                  {q ? `Keine Ergebnisse für „${search}"` : 'Keine Fahrzeuge gefunden'}
                </td>
              </tr>
            ) : (
              paginated.map((auto, idx) => {
                const verdienst = calculateVerdienst(auto);
                const showVerdienst = verdienst !== null;
                const oddRow = idx % 2 !== 0;

                return (
                  <tr
                    key={auto.id}
                    style={{
                      borderBottom: `1px solid ${c.borderSubtle}`,
                      background: oddRow ? c.rowOdd : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.rowHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = oddRow ? c.rowOdd : 'transparent')}
                  >
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: c.textPrimary }}>{auto.marke}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: c.textSecondary }}>{auto.modell}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap num" style={{ color: c.textMuted }}>
                      {auto.interne_nummer ?? '—'}
                    </td>
                    {!isVermittlung && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={auto.fahrzeug_typ === 'eigenes_fahrzeug'
                            ? { background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.22)' }
                            : { background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.22)' }
                          }
                        >
                          {auto.fahrzeug_typ === 'eigenes_fahrzeug' ? 'Eigene FZ' : 'Vermittlung'}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-xs whitespace-nowrap num" style={{ color: c.textMuted }}>
                      {new Date(auto.created_at).toLocaleDateString('de-CH')}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap num" style={{ color: c.textSecondary }}>
                      {formatCurrency(auto.einkaufspreis)}
                    </td>
                    {!isVermittlung && (
                      <td className="px-4 py-3 text-right whitespace-nowrap num" style={{ color: c.textSecondary }}>
                        {formatCurrency(auto.aufwaende)}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right whitespace-nowrap num" style={{ color: c.textSecondary }}>
                      {formatCurrency(auto.zession_verdient)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap num" style={{ color: c.textSecondary }}>
                      {formatCurrency(auto.verkaufspreis)}
                    </td>
                    {!isVermittlung && (
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <Badge active={auto.bereits_verkauft} activeLabel="Ja" inactiveLabel="Nein" />
                      </td>
                    )}
                    {!isVermittlung && (
                      <td className="px-4 py-3 text-xs whitespace-nowrap num" style={{ color: c.textMuted }}>
                        {auto.datum_verkauft ? new Date(auto.datum_verkauft).toLocaleDateString('de-CH') : '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right whitespace-nowrap num" style={{ color: c.textSecondary }}>
                      {auto.fahrzeug_typ === 'vermittlung'
                        ? formatCurrency(calculateProvision(auto))
                        : formatCurrency(auto.kommissionsgebuehr)}
                    </td>
                    {!isVermittlung && (
                      <td className="px-4 py-3 text-right font-bold whitespace-nowrap num">
                        {showVerdienst
                          ? <span style={{ color: verdienst >= 0 ? c.colorPos : c.colorNeg }}>{formatCurrency(verdienst)}</span>
                          : <span style={{ color: c.textVdim }}>—</span>
                        }
                      </td>
                    )}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-0.5">
                        <Badge active={auto.zahlung_erhalten} activeLabel="Ja" inactiveLabel="Nein" />
                        {auto.zahlung_erhalten && auto.zahlung_erhalten_datum && (
                          <span className="text-xs num" style={{ color: c.textMuted }}>
                            {new Date(auto.zahlung_erhalten_datum).toLocaleDateString('de-CH')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEdit(auto)}
                          title="Bearbeiten"
                          className="p-1.5 rounded-lg transition-all"
                          style={{ color: '#60a5fa' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.12)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(auto.id)}
                          title="Löschen"
                          className="p-1.5 rounded-lg transition-all"
                          style={{ color: '#f87171' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: `1px solid ${c.borderSubtle}` }}
        >
          <span className="text-sm" style={{ color: c.textMuted }}>
            Seite {safePage} von {totalPages} · {processed.length} Fahrzeuge
          </span>
          <div className="flex gap-1.5 items-center flex-wrap">
            <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>← Zurück</PagBtn>
            {pageNumbers.map(p => (
              <PagBtn key={p} onClick={() => setPage(p)} active={p === safePage}>{p}</PagBtn>
            ))}
            <PagBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>Weiter →</PagBtn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── helper sub-components ── */

function Th({ children, align }: { children: React.ReactNode; align: 'left' | 'right' | 'center' }) {
  const { c } = useTheme();
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap
        ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}
      style={{ color: c.textDim }}
    >
      {children}
    </th>
  );
}

function SortTh({
  children, k, cur, dir, onSort, align,
}: {
  children: React.ReactNode;
  k: SortKey;
  cur: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align: 'left' | 'right' | 'center';
}) {
  const { c } = useTheme();
  const active = cur === k;
  return (
    <th
      onClick={() => onSort(k)}
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none
        ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}
      style={{ color: active ? '#60a5fa' : c.textDim, userSelect: 'none' }}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <span style={{ opacity: active ? 1 : 0.3 }}>
          {active && dir === 'desc' ? '↓' : '↑'}
        </span>
      </span>
    </th>
  );
}

function Badge({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={
        active
          ? { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.22)' }
          : { background: 'rgba(15,25,55,0.6)', color: '#334155', border: '1px solid rgba(59,130,246,0.08)' }
      }
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function PagBtn({
  children, onClick, disabled, active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  const { c } = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 text-sm rounded-lg transition-colors font-medium"
      style={
        active
          ? { background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', boxShadow: '0 2px 12px rgba(59,130,246,0.3)' }
          : disabled
          ? { background: c.elevated, color: c.textVdim, cursor: 'not-allowed' }
          : { background: c.cardSolid, color: c.textMuted }
      }
    >
      {children}
    </button>
  );
}

