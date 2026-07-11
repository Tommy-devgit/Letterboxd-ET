"use client";

import Link from "next/link";
import { Clapperboard, Heart, ListPlus, MessageSquare, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/common/error-state";
import { RatingStars } from "@/components/common/rating-stars";
import { Skeleton } from "@/components/ui/skeleton";
import { activityApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

const icons = { watched: Clapperboard, rated: Star, reviewed: MessageSquare, watchlisted: Heart, listed: ListPlus };

export default function ActivityPage() {
  return (
    <ProtectedRoute>
      <ActivityContent />
    </ProtectedRoute>
  );
}

function ActivityContent() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: keys.activity.recent(40), queryFn: () => activityApi.recent(40) });
  return (
    <div className="lb-container py-8">
      <div className="mb-5 lb-section-rule pt-2"><h1 className="lb-section-title">Activity</h1></div>
      {isLoading && <div className="space-y-2">{Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="h-12 rounded-[4px]" />)}</div>}
      {error && <ErrorState retry={() => refetch()} />}
      {!isLoading && !error && data?.length === 0 ? (
        <EmptyState title="No followed activity yet" description="Follow members to build a personal activity feed." action={<Button asChild><Link href="/members">Find members</Link></Button>} />
      ) : null}
      {(data?.length ?? 0) > 0 ? <div className="divide-y divide-border-muted rounded-[4px] border border-border-muted bg-[#101820]">
        {(data ?? []).map((item) => { const Icon = icons[item.type as keyof typeof icons]; const subject = item.movie?.title ?? item.list?.title ?? "a film"; const href = item.movie ? `/movie/${item.movie.slug}` : "/lists"; return (
          <Link key={item.id} href={href} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#131d26]">
            <Icon className="h-4 w-4 shrink-0 text-[#54b948]" />
            <p className="min-w-0 flex-1 text-sm text-[#9aa8b5]"><span className="font-semibold text-[#d8e0e8]">{item.user.username}</span> {item.type === "watchlisted" ? "added to watchlist" : item.type} <span className="font-semibold text-[#cfd8e1]">{subject}</span></p>
            {item.rating ? <RatingStars rating={item.rating} size="xs" showValue className="shrink-0" /> : <span className="lb-caption shrink-0">{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
          </Link>
        ); })}
      </div> : null}
    </div>
  );
}
