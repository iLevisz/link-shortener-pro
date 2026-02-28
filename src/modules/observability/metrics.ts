import { FastifyInstance } from 'fastify';
import client from 'prom-client';

client.collectDefaultMetrics();

export async function metricsPlugin(app: FastifyInstance) {
  app.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', client.register.contentType);
    return client.register.metrics();
  });
}