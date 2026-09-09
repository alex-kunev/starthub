export const siteConfig = {
  weather: {
    // Edit these to your own location — Open-Meteo needs plain coordinates,
    // no geocoding/API key involved.
    label: 'Sofia',
    latitude: 42.6977,
    longitude: 23.3219,
  },
  calendarApiUrl: process.env.NEXT_PUBLIC_CALENDAR_API_URL || '',
  unsplashAccessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
};
