export default () => ({
  queue: {
    REDIS_QUEUE_CONFIG: {
      port: parseInt(process.env.REDIS_QUEUE_PORT ?? "6379", 10),
      host: process.env.REDIS_QUEUE_HOST ?? "127.0.0.1",
      username: process.env.REDIS_QUEUE_USERNAME || undefined,
      password: process.env.REDIS_QUEUE_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_QUEUE_DB ?? "0", 10),
      tls: process.env.REDIS_QUEUE_TLS ? {} : undefined,
    },
    REDIS_QUEUE_USE_CLUSTER_MODE:
      process.env.REDIS_QUEUE_USE_CLUSTER_MODE === "true",
  },
});
