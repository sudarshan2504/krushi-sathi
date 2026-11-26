import { Router, Request, Response } from 'express';
import { mandiService } from '../services/mandiService';
import { syncKarnatakaMandiPrices } from '../services/mandiSyncService';
import prisma from '../utils/prisma';

const router = Router();

/**
 * GET /api/market-prices/summary
 * Returns overall statistics: total commodities, total APMC markets, total districts, latest date, total records
 */
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const summary = await mandiService.getMarketSummary();
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[MarketRoutes] Failed to fetch market summary:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch summary' });
  }
});

/**
 * GET /api/market-prices/filters
 * Dynamic discovery of available states, districts, markets, categories, and commodities
 */
router.get('/filters', async (_req: Request, res: Response) => {
  try {
    const filters = await mandiService.getFilterOptions();
    res.json(filters);
  } catch (err: any) {
    console.error('[MarketRoutes] Failed to fetch filter options:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch filters' });
  }
});

/**
 * GET /api/market-prices/crop/:commodityName
 * Returns detailed crop price breakdown and APMC market comparison table
 */
router.get('/crop/:commodityName', async (req: Request, res: Response) => {
  try {
    const details = await mandiService.getCropPriceDetails(req.params.commodityName);
    if (!details) {
      return res.status(404).json({ success: false, message: 'Crop or commodity not found in market data' });
    }
    res.json({ success: true, data: details });
  } catch (err: any) {
    console.error('[MarketRoutes] Failed to fetch crop details:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch crop details' });
  }
});

/**
 * GET /api/market-prices/history
 * Returns historical daily price trends for charting (7d, 15d, 30d, 3m, 6m)
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const commodity = String(req.query.commodity || '').trim();
    const timeframe = String(req.query.timeframe || '30d').trim();

    if (!commodity) {
      return res.status(400).json({ success: false, message: 'Missing required query parameter: commodity' });
    }

    const history = await mandiService.getCropPriceHistory(commodity, timeframe);
    if (!history) {
      return res.status(404).json({ success: false, message: `No price history found for commodity: ${commodity}` });
    }

    res.json({ success: true, data: history });
  } catch (err: any) {
    console.error('[MarketRoutes] Failed to fetch price history:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch price history' });
  }
});

/**
 * GET /api/market-prices/export
 * Export filtered market price records as CSV
 */
router.get('/export', async (req: Request, res: Response) => {
  try {
    const minPrice = req.query.minPrice ? parseFloat(String(req.query.minPrice)) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(String(req.query.maxPrice)) : undefined;

    const csvData = await mandiService.exportMandiPricesCsv({
      district: req.query.district as string,
      market: req.query.market as string,
      category: req.query.category as string,
      commodity: req.query.commodity as string,
      variety: req.query.variety as string,
      state: req.query.state as string,
      q: req.query.q as string,
      minPrice,
      maxPrice,
    });

    const dateStr = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="karnataka_mandi_prices_${dateStr}.csv"`);
    res.status(200).send(csvData);
  } catch (err: any) {
    console.error('[MarketRoutes] Failed to export CSV:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to export CSV' });
  }
});

/**
 * POST /api/market-prices/sync
 * Manual trigger for synchronizing Mandi prices from data.gov.in
 */
router.post('/sync', async (_req: Request, res: Response) => {
  try {
    const syncResult = await syncKarnatakaMandiPrices(true);
    res.json({
      success: syncResult.status !== 'failed',
      data: syncResult,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[MarketRoutes] Sync error:', err);
    res.status(500).json({ success: false, message: err.message || 'Synchronization failed' });
  }
});

/**
 * GET /api/market-prices/sync-logs
 * Retrieves latest synchronization audit logs
 */
router.get('/sync-logs', async (_req: Request, res: Response) => {
  try {
    const logs = await prisma.syncLog.findMany({
      take: 20,
      orderBy: { startedAt: 'desc' },
    });
    res.json({ success: true, data: logs });
  } catch (err: any) {
    console.error('[MarketRoutes] Failed to fetch sync logs:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch sync logs' });
  }
});

/**
 * GET /api/market-prices
 * Search and filter Mandi commodity prices with pagination, sorting, and district coverage
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const minPrice = req.query.minPrice ? parseFloat(String(req.query.minPrice)) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(String(req.query.maxPrice)) : undefined;
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;

    const result = await mandiService.getMandiPrices({
      state: req.query.state as string,
      district: req.query.district as string,
      market: req.query.market as string,
      category: req.query.category as string,
      commodity: req.query.commodity as string,
      variety: req.query.variety as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      minPrice,
      maxPrice,
      q: req.query.q as string,
      page,
      limit,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
    });

    res.json(result);
  } catch (err: any) {
    console.error('[MarketRoutes] Error fetching mandi prices:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch mandi prices' });
  }
});

export default router;
