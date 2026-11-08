import { Router, Request, Response } from 'express';

const router = Router();

export interface MandiCropPrice {
  id: string;
  cropName: string;
  variety: string;
  market: string;
  district: string;
  state: string;
  modalPrice: number; // ₹ per quintal
  minPrice: number;
  maxPrice: number;
  change: number;
  changeType: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

const MANDI_DATA: MandiCropPrice[] = [
  {
    id: 'paddy-mandya',
    cropName: 'Paddy (Dhan)',
    variety: 'Sona Masuri (Grade A)',
    market: 'Mandya APMC',
    district: 'Mandya',
    state: 'Karnataka',
    modalPrice: 2450,
    minPrice: 2200,
    maxPrice: 2580,
    change: 45,
    changeType: 'up',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ragi-maddur',
    cropName: 'Ragi (Finger Millet)',
    variety: 'GPU-28 Hybrid',
    market: 'Maddur APMC',
    district: 'Mandya',
    state: 'Karnataka',
    modalPrice: 3850,
    minPrice: 3600,
    maxPrice: 4000,
    change: 80,
    changeType: 'up',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sugarcane-pandavapura',
    cropName: 'Sugarcane',
    variety: 'Co-86032',
    market: 'Pandavapura Mandi',
    district: 'Mandya',
    state: 'Karnataka',
    modalPrice: 3150,
    minPrice: 3050,
    maxPrice: 3250,
    change: 0,
    changeType: 'stable',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'tomato-mysuru',
    cropName: 'Tomato',
    variety: 'Hybrid Local Red',
    market: 'Mysuru Bandipalya',
    district: 'Mysuru',
    state: 'Karnataka',
    modalPrice: 1650,
    minPrice: 1400,
    maxPrice: 1900,
    change: -50,
    changeType: 'down',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'maize-mandya',
    cropName: 'Maize (Corn)',
    variety: 'Yellow Hybrid',
    market: 'Mandya APMC',
    district: 'Mandya',
    state: 'Karnataka',
    modalPrice: 2180,
    minPrice: 2050,
    maxPrice: 2260,
    change: 30,
    changeType: 'up',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'onion-yeshwanthpur',
    cropName: 'Onion',
    variety: 'Medium Red',
    market: 'Bengaluru Yeshwanthpur',
    district: 'Bengaluru',
    state: 'Karnataka',
    modalPrice: 2750,
    minPrice: 2400,
    maxPrice: 3100,
    change: 120,
    changeType: 'up',
    lastUpdated: new Date().toISOString(),
  },
];

/**
 * GET /api/market-prices
 * Returns APMC Mandi commodity rates for South Karnataka (Mandya, Mysuru, Bengaluru)
 */
router.get('/', (req: Request, res: Response) => {
  const { district, q } = req.query;

  let results = [...MANDI_DATA];

  if (district && typeof district === 'string' && district !== 'All') {
    results = results.filter((item) =>
      item.district.toLowerCase().includes(district.toLowerCase()) ||
      item.market.toLowerCase().includes(district.toLowerCase())
    );
  }

  if (q && typeof q === 'string') {
    const search = q.toLowerCase();
    results = results.filter((item) =>
      item.cropName.toLowerCase().includes(search) ||
      item.variety.toLowerCase().includes(search)
    );
  }

  res.json({
    success: true,
    data: results,
    total: results.length,
    timestamp: new Date().toISOString(),
  });
});

export default router;
