# Redis Cache

A Redis-backed cache implementation for Node.js that conforms to the Cache<T> interface from [`@schorts/shared-kernel`](https://www.npmjs.com/package/@schorts/shared-kernel). It provides TTL support, tag-based invalidation, and simple JSON serialization.

## Features

- **Promise-based API** matching the Cache<T> contract.
- **TTL support** using Redis native expiration.
- **Tag-based invalidation** via Redis sets.
- **Clear all** with prefix scoping.
- **JSON serialization** for storing complex objects.

## Installation

```bash
npm install @schorts/redis-cache
```

## Usage

```ts
import { RedisCache } from "@schorts/redis-cache";

// Initialize with Redis connection URL
const cache = new RedisCache("redis://localhost:6379", "myapp");

// Store an object with TTL and tags
await cache.set("user:123", { id: 123, name: "Alice" }, 60000, ["user", "tenant:456"]);

// Retrieve
const user = await cache.get("user:123");
console.log(user);

// Check existence
const exists = await cache.has("user:123");

// Delete by key
await cache.delete("user:123");

// Delete by tag
await cache.deleteByTag("user");

// Clear all keys under prefix
await cache.clear();
```

## API

### `constructor(redisUrl: string, prefix: string)`

Creates a new cache instance.

- `redisUrl`: Redis connection string.
- `prefix`: Key prefix.

### `get(key: string): Promise<T | undefined>`

Retrieve a cached value.

### `set(key: string, value: T, ttl?: number, tags?: string[]): Promise<void>`

Store a value with optional TTL (milliseconds) and tags.

### `delete(key: string): Promise<boolean>`

Delete a value by key.

### `deleteByTag(tag: string): Promise<void>`

Delete all values associated with a tag.

### `deleteByTags(tags: string[]): Promise<void>`

Delete all values associated with multiple tags.

### `clear(): Promise<void>`

Clear all cached values under the prefix.

### `has(key: string): Promise<boolean>`

Check if a key exists.

## License

Licensed under the LGPL v3.0. Includes dependencies licensed under MIT.
