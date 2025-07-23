export interface Genre {
  id: number;
  title: string;
}

export interface Country {
  id: number;
  title: string;
  image?: string;
}

export interface Source {
  id: number;
  quality: string | null;
  type: string;
  url: string;
}

export interface Episode {
  id: number;
  title: string;
  description: string | null;
  duration: string | null;
  downloadas: string;
  playas: string;
  sources: Source[];
}

export interface Season {
  id: number;
  title: string;
  episodes: Episode[];
}

export interface Movie {
  id: number;
  type: string;
  title: string;
  description: string;
  year: number;
  imdb: number;
  comment: boolean;
  rating: number;
  duration: string | null;
  downloadas: string;
  playas: string;
  classification: string | null;
  image: string;
  cover: string;
  genres: Genre[];
  sources: Source[];
  country: Country[];
}

export interface Series {
  id: number;
  type: string;
  title: string;
  description: string;
  year: number;
  imdb: number;
  comment: boolean;
  rating: number;
  duration: string | null;
  downloadas: string | null;
  classification: string | null;
  image: string;
  cover: string;
  genres: Genre[];
  sources?: Source[];
  country: Country[];
}

export type MediaItem = Movie | Series;

export type MoviesResponse = Movie[];
export type SeriesResponse = Series[];
export type SeasonsResponse = Season[];

export interface SearchResponse {
  channels: any[];
  posters: MediaItem[];
} 