// Shared, dependency-free ICS fetch/parse logic used by both serverless
// function adapters (Netlify Functions and Vercel's /api). Plain CommonJS
// so it runs without a build step in either runtime.

const https = require('https');

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(fetchText(res.headers.location));
          return;
        }
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve(body));
      })
      .on('error', reject);
  });
}

// Parses just enough of the ICS format (RFC 5545) to pull SUMMARY/DTSTART
// pairs out of VEVENT blocks — not a full parser, but enough for a
// read-only "upcoming events" widget.
function parseEvents(ics) {
  const blocks = ics.split('BEGIN:VEVENT').slice(1);
  const events = [];

  for (const block of blocks) {
    const summaryMatch = block.match(/SUMMARY:(.*)/);
    const startMatch = block.match(/DTSTART[^:]*:(\d{8}T?\d{0,6}Z?)/);
    if (!summaryMatch || !startMatch) continue;

    events.push({
      summary: summaryMatch[1].trim(),
      start: toIsoDate(startMatch[1]),
    });
  }

  return events
    .filter((event) => new Date(event.start).getTime() >= Date.now() - 24 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 10);
}

function toIsoDate(raw) {
  const isUtc = raw.endsWith('Z');
  const digits = raw.replace('Z', '');
  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);
  const day = digits.slice(6, 8);
  const hour = digits.slice(9, 11) || '00';
  const minute = digits.slice(11, 13) || '00';
  const second = digits.slice(13, 15) || '00';
  return `${year}-${month}-${day}T${hour}:${minute}:${second}${isUtc ? 'Z' : ''}`;
}

module.exports = { fetchText, parseEvents };
