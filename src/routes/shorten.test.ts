import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import Redis from 'ioredis';

describe('Link Shortener Integration Tests', () => {
  let redisContainer: StartedTestContainer;
  let redisClient: Redis;

  beforeAll(async () => {
    redisContainer = await new GenericContainer('redis:7-alpine')
      .withExposedPorts(6379)
      .start();

    const host = redisContainer.getHost();
    const port = redisContainer.getMappedPort(6379);
    
    process.env.REDIS_URL = `redis://${host}:${port}`;
    redisClient = new Redis(process.env.REDIS_URL);
  });

  afterAll(async () => {
    if (redisClient) {
      await redisClient.quit();
    }
    if (redisContainer) {
      await redisContainer.stop();
    }
  });

  it('should initialize testcontainers and connect to ephemeral redis', async () => {
    await redisClient.set('test-key', 'test-value');
    const value = await redisClient.get('test-key');
    
    expect(value).toBe('test-value');
  });
});