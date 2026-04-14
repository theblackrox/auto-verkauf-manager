export type FahrzeugTyp = 'vermittlung' | 'eigenes_fahrzeug';

export interface Auto {
  id: string;
  user_id: string;
  marke: string;
  modell: string;
  interne_nummer: string | null;
  fahrzeug_typ: FahrzeugTyp;
  einkaufspreis: number;
  aufwaende: number;
  zession_verdient: number;
  verkaufspreis: number;
  bereits_verkauft: boolean;
  datum_verkauft: string | null;
  kommissionsgebuehr: number;
  zahlung_erhalten: boolean;
  zahlung_erhalten_datum: string | null;
  created_at: string;
}

export interface Statistics {
  vermittlungen: {
    noch_nicht_verkauft: number;
    verkauft: number;
    total_verdient: number;
  };
  eigene_fahrzeuge: {
    verkauft: number;
    noch_nicht_verkauft: number;
    totaler_einkaufspreis_aktuell: number;
    totaler_einkaufspreis_gesamt: number;
    total_verdient: number;
  };
  grand_total: number;
  total_kommissionen: number;
  total_aufwaende: number;
  beste_monate: { monat: string; anzahl: number; verdienst: number }[];
}

export interface BrandPerformance {
  marke: string;
  anzahl: number;
  total_investiert: number;
  total_verdient: number;
  verkauft: number;
  nicht_verkauft: number;
}
