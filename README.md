# Wordle

Dieses Projekt ist eine einfache Full-Stack-Umsetzung eines Wordle-Spiels mit Benutzerverwaltung, JWT-Authentifizierung, Persistenz in MongoDB sowie automatisierter Qualitätssicherung über GitHub Actions.

## Projektüberblick

Die Anwendung besteht aus einem statischen Frontend und einem Node.js-Backend. Das Frontend kommuniziert über HTTP mit dem Backend. Das Backend stellt Authentifizierungs- und Spiellogik-Endpoints bereit, speichert Benutzer und Spielergebnisse in MongoDB und befüllt die Wortliste beim Start automatisch.

## Projektstruktur

```text
Wordle/
|-- .github/
|   `-- workflows/
|       |-- deploy.yml
|       |-- backend-tests.yml
|       |-- code-quality.yml
|       `-- integration-tests.yml
|-- backend/
|   |-- src/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- utils/
|   |   |-- app.js
|   |   |-- index.js
|   |   `-- server.js
|   |-- test/
|   |   |-- backend.test.js
|   |   `-- integration.test.js
|   |-- Dockerfile
|   |-- Dockerfile.integration
|   |-- .env.example
|   |-- .env.docker.example
|   `-- package.json
|-- frontend/
|   |-- index.html
|   |-- style.css
|   |-- script.js
|   `-- config.example.js
|-- package.json
`-- README.md
```

Grobe Einordnung der wichtigsten Bereiche:

- `frontend/`: Benutzeroberfläche mit HTML, CSS und Vanilla JavaScript
- `backend/src/routes/`: API-Endpunkte für Authentifizierung und Spielablauf
- `backend/src/models/`: Mongoose-Modelle für `User`, `Word` und `GameResult`
- `backend/src/utils/`: Hilfsfunktionen wie Wortbewertung, Logging und Seed-Daten
- `backend/test/`: Unit- und Integrationstests
- `.github/workflows/`: CI-Pipelines für Qualitätssicherung, Testautomatisierung und Deployment

## Verwendete Tools und Technologien

### Backend

- `Node.js`: Laufzeitumgebung des Servers
- `Express`: Web-Framework für REST-Endpunkte und statische Auslieferung des Frontends
- `MongoDB`: Datenbank für Benutzer, Wörter und Spielresultate
- `Mongoose`: ODM für die Anbindung von MongoDB
- `jsonwebtoken`: Erstellung und Verifikation von JWT-Tokens
- `bcryptjs`: Hashing von Passwörtern
- `dotenv`: Laden der Umgebungsvariablen aus `.env`
- `cors`: Konfiguration von Cross-Origin Requests

### Frontend

- `HTML5`: Seitenstruktur
- `CSS3`: Styling
- `Vanilla JavaScript`: Spiellogik im Browser und API-Kommunikation

### Qualitätssicherung und Dev-Tools

- `Jest`: Unit- und Integrationstests
- `ESLint`: statische Codeanalyse
- `Prettier`: Formatprüfung
- `Docker`: isolierte Ausführung der Integrationstests
- `GitHub Actions`: automatisierte Pipeline bei Pushes
- `Render`: Deployment Server

## Benötigte SDKs, Laufzeiten und Treiber

Für lokale Entwicklung und Ausführung werden folgende Komponenten benötigt:

- `Node.js 20+`
- `npm`
- `MongoDB`
- `Docker Desktop` oder eine vergleichbare Docker-Installation für die containerisierten Integrationstests

Hinweise zu Treibern und Anbindung:

- Ein separater Datenbanktreiber muss nicht manuell installiert werden, da die MongoDB-Anbindung über das npm-Paket `mongoose` erfolgt.
- Unter Windows sollte für Docker der Docker-Engine-Dienst laufen.
- Für eine lokale MongoDB-Installation muss der MongoDB-Dienst gestartet sein, bevor das Backend verbunden werden kann.

## Installation und Ausführung

### 1. Repository klonen

```bash
git clone <repository-url>
cd Wordle
```

### 2. Root-Abhängigkeiten installieren

Diese Abhängigkeiten werden für Linting und Formatprüfung benötigt.

```bash
npm install
```

### 3. Backend-Abhängigkeiten installieren

```bash
cd backend
npm install
```

### 4. Backend-Konfiguration anlegen

Die Datei `.env` und `.env.docker` wird auf Basis der Vorlage erstellt:

```bash
copy .env.example .env
copy .env.docker.example .env.docker
```

Beispielinhalt:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/wordle
JWT_SECRET=your_secret_here
```

Erläuterung:

- `PORT`: Port des Backends
- `MONGO_URI`: Verbindungszeichenfolge zur MongoDB
- `JWT_SECRET`: geheimer Schlüssel für die Signierung der Tokens

### 5. Frontend-Konfiguration anlegen

Im Ordner `frontend/` muss eine `config.js` erstellt werden:

```bash
cd ..\frontend
copy config.example.js config.js
```

Lokale Konfiguration:

```js
window.API_BASE_URL = "http://localhost:5000";
```

### 6. MongoDB starten

Wenn lokal entwickelt wird, muss MongoDB vor dem Backend verfügbar sein.

Beispiel unter Windows:

```bash
net start MongoDB
```

Alternativ kann eine externe MongoDB-Instanz oder MongoDB Atlas verwendet werden. In diesem Fall muss nur `MONGO_URI` angepasst werden.

### 7. Backend starten

```bash
cd ..\backend
npm start
```

### 8. Anwendung öffnen

Nach erfolgreichem Start ist die Anwendung standardmässig unter folgender Adresse erreichbar:

```text
http://localhost:5000
```

## Tests und Qualitätssicherung

### Unit-Tests

Die Unit-Tests prüfen zentrale Hilfsfunktionen und Middleware isoliert.

Ausführung:

```bash
cd backend
npm test
```

### Integrationstests

Die Integrationstests prüfen echte API-Abläufe gegen MongoDB, unter anderem:

- Registrierung und Login
- Abruf des aktuellen Benutzers
- Start eines Spiels
- Speichern eines Resultats
- Laden des Leaderboards

Die Tests sind so ausgelegt, dass `MONGO_URI` extern bereitgestellt werden muss. Für die containerisierte Ausführung existiert ein separates Test-Dockerfile:

- [backend/Dockerfile.integration](backend/Dockerfile.integration)

Lokale Beispielausführung mit Docker:

```bash
docker run --detach --rm --name wordle-int-mongo -p 27017:27017 mongo:7
docker build -f Dockerfile.integration -t wordle-backend-integration backend
docker run --rm -e JWT_SECRET=integration-test-secret -e MONGO_URI=mongodb://host.docker.internal:27017/wordle_integration_test wordle-backend-integration
```

### Linting und Formatprüfung

```bash
npm run lint
npm run format:check
```

## Pipeline / CI-Beschreibung

Das Projekt verwendet GitHub Actions. Alle definierten Workflows können manuell gestartet werden und laufen zusätzlich bei jedem Push.

### 1. `code-quality.yml`

Zweck:

- Installation der Root-Abhängigkeiten
- Ausführung von ESLint
- Prüfung der Formatierung mit Prettier

Nutzen:

- Verhindert stilistische und syntaktische Probleme frühzeitig

### 2. `backend-tests.yml`

Zweck:

- Installation der Backend-Abhängigkeiten
- Ausführung der Jest-Unit-Tests

Nutzen:

- Schnelle Rückmeldung zu Logikfehlern in isolierten Komponenten

### 3. `integration-tests.yml`

Zweck:

- Start eines MongoDB-Service-Containers
- Bauen eines dedizierten Test-Images mit `Dockerfile.integration`
- Ausführung der Integrationstests innerhalb des Testcontainers

Nutzen:

- Realitätsnahe Prüfung der API gegen eine echte Datenbank
- Saubere Trennung zwischen Testlogik und Testinfrastruktur

### 4. `deploy.yml`

Zweck:

- Bauen von Docker Container (Frontend und Backend)
- Pushen von Docker Container in GHCR
- Triggern von Render Deploy Hook

Nutzen:

- Automatisiertes Deployment

## Umgesetzte Zusatzleistungen

Zusätzlich zur Basisanwendung wurden mehrere erweiterte Punkte umgesetzt:

- `CI/CD Deplyoment mit GitHub Actions`: Automatisiertes Build und Deployment bei `Push` auf `main`.
- `CI-Pipeline mit GitHub Actions`: Linting, Formatprüfung, Unit-Tests und Integrationstests werden bei jedem Push automatisiert ausgeführt.
- `Einsatz von Container-Tool`: Verwendung von Docker für `Build and Deploy`und `Integrationstests`.
- `Unit-Tests`: Wichtige Hilfsfunktionen und Middleware sind automatisiert getestet.
- `Containerisierte Integrationstests`: Die API wird in einer isolierten Docker-Testumgebung gegen MongoDB geprüft.
- `Task-Tracking mit Jira`: Aufgaben über Jira abgewickelt und GitHub eingebunden.
- `Logging`: Sinnvolle Logs erstellt um die Appliaktion zu überwachen.
- `JWT-Authentifizierung`: Authentifikation über JWT.
- `Feature Branching`: Änderungen über Branches erstellt und über Pull Requests gemerged.

### Umgesetzte Bonusleistungen

- `Code Reviews`: Änderungen wurden über PR Code Reviews überprüft.

## KI-Bewertung

`Luca`: Codex hat mir sehr geholfen bei der Umsetzung des Codes und den Workflows. Für die strukturierte Planung und und das Verständnis was genau umgesetzt werden soll, konnte die KI nur bedingt helfen. 

`Oguzhan`:
