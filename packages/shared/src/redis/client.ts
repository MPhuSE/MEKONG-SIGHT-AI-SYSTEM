import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

let redisInstance: Redis | null = null;

export const getRedisClient = (): Redis => {
    if (!redisInstance) {
        if (!config.redis.host || !config.redis.port) {
            throw new Error(
                'Redis configuration is required. Set REDIS_HOST and REDIS_PORT.'
            );
        }

        const redisOptions = {
            host: config.redis.host,
            port: config.redis.port,
            ...(config.redis.username?.trim()
                ? { username: config.redis.username.trim() }
                : {}),
            ...(config.redis.tls ? { tls: {} } : {}),
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        };

        const password = config.redis.password?.trim();
        redisInstance = new Redis(
            password
                ? { ...redisOptions, password }
                : redisOptions
        );

        redisInstance.on('error', (err) => {
            logger.error('Redis Client Error', err);
        });

        redisInstance.on('connect', () => {
            logger.info('Redis Client Connected');
        });
    }
    return redisInstance;
};
