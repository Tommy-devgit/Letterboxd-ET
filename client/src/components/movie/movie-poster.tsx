import Image from "next/image";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoviePosterProps {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

export function MoviePoster({
  src,
  alt,
  className,
  sizes,
  priority = false,
  fill = false,
  width,
  height,
}: MoviePosterProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface-raised text-text-muted",
          className
        )}
      >
        <Film className="h-8 w-8 opacity-40" />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "300px"}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 300}
      height={height ?? 450}
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
