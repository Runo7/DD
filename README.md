# Handwerker-App Prototyp

Dieses Repository enthält die frühen HTML/CSS-Prototypen für die Büro- und Mobilansichten sowie einen ersten Backend-Start auf Basis von Supabase.

## Frontend
- Statische HTML-Seiten (`index.html`, `planning.html`, `employees.html`, `settings.html`) verwenden Mockdaten aus `mock_data.js`.
- Mobile Ansicht liegt unter `mobile/` und nutzt dieselben Mockdaten.

## Datenbank
- Das Schema in `schema.sql` definiert alle Kern-Tabellen (z. B. `users`, `jobs`, `documents`, `time_tracking`). Dieses Schema sollte in einem Supabase-Projekt angelegt werden.

## Backend (neu)
- Im Ordner `backend/` liegt ein schlanker Node-Server, der direkt die Supabase PostgREST-API anspricht.
- Konfiguration und Nutzung siehe `backend/README.md`.
- Endpunkte (Auszug):
  - `GET /health`
  - `GET/POST /jobs`, `GET/PATCH /jobs/:id`
  - `GET/POST /employees`, `GET /employees/:id`

## Lokaler Start (Backend)
```bash
cd backend
cp .env.example .env   # Supabase-URL und Service-Role-Key eintragen
node src/server.js
```

> Hinweis: In dieser Umgebung wurden keine npm-Abhängigkeiten installiert; der Server nutzt ausschließlich Node-Bordmittel.

Weitere Ausbauschritte: Authentifizierung, zusätzliche Endpunkte (Materialien, Dokumente, Zeiterfassung), Tests und CI/CD.
