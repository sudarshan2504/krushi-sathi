import prisma from '../utils/prisma';

export interface MandiQueryFilters {
  state?: string;
  district?: string;
  market?: string;
  category?: string;
  commodity?: string;
  variety?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: 'modalPrice' | 'minPrice' | 'maxPrice' | 'commodity' | 'market' | 'district' | 'arrivalDate';
  sortOrder?: 'asc' | 'desc';
}

export interface MarketSummary {
  totalCommodities: number;
  totalMarkets: number;
  totalDistricts: number;
  totalRecords: number;
  latestArrivalDate: string;
  lastSync: {
    status: string;
    startedAt: string;
    completedAt: string | null;
    recordsFetched: number;
    recordsInserted: number;
    source: string;
    message?: string;
  } | null;
}

export class MandiService {
  /**
   * Search and filter Mandi prices with pagination & sorting
   */
  async getMandiPrices(filters: MandiQueryFilters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    // State filter (defaults to Karnataka if not specified)
    const state = filters.state?.trim() || 'Karnataka';
    if (state !== 'All') {
      where.market = { ...where.market, state: { equals: state } };
    }

    // District filter
    if (filters.district && filters.district !== 'All') {
      where.market = {
        ...where.market,
        district: { contains: filters.district },
      };
    }

    // APMC Market filter
    if (filters.market && filters.market !== 'All') {
      where.market = {
        ...where.market,
        marketName: { contains: filters.market },
      };
    }

    // Category filter
    if (filters.category && filters.category !== 'All') {
      where.commodity = {
        ...where.commodity,
        category: { equals: filters.category },
      };
    }

    // Commodity specific filter
    if (filters.commodity && filters.commodity !== 'All') {
      where.commodity = {
        ...where.commodity,
        commodityName: { contains: filters.commodity },
      };
    }

    // Variety filter
    if (filters.variety && filters.variety !== 'All') {
      where.variety = { contains: filters.variety };
    }

    // Price range filter
    if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
      where.modalPrice = { ...where.modalPrice, gte: filters.minPrice };
    }
    if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      where.modalPrice = { ...where.modalPrice, lte: filters.maxPrice };
    }

    // Date range filter
    if (filters.dateFrom) {
      where.arrivalDate = { ...where.arrivalDate, gte: filters.dateFrom };
    }
    if (filters.dateTo) {
      where.arrivalDate = { ...where.arrivalDate, lte: filters.dateTo };
    }

    // Global Search query (matches commodity, variety, market, district, or Kannada name)
    if (filters.q && filters.q.trim()) {
      const q = filters.q.trim();
      where.OR = [
        { commodity: { commodityName: { contains: q } } },
        { commodity: { normalizedName: { contains: q } } },
        { commodity: { nameKannada: { contains: q } } },
        { variety: { contains: q } },
        { market: { marketName: { contains: q } } },
        { market: { district: { contains: q } } },
        { market: { districtKannada: { contains: q } } },
      ];
    }

    // Determine sorting
    const sortOrder = filters.sortOrder === 'asc' ? 'asc' : 'desc';
    let orderBy: any = [{ arrivalDate: 'desc' }, { modalPrice: 'desc' }];

    if (filters.sortBy === 'modalPrice') orderBy = [{ modalPrice: sortOrder }];
    else if (filters.sortBy === 'minPrice') orderBy = [{ minPrice: sortOrder }];
    else if (filters.sortBy === 'maxPrice') orderBy = [{ maxPrice: sortOrder }];
    else if (filters.sortBy === 'arrivalDate') orderBy = [{ arrivalDate: sortOrder }];
    else if (filters.sortBy === 'commodity') orderBy = [{ commodity: { commodityName: sortOrder } }];
    else if (filters.sortBy === 'district') orderBy = [{ market: { district: sortOrder } }];
    else if (filters.sortBy === 'market') orderBy = [{ market: { marketName: sortOrder } }];

    const [total, records] = await Promise.all([
      prisma.mandiPrice.count({ where }),
      prisma.mandiPrice.findMany({
        where,
        include: {
          commodity: true,
          market: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data: records.map((r) => ({
        id: r.id,
        commodity: r.commodity.commodityName,
        commodityKannada: r.commodity.nameKannada || r.commodity.commodityName,
        category: r.commodity.category,
        variety: r.variety,
        state: r.market.state,
        district: r.market.district,
        districtKannada: r.market.districtKannada || r.market.district,
        market: r.market.marketName,
        minPrice: r.minPrice,
        maxPrice: r.maxPrice,
        modalPrice: r.modalPrice,
        priceUnit: r.priceUnit,
        arrivalQuantity: r.arrivalQuantity,
        arrivalDate: r.arrivalDate,
        source: r.source,
        updatedAt: r.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get dashboard summary metrics (total commodities, markets, districts, latest date)
   */
  async getMarketSummary(): Promise<MarketSummary> {
    const [totalRecords, commodities, markets, latestPrice, lastSyncLog] = await Promise.all([
      prisma.mandiPrice.count(),
      prisma.mandiPrice.groupBy({
        by: ['commodityId'],
      }),
      prisma.mandiPrice.groupBy({
        by: ['marketId'],
      }),
      prisma.mandiPrice.findFirst({
        orderBy: { arrivalDate: 'desc' },
        select: { arrivalDate: true },
      }),
      prisma.syncLog.findFirst({
        orderBy: { startedAt: 'desc' },
      }),
    ]);

    // Calculate distinct districts from markets that currently have prices
    const marketIds = markets.map((m) => m.marketId);
    const districts = await prisma.market.groupBy({
      by: ['district'],
      where: { id: { in: marketIds } },
    });

    return {
      totalCommodities: commodities.length,
      totalMarkets: markets.length,
      totalDistricts: districts.length,
      totalRecords,
      latestArrivalDate: latestPrice?.arrivalDate || new Date().toISOString().split('T')[0],
      lastSync: lastSyncLog
        ? {
            status: lastSyncLog.status,
            startedAt: lastSyncLog.startedAt.toISOString(),
            completedAt: lastSyncLog.completedAt ? lastSyncLog.completedAt.toISOString() : null,
            recordsFetched: lastSyncLog.recordsFetched,
            recordsInserted: lastSyncLog.recordsInserted,
            source: lastSyncLog.source,
            message: lastSyncLog.errorMessage || undefined,
          }
        : null,
    };
  }

  /**
   * Return dynamic filter options derived from actual database records
   */
  async getFilterOptions() {
    const [districts, markets, categories, commodities] = await Promise.all([
      prisma.market.findMany({
        distinct: ['district'],
        select: { district: true, districtKannada: true },
        orderBy: { district: 'asc' },
      }),
      prisma.market.findMany({
        select: { id: true, marketName: true, district: true, state: true },
        orderBy: { marketName: 'asc' },
      }),
      prisma.commodity.findMany({
        distinct: ['category'],
        select: { category: true },
        orderBy: { category: 'asc' },
      }),
      prisma.commodity.findMany({
        select: { id: true, commodityName: true, category: true, nameKannada: true },
        orderBy: { commodityName: 'asc' },
      }),
    ]);

    return {
      success: true,
      data: {
        states: ['Karnataka'],
        districts: districts.map((d) => ({
          name: d.district,
          nameKannada: d.districtKannada || d.district,
        })),
        markets: markets.map((m) => ({
          id: m.id,
          name: m.marketName,
          district: m.district,
          state: m.state,
        })),
        categories: categories.map((c) => c.category).filter(Boolean),
        commodities: commodities.map((c) => ({
          id: c.id,
          name: c.commodityName,
          category: c.category,
          nameKannada: c.nameKannada || c.commodityName,
        })),
      },
    };
  }

  /**
   * Get detailed crop price comparison across Karnataka APMC markets
   */
  async getCropPriceDetails(commodityName: string) {
    const decodedName = decodeURIComponent(commodityName).trim();

    // Find commodity by name or substring
    const commodity = await prisma.commodity.findFirst({
      where: {
        OR: [
          { commodityName: { equals: decodedName } },
          { commodityName: { contains: decodedName } },
          { normalizedName: { contains: decodedName.toLowerCase() } },
        ],
      },
    });

    if (!commodity) {
      return null;
    }

    // Fetch latest prices for this crop across all markets
    const latestPrices = await prisma.mandiPrice.findMany({
      where: { commodityId: commodity.id },
      include: { market: true },
      orderBy: [{ arrivalDate: 'desc' }, { modalPrice: 'desc' }],
    });

    if (latestPrices.length === 0) {
      return {
        commodity: commodity.commodityName,
        nameKannada: commodity.nameKannada || commodity.commodityName,
        category: commodity.category,
        totalMarkets: 0,
        markets: [],
      };
    }

    // Keep the latest price per market to avoid duplicates in the comparison table
    const marketLatestMap = new Map<string, (typeof latestPrices)[0]>();
    const varietiesSet = new Set<string>();

    for (const p of latestPrices) {
      varietiesSet.add(p.variety);
      if (!marketLatestMap.has(p.marketId)) {
        marketLatestMap.set(p.marketId, p);
      }
    }

    const uniqueMarketPrices = Array.from(marketLatestMap.values());
    const modalPrices = uniqueMarketPrices.map((p) => p.modalPrice);
    const minOverall = Math.min(...uniqueMarketPrices.map((p) => p.minPrice));
    const maxOverall = Math.max(...uniqueMarketPrices.map((p) => p.maxPrice));
    const avgModal = Math.round(modalPrices.reduce((a, b) => a + b, 0) / (modalPrices.length || 1));

    return {
      commodity: commodity.commodityName,
      nameKannada: commodity.nameKannada || commodity.commodityName,
      category: commodity.category,
      varieties: Array.from(varietiesSet),
      summary: {
        minPrice: minOverall,
        maxPrice: maxOverall,
        avgModalPrice: avgModal,
        totalMarketsReporting: uniqueMarketPrices.length,
        latestDate: latestPrices[0].arrivalDate,
      },
      comparison: uniqueMarketPrices.map((p) => ({
        market: p.market.marketName,
        district: p.market.district,
        variety: p.variety,
        minPrice: p.minPrice,
        maxPrice: p.maxPrice,
        modalPrice: p.modalPrice,
        arrivalDate: p.arrivalDate,
        arrivalQuantity: p.arrivalQuantity,
        source: p.source,
      })),
    };
  }

  /**
   * Get historical price trends for charts (7d, 15d, 30d, 3m, 6m)
   */
  async getCropPriceHistory(commodityName: string, timeframe = '30d') {
    const decodedName = decodeURIComponent(commodityName).trim();

    const commodity = await prisma.commodity.findFirst({
      where: {
        OR: [
          { commodityName: { equals: decodedName } },
          { commodityName: { contains: decodedName } },
        ],
      },
    });

    if (!commodity) return null;

    // Calculate start date based on timeframe
    let daysAgo = 30;
    if (timeframe === '7d') daysAgo = 7;
    else if (timeframe === '15d') daysAgo = 15;
    else if (timeframe === '30d') daysAgo = 30;
    else if (timeframe === '3m') daysAgo = 90;
    else if (timeframe === '6m') daysAgo = 180;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    const startDateStr = startDate.toISOString().split('T')[0];

    const records = await prisma.mandiPrice.findMany({
      where: {
        commodityId: commodity.id,
        arrivalDate: { gte: startDateStr },
      },
      include: { market: true },
      orderBy: { arrivalDate: 'asc' },
    });

    // Group by arrivalDate
    const dateGroups = new Map<
      string,
      {
        date: string;
        modalSum: number;
        minVals: number[];
        maxVals: number[];
        count: number;
        marketPoints: Array<{ market: string; district: string; modalPrice: number }>;
      }
    >();

    for (const r of records) {
      if (!dateGroups.has(r.arrivalDate)) {
        dateGroups.set(r.arrivalDate, {
          date: r.arrivalDate,
          modalSum: 0,
          minVals: [],
          maxVals: [],
          count: 0,
          marketPoints: [],
        });
      }
      const g = dateGroups.get(r.arrivalDate)!;
      g.modalSum += r.modalPrice;
      g.minVals.push(r.minPrice);
      g.maxVals.push(r.maxPrice);
      g.count += 1;
      g.marketPoints.push({
        market: r.market.marketName,
        district: r.market.district,
        modalPrice: r.modalPrice,
      });
    }

    const history = Array.from(dateGroups.values()).map((g) => ({
      date: g.date,
      modalPrice: Math.round(g.modalSum / g.count),
      minPrice: Math.min(...g.minVals),
      maxPrice: Math.max(...g.maxVals),
      marketsReporting: g.count,
      markets: g.marketPoints,
    }));

    return {
      commodity: commodity.commodityName,
      timeframe,
      dataPointsCount: history.length,
      history,
    };
  }

  /**
   * Export filtered Mandi prices to CSV string
   */
  async exportMandiPricesCsv(filters: MandiQueryFilters = {}): Promise<string> {
    const result = await this.getMandiPrices({ ...filters, page: 1, limit: 1000 });
    const rows = result.data;

    const headers = [
      'Commodity',
      'Kannada Name',
      'Category',
      'Variety',
      'State',
      'District',
      'APMC Market',
      'Min Price (INR/Qtl)',
      'Max Price (INR/Qtl)',
      'Modal Price (INR/Qtl)',
      'Arrival Date',
      'Data Source',
    ];

    const escapeCsv = (str: any) => {
      const s = String(str ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const csvLines = [headers.join(',')];
    for (const r of rows) {
      csvLines.push(
        [
          escapeCsv(r.commodity),
          escapeCsv(r.commodityKannada),
          escapeCsv(r.category),
          escapeCsv(r.variety),
          escapeCsv(r.state),
          escapeCsv(r.district),
          escapeCsv(r.market),
          r.minPrice,
          r.maxPrice,
          r.modalPrice,
          escapeCsv(r.arrivalDate),
          escapeCsv(r.source),
        ].join(',')
      );
    }

    return csvLines.join('\n');
  }
}

export const mandiService = new MandiService();
