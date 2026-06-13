import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-raised text-foreground-muted border border-border",
        accent: "bg-accent/15 text-accent border border-accent/30",
        secondary: "bg-surface text-foreground-muted border border-border-muted",
        outline: "border border-border text-foreground-muted",
        success: "bg-success/15 text-success border border-success/30",
        destructive: "bg-destructive/15 text-destructive border border-destructive/30",
        rating: "bg-rating/15 text-rating border border-rating/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
