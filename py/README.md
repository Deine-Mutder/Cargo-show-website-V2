# Telemetry App for Noodle

Die App laeuft jetzt komplett als lokale Offline-Webanwendung.

## Start

```bash
python app.py
```

Danach oeffnet sich die Oberfläche automatisch im Browser (`127.0.0.1`, lokal auf deinem Rechner).

## Funktionen

- Dark-Liquid Layout
- Trailer-Switch mit `Pfeil links/rechts`
- Cargo-Dropdown mit Name + Bildplatzhalter
- Klick auf Cargo setzt es auf den aktiven Trailer

## Struktur

- `app.py`: Startpunkt
- `src/noodle_telemetry/web_app.py`: lokaler HTTP-Server + Datenexport
- `web/`: Frontend (`index.html`, `styles.css`, `app.js`)
- `data/`: lokale SQLite-Cargo-Daten
