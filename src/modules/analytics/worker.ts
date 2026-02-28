import { redis } from '../cache/redis';
import { prisma } from '../db/prisma';

export async function startWorker() {
  while (true) {
    const item = await redis.brpop('analytics:clicks', 0);
    if (item) {
      const data = JSON.parse(item[1]);
      const link = await prisma.link.findUnique({ where: { slug: data.slug } });
      
      if (link) {
        await prisma.clickEvent.create({
          data: {
            linkId: link.id,
            ipHash: data.ip,
            userAgent: data.userAgent,
            referrer: data.referer,
          }
        });
      }
    }
  }
}

startWorker().catch(console.error);