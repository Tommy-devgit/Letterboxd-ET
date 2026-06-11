// ---------------------------------------------------------------------------
// Shared thumbnail shape (used in both API endpoints)
// ---------------------------------------------------------------------------
export interface SodereThumbnail {
  small?: string;
  medium?: string;
  large?: string;
  source?: string;
  blurred?: string;
}

// ---------------------------------------------------------------------------
// Line 1: collections/{id}/items  —  items are nested under item.entity
// ---------------------------------------------------------------------------
export interface SodereRawEntry {
  url: string;
  data: SodereCollectionResponse | SodereFeaturedResponse;
}

export interface SodereCollectionResponse {
  items?: SodereCollectionItem[];
  pagination?: unknown;
}

export interface SodereCollectionItem {
  id?: number | string;
  entity?: SodereCollectionEntity;
  entity_id?: number | string;
  entity_type?: string;
  position?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SodereCollectionEntity {
  id?: number | string;
  title?: string;
  name?: string;
  slug?: string;
  type?: string;
  description?: string;
  short_description?: string;
  /** Duration object: { seconds: N } */
  duration?: { seconds?: number };
  /** true when this video IS a trailer */
  trailer?: boolean;
  /** Keyed by aspect ratio e.g. "16_9" */
  thumbnails?: {
    '16_9'?: SodereThumbnail;
    '2_3'?: SodereThumbnail;
    [key: string]: SodereThumbnail | undefined;
  };
  page_url?: string;
  metadata?: {
    cast?: unknown;
    crew?: unknown;
    genres?: unknown;
    release_dates?: unknown;
    tags?: unknown;
  };
  created_at?: string;
  updated_at?: string;
}

// ---------------------------------------------------------------------------
// Line 3: products/featured_items  —  items are flat under _embedded.items
// Two sub-schemas depending on whether type=="movie"/"series" or "video"
// ---------------------------------------------------------------------------
export interface SodereFeaturedResponse {
  _embedded?: { items?: SodereFeaturedItem[] };
  count?: number;
  total?: number;
  _links?: unknown;
}

export interface SodereFeaturedItem {
  id: number | string;

  /** Movie/series type: Amharic + English combined e.g. "የኔ ቀን Yene Ken" */
  name?: string;
  /** Video type: English title e.g. "Bemenore Full Movie" */
  title?: string;

  /** Movie/series type: clean slug e.g. "yene-ken" */
  slug?: string;
  /** Video type: slug path e.g. "bemenore-full-movie" */
  url?: string | null;

  /** "movie" | "series" | "video" */
  type?: string;

  description?: string | null;
  short_description?: string | null;

  /** Duration object — present in both schemas */
  duration?: { seconds?: number; formatted?: string };
  /** Alternative duration field on video-type items */
  seconds_count?: number | null;

  /** Direct thumbnail (used in both schemas) */
  thumbnail?: SodereThumbnail;

  additional_images?: {
    aspect_ratio_12_5_logo?: string | null;
    aspect_ratio_16_6?: string | null;
    aspect_ratio_16_14?: string | null;
    aspect_ratio_16_9_background?: string | null;
  };

  /** Sodere URL to the trailer video — movie/series type only */
  trailer_url?: string | null;

  _links?: {
    collection_page?: { href?: string };
    video_page?: { href?: string };
  };

  videos_count?: number;
  created_at?: string;
  updated_at?: string;

  // Video-type extras
  is_free?: boolean;
  status?: string;
  product_ids?: number[];
}
