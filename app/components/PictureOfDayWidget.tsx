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
// endpoints below, so pull whichever fields are actually present rather
// than assuming one fixed shape.
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

function fetchPhoto(url: string): Promise<Photo> {
  return fetch(url)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((json) => {
      // The featured-content feed nests the picture under "image";
      // the media endpoint returns it directly.
      const photo = normalizePhoto(json.image ?? json);
      if (!photo) throw new Error('no image in response');
      return photo;
    });
}

export default function PictureOfDayWidget() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    // Wikimedia Commons' own "Picture of the Day", via Wikipedia's public
    // REST API — free, no key. Plain Promise chaining here (no
    // async/await) — a static-export build of an async/await + for-of
    // combination was shipping code that referenced regeneratorRuntime
    // without defining it, breaking this widget in production.
    const featuredFeedUrl = `https://en.wikipedia.org/api/rest_v1/feed/featured/${yyyy}/${mm}/${dd}`;
    const mediaImageUrl = `https://en.wikipedia.org/api/rest_v1/media/image/featured/${yyyy}/${mm}/${dd}`;

    fetchPhoto(featuredFeedUrl)
      .catch((err) => {
        console.error('Picture of the Day: fetch failed for', featuredFeedUrl, err);
        return fetchPhoto(mediaImageUrl);
      })
      .then((photo) => setState({ status: 'ready', photo }))
      .catch((err) => {
        console.error('Picture of the Day: fetch failed for', mediaImageUrl, err);
        setState({ status: 'error' });
      });
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
