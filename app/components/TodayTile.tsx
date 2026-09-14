import Clock from './today/Clock';
import EventsOfDay from './today/EventsOfDay';
import SaintsOfDay from './today/SaintsOfDay';
import WeekStrip from './today/WeekStrip';

export default function TodayTile() {
  return (
    <section className="widget today-tile">
      <div className="today-top">
        <Clock />
        <WeekStrip />
      </div>
      <div className="today-bottom">
        <SaintsOfDay />
        <EventsOfDay />
      </div>
    </section>
  );
}
