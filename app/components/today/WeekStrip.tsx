'use client';

import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/config';
import { weatherIcon, weatherLabel } from '@/lib/weather';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DayWeather {
  code: number;
  max: number;
  min: number;
}

function getWeekDates(today: Date): Date[] {
  const mondayOffset = (today.getDay() + 6) % 7; // getDay() is 0=Sunday; shift to 0=Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// Matches Open-Meteo's daily.time format (YYYY-MM-DD in the location's timezone).
function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function WeekStrip() {
  const [today, setToday] = useState<Date | null>(null);
  const [weather, setWeather] = useState<Record<string, DayWeather>>({});

  useEffect(() => {
    setToday(new Date());

    // past_days covers the days of this week that have already gone by
    // (Mon..yesterday), forecast_days the rest — so every cell can be filled.
    const { latitude, longitude } = siteConfig.weather;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&past_days=6&forecast_days=7`;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        const daily = json.daily;
        const byDate: Record<string, DayWeather> = {};
        (daily?.time ?? []).forEach((t: string, i: number) => {
          byDate[t] = {
            code: daily.weathercode[i],
            max: daily.temperature_2m_max[i],
            min: daily.temperature_2m_min[i],
          };
        });
        setWeather(byDate);
      })
      .catch(() => {
        // The calendar still works without weather — fail quietly.
      });
  }, []);

  if (!today) {
    return <div className="week-strip" aria-hidden="true" />;
  }

  const week = getWeekDates(today);

  return (
    <div className="week-strip">
      {week.map((d, i) => {
        const w = weather[dateKey(d)];
        const isToday = d.toDateString() === today.toDateString();
        const isPast = !isToday && d < today;
        return (
          <div
            key={d.toISOString()}
            className={`week-day${isToday ? ' week-day-today' : ''}${isPast ? ' week-day-past' : ''}`}
          >
            <span className="week-day-label">{DAY_LABELS[i]}</span>
            <span className="week-day-number">{d.getDate()}</span>
            {w && (
              <>
                <span className="week-day-icon" title={weatherLabel(w.code)}>{weatherIcon(w.code)}</span>
                <span className="week-day-temps">
                  <strong>{Math.round(w.max)}°</strong> <span className="week-day-min">{Math.round(w.min)}°</span>
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
