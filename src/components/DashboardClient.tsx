'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { Auto } from '@/types';
import { calculateBrandPerformance, calculateStatistics } from '@/utils/calculations';
import { useTheme } from '@/context/ThemeContext';
import Navbar from './Navbar';
import StatisticsPanel from './StatisticsPanel';
import PerformancePanel from './PerformancePanel';
import CarTable from './CarTable';
import CarModal from './CarModal';
import Footer from './Footer';

interface Props {
  userEmail: string;
}

export default function DashboardClient({ userEmail }: Props) {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAuto, setEditingAuto] = useState<Auto | null>(null);
  const [filterYear,  setFilterYear]  = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDay,   setFilterDay]   = useState('');
  const { c } = useTheme();

  const supabase = createClient();

  const fetchAutos = useCallback(async () => {
    const { data, error } = await supabase
      .from('autos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAutos(data as Auto[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAutos();
  }, [fetchAutos]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Möchten Sie dieses Fahrzeug wirklich löschen?');
    if (!confirmed) return;
    await supabase.from('autos').delete().eq('id', id);
    fetchAutos();
  };

  const handleEdit = (auto: Auto) => {
    setEditingAuto(auto);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingAuto(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAuto(null);
    fetchAutos();
  };

  const brandPerformance = calculateBrandPerformance(autos);

  const hasFilter = !!(filterYear || filterMonth || filterDay);
  const filteredAutos = useMemo(() => {
    if (!hasFilter) return autos;
    return autos.filter(a => {
      const dateStr = a.bereits_verkauft ? a.datum_verkauft : a.created_at;
      const d = dateStr ? new Date(dateStr) : null;
      if (filterYear  && (!d || d.getFullYear()  !== parseInt(filterYear)))  return false;
      if (filterMonth && (!d || d.getMonth() + 1 !== parseInt(filterMonth))) return false;
      if (filterDay   && (!d || d.getDate()       !== parseInt(filterDay)))   return false;
      return true;
    });
  }, [autos, filterYear, filterMonth, filterDay, hasFilter]);
  const filteredBrandPerformance = useMemo(() => calculateBrandPerformance(filteredAutos), [filteredAutos]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Wird geladen…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: c.page, transition: 'background 0.25s ease' }}>
      <Navbar userEmail={userEmail} />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20">
        {/* Summary bar */}
        {(() => {
          const totalEigene      = autos.filter(a => a.fahrzeug_typ === 'eigenes_fahrzeug').length;
          const totalVermittlung = autos.filter(a => a.fahrzeug_typ === 'vermittlung').length;
          const totalVerkauft    = autos.filter(a => a.bereits_verkauft).length;
          const totalOffen       = autos.filter(a => !a.bereits_verkauft).length;
          const items = [
            { label: 'Total Fahrzeuge',  value: autos.length,        color: c.textPrimary },
            { label: 'Eigene FZ',        value: totalEigene,         color: c.colorBlue },
            { label: 'Vermittlungen',    value: totalVermittlung,    color: c.colorBlue },
            { label: 'Verkauft',         value: totalVerkauft,       color: c.colorPos },
            { label: 'Noch offen',       value: totalOffen,          color: c.colorAmber },
          ];
          return (
            <div
              className="rounded-2xl px-4 sm:px-6 py-3 flex flex-wrap gap-x-4 gap-y-3 sm:gap-6 items-center"
              style={{ background: c.card, border: `1px solid ${c.border}`, boxShadow: c.shadowCard }}
            >
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && <div className="w-px h-6 hidden sm:block" style={{ background: c.borderSubtle }} />}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>{item.label}</p>
                    <p className="text-2xl font-extrabold num leading-tight" style={{ color: item.color }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Statistics Tabs + Grand Total */}
        <StatisticsPanel
          autos={filteredAutos}
          filterYear={filterYear}
          filterMonth={filterMonth}
          filterDay={filterDay}
          setFilterYear={setFilterYear}
          setFilterMonth={setFilterMonth}
          setFilterDay={setFilterDay}
        />

        {/* Brand Performance Cards */}
        <PerformancePanel brandPerformance={filteredBrandPerformance} autos={filteredAutos} />

        {/* Vehicle Table with Pagination */}
        <CarTable
          autos={autos}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      <Footer />

      {showModal && (
        <CarModal
          auto={editingAuto}
          onClose={handleModalClose}
          existingBrands={Array.from(new Set(autos.map(a => a.marke)))}
        />
      )}
    </div>
  );
}
