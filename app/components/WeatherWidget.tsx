'use client';

import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/config';
import { aqiLabel, weatherIcon, weatherLabel } from '@/lib/weather';

interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
}

interface DailyForecast {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

interface AirQuality {
  aqi: number;
  label: string;
}

type ForecastState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; current: CurrentWeather; daily: DailyForecast };

function closestIndex(times: string[]): number {
  const now = Date.now();
  let best = 0;
  let bestDiff = Infinity;
  times.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  });
  return best;
}

export default function WeatherWidget() {
  const [forecast, setForecast] = useState<ForecastState>({ status: 'loading' });
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);

  useEffect(() => {
    const { latitude, longitude } = siteConfig.weather;

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
    fetch(forecastUrl)
      .then((res) => res.json())
      .then((json) => setForecast({ status: 'ready', current: json.current_weather, daily: json.daily }))
      .catch(() => setForecast({ status: 'error' }));

    // Air quality is on a separate Open-Meteo host from the weather forecast.
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=european_aqi&timezone=auto`;
    fetch(aqiUrl)
      .then((res) => res.json())
      .then((json) => {
        const times: string[] = json?.hourly?.time ?? [];
        const values: number[] = json?.hourly?.european_aqi ?? [];
        if (times.length === 0) return;
        const aqi = values[closestIndex(times)];
        if (typeof aqi === 'number') setAirQuality({ aqi, label: aqiLabel(aqi) });
      })
      .catch(() => {
        // Air quality is a bonus on top of the core forecast — fail quietly.
      });
  }, []);

  return (
    <div className="widget weather-widget">
      <h2>🌦️ Weather — {siteConfig.weather.label}</h2>

      {forecast.status === 'loading' && <p className="muted">Loading…</p>}
      {forecast.status === 'error' && <p className="muted">Unable to load weather.</p>}

      {forecast.status === 'ready' && (
        <>
          <div className="weather-current">
            <span className="weather-icon">{weatherIcon(forecast.current.weathercode)}</span>
            <div>
              <div className="weather-temp">{Math.round(forecast.current.temperature)}°C</div>
              <div className="muted">
                {weatherLabel(forecast.current.weathercode)} · Wind {Math.round(forecast.current.windspeed)} km/h
              </div>
            </div>
            {airQuality && (
              <span className={`aqi-badge aqi-${airQuality.label.toLowerCase().replace(/\s+/g, '-')}`}>
                Air quality: {airQuality.label} ({airQuality.aqi})
              </span>
            )}
          </div>

          <div className="forecast-strip">
            {forecast.daily.time.map((day, i) => (
              <div className="forecast-day" key={day}>
                <span className="forecast-day-label">
                  {i === 0 ? 'Today' : new Date(day).toLocaleDateString([], { weekday: 'short' })}
                </span>
                <span className="forecast-icon">{weatherIcon(forecast.daily.weathercode[i])}</span>
                <span className="forecast-temps">
                  <strong>{Math.round(forecast.daily.temperature_2m_max[i])}°</strong>{' '}
                  <span className="muted">{Math.round(forecast.daily.temperature_2m_min[i])}°</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
