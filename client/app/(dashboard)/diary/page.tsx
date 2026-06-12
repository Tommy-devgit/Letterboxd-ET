import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Calendar, Film } from 'lucide-react';
import { SectionHeader } from '@/components/common/section-header';
import { EmptyState } from '@/components/common/empty-state';

export const metadata: Metadata = { title: 'Diary' };

// TODO: Replace placeholder with real diary data from authenticated user session
const DEMO_ENTRIES: Array<{
  id: string;
  date: string;
  movieTitle: string;
  movieSlug: string;
  rating: number | null;
  notes: string | null;
}> = [];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DiaryPage() {
  const grouped = DEMO_ENTRIES.reduce<Record<string, typeof DEMO_ENTRIES>>((acc, entry) => {
    const d = new Date(entry.date);
    const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <SectionHeader title="Film Diary" subtitle="Your viewing history" />
        <Link
          href="/movies"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Film className="h-4 w-4" />
          Log a film
        </Link>
      </div>

      {DEMO_ENTRIES.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Your diary is empty"
          description="Start logging films to keep track of what you watch."
          action={
            <Link
              href="/movies"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse films
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-10">
          {Object.entries(grouped).map(([month, entries]) => (
            <section key={month}>
              <h2 className="mb-4 text-lg font-black text-primary">{month}</h2>
              <div className="flex flex-col gap-2">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
                  >
                    <div className="flex w-12 flex-col items-center">
                      <span className="text-xs text-muted-foreground">
                        {MONTHS[new Date(entry.date).getMonth()].slice(0, 3)}
                      </span>
                      <span className="text-2xl font-black">
                        {new Date(entry.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/movies/${entry.movieSlug}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {entry.movieTitle}
                      </Link>
                      {entry.notes && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                    {entry.rating && (
                      <span className="shrink-0 text-sm font-bold text-primary">
                        {entry.rating}★
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
