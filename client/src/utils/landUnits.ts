/**
 * Land Measurement Units & Conversion Utilities for Indian Agriculture
 * Specifically optimized for Karnataka, Tamil Nadu, Andhra Pradesh, and National standards.
 */

export type LandUnit =
  | 'Acres'
  | 'Guntas'
  | 'Cents'
  | 'Hectares'
  | 'Square Metres'
  | 'Square Feet'
  | 'Kuntas';

export interface LandUnitOption {
  id: LandUnit;
  labelEn: string;
  labelKn: string;
  labelTa: string;
  labelTe: string;
  symbol: string;
  toAcreFactor: number; // Multiply by this to get Acres
  descriptionEn: string;
  descriptionKn: string;
}

export const LAND_UNIT_OPTIONS: LandUnitOption[] = [
  {
    id: 'Acres',
    labelEn: 'Acres',
    labelKn: 'ಏಕರೆ (Acres)',
    labelTa: 'ஏக்கர் (Acres)',
    labelTe: 'ఎకరాలు (Acres)',
    symbol: 'ac',
    toAcreFactor: 1.0,
    descriptionEn: 'Standard agricultural acre (43,560 sq ft / 4,046.86 sq m)',
    descriptionKn: 'ಪ್ರಮಾಣಿತ ಕೃಷಿ ವಿಸ್ತೀರ್ಣ (40 ಗುಂಟೆ = 1 ಏಕರೆ)',
  },
  {
    id: 'Guntas',
    labelEn: 'Guntas',
    labelKn: 'ಗುಂಟೆ (Guntas)',
    labelTa: 'குண்டா (Guntas)',
    labelTe: 'గుంటలు (Guntas)',
    symbol: 'guntas',
    toAcreFactor: 0.025, // 1 Acre = 40 Guntas
    descriptionEn: 'Standard Karnataka & Deccan unit (40 Guntas = 1 Acre, 1,089 sq ft)',
    descriptionKn: 'ಕರ್ನಾಟಕದ ಜನಪ್ರಿಯ ಅಳತೆ (40 ಗುಂಟೆ = 1 ಏಕರೆ, 1,089 ಚ.ಅಡಿ)',
  },
  {
    id: 'Kuntas',
    labelEn: 'Kuntas',
    labelKn: 'ಕುಂಟೆ / ಗುಂಟೆ (Kuntas)',
    labelTa: 'குண்டா (Kuntas)',
    labelTe: 'కుంటలు (Kuntas)',
    symbol: 'kuntas',
    toAcreFactor: 0.025, // Regional variation of Gunta
    descriptionEn: 'Regional spelling of Gunta (1 Acre = 40 Kuntas)',
    descriptionKn: 'ಗುಂಟೆಯ ಪ್ರಾದೇಶಿಕ ಉಲ್ಲೇಖ (40 ಕುಂಟೆ = 1 ಏಕರೆ)',
  },
  {
    id: 'Cents',
    labelEn: 'Cents',
    labelKn: 'ಸೆಂಟ್ (Cents)',
    labelTa: 'சென்ட் (Cents)',
    labelTe: 'సెంట్లు (Cents)',
    symbol: 'cents',
    toAcreFactor: 0.01, // 1 Acre = 100 Cents
    descriptionEn: 'Common South Indian unit (100 Cents = 1 Acre, 435.6 sq ft)',
    descriptionKn: 'ದಕ್ಷಿಣ ಭಾರತದ ಅಳತೆ (100 ಸೆಂಟ್ = 1 ಏಕರೆ)',
  },
  {
    id: 'Hectares',
    labelEn: 'Hectares',
    labelKn: 'ಹೆಕ್ಟೇರ್ (Hectares)',
    labelTa: 'ஹெக்டேர் (Hectares)',
    labelTe: 'హెక్టార్లు (Hectares)',
    symbol: 'ha',
    toAcreFactor: 2.47105, // 1 Hectare = 2.47105 Acres
    descriptionEn: 'Metric unit (1 Hectare = 10,000 sq m ≈ 2.47 Acres)',
    descriptionKn: 'ಮೆಟ್ರಿಕ್ ಅಳತೆ (1 ಹೆಕ್ಟೇರ್ = 10,000 ಚ.ಮೀ ≈ 2.47 ಏಕರೆ)',
  },
  {
    id: 'Square Metres',
    labelEn: 'Square Metres',
    labelKn: 'ಚದರ ಮೀಟರ್ (Sq Metres)',
    labelTa: 'சதுர மீட்டர் (Sq Metres)',
    labelTe: 'చదరపు మీటర్లు (Sq Metres)',
    symbol: 'sq m',
    toAcreFactor: 0.000247105,
    descriptionEn: 'Metric area measurement (1 Acre ≈ 4,046.86 sq m)',
    descriptionKn: 'ಚದರ ಮೀಟರ್ ಅಳತೆ (1 ಏಕರೆ ≈ 4,047 ಚ.ಮೀ)',
  },
  {
    id: 'Square Feet',
    labelEn: 'Square Feet',
    labelKn: 'ಚದರ ಅಡಿ (Sq Feet)',
    labelTa: 'சதுர அடி (Sq Feet)',
    labelTe: 'చదరపు అడుగులు (Sq Feet)',
    symbol: 'sq ft',
    toAcreFactor: 1 / 43560,
    descriptionEn: 'Standard imperial square feet (43,560 sq ft = 1 Acre)',
    descriptionKn: 'ಚದರ ಅಡಿ ಅಳತೆ (43,560 ಚ.ಅಡಿ = 1 ಏಕರೆ)',
  },
];

/**
 * Normalizes any value and unit to Acres.
 */
export function convertToAcres(value: number, unit: string = 'Acres'): number {
  if (!value || isNaN(value) || value <= 0) return 0;
  const match = LAND_UNIT_OPTIONS.find(
    (u) => u.id.toLowerCase() === unit.toLowerCase() || u.labelEn.toLowerCase() === unit.toLowerCase()
  );
  const factor = match ? match.toAcreFactor : 1.0;
  return Number((value * factor).toFixed(4));
}

/**
 * Converts from Acres to any target unit.
 */
export function convertFromAcres(acres: number, targetUnit: LandUnit): number {
  if (!acres || isNaN(acres) || acres <= 0) return 0;
  const match = LAND_UNIT_OPTIONS.find((u) => u.id === targetUnit);
  if (!match || match.toAcreFactor <= 0) return acres;
  return Number((acres / match.toAcreFactor).toFixed(2));
}

/**
 * Returns localized label for given unit and language code.
 */
export function getLocalizedUnitLabel(unit: string, language: string = 'en'): string {
  const match = LAND_UNIT_OPTIONS.find(
    (u) => u.id.toLowerCase() === unit.toLowerCase() || u.labelEn.toLowerCase() === unit.toLowerCase()
  );
  if (!match) return unit;
  if (language === 'kn') return match.labelKn;
  if (language === 'ta') return match.labelTa;
  if (language === 'te') return match.labelTe;
  return match.labelEn;
}

/**
 * Formats a live helper string showing equivalence in standard units.
 * E.g., "40 Guntas ≈ 1.00 Acre (43,560 sq ft)"
 */
export function getLandConversionSummary(
  value: number | string,
  unit: string,
  language: string = 'en'
): string | null {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!num || isNaN(num) || num <= 0) return null;

  const normalizedAcres = convertToAcres(num, unit);
  const sqFt = Math.round(normalizedAcres * 43560).toLocaleString();

  if (unit.toLowerCase() === 'acres') {
    const guntas = Number((normalizedAcres * 40).toFixed(1));
    if (language === 'kn') {
      return `≈ ${guntas} ಗುಂಟೆ (${sqFt} ಚ.ಅಡಿ)`;
    }
    return `≈ ${guntas} Guntas (${sqFt} sq ft)`;
  }

  if (language === 'kn') {
    return `≈ ${normalizedAcres} ಏಕರೆ (${sqFt} ಚ.ಅಡಿ)`;
  }
  return `≈ ${normalizedAcres} Acres (${sqFt} sq ft)`;
}
