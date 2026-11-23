# LeetForge Studio — Modern Leetspeak Generator (GitHub Pages)

Ein moderner, clientseitiger **Leetspeak Generator** mit Bootstrap 5, Dark/Light-Theme, Regel-Presets, Intensitätsregler und Live-Parsing über Checkboxen – optimiert für **GitHub Pages**.

## Features

- **Live-Parsing in Echtzeit:** Jede Eingabe und jede Checkbox-Änderung aktualisiert das Output-Feld sofort.
- **Konfigurierbare Checkbox-Regeln:**
  - **Ziffern** (`A→4`, `E→3`, `I→1`, `L→1`, `O→0`, `S→5`, `T→7`, `Z→2`)
  - **Symbole & ASCII** (`@`, `$`, `#`, `<`, `|<`, `/\\/\\`, `><`, u. a.)
  - **Umlaute & ß** (`Ä→43`, `Ö→03`, `Ü→|_|`, `ß→$5`)
  - **Silben & Wörter** (`for→4`, `to/too→2`, `ate→8`, `nacht→n8`, `elite→1337`)
  - **Slang & Endungen** (`-er→-0r`, `noob→n00b`, `hacker→h4ck3r`, `pwned→pwn3d`)
  - **RaNdOm CaSe** (deterministische Wechselschreibung)
- **Presets & Intensität:** Schnelle Presets sowie ein Regler für die Ersetzungsintensität (25 % – 100 %).
- **Modernes UI mit Bootstrap 5:** Glassmorphism-Karten, Dark/Light-Mode-Toggle, Zeichen-/Wortzähler und Ein-Klick-Kopieren inklusive Toast-Benachrichtigung.

## Projektstruktur

```text
.
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── .gitignore
├── index.html
└── README.md
```

## Einrichtung auf GitHub Pages

1. Neues Repository auf GitHub anlegen (z. B. `leetspeak-generator`).
2. Den Inhalt dieses ZIP-Archivs entpacken und in das Repository hochladen / pushen.
3. Auf GitHub unter **Settings → Pages** bei **Build and deployment → Source** **GitHub Actions** auswählen (der Workflow `.github/workflows/deploy-pages.yml` veröffentlicht die Seite automatisch bei jedem Push auf `main`).
4. Nach Abschluss des Workflows ist die Seite unter `https://<dein-benutzername>.github.io/<repo-name>/` erreichbar.
