import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const genres = [
    "Drama",
    "Comedy",
    "Romance",
    "Action",
    "Thriller",
    "Crime",
    "Mystery",
    "Historical",
    "Documentary",
    "Family",
    "Adventure",
    "Fantasy",
    "Biography",
    "War",
    "Musical",
    "Horror",
    "Sci-Fi",
    "Animation",
    "Sport",
    "Western",
  ];

  for (const name of genres) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Genres seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });