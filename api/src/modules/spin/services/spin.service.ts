import {
  Injectable, BadRequestException, NotFoundException, Inject,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { SPIN_CONFIG_PROVIDER, SPIN_RESULT_PROVIDER } from '../providers';
import { SpinConfigDto, SpinResultDto, SpinResultSearchResponseDto } from '../dtos';
import {
  CreateSpinConfigPayload, UpdateSpinConfigPayload, SpinResultSearchPayload,
  SubmitSpinInfoPayload, UpdateDeliveryStatusPayload, PlaySpinPayload,
} from '../payloads';
import { ORDER_PROVIDER } from 'src/modules/orders/constants';

@Injectable()
export class SpinService {
  constructor(
    @Inject(SPIN_CONFIG_PROVIDER)
    private readonly spinConfigModel: Model<any>,
    @Inject(SPIN_RESULT_PROVIDER)
    private readonly spinResultModel: Model<any>,
    @Inject(ORDER_PROVIDER)
    private readonly orderModel: Model<any>,
  ) { }

  async getActiveConfig(): Promise<SpinConfigDto | null> {
    const now = new Date();
    const config = await this.spinConfigModel.findOne({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();
    return config ? new SpinConfigDto(config) : null;
  }

  async getConfigs(): Promise<SpinConfigDto[]> {
    const configs = await this.spinConfigModel.find().sort({ createdAt: -1 }).lean();
    return configs.map(c => new SpinConfigDto(c));
  }

  async getConfigById(id: string): Promise<SpinConfigDto | null> {
    if (!id || !ObjectId.isValid(id)) return null;
    const config = await this.spinConfigModel.findById(id).lean();
    return config ? new SpinConfigDto(config) : null;
  }

  async createConfig(payload: CreateSpinConfigPayload): Promise<SpinConfigDto> {
    if (new Date(payload.startDate) >= new Date(payload.endDate)) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }

    const totalRate = payload.slots.reduce((sum, s) => sum + s.rate, 0);
    if (totalRate !== 100) {
      throw new BadRequestException(`Tổng tỉ lệ phải bằng 100%, hiện tại: ${totalRate}%`);
    }

    const config = await this.spinConfigModel.create(payload);
    return new SpinConfigDto(config);
  }

  async updateConfig(id: string, payload: UpdateSpinConfigPayload): Promise<SpinConfigDto> {
    const config = await this.spinConfigModel.findById(id);
    if (!config) throw new NotFoundException('Cấu hình không tồn tại');

    if (payload.startDate && payload.endDate) {
      if (new Date(payload.startDate) >= new Date(payload.endDate)) {
        throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
      }
    }

    if (payload.slots) {
      const totalRate = payload.slots.reduce((sum, s) => sum + s.rate, 0);
      if (totalRate !== 100) {
        throw new BadRequestException(`Tổng tỉ lệ phải bằng 100%, hiện tại: ${totalRate}%`);
      }
    }

    const updated = await this.spinConfigModel.findByIdAndUpdate(
      id, { $set: { ...payload, updatedAt: new Date() } }, { new: true },
    ).lean();
    return new SpinConfigDto(updated);
  }

  async deleteConfig(id: string): Promise<boolean> {
    const config = await this.spinConfigModel.findById(id);
    if (!config) throw new NotFoundException('Cấu hình không tồn tại');
    await this.spinConfigModel.findByIdAndDelete(id);
    return true;
  }

  async getSpinTurns(userId: string, configId: string): Promise<{ totalTurns: number; usedTurns: number; remainingTurns: number }> {
    const config = await this.spinConfigModel.findById(configId).lean() as any;
    if (!config) throw new NotFoundException('Cấu hình không tồn tại');

    const minSpent = config.minSpentAmount || 0;
    const maxSpins = config.maxSpinsPerUser || 0;

    // Đếm số lượt đã quay
    const usedTurns = await this.spinResultModel.countDocuments({
      configId: config._id,
      buyerId: new ObjectId(userId),
    });

    // Đếm số lượt quay thêm (những lần quay trúng ô 'extra_turn')
    const extraTurns = await this.spinResultModel.countDocuments({
      configId: config._id,
      buyerId: new ObjectId(userId),
      type: 'extra_turn',
    });

    // Nếu không giới hạn tiền mua
    if (minSpent <= 0) {
      // Nếu có maxSpinsPerUser thì giới hạn, không thì unlimited
      const totalTurns = maxSpins > 0 ? maxSpins + extraTurns : usedTurns + 1;
      return {
        totalTurns,
        usedTurns,
        remainingTurns: Math.max(0, totalTurns - usedTurns),
      };
    }

    // Tính tổng tiền đã chi của user dựa trên buyerId trong đơn hàng completed/delivered
    const completedStatuses = ['completed', 'delivered'];
    const aggregateResult = await this.orderModel.aggregate([
      {
        $match: {
          buyerId: new ObjectId(userId),
          status: { $in: completedStatuses },
        },
      },
      { $group: { _id: null, totalSpent: { $sum: '$total' } } },
    ]);

    const totalSpent = aggregateResult.length > 0 ? aggregateResult[0].totalSpent : 0;
    let totalTurns = Math.floor(totalSpent / minSpent);

    // Giới hạn bởi maxSpinsPerUser nếu có
    if (maxSpins > 0) {
      totalTurns = Math.min(totalTurns, maxSpins);
    }

    // Cộng thêm các lượt quay trúng thưởng được cộng
    totalTurns += extraTurns;

    return {
      totalTurns,
      usedTurns,
      remainingTurns: Math.max(0, totalTurns - usedTurns),
    };
  }

  async spin(configId: string, userId: string): Promise<SpinResultDto> {
    const config = await this.spinConfigModel.findById(configId).lean() as any;
    if (!config) throw new NotFoundException('Cấu hình không tồn tại');

    const now = new Date();
    if (config.status !== 'active') throw new BadRequestException('Sự kiện chưa được kích hoạt');
    if (now < new Date(config.startDate)) throw new BadRequestException('Sự kiện chưa bắt đầu');
    if (now > new Date(config.endDate)) throw new BadRequestException('Sự kiện đã kết thúc');

    // Kiểm tra lượt quay
    const minSpent = config.minSpentAmount || 0;
    if (minSpent > 0) {
      const turns = await this.getSpinTurns(userId, configId);
      if (turns.remainingTurns <= 0) {
        throw new BadRequestException(`Bạn đã hết lượt quay. Mua hàng đủ ${minSpent.toLocaleString('vi-VN')}đ để có thêm lượt.`);
      }
    }

    // Weighted random
    const rand = Math.random() * 100;
    let cumulative = 0;
    let selectedIndex = 0;
    for (let i = 0; i < config.slots.length; i++) {
      cumulative += config.slots[i].rate;
      if (rand <= cumulative) {
        selectedIndex = i;
        break;
      }
    }

    const selectedSlot = config.slots[selectedIndex];
    const doc = await this.spinResultModel.create({
      configId: config._id,
      buyerId: userId ? new ObjectId(userId) : null,
      slotIndex: selectedIndex,
      slotLabel: selectedSlot.label,
      slotImage: selectedSlot.image || '',
      type: selectedSlot.type,
    });

    return new SpinResultDto(doc.toObject());
  }

  async getResultsByIds(ids: string[]): Promise<SpinResultDto[]> {
    const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
    if (!validIds.length) return [];
    const results = await this.spinResultModel
      .find({ _id: { $in: validIds } })
      .sort({ createdAt: -1 })
      .lean();
    return results.map(r => new SpinResultDto(r));
  }

  async submitInfo(resultId: string, payload: SubmitSpinInfoPayload): Promise<SpinResultDto> {
    const result = await this.spinResultModel.findById(resultId);
    if (!result) throw new NotFoundException('Kết quả không tồn tại');

    const updated = await this.spinResultModel.findByIdAndUpdate(
      resultId,
      { $set: { ...payload, updatedAt: new Date() } },
      { new: true },
    ).lean();
    return new SpinResultDto(updated);
  }

  async searchResults(payload: SpinResultSearchPayload): Promise<SpinResultSearchResponseDto> {
    const { keyword, type, deliveryStatus, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = payload;

    const query: any = {};
    if (keyword) {
      query.$or = [
        { fullName: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { buyerPhone: { $regex: keyword, $options: 'i' } },
        { slotLabel: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (type) query.type = type;
    if (deliveryStatus) query.deliveryStatus = deliveryStatus;

    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      this.spinResultModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      this.spinResultModel.countDocuments(query),
    ]);

    return new SpinResultSearchResponseDto({
      results: results.map(r => new SpinResultDto(r)),
      total, page, limit,
    });
  }

  async updateDeliveryStatus(resultId: string, payload: UpdateDeliveryStatusPayload): Promise<SpinResultDto> {
    const result = await this.spinResultModel.findById(resultId);
    if (!result) throw new NotFoundException('Kết quả không tồn tại');

    const updated = await this.spinResultModel.findByIdAndUpdate(
      resultId,
      { $set: { deliveryStatus: payload.deliveryStatus, note: payload.note || '', updatedAt: new Date() } },
      { new: true },
    ).lean();
    return new SpinResultDto(updated);
  }
}
