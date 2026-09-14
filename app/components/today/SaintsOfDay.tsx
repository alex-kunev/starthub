'use client';

import { useEffect, useState } from 'react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; extract: string };

export default function SaintsOfDay() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [pageTitle, setPageTitle] = useState('');
  const [ocaUrl, setOcaUrl] = useState('https://www.oca.org/saints/lives');

  useEffect(() => {
    const now = new Date();
    const title = `${MONTHS[now.getMonth()]}_${now.getDate()}`;
    setPageTitle(title);

    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setOcaUrl(`https://www.oca.org/saints/lives/${y}/${m}/${d}`);

    // OrthodoxWiki runs on MediaWiki, which supports cross-origin API
    // requests via an explicit origin=* parameter — no proxy needed. The
    // API script's path varies between MediaWiki installs (root vs "/w/"),
    // so try both rather than assuming one.
    const apiBases = ['https://orthodoxwiki.org/api.php', 'https://orthodoxwiki.org/w/api.php'];

    (async () => {
      for (const base of apiBases) {
        const url = `${base}?action=query&prop=extracts&exintro=1&explaintext=1&titles=${title}&format=json&origin=*`;
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json = await res.json();
          const pages = json?.query?.pages;
          const page = pages ? Object.values(pages)[0] : null;
          const extract = (page as { extract?: string } | null)?.extract;
          if (extract) {
            setState({ status: 'ready', extract: extract.slice(0, 600) });
            return;
          }
        } catch (err) {
          console.error('Saints of the Day: fetch failed for', base, err);
        }
      }
      setState({ status: 'error' });
    })();
  }, []);

  const wikiUrl = pageTitle ? `https://orthodoxwiki.org/${pageTitle}` : 'https://orthodoxwiki.org/';

  return (
    <div className="today-block">
      <h3>✝️ Saints of the Day</h3>
      {state.status === 'loading' && <p className="muted">Loading…</p>}
      {state.status === 'error' && <p className="muted">Couldn&apos;t load a summary — see the links below.</p>}
      {state.status === 'ready' && <p className="clamp-text">{state.extract}</p>}
      <div className="today-links">
        <a href={wikiUrl} target="_blank" rel="noreferrer">OrthodoxWiki →</a>
        <a href={ocaUrl} target="_blank" rel="noreferrer">OCA Lives of the Saints →</a>
      </div>
    </div>
  );
}
