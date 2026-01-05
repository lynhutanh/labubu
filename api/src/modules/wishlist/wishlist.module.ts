import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { wishlistProviders } from "./providers";
import { WishlistController } from "./controllers";
import { WishlistService } from "./services";
import { AuthModule } from "../auth/auth.module";
import { ProductModule } from "../products/product.module";

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule),
    forwardRef(() => ProductModule),
  ],
  controllers: [WishlistController],
  providers: [...wishlistProviders, WishlistService],
  exports: [...wishlistProviders, WishlistService],
})
export class WishlistModule {}





