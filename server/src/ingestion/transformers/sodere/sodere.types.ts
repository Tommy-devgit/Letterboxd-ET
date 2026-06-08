export interface SodereRawEntry {
  url: string;
  data: SodereApiResponse;
}

export interface SodereApiResponse {
  items?: SodereItem[];
  _embedded?: {
    items?: SodereItem[];
  };
  count?: number;
  total?: number;
}

export interface SodereItem {
  id?: number | string;
  entity?: SodereEntity;
  type?: string;
  created_at?: string;
  updated_at?: string;
  position?: number;
  title?: string;
  slug?: string;
}

export interface SodereEntity {
  id?: number | string;
  title?: string;
  name?: string;
  slug?: string;
  type?: string;
  description?: string;
  /** Duration in seconds */
  duration?: number;
  thumbnail?: SodereThumbnail | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface SodereThumbnail {
  small?: string;
  medium?: string;
  large?: string;
  'x-large'?: string;
}
