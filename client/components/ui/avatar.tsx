import Image from 'next/image';
import { cn } from '@/lib/utils';

type AvatarProps = {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14', xl: 'h-20 w-20' };
const px = { sm: 32, md: 40, lg: 56, xl: 80 };

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const initials = alt
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (!src) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground',
          sizes[size],
          className,
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-full', sizes[size], className)}>
      <Image
        src={src}
        alt={alt}
        width={px[size]}
        height={px[size]}
        className="object-cover"
      />
    </div>
  );
}
