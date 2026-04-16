import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import Event from '@/models/event';
import Blog from '@/models/blog';
import Track from '@/models/track';

const siteUrl = 'https://www.awscloudclub.mnnit.ac.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/events',
    '/blogs',
    '/tracks',
    '/team',
    '/committee',
    '/sponsors',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    await connectDB();

    // Fetch dynamic published content
    const [events, blogs, tracks] = await Promise.all([
      Event.find({ status: 'published' }).select('slug updatedAt date').lean() as Promise<any[]>,
      Blog.find({ status: 'published' }).select('slug updatedAt createdAt').lean() as Promise<any[]>,
      Track.find({}).select('slug updatedAt').lean() as Promise<any[]>,
    ]);

    const eventRoutes = events.map((event) => ({
      url: `${siteUrl}/events/${event.slug}`,
      lastModified: event.updatedAt || event.date || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    const blogRoutes = blogs.map((blog) => ({
      url: `${siteUrl}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt || blog.createdAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    const trackRoutes = tracks.map((track) => ({
      url: `${siteUrl}/tracks/${track.slug}`,
      lastModified: track.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...eventRoutes, ...blogRoutes, ...trackRoutes];
  } catch (error) {
    console.error('Sitemap generation: Database connection failed. Returning static routes only.', error);
    return staticRoutes;
  }
}
