"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { useAuth } from "@/providers/auth/auth-provider";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated) {
    return (
      <div className="lb-container grid min-h-[50vh] place-items-center py-12">
        <div className="text-center">
          <LogoMark className="mx-auto h-8 w-[76px]" />
          <p className="mt-4 lb-caption">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return children;
}
