import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cinemaplus-app.vercel.app';

  // Define your static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changefreq: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changefreq: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/series`,
      lastModified: new Date(),
      changefreq: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changefreq: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changefreq: 'monthly',
      priority: 0.3,
    },
  ];

  // Combine static and dynamic routes
  // return [...staticRoutes, ...movieUrls];
  return staticRoutes;
} 