import { Module, forwardRef } from "@nestjs/common";
import { SocketUserService } from "./services/socket-user.service";
import { WsUserConnectedGateway } from "./gateways/user-connected.gateway";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [SocketUserService, WsUserConnectedGateway],
  controllers: [],
  exports: [SocketUserService],
})
export class SocketModule {}
