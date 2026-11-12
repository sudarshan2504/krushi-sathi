import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageProvider } from '../context/LanguageContext';
import { WeatherWidget, clearWeatherWidgetCache } from '../components/weather/WeatherWidget';
import { WeatherData } from '../types';

const mockWeatherGet = vi.fn();

vi.mock('../services/api', () => ({
  api: {
    weather: {
      get: (...args: any[]) => mockWeatherGet(...args),
    },
  },
}));

const sampleWeather = (overrides: Partial<WeatherData> = {}): WeatherData => ({
  location: 'Chennai, Tamil Nadu',
  state: 'Tamil Nadu',
  district: 'Chennai',
  latitude: 13.0827,
  longitude: 80.2707,
  temperature: 31,
  humidity: 64,
  windSpeedKmH: 12,
  rainfallProbability: 15,
  expectedPrecipitationMm: 0,
  condition: 'Partly Cloudy',
  weatherCode: 2,
  icon: 'cloud-sun',
  weekRange: 'Nov 10 – Nov 16',
  nextWeekRange: 'Nov 17 – Nov 23',
  nextWeekSummary: 'Mild sunny weather expected next week.',
  farmingAlert: 'Morning irrigation advised. Check soil moisture in upper 10cm.',
  farmingAlertKn: 'ಬೆಳಿಗ್ಗೆ ನೀರಾವರಿ ಸೂಕ್ತ.',
  farmingAlertTa: 'காலை நீர்ப்பாசனம் பரிந்துரைக்கப்படுகிறது.',
  farmingAlertTe: 'ఉదయం నీటిపారుదల మంచిది.',
  lastUpdated: '10:30 AM',
  dataSource: 'Open-Meteo',
  isDemoFallback: false,
  forecast7Days: [
    { date: '2026-11-10', dayName: 'Today', condition: 'Partly Cloudy', icon: 'cloud-sun', tempMax: 31, tempMin: 24, rainChance: 15, weatherCode: 2, precipitationMm: 0 },
    { date: '2026-11-11', dayName: 'Wed', condition: 'Sunny', icon: 'sun', tempMax: 32, tempMin: 25, rainChance: 10, weatherCode: 0, precipitationMm: 0 },
    { date: '2026-11-12', dayName: 'Thu', condition: 'Showers', icon: 'cloud-rain', tempMax: 29, tempMin: 23, rainChance: 60, weatherCode: 61, precipitationMm: 4.5 },
    { date: '2026-11-13', dayName: 'Fri', condition: 'Partly Cloudy', icon: 'cloud-sun', tempMax: 30, tempMin: 24, rainChance: 25, weatherCode: 2, precipitationMm: 0.5 },
    { date: '2026-11-14', dayName: 'Sat', condition: 'Sunny', icon: 'sun', tempMax: 32, tempMin: 25, rainChance: 5, weatherCode: 0, precipitationMm: 0 },
  ],
  forecast8To14Days: [],
  ...overrides,
});

function setGeolocationMock(
  impl: (success: PositionCallback, error?: PositionErrorCallback | null, options?: PositionOptions) => void
) {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    writable: true,
    value: {
      getCurrentPosition: vi.fn(impl),
      watchPosition: vi.fn(() => 1),
      clearWatch: vi.fn(),
    },
  });
}

describe('WeatherWidget', () => {
  beforeEach(() => {
    localStorage.clear();
    clearWeatherWidgetCache();
    mockWeatherGet.mockReset();
  });

  it('shows initial loading state and uses live GPS coordinates when geolocation succeeds', async () => {
    let successCb: PositionCallback | null = null;
    setGeolocationMock((success) => {
      successCb = success;
    });

    mockWeatherGet.mockResolvedValueOnce(sampleWeather());

    render(
      <LanguageProvider>
        <WeatherWidget initialDistrict="Mandya" />
      </LanguageProvider>
    );

    expect(screen.getByRole('status')).toHaveTextContent(/Fetching local farm weather/i);

    // Resolve geolocation asynchronously with Chennai coordinates
    successCb!({
      coords: {
        latitude: 13.0827,
        longitude: 80.2707,
        accuracy: 25,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({}),
      },
      timestamp: Date.now(),
      toJSON: () => ({}),
    });

    await waitFor(() => {
      expect(screen.getByTestId('weather-location-label')).toHaveTextContent('Chennai, Tamil Nadu');
    });

    expect(mockWeatherGet).toHaveBeenCalledWith(undefined, 13.0827, 80.2707);
    expect(screen.getByText(/31°C/)).toBeInTheDocument();
    expect(screen.getByText(/Open-Meteo/i)).toBeInTheDocument();
    expect(screen.queryByTestId('weather-fallback-hint')).toBeNull();
  });

  it('falls back transparently to registered district when geolocation is denied and lets user retry GPS', async () => {
    let geoCalls = 0;
    setGeolocationMock((success, error) => {
      geoCalls += 1;
      if (geoCalls === 1) {
        error?.({
          code: 1,
          message: 'User denied Geolocation',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      } else {
        success({
          coords: {
            latitude: 12.2958,
            longitude: 76.6394,
            accuracy: 20,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON: () => ({}),
          },
          timestamp: Date.now(),
          toJSON: () => ({}),
        });
      }
    });

    mockWeatherGet
      .mockResolvedValueOnce(
        sampleWeather({ location: 'Mysuru, Karnataka', district: 'Mysuru', temperature: 27 })
      )
      .mockResolvedValueOnce(
        sampleWeather({ location: 'Mysuru Palace Area, Karnataka', district: 'Mysuru', temperature: 28 })
      );

    render(
      <LanguageProvider>
        <WeatherWidget initialDistrict="Mysuru" />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('weather-fallback-hint')).toHaveTextContent(
        'Using your registered location (Mysuru)'
      );
    });
    expect(mockWeatherGet).toHaveBeenNthCalledWith(1, 'Mysuru');

    const retryLocationBtn = screen.getByRole('button', { name: /Use my current location/i });
    fireEvent.click(retryLocationBtn);

    await waitFor(() => {
      expect(mockWeatherGet).toHaveBeenNthCalledWith(2, undefined, 12.2958, 76.6394);
    });
    expect(screen.queryByTestId('weather-fallback-hint')).toBeNull();
    expect(screen.getByTestId('weather-location-label')).toHaveTextContent('Mysuru Palace Area, Karnataka');
  });

  it('renders an explicit error with Retry button (no silent demo data) and recovers on retry', async () => {
    setGeolocationMock((success) => {
      success({
        coords: {
          latitude: 12.52,
          longitude: 76.89,
          accuracy: 30,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: Date.now(),
        toJSON: () => ({}),
      });
    });

    mockWeatherGet
      .mockRejectedValueOnce(new Error('Open-Meteo upstream timeout'))
      .mockResolvedValueOnce(sampleWeather({ location: 'Mandya, Karnataka', temperature: 29 }));

    render(
      <LanguageProvider>
        <WeatherWidget initialDistrict="Mandya" />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Weather Unavailable')).toBeInTheDocument();
    });
    expect(screen.getByText('Open-Meteo upstream timeout')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /^Retry$/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByTestId('weather-location-label')).toHaveTextContent('Mandya, Karnataka');
    });
  });

  it('shows a visible "Sample data" badge when response indicates isDemoFallback', async () => {
    setGeolocationMock((success) => {
      success({
        coords: {
          latitude: 12.9716,
          longitude: 77.5946,
          accuracy: 15,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: Date.now(),
        toJSON: () => ({}),
      });
    });

    mockWeatherGet.mockResolvedValueOnce(
      sampleWeather({
        location: 'Bengaluru, Karnataka',
        isDemoFallback: true,
        dataSource: 'Demo Fallback',
      })
    );

    render(
      <LanguageProvider>
        <WeatherWidget />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sample data')).toBeInTheDocument();
    });
    expect(screen.getByTestId('weather-location-label')).toHaveTextContent('Bengaluru, Karnataka');
  });
});
