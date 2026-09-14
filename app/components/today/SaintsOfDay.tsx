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

// action=query&prop=extracts requires the TextExtracts MediaWiki extension,
// which orthodoxwiki.org doesn't have installed (confirmed: the request
// succeeds but returns pages with no "extract" field). action=parse is
// core MediaWiki, always available, and returns rendered HTML — stripped
// to plain text here in the browser.
function fetchExtract(title: string): Promise<string> {
  const url = `https://orthodoxwiki.org/api.php?action=parse&page=${title}&prop=text&formatversion=2&format=json&origin=*`;
  return fetch(url)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((json) => {
      if (json.error) throw new Error(json.error.info ?? json.error.code ?? 'parse error');
      const html = json.parse?.text;
      if (!html) throw new Error('no page content in response');

      const container = document.createElement('div');
      container.innerHTML = html;
      container.querySelectorAll('.mw-editsection, sup.reference, table, style').forEach((el) => el.remove());
      const text = (container.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (!text) throw new Error('empty extract after stripping HTML');
      return text.slice(0, 600);
    });
}

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

    fetchExtract(title)
      .then((extract) => setState({ status: 'ready', extract }))
      .catch((err) => {
        console.error('Saints of the Day: fetch failed', err);
        setState({ status: 'error' });
      });
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
