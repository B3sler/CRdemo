export interface SparePart {
  partNo: string;
  name: string;
  qty: number;
  leadDays: number;
}

export interface MaintenanceEntry {
  date: string;
  type: string;
  tech: string;
  note: string;
}

export interface Machine {
  serialNo: string;
  model: string;
  category: string;
  manufacturer: string;
  yearBuilt: number;
  location: string;
  status: 'ok' | 'warning' | 'error';
  statusText: string;
  datasheet: {
    power: string;
    weight: string;
    dimensions: string;
    voltage: string;
    ipClass: string;
    output: string;
    pdfLabel: string;
  };
  spareParts: SparePart[];
  maintenance: {
    lastDate: string;
    nextDate: string;
    intervalDays: number;
    history: MaintenanceEntry[];
  };
}

export const MACHINES: Record<string, Machine> = {
  'MV-R245-2022-0156': {
    serialNo: 'MV-R245-2022-0156',
    model: 'MULTIVAC R 245',
    category: 'Tiefziehverpackungsmaschine',
    manufacturer: 'MULTIVAC Sepp Haggenmüller SE & Co. KG',
    yearBuilt: 2022,
    location: 'Linie 2 · Halle B',
    status: 'ok',
    statusText: 'Betriebsbereit',
    datasheet: {
      power: '13,5 kW',
      weight: '1.500 kg',
      dimensions: '4.200 × 835 × 1.450 mm',
      voltage: '400 V / 50 Hz · 3-phasig',
      ipClass: 'IP 54',
      output: 'bis 15 Takte/min',
      pdfLabel: 'R245_Betriebsanleitung_v4.2.pdf',
    },
    spareParts: [
      { partNo: '9006374', name: 'Heizpatrone Siegelstation 400 W', qty: 4, leadDays: 5 },
      { partNo: '8730512', name: 'Siegelrahmen-Dichtung komplett', qty: 1, leadDays: 10 },
      { partNo: '9112048', name: 'Antriebsriemen Kettenvorschub', qty: 2, leadDays: 3 },
      { partNo: '8801233', name: 'Vakuumpumpenfilter (Feinfilter)', qty: 3, leadDays: 2 },
      { partNo: '9305677', name: 'Lager Abrolleinheit Unterfolie', qty: 2, leadDays: 7 },
      { partNo: '8640091', name: 'O-Ring-Set Schneidwerkzeug', qty: 1, leadDays: 4 },
    ],
    maintenance: {
      lastDate: '2025-10-22',
      nextDate: '2026-04-22',
      intervalDays: 182,
      history: [
        { date: '2025-10-22', type: 'CustomCare Inspektion', tech: 'MULTIVAC Service', note: 'Heizelemente geprüft, Siegeldruck kalibriert, alle Parameter i.O.' },
        { date: '2025-04-08', type: 'Reparatur', tech: 'T. Kern', note: 'Antriebsriemen Kettenvorschub getauscht (Verschleiß)' },
        { date: '2024-10-15', type: 'CustomCare Inspektion', tech: 'MULTIVAC Service', note: 'Vakuumpumpe gewartet, Dichtungen geprüft, keine Mängel' },
        { date: '2024-04-03', type: 'Reinigung & Schmierung', tech: 'M. Bauer', note: 'Führungsschienen gereinigt und gefettet' },
      ],
    },
  },

  'MV-T800-2023-1847': {
    serialNo: 'MV-T800-2023-1847',
    model: 'MULTIVAC T 800',
    category: 'Traysealer (vollautomatisch)',
    manufacturer: 'MULTIVAC Sepp Haggenmüller SE & Co. KG',
    yearBuilt: 2023,
    location: 'Linie 3 · Halle B',
    status: 'warning',
    statusText: 'Wartung fällig',
    datasheet: {
      power: '6 kW',
      weight: '1.700 kg',
      dimensions: '4.410 × 1.010 × 2.070 mm',
      voltage: '400 V / 50 Hz · 3-phasig',
      ipClass: 'IP 55',
      output: 'bis 15 Takte/min',
      pdfLabel: 'T800_Betriebsanleitung_v2.1.pdf',
    },
    spareParts: [
      { partNo: '9418820', name: 'Siegelgummi oben 400 × 300 mm', qty: 2, leadDays: 6 },
      { partNo: '9418821', name: 'Siegelgummi unten 400 × 300 mm', qty: 2, leadDays: 6 },
      { partNo: '8955340', name: 'Heizplatte Siegelwerkzeug', qty: 1, leadDays: 14 },
      { partNo: '9207115', name: 'Pneumatikzylinder Werkzeughubbewegung', qty: 1, leadDays: 21 },
      { partNo: '8811004', name: 'O-Ring-Set Verteilerblock (20-tlg.)', qty: 1, leadDays: 3 },
    ],
    maintenance: {
      lastDate: '2025-08-14',
      nextDate: '2026-02-14',
      intervalDays: 184,
      history: [
        { date: '2025-08-14', type: 'CustomCare Inspektion', tech: 'MULTIVAC Service', note: 'Siegelgummi verschlissen – Tausch empfohlen, Termin ausstehend' },
        { date: '2025-02-20', type: 'CustomCare Inspektion', tech: 'MULTIVAC Service', note: 'Pneumatiksystem geprüft, Drücke justiert, i.O.' },
      ],
    },
  },

  'MV-L310-2023-0892': {
    serialNo: 'MV-L310-2023-0892',
    model: 'MULTIVAC L 310',
    category: 'Etikettiermaschine',
    manufacturer: 'MULTIVAC Sepp Haggenmüller SE & Co. KG',
    yearBuilt: 2023,
    location: 'Linie 2 · Auslauf',
    status: 'ok',
    statusText: 'Betriebsbereit',
    datasheet: {
      power: '0,75 kW',
      weight: '220 kg',
      dimensions: '2.200 × 680 × 1.450 mm',
      voltage: '230 V / 50 Hz',
      ipClass: 'IP 43',
      output: 'bis 40 Etiketten/min',
      pdfLabel: 'L310_Betriebsanleitung_v1.5.pdf',
    },
    spareParts: [
      { partNo: '9560044', name: 'Spendekante 105 mm Standardausführung', qty: 2, leadDays: 5 },
      { partNo: '9560081', name: 'Andruckrolle Etikettenapplikation', qty: 4, leadDays: 3 },
      { partNo: '8720339', name: 'Schrittmotor Etikettenvorschub', qty: 1, leadDays: 12 },
      { partNo: '9102677', name: 'Etikettensensor (Reflexionslichtschranke)', qty: 1, leadDays: 7 },
    ],
    maintenance: {
      lastDate: '2026-01-15',
      nextDate: '2026-07-15',
      intervalDays: 180,
      history: [
        { date: '2026-01-15', type: 'CustomCare Inspektion', tech: 'MULTIVAC Service', note: 'Andruckrollen gereinigt, Etikettenführung justiert, i.O.' },
        { date: '2025-07-22', type: 'Reinigung & Schmierung', tech: 'K. Huber', note: 'Spendekante gereinigt, Sensor kalibriert' },
      ],
    },
  },
};
