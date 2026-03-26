# CRdemo – Challenge-Response Authentifizierung

> Demo-Applikation zur Bachelorarbeit:
> **„Konzeption und Implementierung einer Challenge-Response-Authentifizierung zur Absicherung von Wartungszugängen an Industriemaschinen mit mobilen Endgeräten"**

---

## Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [App-Struktur & Navigation](#app-struktur--navigation)
   - [Tab 1 – Welcome](#tab-1--welcome)
   - [Tab 2 – Auth-Demo](#tab-2--auth-demo)
   - [Tab 3 – Plattformspezifische Dateien](#tab-3--plattformspezifische-dateien)
   - [Tab 4 – Gluestack UI](#tab-4--gluestack-ui)
3. [Authentifizierungsprotokoll](#authentifizierungsprotokoll)
4. [Maschinenseriennummer & Device-Binding](#maschinenseriennummer--device-binding)
5. [Protokoll-Versionen (V1 / V2 / V3)](#protokoll-versionen)
6. [Versions-Kodierung in der Challenge](#versions-kodierung-in-der-challenge)
7. [QR-Code-Workflow](#qr-code-workflow)
8. [Projektstruktur](#projektstruktur)
9. [Installation & Start](#installation--start)
10. [Verfügbare Scripts](#verfügbare-scripts)
11. [Tech-Stack](#tech-stack)
12. [Sicherheitsbetrachtung](#sicherheitsbetrachtung)

---

## Überblick

Diese App demonstriert interaktiv, wie eine **HMAC-SHA256-basierte Challenge-Response-Authentifizierung** funktioniert. Das Szenario: Ein Wartungstechniker möchte Zugang zu einer Industriemaschine erhalten. Statt eines statischen Passworts läuft ein kryptografisches Einmalcode-Verfahren ab, bei dem nur jemand mit dem richtigen Secret Key einen gültigen Response-Code berechnen kann.

Die App ist zugleich eine **React-Native- und Expo-Demo**: Sie zeigt in vier Tabs nicht nur das Authentifizierungsprotokoll, sondern auch Cross-Platform-Konzepte wie plattformspezifische Dateien (Metro Bundler), das Gluestack-UI-Design-System und den grundlegenden React-Native/Expo-Workflow.

```
┌─────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│  ① Maschine         │        │  ② Mobiles Gerät     │        │  ③ Maschine          │
│  Challenge erzeugen │──────▶ │  Response berechnen  │──────▶ │  Verifikation        │
└─────────────────────┘        └──────────────────────┘        └──────────────────────┘
   Seriennummer anzeigen          Seriennummer + Challenge        Erwartet. Code intern
   Zufalls-Challenge              per Hand oder QR-Code           berechnen + vergleichen
   Version in Bits 3–0            eingeben → HMAC → Code
```

---

## App-Struktur & Navigation

Die App ist in vier Tabs aufgeteilt, die über eine untere Tab-Leiste (`TabBar`) erreichbar sind. Jeder Tab ist ein eigenständiger Screen in `src/screens/`.

```
App.tsx
├── AppHeader        (Titel + Untertitel, wechselt je nach aktivem Tab)
├── WelcomeScreen    (Tab: welcome)
├── AuthScreen       (Tab: auth)
├── PlatformScreen   (Tab: platform)
└── GluestackScreen  (Tab: gluestack)
    └── TabBar       (Navigation)
```

---

### Tab 1 – Welcome

**Datei:** `src/screens/WelcomeScreen.tsx`

Einführung in React Native und Expo. Dieser Tab dient als didaktische Einstiegsseite für die Präsentation der Bachelorarbeit:

- **Hero-Banner** mit Stack-Badges (React Native, Expo SDK 54, TypeScript, iOS · Android · Web)
- **Was ist React Native?** – Erklärung des Frameworks, natives Rendering ohne WebView
- **Was ist Expo?** – Toolchain, Expo Go, native APIs
- **Native vs. Web** – Vergleichstabelle der React-Native-Primitiven vs. HTML-Elemente (`<View>` / `<div>`, `<Text>` / `<p>`, `<Image>` / `<img>` etc.)
- **Kernkonzepte** – StyleSheet, Flexbox, Bridge/JSI, Hot Reload, Metro Bundler, Expo Go (6 Feature-Cards)
- **Expo Managed Workflow** – 4-stufiger Ablauf (Code schreiben → Expo starten → QR scannen → Build & Deploy)
- **CTAs** – Direktlinks zu Auth-Demo und Plattform-Tab

---

### Tab 2 – Auth-Demo

**Datei:** `src/screens/AuthScreen.tsx`

Das Herzstück der Bachelorarbeit: interaktive Demo des 3-Schritt-Authentifizierungsprotokolls.

Der Screen läuft responsiv:
- auf **mobilen Geräten** (iOS, Android): vertikaler Fluss (Column)
- auf **breitem Web-Viewport** (> Breakpoint): horizontaler Fluss (Row)

**Komponenten:**

| Komponente | Datei | Aufgabe |
|---|---|---|
| `ChallengePanel` | `src/components/ChallengePanel.tsx` | Schritt ①: Seriennummer, Challenge-Zahl, Versionsauswahl, Countdown (60 s), QR-Code |
| `ResponsePanel` | `src/components/ResponsePanel.tsx` | Schritt ②: Eingabe von Seriennummer + Challenge, HMAC-Berechnung Schritt für Schritt, Response-Code |
| `VerifyPanel` | `src/components/VerifyPanel.tsx` | Schritt ③: Code-Eingabe, interne Verifikation, Erfolg/Fehler-Feedback |
| `ArrowConnector` | `src/components/ArrowConnector.tsx` | Visueller Pfeil zwischen den Schritten (horizontal oder vertikal) |
| `StepBadge` | `src/components/StepBadge.tsx` | Nummeriertes Badge (①②③) |
| `Divider` | `src/components/Divider.tsx` | Trennlinie mit optionalem Label |

**State-Management in AuthScreen:**
- `version` – aktive Protokoll-Version (1, 2 oder 3)
- `challenge` + `timeLeft` – aus `useChallenge`-Hook (automatische 60-s-Rotation)
- `serialNumber` – einmalig generiert beim App-Start via `generateSerialNumber()`
- `secret` – editierbarer Secret Key (Standardwert aus Theme)
- `enteredChallenge` / `enteredSerial` – Eingaben des Nutzers in Panel ②
- `qrScanned` – Flag, ob Daten per QR-Scan befüllt wurden
- `responseInput` / `authStatus` – Eingabe und Ergebnis der Verifikation in Panel ③

Bei **Fehleingabe** in Panel ③ wird nach 1,2 s automatisch eine neue Challenge generiert.

---

### Tab 3 – Plattformspezifische Dateien

**Datei:** `src/screens/PlatformScreen.tsx`

Erklärt das Metro-Bundler-Feature für plattformspezifische Dateiendungen:

- **Aktuell aktive Plattform-Banner** – zeigt `Platform.OS` live und welche Datei Metro gerade lädt
- **Live-Demo: PlatformCard** – dieselbe `<PlatformCard />`-Zeile rendert unterschiedlich auf iOS (`PlatformCard.ios.tsx`) und Web (`PlatformCard.web.tsx`)
- **Priorisierungs-Liste** – zeigt die Reihenfolge der Metro-Auflösung: `.ios.tsx` → `.android.tsx` → `.web.tsx` → `.tsx` (Fallback)
- **Import-Beispiel** – Code-Block erklärt den transparenten Import ohne if/else
- **Dateistruktur-Übersicht** – Code-Block der plattformspezifischen Dateien
- **NativeUIShowcase** – weitere Live-Demo mit plattformspezifischer UI (`NativeUIShowcase.ios.tsx` vs. `NativeUIShowcase.web.tsx`)
- **Empfehlungen** – wann Plattformdateien sinnvoll sind (Navigation/Gesten, Plattform-APIs, Design-Sprache) vs. wann `Platform.select({})` ausreicht

---

### Tab 4 – Gluestack UI

**Datei:** `src/screens/GluestackScreen.tsx`

Interaktive Showcase aller Gluestack-UI-Komponenten, die in der Auth-Demo eingesetzt werden:

| Abschnitt | Komponenten |
|---|---|
| Button | solid / outline / link, verschiedene actions und sizes, disabled |
| Badge | info / success / warning / error / muted, solid + outline |
| Alert | info / success / warning / error mit Icon |
| Avatar | Fallback-Initialen, verschiedene sizes und Farben |
| Input | outline / rounded / underlined, disabled |
| Checkbox & Switch | interaktiv, mit Labels |
| Select / Dropdown | Protokoll-Version wählen, interaktiv |
| Progress & Spinner | statische Werte, small/large Spinner |
| Layout | VStack / HStack / Divider mit `space`-Prop |
| Typography | Heading sizes 2xl–xs, bold / italic / underline / strikeThrough |

Alle Komponenten sind **plattformübergreifend** – sie funktionieren identisch auf iOS, Android und Web.

---

## Authentifizierungsprotokoll

### Schritt 1 – Challenge erzeugen (Maschine)

Die Maschine zeigt:
- ihre fest zugewiesene **Seriennummer** (Format `JB12_xxxx`)
- eine kryptografisch zufällige **Challenge-Zahl** mit eingebetteter Protokoll-Version in den **Bits 3–0**

Die Challenge ist **60 Sekunden** gültig – danach wird automatisch eine neue generiert, um Replay-Angriffe zu verhindern. Bei einer Fehleingabe wird ebenfalls sofort eine neue Challenge erzeugt.

### Schritt 2 – Response berechnen (Mobiles Gerät)

Der Techniker liest Seriennummer und Challenge vom Display ab (oder scannt den QR-Code). Die App:

1. Liest die Version aus den **Bits 3–0** der Challenge-Zahl
2. Baut die HMAC-Nachricht: `serial|challenge`
3. Berechnet `HMAC-SHA256(serial|challenge, secret_key)`
4. Wendet die versionsabhängige **Truncation** an
5. Zeigt den fertigen Response-Code an

Der Secret Key ist vorab auf dem Gerät gespeichert und wird **nie übertragen**.

### Schritt 3 – Verifizieren (Maschine)

Der Techniker gibt den Code am Maschinenterminal ein. Die Maschine berechnet den erwarteten Code **intern** (gleiche HMAC-Operation + gleiche Truncation) und vergleicht. Bei Übereinstimmung → Zugang gewährt. Bei Fehleingabe → sofortige neue Challenge.

```
HMAC-SHA256( serial|challenge , secret_key )
              └───────┬───────┘
                 Nachricht
```

---

## Maschinenseriennummer & Device-Binding

Jede Maschine hat eine zufällig generierte Seriennummer im Format `JB12_xxxx` (4 Zufallsziffern). Die Seriennummer wird als Präfix in die HMAC-Nachricht eingebaut:

```
Nachricht = serial + "|" + challenge
Beispiel  = "JB12_4823|57382946"

HMAC-SHA256("JB12_4823|57382946", secret_key)
```

**Warum ist das wichtig?**

Ohne Device-Binding könnte ein einmal abgehörter Response-Code auf einer anderen Maschine mit dem gleichen Secret Key erneut verwendet werden. Durch die Seriennummer in der Nachricht ist jeder Code **an eine konkrete Maschine gebunden**:

| Seriennummer | Challenge  | Secret Key  | Response-Code |
|--------------|------------|-------------|---------------|
| JB12_4823    | 57382946   | meinSecret  | 3847 (V1)     |
| JB12_9901    | 57382946   | meinSecret  | 1204 (V1)     |

Gleiche Challenge, gleicher Secret – **anderer Code**, weil die Seriennummer abweicht.

---

## Protokoll-Versionen

Die Demo unterstützt drei Versionen, die unterschiedliche Truncation-Methoden demonstrieren. Die Anzahl der Stellen gilt sowohl für die **Challenge** als auch für den **Response-Code**.

### V1 – Standard (4-stellig)

Einfache, feste Trunkierung. Grundprinzip analog HOTP (RFC 4226), jedoch ohne Zähler.

```
HMAC-SHA256(serial|challenge, secret)
  → letzte 4 Bytes (8 Hex-Zeichen)
  → & 0x7FFFFFFF  (MSB auf 0 → positiver Integer)
  → mod 10.000
  → 4-stelliger Code
```

**Sicherheit:** 1 von 10.000 (10⁴) möglichen Codes

---

### V2 – Dynamic Offset nach RFC 4226 (6-stellig)

Statt einer festen Position wird der Startpunkt dynamisch aus dem **letzten Byte** des HMAC bestimmt. Dies entspricht der offiziellen HOTP-Spezifikation (RFC 4226, Abschnitt 5.3).

```
HMAC-SHA256(serial|challenge, secret)
  → letztes Byte & 0x0F  →  Offset (0–15, Byte-Index)
  → 4 Bytes ab Offset
  → & 0x7FFFFFFF
  → mod 1.000.000
  → 6-stelliger Code
```

**Vorteil gegenüber V1:** Der Offset variiert mit jedem HMAC-Wert – ein Angreifer kann keine feste Stelle im Output targeten.
**Sicherheit:** 1 von 1.000.000 (10⁶) möglichen Codes

---

### V3 – Erweitert (8-stellig)

Gleiche Truncation wie V1, aber mit **mod 10⁸** statt mod 10⁴. Ergibt einen 8-stelligen Code mit deutlich höherer Entropie.

```
HMAC-SHA256(serial|challenge, secret)
  → letzte 4 Bytes
  → & 0x7FFFFFFF
  → mod 100.000.000
  → 8-stelliger Code
```

**Sicherheit:** 1 von 100.000.000 (10⁸) möglichen Codes – 10.000× stärker als V1, 100× stärker als V2

---

### Versionsvergleich

| Eigenschaft           | V1           | V2 (RFC 4226)          | V3            |
|-----------------------|--------------|------------------------|---------------|
| Stellen (Challenge)   | 4            | 6                      | 8             |
| Stellen (Response)    | 4            | 6                      | 8             |
| Truncation            | Fest (Ende)  | Dynamisch (RFC 4226)   | Fest (Ende)   |
| Modulo                | 10⁴          | 10⁶                    | 10⁸           |
| Mögliche Codes        | 10.000       | 1.000.000              | 100.000.000   |
| Ratewahrscheinlichkeit| 0,01 %       | 0,0001 %               | 0,000001 %    |

---

## Versions-Kodierung in der Challenge

Die Protokoll-Version ist **in der Challenge-Zahl selbst** versteckt – in den **Bits 3–0** (unteres Nibble). Die restlichen Bits enthalten vollständig zufällige Daten, sodass die führenden Dezimalziffern die Version **nicht verraten**.

```
Bit 31..4                    | Bit 3..0
28-bit Zufallsdaten          | Version (Nibble)
(führende Ziffern: zufällig) | 0001 = V1
                             | 0010 = V2
                             | 0011 = V3
```

**Kodierung:**
```typescript
// Challenge erzeugen (V2, 6-stellig)
const base = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
const challenge = ((base & ~0xF) | 2).toString();  // z. B. "834290"

// Version lesen
const version = parseInt(challenge, 10) & 0x0F;  // → 2
```

**Beispiel** (gleiche Zufallsbasis, alle drei Versionen):

| Version | Challenge  | Bits 3–0 |
|---------|------------|----------|
| V1      | 8337       | 0001     |
| V2      | 834290     | 0010     |
| V3      | 83742947   | 0011     |

**Warum untere statt obere Bits?**
Bei oberen Bits würde die Version den Wertebereich der Dezimalzahl definieren – V1 läge immer in einem anderen Zahlenbereich als V2, was die Version aus der führenden Ziffer erkennbar machen würde. Die unteren 4 Bits verändern den Dezimalwert nur minimal; die führenden Ziffern bleiben vollständig zufällig.

---

## QR-Code-Workflow

In Schritt ① kann die Maschine einen QR-Code anzeigen, der alle für die Response-Berechnung notwendigen Informationen bündelt. Damit entfällt die manuelle Eingabe von Seriennummer, Challenge und Version.

### QR-Code-Inhalt

```json
{
  "s": "JB12_4823",
  "c": "834290",
  "v": 2
}
```

| Feld | Bedeutung       |
|------|-----------------|
| `s`  | Seriennummer    |
| `c`  | Challenge       |
| `v`  | Protokoll-Version (1, 2 oder 3) |

### Ablauf

1. **Panel ①** – QR-Code aufklappen → Code anzeigen
2. **Scannen (simuliert)** – Button „QR-Code scannen" drücken
3. **Panel ②** – Seriennummer, Challenge und Version werden **automatisch befüllt**, Response-Code erscheint sofort
4. **Panel ③** – Response-Code manuell eingeben und verifizieren

Der QR-Code aktualisiert sich automatisch bei jeder neuen Challenge. In einer Produktionsimplementierung würde der Techniker mit seiner Smartphone-Kamera scannen; in der Demo wird der Scan-Vorgang per Button simuliert.

---

## Projektstruktur

```
CRdemo/
├── App.tsx                              # Einstiegspunkt: GluestackUIProvider, TabBar-State, Routing
├── app.json                             # Expo-Konfiguration
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
├── assets/
│   ├── icon.png
│   ├── splash.png
│   ├── favicon.png
│   └── adaptive-icon.png
└── src/
    ├── components/
    │   ├── AppHeader.tsx                # Kopfzeile mit Titel + Untertitel (wechselt je Tab)
    │   ├── TabBar.tsx                   # Untere Tab-Navigation (welcome/auth/platform/gluestack)
    │   ├── ChallengePanel.tsx           # Schritt ①: Seriennummer, Challenge, QR-Code
    │   ├── ResponsePanel.tsx            # Schritt ②: Eingabe + HMAC-Berechnung
    │   ├── VerifyPanel.tsx              # Schritt ③: Interne Verifikation
    │   ├── ArrowConnector.tsx           # Pfeil-Verbinder zwischen Schritten
    │   ├── StepBadge.tsx                # Nummeriertes Schritt-Badge (①②③)
    │   ├── Divider.tsx                  # Trennlinie mit optionalem Label
    │   ├── PlatformCard.ios.tsx         # iOS-Variante der PlatformCard
    │   ├── PlatformCard.web.tsx         # Web-Variante der PlatformCard
    │   ├── NativeUIShowcase.ios.tsx     # iOS-spezifische UI-Controls
    │   └── NativeUIShowcase.web.tsx     # Web-spezifische UI-Controls
    ├── hooks/
    │   └── useChallenge.ts              # 60-s-Countdown + automatische Challenge-Rotation
    ├── screens/
    │   ├── WelcomeScreen.tsx            # Tab 1: React Native & Expo Einführung
    │   ├── AuthScreen.tsx               # Tab 2: 3-Schritt-Authentifizierungsprotokoll
    │   ├── PlatformScreen.tsx           # Tab 3: Plattformspezifische Dateien (Metro Bundler)
    │   └── GluestackScreen.tsx          # Tab 4: Gluestack-UI-Komponentenübersicht
    ├── theme/
    │   └── index.ts                     # COLORS, DEFAULT_SECRET, BREAKPOINT, CHALLENGE_TTL
    └── utils/
        └── hmac.ts                      # Kernlogik: HMAC, Truncation, Versions-Kodierung
```

### Kernlogik (`src/utils/hmac.ts`)

| Funktion | Beschreibung |
|---|---|
| `encodeChallenge(version)` | Generiert versionsabhängig lange Dezimalzahl, setzt Bits 3–0 auf Version |
| `decodeVersion(challenge)` | Liest Version aus Bits 3–0: `parseInt(challenge) & 0x0F` |
| `buildMessage(challenge, serial)` | Erstellt HMAC-Nachricht: `serial\|challenge` |
| `computeHmacHex(challenge, secret, serial)` | Berechnet HMAC-SHA256, gibt Hex-String zurück |
| `computeCode(hmacHex, version)` | Versionsabhängige Truncation → Code + Berechnungsschritte |
| `challengeBitLayout(challenge)` | Trennt Versions-Nibble (Bits 3–0) und Datenbits (31–4) für UI-Anzeige |
| `generateSerialNumber()` | Erzeugt zufällige Seriennummer: `JB12_xxxx` |

### Hook (`src/hooks/useChallenge.ts`)

`useChallenge(version)` verwaltet:
- Den aktuellen Challenge-String (neu generiert via `encodeChallenge`)
- Den laufenden Countdown (`timeLeft`, 0–60 s)
- Automatische Neugenerierung wenn `timeLeft === 0`
- `newChallenge(version?)` – manuelles Auslösen einer neuen Challenge

---

## Installation & Start

### Voraussetzungen

- [Node.js](https://nodejs.org/) ≥ 18
- [Expo Go](https://expo.dev/go) App auf dem Smartphone (für iOS/Android)

### Setup

```bash
git clone https://github.com/B3sler/CRdemo.git
cd CRdemo
npm install
```

### Starten

```bash
# QR-Code für Expo Go (iOS / Android) – lokales Netzwerk
npx expo start

# Tunnel-Modus (auch außerhalb des lokalen Netzwerks nutzbar)
npx expo start --tunnel

# Direkt im Browser
npx expo start --web

# Android-Emulator
npx expo start --android

# iOS-Simulator (nur macOS)
npx expo start --ios
```

---

## Verfügbare Scripts

| Script | Befehl | Beschreibung |
|--------|--------|--------------|
| Start | `npm start` | Metro Bundler starten |
| Tunnel | `npm run tunnel` | Start mit Expo Tunnel (ngrok, netzwerkunabhängig) |
| Web | `npm run web` | App im Browser öffnen |
| Android | `npm run android` | Android-Emulator starten |
| iOS | `npm run ios` | iOS-Simulator starten (nur macOS) |
| Lint | `npm run lint` | ESLint für `src/` und `App.tsx` |
| Lint Fix | `npm run lint:fix` | ESLint mit Auto-Fix |
| Format | `npm run format` | Prettier über alle `.ts`/`.tsx`-Dateien |

---

## Tech-Stack

| Paket | Version | Zweck |
|-------|---------|-------|
| [Expo](https://expo.dev) | ~54.0 | React Native Toolchain & Managed Workflow |
| [React Native](https://reactnative.dev) | 0.81.5 | Cross-Platform native UI |
| [React](https://react.dev) | 19.1.0 | UI-Library |
| [TypeScript](https://www.typescriptlang.org) | ^5.3 | Typsicherheit |
| [crypto-js](https://github.com/brix/crypto-js) | ^4.2 | HMAC-SHA256 Implementierung |
| [react-native-qrcode-svg](https://github.com/awesomejerry/react-native-qrcode-svg) | ^6.3 | QR-Code-Generierung |
| [react-native-svg](https://github.com/software-mansion/react-native-svg) | 15.12.1 | SVG-Rendering (Peer-Dep. von QR-Code) |
| [@gluestack-ui/themed](https://gluestack.io) | ^1.1 | Universal Design System (React Native + Web) |
| [react-native-web](https://necolas.github.io/react-native-web) | ^0.21 | React Native → Web-Renderer |
| [ESLint](https://eslint.org) | ^9 | Linting |
| [Prettier](https://prettier.io) | ^3 | Code-Formatierung |

---

## Sicherheitsbetrachtung

> Diese App ist eine **Demo** für Lehrzwecke. Für einen produktiven Einsatz sind zusätzliche Maßnahmen erforderlich.

### Was die Demo zeigt

- Korrekte HMAC-SHA256-Berechnung nach RFC 2104
- Truncation-Verfahren nach RFC 4226 (HOTP) in drei Varianten
- **Device-Binding** via Maschinenseriennummer – ein Code gilt nur für eine Maschine
- Einmaligkeit durch zufällige Challenge (kein Replay möglich)
- Zeitbegrenzung (60 s) als zusätzliche Schutzschicht gegen verspätete Wiedereingabe
- Sofortige Challenge-Rotation bei Fehleingabe
- Versionierung ohne separaten Übertragungskanal (in Challenge eingebettet)
- QR-Code-Workflow für fehlerfreie, schnelle Dateneingabe
- Schrittweise Visualisierung der HMAC-Berechnung in Panel ②

### Was in einer Produktionsimplementierung hinzukommen müsste

| Thema | Produktionsmaßnahme |
|-------|---------------------|
| **Schlüsselverwaltung** | Secret Key in Secure Enclave / Hardware Security Module (HSM) speichern, nie im Klartext |
| **Zähler / TOTP** | Kombination mit Zeitstempel (TOTP, RFC 6238) oder monotonem Zähler (HOTP) für stärkere Replay-Prävention |
| **Brute-Force-Schutz** | Sperrung nach N Fehlversuchen, Rate-Limiting, Alarmmeldung bei wiederholten Fehlversuchen |
| **Kanalabsicherung** | Challenge-Übertragung via authentifiziertem BLE / NFC statt unverschlüsseltem Display |
| **Code-Länge** | Mindestens 6 Stellen (V2/V3) für produktive Umgebungen – V1 (4-stellig) nur für Demo-Zwecke |
| **Audit-Log** | Protokollierung aller Authentifizierungsversuche mit Zeitstempel, Geräte-ID und Ergebnis |
| **Zertifikatsbasierte Bindung** | Zusätzliche Absicherung des Secret Keys durch Gerätezertifikat |

---

*Bachelorarbeit · HMAC-SHA256 nach RFC 2104 · HOTP nach RFC 4226 · Expo SDK 54 · React Native 0.81*
