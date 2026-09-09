import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Starthub',
  description: 'Personal daily start page — bookmarks, weather, calendar and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
