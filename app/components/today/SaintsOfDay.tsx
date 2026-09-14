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
    // requests via an explicit origin=* parameter — no proxy needed.
    const url = `https://orthodoxwiki.org/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${title}&format=json&origin=*`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        const pages = json?.query?.pages;
        const page = pages ? Object.values(pages)[0] : null;
        const extract = (page as { extract?: string } | null)?.extract;
        if (!extract) throw new Error('no extract');
        setState({ status: 'ready', extract: extract.slice(0, 600) });
      })
      .catch(() => setState({ status: 'error' }));
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
