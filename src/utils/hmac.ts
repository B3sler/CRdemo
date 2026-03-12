import HmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';

// ─── Versionen ────────────────────────────────────────────────────────────────
// Bits 3–0 (unteres Nibble) der Challenge-Zahl kodieren die Version (1, 2 oder 3).
// Die Länge der Challenge (und des Response-Codes) hängt von der Version ab:
//   V1 → 4-stellige Challenge + 4-stelliger Code
//   V2 → 6-stellige Challenge + 6-stelliger Code
//   V3 → 8-stellige Challenge + 8-stelliger Code
//
//  Bit 31..4               Bit 3..0
//  Zufallsdaten (N Stellen) Version (1-3)
//
// Beispiel V1: 8341 & ~0xF | 1 = 8337   (4-stellig, letzte Hex-Stelle: 1)
// Beispiel V2: 834291 & ~0xF | 2 = 834290 (6-stellig, letzte Hex-Stelle: 2)
// Beispiel V3: 83742950 & ~0xF | 3 = 83742947 (8-stellig, letzte Hex-Stelle: 3)

export type Version = 1 | 2 | 3;

export interface VersionInfo {
  label: string;
  name: string;
  digits: number;
  truncation: string;
  description: string;
  color: string;
}

export const VERSION_INFO: Record<Version, VersionInfo> = {
  1: {
    label: 'V1',
    name: 'Standard (4-stellig)',
    digits: 4,
    truncation: 'Letzte 4 Bytes & 0x7FFFFFFF → mod 10⁴',
    description: 'Einfache feste Trunkierung. Challenge und Response sind 4-stellig.',
    color: '#1565c0',
  },
  2: {
    label: 'V2',
    name: 'Dyn. Offset · RFC 4226 (6-stellig)',
    digits: 6,
    truncation: 'Letztes Byte & 0x0F = Offset → 4 Bytes ab Offset → mod 10⁶',
    description:
      'Dynamic Truncation nach RFC 4226: Das letzte Byte bestimmt den Startpunkt im HMAC-Array. 6-stellig.',
    color: '#6a1b9a',
  },
  3: {
    label: 'V3',
    name: 'Erweitert (8-stellig)',
    digits: 8,
    truncation: 'Letzte 4 Bytes & 0x7FFFFFFF → mod 10⁸',
    description:
      '8-stelliger Code: 100× höhere Entropie als V2 (1:100 Mio.). Challenge und Response sind 8-stellig.',
    color: '#bf360c',
  },
};

// ─── Challenge-Kodierung ──────────────────────────────────────────────────────

/** Erzeugt eine versionsabhängig lange Challenge mit Version in Bits 3–0. */
export function encodeChallenge(version: Version): string {
  const digits = VERSION_INFO[version].digits;
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  const base = Math.floor(Math.random() * (max - min + 1)) + min;
  return ((base & ~0xf) | version).toString();
}

/** Liest die Version aus den Bits 3–0 der Challenge-Zahl. */
export function decodeVersion(challenge: string): Version {
  const n = parseInt(challenge, 10);
  if (isNaN(n)) return 1;
  const v = n & 0x0f;
  return v === 1 || v === 2 || v === 3 ? v : 1;
}

/** Binärdarstellung der Challenge: zeigt Version-Nibble (Bits 3–0) und Datenbits getrennt. */
export function challengeBitLayout(challenge: string): { versionBits: string; dataBits: string } {
  const n = parseInt(challenge, 10);
  const versionNibble = n & 0x0f;
  const dataPart = n >> 4;
  return {
    versionBits: versionNibble.toString(2).padStart(4, '0'),
    dataBits: dataPart.toString(2).padStart(24, '0'),
  };
}

// ─── Seriennummer ─────────────────────────────────────────────────────────────

/** Erzeugt eine zufällige Maschinenseriennummer im Format JB12_xxxx. */
export function generateSerialNumber(): string {
  const digits = Math.floor(Math.random() * 9000) + 1000;
  return `JB12_${digits}`;
}

/**
 * Baut die HMAC-Nachricht zusammen:
 *   serial|challenge
 * Die Seriennummer bindet den Code an eine konkrete Maschine.
 * Ohne korrekte Seriennummer ergibt dieselbe Challenge einen anderen Code.
 */
export function buildMessage(challenge: string, serial: string): string {
  return serial ? `${serial}|${challenge}` : challenge;
}

// ─── HMAC ─────────────────────────────────────────────────────────────────────

export function computeHmacHex(challenge: string, secret: string, serial = ''): string {
  if (!challenge || !secret) return '';
  return HmacSHA256(buildMessage(challenge, serial), secret).toString(Hex);
}

// ─── Code-Berechnung (versionsabhängig) ───────────────────────────────────────

export interface TruncationSteps {
  version: Version;
  // V1 & V3: feste Position
  fixedSlice?: string;
  // V2: dynamischer Offset
  lastByte?: string;
  offset?: number;
  offsetSlice?: string;
  // gemeinsam
  rawInt: number;
  modulo: number;
  code: string;
}

export interface CodeResult {
  code: string;
  steps: TruncationSteps;
}

export function computeCode(hmacHex: string, version: Version): CodeResult {
  if (!hmacHex) {
    return { code: '', steps: { version, rawInt: 0, modulo: 0, code: '' } };
  }

  const digits = VERSION_INFO[version].digits;
  const modulo = Math.pow(10, digits);

  switch (version) {
    case 1: {
      const fixedSlice = hmacHex.slice(-8);
      const rawInt = parseInt(fixedSlice, 16) & 0x7fffffff;
      const code = (rawInt % modulo).toString().padStart(digits, '0');
      return { code, steps: { version, fixedSlice, rawInt, modulo, code } };
    }
    case 2: {
      const lastByte = hmacHex.slice(-2);
      const byteOffset = parseInt(lastByte, 16) & 0x0f;
      const hexOffset = byteOffset * 2;
      const offsetSlice = hmacHex.slice(hexOffset, hexOffset + 8);
      const rawInt = parseInt(offsetSlice, 16) & 0x7fffffff;
      const code = (rawInt % modulo).toString().padStart(digits, '0');
      return {
        code,
        steps: { version, lastByte, offset: byteOffset, offsetSlice, rawInt, modulo, code },
      };
    }
    case 3: {
      const fixedSlice = hmacHex.slice(-8);
      const rawInt = parseInt(fixedSlice, 16) & 0x7fffffff;
      const code = (rawInt % modulo).toString().padStart(digits, '0');
      return { code, steps: { version, fixedSlice, rawInt, modulo, code } };
    }
  }
}

/** Abwärtskompatible Hilfsfunktion (wird in VerifyPanel verwendet). */
export function hmacTo6Digit(hmacHex: string): string {
  return computeCode(hmacHex, 1).code;
}
