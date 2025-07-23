import { Series } from '@/types/movie';

const BASE_URL = 'https://hostinnegar.com/api/serie/by/filtres/0/created';
const API_KEY = '4F5A9C3D9A86FA54EACEDDD635185';

export class SeriesApiService {
  static async getSeries(page: number = 0): Promise<Series[]> {
    try {
      const url = `${BASE_URL}/${page}/${API_KEY}`;
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
      return data as Series[];
    } catch (error) {
      console.error('Error fetching series:', error);
      throw error;
    }
  }
} 