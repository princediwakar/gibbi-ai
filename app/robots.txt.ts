import type { MetadataRoute } from 'next'

const baseUrl = 'https://gibbi.vercel.app';

export default async function Robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
} 