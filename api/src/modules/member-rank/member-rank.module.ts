import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';
import { rankProviders } from './providers/rank.provider';
import { RankService } from './services/rank.service';
import { AdminRankController } from './controllers/admin-rank.controller';
import { RankController } from './controllers/rank.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongoDBModule,
        forwardRef(() => AuthModule),
    ],
    providers: [...rankProviders, RankService],
    controllers: [AdminRankController, RankController],
    exports: [RankService],
})
export class MemberRankModule { }
