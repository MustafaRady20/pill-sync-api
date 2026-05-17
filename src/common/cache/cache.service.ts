import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;

    return JSON.parse(data);
  }

  async set(key: string, value: any, ttl = 300): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async getOrSet<T>(key: string, cb: () => Promise<T>, ttl = 300): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached) {
      return cached;
    }

    const data = await cb();

    await this.set(key, data, ttl);

    return data;
  }
}
