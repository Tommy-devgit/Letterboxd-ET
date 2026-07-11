"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { peopleApi } from "@/lib/api";

export default function PeoplePage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["people", query],
    queryFn: () => peopleApi.list({ query, pageSize: 48 }),
  });

  return (
    <div className="lb-container py-8">
      <div className="mb-5 lb-section-rule pt-2"><h1 className="lb-section-title">People</h1></div>
      <div className="mb-6 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input className="pl-9" placeholder="Search cast and crew" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && setQuery(input.trim())} />
        </div>
        <Button onClick={() => setQuery(input.trim())}>Search</Button>
      </div>
      {isLoading ? <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 12 }, (_, index) => <Skeleton key={index} className="h-20 rounded-[4px]" />)}</div> : null}
      {error ? <ErrorState retry={() => refetch()} /> : null}
      {data?.data.length === 0 ? <EmptyState title="No people found" /> : null}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(data?.data ?? []).map((person) => (
          <Link key={person.id} href={`/people/${person.id}`} className="flex items-center gap-3 rounded-[4px] border border-border-muted bg-[#101820] p-3 hover:border-[#536575]">
            <Avatar className="h-12 w-12"><AvatarImage src={person.photoUrl ?? undefined} alt={person.fullName} /><AvatarFallback><UserRound className="h-5 w-5" /></AvatarFallback></Avatar>
            <div><h2 className="font-semibold text-foreground">{person.fullName}</h2><p className="lb-caption">{person._count.credits} credits</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
