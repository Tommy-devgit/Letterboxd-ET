import type { MovieReview, MovieSummary } from "@/types";

export type SeedReview = MovieReview & {
  movieTitle: string;
  rating: number;
  likes: number;
};

export type SeedList = {
  id: string;
  title: string;
  description: string;
  author: string;
  likes: number;
  comments: number;
  films: string[];
};

export type SeedActivity = {
  id: string;
  user: string;
  action: "watched" | "rated" | "reviewed" | "watchlisted" | "listed";
  subject: string;
  meta: string;
};

export const communityUsers = [
  "selamframes",
  "habesha_noir",
  "addisafterdark",
  "meklitwatches",
  "cinema_bunna",
  "tizita_tapes",
  "redsea_reels",
  "queenofsheba",
  "gondarghost",
  "bolecinephile",
  "dire_dawa_cut",
  "waliafilmclub",
  "kidusreviews",
  "lucy_projector",
  "merkato_matinee",
  "hararhouse",
  "abyssinia35mm",
  "blue_nile_notes",
  "axumarchives",
  "injera_intercut",
];

const reviewBodies = [
  "A patient, beautifully observed film that trusts faces more than speeches. The ending stayed with me all evening.",
  "The city feels alive in every frame. I wanted a little more from the final act, but the emotional texture is undeniable.",
  "Quietly devastating. It has the rhythm of family gossip, old wounds, and people trying to be graceful when grace is expensive.",
  "The performances carry so much unsaid history. Even the pauses feel written with care.",
  "A little uneven, but when it lands it really lands. The music choices are warm without becoming sentimental.",
  "This is the kind of Ethiopian drama that understands rooms: who sits near the door, who controls the silence, who has already forgiven too much.",
  "Loved the location work. Addis is photographed with affection, not tourism, and that makes a huge difference.",
  "A sharp, compact story about pride and compromise. I wish the supporting characters had more space, but the lead is magnetic.",
  "Funny in a way that sneaks up on you. The comedy comes from recognition, not punchlines.",
  "The final conversation is staged so simply and still manages to feel enormous.",
  "Messier than I expected, in a good way. It lets people contradict themselves without punishing them for being human.",
  "The poster promised melodrama and the film delivered something gentler: a memory piece about leaving and returning.",
  "Some scenes run long, but the long takes give the actors room to breathe. I respect the confidence.",
  "A film full of small humiliations and tiny mercies. That combination is very hard to fake.",
  "The sound design is subtle: streets, church bells, radios, coffee cups. It gives the movie a lived-in pulse.",
  "I came for the premise and stayed for the grandmother. She owns every scene with one look.",
  "A tender watch. Not flawless, but sincere in a way that feels increasingly rare.",
  "The script occasionally explains what the images already told us, but the images are strong enough to forgive it.",
  "An elegant portrait of ambition rubbing against obligation. The last shot is perfect.",
  "This would play beautifully with a crowd. Lots of knowing laughs, then a quiet walk home.",
  "A lean story with no wasted characters. Every scene seems to ask what community costs and what it gives back.",
  "The romance is handled with restraint, which makes it more believable. Chemistry without fireworks, just recognition.",
  "I admire how specific it is about work, money, and reputation. Those details make the drama hit harder.",
  "The camera keeps finding hands: pouring coffee, counting bills, fixing collars. Lovely visual storytelling.",
  "One of those films where the flaws are visible but the feeling is stronger than the flaws.",
];

const movieTitles = [
  "Teza",
  "Difret",
  "Lamb",
  "Harvest: 3,000 Years",
  "The Athlete",
  "Price of Love",
  "Crumbs",
  "Faya Dayi",
  "Sweetness in the Belly",
  "Sankofa",
  "Running Against the Wind",
  "Fig Tree",
  "Red Leaves",
  "A Fool God",
  "Enchained",
  "Hirut",
  "Yewendoch Guday",
  "Semayawi Feres",
  "Eyerus",
  "Taza",
];

export const seedReviews: SeedReview[] = Array.from({ length: 100 }, (_, index) => {
  const user = communityUsers[index % communityUsers.length];
  const body = reviewBodies[index % reviewBodies.length];
  const title = movieTitles[index % movieTitles.length];
  const day = String((index % 28) + 1).padStart(2, "0");
  const month = String(((index * 3) % 12) + 1).padStart(2, "0");
  const rating = [8, 7, 9, 6, 8.5, 7.5, 9.5, 6.5, 8, 7][index % 10];

  return {
    id: `seed-review-${index + 1}`,
    movieTitle: title,
    rating,
    likes: 4 + ((index * 7) % 68),
    content:
      index % 9 === 0
        ? `${body} I keep thinking about how the film balances private grief with public pressure; nobody gets an easy exit, and that honesty is what makes it linger.`
        : index % 4 === 0
          ? `${body} Strong recommendation.`
          : body,
    createdAt: `2026-${month}-${day}T12:00:00.000Z`,
    user: {
      id: `seed-user-${user}`,
      username: user,
      profilePicture: null,
    },
  };
});

export const seedLists: SeedList[] = [
  {
    id: "top-ethiopian-films",
    title: "Top Ethiopian Films",
    description: "Canonical starting points, festival favorites, and films people keep returning to.",
    author: "abyssinia35mm",
    likes: 812,
    comments: 46,
    films: ["Teza", "Difret", "Lamb", "Harvest: 3,000 Years", "Faya Dayi"],
  },
  {
    id: "best-ethiopian-dramas",
    title: "Best Ethiopian Dramas",
    description: "Family, migration, memory, and moral pressure rendered with patience.",
    author: "meklitwatches",
    likes: 534,
    comments: 29,
    films: ["Price of Love", "Fig Tree", "Red Leaves", "Running Against the Wind"],
  },
  {
    id: "classic-ethiopian-cinema",
    title: "Classic Ethiopian Cinema",
    description: "Older landmarks and historically essential works for Ethiopian film context.",
    author: "axumarchives",
    likes: 477,
    comments: 18,
    films: ["Harvest: 3,000 Years", "A Fool God", "Sankofa", "Teza"],
  },
  {
    id: "must-watch-ethiopian-films",
    title: "Must Watch Ethiopian Films",
    description: "A compact syllabus for friends who ask where to begin.",
    author: "waliafilmclub",
    likes: 391,
    comments: 22,
    films: ["Difret", "Lamb", "The Athlete", "Crumbs", "Faya Dayi"],
  },
  {
    id: "hidden-gems",
    title: "Hidden Gems",
    description: "Underrated discoveries, hard-to-find favorites, and conversation starters.",
    author: "bolecinephile",
    likes: 284,
    comments: 14,
    films: ["Enchained", "Eyerus", "Semayawi Feres", "Hirut"],
  },
  {
    id: "award-winners",
    title: "Award Winners",
    description: "Ethiopian and diaspora films recognized at festivals and awards circuits.",
    author: "redsea_reels",
    likes: 359,
    comments: 19,
    films: ["Difret", "Lamb", "Teza", "The Athlete"],
  },
];

export const popularActors = [
  "Meron Getnet",
  "Tizita Hagere",
  "Girum Ermias",
  "Betelhem Asmamawe",
  "Solomon Bogale",
  "Mekdes Tsegaye",
  "Ashenafi Nigusu",
  "Ruth Negga",
];

export const popularDirectors = [
  "Haile Gerima",
  "Zeresenay Berhane Mehari",
  "Yared Zeleke",
  "Jessica Beshir",
  "Hermon Hailay",
  "Jan Philipp Weyl",
  "Salem Mekuria",
  "Aida Ashenafi",
];

export function buildActivity(movies: MovieSummary[]): SeedActivity[] {
  const subjects = movies.length ? movies.map((movie) => movie.title) : movieTitles;

  return Array.from({ length: 16 }, (_, index) => {
    const action = ["watched", "rated", "reviewed", "watchlisted", "listed"][
      index % 5
    ] as SeedActivity["action"];
    const subject = subjects[index % subjects.length];

    return {
      id: `activity-${index + 1}`,
      user: communityUsers[(index * 3) % communityUsers.length],
      action,
      subject,
      meta:
        action === "rated"
          ? `${[4, 4.5, 3.5, 5][index % 4]} stars`
          : action === "listed"
            ? seedLists[index % seedLists.length].title
            : `${index + 2}h ago`,
    };
  });
}

export function reviewsForMovie(movieTitle: string, movieId: string): SeedReview[] {
  return seedReviews
    .filter((review) => review.movieTitle === movieTitle)
    .slice(0, 8)
    .map((review) => ({ ...review, id: `${movieId}-${review.id}` }));
}
