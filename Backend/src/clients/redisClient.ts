import { createClient } from 'redis';

export const redis = createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379,
  },
});

redis.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// connect immediately when this module is imported
redis.connect().catch((err) => {
  console.error('❌ Redis connection failed:', err);
});
