const { fetchText, parseEvents } = require('../../lib/calendar/parseIcs');

exports.handler = async function () {
  const icsUrl = process.env.CALENDAR_ICS_URL;

  if (!icsUrl) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'CALENDAR_ICS_URL is not configured' }),
    };
  }

  try {
    const ics = await fetchText(icsUrl);
    const events = parseEvents(ics);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch calendar' }),
    };
  }
};
