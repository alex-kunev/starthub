const { getBookmarks, setBookmarks, checkEditToken } = require('../lib/bookmarks/store');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    try {
      const categories = await getBookmarks();
      res.status(200).json({ categories });
    } catch (err) {
      res.status(502).json({ error: 'Failed to load bookmarks' });
    }
    return;
  }

  if (req.method === 'PUT') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!checkEditToken(token)) {
      res.status(401).json({ error: 'Invalid edit token' });
      return;
    }

    try {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!Array.isArray(body)) throw new Error('Expected an array of categories');
      await setBookmarks(body);
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to save bookmarks' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
