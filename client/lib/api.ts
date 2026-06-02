type MovieSummary = {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  releaseYear: number | null;
  synopsis: string | null;
  posterUrl: string | null;
  averageRating: number;
  reviewCount: number;
  genres: string[];
  directors: string[];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getFeaturedMovies(): Promise<MovieSummary[]> {
  try {
    const response = await fetch(`${apiUrl}/api/movies/featured`, {
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error("Failed to load featured movies");
    }

    return response.json();
  } catch {
    return fallbackMovies;
  }
}

const fallbackMovies: MovieSummary[] = [
  {
    id: "difret",
    slug: "difret",
    title: "Difret",
    originalTitle: "Difret",
    releaseYear: 2014,
    synopsis: "A landmark legal drama and an essential entry point into contemporary Ethiopian cinema.",
    posterUrl: null,
    averageRating: 4.4,
    reviewCount: 138,
    genres: ["Drama", "Legal"],
    directors: ["Zeresenay Berhane Mehari"]
  },
  {
    id: "teza",
    slug: "teza",
    title: "Teza",
    originalTitle: "Teza",
    releaseYear: 2008,
    synopsis: "A sweeping story of exile, memory, politics, and returning home.",
    posterUrl: null,
    averageRating: 4.5,
    reviewCount: 96,
    genres: ["Drama", "History"],
    directors: ["Haile Gerima"]
  },
  {
    id: "lamb",
    slug: "lamb",
    title: "Lamb",
    originalTitle: "Lamb",
    releaseYear: 2015,
    synopsis: "A tender rural coming-of-age film about grief, belonging, and a beloved lamb.",
    posterUrl: null,
    averageRating: 4.1,
    reviewCount: 81,
    genres: ["Drama", "Coming of age"],
    directors: ["Yared Zeleke"]
  }
];
