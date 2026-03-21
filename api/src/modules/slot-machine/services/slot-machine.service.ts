import {
  Injectable, BadRequestException, NotFoundException, Inject,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { SLOT_MACHINE_CONFIG_PROVIDER, SLOT_MACHINE_RESULT_PROVIDER } from '../providers';
import { SlotMachineConfigDto, SlotMachineResultDto, SlotMachineResultSearchResponseDto } from '../dtos';
import {
  CreateSlotMachineConfigPayload, UpdateSlotMachineConfigPayload, SlotMachineResultSearchPayload,
  SubmitSlotMachineInfoPayload, UpdateSlotMachineDeliveryStatusPayload,
} from '../payloads';
import { ORDER_PROVIDER } from 'src/modules/orders/constants';

@Injectable()
export class SlotMachineService {
  constructor(
    @Inject(SLOT_MACHINE_CONFIG_PROVIDER)
    private readonly configModel: Model<any>,
    @Inject(SLOT_MACHINE_RESULT_PROVIDER)
    private readonly resultModel: Model<any>,
    @Inject(ORDER_PROVIDER)
    private readonly orderModel: Model<any>,
  ) { }

  async getActiveConfig(): Promise<SlotMachineConfigDto | null> {
    const now = new Date();
    const config = await this.configModel.findOne({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();
    return config ? new SlotMachineConfigDto(config) : null;
  }

  async getConfigs(): Promise<SlotMachineConfigDto[]> {
    const configs = await this.configModel.find().sort({ createdAt: -1 }).lean();
    return configs.map(c => new SlotMachineConfigDto(c));
  }

  async getConfigById(id: string): Promise<SlotMachineConfigDto | null> {
    if (!id || !ObjectId.isValid(id)) return null;
    const config = await this.configModel.findById(id).lean();
    return config ? new SlotMachineConfigDto(config) : null;
  }

  async createConfig(payload: CreateSlotMachineConfigPayload): Promise<SlotMachineConfigDto> {
    if (new Date(payload.startDate) >= new Date(payload.endDate)) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }
    if (!payload.symbols || payload.symbols.length < 3) {
      throw new BadRequestException('Cần ít nhất 3 ký hiệu');
    }
    if (!payload.prizes || payload.prizes.length < 1) {
      if (!payload.jackpotCombos || payload.jackpotCombos.length === 0) {
        throw new BadRequestException('Cần ít nhất 1 phần thưởng hoặc 1 jackpot combo');
      }
    }
    const config = await this.configModel.create(payload);
    return new SlotMachineConfigDto(config);
  }

  async updateConfig(id: string, payload: UpdateSlotMachineConfigPayload): Promise<SlotMachineConfigDto> {
    const config = await this.configModel.findById(id);
    if (!config) throw new NotFoundException('Cấu hình không tồn tại');

    if (payload.startDate && payload.endDate) {
      if (new Date(payload.startDate) >= new Date(payload.endDate)) {
        throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
      }
    }
    if (payload.symbols && payload.symbols.length < 3) {
      throw new BadRequestException('Cần ít nhất 3 ký hiệu');
    }

    const updated = await this.configModel.findByIdAndUpdate(
      id, { $set: { ...payload, updatedAt: new Date() } }, { new: true },
    ).lean();
    return new SlotMachineConfigDto(updated);
  }

  async deleteConfig(id: string): Promise<boolean> {
    const config = await this.configModel.findById(id);
    if (!config) throw new NotFoundException('Cấu hình không tồn tại');
    await this.configModel.findByIdAndDelete(id);
    return true;
  }

  async getSlotTurns(userId: string, configId: string): Promise<{ totalTurns: number; usedTurns: number; remainingTurns: number }> {
    const config = await this.configModel.findById(configId).lean() as any;
    if (!config) throw new NotFoundException('Cấu hình không tồn tại');

    const minSpent = config.minSpentAmount || 0;
    const maxSpins = config.maxSpinsPerUser || 0;

    const usedTurns = await this.resultModel.countDocuments({
      configId: config._id,
      buyerId: new ObjectId(userId),
    });

    if (minSpent <= 0) {
      const totalTurns = maxSpins > 0 ? maxSpins : usedTurns + 1;
      return {
        totalTurns,
        usedTurns,
        remainingTurns: Math.max(0, totalTurns - usedTurns),
      };
    }

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

    if (maxSpins > 0) {
      totalTurns = Math.min(totalTurns, maxSpins);
    }

    return {
      totalTurns,
      usedTurns,
      remainingTurns: Math.max(0, totalTurns - usedTurns),
    };
  }

  async play(configId: string, userId: string): Promise<SlotMachineResultDto> {
    const config = await this.configModel.findById(configId).lean() as any;
    if (!config) throw new NotFoundException('Cấu hình không tồn tại');

    const now = new Date();
    if (config.status !== 'active') throw new BadRequestException('Sự kiện chưa được kích hoạt');
    if (now < new Date(config.startDate)) throw new BadRequestException('Sự kiện chưa bắt đầu');
    if (now > new Date(config.endDate)) throw new BadRequestException('Sự kiện đã kết thúc');

    // Kiểm tra lượt chơi
    const minSpent = config.minSpentAmount || 0;
    if (minSpent > 0) {
      const turns = await this.getSlotTurns(userId, configId);
      if (turns.remainingTurns <= 0) {
        throw new BadRequestException(`Bạn đã hết lượt chơi. Mua hàng đủ ${minSpent.toLocaleString('vi-VN')}đ để có thêm lượt.`);
      }
    }

    const symbolCount = config.symbols.length;
    const combos: any[] = config.jackpotCombos || [];

    let reels: number[];
    let type: 'prize' | 'lose';
    let prizeLabel = '';
    let prizeImage = '';

    if (combos.length > 0) {
      // 1 lần roll: combo1_rate + combo2_rate + ... + (100 - sum) = thua
      const rand = Math.random() * 100;
      let cumulative = 0;
      let selectedCombo: any = null;
      for (const combo of combos) {
        cumulative += combo.rate;
        if (rand < cumulative) {
          selectedCombo = combo;
          break;
        }
      }

      if (selectedCombo) {
        const winSymbol = Math.min(selectedCombo.symbolIndex, symbolCount - 1);
        reels = [winSymbol, winSymbol, winSymbol];
        type = 'prize';
        prizeLabel = selectedCombo.prizeLabel;
        prizeImage = selectedCombo.prizeImage || '';
      } else {
        // Phần còn lại = thua (Chúc may mắn)
        reels = [];
        for (let i = 0; i < 3; i++) {
          reels.push(Math.floor(Math.random() * symbolCount));
        }
        if (reels[0] === reels[1] && reels[1] === reels[2]) {
          reels[2] = (reels[2] + 1) % symbolCount;
        }
        type = 'lose';
      }
    } else {
      // Fallback: dùng winRate cũ khi không có jackpotCombos
      const isWin = Math.random() * 100 < config.winRate;
      if (isWin && config.prizes.length > 0) {
        const winSymbol = Math.floor(Math.random() * symbolCount);
        reels = [winSymbol, winSymbol, winSymbol];
        type = 'prize';
        const prizeIndex = Math.floor(Math.random() * config.prizes.length);
        prizeLabel = config.prizes[prizeIndex].label;
        prizeImage = config.prizes[prizeIndex].image || '';
      } else {
        reels = [];
        for (let i = 0; i < 3; i++) {
          reels.push(Math.floor(Math.random() * symbolCount));
        }
        if (reels[0] === reels[1] && reels[1] === reels[2]) {
          reels[2] = (reels[2] + 1) % symbolCount;
        }
        type = 'lose';
      }
    }

    const doc = await this.resultModel.create({
      configId: config._id,
      buyerId: userId ? new ObjectId(userId) : null,
      reels,
      type,
      prizeLabel,
      prizeImage,
    });

    return new SlotMachineResultDto(doc.toObject());
  }

  async getResultsByIds(ids: string[]): Promise<SlotMachineResultDto[]> {
    const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
    if (!validIds.length) return [];
    const results = await this.resultModel
      .find({ _id: { $in: validIds } })
      .sort({ createdAt: -1 })
      .lean();
    return results.map(r => new SlotMachineResultDto(r));
  }

  async getResultsByUser(userId: string): Promise<SlotMachineResultDto[]> {
    const results = await this.resultModel
      .find({ buyerId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return results.map(r => new SlotMachineResultDto(r));
  }

  async submitInfo(resultId: string, payload: SubmitSlotMachineInfoPayload): Promise<SlotMachineResultDto> {
    const result = await this.resultModel.findById(resultId);
    if (!result) throw new NotFoundException('Kết quả không tồn tại');

    const updated = await this.resultModel.findByIdAndUpdate(
      resultId,
      { $set: { ...payload, updatedAt: new Date() } },
      { new: true },
    ).lean();
    return new SlotMachineResultDto(updated);
  }

  async searchResults(payload: SlotMachineResultSearchPayload): Promise<SlotMachineResultSearchResponseDto> {
    const { keyword, type, deliveryStatus, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = payload;

    const query: any = {};
    if (keyword) {
      query.$or = [
        { fullName: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { prizeLabel: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (type) query.type = type;
    if (deliveryStatus) query.deliveryStatus = deliveryStatus;

    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      this.resultModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      this.resultModel.countDocuments(query),
    ]);

    return new SlotMachineResultSearchResponseDto({
      results: results.map(r => new SlotMachineResultDto(r)),
      total, page, limit,
    });
  }

  async updateDeliveryStatus(resultId: string, payload: UpdateSlotMachineDeliveryStatusPayload): Promise<SlotMachineResultDto> {
    const result = await this.resultModel.findById(resultId);
    if (!result) throw new NotFoundException('Kết quả không tồn tại');

    const updated = await this.resultModel.findByIdAndUpdate(
      resultId,
      { $set: { deliveryStatus: payload.deliveryStatus, note: payload.note || '', updatedAt: new Date() } },
      { new: true },
    ).lean();
    return new SlotMachineResultDto(updated);
  }
}
