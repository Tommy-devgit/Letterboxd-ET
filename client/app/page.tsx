import Link from 'next/link';
import { ArrowRight, Star, Users, Film, BookOpen } from 'lucide-react';
import { HeroBanner } from '@/components/common/hero-banner';
import { SectionHeader } from '@/components/common/section-header';
import { MovieCard } from '@/components/movie/movie-card';
import { getFeaturedMovies, getGenres } from '@/lib/api';

const STATS = [
  { value: '500+', label: 'Ethiopian Films', icon: Film },
  { value: '129', label: 'Filmmakers', icon: Users },
  { value: '4.4★', label: 'Avg Rating', icon: Star },
  { value: '861', label: 'Trailers', icon: BookOpen },
];

const GENRES = ['Drama', 'Comedy', 'Romance', 'Action', 'Documentary', 'Historical', 'Thriller', 'Social'];

export default async function HomePage() {
  const movies = await getFeaturedMovies();
  const hero = movies[0];
  const featured = movies.slice(1, 7);

  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      {hero && (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <HeroBanner movie={hero} />
          </div>
        </section>
      )}

      {/* Stats bar */}
      <section className="mt-8 border-y border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-5">
                <Icon className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <dd className="text-xl font-black">{value}</dd>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Featured films grid */}
        <section className="mb-14">
          <SectionHeader
            title="Featured Films"
            subtitle="Ethiopian Cinema"
            href="/movies"
            className="mb-6"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {featured.map((movie) => (
              <MovieCard key={movie.id} movie={movie} variant="compact" />
            ))}
          </div>
        </section>

        {/* Genres */}
        <section className="mb-14">
          <SectionHeader
            title="Browse by Genre"
            subtitle="Explore"
            href="/genres"
            className="mb-6"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {GENRES.map((genre) => (
              <Link
                key={genre}
                href={`/movies?genre=${encodeURIComponent(genre)}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-3 py-4 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                  {genre}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* All recent movies */}
        <section className="mb-14">
          <SectionHeader
            title="Recent Additions"
            subtitle="New to Letterboxd ET"
            href="/movies"
            className="mb-6"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="relative p-8 sm:p-12">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative grid gap-6 sm:grid-cols-2 sm:items-center">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                  Join the community
                </p>
                <h2 className="mb-3 text-3xl font-black leading-tight">
                  Track every Ethiopian film you watch.
                </h2>
                <p className="text-muted-foreground leading-6">
                  Keep a diary, write reviews, create lists, and connect with other Ethiopian cinema fans.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 sm:justify-end">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/movies"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  Browse films
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
