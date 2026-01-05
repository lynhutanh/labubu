require("dotenv").config();
process.env.TEMPLATE_DIR = `${__dirname}/templates`;

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpExceptionLogFilter } from "./kernel/logger/http-exception-log.filter";
import { renderFile } from "./kernel/helpers/view.helper";
import { RedisIoAdapter } from "./modules/websocket/redis-io.adapter";
import { join } from "path";
import { existsSync } from "fs";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const httpAdapter = app.getHttpAdapter();
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionLogFilter(httpAdapter));
  app.engine("html", renderFile);
  app.set("view engine", "html");

  // Serve favicon.ico and logo.ico
  const logoIcoPath = join(process.cwd(), "public", "logo.ico");
  const logoPngPath = join(process.cwd(), "public", "logo.png");
  if (existsSync(logoIcoPath) && existsSync(logoPngPath)) {
    app.use("/favicon.ico", (req: any, res: any) => {
      res.setHeader("Content-Type", "image/x-icon");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.sendFile(logoIcoPath);
    });
    app.use("/logo.ico", (req: any, res: any) => {
      res.setHeader("Content-Type", "image/x-icon");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.sendFile(logoIcoPath);
    });
    app.use("/logo.png", (req: any, res: any) => {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.sendFile(logoPngPath);
    });
  }

  const configService = app.get(ConfigService);
  const redisConfig = configService.get("redis");
  if (redisConfig) {
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis(redisConfig);
    app.useWebSocketAdapter(redisIoAdapter);
  }

  const port = process.env.HTTP_PORT || 5001;
  await app.listen(port);

  console.log(`Cosmetics API is running on: ${process.env.BASE_URL}`);
}

bootstrap();
