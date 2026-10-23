export interface WeatherDay {
  date: string;
  dayName: string;
  weatherCode: number;
  condition: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  rainChance: number;
  precipitationMm: number;
}

export interface WeatherData {
  location: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  temperature: number;
  condition: string;
  weatherCode: number;
  icon: string;
  humidity: number;
  windSpeedKmH: number;
  rainfallProbability: number;
  expectedPrecipitationMm: number;
  weekRange: string;
  nextWeekRange: string;
  nextWeekSummary: string;
  forecast7Days: WeatherDay[];
  forecast8To14Days: WeatherDay[];
  farmingAlert: string;
  farmingAlertKn: string;
  farmingAlertTa: string;
  farmingAlertTe: string;
  lastUpdated: string;
  isDemoFallback: boolean;
  dataSource: string;
}

// Map WMO codes to human labels and friendly icons
function interpretWmoCode(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear Sky', icon: 'sun' };
  if (code === 1 || code === 2) return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
  if (code === 3) return { condition: 'Overcast', icon: 'cloud' };
  if (code === 45 || code === 48) return { condition: 'Foggy / Dew', icon: 'cloud-fog' };
  if (code >= 51 && code <= 55) return { condition: 'Light Drizzle', icon: 'cloud-drizzle' };
  if (code >= 61 && code <= 65) return { condition: 'Rain Showers', icon: 'cloud-rain' };
  if (code >= 80 && code <= 82) return { condition: 'Heavy Rain', icon: 'cloud-lightning-rain' };
  if (code >= 95) return { condition: 'Thunderstorm', icon: 'cloud-lightning' };
  return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
}

export const DISTRICT_COORDINATES: Record<string, { lat: number; lon: number; state: string }> = {
  'Mandya': { lat: 12.524, lon: 76.896, state: 'Karnataka' },
  'Bengaluru': { lat: 12.971, lon: 77.594, state: 'Karnataka' },
  'Dharwad': { lat: 15.458, lon: 75.007, state: 'Karnataka' },
  'Belagavi': { lat: 15.849, lon: 74.497, state: 'Karnataka' },
  'Shivamogga': { lat: 13.929, lon: 75.568, state: 'Karnataka' },
  'Mysuru': { lat: 12.295, lon: 76.639, state: 'Karnataka' },
  'Hassan': { lat: 13.007, lon: 76.096, state: 'Karnataka' },
  'Coimbatore': { lat: 11.016, lon: 76.955, state: 'Tamil Nadu' },
  'Thanjavur': { lat: 10.786, lon: 79.137, state: 'Tamil Nadu' },
  'Madurai': { lat: 9.925, lon: 78.119, state: 'Tamil Nadu' },
  'Guntur': { lat: 16.306, lon: 80.436, state: 'Andhra Pradesh' },
  'Kurnool': { lat: 15.828, lon: 78.037, state: 'Andhra Pradesh' },
  'Warangal': { lat: 17.968, lon: 79.594, state: 'Telangana' },
  'Pune': { lat: 18.520, lon: 73.856, state: 'Maharashtra' },
};

export async function fetchWeatherData(districtName = 'Mandya', customLat?: number, customLon?: number): Promise<WeatherData> {
  const coord = DISTRICT_COORDINATES[districtName] || DISTRICT_COORDINATES['Mandya'];
  const lat = customLat ?? coord.lat;
  const lon = customLon ?? coord.lon;
  const state = coord.state || 'Karnataka';

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto&forecast_days=14`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`);
    }

    const data = (await res.json()) as any;
    const current = data.current;
    const daily = data.daily;

    const { condition, icon } = interpretWmoCode(current.weather_code);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const allDays: WeatherDay[] = daily.time.map((t: string, idx: number) => {
      const d = new Date(t);
      const code = daily.weather_code[idx] || 0;
      const { condition: dayCond, icon: dayIcon } = interpretWmoCode(code);
      return {
        date: t,
        dayName: idx === 0 ? 'Today' : dayNames[d.getDay()],
        weatherCode: code,
        condition: dayCond,
        icon: dayIcon,
        tempMax: Math.round(daily.temperature_2m_max[idx] || 30),
        tempMin: Math.round(daily.temperature_2m_min[idx] || 22),
        rainChance: Math.round(daily.precipitation_probability_max[idx] || 0),
        precipitationMm: parseFloat((daily.precipitation_sum[idx] || 0).toFixed(1)),
      };
    });

    const forecast7Days = allDays.slice(0, 7);
    const forecast8To14Days = allDays.slice(7, 14);

    const minT = Math.min(...forecast7Days.map(d => d.tempMin));
    const maxT = Math.max(...forecast7Days.map(d => d.tempMax));
    const nextMinT = Math.min(...forecast8To14Days.map(d => d.tempMin));
    const nextMaxT = Math.max(...forecast8To14Days.map(d => d.tempMax));

    // Determine upcoming rain advisory
    const rainyDay = forecast7Days.find(d => d.rainChance >= 45);
    let farmingAlert = 'Weather is favorable for standard field operations and weeding.';
    let farmingAlertKn = 'ಸಾಮಾನ್ಯ ಕೃಷಿ ಕೆಲಸಗಳಿಗೆ ಮತ್ತು ಕಳೆ ತೆಗೆಯಲು ಹವಾಮಾನ ಅನುಕೂಲಕರವಾಗಿದೆ.';
    let farmingAlertTa = 'நில உழவு மற்றும் களை எடுப்பதற்கு வானிலை சாதகமாக உள்ளது.';
    let farmingAlertTe = 'పొలం పనులకు మరియు కలుపు తీతకు వాతావరణం అనుకూలంగా ఉంది.';

    if (rainyDay) {
      farmingAlert = `Rain expected on ${rainyDay.dayName} (${rainyDay.rainChance}% chance). Consider completing field spraying before rain.`;
      farmingAlertKn = `${rainyDay.dayName} ರಂದು ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ (${rainyDay.rainChance}% ಸಂಭವ). ಮಳೆ ಬರುವ ಮುನ್ನ ಸಿಂಪಡಣೆ ಕಾರ್ಯ ಮುಗಿಸಿ.`;
      farmingAlertTa = `${rainyDay.dayName} அன்று மழை பெய்ய வாய்ப்புள்ளது (${rainyDay.rainChance}%). மழைக்கு முன் தெளிப்பு பணிகளை முடிக்கவும்.`;
      farmingAlertTe = `${rainyDay.dayName} నాడు వర్షం పడే అవకాశం ఉంది (${rainyDay.rainChance}%). వర్షానికి ముందే మందుల పిచికారీ పూర్తి చేయండి.`;
    }

    return {
      location: `${districtName}, ${state}`,
      state,
      district: districtName,
      latitude: lat,
      longitude: lon,
      temperature: Math.round(current.temperature_2m),
      condition,
      weatherCode: current.weather_code,
      icon,
      humidity: Math.round(current.relative_humidity_2m),
      windSpeedKmH: Math.round(current.wind_speed_10m),
      rainfallProbability: forecast7Days[0]?.rainChance || 0,
      expectedPrecipitationMm: forecast7Days[0]?.precipitationMm || 0,
      weekRange: `${minT}° - ${maxT}°`,
      nextWeekRange: `${nextMinT}° - ${nextMaxT}°`,
      nextWeekSummary: forecast8To14Days.some(d => d.rainChance > 40) ? 'Light Rain' : 'Partly Cloudy',
      forecast7Days,
      forecast8To14Days,
      farmingAlert,
      farmingAlertKn,
      farmingAlertTa,
      farmingAlertTe,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDemoFallback: false,
      dataSource: 'Live Open-Meteo API',
    };
  } catch (err) {
    // Return high-fidelity local demo fallback clearly labeled
    return getDemoFallbackWeather(districtName, state, lat, lon);
  }
}

function getDemoFallbackWeather(district: string, state: string, lat: number, lon: number): WeatherData {
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const sampleDays: WeatherDay[] = [
    { date: '2026-10-15', dayName: 'Today', weatherCode: 2, condition: 'Partly Cloudy', icon: 'cloud-sun', tempMax: 28, tempMin: 21, rainChance: 35, precipitationMm: 0.5 },
    { date: '2026-10-16', dayName: 'Fri', weatherCode: 1, condition: 'Mainly Sunny', icon: 'sun', tempMax: 29, tempMin: 20, rainChance: 15, precipitationMm: 0.0 },
    { date: '2026-10-17', dayName: 'Sat', weatherCode: 2, condition: 'Partly Cloudy', icon: 'cloud-sun', tempMax: 28, tempMin: 21, rainChance: 25, precipitationMm: 0.2 },
    { date: '2026-10-18', dayName: 'Sun', weatherCode: 3, condition: 'Overcast', icon: 'cloud', tempMax: 27, tempMin: 22, rainChance: 40, precipitationMm: 1.2 },
    { date: '2026-10-19', dayName: 'Mon', weatherCode: 61, condition: 'Light Rain', icon: 'cloud-rain', tempMax: 26, tempMin: 21, rainChance: 65, precipitationMm: 8.4 },
    { date: '2026-10-20', dayName: 'Tue', weatherCode: 95, condition: 'Thunderstorm', icon: 'cloud-lightning', tempMax: 25, tempMin: 20, rainChance: 70, precipitationMm: 14.2 },
    { date: '2026-10-21', dayName: 'Wed', weatherCode: 2, condition: 'Clearing Sky', icon: 'cloud-sun', tempMax: 28, tempMin: 21, rainChance: 20, precipitationMm: 0.1 },
  ];

  const sampleNextWeek: WeatherDay[] = [
    { date: '2026-10-22', dayName: 'Thu', weatherCode: 1, condition: 'Sunny', icon: 'sun', tempMax: 30, tempMin: 22, rainChance: 10, precipitationMm: 0.0 },
    { date: '2026-10-23', dayName: 'Fri', weatherCode: 1, condition: 'Sunny', icon: 'sun', tempMax: 30, tempMin: 22, rainChance: 15, precipitationMm: 0.0 },
    { date: '2026-10-24', dayName: 'Sat', weatherCode: 2, condition: 'Partly Cloudy', icon: 'cloud-sun', tempMax: 29, tempMin: 21, rainChance: 20, precipitationMm: 0.0 },
    { date: '2026-10-25', dayName: 'Sun', weatherCode: 2, condition: 'Partly Cloudy', icon: 'cloud-sun', tempMax: 29, tempMin: 21, rainChance: 25, precipitationMm: 0.2 },
    { date: '2026-10-26', dayName: 'Mon', weatherCode: 3, condition: 'Overcast', icon: 'cloud', tempMax: 28, tempMin: 21, rainChance: 35, precipitationMm: 0.8 },
    { date: '2026-10-27', dayName: 'Tue', weatherCode: 61, condition: 'Light Shower', icon: 'cloud-drizzle', tempMax: 27, tempMin: 20, rainChance: 50, precipitationMm: 4.5 },
    { date: '2026-10-28', dayName: 'Wed', weatherCode: 1, condition: 'Sunny', icon: 'sun', tempMax: 29, tempMin: 21, rainChance: 10, precipitationMm: 0.0 },
  ];

  return {
    location: `${district}, ${state}`,
    state,
    district,
    latitude: lat,
    longitude: lon,
    temperature: 28,
    condition: 'Partly Cloudy',
    weatherCode: 2,
    icon: 'cloud-sun',
    humidity: 68,
    windSpeedKmH: 14,
    rainfallProbability: 40,
    expectedPrecipitationMm: 1.5,
    weekRange: '25° - 31°',
    nextWeekRange: '22° - 30°',
    nextWeekSummary: 'Light Rain',
    forecast7Days: sampleDays,
    forecast8To14Days: sampleNextWeek,
    farmingAlert: 'Rain expected on Monday & Tuesday (65-70% chance). Consider completing field spraying and harvesting before rain.',
    farmingAlertKn: 'ಸೋಮವಾರ ಮತ್ತು ಮಂಗಳವಾರ ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ (65-70% ಸಂಭವ). ಮಳೆ ಬರುವ ಮುನ್ನ ಸಿಂಪಡಣೆ ಕಾರ್ಯ ಪೂರ್ಣಗೊಳಿಸಿ.',
    farmingAlertTa: 'திங்கள் மற்றும் செவ்வாய்க்கிழமைகளில் மழை வாய்ப்பு (65-70%). மழைக்கு முன் தெளிப்பு பணிகளை முடிக்கவும்.',
    farmingAlertTe: 'సోమవారం, మంగళవారం వర్ష సూచన (65-70%). వర్షానికి ముందే పిచికారీ పనులు పూర్తి చేయండి.',
    lastUpdated: 'Updated 10 mins ago (Local Demo Data)',
    isDemoFallback: true,
    dataSource: 'Local Demo Fallback Data (Offline Simulation)',
  };
}
