import { Controller, Get, Res } from "@nestjs/common";
import { AppService } from "./app.service";
import { Response } from "express";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: Response): void {
    const html = `<!DOCTYPE html>
<html>
<head>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <title>Cosmetics API</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    }
    .container {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    h1 {
      color: #e91e63;
      margin-bottom: 0.5rem;
    }
    p {
      color: #666;
    }
    .status {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #4caf50;
      color: white;
      border-radius: 20px;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>💄 Cosmetics API</h1>
    <p>API nền tảng mỹ phẩm</p>
    <div class="status">✓ Đang hoạt động</div>
  </div>
</body>
</html>`;
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }

  @Get("health")
  healthCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "cosmetics-api",
    };
  }
}
