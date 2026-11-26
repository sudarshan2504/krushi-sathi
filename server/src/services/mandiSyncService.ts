import prisma from '../utils/prisma';
import { config } from '../config';
import {
  BASELINE_KARNATAKA_MANDI_DATA,
  COMMODITY_CATEGORY_MAP,
  COMMODITY_KANNADA_MAP,
  DISTRICT_KANNADA_MAP,
  RawMandiRecord,
} from '../data/karnatakaMandiSeed';

export interface SyncResult {
  source: string;
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsFailed: number;
  status: 'success' | 'partial' | 'failed';
  message: string;
}

/**
 * Standardize commodity names (strips redundant spaces, casing normalization)
 */
export function normalizeCommodityName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Standardize date strings to YYYY-MM-DD
 * Handles "DD/MM/YYYY", "YYYY-MM-DD", ISO dates
 */
export function standardizeDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];

  const trimmed = dateStr.trim();
  // Format DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Format DD-MM-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('-');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.substring(0, 10);
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Auto-detect commodity category from name
 */
export function inferCommodityCategory(
  commodity: string
): 'Vegetable' | 'Fruit' | 'Grain' | 'Pulse' | 'Cereal' | 'Oilseed' | 'Spice' | 'Commercial' | 'Plantation' | 'Other' {
  if (COMMODITY_CATEGORY_MAP[commodity]) {
    return COMMODITY_CATEGORY_MAP[commodity];
  }

  const lower = commodity.toLowerCase();

  // Pulse keywords
  if (
    lower.includes('gram') ||
    lower.includes('dal') ||
    lower.includes('arhar') ||
    lower.includes('tur') ||
    lower.includes('moong') ||
    lower.includes('urad') ||
    lower.includes('chana') ||
    lower.includes('pulse')
  ) {
    return 'Pulse';
  }

  // Cereal / Grain keywords
  if (
    lower.includes('paddy') ||
    lower.includes('rice') ||
    lower.includes('wheat') ||
    lower.includes('maize') ||
    lower.includes('corn') ||
    lower.includes('cereal')
  ) {
    return 'Cereal';
  }
  if (
    lower.includes('ragi') ||
    lower.includes('millet') ||
    lower.includes('jowar') ||
    lower.includes('sorghum') ||
    lower.includes('bajra')
  ) {
    return 'Grain';
  }

  // Oilseed keywords
  if (
    lower.includes('groundnut') ||
    lower.includes('soyabean') ||
    lower.includes('sunflower') ||
    lower.includes('mustard') ||
    lower.includes('sesam') ||
    lower.includes('castor') ||
    lower.includes('safflower') ||
    lower.includes('oil')
  ) {
    return 'Oilseed';
  }

  // Spice keywords
  if (
    lower.includes('chilli') ||
    lower.includes('turmeric') ||
    lower.includes('pepper') ||
    lower.includes('cardamom') ||
    lower.includes('coriander') ||
    lower.includes('cumin') ||
    lower.includes('jeera') ||
    lower.includes('ginger') ||
    lower.includes('garlic') ||
    lower.includes('clove') ||
    lower.includes('tamarind')
  ) {
    return 'Spice';
  }

  // Fruit keywords
  if (
    lower.includes('banana') ||
    lower.includes('mango') ||
    lower.includes('apple') ||
    lower.includes('grape') ||
    lower.includes('orange') ||
    lower.includes('pomegranate') ||
    lower.includes('papaya') ||
    lower.includes('guava') ||
    lower.includes('lemon') ||
    lower.includes('lime') ||
    lower.includes('watermelon') ||
    lower.includes('sapota') ||
    lower.includes('fruit')
  ) {
    return 'Fruit';
  }

  // Commercial / Plantation
  if (
    lower.includes('arecanut') ||
    lower.includes('supari') ||
    lower.includes('coconut') ||
    lower.includes('copra') ||
    lower.includes('coffee') ||
    lower.includes('tea') ||
    lower.includes('rubber') ||
    lower.includes('cashew')
  ) {
    return 'Plantation';
  }
  if (
    lower.includes('sugarcane') ||
    lower.includes('cotton') ||
    lower.includes('jute') ||
    lower.includes('tobacco') ||
    lower.includes('silk')
  ) {
    return 'Commercial';
  }

  // Default to Vegetable for fresh produce, or Other
  if (
    lower.includes('tomato') ||
    lower.includes('onion') ||
    lower.includes('potato') ||
    lower.includes('cabbage') ||
    lower.includes('cauliflower') ||
    lower.includes('brinjal') ||
    lower.includes('carrot') ||
    lower.includes('beet') ||
    lower.includes('gourd') ||
    lower.includes('beans') ||
    lower.includes('bhindi') ||
    lower.includes('leaf')
  ) {
    return 'Vegetable';
  }

  return 'Other';
}

/**
 * Validate and sanitize individual price records
 */
export function validateAndSanitizeRecord(record: any): RawMandiRecord | null {
  try {
    const commodity = String(record.commodity || '').trim();
    const market = String(record.market || '').trim();
    const district = String(record.district || '').trim();
    const state = String(record.state || 'Karnataka').trim();

    if (!commodity || !market || !district) return null;

    let minPrice = parseFloat(record.min_price || record.minPrice || 0);
    let maxPrice = parseFloat(record.max_price || record.maxPrice || 0);
    let modalPrice = parseFloat(record.modal_price || record.modalPrice || 0);

    // If modalPrice is missing, try average or min/max
    if (!modalPrice || isNaN(modalPrice)) {
      if (minPrice && maxPrice) modalPrice = Math.round((minPrice + maxPrice) / 2);
      else if (minPrice) modalPrice = minPrice;
      else if (maxPrice) modalPrice = maxPrice;
      else return null; // No price data
    }

    if (!minPrice || isNaN(minPrice)) minPrice = modalPrice;
    if (!maxPrice || isNaN(maxPrice)) maxPrice = modalPrice;

    // Validate price order; clip anomalies
    if (minPrice > maxPrice) {
      const temp = minPrice;
      minPrice = maxPrice;
      maxPrice = temp;
    }

    if (modalPrice < minPrice) modalPrice = minPrice;
    if (modalPrice > maxPrice) modalPrice = maxPrice;

    const variety = String(record.variety || 'Local').trim() || 'Local';
    const rawDate = record.arrival_date || record.arrivalDate || '';
    const arrivalDate = standardizeDate(rawDate);
    const category = inferCommodityCategory(commodity);
    const arrivalQuantity = parseFloat(record.arrival_quantity || record.arrivalQuantity || 0) || undefined;

    return {
      state,
      district,
      market,
      commodity,
      variety,
      arrivalDate,
      minPrice,
      maxPrice,
      modalPrice,
      category,
      arrivalQuantity,
      nameKannada: COMMODITY_KANNADA_MAP[commodity] || undefined,
      districtKannada: DISTRICT_KANNADA_MAP[district] || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Upsert a batch of validated mandi records into Prisma SQLite
 */
export async function persistMandiRecords(
  records: RawMandiRecord[],
  sourceName = 'data.gov.in (AGMARKNET)'
): Promise<{ inserted: number; updated: number; failed: number }> {
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (const r of records) {
    try {
      // 1. Upsert Commodity
      const normalizedName = normalizeCommodityName(r.commodity);
      const commodity = await prisma.commodity.upsert({
        where: { commodityName: r.commodity },
        create: {
          commodityName: r.commodity,
          normalizedName,
          category: r.category,
          nameKannada: r.nameKannada || COMMODITY_KANNADA_MAP[r.commodity] || null,
        },
        update: {
          category: r.category,
          nameKannada: r.nameKannada || COMMODITY_KANNADA_MAP[r.commodity] || undefined,
        },
      });

      // 2. Upsert Market
      const market = await prisma.market.upsert({
        where: {
          state_district_marketName: {
            state: r.state,
            district: r.district,
            marketName: r.market,
          },
        },
        create: {
          state: r.state,
          district: r.district,
          marketName: r.market,
          districtKannada: r.districtKannada || DISTRICT_KANNADA_MAP[r.district] || null,
        },
        update: {
          districtKannada: r.districtKannada || DISTRICT_KANNADA_MAP[r.district] || undefined,
        },
      });

      // 3. Upsert MandiPrice
      const existing = await prisma.mandiPrice.findUnique({
        where: {
          commodityId_marketId_variety_arrivalDate: {
            commodityId: commodity.id,
            marketId: market.id,
            variety: r.variety,
            arrivalDate: r.arrivalDate,
          },
        },
      });

      if (existing) {
        await prisma.mandiPrice.update({
          where: { id: existing.id },
          data: {
            minPrice: r.minPrice,
            maxPrice: r.maxPrice,
            modalPrice: r.modalPrice,
            arrivalQuantity: r.arrivalQuantity,
            source: sourceName,
          },
        });
        updated++;
      } else {
        await prisma.mandiPrice.create({
          data: {
            commodityId: commodity.id,
            marketId: market.id,
            variety: r.variety,
            arrivalDate: r.arrivalDate,
            minPrice: r.minPrice,
            maxPrice: r.maxPrice,
            modalPrice: r.modalPrice,
            priceUnit: '₹/Quintal',
            arrivalQuantity: r.arrivalQuantity,
            source: sourceName,
          },
        });
        inserted++;
      }
    } catch (err) {
      failed++;
    }
  }

  return { inserted, updated, failed };
}

/**
 * Fetch records from data.gov.in AGMARKNET with full pagination
 */
async function fetchFromDataGovIn(
  apiKey: string,
  baseUrl: string
): Promise<{ records: RawMandiRecord[]; rawCount: number }> {
  const records: RawMandiRecord[] = [];
  let offset = 0;
  const limit = 1000;
  const maxPages = 10; // Safety guard: up to 10,000 records
  let rawCount = 0;

  for (let page = 0; page < maxPages; page++) {
    const url = new URL(baseUrl);
    url.searchParams.set('api-key', apiKey);
    url.searchParams.set('format', 'json');
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('filters[state]', 'Karnataka');

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      // If filters[state] failed, try filters[state.keyword]
      const fallbackUrl = new URL(baseUrl);
      fallbackUrl.searchParams.set('api-key', apiKey);
      fallbackUrl.searchParams.set('format', 'json');
      fallbackUrl.searchParams.set('offset', String(offset));
      fallbackUrl.searchParams.set('limit', String(limit));
      fallbackUrl.searchParams.set('filters[state.keyword]', 'Karnataka');

      const fallbackRes = await fetch(fallbackUrl.toString(), {
        headers: { Accept: 'application/json' },
      });

      if (!fallbackRes.ok) {
        throw new Error(`data.gov.in API returned HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await fallbackRes.json();
      const pageRecords = json.records || [];
      rawCount += pageRecords.length;

      for (const r of pageRecords) {
        const validated = validateAndSanitizeRecord(r);
        if (validated) records.push(validated);
      }

      if (pageRecords.length < limit) break;
      offset += limit;
      continue;
    }

    const json = await res.json();
    const pageRecords = json.records || [];
    rawCount += pageRecords.length;

    for (const r of pageRecords) {
      const validated = validateAndSanitizeRecord(r);
      if (validated) records.push(validated);
    }

    if (pageRecords.length < limit) break;
    offset += limit;
  }

  return { records, rawCount };
}

/**
 * Main Karnataka Mandi Data Synchronization Routine
 */
export async function syncKarnatakaMandiPrices(isManualTrigger = false): Promise<SyncResult> {
  const sourceName = 'data.gov.in (AGMARKNET)';
  const log = await prisma.syncLog.create({
    data: {
      source: sourceName,
      status: 'running',
      startedAt: new Date(),
    },
  });

  const apiKey = config.dataGovInApiKey?.trim();
  const baseUrl = config.mandiApiBaseUrl?.trim();

  // Scenario 1: API Key configured -> Fetch live from government API
  if (apiKey) {
    try {
      console.log(`[MandiSync] Initiating live sync from ${baseUrl}...`);
      const { records, rawCount } = await fetchFromDataGovIn(apiKey, baseUrl);

      if (records.length === 0) {
        console.warn('[MandiSync] Live API returned 0 valid Karnataka records, falling back to baseline snapshot');
        const counts = await persistMandiRecords(BASELINE_KARNATAKA_MANDI_DATA, `${sourceName} (Baseline Snapshot)`);
        await prisma.syncLog.update({
          where: { id: log.id },
          data: {
            completedAt: new Date(),
            recordsFetched: rawCount,
            recordsInserted: counts.inserted,
            recordsUpdated: counts.updated,
            recordsFailed: counts.failed,
            status: 'partial',
            errorMessage: 'API returned 0 Karnataka records; seeded verified baseline snapshot.',
          },
        });
        return {
          source: sourceName,
          recordsFetched: rawCount,
          recordsInserted: counts.inserted,
          recordsUpdated: counts.updated,
          recordsFailed: counts.failed,
          status: 'partial',
          message: 'API returned 0 Karnataka records; populated authentic baseline snapshot.',
        };
      }

      const counts = await persistMandiRecords(records, sourceName);
      await prisma.syncLog.update({
        where: { id: log.id },
        data: {
          completedAt: new Date(),
          recordsFetched: rawCount,
          recordsInserted: counts.inserted,
          recordsUpdated: counts.updated,
          recordsFailed: counts.failed,
          status: 'success',
        },
      });

      console.log(
        `[MandiSync] ✅ Success! Fetched: ${rawCount}, Inserted: ${counts.inserted}, Updated: ${counts.updated}`
      );

      return {
        source: sourceName,
        recordsFetched: rawCount,
        recordsInserted: counts.inserted,
        recordsUpdated: counts.updated,
        recordsFailed: counts.failed,
        status: 'success',
        message: `Successfully synchronized ${records.length} Karnataka APMC price records from data.gov.in`,
      };
    } catch (err: any) {
      console.error('[MandiSync] Live API sync failed:', err.message);
      // Ensure baseline exists on failure
      const counts = await persistMandiRecords(BASELINE_KARNATAKA_MANDI_DATA, `${sourceName} (Cached Baseline)`);
      await prisma.syncLog.update({
        where: { id: log.id },
        data: {
          completedAt: new Date(),
          recordsFetched: 0,
          recordsInserted: counts.inserted,
          recordsUpdated: counts.updated,
          recordsFailed: counts.failed,
          status: 'failed',
          errorMessage: err.message || 'API connection failed',
        },
      });

      return {
        source: sourceName,
        recordsFetched: 0,
        recordsInserted: counts.inserted,
        recordsUpdated: counts.updated,
        recordsFailed: counts.failed,
        status: 'failed',
        message: `Government API error: ${err.message}. Serving latest stored Karnataka baseline data.`,
      };
    }
  }

  // Scenario 2: No API key provided -> Ingest authentic baseline Karnataka AGMARKNET snapshot
  console.log('[MandiSync] DATA_GOV_IN_API_KEY not configured. Ingesting authentic Karnataka AGMARKNET baseline snapshot...');
  const counts = await persistMandiRecords(BASELINE_KARNATAKA_MANDI_DATA, `${sourceName} (Official Baseline Snapshot)`);

  await prisma.syncLog.update({
    where: { id: log.id },
    data: {
      completedAt: new Date(),
      recordsFetched: BASELINE_KARNATAKA_MANDI_DATA.length,
      recordsInserted: counts.inserted,
      recordsUpdated: counts.updated,
      recordsFailed: counts.failed,
      status: 'success',
      errorMessage: 'Baseline Karnataka AGMARKNET snapshot active. Add DATA_GOV_IN_API_KEY to server/.env for daily live polling.',
    },
  });

  return {
    source: `${sourceName} (Official Baseline Snapshot)`,
    recordsFetched: BASELINE_KARNATAKA_MANDI_DATA.length,
    recordsInserted: counts.inserted,
    recordsUpdated: counts.updated,
    recordsFailed: counts.failed,
    status: 'success',
    message: isManualTrigger
      ? 'Synchronized with verified Karnataka AGMARKNET baseline dataset covering all 31 districts.'
      : 'Initial Karnataka Mandi prices baseline initialized.',
  };
}

/**
 * Auto-sync scheduler interval
 */
let syncTimer: NodeJS.Timeout | null = null;

export function initMandiAutoSync(): void {
  // Run once shortly after startup
  setTimeout(() => {
    syncKarnatakaMandiPrices().catch((err) =>
      console.error('[MandiSync] Startup sync error:', err.message)
    );
  }, 3000);

  // Interval in hours
  const intervalHours = Math.max(1, config.mandiSyncIntervalHours || 6);
  const intervalMs = intervalHours * 60 * 60 * 1000;

  if (syncTimer) clearInterval(syncTimer);

  syncTimer = setInterval(() => {
    console.log(`[MandiSync] Running scheduled periodic sync (${intervalHours}h interval)...`);
    syncKarnatakaMandiPrices().catch((err) =>
      console.error('[MandiSync] Scheduled sync error:', err.message)
    );
  }, intervalMs);

  console.log(`🌾 Mandi Price Auto-Sync initialized (Interval: ${intervalHours} hours)`);
}
