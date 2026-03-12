import HmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';

// ─── Versionen ────────────────────────────────────────────────────────────────
// Bits 27–24 der Challenge-Zahl kodieren die Version (1, 2 oder 3).
// Die restlichen 24 Bits sind zufällige Challenge-Daten.
//
//  Bit 31..28  Bit 27..24   Bit 23..0
//  (immer 0)   Version(1-3)  Zufallsdaten (24 bit)
//
// Beispiel V1: (1 << 24) | 0xA3F2C8 = 0x01A3F2C8 = 27_508_936
// Beispiel V2: (2 << 24) | 0xA3F2C8 = 0x02A3F2C8 = 44_286_152
// Beispiel V3: (3 << 24) | 0xA3F2C8 = 0x03A3F2C8 = 61_063_368

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
    name: 'Standard',
    digits: 6,
    truncation: 'Letzte 4 Bytes & 0x7FFFFFFF → mod 10⁶',
    description: 'Feste Trunkierung: die letzten 4 Bytes des HMAC werden als Integer interpretiert.',
    color: '#1565c0',
  },
  2: {
    label: 'V2',
    name: 'Dyn. Offset (RFC 4226)',
    digits: 6,
    truncation: 'Letztes Byte & 0x0F = Offset → 4 Bytes ab Offset → mod 10⁶',
    description:
      'Dynamic Truncation nach RFC 4226: Das letzte Byte bestimmt den Startpunkt im HMAC-Array.',
    color: '#6a1b9a',
  },
  3: {
    label: 'V3',
    name: 'Erweitert (8-stellig)',
    digits: 8,
    truncation: 'Letzte 4 Bytes & 0x7FFFFFFF → mod 10⁸',
    description:
      '8-stelliger Code: höhere Entropie (1:100 Mio. statt 1:1 Mio.), sonst wie V1.',
    color: '#bf360c',
  },
};

// ─── Challenge-Kodierung ──────────────────────────────────────────────────────

/** Erzeugt eine Challenge mit eingebetteter Version in Bits 27–24. */
export function encodeChallenge(version: Version): string {
  const randomData = Math.floor(Math.random() * 0x01000000); // 24-bit Zufall
  return ((version << 24) | randomData).toString();
}

/** Liest die Version aus den Bits 27–24 der Challenge-Zahl. */
export function decodeVersion(challenge: string): Version {
  const n = parseInt(challenge, 10);
  if (isNaN(n)) return 1;
  const v = (n >> 24) & 0x0f;
  return v === 1 || v === 2 || v === 3 ? v : 1;
}

/** Binärdarstellung der Challenge: zeigt Version-Nibble und Datenbits getrennt. */
export function challengeBitLayout(challenge: string): { versionBits: string; dataBits: string } {
  const n = parseInt(challenge, 10);
  const versionNibble = (n >> 24) & 0x0f;
  const dataPart = n & 0x00ffffff;
  return {
    versionBits: versionNibble.toString(2).padStart(4, '0'),
    dataBits: dataPart.toString(2).padStart(24, '0'),
  };
}

// ─── HMAC ─────────────────────────────────────────────────────────────────────

export function computeHmacHex(challenge: string, secret: string): string {
  if (!challenge || !secret) return '';
  return HmacSHA256(challenge, secret).toString(Hex);
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

  switch (version) {
    case 1: {
      const fixedSlice = hmacHex.slice(-8);
      const rawInt = parseInt(fixedSlice, 16) & 0x7fffffff;
      const modulo = 1_000_000;
      const code = (rawInt % modulo).toString().padStart(6, '0');
      return { code, steps: { version, fixedSlice, rawInt, modulo, code } };
    }
    case 2: {
      const lastByte = hmacHex.slice(-2);
      const byteOffset = parseInt(lastByte, 16) & 0x0f; // 0–15 (Byte-Index)
      const hexOffset = byteOffset * 2; // Byte → Hex-Zeichen-Index
      const offsetSlice = hmacHex.slice(hexOffset, hexOffset + 8);
      const rawInt = parseInt(offsetSlice, 16) & 0x7fffffff;
      const modulo = 1_000_000;
      const code = (rawInt % modulo).toString().padStart(6, '0');
      return {
        code,
        steps: { version, lastByte, offset: byteOffset, offsetSlice, rawInt, modulo, code },
      };
    }
    case 3: {
      const fixedSlice = hmacHex.slice(-8);
      const rawInt = parseInt(fixedSlice, 16) & 0x7fffffff;
      const modulo = 100_000_000;
      const code = (rawInt % modulo).toString().padStart(8, '0');
      return { code, steps: { version, fixedSlice, rawInt, modulo, code } };
    }
  }
}

/** Abwärtskompatible Hilfsfunktion (wird in VerifyPanel verwendet). */
export function hmacTo6Digit(hmacHex: string): string {
  return computeCode(hmacHex, 1).code;
}
