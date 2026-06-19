"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usersApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";

export default function MembersPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: keys.users.list(1), queryFn: () => usersApi.list(1, 48) });
  return (
    <div className="lb-container py-8">
      <div className="mb-5 lb-section-rule pt-2"><h1 className="lb-section-title">Members</h1></div>
      {isLoading && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{Array.from({ length: 12 }, (_, i) => <Skeleton key={i} className="h-32 rounded-[4px]" />)}</div>}
      {error && <ErrorState retry={() => refetch()} />}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {(data?.data ?? []).map((user) => (
          <article key={user.id} className="rounded-[4px] border border-border-muted bg-[#101820] p-4 transition-colors hover:border-[#54b948]/50">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#1d2a35] text-sm font-bold text-[#9aa8b5]">{user.username.slice(0, 2).toUpperCase()}</span>
            <h2 className="mt-3 text-sm font-semibold text-[#d8e0e8]">{user.username}</h2>
            <p className="lb-caption">{user._count?.ratings ?? 0} ratings - {user._count?.reviews ?? 0} reviews</p>
          </article>
        ))}
      </div>
    </div>
  );
}