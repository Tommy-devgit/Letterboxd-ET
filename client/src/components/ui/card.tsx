import { cn } from "@/lib/utils";

const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-lg border border-border bg-card text-card-foreground",
      className
    )}
    {...props}
  />
);

const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-5", className)} {...props} />
);

const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("font-semibold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
);

const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-text-muted", className)} {...props} />
);

const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5 pt-0", className)} {...props} />
);

const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center p-5 pt-0", className)}
    {...props}
  />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
