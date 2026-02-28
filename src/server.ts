import Fastify from 'fastify';
import { logger } from './modules/observability/logger';
import { shortenRoutes } from './routes/shorten';
import { redirectRoutes } from './routes/redirect';
import { setupRateLimit } from './modules/rate-limit/rateLimit';
import { metricsPlugin } from './modules/observability/metrics';

const app = Fastify({ logger: logger as any });

app.register(setupRateLimit);
app.register(metricsPlugin);
app.register(shortenRoutes, { prefix: '/api/v1/links' });
app.register(redirectRoutes);

app.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});