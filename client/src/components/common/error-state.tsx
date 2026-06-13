"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  retry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Failed to load content. Please try again.",
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <AlertCircle className="h-10 w-10 text-destructive opacity-70 mb-4" />
      <h3 className="text-base font-medium text-foreground-muted mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-4">{description}</p>
      {retry && (
        <Button variant="outline" size="sm" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
