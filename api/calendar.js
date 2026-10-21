const { fetchText, parseEvents } = require('../lib/calendar/parseIcs');

module.exports = async (req, res) => {
  const icsUrl = process.env.CALENDAR_ICS_URL;

  if (!icsUrl) {
    res.status(500).json({ error: 'CALENDAR_ICS_URL is not configured' });
    return;
  }

  try {
    const ics = await fetchText(icsUrl);
    const events = parseEvents(ics);
    res.status(200).json({ events });
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch calendar' });
  }
};
