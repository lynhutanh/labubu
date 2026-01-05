import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { productProviders } from "./providers";
import { AdminProductController, UserProductController } from "./controllers";
import { AdminProductService, UserProductService } from "./services";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [MongoDBModule, forwardRef(() => AuthModule)],
  controllers: [AdminProductController, UserProductController],
  providers: [...productProviders, AdminProductService, UserProductService],
  exports: [...productProviders, AdminProductService, UserProductService],
})
export class ProductModule {}

