const fs = require('fs');
const path = require('path');

const base = 'src/modules/voucher';

['schemas','dtos','payloads','providers','services','controllers','models'].forEach(d => {
  fs.mkdirSync(path.join(base, d), { recursive: true });
});

// schema
fs.writeFileSync(path.join(base, 'schemas/voucher.schema.ts'), `import { Schema } from 'mongoose';

export const voucherSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percentage', 'fixed', 'shipping'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, required: true, default: 0 },
    maxDiscountAmount: { type: Number, required: true, default: 0 },
    totalQuantity: { type: Number, required: true, min: 1 },
    usedQuantity: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    applicableCategories: { type: [String], default: [] },
    applicableProducts: { type: [String], default: [] },
    applicableUsers: { type: [String], default: [] },
    maxUsesPerUser: { type: Number, default: 1 },
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active', index: true },
    image: { type: String, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

voucherSchema.index({ status: 1, startDate: 1, endDate: 1 });
voucherSchema.index({ code: 1 });
voucherSchema.index({ createdAt: -1 });

export const VoucherSchema = voucherSchema;
`);

fs.writeFileSync(path.join(base, 'schemas/index.ts'), `export * from './voucher.schema';
`);

// provider
fs.writeFileSync(path.join(base, 'providers/voucher.provider.ts'), `import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { voucherSchema } from '../schemas';

export const VOUCHER_PROVIDER = 'VOUCHER';

export const voucherProviders = [
  {
    provide: VOUCHER_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model('voucher', voucherSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
`);

fs.writeFileSync(path.join(base, 'providers/index.ts'), `export * from './voucher.provider';
`);

// dto
fs.writeFileSync(path.join(base, 'dtos/voucher.dto.ts'), `import { Expose, Transform }from 'class-transformer';
import { ObjectId }from 'mongodb';

export class VoucherDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose() code: string;
  @Expose() name: string;
  @Expose() description: string;
  @Expose() type: string;
  @Expose() value: number;
  @Expose() minOrderAmount: number;
  @Expose() maxDiscountAmount: number;
  @Expose() totalQuantity: number;
  @Expose() usedQuantity: number;
  @Expose() startDate: Date;
  @Expose() endDate: Date;
  @Expose() applicableCategories: string[];
  @Expose() applicableProducts: string[];
  @Expose() applicableUsers: string[];
  @Expose() maxUsesPerUser: number;
  @Expose() status: string;
  @Expose() image: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }

  get remainingQuantity(): number {
    return this.totalQuantity - this.usedQuantity;
  }
}

export class VoucherSearchResponseDto {
  @Expose() vouchers: VoucherDto[];
  @Expose() total: number;
  @Expose() page: number;
  @Expose() limit: number;
  @Expose() totalPages: number;

  constructor(init?: Partial<VoucherSearchResponseDto>) {
    if (init) {
      this.vouchers = init.vouchers || [];
      this.total = init.total || 0;
      this.page = init.page || 1;
      this.limit = init.limit || 20;
      this.totalPages = Math.ceil(this.total / this.limit);
    }
  }
}

export class VoucherStatsDto {
  @Expose() totalVouchers: number;
  @Expose() activeVouchers: number;
  @Expose() expiredVouchers: number;
  @Expose() inactiveVouchers: number;

  constructor(init?: Partial<VoucherStatsDto>) {
    if (init) Object.assign(this, init);
  }
}
`);

fs.writeFileSync(path.join(base, 'dtos/index.ts'), `export * from './voucher.dto';
`);

// payloads
fs.writeFileSync(path.join(base, 'payloads/create-voucher.payload.ts'), `import {
  IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsArray, IsDate, Min,
}from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateVoucherPayload {
  @IsNotEmpty() @IsString()
  @Transform(({ value }) => value?.trim().toUpperCase())
  code: string;

  @IsNotEmpty() @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsNotEmpty() @IsEnum(['percentage', 'fixed', 'shipping'])
  type: string;

  @IsNumber() @Min(0)
  @Transform(({ value }) => Number(value))
  value: number;

  @IsNumber() @Min(0)
  @Transform(({ value }) => Number(value))
  minOrderAmount: number;

  @IsNumber() @Min(0)
  @Transform(({ value }) => Number(value))
  maxDiscountAmount: number;

  @IsNumber() @Min(1)
  @Transform(({ value }) => Number(value))
  totalQuantity: number;

  @Type(() => Date) @IsDate()
  startDate: Date;

  @Type(() => Date) @IsDate()
  endDate: Date;

  @IsOptional() @IsArray()
  applicableCategories?: string[];

  @IsOptional() @IsArray()
  applicableProducts?: string[];

  @IsOptional() @IsArray()
  applicableUsers?: string[];

  @IsOptional() @IsNumber() @Min(1)
  @Transform(({ value }) => Number(value))
  maxUsesPerUser?: number;

  @IsOptional() @IsString()
  image?: string;
}

export class UpdateVoucherPayload {
  @IsOptional() @IsString()
  @Transform(({ value }) => value?.trim().toUpperCase())
  code?: string;

  @IsOptional() @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(['percentage', 'fixed', 'shipping'])
  type?: string;

  @IsOptional() @IsNumber() @Min(0)
  @Transform(({ value }) => Number(value))
  value?: number;

  @IsOptional() @IsNumber() @Min(0)
  @Transform(({ value }) => Number(value))
  minOrderAmount?: number;

  @IsOptional() @IsNumber() @Min(0)
  @Transform(({ value }) => Number(value))
  maxDiscountAmount?: number;

  @IsOptional() @IsNumber() @Min(1)
  @Transform(({ value }) => Number(value))
  totalQuantity?: number;

  @IsOptional() @Type(() => Date) @IsDate()
  startDate?: Date;

  @IsOptional() @Type(() => Date) @IsDate()
  endDate?: Date;

  @IsOptional() @IsArray()
  applicableCategories?: string[];

  @IsOptional() @IsArray()
  applicableProducts?: string[];

  @IsOptional() @IsArray()
  applicableUsers?: string[];

  @IsOptional() @IsNumber() @Min(1)
  @Transform(({ value }) => Number(value))
  maxUsesPerUser?: number;

  @IsOptional() @IsEnum(['active', 'inactive', 'expired'])
  status?: string;

  @IsOptional() @IsString()
  image?: string;
}

export class VoucherSearchPayload {
  @IsOptional() @IsString()
  keyword?: string;

  @IsOptional() @IsEnum(['active', 'inactive', 'expired'])
  status?: string;

  @IsOptional() @IsEnum(['percentage', 'fixed', 'shipping'])
  type?: string;

  @IsOptional() @IsNumber() @Type(() => Number)
  page?: number = 1;

  @IsOptional() @IsNumber() @Type(() => Number)
  limit?: number = 20;

  @IsOptional() @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional() @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class VoucherBulkOperationPayload {
  @IsArray()
  voucherIds: string[];

  @IsString()
  action: string;
}
`);

fs.writeFileSync(path.join(base, 'payloads/index.ts'), `export * from './create-voucher.payload';
`);

// service
fs.writeFileSync(path.join(base, 'services/voucher.service.ts'), `import {
  Injectable, BadRequestException, NotFoundException, Inject,
}from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { VOUCHER_PROVIDER } from '../providers';
import { VoucherDto, VoucherSearchResponseDto, VoucherStatsDto } from '../dtos';
import {
  CreateVoucherPayload, UpdateVoucherPayload, VoucherSearchPayload, VoucherBulkOperationPayload,
} from '../payloads';

@Injectable()
export class VoucherService {
  constructor(
    @Inject(VOUCHER_PROVIDER)
    private readonly voucherModel: Model<any>,
  ) {}

  async findById(id: string): Promise<VoucherDto | null> {
    if (!id || !ObjectId.isValid(id)) return null;
    const v = await this.voucherModel.findById(id).lean();
    return v ? new VoucherDto(v) : null;
  }

  async findByCode(code: string): Promise<VoucherDto | null> {
    const v = await this.voucherModel.findOne({ code: code.toUpperCase() }).lean();
    return v ? new VoucherDto(v) : null;
  }

  async create(payload: CreateVoucherPayload): Promise<VoucherDto> {
    const existing = await this.voucherModel.findOne({ code: payload.code });
    if (existing) throw new BadRequestException('Mã voucher đã tồn tại');

    if (new Date(payload.startDate) >= new Date(payload.endDate)) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }

    const voucher = await this.voucherModel.create(payload);
    return new VoucherDto(voucher);
  }

  async update(id: string, payload: UpdateVoucherPayload): Promise<VoucherDto> {
    const voucher = await this.voucherModel.findById(id);
    if (!voucher) throw new NotFoundException('Voucher không tồn tại');

    if (payload.code && payload.code !== voucher.code) {
      const existing = await this.voucherModel.findOne({ code: payload.code, _id: { $ne: id } });
      if (existing) throw new BadRequestException('Mã voucher đã tồn tại');
    }

    const updated = await this.voucherModel.findByIdAndUpdate(
      id, { $set: { ...payload, updatedAt: new Date() } }, { new: true },
    );
    return new VoucherDto(updated);
  }

  async delete(id: string): Promise<boolean> {
    const voucher = await this.voucherModel.findById(id);
    if (!voucher) throw new NotFoundException('Voucher không tồn tại');
    await this.voucherModel.findByIdAndDelete(id);
    return true;
  }

  async search(payload: VoucherSearchPayload): Promise<VoucherSearchResponseDto> {
    const { keyword, status, type, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = payload;

    const query: any = {};
    if (keyword) {
      query.$or = [
        { code: { $regex: keyword, $options: 'i' } },
        { name: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (type) query.type = type;

    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [vouchers, total] = await Promise.all([
      this.voucherModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      this.voucherModel.countDocuments(query),
    ]);

    return new VoucherSearchResponseDto({
      vouchers: vouchers.map(v => new VoucherDto(v)),
      total, page, limit,
    });
  }

  async getStats(): Promise<VoucherStatsDto> {
    const now = new Date();
    const [total, active, expired, inactive] = await Promise.all([
      this.voucherModel.countDocuments(),
      this.voucherModel.countDocuments({ status: 'active', endDate: { $gte: now } }),
      this.voucherModel.countDocuments({ endDate: { $lt: now } }),
      this.voucherModel.countDocuments({ status: 'inactive' }),
    ]);
    return new VoucherStatsDto({
      totalVouchers: total,
      activeVouchers: active,
      expiredVouchers: expired,
      inactiveVouchers: inactive,
    });
  }

  async bulkOperation(payload: VoucherBulkOperationPayload): Promise<{ success: number; failed: number }> {
    let success = 0, failed = 0;
    for (const id of payload.voucherIds) {
      try {
        if (payload.action === 'activate') {
          await this.voucherModel.findByIdAndUpdate(id, { status: 'active' });
        } else if (payload.action === 'deactivate') {
          await this.voucherModel.findByIdAndUpdate(id, { status: 'inactive' });
        } else if (payload.action === 'delete') {
          await this.voucherModel.findByIdAndDelete(id);
        }
        success++;
      } catch { failed++; }
    }
    return { success, failed };
  }

  async validateVoucher(code: string, orderAmount: number, userId?: string): Promise<{ valid: boolean; discount: number; message?: string }> {
    const voucher = await this.voucherModel.findOne({ code: code.toUpperCase() }).lean();
    if (!voucher) return { valid: false, discount: 0, message: 'Voucher không tồn tại' };

    const now = new Date();
    if (voucher.status !== 'active') return { valid: false, discount: 0, message: 'Voucher không còn hiệu lực' };
    if (now < new Date(voucher.startDate)) return { valid: false, discount: 0, message: 'Voucher chưa có hiệu lực' };
    if (now > new Date(voucher.endDate)) return { valid: false, discount: 0, message: 'Voucher đã hết hạn' };
    if (voucher.usedQuantity >= voucher.totalQuantity) return { valid: false, discount: 0, message: 'Voucher đã hết lượt sử dụng' };
    if (orderAmount < voucher.minOrderAmount) return { valid: false, discount: 0, message: \`Đơn hàng tối thiểu \${voucher.minOrderAmount.toLocaleString()}đ\` };

    let discount = 0;
    if (voucher.type === 'percentage') {
      discount = (orderAmount * voucher.value) / 100;
    }else {
      discount = voucher.value;
    }
    discount = Math.min(discount, voucher.maxDiscountAmount);

    return { valid: true, discount };
  }
}
`);

fs.writeFileSync(path.join(base, 'services/index.ts'), `export * from './voucher.service';
`);

// controller
fs.writeFileSync(path.join(base, 'controllers/admin-voucher.controller.ts'), `import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  HttpCode, HttpStatus, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataResponse } from 'src/kernel';
import { RoleGuard } from 'src/modules/auth/guards';
import { Role } from 'src/modules/auth/decorators';
import { ROLE } from 'src/modules/user/constants';
import { VoucherService } from '../services';
import { VoucherDto, VoucherSearchResponseDto, VoucherStatsDto }from '../dtos';
import {
  CreateVoucherPayload, UpdateVoucherPayload, VoucherSearchPayload, VoucherBulkOperationPayload,
}from '../payloads';

@ApiTags('Admin Vouchers')
@Controller('admin/vouchers')
export class AdminVoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get('search')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(@Query() query: VoucherSearchPayload): Promise<DataResponse<VoucherSearchResponseDto>> {
    const result = await this.voucherService.search(query);
    return DataResponse.ok(result);
  }

  @Get('stats')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getStats(): Promise<DataResponse<VoucherStatsDto>> {
    return DataResponse.ok(await this.voucherService.getStats());
  }

  @Get(':id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<DataResponse<VoucherDto | null>> {
    return DataResponse.ok(await this.voucherService.findById(id));
  }

  @Post()
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() payload: CreateVoucherPayload): Promise<DataResponse<VoucherDto>> {
    return DataResponse.ok(await this.voucherService.create(payload));
  }

  @Put(':id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() payload: UpdateVoucherPayload): Promise<DataResponse<VoucherDto>> {
    return DataResponse.ok(await this.voucherService.update(id, payload));
  }

  @Delete(':id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<DataResponse<{ success: boolean }>> {
    return DataResponse.ok({ success: await this.voucherService.delete(id) });
  }

  @Post('bulk')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async bulkOperation(@Body() payload: VoucherBulkOperationPayload): Promise<DataResponse<{ success: number; failed: number }>> {
    return DataResponse.ok(await this.voucherService.bulkOperation(payload));
  }
}
`);

fs.writeFileSync(path.join(base, 'controllers/index.ts'), `export * from './admin-voucher.controller';
`);

// module
fs.writeFileSync(path.join(base, 'voucher.module.ts'), `import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';
import { voucherProviders }from './providers';
import { AdminVoucherController } from './controllers';
import { VoucherService } from './services';
import { AuthModule }from '../auth/auth.module';

@Module({
  imports: [MongoDBModule, forwardRef(() => AuthModule)],
  controllers: [AdminVoucherController],
  providers: [...voucherProviders, VoucherService],
  exports: [...voucherProviders, VoucherService],
})
export class VoucherModule {}
`);

console.log('All voucher files written successfully!');
