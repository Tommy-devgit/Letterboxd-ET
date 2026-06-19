import Link from "next/link";
import { Clapperboard, Heart, ListPlus, MessageSquare, Star } from "lucide-react";
import { buildActivity } from "@/lib/letterboxd-et-seed";

const icons = {
  watched: Clapperboard,
  rated: Star,
  reviewed: MessageSquare,
  watchlisted: Heart,
  listed: ListPlus,
};

export default function ActivityPage() {
  const activity = buildActivity([]);

  return (
    <div className="lb-container py-8">
      <div className="mb-5 lb-section-rule pt-2">
        <h1 className="lb-section-title">Activity</h1>
      </div>
      <div className="divide-y divide-border-muted rounded-[4px] border border-border-muted bg-[#101820]">
        {activity.map((item) => {
          const Icon = icons[item.action];
          return (
            <Link key={item.id} href="/explore" className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#131d26]">
              <Icon className="h-4 w-4 shrink-0 text-[#54b948]" />
              <p className="min-w-0 flex-1 text-sm text-[#9aa8b5]">
                <span className="font-semibold text-[#d8e0e8]">{item.user}</span>{" "}
                {item.action === "watchlisted" ? "added to watchlist" : item.action}{" "}
                <span className="font-semibold text-[#cfd8e1]">{item.subject}</span>
              </p>
              <span className="lb-caption shrink-0">{item.meta}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
