import { NextApiResponse } from 'next';

export async function GET() {
  const baseUrl = 'https://cinemaplus-app.vercel.app';
  const lastMod = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<!--  created with Free Online Sitemap Generator www.xml-sitemaps.com  -->
<url>
<loc>${baseUrl}/</loc>
<lastmod>${lastMod}</lastmod>
<priority>1.00</priority>
</url>
<url>
<loc>${baseUrl}/series</loc>
<lastmod>${lastMod}</lastmod>
<priority>0.80</priority>
</url>
<url>
<loc>${baseUrl}/search</loc>
<lastmod>${lastMod}</lastmod>
<priority>0.80</priority>
</url>
<url>
<loc>${baseUrl}/settings</loc>
<lastmod>${lastMod}</lastmod>
<priority>0.80</priority>
</url>
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 