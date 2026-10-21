'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

interface Bookmark {
  label: string;
  url: string;
}

interface Category {
  name: string;
  emoji: string;
  color: string;
  links: Bookmark[];
}

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; categories: Category[] };

const TOKEN_STORAGE_KEY = 'starthub-bookmarks-edit-token';

function cloneCategories(categories: Category[]): Category[] {
  return categories.map((c) => ({ ...c, links: c.links.map((l) => ({ ...l })) }));
}

export default function BookmarksSection() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Category[] | null>(null);
  const [token, setToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setToken(localStorage.getItem(TOKEN_STORAGE_KEY) ?? '');
    } catch {
      // localStorage unavailable — editing will just prompt for the token every time.
    }

    fetch('/api/bookmarks')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json) => setState({ status: 'ready', categories: json.categories ?? [] }))
      .catch((err) => {
        console.error('Bookmarks: fetch failed', err);
        setState({ status: 'error' });
      });
  }, []);

  function startEditing() {
    if (state.status !== 'ready') return;
    setDraft(cloneCategories(state.categories));
    setSaveError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(null);
    setSaveError(null);
    setEditing(false);
  }

  async function save() {
    if (!draft) return;
    if (!token) {
      setSaveError('Enter the edit token above first.');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(draft),
      });

      if (res.status === 401) {
        setSaveError('That edit token was rejected — check it and try again.');
        setSaving(false);
        return;
      }
      if (!res.ok) {
        setSaveError(`Save failed (HTTP ${res.status}).`);
        setSaving(false);
        return;
      }

      try {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } catch {
        // Non-fatal — the token just won't be remembered for next time.
      }

      setState({ status: 'ready', categories: draft });
      setDraft(null);
      setEditing(false);
      setSaving(false);
    } catch (err) {
      console.error('Bookmarks: save failed', err);
      setSaveError('Save failed — network error.');
      setSaving(false);
    }
  }

  function updateCategory(i: number, patch: Partial<Category>) {
    setDraft((prev) => prev && prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  function moveCategory(i: number, dir: -1 | 1) {
    setDraft((prev) => {
      if (!prev) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function deleteCategory(i: number) {
    setDraft((prev) => prev && prev.filter((_, idx) => idx !== i));
  }

  function addCategory() {
    setDraft((prev) => [...(prev ?? []), { name: 'New Category', emoji: '⭐', color: '#5b9dff', links: [] }]);
  }

  function updateLink(ci: number, li: number, patch: Partial<Bookmark>) {
    setDraft(
      (prev) =>
        prev &&
        prev.map((c, idx) =>
          idx !== ci ? c : { ...c, links: c.links.map((l, lidx) => (lidx === li ? { ...l, ...patch } : l)) }
        )
    );
  }

  function moveLink(ci: number, li: number, dir: -1 | 1) {
    setDraft((prev) => {
      if (!prev) return prev;
      const links = prev[ci].links;
      const j = li + dir;
      if (j < 0 || j >= links.length) return prev;
      const nextLinks = [...links];
      [nextLinks[li], nextLinks[j]] = [nextLinks[j], nextLinks[li]];
      return prev.map((c, idx) => (idx === ci ? { ...c, links: nextLinks } : c));
    });
  }

  function deleteLink(ci: number, li: number) {
    setDraft(
      (prev) => prev && prev.map((c, idx) => (idx !== ci ? c : { ...c, links: c.links.filter((_, lidx) => lidx !== li) }))
    );
  }

  function addLink(ci: number) {
    setDraft(
      (prev) =>
        prev && prev.map((c, idx) => (idx !== ci ? c : { ...c, links: [...c.links, { label: 'New link', url: 'https://' }] }))
    );
  }

  if (state.status === 'loading') {
    return (
      <section className="bookmarks-section">
        <p className="muted">Loading bookmarks…</p>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="bookmarks-section">
        <p className="muted">Unable to load bookmarks.</p>
      </section>
    );
  }

  return (
    <section className="bookmarks-section">
      <div className="bookmarks-toolbar">
        {!editing && (
          <button type="button" className="edit-btn" onClick={startEditing}>
            ✏️ Edit favorites
          </button>
        )}
        {editing && (
          <>
            <input
              type="password"
              className="token-input"
              placeholder="Edit token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <button type="button" className="edit-btn edit-btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save'}
            </button>
            <button type="button" className="edit-btn" onClick={cancelEditing} disabled={saving}>
              ✕ Cancel
            </button>
            {saveError && <span className="edit-error">{saveError}</span>}
          </>
        )}
      </div>

      {!editing && (
        <div className="bookmarks-grid">
          {state.categories.map((category) => (
            <div className="bookmark-tile" style={{ '--cat-color': category.color } as CSSProperties} key={category.name}>
              <h2>
                <span className="bookmark-emoji" aria-hidden="true">{category.emoji}</span>
                {category.name}
              </h2>
              <ul>
                {category.links.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {editing && draft && (
        <div className="bookmarks-grid">
          {draft.map((category, ci) => (
            <div
              className="bookmark-tile bookmark-tile-editing"
              style={{ '--cat-color': category.color } as CSSProperties}
              key={ci}
            >
              <div className="category-edit-header">
                <input
                  type="text"
                  className="emoji-input"
                  value={category.emoji}
                  onChange={(e) => updateCategory(ci, { emoji: e.target.value })}
                  aria-label="Category emoji"
                />
                <input
                  type="text"
                  className="name-input"
                  value={category.name}
                  onChange={(e) => updateCategory(ci, { name: e.target.value })}
                  aria-label="Category name"
                />
                <input
                  type="color"
                  className="color-input"
                  value={category.color}
                  onChange={(e) => updateCategory(ci, { color: e.target.value })}
                  aria-label="Category color"
                />
              </div>

              <div className="category-edit-controls">
                <button type="button" className="icon-btn" onClick={() => moveCategory(ci, -1)} disabled={ci === 0} title="Move category up">↑</button>
                <button type="button" className="icon-btn" onClick={() => moveCategory(ci, 1)} disabled={ci === draft.length - 1} title="Move category down">↓</button>
                <button type="button" className="icon-btn icon-btn-danger" onClick={() => deleteCategory(ci)} title="Delete category">🗑</button>
              </div>

              <ul className="link-edit-list">
                {category.links.map((link, li) => (
                  <li key={li} className="link-edit-row">
                    <input
                      type="text"
                      className="link-label-input"
                      value={link.label}
                      onChange={(e) => updateLink(ci, li, { label: e.target.value })}
                      aria-label="Link label"
                    />
                    <input
                      type="text"
                      className="link-url-input"
                      value={link.url}
                      onChange={(e) => updateLink(ci, li, { url: e.target.value })}
                      aria-label="Link URL"
                    />
                    <button type="button" className="icon-btn" onClick={() => moveLink(ci, li, -1)} disabled={li === 0} title="Move up">↑</button>
                    <button type="button" className="icon-btn" onClick={() => moveLink(ci, li, 1)} disabled={li === category.links.length - 1} title="Move down">↓</button>
                    <button type="button" className="icon-btn icon-btn-danger" onClick={() => deleteLink(ci, li)} title="Delete link">✕</button>
                  </li>
                ))}
              </ul>

              <button type="button" className="add-link-btn" onClick={() => addLink(ci)}>
                + Add link
              </button>
            </div>
          ))}

          <button type="button" className="bookmark-tile add-category-tile" onClick={addCategory}>
            + Add category
          </button>
        </div>
      )}
    </section>
  );
}
