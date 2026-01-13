import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { RedisModule } from "@nestjs-modules/ioredis";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ScheduleModule } from "@nestjs/schedule";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { SettingModule } from "./modules/settings/setting.module";
import { SocketModule } from "./modules/websocket/socket.module";
import { FileModule } from "./modules/file/file.module";
import { CategoryModule } from "./modules/category/category.module";
import { ProductModule } from "./modules/products/product.module";
import { CartModule } from "./modules/cart/cart.module";
import { OrderModule } from "./modules/orders/order.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { BrandModule } from "./modules/brand/brand.module";
import { WishlistModule } from "./modules/wishlist/wishlist.module";
import app from "./config/app";
import file from "./config/file";
import email from "./config/email";
import image from "./config/image";
import queue from "./config/queue";
import redis from "./config/redis";
import sepay from "./config/sepay";
import { CoreQueueModule, MongoDBModule } from "./kernel";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [app, file, email, image, queue, redis, sepay],
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || "mongodb://localhost:27017/cosmetics",
    ),
    MongoDBModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public"),
      serveRoot: "/public",
      serveStaticOptions: {
        fallthrough: false,
        index: false,
        setHeaders(res, path: string) {
          if (path.includes("avatars")) {
            res.setHeader("Cache-Control", "public, max-age=259200");
          }
          if (path.includes("uploads") || path.includes("products")) {
            res.setHeader("Cache-Control", "public, max-age=86400");
          }
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET");

          const ext = path.split(".").pop()?.toLowerCase();
          if (ext === "jpg" || ext === "jpeg") {
            res.setHeader("Content-Type", "image/jpeg");
          } else if (ext === "png") {
            res.setHeader("Content-Type", "image/png");
          } else if (ext === "gif") {
            res.setHeader("Content-Type", "image/gif");
          } else if (ext === "webp") {
            res.setHeader("Content-Type", "image/webp");
          }
        },
      },
    }),
    ScheduleModule.forRoot(),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get<any>("redis");
        return redisConfig;
      },
      inject: [ConfigService],
    }),
    CoreQueueModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const queueConfig = configService.get<any>("queue.queue");
        return {
          redisConfig: queueConfig?.REDIS_QUEUE_CONFIG || {
            host: process.env.REDIS_QUEUE_HOST || "127.0.0.1",
            port: parseInt(process.env.REDIS_QUEUE_PORT || "6379", 10),
            db: parseInt(process.env.REDIS_QUEUE_DB || "0", 10),
          },
          useRedisCluster: queueConfig?.REDIS_QUEUE_USE_CLUSTER_MODE || false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    SettingModule,
    SocketModule,
    FileModule,
    CategoryModule,
    ProductModule,
    CartModule,
    OrderModule,
    PaymentModule,
    BrandModule,
    WishlistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
