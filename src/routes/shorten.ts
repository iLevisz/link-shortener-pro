import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../modules/db/prisma';
import { redis } from '../modules/cache/redis';
import { nanoid } from 'nanoid';

const shortenSchema = z.object({
  originalUrl: z.string().url(),
  expiresAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  customDomain: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export async function shortenRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const idempotencyKey = request.headers['x-idempotency-key'] as string;
    
    if (idempotencyKey) {
      const cachedResponse = await redis.get(`idempotency:${idempotencyKey}`);
      if (cachedResponse) {
        return reply.status(200).send(JSON.parse(cachedResponse));
      }
    }

    const data = shortenSchema.parse(request.body);
    const slug = nanoid(7);

    const link = await prisma.link.create({
      data: {
        ...data,
        slug,
      },
    });

    await redis.set(`link:${slug}`, link.originalUrl, 'EX', 604800);

    if (idempotencyKey) {
      await redis.set(`idempotency:${idempotencyKey}`, JSON.stringify(link), 'EX', 86400);
    }

    return reply.status(201).send(link);
  });
}