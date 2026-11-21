import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';
import { mandiService } from '../src/services/mandiService';
import {
  syncKarnatakaMandiPrices,
  validateAndSanitizeRecord,
  inferCommodityCategory,
  standardizeDate,
  persistMandiRecords,
} from '../src/services/mandiSyncService';

describe('Karnataka APMC Mandi Market Prices System', () => {
  beforeAll(async () => {
    // Ensure test database has the baseline Karnataka Mandi prices loaded
    await syncKarnatakaMandiPrices(true);
  });

  describe('1. Data Synchronization & Dynamic Discovery', () => {
    it('synchronizes and populates all 31 districts of Karnataka', async () => {
      const summary = await mandiService.getMarketSummary();
      expect(summary.totalDistricts).toBeGreaterThanOrEqual(30);
      expect(summary.totalMarkets).toBeGreaterThanOrEqual(50);
      expect(summary.totalCommodities).toBeGreaterThanOrEqual(30);
      expect(summary.totalRecords).toBeGreaterThan(0);
      expect(summary.lastSync).not.toBeNull();
      expect(summary.lastSync?.status).toBe('success');
    });

    it('supports multiple commodity categories dynamically', async () => {
      const filters = await mandiService.getFilterOptions();
      expect(filters.data.categories).toContain('Vegetable');
      expect(filters.data.categories).toContain('Fruit');
      expect(filters.data.categories).toContain('Grain');
      expect(filters.data.categories).toContain('Pulse');
      expect(filters.data.categories).toContain('Cereal');
      expect(filters.data.categories).toContain('Oilseed');
      expect(filters.data.categories).toContain('Spice');
      expect(filters.data.categories).toContain('Plantation');
    });

    it('infers commodity categories accurately from commodity names', () => {
      expect(inferCommodityCategory('Tomato')).toBe('Vegetable');
      expect(inferCommodityCategory('Arhar (Tur/Red Gram)')).toBe('Pulse');
      expect(inferCommodityCategory('Paddy(Dhan)')).toBe('Cereal');
      expect(inferCommodityCategory('Ragi (Finger Millet)')).toBe('Grain');
      expect(inferCommodityCategory('Groundnut')).toBe('Oilseed');
      expect(inferCommodityCategory('Dry Chillies')).toBe('Spice');
      expect(inferCommodityCategory('Arecanut(Betelnut/Supari)')).toBe('Plantation');
      expect(inferCommodityCategory('Sugarcane')).toBe('Commercial');
    });
  });

  describe('2. Commodity Search & Specific Crop Lookups', () => {
    it('searches for Tomato and returns prices across multiple APMC markets', async () => {
      const res = await mandiService.getMandiPrices({ q: 'Tomato' });
      expect(res.data.length).toBeGreaterThan(0);
      for (const item of res.data) {
        expect(item.commodity.toLowerCase()).toContain('tomato');
        expect(item.modalPrice).toBeGreaterThan(0);
        expect(item.minPrice).toBeLessThanOrEqual(item.maxPrice);
        expect(item.modalPrice).toBeGreaterThanOrEqual(item.minPrice);
        expect(item.modalPrice).toBeLessThanOrEqual(item.maxPrice);
      }
    });

    it('searches for Onion and finds Bellary, Yeshwanthpur, Hubballi markets', async () => {
      const res = await mandiService.getMandiPrices({ q: 'Onion' });
      expect(res.data.length).toBeGreaterThan(0);
      const markets = res.data.map((i) => i.market);
      expect(markets.some((m) => m.includes('Bengaluru') || m.includes('Mysuru') || m.includes('Hubballi') || m.includes('Ballari'))).toBe(true);
    });

    it('searches for Potato and finds Hassan and Kolar markets', async () => {
      const res = await mandiService.getMandiPrices({ q: 'Potato' });
      expect(res.data.length).toBeGreaterThan(0);
      const districts = res.data.map((i) => i.district);
      expect(districts.some((d) => d.includes('Hassan') || d.includes('Kolar') || d.includes('Bengaluru'))).toBe(true);
    });

    it('searches for Ragi (Finger Millet) and returns Mandya / Maddur rates', async () => {
      const res = await mandiService.getMandiPrices({ q: 'Ragi' });
      expect(res.data.length).toBeGreaterThan(0);
      const item = res.data.find((i) => i.commodity.includes('Ragi'));
      expect(item).toBeDefined();
      expect(item?.category).toBe('Grain');
    });

    it('searches for Maize and returns Davangere / Mandya rates', async () => {
      const res = await mandiService.getMandiPrices({ q: 'Maize' });
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data.some((i) => i.commodity.includes('Maize'))).toBe(true);
    });

    it('searches for Tur Dal (Arhar) and returns Kalaburagi / Sedam rates', async () => {
      const res = await mandiService.getMandiPrices({ q: 'Arhar' });
      expect(res.data.length).toBeGreaterThan(0);
      const item = res.data.find((i) => i.district.includes('Kalaburagi'));
      expect(item).toBeDefined();
      expect(item?.modalPrice).toBeGreaterThanOrEqual(9000); // Tur dal wholesale price range
    });
  });

  describe('3. District & APMC Market Filtering', () => {
    it('filters prices strictly by district', async () => {
      const res = await mandiService.getMandiPrices({ district: 'Kolar' });
      expect(res.data.length).toBeGreaterThan(0);
      for (const item of res.data) {
        expect(item.district).toBe('Kolar');
      }
    });

    it('filters prices strictly by APMC market name', async () => {
      const res = await mandiService.getMandiPrices({ market: 'Byadgi APMC' });
      expect(res.data.length).toBeGreaterThan(0);
      for (const item of res.data) {
        expect(item.market).toBe('Byadgi APMC');
        expect(item.commodity).toBe('Dry Chillies');
      }
    });

    it('filters prices by category', async () => {
      const res = await mandiService.getMandiPrices({ category: 'Plantation' });
      expect(res.data.length).toBeGreaterThan(0);
      for (const item of res.data) {
        expect(item.category).toBe('Plantation');
      }
    });

    it('combines filters and pagination without breaking total counts', async () => {
      const res = await mandiService.getMandiPrices({
        district: 'Mandya',
        limit: 3,
        page: 1,
      });
      expect(res.data.length).toBeLessThanOrEqual(3);
      expect(res.pagination.total).toBeGreaterThanOrEqual(res.data.length);
      expect(res.pagination.totalPages).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4. Crop Price Details & Cross-Market Comparison', () => {
    it('compares one crop across different APMC markets with genuine data', async () => {
      const details = await mandiService.getCropPriceDetails('Tomato');
      expect(details).not.toBeNull();
      expect(details?.commodity).toBe('Tomato');
      expect(details?.summary.totalMarketsReporting).toBeGreaterThanOrEqual(2);
      expect(details?.summary.minPrice).toBeLessThanOrEqual(details!.summary.maxPrice);
      expect(details?.comparison.length).toBeGreaterThanOrEqual(2);

      // Verify markets present in comparison
      const marketNames = details!.comparison.map((c) => c.market);
      expect(marketNames.length).toBe(new Set(marketNames).size); // Unique markets
    });

    it('returns 404 for unknown crop details query', async () => {
      const details = await mandiService.getCropPriceDetails('NonExistentCropNameXYZ');
      expect(details).toBeNull();
    });
  });

  describe('5. Historical Price Data & Trends', () => {
    it('aggregates historical price data points for charts', async () => {
      const history = await mandiService.getCropPriceHistory('Tomato', '30d');
      expect(history).not.toBeNull();
      expect(history?.commodity).toBe('Tomato');
      expect(history?.history.length).toBeGreaterThanOrEqual(3);

      for (const point of history!.history) {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(point.modalPrice).toBeGreaterThan(0);
        expect(point.minPrice).toBeLessThanOrEqual(point.maxPrice);
      }
    });
  });

  describe('6. Data Validation, Error Handling & Duplicate Avoidance', () => {
    it('sanitizes records with missing modalPrice or inverted min/max prices', () => {
      const cleaned = validateAndSanitizeRecord({
        commodity: 'Green Chilli',
        market: 'Mysuru (Bandipalya)',
        district: 'Mysuru',
        state: 'Karnataka',
        min_price: '4000',
        max_price: '3000', // Inverted on purpose
        modal_price: '',   // Missing on purpose
        arrival_date: '19/11/2026',
      });

      expect(cleaned).not.toBeNull();
      expect(cleaned?.minPrice).toBe(3000);
      expect(cleaned?.maxPrice).toBe(4000);
      expect(cleaned?.modalPrice).toBe(3500); // Averaged
      expect(cleaned?.arrivalDate).toBe('2026-11-19');
    });

    it('rejects malformed records missing critical fields', () => {
      expect(validateAndSanitizeRecord({ commodity: '' })).toBeNull();
      expect(validateAndSanitizeRecord({ commodity: 'Tomato', market: '' })).toBeNull();
      expect(validateAndSanitizeRecord({ commodity: 'Tomato', market: 'M1', district: '', min_price: 'abc' })).toBeNull();
    });

    it('standardizes various date formats into YYYY-MM-DD', () => {
      expect(standardizeDate('19/11/2026')).toBe('2026-11-19');
      expect(standardizeDate('19-11-2026')).toBe('2026-11-19');
      expect(standardizeDate('2026-11-19')).toBe('2026-11-19');
    });

    it('avoids duplicate entries by updating existing records', async () => {
      const testRecord = {
        state: 'Karnataka',
        district: 'Mandya',
        market: 'Mandya APMC',
        commodity: 'Maize',
        variety: 'Hybrid Yellow',
        arrivalDate: '2026-11-19',
        minPrice: 2050,
        maxPrice: 2320,
        modalPrice: 2210,
        category: 'Cereal' as const,
      };

      const firstPass = await persistMandiRecords([testRecord]);
      const secondPass = await persistMandiRecords([testRecord]);

      expect(secondPass.inserted).toBe(0);
      expect(secondPass.updated).toBe(1);
    });
  });

  describe('7. HTTP REST API Endpoints', () => {
    it('GET /api/market-prices/summary returns summary stats and last sync log', async () => {
      const res = await request(app).get('/api/market-prices/summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCommodities).toBeGreaterThanOrEqual(30);
      expect(res.body.data.totalDistricts).toBeGreaterThanOrEqual(30);
      expect(res.body.data.totalRecords).toBeGreaterThan(0);
    });

    it('GET /api/market-prices/filters returns dynamic district and market lists', async () => {
      const res = await request(app).get('/api/market-prices/filters');
      expect(res.status).toBe(200);
      expect(res.body.data.districts.length).toBeGreaterThanOrEqual(30);
      expect(res.body.data.markets.length).toBeGreaterThanOrEqual(50);
      expect(res.body.data.categories.length).toBeGreaterThanOrEqual(5);
    });

    it('GET /api/market-prices supports pagination and search queries', async () => {
      const res = await request(app).get('/api/market-prices?q=Onion&page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    it('GET /api/market-prices/crop/:name returns detailed market comparison', async () => {
      const res = await request(app).get('/api/market-prices/crop/Tomato');
      expect(res.status).toBe(200);
      expect(res.body.data.commodity).toBe('Tomato');
      expect(res.body.data.comparison.length).toBeGreaterThan(0);
    });

    it('GET /api/market-prices/history returns date points for Recharts', async () => {
      const res = await request(app).get('/api/market-prices/history?commodity=Tomato&timeframe=30d');
      expect(res.status).toBe(200);
      expect(res.body.data.history.length).toBeGreaterThan(0);
    });

    it('GET /api/market-prices/export returns CSV file attachment', async () => {
      const res = await request(app).get('/api/market-prices/export?district=Mandya');
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.text).toContain('Commodity,Kannada Name,Category');
      expect(res.text).toContain('Mandya');
    });

    it('POST /api/market-prices/sync triggers synchronization and returns diagnostic metrics', async () => {
      const res = await request(app).post('/api/market-prices/sync');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recordsFetched).toBeGreaterThan(0);
    });

    it('GET /api/market-prices/sync-logs returns audit logs', async () => {
      const res = await request(app).get('/api/market-prices/sync-logs');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].source).toBeDefined();
    });
  });
});
