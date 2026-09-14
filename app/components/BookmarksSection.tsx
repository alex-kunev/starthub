import type { CSSProperties } from 'react';

interface Bookmark {
  label: string;
  url: string;
}

interface Category {
  name: string;
  emoji: string;
  color: string;
  links: Bookmark[];
}

export default function BookmarksSection({ categories }: { categories: Category[] }) {
  return (
    <section className="bookmarks-grid">
      {categories.map((category) => (
        <div
          className="bookmark-tile"
          style={{ '--cat-color': category.color } as CSSProperties}
          key={category.name}
        >
          <h2>
            <span className="bookmark-emoji" aria-hidden="true">{category.emoji}</span>
            {category.name}
          </h2>
          <ul>
            {category.links.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
