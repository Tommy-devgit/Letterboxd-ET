# Letterboxd ET

A scalable Ethiopian cinema discovery, tracking, and review platform.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, shadcn/ui-style components
- Backend: NestJS REST API
- Database: PostgreSQL
- ORM: Prisma
- Search: PostgreSQL full-text search first, Meilisearch or Elasticsearch later
- Auth: Auth.js planned for the web app
- Storage: Cloudflare R2 for posters, avatars, and cover images
- Caching: Redis for trending movies, popular reviews, and recommendation data
- Deployment: Vercel for the client, Railway or Render for the API, Neon for Postgres
- Movie API From Sodere,TMDB, YOUTUBE

## Structure

```text
client/            Next.js app
server/            NestJS API and Prisma schema
packages/shared/   Shared TypeScript contracts
```

## Run

The client has already been installed.

```bash
npm --prefix client run dev
```

After installing the backend dependencies:

```bash
npm --prefix server install
npm run db:generate
npm run dev:server
```

## Product Foundation

- SEO-friendly movie profiles
- Ratings, reviews, watchlists, follows, and lists
- Structured people, cast, director, and genre relationships
- Local Ethiopian context: Amharic and English support, streaming availability, cinema schedules, festival coverage, and film history
