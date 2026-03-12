# CRdemo – Challenge-Response Authentifizierung

> Demo-Applikation zur Bachelorarbeit:
> **„Konzeption und Implementierung einer Challenge-Response-Authentifizierung zur Absicherung von Wartungszugängen an Industriemaschinen mit mobilen Endgeräten"**

---

## Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Authentifizierungsprotokoll](#authentifizierungsprotokoll)
3. [Maschinenseriennummer & Device-Binding](#maschinenseriennummer--device-binding)
4. [Protokoll-Versionen (V1 / V2 / V3)](#protokoll-versionen)
5. [Versions-Kodierung in der Challenge](#versions-kodierung-in-der-challenge)
6. [QR-Code-Workflow](#qr-code-workflow)
7. [Projektstruktur](#projektstruktur)
8. [Installation & Start](#installation--start)
9. [Verfügbare Scripts](#verfügbare-scripts)
10. [Tech-Stack](#tech-stack)
11. [Sicherheitsbetrachtung](#sicherheitsbetrachtung)

---

## Überblick

Diese App demonstriert interaktiv, wie eine **HMAC-SHA256-basierte Challenge-Response-Authentifizierung** funktioniert. Das Szenario: Ein Wartungstechniker möchte Zugang zu einer Industriemaschine erhalten. Statt eines statischen Passworts läuft ein kryptografisches Einmalcode-Verfahren ab, bei dem nur jemand mit dem richtigen Secret Key einen gültigen Response-Code berechnen kann.

Die Demo ist in **drei Schritten** aufgebaut, die den realen Protokollablauf exakt abbilden:

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

## Authentifizierungsprotokoll

### Schritt 1 – Challenge erzeugen (Maschine)

Die Maschine zeigt:
- ihre fest zugewiesene **Seriennummer** (Format `JB12_xxxx`)
- eine kryptografisch zufällige **Challenge-Zahl** mit eingebetteter Protokoll-Version in den **Bits 3–0**

Die Challenge ist **60 Sekunden** gültig – danach wird automatisch eine neue generiert, um Replay-Angriffe zu verhindern. Bei einer Fehleingabe wird ebenfalls sofort eine neue Challenge erzeugt.

### Schritt 2 – Response berechnen (Mobiles Gerät)

Der Techniker liest Seriennummer und Challenge vom Display ab (oder scannt den QR-Code). Die App:

1. Liest die Version aus den **Bits 3–0** der Challenge-Zahl
2. Baut die HMAC-Nachricht: `serial | challenge`
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

| Version | Challenge  | Letztes Hex-Nibble | Bits 3–0 |
|---------|------------|--------------------|----------|
| V1      | 8337       | `...1`             | 0001     |
| V2      | 834290     | `...2`             | 0010     |
| V3      | 83742947   | `...3`             | 0011     |

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
2. **Scannen (simuliert)** – Button „📷 QR-Code scannen" drücken
3. **Panel ②** – Seriennummer, Challenge und Version werden **automatisch befüllt**, Response-Code erscheint sofort
4. **Panel ③** – Response-Code manuell eingeben und verifizieren

Der QR-Code aktualisiert sich automatisch bei jeder neuen Challenge. In einer Produktionsimplementierung würde der Techniker mit seiner Smartphone-Kamera scannen; in der Demo wird der Scan-Vorgang per Button simuliert.

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
    │   ├── ChallengePanel.tsx       # Schritt 1: Seriennummer, Challenge, QR-Code
    │   ├── ResponsePanel.tsx        # Schritt 2: HMAC-Berechnung Schritt für Schritt
    │   ├── VerifyPanel.tsx          # Schritt 3: Interne Verifikation
    │   ├── ArrowConnector.tsx       # Pfeil-Verbinder zwischen den Schritten
    │   ├── StepBadge.tsx            # Nummeriertes Schritt-Badge (①②③)
    │   └── Divider.tsx              # Trennlinie mit optionalem Label
    ├── hooks/
    │   └── useChallenge.ts          # 60s-Countdown + automatische Challenge-Rotation
    ├── theme/
    │   └── index.ts                 # Farben, Konstanten (COLORS, CHALLENGE_TTL, …)
    └── utils/
        └── hmac.ts                  # Kernlogik: HMAC, Truncation, Versions-Kodierung
```

### Kernlogik (`src/utils/hmac.ts`)

| Funktion | Beschreibung |
|---|---|
| `encodeChallenge(version)` | Generiert versionsgerechte Dezimalzahl, setzt Bits 3–0 auf Version |
| `decodeVersion(challenge)` | Liest Version aus Bits 3–0: `parseInt(challenge) & 0x0F` |
| `buildMessage(challenge, serial)` | Erstellt HMAC-Nachricht: `serial\|challenge` |
| `computeHmacHex(challenge, secret, serial)` | Berechnet HMAC-SHA256, gibt Hex-String zurück |
| `computeCode(hmacHex, version)` | Versionsabhängige Truncation → Code + Berechnungsschritte |
| `generateSerialNumber()` | Erzeugt zufällige Seriennummer: `JB12_xxxx` |
| `challengeBitLayout(challenge)` | Trennt Versions-Bits (3–0) und Daten-Bits (31–4) für UI-Anzeige |

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
| [React Native](https://reactnative.dev) | 0.76.x | Cross-Platform UI |
| [TypeScript](https://www.typescriptlang.org) | ^5.3 | Typsicherheit |
| [crypto-js](https://github.com/brix/crypto-js) | ^4.2 | HMAC-SHA256 Implementierung |
| [react-native-qrcode-svg](https://github.com/awesomejerry/react-native-qrcode-svg) | ^6.x | QR-Code-Generierung |
| [@gluestack-ui/themed](https://gluestack.io) | ^1.1 | UI-Komponentenbibliothek |
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

### Was in einer Produktionsimplementierung hinzukommen müsste

| Thema | Produktionsmaßnahme |
|-------|---------------------|
| **Schlüsselverwaltung** | Secret Key in Secure Enclave / Hardware Security Module (HSM) speichern, nie im Klartext im Dateisystem |
| **Zähler / TOTP** | Kombination mit Zeitstempel (TOTP, RFC 6238) oder monotonem Zähler (HOTP) für stärkere Replay-Prävention |
| **Brute-Force-Schutz** | Sperrung nach N Fehlversuchen, Rate-Limiting, Alarmmeldung bei wiederholten Fehlversuchen |
| **Kanalabsicherung** | Challenge-Übertragung via authentifiziertem BLE / NFC statt unverschlüsseltem Display |
| **Code-Länge** | Mindestens 6 Stellen (V2/V3) für produktive Umgebungen empfohlen – V1 (4-stellig) nur für Demo-Zwecke |
| **Audit-Log** | Protokollierung aller Authentifizierungsversuche mit Zeitstempel, Geräte-ID und Ergebnis |
| **Zertifikatsbasierte Bindung** | Zusätzliche Absicherung des Secret Keys durch Gerätezertifikat |

---

*Bachelorarbeit · HMAC-SHA256 nach RFC 2104 · HOTP nach RFC 4226*
