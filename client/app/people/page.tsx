import type { Metadata } from 'next';
import { SectionHeader } from '@/components/common/section-header';
import { PersonCard } from '@/components/person/person-card';
import { EmptyState } from '@/components/common/empty-state';
import { getPeople } from '@/lib/api';
import Link from 'next/link';

export const metadata: Metadata = { title: 'People' };

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? 1);

  const result = await getPeople(page, 24).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    limit: 24,
  }));

  const totalPages = Math.ceil(result.total / result.limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        title="Filmmakers"
        subtitle={`${result.total} people`}
        className="mb-8"
      />

      {result.data.length === 0 ? (
        <EmptyState title="No people found" description="Filmmakers will appear here once imported." />
      ) : (
        <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {result.data.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/people?page=${page - 1}`}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`/people?page=${page + 1}`}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
