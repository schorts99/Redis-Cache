"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class RedisCache {
    client;
    prefix;
    constructor(redisUrl, prefix) {
        this.client = new ioredis_1.default(redisUrl);
        this.prefix = prefix;
    }
    key(key) {
        return `${this.prefix}:${key}`;
    }
    tagKey(tag) {
        return `${this.prefix}:tag:${tag}`;
    }
    async get(key) {
        const raw = await this.client.get(this.key(key));
        if (!raw)
            return undefined;
        try {
            return JSON.parse(raw);
        }
        catch {
            return undefined;
        }
    }
    async set(key, value, ttl, tags) {
        const payload = JSON.stringify(value);
        if (ttl) {
            await this.client.set(this.key(key), payload, "PX", ttl);
        }
        else {
            await this.client.set(this.key(key), payload);
        }
        if (tags && tags.length > 0) {
            for (const tag of tags) {
                await this.client.sadd(this.tagKey(tag), key);
            }
        }
    }
    async delete(key) {
        const result = await this.client.del(this.key(key));
        return result > 0;
    }
    async deleteByTag(tag) {
        const tagSetKey = this.tagKey(tag);
        const keys = await this.client.smembers(tagSetKey);
        if (keys.length > 0) {
            const fullKeys = keys.map((k) => this.key(k));
            await this.client.del(...fullKeys);
        }
        await this.client.del(tagSetKey);
    }
    async deleteByTags(tags) {
        for (const tag of tags) {
            await this.deleteByTag(tag);
        }
    }
    async clear() {
        const keys = await this.client.keys(`${this.prefix}:*`);
        if (keys.length > 0) {
            await this.client.del(...keys);
        }
    }
    async has(key) {
        const exists = await this.client.exists(this.key(key));
        return exists === 1;
    }
}
exports.RedisCache = RedisCache;
//# sourceMappingURL=redis-cache.js.map