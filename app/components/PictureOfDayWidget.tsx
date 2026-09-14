'use client';

import { useEffect, useState } from 'react';

interface Photo {
  url: string;
  title: string;
  credit: string;
  filePage: string;
}

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; photo: Photo };

export default function PictureOfDayWidget() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    // Wikimedia Commons' own "Picture of the Day", via Wikipedia's public
    // REST API — free, no key, and frequently a nature/landscape photo.
    const url = `https://en.wikipedia.org/api/rest_v1/media/image/featured/${yyyy}/${mm}/${dd}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        const source = json.image?.source;
        if (!source) throw new Error('no image');
        setState({
          status: 'ready',
          photo: {
            url: source,
            title: json.title?.replace(/^File:/, '') ?? 'Picture of the day',
            credit: json.artist?.text ?? 'Wikimedia Commons',
            filePage: json.file_page ?? 'https://commons.wikimedia.org/wiki/Main_Page',
          },
        });
      })
      .catch(() => setState({ status: 'error' }));
  }, []);

  return (
    <div className="widget photo-widget">
      <h2>🖼️ Picture of the Day</h2>
      {state.status === 'loading' && <p className="muted">Loading…</p>}
      {state.status === 'error' && (
        <p className="muted">
          Unable to load today&apos;s picture.{' '}
          <a href="https://commons.wikimedia.org/wiki/Main_Page" target="_blank" rel="noreferrer">
            Browse Wikimedia Commons →
          </a>
        </p>
      )}
      {state.status === 'ready' && (
        <figure>
          <a href={state.photo.filePage} target="_blank" rel="noreferrer">
            <img src={state.photo.url} alt={state.photo.title} />
          </a>
          <figcaption>{state.photo.credit} · Wikimedia Commons</figcaption>
        </figure>
      )}
    </div>
  );
}
