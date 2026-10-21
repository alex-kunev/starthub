const { getBookmarks, setBookmarks, checkEditToken } = require('../../lib/bookmarks/store');

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

exports.handler = async function (event) {
  if (event.httpMethod === 'GET') {
    try {
      const categories = await getBookmarks();
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ categories }) };
    } catch (err) {
      return { statusCode: 502, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Failed to load bookmarks' }) };
    }
  }

  if (event.httpMethod === 'PUT') {
    const headerAuth = event.headers.authorization || event.headers.Authorization || '';
    const token = headerAuth.replace(/^Bearer\s+/i, '');
    if (!checkEditToken(token)) {
      return { statusCode: 401, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid edit token' }) };
    }

    try {
      const body = JSON.parse(event.body || '[]');
      if (!Array.isArray(body)) throw new Error('Expected an array of categories');
      await setBookmarks(body);
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save bookmarks';
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: message }) };
    }
  }

  return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
};
