import { Season } from '@/types/movie';

const BASE_URL = 'https://hostinnegar.com/api/season/by/serie';
const API_KEY = '4F5A9C3D9A86FA54EACEDDD63518';

export class SeasonsApiService {
  static async getSeasons(seriesId: number): Promise<Season[]> {
    try {
      const url = `${BASE_URL}/${seriesId}/${API_KEY}/`;
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
      return data as Season[];
    } catch (error) {
      console.error('Error fetching seasons:', error);
      throw error;
    }
  }
} 