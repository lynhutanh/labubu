import { Module, forwardRef } from "@nestjs/common";
import { MongoDBModule } from "src/kernel/infras";
import { MessageService } from "./services/message.service";
import { messageProviders } from "./providers/message.provider";
import { AuthModule } from "../auth/auth.module";
import { SocketModule } from "../websocket/socket.module";
import { UserModule } from "../user/user.module";
import { ChatController } from "./controllers/chat.controller";
import { ChatGateway } from "./gateways/chat.gateway";

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule),
    forwardRef(() => SocketModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ChatController],
  providers: [...messageProviders, MessageService, ChatGateway],
  exports: [MessageService],
})
export class ChatModule {}
