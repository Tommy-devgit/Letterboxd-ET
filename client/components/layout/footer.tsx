import Link from 'next/link';
import { Film } from 'lucide-react';

const LINKS = {
  Discover: [
    { href: '/movies', label: 'All Films' },
    { href: '/genres', label: 'Genres' },
    { href: '/people', label: 'People' },
    { href: '/lists', label: 'Lists' },
  ],
  Account: [
    { href: '/profile', label: 'Profile' },
    { href: '/diary', label: 'Diary' },
    { href: '/watchlist', label: 'Watchlist' },
    { href: '/settings', label: 'Settings' },
  ],
  About: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy' },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">
                LE
              </div>
              <span className="text-base font-black">Letterboxd ET</span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              The definitive home for Ethiopian cinema. Discover, track, and review Ethiopian films.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">{title}</h3>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Letterboxd ET. Built for Ethiopian cinema.
          </p>
          <p className="text-xs text-muted-foreground">
            Data sourced from{' '}
            <span className="text-primary">ETMDB</span>
            {' & '}
            <span className="text-accent">Sodere</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
