import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Person } from '@/lib/types';

type PersonCardProps = {
  person: Person & { slug?: string; role?: string; movieCount?: number };
  className?: string;
};

export function PersonCard({ person, className }: PersonCardProps) {
  const href = person.slug ? `/people/${person.slug}` : '#';
  const initials = person.fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href={href} className={cn('group flex flex-col items-center gap-2 text-center', className)}>
      <div className="relative overflow-hidden rounded-full ring-2 ring-transparent transition-all group-hover:ring-primary/50">
        {person.photoUrl ? (
          <div className="relative h-20 w-20">
            <Image
              src={person.photoUrl}
              alt={person.fullName}
              fill
              className="rounded-full object-cover"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-lg font-bold text-muted-foreground">
            {initials}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
          {person.fullName}
        </p>
        {person.role && (
          <p className="text-xs capitalize text-muted-foreground">{person.role.toLowerCase()}</p>
        )}
        {person.creditCount !== undefined && (
          <p className="text-xs text-muted-foreground">{person.creditCount} films</p>
        )}
      </div>
    </Link>
  );
}
