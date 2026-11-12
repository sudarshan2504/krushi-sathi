import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../context/LanguageContext';
import { CropImage } from '../components/ui/CropImage';
import { CropLibraryPage } from '../pages/CropLibraryPage';
import { CropCatalogItem } from '../types';

const mockGetCatalog = vi.fn();

vi.mock('../services/api', () => ({
  api: {
    crops: {
      getCatalog: (...args: any[]) => mockGetCatalog(...args),
    },
  },
}));

function makeCrop(overrides: Partial<CropCatalogItem> = {}): CropCatalogItem {
  return {
    id: 'finger-millet-ragi',
    alphabeticalKey: 'F',
    name: 'Finger Millet (Ragi)',
    nameKannada: 'ರಾಗಿ',
    nameTamil: 'கேழ்வரகு',
    nameTelugu: 'రాగులు',
    scientificName: 'Eleusine coracana',
    category: 'cereal_millet',
    idealSoilTypes: ['Red Soil', 'Loamy Soil'],
    minPh: 5.5,
    maxPh: 7.5,
    seasons: ['Kharif'],
    durationDays: '105-120 days',
    waterRequirement: 'Low',
    estimatedCostPerAcre: '₹15,000 - ₹20,000',
    potentialYieldPerAcre: '12 - 15 Quintals',
    marketDemand: 'High',
    description: 'Drought-hardy South Indian millet staple.',
    descriptionKn: 'ರಾಗಿ ಬರ ಸಹಿಷ್ಣು ಬೆಳೆಯಾಗಿದೆ.',
    descriptionTa: 'கேழ்வரகு வறட்சியை தாங்கும் பயிர்.',
    descriptionTe: 'రాగులు కరువును తట్టుకునే పంట.',
    risks: [],
    benefits: ['Drought tolerant'],
    imageUrl: '/crops/finger-millet-ragi.webp',
    imageStatus: 'approved',
    images: [
      {
        path: '/crops/finger-millet-ragi.webp',
        type: 'plant',
        source: 'Wikimedia Commons',
        author: 'Test Author',
        license: 'CC BY-SA 4.0',
      },
    ],
    confidence: 'high',
    ...overrides,
  };
}

describe('CropImage & Crop Card ID Lookup', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetCatalog.mockReset();
  });

  it('resolves CropImage directly by stable cropId without external stock URLs', () => {
    render(<CropImage cropId="finger-millet-ragi" alt="Finger Millet (Ragi)" cropName="Ragi" />);

    const img = screen.getByRole('img', { name: 'Finger Millet (Ragi)' });
    expect(img).toHaveAttribute('src', '/crops/finger-millet-ragi.webp');
    expect(img.getAttribute('src')).not.toMatch(/^https?:\/\//);
  });

  it('renders illustrated botanical fallback when useFallback is set or image loading fails', () => {
    const { rerender } = render(
      <CropImage cropId="mystery-crop" cropName="Areca Nut" useFallback />
    );

    const fallbackTile = screen.getByRole('img', { name: /Areca Nut \(Botanical Illustration\)/i });
    expect(fallbackTile).toBeInTheDocument();
    expect(screen.getByText('Areca Nut')).toBeInTheDocument();

    rerender(<CropImage cropId="broken-crop" cropName="Black Pepper" src="/crops/broken-crop.webp" />);
    const img = screen.getByRole('img', { name: 'Black Pepper' });
    fireEvent.error(img);

    expect(screen.getByRole('img', { name: /Black Pepper \(Botanical Illustration\)/i })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Black Pepper' })).toBeNull();
  });

  it('maps crop card images by crop.id rather than list position even when item order changes', async () => {
    const ragi = makeCrop({
      id: 'finger-millet-ragi',
      name: 'Finger Millet (Ragi)',
      imageUrl: '/crops/finger-millet-ragi.webp',
      images: [
      {
        path: '/crops/finger-millet-ragi.webp',
        type: 'plant',
        source: 'Wikimedia Commons',
        author: 'Test Author',
        license: 'CC BY-SA 4.0',
      },
    ],
    });
    const banana = makeCrop({
      id: 'banana-grand-naine',
      name: 'Banana (Grand Naine)',
      scientificName: 'Musa acuminata',
      category: 'fruit',
      imageUrl: '/crops/banana-grand-naine.webp',
      images: [
        {
          path: '/crops/banana-grand-naine.webp',
          type: 'plant',
          source: 'Wikimedia Commons',
          author: 'Test Author',
          license: 'CC BY-SA 4.0',
        },
      ],
    });

    mockGetCatalog
      .mockResolvedValueOnce({
        data: [ragi, banana],
        pagination: { total: 2, page: 1, limit: 24, totalPages: 1, hasNext: false, hasPrev: false },
      })
      .mockResolvedValueOnce({
        data: [banana, ragi],
        pagination: { total: 2, page: 1, limit: 24, totalPages: 1, hasNext: false, hasPrev: false },
      });

    const { rerender } = render(
      <LanguageProvider>
        <MemoryRouter>
          <CropLibraryPage />
        </MemoryRouter>
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByAltText('Finger Millet (Ragi)')).toHaveAttribute(
        'src',
        '/crops/finger-millet-ragi.webp'
      );
      expect(screen.getByAltText('Banana (Grand Naine)')).toHaveAttribute(
        'src',
        '/crops/banana-grand-naine.webp'
      );
    });

    // Trigger filter change so list comes back in reversed order [banana, ragi]
    fireEvent.click(screen.getByRole('button', { name: /^Recommended for My Soil$/i }));

    rerender(
      <LanguageProvider>
        <MemoryRouter>
          <CropLibraryPage />
        </MemoryRouter>
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(mockGetCatalog).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByAltText('Banana (Grand Naine)')).toHaveAttribute(
      'src',
      '/crops/banana-grand-naine.webp'
    );
    expect(screen.getByAltText('Finger Millet (Ragi)')).toHaveAttribute(
      'src',
      '/crops/finger-millet-ragi.webp'
    );
  });
});
