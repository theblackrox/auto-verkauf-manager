-- ============================================================
-- AUTO VERKAUF MANAGER — Supabase SQL Schema
-- Ausführen im Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. TABELLE ERSTELLEN
-- ============================================================
CREATE TABLE IF NOT EXISTS public.autos (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  marke               TEXT        NOT NULL,
  modell              TEXT        NOT NULL,
  interne_nummer      TEXT,
  fahrzeug_typ        TEXT        NOT NULL
                      CHECK (fahrzeug_typ IN ('vermittlung', 'eigenes_fahrzeug'))
                      DEFAULT 'eigenes_fahrzeug',
  einkaufspreis       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  aufwaende           NUMERIC(12, 2) NOT NULL DEFAULT 0,   -- Aufwände / Rep. / Transport
  zession_verdient    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  verkaufspreis       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  bereits_verkauft    BOOLEAN     NOT NULL DEFAULT false,
  datum_verkauft      DATE,
  kommissionsgebuehr  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  zahlung_erhalten    BOOLEAN     NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ROW LEVEL SECURITY AKTIVIEREN
-- ============================================================
ALTER TABLE public.autos ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES — Jeder Benutzer sieht und verwaltet nur seine eigenen Fahrzeuge
-- ============================================================
CREATE POLICY "Benutzer sehen eigene Fahrzeuge"
  ON public.autos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Benutzer fuegen eigene Fahrzeuge ein"
  ON public.autos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Benutzer aktualisieren eigene Fahrzeuge"
  ON public.autos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Benutzer loeschen eigene Fahrzeuge"
  ON public.autos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- ABFRAGEN FÜR DIE ANWENDUNG (zur Referenz)
-- ============================================================

-- 4. Alle Fahrzeuge paginiert abrufen
-- ============================================================
-- Seite 1 (OFFSET = (Seite - 1) × 5)
SELECT *
FROM public.autos
ORDER BY created_at DESC
LIMIT 5 OFFSET 0;

-- Seite 2
SELECT *
FROM public.autos
ORDER BY created_at DESC
LIMIT 5 OFFSET 5;

-- Gesamtanzahl (für Paginierungssteuerung)
SELECT COUNT(*) AS total
FROM public.autos;

-- 5. Nur Eigene Fahrzeuge (paginiert)
-- ============================================================
SELECT *
FROM public.autos
WHERE fahrzeug_typ = 'eigenes_fahrzeug'
ORDER BY created_at DESC
LIMIT 5 OFFSET 0;

-- 6. Nur Vermittlungen (paginiert)
-- ============================================================
SELECT *
FROM public.autos
WHERE fahrzeug_typ = 'vermittlung'
ORDER BY created_at DESC
LIMIT 5 OFFSET 0;

-- ============================================================
-- STATISTIKEN
-- ============================================================

-- 7. Tab VERMITTLUNGEN
-- ============================================================
SELECT
  COUNT(*) FILTER (WHERE bereits_verkauft = false)  AS anzahl_noch_nicht_verkauft,
  COUNT(*) FILTER (WHERE bereits_verkauft = true)   AS anzahl_verkauft,
  COALESCE(
    SUM(zession_verdient - aufwaende - kommissionsgebuehr)
      FILTER (WHERE bereits_verkauft = true),
    0
  )                                                  AS total_verdient
FROM public.autos
WHERE fahrzeug_typ = 'vermittlung';

-- 8. Tab EIGENE FAHRZEUGE
-- ============================================================
SELECT
  COUNT(*) FILTER (WHERE bereits_verkauft = true)   AS anzahl_eigene_fz_verkauft,
  COUNT(*) FILTER (WHERE bereits_verkauft = false)  AS anzahl_eigene_fz_noch_nicht_verkauft,
  COALESCE(
    SUM(einkaufspreis) FILTER (WHERE bereits_verkauft = false),
    0
  )                                                  AS totaler_einkaufspreis_aktuell,
  COALESCE(
    SUM(verkaufspreis - einkaufspreis - aufwaende - kommissionsgebuehr)
      FILTER (WHERE bereits_verkauft = true),
    0
  )                                                  AS total_verdient_eigene_fz
FROM public.autos
WHERE fahrzeug_typ = 'eigenes_fahrzeug';

-- 9. GESAMTVERDIENST (Vermittlungen + Eigene FZ)
-- ============================================================
SELECT
  COALESCE(
    SUM(
      CASE
        WHEN fahrzeug_typ = 'vermittlung'      AND bereits_verkauft = true
          THEN zession_verdient - aufwaende - kommissionsgebuehr
        WHEN fahrzeug_typ = 'eigenes_fahrzeug' AND bereits_verkauft = true
          THEN verkaufspreis - einkaufspreis - aufwaende - kommissionsgebuehr
        ELSE 0
      END
    ),
    0
  ) AS grand_total_verdient
FROM public.autos;

-- 10. PERFORMANCE NACH MARKE
-- ============================================================
SELECT
  marke,
  COUNT(*)                                                     AS anzahl_fahrzeuge,
  COALESCE(SUM(einkaufspreis + aufwaende), 0)                  AS total_investiert,
  COUNT(*) FILTER (WHERE bereits_verkauft = true)              AS anzahl_verkauft,
  COUNT(*) FILTER (WHERE bereits_verkauft = false)             AS anzahl_nicht_verkauft,
  COALESCE(
    SUM(
      CASE
        WHEN fahrzeug_typ = 'vermittlung'      AND bereits_verkauft = true
          THEN zession_verdient - aufwaende - kommissionsgebuehr
        WHEN fahrzeug_typ = 'eigenes_fahrzeug' AND bereits_verkauft = true
          THEN verkaufspreis - einkaufspreis - aufwaende - kommissionsgebuehr
        ELSE 0
      END
    ),
    0
  )                                                            AS total_verdient
FROM public.autos
GROUP BY marke
ORDER BY total_investiert DESC;

-- ============================================================
-- WEITERE NÜTZLICHE ABFRAGEN
-- ============================================================

-- 11. Zahlung noch ausstehend (verkauft aber nicht bezahlt)
-- ============================================================
SELECT *
FROM public.autos
WHERE bereits_verkauft = true
  AND zahlung_erhalten = false
ORDER BY datum_verkauft ASC;

-- 12. Neueste Fahrzeuge (letzte 10)
-- ============================================================
SELECT *
FROM public.autos
ORDER BY created_at DESC
LIMIT 10;

-- 13. Index für Performance (optional, empfohlen)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_autos_user_id         ON public.autos (user_id);
CREATE INDEX IF NOT EXISTS idx_autos_fahrzeug_typ    ON public.autos (fahrzeug_typ);
CREATE INDEX IF NOT EXISTS idx_autos_bereits_verkauft ON public.autos (bereits_verkauft);
CREATE INDEX IF NOT EXISTS idx_autos_created_at      ON public.autos (created_at DESC);
