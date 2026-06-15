import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-background font-bold text-sm">
                ET
              </div>
              <span className="font-semibold text-foreground text-sm">
                Letterboxd<span className="text-accent">-ET</span>
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-xs">
              A film diary for Ethiopian cinema lovers. Track, review, and
              discover habesha films.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Discover
            </h4>
            <ul className="space-y-2">
              {[
                ["Films", "/explore"],
                ["Genres", "/explore?genre="],
                ["Top Rated", "/explore?sort=rating"],
                ["New Releases", "/explore?sort=new"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-foreground-muted hover:text-accent transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Members
            </h4>
            <ul className="space-y-2">
              {[
                ["Sign In", "/login"],
                ["Create Account", "/register"],
                ["Watchlist", "/watchlist"],
                ["Diary", "/diary"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-foreground-muted hover:text-accent transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              About
            </h4>
            <ul className="space-y-2">
              {[
                ["About", "#"],
                ["Contact", "#"],
                ["Privacy", "#"],
                ["Terms", "#"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-foreground-muted hover:text-accent transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Letterboxd-ET. Ethiopian cinema, always.
          </p>
        </div>
      </div>
    </footer>
  );
}
