import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cinemaplus-app.vercel.app';

  // Add your dynamic routes here
  // Example: Fetch movie URLs from your API
  // const movies = await fetch(`${process.env.API_BASE_URL}/api/movies`).then(res => res.json());
  // const movieUrls = movies.map(movie => ({
  //   url: `${baseUrl}/movie/${movie.id}`,
  //   lastModified: new Date(),
  //   changeFrequency: 'daily',
  //   priority: 0.8,
  // }));

  // Define your static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/series`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // Combine static and dynamic routes
  // return [...staticRoutes, ...movieUrls];
  return staticRoutes;
} 