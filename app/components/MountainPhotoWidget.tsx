'use client';

import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/config';

const STORAGE_KEY = 'starthub-mountain-photo';

interface StoredPhoto {
  date: string;
  url: string;
  credit: string;
  creditUrl: string;
}

export default function MountainPhotoWidget() {
  const [photo, setPhoto] = useState<StoredPhoto | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    if (!siteConfig.unsplashAccessKey) {
      setNotConfigured(true);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    // Cache the day's photo in localStorage so a page reload doesn't spend
    // another request against Unsplash's rate limit.
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed: StoredPhoto = JSON.parse(cached);
        if (parsed.date === today) {
          setPhoto(parsed);
          return;
        }
      }
    } catch {
      // localStorage unavailable or corrupt — fall through to a fresh fetch
    }

    fetch(
      `https://api.unsplash.com/photos/random?query=mountain&orientation=landscape&client_id=${siteConfig.unsplashAccessKey}`
    )
      .then((res) => res.json())
      .then((json) => {
        const next: StoredPhoto = {
          date: today,
          url: json.urls?.regular,
          credit: json.user?.name ?? 'Unsplash',
          creditUrl: json.user?.links?.html ?? 'https://unsplash.com',
        };
        setPhoto(next);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // localStorage unavailable — skip caching
        }
      })
      .catch(() => setNotConfigured(true));
  }, []);

  return (
    <div className="widget photo-widget">
      <h2>Mountain of the Day</h2>
      {notConfigured && (
        <p>
          Not configured — set <code>NEXT_PUBLIC_UNSPLASH_ACCESS_KEY</code> to enable this widget.
        </p>
      )}
      {!notConfigured && !photo && <p>Loading…</p>}
      {photo?.url && (
        <figure>
          <img src={photo.url} alt="Mountain of the day" />
          <figcaption>
            Photo by <a href={photo.creditUrl}>{photo.credit}</a> on Unsplash
          </figcaption>
        </figure>
      )}
    </div>
  );
}
