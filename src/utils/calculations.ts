import { Auto, BrandPerformance, Statistics } from '@/types';

/**
 * Verdienst = Verkaufspreis - Einkaufspreis - Aufwände + Zession verdient - Kommissionsgebühr
 * Se Verkaufspreis è 0/vuoto → ritorna null (non ancora compilato)
 */
export function calculateVerdienst(auto: Auto): number | null {
  if (!auto.bereits_verkauft || !auto.verkaufspreis) return null;
  return auto.verkaufspreis - auto.einkaufspreis - auto.aufwaende + auto.zession_verdient - auto.kommissionsgebuehr;
}

/**
 * Provision für Vermittlungen:
 * = (Verkaufspreis - Einkaufspreis) / 108.1 * 15 + Zession_verdient
 */
export function calculateProvision(auto: Auto): number {
  return (auto.verkaufspreis - auto.einkaufspreis) / 108.1 * 15 + auto.zession_verdient;
}

export function calculateStatistics(autos: Auto[]): Statistics {
  const vermittlungen = autos.filter(a => a.fahrzeug_typ === 'vermittlung');
  const eigeneFZ = autos.filter(a => a.fahrzeug_typ === 'eigenes_fahrzeug');

  const vermittlungenVerdient = vermittlungen
    .filter(a => a.bereits_verkauft && a.verkaufspreis > 0)
    .reduce(
      (sum, a) => sum + (a.verkaufspreis - a.einkaufspreis - a.aufwaende + a.zession_verdient - a.kommissionsgebuehr),
      0
    );

  const eigeneFZVerdient = eigeneFZ
    .filter(a => a.bereits_verkauft && a.verkaufspreis > 0)
    .reduce(
      (sum, a) => sum + (a.verkaufspreis - a.einkaufspreis - a.aufwaende + a.zession_verdient - a.kommissionsgebuehr),
      0
    );

  const totaterEinkaufspreis = eigeneFZ
    .filter(a => !a.bereits_verkauft)
    .reduce((sum, a) => sum + a.einkaufspreis, 0);

  const totaterEinkaufspreisGesamt = eigeneFZ
    .reduce((sum, a) => sum + a.einkaufspreis, 0);

  return {
    vermittlungen: {
      noch_nicht_verkauft: vermittlungen.filter(a => !a.bereits_verkauft).length,
      verkauft: vermittlungen.filter(a => a.bereits_verkauft).length,
      total_verdient: vermittlungenVerdient,
    },
    eigene_fahrzeuge: {
      verkauft: eigeneFZ.filter(a => a.bereits_verkauft).length,
      noch_nicht_verkauft: eigeneFZ.filter(a => !a.bereits_verkauft).length,
      totaler_einkaufspreis_aktuell: totaterEinkaufspreis,
      totaler_einkaufspreis_gesamt: totaterEinkaufspreisGesamt,
      total_verdient: eigeneFZVerdient,
    },
    grand_total: vermittlungenVerdient + eigeneFZVerdient,
    total_kommissionen: autos.filter(a => a.bereits_verkauft).reduce((s, a) => s + a.kommissionsgebuehr, 0),
    total_aufwaende: autos.reduce((s, a) => s + a.aufwaende, 0),
    beste_monate: computeBesteMonate(autos),
  };
}

function computeBesteMonate(autos: Auto[]): { monat: string; anzahl: number; verdienst: number }[] {
  const map = new Map<string, { label: string; anzahl: number; verdienst: number }>();
  for (const a of autos) {
    if (!a.bereits_verkauft || !a.datum_verkauft) continue;
    const d = new Date(a.datum_verkauft);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('de-CH', { year: 'numeric', month: 'short' });
    const existing = map.get(key) ?? { label, anzahl: 0, verdienst: 0 };
    existing.anzahl++;
    existing.verdienst += calculateVerdienst(a) ?? 0;
    map.set(key, existing);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, val]) => ({ monat: val.label, anzahl: val.anzahl, verdienst: val.verdienst }));
}

export function calculateBrandPerformance(autos: Auto[]): BrandPerformance[] {
  const brandMap = new Map<string, BrandPerformance>();

  for (const auto of autos) {
    const existing = brandMap.get(auto.marke) ?? {
      marke: auto.marke,
      anzahl: 0,
      total_investiert: 0,
      total_verdient: 0,
      verkauft: 0,
      nicht_verkauft: 0,
    };

    existing.anzahl++;
    existing.total_investiert += auto.einkaufspreis + auto.aufwaende;

    if (auto.bereits_verkauft && auto.verkaufspreis > 0) {
      existing.verkauft++;
      existing.total_verdient +=
        auto.verkaufspreis - auto.einkaufspreis - auto.aufwaende + auto.zession_verdient - auto.kommissionsgebuehr;
    } else if (auto.bereits_verkauft) {
      existing.verkauft++;
    } else {
      existing.nicht_verkauft++;
    }

    brandMap.set(auto.marke, existing);
  }

  return Array.from(brandMap.values()).sort(
    (a, b) => b.total_investiert - a.total_investiert
  );
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
