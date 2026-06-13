import Link from "next/link";
import { cn } from "@/lib/utils";

interface GenreBadgeProps {
  genre: string;
  href?: string;
  className?: string;
}

export function GenreBadge({ genre, href, className }: GenreBadgeProps) {
  const classes = cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border border-border bg-surface-raised text-foreground-muted hover:border-accent/50 hover:text-accent hover:bg-accent/5",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {genre}
      </Link>
    );
  }

  return <span className={classes}>{genre}</span>;
}
