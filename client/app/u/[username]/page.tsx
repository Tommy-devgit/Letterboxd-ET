"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Eye, Film, Grid2X2, Heart, List, ListIcon, MessageSquare, Pencil, Settings, Share2, Star, UserCheck, UserPlus } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { RatingStars } from "@/components/common/rating-stars";
import { MoviePoster } from "@/components/movie/movie-poster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { usersApi } from "@/lib/api";
import { getRatingColor } from "@/lib/design-tokens";
import { formatDateShort, formatRuntime, truncate } from "@/lib/utils";
import { useAuth } from "@/providers/auth/auth-provider";
import type { DiaryEntry, List as UserList, MovieReview, MovieSummary, UserProfile, WatchlistEntry } from "@/types";

type ViewMode = "grid" | "list";
type WatchlistSort = "recent" | "rating" | "title";

const pageSize = 6;

export default function UserProfilePage() {
  const username = useParams().username as string;
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ["user-profile", username],
    queryFn: () => usersApi.getByUsername(username),
    enabled: !!username,
  });

  if (isLoading) return <ProfileSkeleton />;
  if (error || !profile) return <div className="lb-container py-16"><ErrorState title="Member not found" retry={() => refetch()} /></div>;
  return <ProfileDashboard profile={profile} />;
}

function ProfileDashboard({ profile }: { profile: UserProfile }) {
  const { user } = useAuth();
  const toast = useToast();
  const isOwnProfile = user?.id === profile.id;
  const [filmView, setFilmView] = useState<ViewMode>("grid");
  const [watchlistSort, setWatchlistSort] = useState<WatchlistSort>("recent");
  const [followBusy, setFollowBusy] = useState(false);
  const [visible, setVisible] = useState({ films: pageSize, reviews: pageSize, diary: pageSize, lists: pageSize, watchlist: pageSize });
  const followStatus = useQuery({
    queryKey: ["follow-status", profile.id, user?.id],
    queryFn: () => usersApi.followStatus(profile.id),
    enabled: Boolean(user && !isOwnProfile),
    retry: false,
  });

  const diary = profile.diaryEntries ?? [];
  const reviews = profile.reviews ?? [];
  const lists = profile.lists ?? [];
  const ratings = profile.ratings ?? [];
  const watchlist = useMemo(() => sortWatchlist(profile.watchlist ?? [], watchlistSort), [profile.watchlist, watchlistSort]);
  const averageRating = ratings.length ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : null;
  const diaryStats = getDiaryStats(diary);
  const bannerMovie = profile.favoriteMovies?.[0]?.movie ?? diary[0]?.movie ?? watchlist[0]?.movie;

  function showMore(key: keyof typeof visible) {
    setVisible((current) => ({ ...current, [key]: current[key] + pageSize }));
  }

  function shareProfile() {
    const url = `${window.location.origin}/u/${profile.username}`;
    void navigator.clipboard?.writeText(url);
    toast.success({ title: "Profile link copied" });
  }

  async function toggleFollow() {
    if (!user || isOwnProfile) return;
    setFollowBusy(true);
    try {
      if (followStatus.data?.following) await usersApi.unfollow(profile.id);
      else await usersApi.follow(profile.id);
      await followStatus.refetch();
      toast.success({ title: followStatus.data?.following ? "Unfollowed member" : "Now following" });
    } catch {
      toast.error({ title: "Could not update follow" });
    } finally {
      setFollowBusy(false);
    }
  }

  return (
    <div className="pb-16">
      <header className="relative overflow-hidden border-b border-border-muted">
        <div className="absolute inset-0">
          {bannerMovie?.posterUrl ? <MoviePoster src={bannerMovie.posterUrl} alt={bannerMovie.title} fill sizes="100vw" className="scale-110 opacity-25 blur-sm" /> : null}
          <div className="absolute inset-0 bg-gradient-to-b from-[#14202a]/80 via-[#0b1117]/78 to-[#0b1117]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-[#54b948] via-[#f2c94c] to-[#e0362d]" />
        </div>
        <div className="lb-container relative pt-16 pb-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end">
            <Avatar className="h-24 w-24 border border-[#536575] bg-surface-raised shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
              <AvatarImage src={profile.profilePicture ?? undefined} alt={profile.username} />
              <AvatarFallback className="text-2xl font-bold">{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold tracking-normal text-foreground">{profile.username}</h1>
                {averageRating ? <RatingStars rating={averageRating} size="sm" showValue /> : null}
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground-muted">
                <CalendarDays className="h-4 w-4" />
                Joined {profile.createdAt ? formatDateShort(profile.createdAt) : "Letterboxd-ET"}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b8c3ce]">{profile.bio || "This member is building their Ethiopian cinema diary."}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isOwnProfile ? (
                <>
                  <Button asChild size="sm"><Link href="/settings"><Pencil className="h-4 w-4" />Edit Profile</Link></Button>
                  <Button asChild size="sm" variant="outline"><Link href="/settings"><Settings className="h-4 w-4" />Settings</Link></Button>
                </>
              ) : user ? <Button size="sm" onClick={toggleFollow} disabled={followBusy || followStatus.isLoading}>{followStatus.data?.following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}{followStatus.data?.following ? "Following" : "Follow"}</Button> : null}
              <Button size="sm" variant="outline" onClick={shareProfile}><Share2 className="h-4 w-4" />Share</Button>
            </div>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            <Stat icon={Film} label="Films Watched" value={profile._count?.diaryEntries ?? diary.length} />
            <Stat icon={MessageSquare} label="Reviews" value={profile._count?.reviews ?? reviews.length} />
            <Stat icon={CalendarDays} label="Diary Entries" value={profile._count?.diaryEntries ?? diary.length} />
            <Stat icon={List} label="Lists" value={profile._count?.lists ?? lists.length} />
            <Stat icon={Eye} label="Watchlist" value={profile._count?.watchlist ?? watchlist.length} />
            <Stat icon={Heart} label="Followers" value={followStatus.data?.followers ?? profile._count?.followers ?? 0} />
            <Stat icon={Heart} label="Following" value={followStatus.data?.followingCount ?? profile._count?.following ?? 0} />
            <Stat icon={Star} label="Avg Rating" value={averageRating ? averageRating.toFixed(1) : "-"} accent={averageRating ? getRatingColor(averageRating) : undefined} />
          </div>
        </div>
      </header>

      <main className="lb-container pt-8">
        <Tabs defaultValue="films">
          <TabsList className="rounded-[4px] border border-border-muted bg-[#101820]">
            <TabsTrigger value="films">Films</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="diary">Diary</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          </TabsList>
          <TabsContent value="films">
            <TabToolbar title="Watched Films" action={<ViewToggle value={filmView} onChange={setFilmView} />} />
            {diary.length ? (
              <>
                {filmView === "grid" ? <PosterGrid entries={diary.slice(0, visible.films)} /> : <FilmList entries={diary.slice(0, visible.films)} />}
                <LoadMore shown={visible.films} total={diary.length} onClick={() => showMore("films")} />
              </>
            ) : <EmptyState title="No watched films yet" description="Diary entries will appear here once this member starts logging films." />}
          </TabsContent>
          <TabsContent value="reviews">
            <TabToolbar title="Reviews" />
            <div className="grid gap-3 md:grid-cols-2">
              {reviews.length ? reviews.slice(0, visible.reviews).map((review) => <ProfileReviewCard key={review.id} review={review} />) : <EmptyState title="No reviews yet" />}
            </div>
            <LoadMore shown={visible.reviews} total={reviews.length} onClick={() => showMore("reviews")} />
          </TabsContent>
          <TabsContent value="diary">
            <div className="mb-4 mt-5 grid gap-2 md:grid-cols-3">
              <MiniStat label="Watched this year" value={diaryStats.thisYear} />
              <MiniStat label="Average rating" value={diaryStats.averageRating ? diaryStats.averageRating.toFixed(1) : "-"} />
              <MiniStat label="Runtime watched" value={formatRuntime(diaryStats.runtime)} />
            </div>
            <div className="space-y-2">{diary.length ? diary.slice(0, visible.diary).map((entry) => <DiaryRow key={entry.id} entry={entry} />) : <EmptyState title="No diary entries yet" />}</div>
            <LoadMore shown={visible.diary} total={diary.length} onClick={() => showMore("diary")} />
          </TabsContent>
          <TabsContent value="lists">
            <TabToolbar title="Lists" />
            <div className="grid gap-3 md:grid-cols-2">{lists.length ? lists.slice(0, visible.lists).map((list) => <ListCard key={list.id} list={list} />) : <EmptyState title="No lists yet" />}</div>
            <LoadMore shown={visible.lists} total={lists.length} onClick={() => showMore("lists")} />
          </TabsContent>
          <TabsContent value="watchlist">
            <TabToolbar title="Watchlist" action={<WatchlistSortSelect value={watchlistSort} onChange={setWatchlistSort} />} />
            {watchlist.length ? <PosterGrid entries={watchlist.slice(0, visible.watchlist)} /> : <EmptyState title="Watchlist is empty" />}
            <LoadMore shown={visible.watchlist} total={watchlist.length} onClick={() => showMore("watchlist")} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; accent?: string }) {
  return <div className="rounded-[4px] border border-border-muted bg-[#101820]/90 p-3"><Icon className="mb-2 h-4 w-4 text-foreground-muted" /><p className="text-xl font-semibold text-foreground" style={accent ? { color: accent } : undefined}>{value}</p><p className="lb-caption">{label}</p></div>;
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-[4px] border border-border-muted bg-[#101820] p-4"><p className="text-2xl font-semibold text-foreground">{value}</p><p className="lb-caption">{label}</p></div>;
}

function TabToolbar({ title, action }: { title: string; action?: React.ReactNode }) {
  return <div className="mb-4 mt-5 flex items-center justify-between gap-3 lb-section-rule pt-3"><h2 className="lb-section-title">{title}</h2>{action}</div>;
}

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (value: ViewMode) => void }) {
  return <div className="flex rounded-[4px] border border-border-muted bg-[#101820] p-1"><IconButton active={value === "grid"} onClick={() => onChange("grid")} icon={Grid2X2} label="Grid view" /><IconButton active={value === "list"} onClick={() => onChange("list")} icon={ListIcon} label="List view" /></div>;
}

function IconButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`grid h-8 w-8 place-items-center rounded-[3px] ${active ? "bg-surface-raised text-foreground" : "text-text-muted hover:text-foreground"}`}><Icon className="h-4 w-4" /></button>;
}

function WatchlistSortSelect({ value, onChange }: { value: WatchlistSort; onChange: (value: WatchlistSort) => void }) {
  return <select value={value} onChange={(event) => onChange(event.target.value as WatchlistSort)} className="h-9 rounded-[4px] border border-border-muted bg-[#101820] px-2 text-sm text-foreground outline-none"><option value="recent">Recently added</option><option value="rating">Highest rated</option><option value="title">Title</option></select>;
}

function PosterGrid({ entries }: { entries: (DiaryEntry | WatchlistEntry)[] }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{entries.map((entry) => <PosterTile key={`${entry.movie.id}-${"watchedAt" in entry ? entry.watchedAt : entry.createdAt}`} entry={entry} />)}</div>;
}

function PosterTile({ entry }: { entry: DiaryEntry | WatchlistEntry }) {
  const date = "watchedAt" in entry ? entry.watchedAt : entry.createdAt;
  const rating = "rating" in entry ? entry.rating : entry.movie.averageRating;
  return <Link href={`/movie/${entry.movie.slug}`} className="group"><div className="poster-shadow relative aspect-[2/3] overflow-hidden rounded-[4px] ring-1 ring-[#3b4856]/70 transition-all group-hover:-translate-y-1 group-hover:ring-accent"><MoviePoster src={entry.movie.posterUrl} alt={entry.movie.title} fill sizes="180px" /></div><h3 className="mt-2 truncate text-sm font-semibold text-foreground">{entry.movie.title}</h3><div className="mt-1 flex items-center justify-between gap-2"><span className="lb-caption">{formatDateShort(date)}</span>{rating ? <RatingStars rating={rating} size="xs" showValue /> : null}</div></Link>;
}

function FilmList({ entries }: { entries: DiaryEntry[] }) {
  return <div className="divide-y divide-border-muted rounded-[4px] border border-border-muted bg-[#101820]">{entries.map((entry) => <DiaryRow key={entry.id} entry={entry} />)}</div>;
}

function ProfileReviewCard({ review }: { review: MovieReview & { movie: MovieSummary } }) {
  return <article className="rounded-[4px] border border-border-muted bg-[#101820] p-4"><div className="flex gap-3"><Link href={`/movie/${review.movie.slug}`} className="relative h-24 w-16 shrink-0 overflow-hidden rounded-[3px]"><MoviePoster src={review.movie.posterUrl} alt={review.movie.title} fill sizes="64px" /></Link><div className="min-w-0 flex-1"><div className="flex items-start gap-2"><div className="min-w-0"><Link href={`/movie/${review.movie.slug}`} className="font-semibold text-foreground hover:text-white">{review.movie.title}</Link><p className="lb-caption">{formatDateShort(review.createdAt)} - {review.likesCount ?? 0} likes</p></div>{review.rating ? <RatingStars rating={review.rating} size="xs" showValue className="ml-auto shrink-0" /> : null}</div><p className="mt-3 line-clamp-4 text-sm leading-6 text-[#b8c3ce]">{review.content}</p></div></div></article>;
}

function DiaryRow({ entry }: { entry: DiaryEntry }) {
  return <Link href={`/movie/${entry.movie.slug}`} className="flex gap-3 rounded-[4px] border border-border-muted bg-[#101820] p-3 transition-colors hover:border-[#536575]"><div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-[3px]"><MoviePoster src={entry.movie.posterUrl} alt={entry.movie.title} fill sizes="44px" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="truncate font-semibold text-foreground">{entry.movie.title}</h3>{entry.rating ? <RatingStars rating={entry.rating} size="xs" showValue /> : null}</div><p className="lb-caption">Watched {formatDateShort(entry.watchedAt)}</p>{entry.notes ? <p className="mt-1 line-clamp-2 text-sm text-[#b8c3ce]">{entry.notes}</p> : null}</div></Link>;
}

function ListCard({ list }: { list: UserList }) {
  return <Link href={`/lists/${list.id}`} className="rounded-[4px] border border-border-muted bg-[#101820] p-4 transition-colors hover:border-[#536575]"><h3 className="font-semibold text-foreground">{list.title}</h3>{list.description ? <p className="mt-2 line-clamp-2 text-sm text-[#b8c3ce]">{truncate(list.description, 120)}</p> : null}<p className="mt-4 lb-caption">{list._count?.movies ?? list.movies?.length ?? 0} films - Created {formatDateShort(list.createdAt)}</p></Link>;
}

function LoadMore({ shown, total, onClick }: { shown: number; total: number; onClick: () => void }) {
  if (shown >= total) return null;
  return <div className="mt-5 flex justify-center"><Button variant="outline" onClick={onClick}>Show more</Button></div>;
}

function sortWatchlist(items: WatchlistEntry[], sort: WatchlistSort) {
  return [...items].sort((a, b) => {
    if (sort === "rating") return b.movie.averageRating - a.movie.averageRating;
    if (sort === "title") return a.movie.title.localeCompare(b.movie.title);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function getDiaryStats(entries: DiaryEntry[]) {
  const year = new Date().getFullYear();
  const rated = entries.filter((entry) => entry.rating);
  const thisYear = entries.filter((entry) => new Date(entry.watchedAt).getFullYear() === year).length;
  const averageRating = rated.length ? rated.reduce((sum, entry) => sum + (entry.rating ?? 0), 0) / rated.length : null;
  const runtime = entries.reduce((sum, entry) => sum + (entry.movie.runtimeMinutes ?? 0), 0);
  return { thisYear, averageRating, runtime };
}

function ProfileSkeleton() {
  return <div className="lb-container py-8"><Skeleton className="h-72 rounded-[4px]" /><div className="mt-5 grid gap-3 md:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-24 rounded-[4px]" />)}</div></div>;
}
