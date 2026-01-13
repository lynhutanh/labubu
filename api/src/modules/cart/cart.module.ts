import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { cartProviders } from "./providers";
import { CartController } from "./controllers";
import { CartService } from "./services";
import { UserRegisteredListener } from "./listeners";
import { AuthModule } from "../auth/auth.module";
import { ProductModule } from "../products/product.module";

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule),
    forwardRef(() => ProductModule),
  ],
  controllers: [CartController],
  providers: [...cartProviders, CartService, UserRegisteredListener],
  exports: [...cartProviders, CartService],
})
export class CartModule {}
