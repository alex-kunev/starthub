import bookmarks from '@/data/bookmarks.json';
import BookmarksSection from './components/BookmarksSection';
import CalendarWidget from './components/CalendarWidget';
import MountainPhotoWidget from './components/MountainPhotoWidget';
import WeatherWidget from './components/WeatherWidget';

export default function Home() {
  return (
    <main className="page">
      <header className="page-header">
        <h1>Starthub</h1>
      </header>

      <section className="widgets">
        <WeatherWidget />
        <CalendarWidget />
        <MountainPhotoWidget />
      </section>

      <BookmarksSection categories={bookmarks} />
    </main>
  );
}
