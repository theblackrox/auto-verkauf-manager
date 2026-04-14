# Auto Verkauf Manager

Fahrzeugverwaltung und Gewinnrechnung — Next.js · Supabase · Vercel

---

## Setup

### 1. Supabase Projekt erstellen

1. [supabase.com](https://supabase.com) → Neues Projekt
2. Im **SQL Editor** die komplette Datei [`supabase-schema.sql`](./supabase-schema.sql) ausführen  
   _(Tabelle, RLS Policies und Indizes werden automatisch erstellt)_
3. Unter **Authentication → Providers** E-Mail/Passwort aktivieren
4. Unter **Authentication → Users** den ersten Benutzer manuell anlegen

### 2. Umgebungsvariablen

```bash
cp .env.local.example .env.local
```

`.env.local` befüllen _(Werte aus Supabase Projekt → Settings → API)_:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Abhängigkeiten installieren und starten

```bash
npm install
npm run dev
```

App läuft unter `http://localhost:3000`

---

## Deployment auf Vercel

```bash
# Vercel CLI installieren
npm i -g vercel

# Projekt deployen
vercel

# Umgebungsvariablen setzen
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Oder alternativ im Vercel Dashboard: **Settings → Environment Variables**

---

## Funktionen

### Dashboard
- **Tab Eigene Fahrzeuge**: Anzahl verkauft/offen · Totaler Einkaufspreis · Gesamtverdienst
- **Tab Vermittlungen**: Anzahl verkauft/offen · Gesamtverdienst
- **Gesamtverdienst** — Vermittlungen + Eigene FZ kombiniert (große Zahl unten)
- **Performance nach Marke** — Investition, Verdienst und ROI pro Marke (Karten)

### Fahrzeugtabelle
- 5 Fahrzeuge pro Seite mit Paginierung
- Filter: Alle / Eigene FZ / Vermittlungen
- Spalten: Marke · Modell · Interne Nummer · Typ · Hinzugefügt · Einkaufspreis · Aufwände/Rep./Transport · Zession verdient · Verkaufspreis · Bereits Verkauft? · Datum Verkauft · Kommissionsgebühr · **Verdient Total** · Zahlung erhalten?
- Fahrzeug hinzufügen / bearbeiten / löschen

### Verdienst-Berechnung
| Typ | Formel |
|-----|--------|
| Eigenes Fahrzeug | `Verkaufspreis − Einkaufspreis − Aufwände − Kommissionsgebühr` |
| Vermittlung | `Zession verdient − Aufwände − Kommissionsgebühr` |

_(Verdienst wird nur angezeigt wenn „Bereits Verkauft" = Ja)_

---

## Projektstruktur

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx               ← Redirect zu /dashboard oder /login
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   └── auth/callback/route.ts
├── components/
│   ├── DashboardClient.tsx    ← Haupt-Client-Komponente
│   ├── Navbar.tsx
│   ├── StatisticsPanel.tsx
│   ├── PerformancePanel.tsx
│   ├── CarTable.tsx
│   └── CarModal.tsx
├── lib/
│   ├── supabase.ts            ← Browser Client
│   └── supabaseServer.ts      ← Server Client
├── types/index.ts
└── utils/calculations.ts

middleware.ts                  ← Auth-Schutz aller Routen
supabase-schema.sql            ← Alle SQL-Abfragen
```
