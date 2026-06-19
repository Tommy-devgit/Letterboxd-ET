import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  showWordmark?: boolean;
  className?: string;
  markClassName?: string;
};

export function Logo({
  href,
  showWordmark = true,
  className,
  markClassName,
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      {showWordmark && (
        <span className="text-[1.45rem] font-bold tracking-[-0.02em] text-[#d6dde5]">
          Letterboxd-ET
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex shrink-0">
      {content}
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 58 24"
      aria-label="Letterboxd-ET"
      className={cn("h-6 w-[58px]", className)}
      role="img"
    >
      <circle cx="12" cy="12" r="11" fill="#54b948" />
      <circle cx="29" cy="12" r="11" fill="#f2c94c" fillOpacity="0.94" />
      <circle cx="46" cy="12" r="11" fill="#e0362d" fillOpacity="0.94" />
    </svg>
  );
}
