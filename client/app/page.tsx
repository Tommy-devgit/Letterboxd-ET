import { MovieCard } from "@/components/movie-card";
import { LinkButton } from "@/components/ui/button";
import { getFeaturedMovies } from "@/lib/api";

const platformStats = [
  { label: "Core stack", value: "Next + Nest" },
  { label: "Database", value: "Postgres" },
  { label: "Search path", value: "FTS first" }
];

const productPillars = [
  {
    title: "Movie profiles",
    body: "Synopsis, cast, director, trailer, ratings, reviews, posters, and local availability."
  },
  {
    title: "Community graph",
    body: "Watchlists, favorites, follows, lists, and reviews turn the catalog into a social platform."
  },
  {
    title: "Ethiopian context",
    body: "Amharic and English support, cinema schedules, festival coverage, and Ethiopian film history."
  }
];

const architecture = ["Next.js", "NestJS API", "PostgreSQL", "Prisma", "Redis", "Cloudflare R2"];

export default async function Home() {
  const movies = await getFeaturedMovies();

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground">
            LE
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Ethiopian cinema platform</p>
            <h1 className="text-xl font-black">Letterboxd ET</h1>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2" aria-label="Primary navigation">
          <LinkButton href="#movies" variant="ghost">Movies</LinkButton>
          <LinkButton href="#architecture" variant="ghost">Architecture</LinkButton>
          <LinkButton href="#roadmap" variant="ghost">Roadmap</LinkButton>
          <LinkButton href="#movies">Explore</LinkButton>
        </nav>
      </header>

      <section className="grid min-h-[32rem] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          <div className="grid gap-4">
            <p className="text-sm font-semibold uppercase text-primary">Letterboxd + IMDb for Ethiopia</p>
            <h2 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-normal sm:text-7xl">
              Discover, track, and review Ethiopian films.
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              A scalable social catalog for Ethiopian cinema with bilingual discovery, structured movie metadata,
              watchlists, ratings, reviews, lists, and local availability.
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            {platformStats.map((stat) => (
              <div key={stat.label} className="border-l-2 border-primary bg-surface px-4 py-3">
                <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                <dd className="text-xl font-black">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid gap-4 rounded-lg border border-border bg-surface p-4">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Featured now</p>
            <h2 className="text-2xl font-black">Catalog preview</h2>
          </div>
          <div className="grid gap-4">
            {movies.slice(0, 3).map((movie, index) => (
              <div key={movie.id} className="grid grid-cols-[5rem_1fr] gap-3 rounded-md bg-background/70 p-2">
                <div className="rounded bg-linear-to-br from-emerald-900 via-amber-700 to-red-900" />
                <div>
                  <h3 className="font-bold">{movie.title}</h3>
                  <p className="text-sm text-muted-foreground">{movie.releaseYear}</p>
                  <p className="text-sm font-semibold text-primary">
                    {movie.averageRating.toFixed(1)} average / {movie.reviewCount} reviews
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="movies" className="grid gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">SEO-ready catalog</p>
          <h2 className="text-3xl font-black">Movie profiles with community data</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} tone={["green", "gold", "red"][index % 3] as "green" | "gold" | "red"} />
          ))}
        </div>
      </section>

      <section id="architecture" className="grid gap-4 rounded-lg border border-border bg-surface p-5">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">Scalable stack</p>
          <h2 className="text-3xl font-black">Architecture foundation</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-6">
          {architecture.map((item) => (
            <div key={item} className="rounded-md border border-border bg-background p-4 text-center font-bold">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="roadmap" className="grid gap-4 md:grid-cols-3">
        {productPillars.map((pillar) => (
          <article key={pillar.title} className="grid gap-3 rounded-lg border border-border bg-surface p-5">
            <h2 className="text-xl font-black">{pillar.title}</h2>
            <p className="leading-7 text-muted-foreground">{pillar.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
