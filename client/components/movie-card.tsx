import { Button } from "@/components/ui/button";

type MovieCardProps = {
  movie: {
    id: string;
    title: string;
    releaseYear: number | null;
    synopsis: string | null;
    averageRating: number;
    reviewCount: number;
    genres: string[];
    directors: string[];
  };
  tone: "green" | "gold" | "red";
};

const posterTones = {
  green: "from-emerald-950 via-emerald-700 to-amber-500",
  gold: "from-zinc-950 via-amber-700 to-red-800",
  red: "from-red-950 via-stone-800 to-emerald-700"
};

export function MovieCard({ movie, tone }: MovieCardProps) {
  return (
    <article className="grid min-h-full gap-4 rounded-lg border border-border bg-surface p-3">
      <div className={`flex aspect-[2/3] items-end rounded-md bg-linear-to-br ${posterTones[tone]} p-4`}>
        <h3 className="text-2xl font-black leading-none text-white">{movie.title}</h3>
      </div>

      <div className="grid gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">
            {movie.releaseYear ?? "TBA"} / {movie.genres.slice(0, 2).join(", ")}
          </p>
          <h2 className="text-lg font-bold">{movie.title}</h2>
          <p className="text-sm text-muted-foreground">{movie.directors.join(", ")}</p>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{movie.synopsis}</p>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">{movie.averageRating.toFixed(1)} avg</span>
          <Button variant="secondary">Watchlist</Button>
        </div>
      </div>
    </article>
  );
}
