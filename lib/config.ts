export const siteConfig = {
  weather: {
    // Edit these to your own location — Open-Meteo needs plain coordinates,
    // no geocoding/API key involved.
    label: 'Sofia',
    latitude: 42.6977,
    longitude: 23.3219,
  },
  // Public Google Calendar to embed. Derived from the "cid" in a
  // calendar.google.com share link (base64-decoded, it's the calendar's id —
  // usually the owner's email for a personal calendar). Only works for
  // calendars whose sharing settings are "Make available to public".
  calendar: {
    calendarId: 'alex087@gmail.com',
    timezone: 'Europe/Sofia',
  },
};
