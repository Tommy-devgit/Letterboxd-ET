import { CreditRole, PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

const prisma = new PrismaClient();
const seededPasswordHash = hashSeedPassword("Password123!");

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

  const country = await prisma.country.upsert({
    where: { code: "ET" },
    update: {},
    create: { code: "ET", name: "Ethiopia" },
  });

  const languages = await Promise.all(
    [
      { code: "am", name: "Amharic" },
      { code: "om", name: "Oromo" },
      { code: "ti", name: "Tigrinya" },
      { code: "en", name: "English" },
    ].map((language) =>
      prisma.language.upsert({
        where: { code: language.code },
        update: {},
        create: language,
      }),
    ),
  );

  const movies = await prisma.movie.findMany({
    take: 40,
    orderBy: { title: "asc" },
  });

  const people = [
    "Haile Gerima",
    "Zeresenay Berhane Mehari",
    "Yared Zeleke",
    "Jessica Beshir",
    "Hermon Hailay",
    "Meron Getnet",
    "Girum Ermias",
    "Betelhem Asmamawe",
    "Solomon Bogale",
    "Ruth Negga",
  ];

  for (let index = 0; index < Math.min(movies.length, people.length); index++) {
    const person = await prisma.person.upsert({
      where: { id: `seed-person-${index + 1}` },
      update: { fullName: people[index] },
      create: { id: `seed-person-${index + 1}`, fullName: people[index] },
    });

    await prisma.movieCredit.upsert({
      where: {
        movieId_personId_role_characterName: {
          movieId: movies[index].id,
          personId: person.id,
          role: index < 5 ? CreditRole.DIRECTOR : CreditRole.ACTOR,
          characterName: index < 5 ? "" : "Lead",
        },
      },
      update: {},
      create: {
        movieId: movies[index].id,
        personId: person.id,
        role: index < 5 ? CreditRole.DIRECTOR : CreditRole.ACTOR,
        characterName: index < 5 ? "" : "Lead",
      },
    });
  }

  const seedUsers = [
    "Abel",
    "Hana",
    "Dawit",
    "Meron",
    "Nahom",
    "Bethlehem",
    "Henok",
    "Selam",
    "Meklit",
    "Kidus",
    "Tigist",
    "Yonatan",
    "Liya",
    "Saron",
    "Biniyam",
    "Mahlet",
    "Eyob",
    "Feven",
    "Amanuel",
    "Rediet",
    "Samrawit",
    "Kaleb",
  ];

  const users = [];
  for (const name of seedUsers) {
    users.push(
      await prisma.user.upsert({
        where: { email: `${name.toLowerCase()}@letterboxd-et.local` },
        update: {
          username: name.toLowerCase(),
          passwordHash: seededPasswordHash,
          bio: `${name} watches Ethiopian cinema, writes notes, and keeps a growing film diary.`,
        },
        create: {
          username: name.toLowerCase(),
          email: `${name.toLowerCase()}@letterboxd-et.local`,
          passwordHash: seededPasswordHash,
          bio: `${name} watches Ethiopian cinema, writes notes, and keeps a growing film diary.`,
        },
      }),
    );
  }

  const reviewTexts = [
    "A patient and deeply felt film. The quiet scenes carry more weight than most speeches.",
    "እጅግ የሚነካ ፊልም ነው። ታሪኩ ቀላል ቢመስልም ስሜቱ በጣም ጠንካራ ነው።",
    "Loved how the city is filmed here. Addis feels lived-in, not decorated.",
    "The performances are restrained in the best way. Everyone seems to be carrying history.",
    "በቤተሰብ ግንኙነት ላይ ያለው ትኩረት በጣም አሳማኝ ነው።",
    "Some pacing issues, but the final act really lands. I kept thinking about the last shot.",
    "A beautiful blend of memory, migration, and responsibility. Very Ethiopian, very universal.",
    "ጥሩ ድራማ። The silence between characters says almost everything.",
    "The music is subtle and warm. It never pushes the emotion too hard.",
    "A crowd-pleaser with real sadness underneath. That balance is hard to pull off.",
    "ተዋናዮቹ በጣም ተፈጥሯዊ ናቸው። I believed every conversation.",
    "Not perfect, but honest. I prefer a film with a pulse over a polished empty one.",
  ];

  const allowedRatings = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  for (let index = 0; index < 120; index++) {
    const user = users[index % users.length];
    const movie = movies[index % movies.length];
    const rating = allowedRatings[(index * 7) % allowedRatings.length];

    await prisma.rating.upsert({
      where: { userId_movieId: { userId: user.id, movieId: movie.id } },
      update: { rating },
      create: { userId: user.id, movieId: movie.id, rating },
    });

    if (index < 70) {
      await prisma.review.upsert({
        where: { userId_movieId: { userId: user.id, movieId: movie.id } },
        update: { content: reviewTexts[index % reviewTexts.length] },
        create: {
          userId: user.id,
          movieId: movie.id,
          content: reviewTexts[index % reviewTexts.length],
        },
      });
    }

    if (index < 45) {
      await prisma.diaryEntry.create({
        data: {
          userId: user.id,
          movieId: movie.id,
          watchedAt: new Date(Date.now() - index * 86400000),
          rating,
          notes: index % 3 === 0 ? "Rewatching this revealed a lot more texture." : null,
        },
      }).catch(() => undefined);
    }

    if (index < 80) {
      await prisma.watchlist.upsert({
        where: { userId_movieId: { userId: user.id, movieId: movies[(index + 3) % movies.length].id } },
        update: {},
        create: { userId: user.id, movieId: movies[(index + 3) % movies.length].id },
      });
    }
  }

  const listSeeds = [
    "Top Ethiopian Films",
    "Best Ethiopian Dramas",
    "Classic Ethiopian Cinema",
    "Must Watch Ethiopian Films",
    "Hidden Gems",
    "Award Winners",
    "Addis Nights",
    "Diaspora Stories",
    "Family and Memory",
    "Festival Favorites",
  ];

  for (let listIndex = 0; listIndex < listSeeds.length; listIndex++) {
    const owner = users[listIndex % users.length];
    const list = await prisma.list.upsert({
      where: { id: `seed-list-${listIndex + 1}` },
      update: {
        title: listSeeds[listIndex],
        description: "A community-built Ethiopian cinema list seeded for discovery.",
      },
      create: {
        id: `seed-list-${listIndex + 1}`,
        userId: owner.id,
        title: listSeeds[listIndex],
        description: "A community-built Ethiopian cinema list seeded for discovery.",
      },
    });

    for (let position = 0; position < Math.min(6, movies.length); position++) {
      const movie = movies[(listIndex + position) % movies.length];
      await prisma.listMovie.upsert({
        where: { listId_movieId: { listId: list.id, movieId: movie.id } },
        update: { position },
        create: { listId: list.id, movieId: movie.id, position },
      });
    }
  }

  for (const movie of movies) {
    const aggregate = await prisma.rating.aggregate({
      where: { movieId: movie.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.movie.update({
      where: { id: movie.id },
      data: {
        averageRating: aggregate._avg.rating ?? 0,
        ratingsCount: aggregate._count.rating,
      },
    });
  }

  console.log(
    `Seeded ${genres.length} genres, ${users.length} users, 120 ratings, 70 reviews, ${listSeeds.length} lists, diary entries, and watchlists.`,
  );
}

function hashSeedPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
