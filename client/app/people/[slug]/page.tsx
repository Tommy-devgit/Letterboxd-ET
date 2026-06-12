import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Film } from 'lucide-react';
import { SectionHeader } from '@/components/common/section-header';
import { MovieCard } from '@/components/movie/movie-card';
import { Badge } from '@/components/ui/badge';
import { getPersonBySlug } from '@/lib/api';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const person = await getPersonBySlug(slug);
    return { title: person.fullName };
  } catch {
    return { title: 'Person not found' };
  }
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let person;
  try {
    person = await getPersonBySlug(slug);
  } catch {
    notFound();
  }

  const directed = person.credits?.filter((c) => c.role === 'director') ?? [];
  const acted = person.credits?.filter((c) => c.role === 'actor') ?? [];
  const wrote = person.credits?.filter((c) => c.role === 'writer') ?? [];

  const initials = person.fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Person header */}
      <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        {/* Avatar */}
        <div className="shrink-0">
          {person.photoUrl ? (
            <div className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-border sm:h-40 sm:w-40">
              <Image
                src={person.photoUrl}
                alt={person.fullName}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted text-3xl font-black text-muted-foreground ring-4 ring-border sm:h-40 sm:w-40">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-black sm:text-4xl">{person.fullName}</h1>

          <div className="mb-4 flex flex-wrap gap-2">
            {directed.length > 0 && <Badge variant="primary">Director</Badge>}
            {acted.length > 0 && <Badge variant="accent">Actor</Badge>}
            {wrote.length > 0 && <Badge variant="outline">Writer</Badge>}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {person.birthDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Born {new Date(person.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5" />
              {person.credits?.length ?? 0} film{(person.credits?.length ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>

          {person.bio && (
            <p className="max-w-2xl leading-7 text-muted-foreground">{person.bio}</p>
          )}
        </div>
      </div>

      {/* Filmographies */}
      {directed.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Directed" subtitle={`${directed.length} films`} className="mb-6" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {directed.map((c) => (
              <MovieCard key={c.movie.id} movie={c.movie} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {acted.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Acting Credits" subtitle={`${acted.length} films`} className="mb-6" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {acted.map((c) => (
              <MovieCard key={c.movie.id} movie={c.movie} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {wrote.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Writing Credits" subtitle={`${wrote.length} films`} className="mb-6" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {wrote.map((c) => (
              <MovieCard key={c.movie.id} movie={c.movie} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
