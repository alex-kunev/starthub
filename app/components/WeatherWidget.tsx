'use client';

import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/config';

interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
}

// Subset of the WMO weather codes Open-Meteo returns — enough for a
// one-line summary, not the full table.
const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  95: 'Thunderstorm',
};

export default function WeatherWidget() {
  const [data, setData] = useState<CurrentWeather | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const { latitude, longitude } = siteConfig.weather;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => setData(json.current_weather))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="widget weather-widget">
      <h2>Weather — {siteConfig.weather.label}</h2>
      {error && <p>Unable to load weather.</p>}
      {!error && !data && <p>Loading…</p>}
      {data && (
        <p>
          {Math.round(data.temperature)}°C, {WEATHER_CODES[data.weathercode] ?? 'Unknown conditions'}
          <br />
          Wind: {Math.round(data.windspeed)} km/h
        </p>
      )}
    </div>
  );
}
