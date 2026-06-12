import Image from 'next/image';
import { cn } from '@/lib/utils';

type MoviePosterProps = {
  posterUrl?: string | null;
  title: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
};

// Ethiopian-inspired gradient placeholders
const GRADIENTS = [
  'from-emerald-950 via-emerald-800 to-amber-700',
  'from-zinc-900 via-amber-800 to-red-900',
  'from-red-950 via-stone-800 to-emerald-800',
  'from-amber-950 via-emerald-900 to-zinc-800',
];

function gradientForTitle(title: string): string {
  const idx = title.charCodeAt(0) % GRADIENTS.length;
  return GRADIENTS[idx];
}

export function MoviePoster({
  posterUrl,
  title,
  width = 300,
  height = 450,
  className,
  priority = false,
}: MoviePosterProps) {
  const gradient = gradientForTitle(title);

  if (!posterUrl) {
    return (
      <div
        className={cn(
          `flex items-end bg-linear-to-br ${gradient} p-4`,
          className,
        )}
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <span className="text-sm font-bold leading-tight text-white/90">{title}</span>
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ aspectRatio: `${width}/${height}` }}
    >
      <Image
        src={posterUrl}
        alt={`${title} poster`}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        priority={priority}
      />
    </div>
  );
}
