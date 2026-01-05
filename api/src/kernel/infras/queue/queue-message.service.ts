import { createHash } from "crypto";

import { Inject, Injectable } from "@nestjs/common";
import { Processor, Queue, Worker } from "bullmq";

import {
  CORE_QUEUE_MESSAGE_REDIS_CONNECTION,
  QUEUE_SUBSCRIBE_CHANNELS_SET,
  QUEUE_SUBSCRIBE_CHANNELS_TOPICS_PREFIX,
  QueueEvent,
  IRedisQueueParams,
} from "./constants";
import { QueueWorkerHolderSingleton } from "./queue-workers-holder";

@Injectable()
export class QueueMessageService {
  private _queues = {} as Record<string, Queue>;

  private _workers = [] as Array<string>;

  constructor(
    @Inject(CORE_QUEUE_MESSAGE_REDIS_CONNECTION)
    private readonly redisQueueParams: IRedisQueueParams,
  ) {}

  private async getTopicsByChannel(channel: string) {
    const key = `${QUEUE_SUBSCRIBE_CHANNELS_TOPICS_PREFIX}${channel}`;
    const { redisQueueConnection } = this.redisQueueParams;
    const topics = await redisQueueConnection.smembers(key);
    return topics.map((t) => `${channel}_${t}`);
  }

  private async setChannelTopic(channel: string, topic: string) {
    const { redisQueueConnection } = this.redisQueueParams;
    await redisQueueConnection.sadd(QUEUE_SUBSCRIBE_CHANNELS_SET, channel);

    const key = `${QUEUE_SUBSCRIBE_CHANNELS_TOPICS_PREFIX}${channel}`;
    await redisQueueConnection.sadd(key, topic);
  }

  private shortenPrefix(str: string, len = 5) {
    return createHash("md5").update(str).digest("hex").substring(0, len);
  }

  public createQueue(name: string) {
    if (this._queues[name]) return this._queues[name];

    const { redisQueueConnection } = this.redisQueueParams;
    const queue = new Queue(name, {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: {
          age: 3600,
          count: 10,
        },
      },
      connection: redisQueueConnection,
      prefix: `{${this.shortenPrefix(name)}}`,
    });

    this._queues[name] = queue;
    return queue;
  }

  async publish(
    channel: string,
    data: QueueEvent<any>,
    jobName = "",
  ): Promise<void> {
    const topics = await this.getTopicsByChannel(channel);
    if (!topics.length) {
      return;
    }

    await Promise.all(
      topics.map((queueName) => {
        const channelQueue = this.createQueue(queueName);
        return channelQueue.add(jobName || data.eventName, data);
      }),
    );
  }

  async subscribe(
    channel: string,
    topic: string,
    handler: Processor<any, any, string>,
    options = {} as Record<string, any>,
  ) {
    await this.setChannelTopic(channel, topic);
    const { redisQueueConnection } = this.redisQueueParams;

    const workerName = `${channel}_${topic}`;
    if (!this._workers.includes(workerName)) {
      this._workers.push(workerName);
      const worker = new Worker(workerName, handler, {
        ...(options || {}),
        autorun: false,
        connection: redisQueueConnection,
        prefix: `{${this.shortenPrefix(workerName)}}`,
      });
      worker.run();

      QueueWorkerHolderSingleton.addToList(worker);
    }
  }
}
