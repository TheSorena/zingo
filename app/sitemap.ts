import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cinemaplus-app.vercel.app';
  const lastMod = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: lastMod,
      priority: 1.00,
      changeFrequency: 'daily',
    },
    {
      url: `${baseUrl}/series`,
      lastModified: lastMod,
      priority: 0.80,
      changeFrequency: 'weekly',
    },
    {
      url: `${baseUrl}/search`,
      lastModified: lastMod,
      priority: 0.80,
      changeFrequency: 'weekly',
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: lastMod,
      priority: 0.80,
      changeFrequency: 'monthly',
    },
  ]
} 