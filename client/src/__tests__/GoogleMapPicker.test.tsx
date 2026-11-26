import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoogleMapPicker } from '../components/location/GoogleMapPicker';
import { LocationEditModal } from '../components/location/LocationEditModal';
import { LanguageProvider } from '../context/LanguageContext';
import { ToastProvider } from '../context/ToastContext';

vi.mock('../services/api', () => ({
  api: {
    weather: {
      getLocationConditions: vi.fn().mockResolvedValue({
        location: {
          state: 'Karnataka',
          district: 'Mandya',
          taluk: 'Maddur',
          village: 'Koppa',
          agroZone: 'Southern Dry Zone',
          agroZoneDescription: 'Canal-irrigated Cauvery basin with high paddy and sugarcane productivity.',
          typicalSoils: ['red', 'loamy', 'alluvial'],
        },
      }),
    },
    location: {
      reverseGeocode: vi.fn().mockResolvedValue({
        state: 'Karnataka',
        district: 'Mandya',
        town: 'Maddur',
        village: 'Koppa',
      }),
    },
    auth: {
      updateProfile: vi.fn().mockResolvedValue({
        state: 'Karnataka',
        district: 'Mandya',
        village: 'Koppa',
        latitude: 12.5244,
        longitude: 76.8969,
      }),
    },
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user',
      name: 'Ramesh Kumar',
      state: 'Karnataka',
      district: 'Mandya',
      village: 'Koppa',
      latitude: 12.5244,
      longitude: 76.8969,
      locationSource: 'gps',
    },
    updateUser: vi.fn(),
  }),
}));

function renderPicker(props: any = {}) {
  return render(
    <LanguageProvider>
      <ToastProvider>
        <GoogleMapPicker {...props} />
      </ToastProvider>
    </LanguageProvider>
  );
}

describe('GoogleMapPicker — Google Map Pinpoint & Map Modes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Google Map Picker with 4 distinct map modes: Hybrid, Satellite, Terrain, Roadmap', async () => {
    renderPicker();

    // Verify all 4 map modes are present
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
    expect(screen.getByText('Satellite')).toBeInTheDocument();
    expect(screen.getByText('Terrain')).toBeInTheDocument();
    expect(screen.getByText('Roadmap')).toBeInTheDocument();

    // Verify default active mode is Hybrid
    const hybridBtn = screen.getByText('Hybrid').closest('button');
    expect(hybridBtn).toHaveClass('bg-forest');
  });

  it('switches map modes when clicking Satellite, Terrain, Roadmap buttons', async () => {
    renderPicker();

    const satelliteBtn = screen.getByText('Satellite').closest('button');
    expect(satelliteBtn).toBeInTheDocument();
    fireEvent.click(satelliteBtn!);

    // Now Satellite should have active styles
    expect(satelliteBtn).toHaveClass('bg-forest');

    const terrainBtn = screen.getByText('Terrain').closest('button');
    fireEvent.click(terrainBtn!);
    expect(terrainBtn).toHaveClass('bg-forest');
  });

  it('renders zoom in, zoom out, search bar, and GPS locate controls', async () => {
    renderPicker();

    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
    expect(screen.getByLabelText('Search farm location')).toBeInTheDocument();
    expect(screen.getByTitle('Detect my location')).toBeInTheDocument();
  });

  it('displays agricultural context card with Agro-Climatic zone and common soils', async () => {
    renderPicker({ initialLat: 12.5244, initialLon: 76.8969, initialDistrict: 'Mandya' });

    await waitFor(() => {
      expect(screen.getByText(/Southern Dry Zone/i)).toBeInTheDocument();
      expect(screen.getByText(/red soil/i)).toBeInTheDocument();
      expect(screen.getByText(/loamy soil/i)).toBeInTheDocument();
    });
  });

  it('searches for Karnataka location and updates pin coordinates', async () => {
    const onLocationSelected = vi.fn();
    renderPicker({ onLocationSelected });

    const searchInput = screen.getByLabelText('Search farm location');
    fireEvent.change(searchInput, { target: { value: 'Mysuru' } });
    fireEvent.submit(searchInput.closest('form')!);

    await waitFor(() => {
      expect(onLocationSelected).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: expect.any(Number),
          longitude: expect.any(Number),
        })
      );
    });
  });
});

describe('LocationEditModal — Map Pinpoint Tab Integration', () => {
  it('renders both Pin on Map and Select from List tabs', async () => {
    render(
      <LanguageProvider>
        <ToastProvider>
          <LocationEditModal isOpen={true} onClose={vi.fn()} />
        </ToastProvider>
      </LanguageProvider>
    );

    expect(screen.getByText('📍 Pin on Map')).toBeInTheDocument();
    expect(screen.getByText('📋 Select from List')).toBeInTheDocument();

    // Default tab is Map: Google Map modes should be visible
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
    expect(screen.getByText('Satellite')).toBeInTheDocument();

    // Switching to manual dropdowns
    fireEvent.click(screen.getByText('📋 Select from List'));
    expect(screen.getByLabelText('State *')).toBeInTheDocument();
    expect(screen.getByLabelText('District *')).toBeInTheDocument();
  });
});
