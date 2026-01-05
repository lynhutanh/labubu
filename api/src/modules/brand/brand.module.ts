import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { brandProviders } from "./providers";
import { BrandController, AdminBrandController } from "./controllers";
import { BrandService } from "./services";
import { BrandDeleteListener } from "./listeners";
import { AuthModule } from "../auth/auth.module";
import { ProductModule } from "../products/product.module";

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule),
    forwardRef(() => ProductModule),
  ],
  controllers: [BrandController, AdminBrandController],
  providers: [...brandProviders, BrandService, BrandDeleteListener],
  exports: [...brandProviders, BrandService],
})
export class BrandModule {}

