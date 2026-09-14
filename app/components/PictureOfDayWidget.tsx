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

// The image object's shape differs slightly between the two Wikimedia
// endpoints we try below, so pull whichever fields are actually present
// rather than assuming one fixed shape.
function normalizePhoto(raw: any): Photo | null {
  const source = raw?.image?.source ?? raw?.thumbnail?.source ?? raw?.originalimage?.source;
  if (!source) return null;

  return {
    url: source,
    title: (raw.title as string | undefined)?.replace(/^File:/, '') ?? 'Picture of the day',
    credit: raw.artist?.text ?? raw.credit?.text ?? 'Wikimedia Commons',
    filePage: raw.file_page ?? raw.filePage ?? 'https://commons.wikimedia.org/wiki/Main_Page',
  };
}

export default function PictureOfDayWidget() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    // Wikimedia Commons' own "Picture of the Day", via Wikipedia's public
    // REST API — free, no key. Two endpoints can serve it; try the fuller
    // "featured content" feed first, then the narrower media endpoint.
    const urls = [
      `https://en.wikipedia.org/api/rest_v1/feed/featured/${yyyy}/${mm}/${dd}`,
      `https://en.wikipedia.org/api/rest_v1/media/image/featured/${yyyy}/${mm}/${dd}`,
    ];

    (async () => {
      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json = await res.json();
          // The featured-content feed nests the picture under "image";
          // the media endpoint returns it directly.
          const photo = normalizePhoto(json.image ?? json);
          if (photo) {
            setState({ status: 'ready', photo });
            return;
          }
        } catch (err) {
          console.error('Picture of the Day: fetch failed for', url, err);
        }
      }
      setState({ status: 'error' });
    })();
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
