import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Inject, forwardRef } from "@nestjs/common";
import { Socket } from "socket.io";
import { AuthService } from "src/modules/auth/services";
import { pick } from "lodash";
import { SocketUserService } from "../services/socket-user.service";

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})
export class WsUserConnectedGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(forwardRef(() => SocketUserService))
    private readonly socketUserService: SocketUserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: any): Promise<void> {
    if (!client.handshake.query.token) return;
    await this.login(client, client.handshake.query.token);
  }

  async handleDisconnect(client: any) {
    if (!client.handshake.query.token) return;
    await this.logout(client, client.handshake.query.token);
  }

  @SubscribeMessage("auth/login")
  async handleLogin(client: Socket, payload: { token: string }) {
    if (!payload || !payload.token) {
      return;
    }
    await this.login(client, payload.token);
  }

  @SubscribeMessage("auth/logout")
  async handleLogout(client: Socket, payload: { token: string }) {
    if (!payload || !payload.token) {
      return;
    }
    await this.logout(client, payload.token);
  }

  async login(client: any, token: string) {
    const decoded = await this.authService.verifySession(token);
    if (!decoded) return;

    await this.socketUserService.addConnection(decoded.sourceId, client.id);
    client.authUser = pick(decoded, ["source", "sourceId", "authId"]);
  }

  async logout(client: any, token: string) {
    const decoded = await this.authService.verifySession(token);
    if (!decoded) {
      return;
    }
    if (!client.authUser) {
      return;
    }
    await this.socketUserService.removeConnection(decoded.sourceId, client.id);
    client.authUser = pick(decoded, ["source", "sourceId", "authId"]);
  }
}
