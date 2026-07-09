import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const fallbackMovies = await prisma.movie.findMany({
    where: {
      sources: {
        some: {
          sourceUrl: "https://letterboxd-et.local/seed",
        },
      },
    },
    select: { id: true, title: true },
  });

  if (fallbackMovies.length === 0) {
    console.log("No fallback seed movies found.");
    return;
  }

  const movieIds = fallbackMovies.map((movie) => movie.id);

  await prisma.$transaction([
    prisma.listMovie.deleteMany({ where: { movieId: { in: movieIds } } }),
    prisma.watchlist.deleteMany({ where: { movieId: { in: movieIds } } }),
    prisma.diaryEntry.deleteMany({ where: { movieId: { in: movieIds } } }),
    prisma.review.deleteMany({ where: { movieId: { in: movieIds } } }),
    prisma.rating.deleteMany({ where: { movieId: { in: movieIds } } }),
    prisma.movieTrailer.deleteMany({ where: { movieId: { in: movieIds } } }),
    prisma.movieCredit.deleteMany({ where: { movieId: { in: movieIds } } }),
    prisma.movieGenre.deleteMany({ where: { movieId: { in: movieIds } } }),
    prisma.movieSource.deleteMany({ where: { movieId: { in: movieIds } } }),
    prisma.movie.deleteMany({ where: { id: { in: movieIds } } }),
  ]);

  console.log(`Removed ${fallbackMovies.length} fallback seed movies.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
