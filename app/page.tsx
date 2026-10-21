import BookmarksSection from './components/BookmarksSection';
import CalendarWidget from './components/CalendarWidget';
import PictureOfDayWidget from './components/PictureOfDayWidget';
import TodayTile from './components/TodayTile';

export default function Home() {
  return (
    <main className="page">
      <header className="page-header">
        <h1>StartHub</h1>
        <p className="tagline">Your day, at a glance.</p>
      </header>

      <TodayTile />

      <BookmarksSection />

      <section className="widgets-grid">
        <PictureOfDayWidget />
        <CalendarWidget />
      </section>
    </main>
  );
}
