import { ModuleMetadata } from "@nestjs/common";
import { Job, JobsOptions } from "bullmq";
import { Redis, RedisOptions } from "ioredis";

export class Event {
  channel: string;

  eventName: string;

  data: any;

  priority?: number;

  constructor(data: Event) {
    Object.assign(this, data);
  }
}

export const CORE_QUEUE_MODULE_REDIS_CONFIG = "CORE_QUEUE_MODULE_REDIS_CONFIG";

export const CORE_QUEUE_MESSAGE_REDIS_CONNECTION =
  "CORE_QUEUE_MESSAGE_REDIS_CONNECTION";

export const QUEUE_MESSAGE_CHANNEL_TOPICS_REDIS_KEY =
  "QUEUE_MESSAGE_CHANNEL_TOPICS";

export const QUEUE_SUBSCRIBE_CHANNELS_SET = "QUEUE_SUBSCRIBE_CHANNELS";
export const QUEUE_SUBSCRIBE_CHANNELS_TOPICS_PREFIX =
  "QUEUE_SUBSCRIBE_CHANNELS_TOPICS_";

export const CORE_QUEUE_MODULE_CONFIG_OPTIONS =
  "CORE_QUEUE_MODULE_CONFIG_OPTIONS";

export interface CoreQueueModuleAsyncConfigOptions extends Pick<
  ModuleMetadata,
  "imports"
> {
  useFactory?: (...args: any) => Promise<{
    redisConfig: RedisOptions;
    useRedisCluster?: boolean;
  }>;
  inject?: any[];
}

export interface IRedisQueueParams {
  redisQueueConnection: Redis;
  redisConfig: any;
  useRedisCluster: boolean;
}

export interface QueueEvent<T = any> {
  channel?: string;
  eventName: string;
  data?: T;
}

export interface QueueEventListener<T = any> extends Omit<Job, "data"> {
  data: QueueEvent<T>;
}

export interface IQueueJobOptions {
  data?: any;
  jobOptions?: JobsOptions;
  jobUnique?: boolean;
  removePreviousJob?: boolean;
}
