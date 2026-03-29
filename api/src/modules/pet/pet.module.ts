import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';
import { petProviders } from './providers';
import { AdminPetController, UserPetController } from './controllers';
import { PetService } from './services';
import { AuthModule } from '../auth/auth.module';
import { OrderModule } from '../orders/order.module';
import { PaymentModule } from '../payment/payment.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule),
    forwardRef(() => OrderModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => UserModule),
  ],
  controllers: [AdminPetController, UserPetController],
  providers: [...petProviders, PetService],
  exports: [...petProviders, PetService],
})
export class PetModule {}
