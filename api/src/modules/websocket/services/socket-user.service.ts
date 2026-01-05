import { Injectable, Logger } from "@nestjs/common";
import Redis from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { uniq } from "lodash";
import { WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import { ObjectId } from "mongodb";

export const CONNECTED_USER_REDIS_KEY = "connected_users";
export const CONNECTED_ROOM_REDIS_KEY = "user:";

@Injectable()
@WebSocketGateway()
export class SocketUserService {
  @WebSocketServer() server: any;

  private readonly logger = new Logger(SocketUserService.name);

  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async addConnection(sourceId: string | ObjectId, socketId: string) {
    await this.redisClient.sadd(CONNECTED_USER_REDIS_KEY, sourceId.toString());
    await this.redisClient.sadd(sourceId.toString(), socketId);
  }

  async removeConnection(sourceId: string | ObjectId, socketId: string) {
    await this.redisClient.srem(sourceId.toString(), socketId);

    const len = await this.redisClient.scard(sourceId.toString());
    if (!len) {
      await this.redisClient.srem(
        CONNECTED_USER_REDIS_KEY,
        sourceId.toString(),
      );
    }
    return len;
  }

  async emitToUsers(
    userIds: string | ObjectId | string[] | ObjectId[],
    eventName: string,
    data: any,
  ) {
    const stringIds = uniq(Array.isArray(userIds) ? userIds : [userIds]).map(
      (i) => i.toString(),
    );
    const connectedUserIds = await this.redisClient.smembers(
      CONNECTED_USER_REDIS_KEY,
    );
    const connectedUserIdsSet = new Set(connectedUserIds);

    await Promise.all(
      stringIds.map(async (userId) => {
        if (connectedUserIdsSet.has(userId)) {
          const socketIds = await this.redisClient.smembers(userId);
          (socketIds || []).forEach((socketId) => {
            this.server.to(socketId).emit(eventName, data);
          });
        }
      }),
    );
  }

  async emitToRoom(roomName: string, eventName: string, data: any) {
    this.server.to(roomName).emit(eventName, data);
  }

  async emitToAll(eventName: string, data: any) {
    this.server.emit(eventName, data);
  }
}
