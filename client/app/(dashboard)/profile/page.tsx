import type { Metadata } from 'next';
import Link from 'next/link';
import { Film, BookOpen, Star, Heart, List, Users, Compass } from 'lucide-react';
import { SectionHeader } from '@/components/common/section-header';
import { MovieCard } from '@/components/movie/movie-card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

export const metadata: Metadata = { title: 'Profile' };

// TODO: Replace with real auth session — currently shows a placeholder profile
const DEMO_USER = {
  username: 'cinephile_et',
  bio: 'Ethiopian cinema enthusiast. Letterboxd for Ethiopia 🇪🇹',
  profilePicture: null as string | null,
  stats: { films: 48, reviews: 12, lists: 4, following: 23, followers: 31 },
};

const ACTIVITY_TABS = ['Films', 'Diary', 'Reviews', 'Lists', 'Watchlist'];

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Profile header */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <Avatar
          src={DEMO_USER.profilePicture}
          alt={DEMO_USER.username}
          size="xl"
          className="ring-4 ring-border"
        />

        <div className="flex-1">
          <h1 className="mb-1 text-2xl font-black">{DEMO_USER.username}</h1>
          {DEMO_USER.bio && (
            <p className="mb-4 text-sm text-muted-foreground">{DEMO_USER.bio}</p>
          )}

          <div className="flex flex-wrap gap-6 text-sm">
            {[
              { label: 'Films', value: DEMO_USER.stats.films, href: '#films' },
              { label: 'Reviews', value: DEMO_USER.stats.reviews, href: '#reviews' },
              { label: 'Lists', value: DEMO_USER.stats.lists, href: '#lists' },
              { label: 'Following', value: DEMO_USER.stats.following, href: '#' },
              { label: 'Followers', value: DEMO_USER.stats.followers, href: '#' },
            ].map(({ label, value, href }) => (
              <a key={label} href={href} className="group flex flex-col items-center">
                <span className="text-lg font-black group-hover:text-primary transition-colors">
                  {value}
                </span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/settings"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Edit profile
          </Link>
        </div>
      </div>

      {/* Quick stats cards */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Film, label: 'Films logged', value: DEMO_USER.stats.films, href: '/diary' },
          { icon: Star, label: 'Reviews written', value: DEMO_USER.stats.reviews, href: '#' },
          { icon: Compass, label: 'Watchlist', value: 18, href: '/watchlist' },
          { icon: List, label: 'Lists created', value: DEMO_USER.stats.lists, href: '#' },
        ].map(({ icon: Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-lg font-black">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Favorite films placeholder */}
      <section className="mb-10">
        <SectionHeader
          title="Favorite Films"
          subtitle="All time"
          href="/favorites"
          className="mb-5"
        />
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl border-2 border-dashed border-border bg-surface/50 flex items-center justify-center text-muted-foreground"
            >
              <Film className="h-6 w-6" />
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <SectionHeader title="Recent Activity" href="/diary" className="mb-5" />
        <div className="rounded-xl border border-border bg-surface p-6 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-50" />
          <p className="font-medium">Start logging films to see your activity here</p>
          <p className="mt-1 text-sm">Visit any movie page to log, rate, or review</p>
          <Link
            href="/movies"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse films
          </Link>
        </div>
      </section>
    </div>
  );
}
