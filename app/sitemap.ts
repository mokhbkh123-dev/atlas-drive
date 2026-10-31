import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const locales = ['fr', 'en', 'ar']
  
  const routes = [
    '',
    '/about',
    '/cars',
    '/booking',
    '/contact',
    '/faq',
    '/services',
    '/gallery',
    '/terms',
    '/privacy',
  ]
  
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  for (const locale of locales) {
    for (const route of routes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : route === '/cars' ? 0.9 : 0.7,
      })
    }
  }
  
  return sitemapEntries
}
