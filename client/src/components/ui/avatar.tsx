"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const Avatar = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>) => (
  <AvatarPrimitive.Root
    className={cn(
      "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>) => (
  <AvatarPrimitive.Fallback
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-surface-raised text-foreground-muted text-sm font-medium",
      className
    )}
    {...props}
  />
);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
