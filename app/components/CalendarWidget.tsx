import { siteConfig } from '@/lib/config';

export default function CalendarWidget() {
  const { calendarId, timezone } = siteConfig.calendar;

  const params = new URLSearchParams({
    src: calendarId,
    ctz: timezone,
    mode: 'WEEK',
    showTitle: '0',
    showNav: '1',
    showTabs: '0',
    showCalendars: '0',
    showTz: '0',
    showPrint: '0',
  });

  return (
    <div className="widget calendar-widget">
      <h2>📅 Calendar</h2>
      <iframe
        src={`https://calendar.google.com/calendar/embed?${params.toString()}`}
        className="calendar-embed"
        title="Calendar"
        loading="lazy"
      />
    </div>
  );
}
