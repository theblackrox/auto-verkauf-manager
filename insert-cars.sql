-- ============================================================
-- INSERT FAHRZEUGE — "Eigene FZ auf Kommission"
-- Ausführen im Supabase Dashboard → SQL Editor
-- ============================================================

DO $$
DECLARE v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'info@rwg.one' LIMIT 1;

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Benutzer info@rwg.one nicht gefunden';
  END IF;

  INSERT INTO public.autos
    (user_id, marke, modell, interne_nummer, fahrzeug_typ,
     einkaufspreis, aufwaende, zession_verdient, verkaufspreis,
     bereits_verkauft, datum_verkauft, kommissionsgebuehr, zahlung_erhalten, created_at)
  VALUES
    -- 1. BMW m135
    (v_uid, 'BMW',         'M135',  'B523526',  'eigenes_fahrzeug', 30000,  500, 0, 35000, true,  '2025-11-27', 1500, true,  '2025-11-27 00:00:00+00'),
    -- 2. Mercedes C200
    (v_uid, 'Mercedes',    'C200',  'a12263',   'eigenes_fahrzeug', 30000,  500, 0, 35000, true,  '2025-11-27', 1500, true,  '2025-11-27 00:00:00+00'),
    -- 3. Audi A180
    (v_uid, 'Audi',        'A180',  'a121223',  'eigenes_fahrzeug', 30000,    0, 0,     0, false, NULL,            0, false, '2025-11-27 00:00:00+00'),
    -- 4. BMW M1353
    (v_uid, 'BMW',         'M1353', 'a121231',  'eigenes_fahrzeug', 30000,    0, 0,     0, false, NULL,            0, false, '2025-11-27 00:00:00+00'),
    -- 5. VW Golf
    (v_uid, 'VW',          'Golf',  '1231das',  'eigenes_fahrzeug', 30000,    0, 0,     0, false, NULL,            0, false, '2025-11-27 00:00:00+00'),
    -- 6. Audi A6
    (v_uid, 'Audi',        'A6',    'a12156',   'eigenes_fahrzeug', 25000,    0, 0,     0, false, NULL,            0, false, '2026-01-01 00:00:00+00'),
    -- 7. Audi A8
    (v_uid, 'Audi',        'A8',    'a515616',  'eigenes_fahrzeug', 30000,  300, 0, 33000, true,  '2026-04-12', 1500, true,  '2026-01-10 00:00:00+00'),
    -- 8. Range Rover Velar
    (v_uid, 'Range Rover', 'Velar', 'i15126',   'eigenes_fahrzeug', 35000,  150, 0, 37000, true,  '2026-04-10', 1500, true,  '2026-04-03 00:00:00+00'),
    -- 9. Mercedes A200
    (v_uid, 'Mercedes',    'A200',  'm156162',  'eigenes_fahrzeug', 35000,  300, 0, 40000, true,  '2026-04-01', 1500, true,  '2026-03-05 00:00:00+00'),
    -- 10. Audi RSQ3
    (v_uid, 'Audi',        'RSQ3',  'a265262',  'eigenes_fahrzeug', 40000,    0, 0,     0, false, NULL,            0, false, '2026-04-06 00:00:00+00'),
    -- 11. BMW 520i
    (v_uid, 'BMW',         '520i',  'b13556',   'eigenes_fahrzeug', 45000,    0, 0,     0, false, NULL,            0, false, '2026-04-07 00:00:00+00'),
    -- 12. BMW X3
    (v_uid, 'BMW',         'X3',    'b65326',   'eigenes_fahrzeug', 35000,    0, 0,     0, false, NULL,            0, false, '2026-04-07 00:00:00+00'),
    -- 13. Audi Q3
    (v_uid, 'Audi',        'Q3',    'a123152',  'eigenes_fahrzeug', 38000,    0, 0,     0, false, NULL,            0, false, '2026-04-08 00:00:00+00'),
    -- 14. BMW M135
    (v_uid, 'BMW',         'M135',  'b13215',   'eigenes_fahrzeug', 35000,    0, 0,     0, false, NULL,            0, false, '2026-04-08 00:00:00+00'),
    -- 15. Mercedes A35
    (v_uid, 'Mercedes',    'A35',   'm156162',  'eigenes_fahrzeug', 38500,  300, 0,     0, false, NULL,            0, false, '2026-04-09 00:00:00+00');

  RAISE NOTICE 'Erfolgreich: 15 Fahrzeuge eingefügt für Benutzer %', v_uid;
END $$;
