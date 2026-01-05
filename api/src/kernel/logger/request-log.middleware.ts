import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { RequestLogModel } from "./request-log.model";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const buff = Buffer.from(base64, "base64");
    const payloadinit = buff.toString("ascii");
    return JSON.parse(payloadinit);
  } catch {
    return null;
  }
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: Function) {
    try {
      const data = {
        path: req.originalUrl,
        headers: req.headers,
        query: req.query,
        body: req.body,
      } as any;
      const authToken = (req.headers.authorization ||
        req.query.token) as string;
      if (authToken) {
        const tokenArr = authToken.split(" ");
        const authData = parseJwt(
          tokenArr.length > 1 ? tokenArr[1] : tokenArr[0],
        );
        if (authData) {
          data.authData = authData;
        }
      }

      const log = new RequestLogModel(data);
      await log.save();
      next();
    } catch (e) {
      next(e);
    }
  }
}
