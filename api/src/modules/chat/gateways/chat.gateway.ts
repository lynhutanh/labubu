import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Inject, forwardRef, Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { AuthService } from "src/modules/auth/services";
import { MessageService } from "../services/message.service";
import { SocketUserService } from "src/modules/websocket/services/socket-user.service";
import { UserService } from "src/modules/user/services";
import { pick } from "lodash";

@WebSocketGateway({
  namespace: "/chat",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    @Inject(forwardRef(() => SocketUserService))
    private readonly socketUserService: SocketUserService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = await this.authService.verifySession(token);
      if (!decoded) {
        client.disconnect();
        return;
      }

      const userInfo = await this.authService.getSourceFromSession(token);
      const isAdmin = userInfo?.role === "admin";

      client.data.user = {
        ...pick(decoded, ["source", "sourceId", "authId"]),
        role: userInfo?.role,
        isAdmin,
      };
      
      if (isAdmin) {
        client.join("admin-room");
      } else {
        client.join(`user:${decoded.sourceId}`);
      }

      this.logger.log(`Client connected: ${decoded.sourceId}, role: ${userInfo?.role}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("message:send")
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { content: string; userId?: string; metadata?: any },
  ) {
    try {
      if (!client.data.user) {
        return { error: "Unauthorized" };
      }

      const user = client.data.user;
      const isAdmin = user.isAdmin || user.role === "admin";
      const targetUserId = isAdmin ? payload.userId : user.sourceId;

      if (!targetUserId) {
        return { error: "User ID is required" };
      }

      const message = await this.messageService.create({
        userId: targetUserId,
        adminId: isAdmin ? user.sourceId : undefined,
        content: payload.content,
        isFromAdmin: isAdmin,
        metadata: payload.metadata,
      });

      const messageData = {
        _id: message._id,
        userId: message.userId,
        content: message.content,
        isFromAdmin: message.isFromAdmin,
        read: message.read,
        metadata: message.metadata,
        createdAt: message.createdAt,
      };

      if (isAdmin) {
        this.server.to(`user:${targetUserId}`).emit("message:receive", messageData);
      } else {
        this.server.to(`user:${targetUserId}`).emit("message:receive", messageData);
        this.server.to("admin-room").emit("message:new", {
          userId: targetUserId,
          message: messageData,
        });
      }

      return { success: true, message: messageData };
    } catch (error) {
      this.logger.error(`Message error: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage("message:read")
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string },
  ) {
    try {
      if (!client.data.user || !(client.data.user.isAdmin || client.data.user.role === "admin")) {
        return { error: "Unauthorized" };
      }

      await this.messageService.markAsRead(
        payload.userId,
        client.data.user.sourceId,
      );

      this.server.to(`user:${payload.userId}`).emit("message:read", {
        userId: payload.userId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Mark as read error: ${error.message}`);
      return { error: error.message };
    }
  }
}
