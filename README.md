# CRdemo – Challenge-Response Authentifizierung

> Demo-Applikation zur Bachelorarbeit:
> **„Konzeption und Implementierung einer Challenge-Response-Authentifizierung zur Absicherung von Wartungszugängen an Industriemaschinen mit mobilen Endgeräten"**

---

## Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Authentifizierungsprotokoll](#authentifizierungsprotokoll)
3. [Protokoll-Versionen (V1 / V2 / V3)](#protokoll-versionen)
4. [Versions-Kodierung in der Challenge](#versions-kodierung-in-der-challenge)
5. [Projektstruktur](#projektstruktur)
6. [Installation & Start](#installation--start)
7. [Verfügbare Scripts](#verfügbare-scripts)
8. [Tech-Stack](#tech-stack)
9. [Sicherheitsbetrachtung](#sicherheitsbetrachtung)

---

## Überblick

Diese App demonstriert interaktiv, wie eine **HMAC-SHA256-basierte Challenge-Response-Authentifizierung** funktioniert. Das Szenario: Ein Wartungstechniker möchte Zugang zu einer Industriemaschine erhalten. Statt eines statischen Passworts läuft ein kryptografisches Einmalcode-Verfahren ab, bei dem nur jemand mit dem richtigen Secret Key einen gültigen Response-Code berechnen kann.

Die Demo ist in **drei Schritten** aufgebaut, die den realen Protokollablauf exakt abbilden:

```
┌─────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  ① Maschine     │        │  ② Mobiles Gerät │        │  ③ Maschine      │
│  Challenge      │──────▶ │  Response        │──────▶ │  Verifikation    │
│  erzeugen       │        │  berechnen       │        │                  │
└─────────────────┘        └──────────────────┘        └──────────────────┘
   Zufallszahl +               Challenge ablesen,          Eingegebenen Code
   Version kodiert             HMAC berechnen,             mit intern berechn.
   in Bits 27–24               Code anzeigen               Code vergleichen
```

---

## Authentifizierungsprotokoll

### Schritt 1 – Challenge erzeugen (Maschine)

Die Maschine generiert eine kryptografisch zufällige Challenge. In den **Bits 27–24** der Challenge-Zahl ist die Protokoll-Version kodiert (siehe [Versions-Kodierung](#versions-kodierung-in-der-challenge)). Die Challenge ist für **60 Sekunden** gültig – danach wird automatisch eine neue generiert, um Replay-Angriffe zu verhindern.

### Schritt 2 – Response berechnen (Mobiles Gerät)

Der Techniker liest die Challenge vom Display ab und gibt sie in seine App ein. Die App:
1. Liest die Version aus den Bits 27–24 der Challenge
2. Berechnet `HMAC-SHA256(challenge, secret_key)`
3. Wendet die versionsabhängige **Truncation** an
4. Zeigt den fertigen Response-Code an

Der Secret Key ist vorab auf dem Gerät gespeichert und wird **nie übertragen**.

### Schritt 3 – Verifizieren (Maschine)

Der Techniker gibt den Code am Maschinenterminal ein. Die Maschine berechnet den erwarteten Code **intern** (gleiche HMAC-Operation + gleiche Truncation) und vergleicht. Bei Übereinstimmung → Zugang gewährt. Bei Fehleingabe → sofortige neue Challenge.

---

## Protokoll-Versionen

Die Demo unterstützt drei Versionen, die unterschiedliche Truncation-Methoden demonstrieren:

### V1 – Standard (6-stellig)

Einfache, feste Trunkierung. Analog zum Grundprinzip aus HOTP (RFC 4226), jedoch ohne Zähler.

```
HMAC-SHA256(challenge, secret)
  → letzte 4 Bytes (8 Hex-Zeichen)
  → & 0x7FFFFFFF  (MSB auf 0 → positiver Integer)
  → mod 1.000.000
  → 6-stelliger Code
```

**Sicherheit:** 1 von 1.000.000 (10⁶) möglichen Codes

---

### V2 – Dynamic Offset nach RFC 4226 (6-stellig)

Statt einer festen Position wird der Startpunkt dynamisch aus dem **letzten Byte** des HMAC bestimmt. Dies entspricht der offiziellen HOTP-Spezifikation (RFC 4226, Abschnitt 5.3).

```
HMAC-SHA256(challenge, secret)
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

Gleiche Truncation wie V1, aber mit **mod 10⁸** statt mod 10⁶. Ergibt einen 8-stelligen Code.

```
HMAC-SHA256(challenge, secret)
  → letzte 4 Bytes
  → & 0x7FFFFFFF
  → mod 100.000.000
  → 8-stelliger Code
```

**Sicherheit:** 1 von 100.000.000 (10⁸) möglichen Codes – 100× stärker als V1/V2

---

## Versions-Kodierung in der Challenge

Die Protokoll-Version ist **in der Challenge-Zahl selbst** versteckt – in den **Bits 3–0** (unteres Nibble). Die restlichen Bits sind eine vollständig zufällige 8-stellige Dezimalzahl, sodass die führenden Ziffern die Version nicht verraten.

```
Bit 31..4                  | Bit 3..0
28-bit Zufallsdaten        | Version
(führende Ziffern: random) | 0001 = V1
                           | 0010 = V2
                           | 0011 = V3
```

**Beispiel** (gleiche Zufallsbasis, verschiedene Versionen):

| Version | Dezimal    | Letztes Nibble (hex) |
|---------|------------|----------------------|
| V1      | 83.742.945 | `...1` (0001)        |
| V2      | 83.742.946 | `...2` (0010)        |
| V3      | 83.742.947 | `...3` (0011)        |

Die App liest die Version via:
```typescript
const version = parseInt(challenge, 10) & 0x0F;  // → 1, 2 oder 3
```

**Warum untere statt obere Bits?**
Bei oberen Bits bestimmt die Version den Wertebereich der Zahl (z. B. V1 immer 16–33 Mio., V2 immer 33–50 Mio.), was die Version aus der führenden Dezimalziffer erkennbar macht. Die unteren Bits beeinflussen den Dezimalwert nur minimal – die führenden Ziffern bleiben vollständig zufällig.

---

## Projektstruktur

```
CRdemo/
├── App.tsx                          # Einstiegspunkt, State-Management, Layout
├── app.json                         # Expo-Konfiguration
├── package.json
├── tsconfig.json
├── .eslintrc.js                     # ESLint-Konfiguration
├── .prettierrc                      # Prettier-Konfiguration
├── assets/
│   ├── icon.png
│   ├── splash.png
│   ├── favicon.png
│   └── adaptive-icon.png
└── src/
    ├── components/
    │   ├── ChallengePanel.tsx       # Schritt 1: Maschine – Challenge + Versionsauswahl
    │   ├── ResponsePanel.tsx        # Schritt 2: Mobiles Gerät – HMAC-Berechnung
    │   ├── VerifyPanel.tsx          # Schritt 3: Maschine – Verifikation
    │   ├── ArrowConnector.tsx       # Pfeil zwischen den Schritten
    │   ├── StepBadge.tsx            # Nummeriertes Schritt-Badge (①②③)
    │   └── Divider.tsx              # Trennlinie mit optionalem Label
    ├── hooks/
    │   └── useChallenge.ts          # 60s-Countdown + Challenge-Rotation
    ├── theme/
    │   └── index.ts                 # Farben, Konstanten (COLORS, BREAKPOINT, …)
    └── utils/
        └── hmac.ts                  # Kernlogik: HMAC, Truncation, Versions-Kodierung
```

### Kernlogik (`src/utils/hmac.ts`)

| Funktion | Beschreibung |
|---|---|
| `encodeChallenge(version)` | Generiert Challenge mit eingebetteter Version in Bits 27–24 |
| `decodeVersion(challenge)` | Liest Version aus Bits 27–24 |
| `computeHmacHex(challenge, secret)` | Berechnet HMAC-SHA256, gibt Hex-String zurück |
| `computeCode(hmacHex, version)` | Versionsabhängige Truncation → Code + Berechnungsschritte |
| `challengeBitLayout(challenge)` | Gibt Versions-Bits und Daten-Bits getrennt zurück (für UI) |

---

## Installation & Start

### Voraussetzungen

- [Node.js](https://nodejs.org/) ≥ 18
- [Expo Go](https://expo.dev/go) App auf dem Smartphone (für iOS/Android)

### Setup

```bash
git clone https://github.com/<dein-username>/CRdemo.git
cd CRdemo
npm install
```

### Starten

```bash
# QR-Code für Expo Go (iOS / Android)
npx expo start

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
| Start | `npm start` | Startet Metro Bundler |
| Web | `npm run web` | Öffnet App im Browser |
| Lint | `npm run lint` | ESLint prüfen |
| Lint Fix | `npm run lint:fix` | ESLint auto-fix |
| Format | `npm run format` | Prettier über alle Dateien |

---

## Tech-Stack

| Paket | Version | Zweck |
|-------|---------|-------|
| [Expo](https://expo.dev) | ~52.0 | React Native Toolchain |
| [React Native](https://reactnative.dev) | 0.76.5 | Cross-Platform UI |
| [TypeScript](https://www.typescriptlang.org) | ^5.3 | Typsicherheit |
| [crypto-js](https://github.com/brix/crypto-js) | ^4.2 | HMAC-SHA256 Implementierung |
| [@gluestack-ui/themed](https://gluestack.io) | ^1.1 | UI-Komponentenbibliothek |
| [ESLint](https://eslint.org) | ^9 | Linting |
| [Prettier](https://prettier.io) | ^3 | Code-Formatierung |

---

## Sicherheitsbetrachtung

> Diese App ist eine **Demo** für Lehrzwecke. Für einen produktiven Einsatz sind zusätzliche Maßnahmen erforderlich.

### Was die Demo zeigt

- Korrekte HMAC-SHA256-Berechnung nach RFC 2104
- Truncation-Verfahren nach RFC 4226 (HOTP)
- Einmaligkeit durch zufällige Challenge (kein Replay möglich)
- Zeitbegrenzung (60 s) als zusätzliche Schutzschicht
- Versionierung ohne separaten Übertragungskanal

### Was in einer Produktionsimplementierung hinzukommen müsste

| Thema | Produktionsmaßnahme |
|-------|---------------------|
| **Schlüsselverwaltung** | Secret Key in Secure Enclave / Hardware Security Module (HSM) speichern, nie im Klartext |
| **Zähler / TOTP** | Kombination mit Zeitstempel (TOTP, RFC 6238) oder monotonem Zähler (HOTP) für stärkere Replay-Prävention |
| **Brute-Force-Schutz** | Sperrung nach N Fehlversuchen, Rate-Limiting |
| **Kanalabsicherung** | Challenge-Übertragung via authentifiziertem BLE / NFC, nicht unverschlüsselt |
| **Code-Länge** | Mindestens 8 Stellen (V3) für produktive Umgebungen empfohlen |
| **Audit-Log** | Protokollierung aller Authentifizierungsversuche mit Zeitstempel und Geräte-ID |

---

*Bachelorarbeit · HMAC-SHA256 nach RFC 2104 / HOTP nach RFC 4226*
