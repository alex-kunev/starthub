// Shared bookmarks store, backed by Upstash Redis's REST API.
//
// Deliberately NOT a platform-native store (Netlify Blobs / Vercel KV) —
// this project is deployed to both Netlify and Vercel, and those two
// stores don't share data with each other. Upstash's REST API is plain
// HTTP (Bearer token + fetch), so the exact same store code works
// identically from either host's serverless function, giving one shared,
// truly cross-host source of truth instead of two unsynced ones.
//
// Falls back to the repo's committed data/bookmarks.json as both the
// seed value (first read, before any edit has been saved) and the
// human-editable backup/reference copy.

const seed = require('../../data/bookmarks.json');

const KEY = 'starthub:bookmarks';

function restUrl(path) {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  if (!base) throw new Error('UPSTASH_REDIS_REST_URL is not configured');
  return `${base.replace(/\/$/, '')}${path}`;
}

function authHeaders() {
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!token) throw new Error('UPSTASH_REDIS_REST_TOKEN is not configured');
  return { Authorization: `Bearer ${token}` };
}

async function getBookmarks() {
  const res = await fetch(restUrl(`/get/${KEY}`), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Upstash GET failed: HTTP ${res.status}`);
  const json = await res.json();
  if (!json.result) return seed;
  return JSON.parse(json.result);
}

async function setBookmarks(categories) {
  const res = await fetch(restUrl(`/set/${KEY}`), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(categories),
  });
  if (!res.ok) throw new Error(`Upstash SET failed: HTTP ${res.status}`);
}

function checkEditToken(provided) {
  const expected = process.env.BOOKMARKS_EDIT_TOKEN;
  return Boolean(expected) && Boolean(provided) && provided === expected;
}

module.exports = { getBookmarks, setBookmarks, checkEditToken };
