import bookmarks from '@/data/bookmarks.json';
import BookmarksSection from './components/BookmarksSection';
import CalendarWidget from './components/CalendarWidget';
import PictureOfDayWidget from './components/PictureOfDayWidget';
import TodayTile from './components/TodayTile';
import WeatherWidget from './components/WeatherWidget';

export default function Home() {
  return (
    <main className="page">
      <header className="page-header">
        <h1>StartHub</h1>
        <p className="tagline">Your day, at a glance.</p>
      </header>

      <TodayTile />

      <section className="widgets-grid">
        <WeatherWidget />
        <CalendarWidget />
        <PictureOfDayWidget />
      </section>

      <BookmarksSection categories={bookmarks} />
    </main>
  );
}
