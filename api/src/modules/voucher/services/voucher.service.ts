import {
  Injectable, BadRequestException, NotFoundException, Inject,
} from '@nestjs/common';
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
  ) { }

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
    if (orderAmount < voucher.minOrderAmount) return { valid: false, discount: 0, message: `Đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString()}đ` };

    let discount = 0;
    if (voucher.type === 'percentage') {
      discount = (orderAmount * voucher.value) / 100;
    } else {
      discount = voucher.value;
    }
    discount = Math.min(discount, voucher.maxDiscountAmount);

    return { valid: true, discount };
  }

  async useVoucher(code: string): Promise<void> {
    await this.voucherModel.updateOne(
      { code: code.toUpperCase() },
      { $inc: { usedQuantity: 1 } },
    );
  }
}
