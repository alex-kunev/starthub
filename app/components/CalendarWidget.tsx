'use client';

import { useEffect, useState } from 'react';

interface CalendarEvent {
  summary: string;
  start: string;
}

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; events: CalendarEvent[] };

export default function CalendarWidget() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    // /api/calendar is served by api/calendar.js on Vercel (zero-config)
    // and by netlify/functions/calendar.js via a redirect on Netlify — see
    // netlify.toml. Either way, the calendar's secret ICS URL stays
    // server-side (CALENDAR_ICS_URL env var) and never reaches the client.
    fetch('/api/calendar')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json) => setState({ status: 'ready', events: json.events ?? [] }))
      .catch((err) => {
        console.error('Calendar: fetch failed', err);
        setState({ status: 'error' });
      });
  }, []);

  return (
    <div className="widget calendar-widget">
      <h2>📅 Calendar</h2>
      {state.status === 'loading' && <p className="muted">Loading…</p>}
      {state.status === 'error' && <p className="muted">Unable to load calendar events.</p>}
      {state.status === 'ready' && state.events.length === 0 && <p className="muted">No upcoming events.</p>}
      {state.status === 'ready' && state.events.length > 0 && (
        <ul className="events-list">
          {state.events.map((event, i) => (
            <li key={`${event.start}-${i}`}>
              <strong>
                {new Date(event.start).toLocaleString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>{' '}
              — {event.summary}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
