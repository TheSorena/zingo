import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cinemaplus-app.vercel.app';
  const lastMod = new Date().toISOString();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: lastMod,
      priority: 1.00
    },
    {
      url: `${baseUrl}/series`,
      lastModified: lastMod,
      priority: 0.80
    },
    {
      url: `${baseUrl}/search`,
      lastModified: lastMod,
      priority: 0.80
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: lastMod,
      priority: 0.80
    }
  ];
} 