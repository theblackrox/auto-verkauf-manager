'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Auto, FahrzeugTyp } from '@/types';
import { createClient } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';

// Lista completa di marche auto mondiali
const ALL_CAR_BRANDS = [
  'Abarth','Alfa Romeo','Alpina','Alpine','Aston Martin','Audi','Bentley','BMW',
  'Bugatti','Cadillac','Chevrolet','Chrysler','Citroën','Cupra','Dacia','Dodge',
  'DS Automobiles','Ferrari','Fiat','Ford','Genesis','Honda','Hyundai','Infiniti',
  'Jaguar','Jeep','Kia','Lamborghini','Land Rover','Lexus','Lotus','Maserati',
  'Mazda','McLaren','Mercedes-Benz','MG','MINI','Mitsubishi','Nissan','Opel',
  'Peugeot','Porsche','RAM','Range Rover','Renault','Rolls-Royce','Seat','Skoda',
  'Smart','Subaru','Suzuki','Tesla','Toyota','Volkswagen','Volvo','VW',
];

interface Props {
  auto: Auto | null;
  onClose: () => void;
  existingBrands?: string[];
}

interface FormData {
  marke: string;
  modell: string;
  interne_nummer: string;
  fahrzeug_typ: FahrzeugTyp;
  einkaufspreis: string;
  aufwaende: string;
  zession_verdient: string;
  verkaufspreis: string;
  bereits_verkauft: boolean;
  datum_verkauft: string;
  kommissionsgebuehr: string;
  zahlung_erhalten: boolean;
  zahlung_erhalten_datum: string;
}

const emptyForm: FormData = {
  marke: '',
  modell: '',
  interne_nummer: '',
  fahrzeug_typ: 'eigenes_fahrzeug',
  einkaufspreis: '0',
  aufwaende: '0',
  zession_verdient: '0',
  verkaufspreis: '0',
  bereits_verkauft: false,
  datum_verkauft: '',
  kommissionsgebuehr: '0',
  zahlung_erhalten: false,
  zahlung_erhalten_datum: '',
};

function autoToForm(auto: Auto): FormData {
  return {
    marke: auto.marke,
    modell: auto.modell,
    interne_nummer: auto.interne_nummer ?? '',
    fahrzeug_typ: auto.fahrzeug_typ,
    einkaufspreis: auto.einkaufspreis.toString(),
    aufwaende: auto.aufwaende.toString(),
    zession_verdient: auto.zession_verdient.toString(),
    verkaufspreis: auto.verkaufspreis.toString(),
    bereits_verkauft: auto.bereits_verkauft,
    datum_verkauft: auto.datum_verkauft ?? '',
    kommissionsgebuehr: auto.kommissionsgebuehr.toString(),
    zahlung_erhalten: auto.zahlung_erhalten,
    zahlung_erhalten_datum: auto.zahlung_erhalten_datum ?? '',
  };
}

function BrandCombobox({
  value,
  onChange,
  existingBrands,
}: {
  value: string;
  onChange: (v: string) => void;
  existingBrands: string[];
}) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Unisce marche utente + lista globale (dedup, case-insensitive)
  const allOptions = useMemo(() => {
    const set = new Set<string>();
    existingBrands.forEach(b => set.add(b));
    ALL_CAR_BRANDS.forEach(b => set.add(b));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [existingBrands]);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return allOptions.slice(0, 5);
    return allOptions.filter(b => b.toLowerCase().includes(q)).slice(0, 5);
  }, [value, allOptions]);

  // Chiudi dropdown click fuori
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: c.textMuted }}>
        Marke <span className="text-red-400 ml-1">*</span>
      </label>
      <input
        type="text"
        value={value}
        required
        placeholder="z.B. BMW"
        autoComplete="off"
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500"
        style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.inputText }}
      />
      {open && filtered.length > 0 && (
        <ul
          className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden"
          style={{
            background: c.tooltipBg,
            border: `1px solid ${c.tooltipBorder}`,
            boxShadow: c.shadow,
          }}
        >
          {filtered.map(brand => (
            <li
              key={brand}
              onMouseDown={() => { onChange(brand); setOpen(false); }}
              className="px-4 py-2.5 text-sm cursor-pointer transition-colors"
              style={{ color: c.textSecondary }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {brand}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function Field({ label, value, onChange, type = 'text', placeholder, required }: FieldProps) {
  const { c } = useTheme();
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: c.textMuted }}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        step={type === 'number' ? '0.01' : undefined}
        min={type === 'number' ? '0' : undefined}
        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500"
        style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.inputText }}
      />
    </div>
  );
}

export default function CarModal({ auto, onClose, existingBrands = [] }: Props) {
  const supabase = createClient();
  const { c } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(auto ? autoToForm(auto) : emptyForm);
  const isVermittlung = form.fahrzeug_typ === 'vermittlung';

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Nicht angemeldet.');
      setLoading(false);
      return;
    }

    const payload = {
      marke: form.marke.trim(),
      modell: form.modell.trim(),
      interne_nummer: form.interne_nummer.trim() || null,
      fahrzeug_typ: form.fahrzeug_typ,
      einkaufspreis: parseFloat(form.einkaufspreis) || 0,
      aufwaende: parseFloat(form.aufwaende) || 0,
      zession_verdient: parseFloat(form.zession_verdient) || 0,
      verkaufspreis: parseFloat(form.verkaufspreis) || 0,
      bereits_verkauft: form.bereits_verkauft,
      datum_verkauft: form.datum_verkauft || null,
      kommissionsgebuehr: parseFloat(form.kommissionsgebuehr) || 0,
      zahlung_erhalten: form.zahlung_erhalten,
      zahlung_erhalten_datum: form.zahlung_erhalten_datum || null,
    };

    const { error: dbError } = auto
      ? await supabase.from('autos').update(payload).eq('id', auto.id)
      : await supabase.from('autos').insert({ ...payload, user_id: user.id });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl"
        style={{ background: c.modalBg, border: `1px solid ${c.modalBorder}` }}
      >
        {/* Modal Header */}
        <div
          className="px-6 py-5 flex items-center justify-between shrink-0"
          style={{ borderBottom: `1px solid ${c.modalBorder}` }}
        >
          <h2 className="text-xl font-semibold" style={{ color: c.textPrimary }}>
            {auto ? 'Fahrzeug bearbeiten' : 'Fahrzeug hinzufügen'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: c.textMuted }}
            onMouseEnter={e => (e.currentTarget.style.background = c.elevated)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-5">

            {/* Fahrzeugtyp */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: c.textMuted }}>
                Fahrzeugtyp *
              </p>
              <div className="flex gap-4">
                {(
                  [
                    { value: 'eigenes_fahrzeug', label: 'Eigenes Fahrzeug' },
                    { value: 'vermittlung', label: 'Vermittlung' },
                  ] as { value: FahrzeugTyp; label: string }[]
                ).map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="fahrzeug_typ"
                      checked={form.fahrzeug_typ === opt.value}
                      onChange={() => set('fahrzeug_typ', opt.value)}
                      className="accent-blue-500 w-4 h-4"
                    />
                    <span className="text-sm" style={{ color: c.textSecondary }}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Marke & Modell */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BrandCombobox
                value={form.marke}
                onChange={v => set('marke', v)}
                existingBrands={existingBrands}
              />
              <Field
                label="Modell"
                required
                value={form.modell}
                onChange={v => set('modell', v)}
                placeholder="z.B. 320i"
              />
            </div>

            {/* Interne Nummer */}
            <Field
              label="Interne Nummer"
              value={form.interne_nummer}
              onChange={v => set('interne_nummer', v)}
              placeholder="z.B. AV-001"
            />

            {/* Preise Zeile 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Einkaufspreis (CHF)"
                type="number"
                value={form.einkaufspreis}
                onChange={v => set('einkaufspreis', v)}
              />
              <Field
                label="Aufwände / Rep. / Transport (CHF)"
                type="number"
                value={form.aufwaende}
                onChange={v => set('aufwaende', v)}
              />
            </div>

            {/* Preise Zeile 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Zession verdient (CHF)"
                type="number"
                value={form.zession_verdient}
                onChange={v => set('zession_verdient', v)}
              />
              <Field
                label="Verkaufspreis (CHF)"
                type="number"
                value={form.verkaufspreis}
                onChange={v => set('verkaufspreis', v)}
              />
            </div>

            {/* Kommission */}
            <Field
              label={isVermittlung ? 'Provision (CHF)' : 'Kommissionsgebühr (CHF)'}
              type="number"
              value={form.kommissionsgebuehr}
              onChange={v => set('kommissionsgebuehr', v)}
            />

            {/* Checkboxes */}
            <div
              className="rounded-xl p-4 space-y-4"
              style={{ background: c.checkboxBg, border: `1px solid ${c.checkboxBorder}` }}
            >
              {!isVermittlung && (<>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.bereits_verkauft}
                  onChange={e => {
                    set('bereits_verkauft', e.target.checked);
                    if (!e.target.checked) set('datum_verkauft', '');
                  }}
                  className="accent-blue-500 w-4 h-4"
                />
                <span className="text-sm font-medium" style={{ color: c.textSecondary }}>
                  Bereits Verkauft
                </span>
              </label>

              {form.bereits_verkauft && (
                <div className="pl-7">
                  <Field
                    label="Datum Verkauft"
                    type="date"
                    value={form.datum_verkauft}
                    onChange={v => set('datum_verkauft', v)}
                  />
                </div>
              )}
              </>)}

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.zahlung_erhalten}
                  onChange={e => {
                    set('zahlung_erhalten', e.target.checked);
                    if (!e.target.checked) set('zahlung_erhalten_datum', '');
                  }}
                  className="accent-blue-500 w-4 h-4"
                />
                <span className="text-sm font-medium" style={{ color: c.textSecondary }}>
                  {isVermittlung ? 'Provision erhalten' : 'Zahlung erhalten'}
                </span>
              </label>

              {form.zahlung_erhalten && (
                <div className="pl-7">
                  <Field
                    label={isVermittlung ? 'Datum Provision erhalten' : 'Datum Zahlung erhalten'}
                    type="date"
                    value={form.zahlung_erhalten_datum}
                    onChange={v => set('zahlung_erhalten_datum', v)}
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-700/60 rounded-xl p-3 text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl transition-colors font-medium"
              style={{ background: c.elevated, color: c.textSecondary, border: `1px solid ${c.border}` }}
              onMouseEnter={e => (e.currentTarget.style.background = c.elevatedAlt)}
              onMouseLeave={e => (e.currentTarget.style.background = c.elevated)}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800
                         disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Wird gespeichert…' : auto ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
