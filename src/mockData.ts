import { BRF, Municipality, Stats, BRFDetail, Signal } from './types';

export const MOCK_BRFS: BRF[] = [
  {
    orgnr: '1',
    name: 'BRF Rönnen',
    municipality_name: 'Malmö',
    street: 'Rönngatan 4',
    building_year: 1962,
    num_apartments: 48,
    intent_score: 92,
    intent_score_confidence: 0.95,
    mentions_stammar: true,
    stammar_year_mentioned: 2023,
    energiklass: 'F',
    lan_change_pct: 12,
    avgift_change_pct: 18
  },
  {
    orgnr: '2',
    name: 'BRF Pilen',
    municipality_name: 'Malmö',
    street: 'Pilgatan 12',
    building_year: 1955,
    num_apartments: 32,
    intent_score: 88,
    intent_score_confidence: 0.88,
    mentions_fasad: true,
    energiklass: 'E',
    lan_change_pct: 8,
    avgift_change_pct: 10
  },
  {
    orgnr: '3',
    name: 'BRF Triangeln',
    municipality_name: 'Malmö',
    street: 'Södra Förstadsgatan 22',
    building_year: 1978,
    num_apartments: 120,
    intent_score: 84,
    intent_score_confidence: 0.92,
    mentions_tak: true,
    energiklass: 'D',
    lan_change_pct: 5,
    avgift_change_pct: 8
  }
];

export const MOCK_MUNICIPALITIES: Municipality[] = [
  { kommunkod: '1280', name: 'Malmö', county: 'Skåne' },
  { kommunkod: '1281', name: 'Lund', county: 'Skåne' },
  { kommunkod: '1283', name: 'Helsingborg', county: 'Skåne' }
];

export const MOCK_STATS: Stats = {
  brfs_total: 1250,
  brfs_scored: 840,
  avg_score: 68,
  high_signal_count: 124,
  ingested_today: 12
};

export const getMockBrfDetail = (orgnr: string): BRFDetail | null => {
  const brf = MOCK_BRFS.find(b => b.orgnr === orgnr);
  if (!brf) return null;
  return {
    brf,
    arsredovisningar: [
      {
        fiscal_year: 2023,
        nettoomsattning: 1200000,
        resultat_efter_finansiella_poster: 50000,
        langfristiga_skulder: 5000000,
        avgift_change_pct: 5,
        total_lan: 4800000,
        lan_change_pct: 2,
        arsresultat: 45000,
        underhallsfond: 250000,
        mentions_stammar: brf.mentions_stammar || false,
        maintenance_plan_raw: "Planerat underhåll av stammar och fasad."
      }
    ],
    energideklaration: {
      energiklass: brf.energiklass || 'C',
      eu_deadline_pressure: true,
      utford: "2023-05-12",
      giltig_till: "2033-05-12",
      primarenergital: "85 kWh/m2"
    }
  };
};

export const MOCK_SIGNALS: Signal[] = [
  {
    id: '1',
    brf_name: 'BRF Rönnen',
    type: 'Stambyte',
    date: '2024-03-15',
    description: 'Nämner stambyte i årsredovisningen för 2023.',
    weight: 'Primary',
    confidence: 0.92,
    orgnr: '1'
  },
  {
    id: '2',
    brf_name: 'BRF Pilen',
    type: 'Fasad',
    date: '2024-03-10',
    description: 'Fasadrenovering diskuterad under styrelsemöte.',
    weight: 'Secondary',
    confidence: 0.85,
    orgnr: '2'
  }
];
