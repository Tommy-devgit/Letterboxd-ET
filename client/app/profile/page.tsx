"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileRedirect />
    </ProtectedRoute>
  );
}

function ProfileRedirect() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) router.replace(`/u/${user.username}`);
  }, [router, user]);

  return (
    <div className="lb-container py-8">
      <Skeleton className="h-40 rounded-[4px]" />
    </div>
  );
}
