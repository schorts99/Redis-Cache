import Redis from "ioredis";
import type { Cache as SharedCache } from "@schorts/shared-kernel";

export class RedisCache<T = unknown> implements SharedCache<T> {
  private readonly client: Redis;
  private readonly prefix: string;

  constructor(redis: Redis, prefix: string) {
    this.client = redis;
    this.prefix = prefix;
  }

  private key(key: string): string {
    return `${this.prefix}:${key}`;
  }

  private tagKey(tag: string): string {
    return `${this.prefix}:tag:${tag}`;
  }

  async get(key: string): Promise<T | undefined> {
    const raw = await this.client.get(this.key(key));

    if (!raw) return undefined;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }

  async set(key: string, value: T, ttl?: number, tags?: string[]): Promise<void> {
    const payload = JSON.stringify(value);

    if (ttl) {
      await this.client.set(this.key(key), payload, "PX", ttl);
    } else {
      await this.client.set(this.key(key), payload);
    }

    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await this.client.sadd(this.tagKey(tag), key);
      }
    }
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.client.del(this.key(key));

    return result > 0;
  }

  async deleteByTag(tag: string): Promise<void> {
    const tagSetKey = this.tagKey(tag);
    const keys = await this.client.smembers(tagSetKey);

    if (keys.length > 0) {
      const fullKeys = keys.map((k) => this.key(k));

      await this.client.del(...fullKeys);
    }

    await this.client.del(tagSetKey);
  }

  async deleteByTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      await this.deleteByTag(tag);
    }
  }

  async clear(): Promise<void> {
    const keys = await this.client.keys(`${this.prefix}:*`);

    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async has(key: string): Promise<boolean> {
    const exists = await this.client.exists(this.key(key));

    return exists === 1;
  }
}

