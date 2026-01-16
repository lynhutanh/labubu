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
import * as bodyParser from "body-parser";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const httpAdapter = app.getHttpAdapter();
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionLogFilter(httpAdapter));
  app.engine("html", renderFile);
  app.set("view engine", "html");

  // PayPal webhook MUST receive raw body for signature verification.
  // External infra may prefix routes with /api, so we support both.
  // IMPORTANT: bodyParser must be BEFORE the logging middleware
  app.use("/payment/paypal/webhook", bodyParser.raw({ type: "application/json", limit: "10mb" }));
  app.use("/api/payment/paypal/webhook", bodyParser.raw({ type: "application/json", limit: "10mb" }));
  
  // Logging middleware AFTER body parser
  app.use("/payment/paypal/webhook", (req: any, res: any, next: any) => {
    console.log("===========================================");
    console.log("[PayPal Webhook] ===== RAW REQUEST RECEIVED =====");
    console.log(`[PayPal Webhook] Method: ${req.method}`);
    console.log(`[PayPal Webhook] URL: ${req.url}`);
    console.log(`[PayPal Webhook] Headers: ${JSON.stringify(req.headers, null, 2)}`);
    console.log(`[PayPal Webhook] Body type: ${typeof req.body}, isBuffer: ${Buffer.isBuffer(req.body)}, length: ${req.body?.length || 0}`);
    if (req.body && Buffer.isBuffer(req.body)) {
      try {
        const bodyStr = req.body.toString("utf8");
        console.log(`[PayPal Webhook] Body preview (first 500 chars): ${bodyStr.substring(0, 500)}`);
        const parsed = JSON.parse(bodyStr);
        console.log(`[PayPal Webhook] Parsed event_type: ${parsed.event_type || "unknown"}`);
      } catch (e) {
        console.log(`[PayPal Webhook] Cannot parse body: ${e instanceof Error ? e.message : "unknown"}`);
      }
    }
    console.log("===========================================");
    next();
  });
  
  app.use("/api/payment/paypal/webhook", (req: any, res: any, next: any) => {
    console.log("===========================================");
    console.log("[PayPal Webhook] ===== RAW REQUEST RECEIVED (with /api prefix) =====");
    console.log(`[PayPal Webhook] Method: ${req.method}`);
    console.log(`[PayPal Webhook] URL: ${req.url}`);
    console.log(`[PayPal Webhook] Headers: ${JSON.stringify(req.headers, null, 2)}`);
    console.log(`[PayPal Webhook] Body type: ${typeof req.body}, isBuffer: ${Buffer.isBuffer(req.body)}, length: ${req.body?.length || 0}`);
    if (req.body && Buffer.isBuffer(req.body)) {
      try {
        const bodyStr = req.body.toString("utf8");
        console.log(`[PayPal Webhook] Body preview (first 500 chars): ${bodyStr.substring(0, 500)}`);
        const parsed = JSON.parse(bodyStr);
        console.log(`[PayPal Webhook] Parsed event_type: ${parsed.event_type || "unknown"}`);
      } catch (e) {
        console.log(`[PayPal Webhook] Cannot parse body: ${e instanceof Error ? e.message : "unknown"}`);
      }
    }
    console.log("===========================================");
    next();
  });

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

  // eslint-disable-next-line no-console
  console.info(`Cosmetics API is running on: ${process.env.BASE_URL}`);
}

bootstrap();
