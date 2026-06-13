import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold text-accent/20 mb-4">404</p>
      <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
      <p className="text-foreground-muted text-sm mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/explore">Explore Films</Link>
        </Button>
      </div>
    </div>
  );
}
