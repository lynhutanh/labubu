const fs = require('fs');
const content = [
  'import { forwardRef, Module } from "@nestjs/common";',
  'import { MongoDBModule } from "src/kernel";',
  'import { voucherProviders } from "./providers";',
  'import { AdminVoucherController }from "./controllers";',
  'import { VoucherService } from "./services";',
  'import { AuthModule } from "../auth/auth.module";',
  '',
  '@Module({',
  '  imports: [MongoDBModule, forwardRef(() => AuthModule)],',
  '  controllers: [AdminVoucherController],',
  '  providers: [...voucherProviders, VoucherService],',
  '  exports: [...voucherProviders, VoucherService],',
  '})',
  'export class VoucherModule {}',
  '',
].join('\n');
fs.writeFileSync('src/modules/voucher/voucher.module.ts', content, 'utf8');
console.log('done');
