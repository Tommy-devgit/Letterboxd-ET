export type LanguageCode = "am" | "en" | "om" | "ti";
export type CreditRole = "ACTOR" | "DIRECTOR" | "WRITER" | "PRODUCER" | "CINEMATOGRAPHER" | "EDITOR" | "COMPOSER";
export interface PaginatedResponse<T> { data: T[]; page: number; pageSize: number; total: number; }
export interface MovieSummary { id: string; slug: string; title: string; originalTitle: string | null; releaseYear: number | null; synopsis: string | null; posterUrl: string | null; averageRating: number; reviewCount: number; genres: string[]; directors: string[]; runtimeMinutes?: number | null; }
export interface MovieCredit { role: CreditRole; characterName: string | null; person: { id: string; fullName: string; photoUrl: string | null }; }
export interface MovieReview { id: string; content: string; createdAt: string; rating?: number | null; likesCount?: number; movie?: { id: string; slug: string; title: string; posterUrl: string | null; releaseYear: number | null }; user: { id: string; username: string; profilePicture: string | null }; }
export interface MovieDetail { id: string; slug: string; title: string; originalTitle: string | null; releaseDate: string | null; synopsis: string | null; posterUrl: string | null; backdropUrl: string | null; runtimeMinutes: number | null; averageRating: number; ratingsCount: number; genres: { genre: { id: string; name: string } }[]; country: { name: string; code: string } | null; language: { name: string; code: string } | null; credits: MovieCredit[]; ratings: { rating: number }[]; reviews: MovieReview[]; trailers: { id: string; title: string; youtubeUrl: string }[]; sources: { sourceName: string; sourceUrl: string }[]; }
export interface DiaryEntry { id: string; watchedAt: string; rating: number | null; notes: string | null; movie: MovieSummary; }
export interface WatchlistEntry { createdAt: string; movie: MovieSummary; }
export interface ListItem { movie: MovieSummary; position: number; }
export interface List { id: string; title: string; description: string | null; createdAt: string; user?: { id: string; username: string; profilePicture?: string | null }; _count?: { movies: number }; movies: ListItem[]; }
export interface User { id: string; username: string; email: string; profilePicture: string | null; bio: string | null; createdAt?: string; _count?: { ratings: number; reviews: number; watchlist: number; diaryEntries: number; lists: number; followers: number; following: number }; }
export interface ActivityItem { id: string; type: "watched" | "rated" | "reviewed" | "watchlisted" | "listed"; createdAt: string; rating?: number | null; user: { id: string; username: string; profilePicture: string | null }; movie?: { id: string; slug: string; title: string; posterUrl: string | null }; list?: { id: string; title: string }; }
export interface PersonSummary { id: string; fullName: string; photoUrl: string | null; bio?: string | null; _count: { credits: number }; }
export interface PersonDetail extends PersonSummary { birthDate: string | null; credits: { role: CreditRole; characterName: string | null; movie: MovieSummary }[]; }
export interface UserProfile extends User { favoriteMovies?: { movie: MovieSummary; position: number }[]; ratings?: { rating: number; updatedAt: string; movie: MovieSummary }[]; reviews?: (MovieReview & { movie: MovieSummary })[]; diaryEntries?: DiaryEntry[]; lists?: List[]; watchlist?: WatchlistEntry[]; }
export interface MovieQueryParams { query?: string; genre?: string; language?: LanguageCode; page?: number; pageSize?: number; }
export interface SearchResults { movies: MovieSummary[]; people: PersonSummary[]; users: User[]; lists: List[]; }
export interface FollowStatus { following: boolean; followers: number; followingCount: number; }
