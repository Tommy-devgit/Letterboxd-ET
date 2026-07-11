"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { RatingStars } from "@/components/common/rating-stars";
import { MoviePoster } from "@/components/movie/movie-poster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { peopleApi } from "@/lib/api";
import { formatDateShort } from "@/lib/utils";

const roleLabels: Record<string, string> = { ACTOR: "Actor", DIRECTOR: "Director", WRITER: "Writer", PRODUCER: "Producer", CINEMATOGRAPHER: "Cinematographer", EDITOR: "Editor", COMPOSER: "Composer" };

export default function PersonPage() {
  const id = useParams().id as string;
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["person", id], queryFn: () => peopleApi.get(id), enabled: Boolean(id) });

  if (isLoading) return <div className="lb-container py-8"><Skeleton className="h-64 rounded-[4px]" /></div>;
  if (error || !data) return <div className="lb-container py-16"><ErrorState title="Person not found" retry={() => refetch()} /></div>;

  return (
    <div className="lb-container py-8">
      <header className="flex flex-col gap-5 border-b border-border-muted pb-6 md:flex-row">
        <Avatar className="h-36 w-36 rounded-[4px] bg-[#101820]"><AvatarImage src={data.photoUrl ?? undefined} alt={data.fullName} /><AvatarFallback className="rounded-[4px]"><UserRound className="h-12 w-12" /></AvatarFallback></Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl font-semibold text-foreground">{data.fullName}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-text-muted"><CalendarDays className="h-4 w-4" />{data.birthDate ? `Born ${formatDateShort(data.birthDate)}` : `${data.credits.length} film credits`}</p>
          {data.bio ? <p className="mt-4 max-w-3xl text-sm leading-6 text-[#b8c3ce]">{data.bio}</p> : null}
        </div>
      </header>
      <section className="mt-8">
        <div className="mb-4 lb-section-rule pt-2"><h2 className="lb-section-title">Filmography</h2></div>
        {data.credits.length ? <div className="grid gap-3 md:grid-cols-2">{data.credits.map((credit) => <Link key={`${credit.movie.id}-${credit.role}-${credit.characterName ?? ""}`} href={`/movie/${credit.movie.slug}`} className="flex gap-3 rounded-[4px] border border-border-muted bg-[#101820] p-3 hover:border-[#536575]"><div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-[3px]"><MoviePoster src={credit.movie.posterUrl} alt={credit.movie.title} fill sizes="64px" /></div><div className="min-w-0"><h3 className="font-semibold text-foreground">{credit.movie.title}</h3><p className="lb-caption">{roleLabels[credit.role] ?? credit.role}{credit.characterName ? ` as ${credit.characterName}` : ""}</p>{credit.movie.averageRating ? <RatingStars rating={credit.movie.averageRating} size="xs" showValue className="mt-2" /> : null}</div></Link>)}</div> : <EmptyState title="No credits available" />}
      </section>
    </div>
  );
}
