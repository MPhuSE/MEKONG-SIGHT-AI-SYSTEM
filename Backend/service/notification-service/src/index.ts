import express from 'express';
import Queue from 'bull';
import { logger, config } from '@mekong/shared';

const app = express();
app.use(express.json());

const redisPassword = config.redis.password?.trim();
const redisUsername = config.redis.username?.trim();
const redisConfig = {
    port: config.redis.port,
    host: config.redis.host,
    ...(redisPassword ? { password: redisPassword } : {}),
    ...(redisUsername ? { username: redisUsername } : {}),
    ...(config.redis.tls ? { tls: {} } : {})
};

// Initialize Bull Queues
const smsQueue = new Queue('sms-notifications', {
    redis: redisConfig
});

const emailQueue = new Queue('email-notifications', {
    redis: redisConfig
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'notification-service' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    logger.info(`Notification Service running on port ${PORT}`);
});
