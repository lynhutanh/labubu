import { createHash } from "crypto";

import { Inject, Injectable } from "@nestjs/common";
import { DefaultJobOptions, Job, Queue, Worker } from "bullmq";

import {
  CORE_QUEUE_MESSAGE_REDIS_CONNECTION,
  IRedisQueueParams,
  IQueueJobOptions,
} from "./constants";
import { QueueWorkerHolderSingleton } from "./queue-workers-holder";

@Injectable()
export class QueueService {
  private _queues: Record<string, Queue> = {};

  private _activeQueueAndJobs: Record<string, any> = {};

  private _activeUniqueJobs: string[] = [];

  constructor(
    @Inject(CORE_QUEUE_MESSAGE_REDIS_CONNECTION)
    private readonly redisQueueParams: IRedisQueueParams,
  ) {}

  private shortenPrefix(str: string, len = 5) {
    return createHash("md5").update(str).digest("hex").substring(0, len);
  }

  private addActiveQueueJob(queueName: string, jobName: string, options: any) {
    this._activeQueueAndJobs[`${queueName}:${jobName}`] = options;
  }

  private addActiveUniqueJobName(
    queueName: string,
    jobName: string,
    options: IQueueJobOptions,
  ) {
    if (!options.jobUnique || !options?.jobOptions?.jobId) return;
    const name = `${queueName}:${jobName}:${options?.jobOptions?.jobId}`;

    if (!this._activeUniqueJobs.includes(name)) {
      this._activeUniqueJobs.push(name);
    }
  }

  public getActiveQueueJobs() {
    return { ...this._activeQueueAndJobs };
  }

  public isInActiveQueueJob(job: Job) {
    return Object.hasOwn(
      this._activeQueueAndJobs,
      `${job.queueName}:${job.name}`,
    );
  }

  public isInActiveUniqueJob(job: Job) {
    const name = `${job.queueName}:${job.name}:${job.id}`;
    return this._activeUniqueJobs.includes(name);
  }

  public createQueue(name: string, defaultJobOptions?: DefaultJobOptions) {
    const { redisQueueConnection } = this.redisQueueParams;
    return new Queue(name, {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: {
          age: 3600,
          count: 10,
        },
        ...(defaultJobOptions || {}),
      },
      connection: redisQueueConnection,
      prefix: `{${this.shortenPrefix(name)}}`,
    });
  }

  private async removeJobUtilDone(queueName: string, jobId: string) {
    if (!this._queues[queueName]) return true;

    const job = await this._queues[queueName].getJob(jobId);
    if (!job) return true;

    await this._queues[queueName].remove(jobId);
    return new Promise((rs) => {
      setTimeout(async () => {
        rs(this.removeJobUtilDone(queueName, jobId));
      }, 1000);
    });
  }

  public async add(
    queueName: string,
    jobName: string,
    options?: IQueueJobOptions,
  ) {
    if (!this._queues[queueName]) {
      this._queues[queueName] = this.createQueue(
        queueName,
        options?.jobOptions,
      );
    }

    if (
      options?.removePreviousJob &&
      options?.jobUnique &&
      options?.jobOptions?.jobId
    ) {
      try {
        await this.removeJobUtilDone(queueName, options.jobOptions.jobId);
      } catch {
        // Handle error silently
      }
    }

    await this._queues[queueName].add(
      jobName,
      options?.data,
      options?.jobOptions || {},
    );
    this.addActiveQueueJob(queueName, jobName, options);
    this.addActiveUniqueJobName(queueName, jobName, options);
  }

  public processWorker(
    queueName: string,
    handler: any,
    options?: Record<string, any>,
  ) {
    const { redisQueueConnection } = this.redisQueueParams;

    const worker = new Worker(queueName, handler, {
      ...(options || {}),
      autorun: false,
      connection: redisQueueConnection,
      prefix: `{${this.shortenPrefix(queueName)}}`,
    });
    worker.run();

    QueueWorkerHolderSingleton.addToList(worker);
  }

  public onCompleted(queueName: string, handler: any) {
    const worker = QueueWorkerHolderSingleton.getByName(queueName);
    if (!worker) throw new Error(`Worker ${queueName} is not ready!`);
    worker.on("completed", handler);
  }

  public onFailed(queueName: string, handler: any) {
    const worker = QueueWorkerHolderSingleton.getByName(queueName);
    if (!worker) throw new Error(`Worker ${queueName} is not ready!`);
    worker.on("failed", handler);
  }
}
