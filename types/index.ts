export interface Serie {
  id: number;
  title: string;
  type: string;
  description: string;
  year: number;
  rating: number;
  imdb: number;
  comment: boolean;
  duration: string;
  downloadas: string | null;
  classification: string | null;
  image: string;
  cover: string;
  genres: { id: number; title: string }[];
  country: { id: number; title: string }[];
}

export interface SerieEpisode {
  id: number;
  title: string;
  description: string | null;
  duration: string | null;
  downloadas: string;
  playas: string;
  sources: {
    id: number;
    quality: string | null;
    type: string;
    url: string;
  }[];
}

export interface SerieSeason {
  id: number;
  title: string;
  episodes: SerieEpisode[];
} 