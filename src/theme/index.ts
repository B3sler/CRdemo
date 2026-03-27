// MULTIVAC Design System
// Primärblau: #1E2B50 (Cloud Burst – echte MULTIVAC Markenfarbe laut Brandfetch)
// Sekundär:   #0F1E46 (Blue Zodiac – tiefes Navy)
// Akzent:     #2B5BE8 (helles Interaktionsblau für Buttons & Links)

export const COLORS = {
  // Backgrounds
  bg:         '#EEF2F7',
  bgCard:     '#FFFFFF',
  bgCardAlt:  '#F3F6FA',
  bgDark:     '#1E2B50',      // Multivac Primary – für HMI-Header
  bgDarkAlt:  '#0F1E46',      // Multivac Secondary – für tiefere Ebenen

  // Borders
  border:     '#D0D9E8',
  borderDark: '#2C3F70',

  // Multivac Brand
  primary:    '#1E2B50',      // Corporate Blue (Cloud Burst)
  primaryDark:'#0F1E46',      // Blue Zodiac
  accent:     '#2B5BE8',      // Interactive Blue (Buttons, Links)

  // Semantic
  success:    '#0A6640',
  successBg:  '#E6F4EE',
  successBorder: '#6ABF99',

  warning:    '#B54708',
  warningBg:  '#FEF6EE',
  warningBorder: '#F4B660',

  danger:     '#B42318',
  dangerBg:   '#FEF3F2',
  dangerBorder:'#FDA29B',

  // Text
  text:       '#0C1930',
  textMuted:  '#3A4E6A',
  textHint:   '#6B7E99',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: '#7A96C0',

  // Misc
  hmacFont:   '#1E2B50',
  codeColor:  '#0A6640',
} as const;

export const CHALLENGE_TTL = 60;
export const DEFAULT_SECRET = 'MY_DEMO_SECRET_KEY';
export const BREAKPOINT = 900;
