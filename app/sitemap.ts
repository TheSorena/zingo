import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cinemaplus-app.vercel.app';
  const lastMod = new Date();

  // Define the sitemap entries
  const entries: MetadataRoute.Sitemap = [
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
  ];

  // Add custom metadata to the sitemap
  (entries as any).__metadata = {
    xmlns: {
      xsi: "http://www.w3.org/2001/XMLSchema-instance",
    },
    xsiSchemaLocation: "http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
  };

  return entries;
} 