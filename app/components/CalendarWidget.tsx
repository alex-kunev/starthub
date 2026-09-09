'use client';

import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/config';

interface CalendarEvent {
  summary: string;
  start: string;
}

type ErrorState = 'not-configured' | 'fetch-failed' | null;

export default function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [error, setError] = useState<ErrorState>(null);

  useEffect(() => {
    if (!siteConfig.calendarApiUrl) {
      setError('not-configured');
      return;
    }

    fetch(siteConfig.calendarApiUrl)
      .then((res) => res.json())
      .then((json) => setEvents(json.events ?? []))
      .catch(() => setError('fetch-failed'));
  }, []);

  return (
    <div className="widget calendar-widget">
      <h2>Calendar</h2>
      {error === 'not-configured' && (
        <p>
          Not configured — set <code>NEXT_PUBLIC_CALENDAR_API_URL</code> to point at the
          calendar-proxy service (see <code>server/calendar-proxy.js</code>).
        </p>
      )}
      {error === 'fetch-failed' && <p>Unable to reach the calendar service.</p>}
      {!error && !events && <p>Loading…</p>}
      {events && events.length === 0 && <p>No upcoming events.</p>}
      {events && events.length > 0 && (
        <ul>
          {events.map((event, i) => (
            <li key={`${event.summary}-${event.start}-${i}`}>
              <strong>{event.summary}</strong> — {new Date(event.start).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
