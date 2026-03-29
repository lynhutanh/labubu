import {
  Injectable, BadRequestException, NotFoundException, Inject,
} from "@nestjs/common";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { PET_PROVIDER, USER_PET_PROVIDER } from "../providers";
import { PetDto, UserPetDto, PetFarmDto, PetFarmItemDto } from "../dtos";
import { CreatePetPayload, UpdatePetPayload } from "../payloads";
import { ORDER_PROVIDER } from "src/modules/orders/constants";
import { WalletService } from "src/modules/payment/services/wallet.service";
import { WALLET_OWNER_TYPE } from "src/modules/payment/constants";
import { USER_MODEL_PROVIDER } from "src/modules/user/providers";

const POINTS_PER_VND = 10000;
const REWARD_POINT_TO_VND = 1000;

@Injectable()
export class PetService {
  constructor(
    @Inject(PET_PROVIDER)
    private readonly petModel: Model<any>,
    @Inject(USER_PET_PROVIDER)
    private readonly userPetModel: Model<any>,
    @Inject(ORDER_PROVIDER)
    private readonly orderModel: Model<any>,
    private readonly walletService: WalletService,
    @Inject(USER_MODEL_PROVIDER)
    private readonly userModel: Model<any>,
  ) {}

  // ========== ADMIN ==========

  async getPets(): Promise<PetDto[]> {
    const pets = await this.petModel.find().sort({ order: 1 }).lean();
    return pets.map((p) => new PetDto(p));
  }

  async getPetById(id: string): Promise<PetDto | null> {
    if (!id || !ObjectId.isValid(id)) return null;
    const pet = await this.petModel.findById(id).lean();
    return pet ? new PetDto(pet) : null;
  }

  private async validatePointRange(
    minPoints: number,
    crackPoints: number,
    maxPoints: number,
    excludeId?: string,
  ) {
    if (minPoints >= crackPoints) {
      throw new BadRequestException(
        "Mốc Trứng vỡ phải lớn hơn mốc bắt đầu",
      );
    }
    if (crackPoints >= maxPoints) {
      throw new BadRequestException(
        "Mốc Nở phải lớn hơn mốc Trứng vỡ",
      );
    }

    const query: any = {
      $or: [
        { minPoints: { $lt: maxPoints }, maxPoints: { $gt: minPoints } },
      ],
    };
    if (excludeId) {
      query._id = { $ne: new ObjectId(excludeId) };
    }

    const overlap = await this.petModel.findOne(query).lean();
    if (overlap) {
      throw new BadRequestException(
        `Khoảng điểm ${minPoints}-${maxPoints} trùng với con vật "${(overlap as any).name}" (${(overlap as any).minPoints}-${(overlap as any).maxPoints})`,
      );
    }
  }

  async createPet(payload: CreatePetPayload): Promise<PetDto> {
    await this.validatePointRange(
      payload.minPoints,
      payload.crackPoints,
      payload.maxPoints,
    );

    const pet = await this.petModel.create(payload);
    return new PetDto(pet);
  }

  async updatePet(id: string, payload: UpdatePetPayload): Promise<PetDto> {
    const pet = await this.petModel.findById(id);
    if (!pet) throw new NotFoundException("Con vật không tồn tại");

    const minPoints = payload.minPoints ?? pet.minPoints;
    const crackPoints = payload.crackPoints ?? pet.crackPoints;
    const maxPoints = payload.maxPoints ?? pet.maxPoints;

    await this.validatePointRange(minPoints, crackPoints, maxPoints, id);

    const updated = await this.petModel
      .findByIdAndUpdate(
        id,
        { $set: { ...payload, updatedAt: new Date() } },
        { new: true },
      )
      .lean();
    return new PetDto(updated);
  }

  async deletePet(id: string): Promise<boolean> {
    const pet = await this.petModel.findById(id);
    if (!pet) throw new NotFoundException("Con vật không tồn tại");

    const count = await this.userPetModel.countDocuments({
      petId: new ObjectId(id),
    });
    if (count > 0) {
      throw new BadRequestException(
        `Có ${count} người dùng đang nuôi con vật này, không thể xóa`,
      );
    }

    await this.petModel.findByIdAndDelete(id);
    return true;
  }

  // ========== USER ==========

  async getTotalPoints(
    userId: string,
  ): Promise<{ totalPointsEarned: number }> {
    const completedStatuses = ["completed", "delivered"];
    const aggregateResult = await this.orderModel.aggregate([
      {
        $match: {
          buyerId: new ObjectId(userId),
          status: { $in: completedStatuses },
        },
      },
      { $group: { _id: null, totalSpent: { $sum: "$total" } } },
    ]);

    const totalSpent =
      aggregateResult.length > 0 ? aggregateResult[0].totalSpent : 0;
    const totalPointsEarned = Math.floor(totalSpent / POINTS_PER_VND);

    return { totalPointsEarned };
  }

  /**
   * Tính stage hiện tại dựa trên tổng điểm và mốc điểm pet
   * 0 = Trứng, 1 = Trứng vỡ, 2 = Nở
   */
  private calculateStage(
    totalPoints: number,
    pet: any,
  ): { currentStage: number; isCompleted: boolean } {
    if (totalPoints >= pet.maxPoints) {
      return { currentStage: 2, isCompleted: true };
    }
    if (totalPoints >= pet.crackPoints) {
      return { currentStage: 1, isCompleted: false };
    }
    return { currentStage: 0, isCompleted: false };
  }

  async getFarm(userId: string): Promise<PetFarmDto> {
    const pointsInfo = await this.getTotalPoints(userId);
    const totalPoints = pointsInfo.totalPointsEarned;

    // Lấy tất cả pet active, sắp theo order
    const allPets = await this.petModel
      .find({ status: "active" })
      .sort({ order: 1 })
      .lean();

    // Lấy userPets hiện có
    const userPets = await this.userPetModel
      .find({ userId: new ObjectId(userId) })
      .lean();
    const userPetMap = new Map(
      userPets.map((up: any) => [up.petId.toString(), up]),
    );

    const items: PetFarmItemDto[] = [];

    for (const pet of allPets) {
      const petId = (pet as any)._id.toString();

      // Chỉ hiển thị pet mà user đã đạt đến minPoints
      if (totalPoints < (pet as any).minPoints) {
        // Vẫn hiển thị pet tiếp theo (chưa mở khóa) để user biết mục tiêu
        items.push(
          new PetFarmItemDto({
            pet: new PetDto(pet),
            userPet: null,
          }),
        );
        break;
      }

      let userPet = userPetMap.get(petId);

      // Tự động tạo userPet nếu chưa có (đã đạt minPoints)
      if (!userPet) {
        const { currentStage, isCompleted } = this.calculateStage(
          totalPoints,
          pet,
        );
        const created = await this.userPetModel.create({
          userId: new ObjectId(userId),
          petId: new ObjectId(petId),
          currentStage,
          isCompleted,
          rewardClaimed: false,
          ...(isCompleted ? { completedAt: new Date() } : {}),
        });
        userPet = created.toObject();
      } else {
        // Cập nhật stage nếu thay đổi
        const { currentStage, isCompleted } = this.calculateStage(
          totalPoints,
          pet,
        );
        if (
          userPet.currentStage !== currentStage
          || userPet.isCompleted !== isCompleted
        ) {
          await this.userPetModel.updateOne(
            { _id: userPet._id },
            {
              $set: {
                currentStage,
                isCompleted,
                ...(isCompleted && !userPet.completedAt
                  ? { completedAt: new Date() }
                  : {}),
              },
            },
          );
          userPet.currentStage = currentStage;
          userPet.isCompleted = isCompleted;
        }
      }

      items.push(
        new PetFarmItemDto({
          userPet: new UserPetDto(userPet),
          pet: new PetDto(pet),
        }),
      );
    }

    return new PetFarmDto({
      items,
      totalPointsEarned: totalPoints,
    });
  }

  async claimReward(
    userId: string,
    userPetId: string,
  ): Promise<{ rewardPoints: number; rewardVnd: number }> {
    const userPet = await this.userPetModel.findOne({
      _id: new ObjectId(userPetId),
      userId: new ObjectId(userId),
    });
    if (!userPet) throw new NotFoundException("Không tìm thấy con vật");
    if (!userPet.isCompleted)
      throw new BadRequestException("Con vật chưa hoàn thành");
    if (userPet.rewardClaimed)
      throw new BadRequestException("Đã nhận thưởng rồi");

    const pet = (await this.petModel.findById(userPet.petId).lean()) as any;
    if (!pet) throw new NotFoundException("Con vật mẫu không tồn tại");

    const rewardPoints = pet.rewardPoints;
    const rewardVnd = rewardPoints * REWARD_POINT_TO_VND;

    try {
      await this.userModel.updateOne(
        { _id: new ObjectId(userId) },
        { $inc: { petBalance: rewardVnd } }
      );
    } catch (err) {
      throw new BadRequestException(
        err?.message || "Không thể cộng thưởng vào ví nuôi thú. Vui lòng thử lại.",
      );
    }

    userPet.rewardClaimed = true;
    await userPet.save();

    return { rewardPoints, rewardVnd };
  }
}
