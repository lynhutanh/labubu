import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { categoryProviders } from "./providers";
import { CategoryController, AdminCategoryController } from "./controllers";
import { CategoryService } from "./services";
import { CategoryUpdateListener, CategoryDeleteListener } from "./listeners";
import { AuthModule } from "../auth/auth.module";
import { SocketModule } from "../websocket/socket.module";
import { productProviders } from "../products/providers";

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule),
    forwardRef(() => SocketModule),
  ],
  controllers: [CategoryController, AdminCategoryController],
  providers: [
    ...categoryProviders,
    ...productProviders,
    CategoryService,
    CategoryUpdateListener,
    CategoryDeleteListener,
  ],
  exports: [...categoryProviders, CategoryService],
})
export class CategoryModule {}

