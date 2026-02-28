import { FastifyInstance, FastifyRequest } from 'fastify';
// @ts-ignore: Cala a boca TypeScript, eu sei o que estou fazendo 🤫
import fastifyRateLimit from '@fastify/rate-limit';
import { redis } from '../cache/redis';

export async function setupRateLimit(app: FastifyInstance) {
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis: redis as any, 
    keyGenerator: (req: FastifyRequest) => { 
      return (req.headers['x-api-key'] as string) || req.ip;
    }
  });
}