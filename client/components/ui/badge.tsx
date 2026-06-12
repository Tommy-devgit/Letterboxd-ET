import { cn } from '@/lib/utils';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'primary' | 'accent' | 'outline';
};

const variants = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/15 text-accent',
  outline: 'border border-border text-muted-foreground',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
