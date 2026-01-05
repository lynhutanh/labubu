import { DynamicModule, Global, Module } from "@nestjs/common";
import IORedis from "ioredis";

import {
  CORE_QUEUE_MESSAGE_REDIS_CONNECTION,
  CORE_QUEUE_MODULE_CONFIG_OPTIONS,
  CoreQueueModuleAsyncConfigOptions,
} from "./constants";
import { QueueMessageService } from "./queue-message.service";
import { QueueService } from "./queue.service";

@Global()
@Module({})
export class CoreQueueModule {
  static forRoot(): DynamicModule {
    return {
      module: CoreQueueModule,
      providers: [QueueMessageService, QueueService],
      exports: [QueueMessageService, QueueService],
    };
  }

  static async registerAsync(
    options: CoreQueueModuleAsyncConfigOptions,
  ): Promise<DynamicModule> {
    const asyncProviders = {
      inject: options.inject || [],
      provide: CORE_QUEUE_MESSAGE_REDIS_CONNECTION,
      useFactory: async (factoryOptions: any) => {
        const { redisConfig, ...rests } =
          await options.useFactory(factoryOptions);
        const redisQueueConnection = new IORedis({
          ...redisConfig,
          maxRetriesPerRequest: null,
        });
        return {
          redisQueueConnection,
          redisConfig,
          ...rests,
        };
      },
    };

    return {
      module: CoreQueueModule,
      imports: options.imports,
      providers: [
        {
          provide: CORE_QUEUE_MODULE_CONFIG_OPTIONS,
          useValue: options,
        },
        asyncProviders,
        QueueMessageService,
        QueueService,
      ],
      exports: [QueueMessageService, QueueService],
    };
  }
}
