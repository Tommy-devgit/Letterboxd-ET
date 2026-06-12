import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

type GenreBadgeProps = {
  genre: string;
  linkable?: boolean;
};

export function GenreBadge({ genre, linkable = true }: GenreBadgeProps) {
  if (!linkable) return <Badge variant="outline">{genre}</Badge>;
  return (
    <Link href={`/genres?genre=${encodeURIComponent(genre)}`}>
      <Badge variant="outline" className="cursor-pointer hover:border-primary hover:text-primary transition-colors">
        {genre}
      </Badge>
    </Link>
  );
}
