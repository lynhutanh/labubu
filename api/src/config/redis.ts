export default () => ({
  redis: {
    type: process.env.REDIS_SERVER_TYPE || "single",
    options: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      db: parseInt(process.env.REDIS_DB, 10) || 0,
      username: process.env.REDIS_QUEUE_USERNAME || undefined,
      password: process.env.REDIS_PASSWORD || undefined,
      keyPrefix: process.env.REDIS_PREFIX || undefined,
      tls: process.env.REDIS_TLS || undefined,
      retryStrategy: (times: number) => Math.min(times * 100, 2000),
      reconnectOnError: (err: Error) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    },
  },
});
