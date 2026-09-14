'use client';

import { useEffect, useState } from 'react';

interface WikiEvent {
  text: string;
  year: number;
}

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; events: WikiEvent[] };

export default function EventsOfDay() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        const events: WikiEvent[] = (json.events ?? [])
          .slice()
          .sort((a: WikiEvent, b: WikiEvent) => b.year - a.year)
          .slice(0, 4);
        if (events.length === 0) throw new Error('no events');
        setState({ status: 'ready', events });
      })
      .catch(() => setState({ status: 'error' }));
  }, []);

  return (
    <div className="today-block">
      <h3>📜 On This Day</h3>
      {state.status === 'loading' && <p className="muted">Loading…</p>}
      {state.status === 'error' && <p className="muted">Unable to load events.</p>}
      {state.status === 'ready' && (
        <ul className="events-list">
          {state.events.map((event) => (
            <li key={`${event.year}-${event.text.slice(0, 20)}`}>
              <strong>{event.year}</strong> — {event.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
