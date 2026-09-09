interface Bookmark {
  label: string;
  url: string;
}

interface Category {
  name: string;
  links: Bookmark[];
}

export default function BookmarksSection({ categories }: { categories: Category[] }) {
  return (
    <section className="bookmarks">
      {categories.map((category) => (
        <div className="bookmark-category" key={category.name}>
          <h2>{category.name}</h2>
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
