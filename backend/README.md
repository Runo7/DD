# Handwerker API (Supabase-backed)

Dies ist der erste Backend-Schritt für die Handwerker-App. Der Server stellt eine schmale REST-API bereit, die direkt auf die Supabase PostgREST-Schnittstelle (Tabellen aus `schema.sql`) zugreift. Er benötigt die Service-Role-API-Keys, um CRUD-Operationen für Büro- und Handwerker-Workflows auszuführen.

## Voraussetzungen
- Node 18+ (wegen nativer `fetch`-Unterstützung)
- Supabase-Projekt, das das Schema aus `../schema.sql` enthält
- Service-Role-Key (nicht in Frontend ausliefern!)

## Konfiguration
1. `.env.example` kopieren und Werte setzen:
   ```bash
   cp .env.example .env
   ```
2. `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` hinterlegen.
3. Optional `PORT` anpassen (Default: `8788`).

> Hinweis: In dieser Umgebung wurden keine npm-Abhängigkeiten installiert, damit der Server ohne externes Netzwerk lauffähig bleibt. Der Code nutzt ausschließlich Node-Bordmittel.

## Starten
```bash
cd backend
node src/server.js
```

Bei erfolgreichem Start loggt der Server `API server running on port <PORT>`.

## Endpunkte
Alle Antworten sind JSON und enthalten die Nutzlast unter `data` oder einen `error`-Key.

- `GET /health` – einfacher Gesundheitscheck.
- `GET /jobs` – listet Jobs mit Basis-Feldern.
- `POST /jobs` – legt einen neuen Job an.
  - Beispiel-Body:
    ```json
    {
      "title": "Wartung Wärmepumpe",
      "job_type": "Wartung",
      "status": "geplant",
      "planned_start": "2024-01-10T08:00:00Z",
      "planned_end": "2024-01-10T10:00:00Z",
      "customer_id": "<uuid>",
      "created_by": "<uuid>",
      "assigned_by": "<uuid>"
    }
    ```
- `GET /jobs/:id` – ruft einen einzelnen Job ab.
- `PATCH /jobs/:id` – aktualisiert Felder eines Jobs.
- `GET /employees` – listet Nutzer aus der `users`-Tabelle (ohne Passwörter).
- `POST /employees` – legt einen neuen Nutzer mit `password_hash` an.
- `GET /employees/:id` – ruft einen Nutzer ab.

## Fehlerbehandlung
- **400** bei Validierungsfehlern (z. B. fehlender Titel oder ungültiger `role`).
- **404** wenn Datensätze nicht existieren.
- **500** bei Supabase-/Serverfehlern, inkl. Details im Feld `details` wenn verfügbar.

## Nächste Schritte
- Authentifizierung (JWT) und rollenbasierte Guards ergänzen.
- Weitere Endpunkte (Materialien, Dokumente, Zeiterfassung) analog anbinden.
- Tests & Linter aktivieren; optional Express o.ä. einsetzen, sobald Netzwerk für Paketinstallation vorhanden ist.
