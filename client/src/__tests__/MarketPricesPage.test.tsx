import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../context/LanguageContext';
import { ToastProvider } from '../context/ToastContext';
import { MarketPricesPage } from '../pages/MarketPricesPage';

const mockGetSummary = vi.fn();
const mockGetFilters = vi.fn();
const mockGetPrices = vi.fn();
const mockGetCropDetails = vi.fn();
const mockGetPriceHistory = vi.fn();
const mockTriggerSync = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    updateUser: vi.fn(),
  }),
}));

vi.mock('../services/api', () => ({
  api: {
    market: {
      getSummary: () => mockGetSummary(),
      getFilters: () => mockGetFilters(),
      getPrices: (params: any) => mockGetPrices(params),
      getCropDetails: (crop: string) => mockGetCropDetails(crop),
      getPriceHistory: (crop: string, tf: string) => mockGetPriceHistory(crop, tf),
      triggerSync: () => mockTriggerSync(),
      getExportUrl: () => 'http://localhost:5000/api/market-prices/export',
    },
  },
}));

// Mock Recharts ResponsiveContainer to avoid SVG size errors in jsdom
vi.mock('recharts', async () => {
  const original = await vi.importActual<any>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div data-testid="recharts-container">{children}</div>,
  };
});

function renderMarketPage() {
  return render(
    <LanguageProvider>
      <ToastProvider>
        <MemoryRouter>
          <MarketPricesPage />
        </MemoryRouter>
      </ToastProvider>
    </LanguageProvider>
  );
}

describe('MarketPricesPage — Karnataka Mandi Dashboard', () => {
  beforeEach(() => {
    mockGetSummary.mockResolvedValue({
      totalCommodities: 37,
      totalMarkets: 60,
      totalDistricts: 31,
      totalRecords: 98,
      latestArrivalDate: '2026-11-19',
      lastSync: {
        status: 'success',
        startedAt: '2026-11-19T07:00:00.000Z',
        completedAt: '2026-11-19T07:00:02.000Z',
        recordsFetched: 98,
        recordsInserted: 98,
        source: 'data.gov.in (AGMARKNET)',
      },
    });

    mockGetFilters.mockResolvedValue({
      states: ['Karnataka'],
      districts: [
        { name: 'Mandya', nameKannada: 'ಮಂಡ್ಯ' },
        { name: 'Kolar', nameKannada: 'ಕೋಲಾರ' },
        { name: 'Mysuru', nameKannada: 'ಮೈಸೂರು' },
      ],
      markets: [
        { id: '1', name: 'Mandya APMC', district: 'Mandya', state: 'Karnataka' },
        { id: '2', name: 'Kolar APMC', district: 'Kolar', state: 'Karnataka' },
        { id: '3', name: 'Mysuru (Bandipalya)', district: 'Mysuru', state: 'Karnataka' },
      ],
      categories: ['Vegetable', 'Cereal', 'Grain'],
      commodities: [
        { id: 'c1', name: 'Tomato', category: 'Vegetable', nameKannada: 'ಟೊಮೆಟೊ' },
        { id: 'c2', name: 'Paddy(Dhan)', category: 'Cereal', nameKannada: 'ಭತ್ತ (Paddy)' },
      ],
    });

    mockGetPrices.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'p1',
          commodity: 'Tomato',
          commodityKannada: 'ಟೊಮೆಟೊ',
          category: 'Vegetable',
          variety: 'Hybrid Sahu',
          state: 'Karnataka',
          district: 'Kolar',
          districtKannada: 'ಕೋಲಾರ',
          market: 'Kolar APMC',
          minPrice: 1200,
          maxPrice: 1700,
          modalPrice: 1480,
          priceUnit: '₹/Quintal',
          arrivalQuantity: 2200,
          arrivalDate: '2026-11-19',
          source: 'data.gov.in (AGMARKNET)',
          updatedAt: '2026-11-19T07:00:00.000Z',
        },
        {
          id: 'p2',
          commodity: 'Paddy(Dhan)',
          commodityKannada: 'ಭತ್ತ (Paddy)',
          category: 'Cereal',
          variety: 'Sona Masuri',
          state: 'Karnataka',
          district: 'Mandya',
          districtKannada: 'ಮಂಡ್ಯ',
          market: 'Mandya APMC',
          minPrice: 2320,
          maxPrice: 2680,
          modalPrice: 2510,
          priceUnit: '₹/Quintal',
          arrivalQuantity: 450,
          arrivalDate: '2026-11-19',
          source: 'data.gov.in (AGMARKNET)',
          updatedAt: '2026-11-19T07:00:00.000Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 15,
        total: 2,
        totalPages: 1,
      },
    });

    mockGetCropDetails.mockResolvedValue({
      commodity: 'Tomato',
      nameKannada: 'ಟೊಮೆಟೊ',
      category: 'Vegetable',
      varieties: ['Hybrid Sahu', 'Hybrid Red'],
      summary: {
        minPrice: 1200,
        maxPrice: 1850,
        avgModalPrice: 1540,
        totalMarketsReporting: 2,
        latestDate: '2026-11-19',
      },
      comparison: [
        {
          market: 'Kolar APMC',
          district: 'Kolar',
          variety: 'Hybrid Sahu',
          minPrice: 1200,
          maxPrice: 1700,
          modalPrice: 1480,
          arrivalDate: '2026-11-19',
          source: 'data.gov.in (AGMARKNET)',
        },
        {
          market: 'Mysuru (Bandipalya)',
          district: 'Mysuru',
          variety: 'Hybrid Red',
          minPrice: 1350,
          maxPrice: 1850,
          modalPrice: 1600,
          arrivalDate: '2026-11-19',
          source: 'data.gov.in (AGMARKNET)',
        },
      ],
    });

    mockGetPriceHistory.mockResolvedValue({
      commodity: 'Tomato',
      timeframe: '30d',
      dataPointsCount: 3,
      history: [
        { date: '2026-11-04', modalPrice: 1860, minPrice: 1500, maxPrice: 2200, marketsReporting: 2, markets: [] },
        { date: '2026-11-12', modalPrice: 1655, minPrice: 1300, maxPrice: 1950, marketsReporting: 2, markets: [] },
        { date: '2026-11-19', modalPrice: 1540, minPrice: 1200, maxPrice: 1850, marketsReporting: 2, markets: [] },
      ],
    });
  });

  it('renders header, 31 Karnataka districts summary badges, and price cards', async () => {
    renderMarketPage();

    // Check summary numbers
    await waitFor(() => {
      expect(screen.getByText('37')).toBeInTheDocument(); // Total Commodities
      expect(screen.getByText('60')).toBeInTheDocument(); // Total Markets
      expect(screen.getByText('31')).toBeInTheDocument(); // Total Districts
    });

    // Check price items rendered
    expect(screen.getByText('Tomato')).toBeInTheDocument();
    expect(screen.getByText('Paddy(Dhan)')).toBeInTheDocument();
    expect(screen.getAllByText('Kolar APMC').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Mandya APMC').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/₹1,480/)).toBeInTheDocument();
    expect(screen.getByText(/₹2,510/)).toBeInTheDocument();
  });

  it('filters by search input', async () => {
    renderMarketPage();

    const searchInput = screen.getByLabelText('Search crops');
    fireEvent.change(searchInput, { target: { value: 'Tomato' } });

    await waitFor(() => {
      expect(mockGetPrices).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'Tomato' })
      );
    });
  });

  it('opens crop detail modal and renders market comparison table on card click', async () => {
    renderMarketPage();

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    // Click on the Tomato card
    fireEvent.click(screen.getByText('Tomato'));

    await waitFor(() => {
      expect(mockGetCropDetails).toHaveBeenCalledWith('Tomato');
      expect(mockGetPriceHistory).toHaveBeenCalledWith('Tomato', '30d');
      expect(screen.getByText('Karnataka APMC Cross-Market Comparison & Price History')).toBeInTheDocument();
      expect(screen.getByText('Compare APMC Mandi Prices')).toBeInTheDocument();
    });
  });

  it('opens sync diagnostics modal and displays data freshness', async () => {
    renderMarketPage();

    const statusBtn = screen.getByTitle('View Sync Diagnostics & Source info');
    fireEvent.click(statusBtn);

    await waitFor(() => {
      expect(screen.getByText('Government Mandi Data Status')).toBeInTheDocument();
      expect(screen.getByText('Trigger Manual Sync Now')).toBeInTheDocument();
    });
  });
});
