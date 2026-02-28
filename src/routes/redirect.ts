import { FastifyInstance } from 'fastify';
import { prisma } from '../modules/db/prisma';
import { redis } from '../modules/cache/redis';

export async function redirectRoutes(app: FastifyInstance) {
  app.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    
    let originalUrl = await redis.get(`link:${slug}`);

    if (!originalUrl) {
      const link = await prisma.link.findUnique({ where: { slug } });
      if (!link) {
        return reply.status(404).send({ error: 'Not found' });
      }
      if (link.expiresAt && link.expiresAt < new Date()) {
        return reply.status(410).send({ error: 'Gone' });
      }
      originalUrl = link.originalUrl;
      await redis.set(`link:${slug}`, originalUrl, 'EX', 604800);
    }

    const clickData = {
      slug,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      referer: request.headers.referer,
      timestamp: new Date().toISOString()
    };
    
    await redis.lpush('analytics:clicks', JSON.stringify(clickData));

    return reply.redirect(302, originalUrl);
  });
}