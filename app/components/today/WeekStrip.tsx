'use client';

import { useEffect, useState } from 'react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

export default function WeekStrip() {
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  if (!today) {
    return <div className="week-strip" aria-hidden="true" />;
  }

  const week = getWeekDates(today);

  return (
    <div className="week-strip">
      {week.map((d, i) => (
        <div
          key={d.toISOString()}
          className={`week-day${d.toDateString() === today.toDateString() ? ' week-day-today' : ''}`}
        >
          <span className="week-day-label">{DAY_LABELS[i]}</span>
          <span className="week-day-number">{d.getDate()}</span>
        </div>
      ))}
    </div>
  );
}
