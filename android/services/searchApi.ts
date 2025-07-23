import { SearchResponse } from '@/types/movie';

const BASE_URL = 'https://hostinnegar.com/api/search';
const API_KEY = '4F5A9C3D9A86FA54EACEDDD635185';

export class SearchApiService {
  static async search(query: string): Promise<SearchResponse> {
    try {
      const url = `${BASE_URL}/${encodeURIComponent(query)}/${API_KEY}/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as SearchResponse;
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }
} 