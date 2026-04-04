import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ObjectId } from "mongodb";
import { Model } from "mongoose";
import { ORDER_PROVIDER } from "src/modules/orders/constants";
import { SettingService } from "src/modules/settings/services";
import { USER_MODEL_PROVIDER } from "src/modules/user/providers";
import {
  PetChestConfigDto,
  PetChestPrizeDto,
  PetDto,
  PetFarmDto,
  PetFarmItemDto,
  UserPetDto,
} from "../dtos";
import {
  CreatePetPayload,
  UpdatePetChestConfigPayload,
  UpdatePetPayload,
} from "../payloads";
import { PET_PROVIDER, USER_PET_PROVIDER } from "../providers";

const POINTS_PER_VND = 10000;
const REWARD_POINT_TO_VND = 1000;
const PET_CHEST_CONFIG_KEY = "pet_chest_config";

interface PetChestPrize {
  id: string;
  name: string;
  weight: number;
  image: string;
  active: boolean;
}

interface PetChestConfig {
  enabled: boolean;
  openCostPoints: number;
  prizes: PetChestPrize[];
}

interface PetChestHistoryEntry {
  historyId?: string;
  prizeId: string;
  prizeName: string;
  prizeImage: string;
  openCostPoints: number;
  deliveryStatus?: "pending" | "shipped" | "delivered";
  note?: string;
  openedAt: Date;
  updatedAt?: Date;
}

interface AdminPetChestHistoryItem extends PetChestHistoryEntry {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
}

@Injectable()
export class PetService {
  constructor(
    @Inject(PET_PROVIDER)
    private readonly petModel: Model<any>,
    @Inject(USER_PET_PROVIDER)
    private readonly userPetModel: Model<any>,
    @Inject(ORDER_PROVIDER)
    private readonly orderModel: Model<any>,
    @Inject(USER_MODEL_PROVIDER)
    private readonly userModel: Model<any>,
    private readonly settingService: SettingService,
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

  private validatePointRange(
    minPoints: number,
    crackPoints: number,
    maxPoints: number,
  ) {
    if (minPoints >= crackPoints) {
      throw new BadRequestException("Mốc Trứng vỡ phải lớn hơn mốc bắt đầu");
    }
    if (crackPoints >= maxPoints) {
      throw new BadRequestException("Mốc Nở phải lớn hơn mốc Trứng vỡ");
    }
  }

  async createPet(payload: CreatePetPayload): Promise<PetDto> {
    this.validatePointRange(
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

    this.validatePointRange(minPoints, crackPoints, maxPoints);

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

  async getChestConfig(): Promise<PetChestConfigDto> {
    const rawConfig = await this.settingService.get(PET_CHEST_CONFIG_KEY);
    return this.toChestConfigDto(this.normalizeChestConfig(rawConfig));
  }

  async updateChestConfig(
    payload: UpdatePetChestConfigPayload,
  ): Promise<PetChestConfigDto> {
    const config = this.normalizeChestConfig(payload);
    const activePrizes = config.prizes.filter((p) => p.active);

    if (!activePrizes.length) {
      throw new BadRequestException("Cần ít nhất 1 phần quà đang bật");
    }

    const totalWeight = activePrizes.reduce((sum, p) => sum + p.weight, 0);
    if (totalWeight <= 0) {
      throw new BadRequestException("Tổng tỉ lệ của quà phải lớn hơn 0");
    }

    await this.settingService.set(PET_CHEST_CONFIG_KEY, config, {
      name: "Pet Chest Config",
      description: "Cấu hình rương may mắn trong Pet Farm",
      type: "json",
      public: false,
      visible: true,
      editable: true,
      group: "pet",
    });

    return this.toChestConfigDto(config);
  }

  async searchAdminChestHistory(
    params: {
      keyword?: string;
      deliveryStatus?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    results: AdminPetChestHistoryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, Math.floor(Number(params.page) || 1));
    const limit = Math.min(100, Math.max(1, Math.floor(Number(params.limit) || 20)));
    const keyword = String(params.keyword || "").trim();
    const deliveryStatus = String(params.deliveryStatus || "").trim();

    const matchStage: any = {};
    if (deliveryStatus) {
      matchStage["petChestHistory.deliveryStatus"] = deliveryStatus;
    }
    if (keyword) {
      const regex = new RegExp(keyword, "i");
      matchStage.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { address: regex },
        { "petChestHistory.prizeName": regex },
      ];
    }

    const pipeline: any[] = [
      {
        $match: {
          petChestHistory: { $exists: true, $ne: [] },
        },
      },
      { $unwind: "$petChestHistory" },
    ];

    if (Object.keys(matchStage).length) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      { $sort: { "petChestHistory.openedAt": -1 } },
      {
        $facet: {
          results: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                userId: { $toString: "$_id" },
                userName: { $ifNull: ["$name", ""] },
                userEmail: { $ifNull: ["$email", ""] },
                userPhone: { $ifNull: ["$phone", ""] },
                userAddress: { $ifNull: ["$address", ""] },
                historyId: { $toString: "$petChestHistory._id" },
                prizeId: { $ifNull: ["$petChestHistory.prizeId", ""] },
                prizeName: { $ifNull: ["$petChestHistory.prizeName", ""] },
                prizeImage: { $ifNull: ["$petChestHistory.prizeImage", ""] },
                openCostPoints: { $ifNull: ["$petChestHistory.openCostPoints", 0] },
                deliveryStatus: {
                  $ifNull: ["$petChestHistory.deliveryStatus", "pending"],
                },
                note: { $ifNull: ["$petChestHistory.note", ""] },
                openedAt: {
                  $ifNull: ["$petChestHistory.openedAt", "$createdAt"],
                },
                updatedAt: {
                  $ifNull: ["$petChestHistory.updatedAt", "$petChestHistory.openedAt"],
                },
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    );

    const aggregateResult = await this.userModel.aggregate(pipeline);
    const bucket = aggregateResult?.[0] || {};
    const results = Array.isArray(bucket.results) ? bucket.results : [];
    const total = Array.isArray(bucket.total) && bucket.total[0]?.count
      ? Number(bucket.total[0].count)
      : 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      results,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async updateAdminChestHistoryDeliveryStatus(
    userId: string,
    historyId: string,
    payload: {
      deliveryStatus: "pending" | "shipped" | "delivered";
      note?: string;
    },
  ): Promise<AdminPetChestHistoryItem> {
    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException("UserId khong hop le");
    }

    const allowedStatuses = ["pending", "shipped", "delivered"];
    if (!allowedStatuses.includes(payload.deliveryStatus)) {
      throw new BadRequestException("Trang thai giao qua khong hop le");
    }

    const user = await this.userModel
      .findById(userId)
      .select("_id name email phone address petChestHistory")
      .lean();

    if (!user) {
      throw new NotFoundException("Khong tim thay nguoi dung");
    }

    const history = Array.isArray((user as any).petChestHistory)
      ? (user as any).petChestHistory
      : [];
    const selected = history.find((entry: any) => String(entry?._id) === String(historyId));

    if (!selected) {
      throw new NotFoundException("Khong tim thay luot trung thuong");
    }

    const updatedAt = new Date();

    await this.userModel.updateOne(
      { _id: new ObjectId(userId), "petChestHistory._id": selected._id },
      {
        $set: {
          "petChestHistory.$.deliveryStatus": payload.deliveryStatus,
          "petChestHistory.$.note": String(payload.note || "").trim(),
          "petChestHistory.$.updatedAt": updatedAt,
        },
      },
    );

    return {
      userId: String((user as any)._id),
      userName: String((user as any).name || ""),
      userEmail: String((user as any).email || ""),
      userPhone: String((user as any).phone || ""),
      userAddress: String((user as any).address || ""),
      historyId: String(selected._id),
      prizeId: String(selected?.prizeId || ""),
      prizeName: String(selected?.prizeName || ""),
      prizeImage: String(selected?.prizeImage || ""),
      openCostPoints: Math.max(0, Number(selected?.openCostPoints || 0)),
      deliveryStatus: payload.deliveryStatus,
      note: String(payload.note || "").trim(),
      openedAt: selected?.openedAt ? new Date(selected.openedAt) : new Date(),
      updatedAt,
    };
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
    const orderPoints = Math.floor(totalSpent / POINTS_PER_VND);

    const user = await this.userModel.findById(userId).lean();
    const bonusPetPoints = (user as any)?.bonusPetPoints || 0;
    const totalPointsEarned = orderPoints + bonusPetPoints;

    return { totalPointsEarned };
  }

  async getAdminPetPoints(
    userId: string,
  ): Promise<{
    totalPoints: number;
    orderPoints: number;
    bonusPetPoints: number;
    spentPoints: number;
    availablePoints: number;
  }> {
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
    const orderPoints = Math.floor(totalSpent / POINTS_PER_VND);

    const user = await this.userModel.findById(userId).lean();
    const bonusPetPoints = (user as any)?.bonusPetPoints || 0;
    const totalPoints = orderPoints + bonusPetPoints;
    const spentPoints = Math.max(0, Number((user as any)?.petChestPointsSpent || 0));
    const availablePoints = Math.max(0, totalPoints - spentPoints);

    return { totalPoints, orderPoints, bonusPetPoints, spentPoints, availablePoints };
  }

  async getChestConfigForUser(userId: string): Promise<any> {
    const config = await this.getChestConfig();
    const pointsInfo = await this.getTotalPoints(userId);
    const chestStats = await this.getUserChestPointStats(
      userId,
      pointsInfo.totalPointsEarned,
    );

    return {
      ...config,
      totalPointsEarned: pointsInfo.totalPointsEarned,
      spentChestPoints: chestStats.spentPoints,
      availableChestPoints: chestStats.availablePoints,
    };
  }

  async openChest(userId: string): Promise<any> {
    const rawConfig = await this.settingService.get(PET_CHEST_CONFIG_KEY);
    const config = this.normalizeChestConfig(rawConfig);

    if (!config.enabled) {
      throw new BadRequestException("Rương may mắn hiện đang tạm khóa");
    }

    const activePrizes = config.prizes.filter((p) => p.active && p.weight > 0);
    if (!activePrizes.length) {
      throw new BadRequestException("Rương chưa có quà hợp lệ để mở");
    }

    const pointsInfo = await this.getTotalPoints(userId);
    const totalPoints = pointsInfo.totalPointsEarned;
    const user = await this.userModel
      .findById(userId)
      .select("_id petChestPointsSpent")
      .lean();

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    const spentBefore = Math.max(
      0,
      Number((user as any).petChestPointsSpent || 0),
    );
    const availableBefore = Math.max(0, totalPoints - spentBefore);
    if (availableBefore < config.openCostPoints) {
      throw new BadRequestException(
        `Bạn cần ${config.openCostPoints} điểm để mở rương, hiện có ${availableBefore} điểm`,
      );
    }

    const selectedPrize = this.pickWeightedPrize(activePrizes);
    const historyEntry: PetChestHistoryEntry = {
      prizeId: selectedPrize.id,
      prizeName: selectedPrize.name,
      prizeImage: selectedPrize.image || "",
      openCostPoints: config.openCostPoints,
      deliveryStatus: "pending",
      note: "",
      openedAt: new Date(),
      updatedAt: new Date(),
    };

    const updateResult = await this.userModel.updateOne(
      {
        _id: new ObjectId(userId),
        $or: [
          { petChestPointsSpent: spentBefore },
          { petChestPointsSpent: { $exists: false } },
        ],
      },
      {
        $inc: {
          petChestPointsSpent: config.openCostPoints,
        },
        $push: {
          petChestHistory: {
            $each: [historyEntry],
            $position: 0,
            $slice: 200,
          },
        },
      },
    );

    if (!updateResult.modifiedCount) {
      throw new BadRequestException(
        "Điểm mở rương vừa thay đổi, vui lòng thử lại",
      );
    }

    const spentAfter = spentBefore + config.openCostPoints;
    const remaining = Math.max(0, totalPoints - spentAfter);

    return {
      openCostPoints: config.openCostPoints,
      totalPointsEarned: totalPoints,
      spentChestPoints: spentAfter,
      remainingChestPoints: remaining,
      prize: {
        id: selectedPrize.id,
        name: selectedPrize.name,
        image: selectedPrize.image,
      },
    };
  }

  async getChestHistory(
    userId: string,
    page = 1,
    limit = 5,
  ): Promise<{
    items: PetChestHistoryEntry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const normalizedPage = Math.max(1, Math.floor(Number(page) || 1));
    const normalizedLimit = Math.min(50, Math.max(1, Math.floor(Number(limit) || 5)));

    const user = await this.userModel
      .findById(userId)
      .select("_id petChestHistory")
      .lean();

    if (!user) {
      throw new NotFoundException("KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng");
    }

    const history = Array.isArray((user as any).petChestHistory)
      ? (user as any).petChestHistory
      : [];

    const total = history.length;
    const totalPages = Math.max(1, Math.ceil(total / normalizedLimit));
    const safePage = Math.min(normalizedPage, totalPages);
    const start = (safePage - 1) * normalizedLimit;
    const end = start + normalizedLimit;

    const items = history.slice(start, end).map((entry: any) => ({
      historyId: String(entry?._id || ""),
      prizeId: String(entry?.prizeId || ""),
      prizeName: String(entry?.prizeName || ""),
      prizeImage: String(entry?.prizeImage || ""),
      openCostPoints: Math.max(0, Number(entry?.openCostPoints || 0)),
      deliveryStatus: String(entry?.deliveryStatus || "pending"),
      note: String(entry?.note || ""),
      openedAt: entry?.openedAt ? new Date(entry.openedAt) : new Date(),
      updatedAt: entry?.updatedAt ? new Date(entry.updatedAt) : undefined,
    }));

    return {
      items,
      total,
      page: safePage,
      limit: normalizedLimit,
      totalPages,
    };
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
    const chestStats = await this.getUserChestPointStats(userId, totalPoints);

    const allPets = await this.petModel
      .find({ status: "active" })
      .sort({ order: 1 })
      .lean();

    const userPets = await this.userPetModel
      .find({ userId: new ObjectId(userId) })
      .lean();
    const userPetMap = new Map(
      userPets.map((up: any) => [up.petId.toString(), up]),
    );

    const items: PetFarmItemDto[] = [];
    let hasLockedPet = false;

    for (const pet of allPets) {
      const petId = (pet as any)._id.toString();

      if (totalPoints < (pet as any).minPoints) {
        if (!hasLockedPet) {
          items.push(
            new PetFarmItemDto({
              pet: new PetDto(pet),
              userPet: null,
            }),
          );
          hasLockedPet = true;
        }
        continue;
      }

      let userPet = userPetMap.get(petId);

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
        const { currentStage, isCompleted } = this.calculateStage(
          totalPoints,
          pet,
        );
        if (
          userPet.currentStage !== currentStage ||
          userPet.isCompleted !== isCompleted
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
      spentChestPoints: chestStats.spentPoints,
      availableChestPoints: chestStats.availablePoints,
    });
  }

  async claimReward(
    userId: string,
    userPetId: string,
  ): Promise<{
    rewardPoints: number;
    rewardVnd: number;
    totalPointsEarned: number;
    spentChestPoints: number;
    availableChestPoints: number;
  }> {
    const userPet = await this.userPetModel.findOne({
      _id: new ObjectId(userPetId),
      userId: new ObjectId(userId),
    });
    if (!userPet) throw new NotFoundException("Không tìm thấy con vật");
    if (!userPet.isCompleted) {
      throw new BadRequestException("Con vật chưa hoàn thành");
    }
    if (userPet.rewardClaimed) {
      throw new BadRequestException("Đã nhận thưởng rồi");
    }

    const pet = (await this.petModel.findById(userPet.petId).lean()) as any;
    if (!pet) throw new NotFoundException("Con vật mẫu không tồn tại");

    const rewardPoints = pet.rewardPoints;
    const rewardVnd = rewardPoints * REWARD_POINT_TO_VND;
    const pointsInfo = await this.getTotalPoints(userId);
    const totalPoints = pointsInfo.totalPointsEarned;
    const user = await this.userModel
      .findById(userId)
      .select("_id petChestPointsSpent")
      .lean();

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    const spentBefore = Math.max(
      0,
      Number((user as any).petChestPointsSpent || 0),
    );
    const availableBefore = Math.max(0, totalPoints - spentBefore);

    if (availableBefore < rewardPoints) {
      throw new BadRequestException(
        `Bạn cần ${rewardPoints} điểm để đổi thưởng, hiện có ${availableBefore} điểm`,
      );
    }

    const updateResult = await this.userModel.updateOne(
      {
        _id: new ObjectId(userId),
        $or: [
          { petChestPointsSpent: spentBefore },
          { petChestPointsSpent: { $exists: false } },
        ],
      },
      {
        $inc: {
          petBalance: rewardVnd,
          petChestPointsSpent: rewardPoints,
        },
      },
    );

    if (!updateResult.modifiedCount) {
      throw new BadRequestException(
        "Điểm đổi thưởng vừa thay đổi, vui lòng thử lại",
      );
    }

    userPet.rewardClaimed = true;
    await userPet.save();

    const spentAfter = spentBefore + rewardPoints;

    return {
      rewardPoints,
      rewardVnd,
      totalPointsEarned: totalPoints,
      spentChestPoints: spentAfter,
      availableChestPoints: Math.max(0, totalPoints - spentAfter),
    };
  }

  async getLeaderboard(limit = 8): Promise<any[]> {
    const completedStatuses = ["completed", "delivered"];

    const orderAgg = await this.orderModel.aggregate([
      { $match: { status: { $in: completedStatuses } } },
      { $group: { _id: "$buyerId", totalSpent: { $sum: "$total" } } },
    ]);

    const orderPointsMap = new Map<string, number>();
    for (const row of orderAgg) {
      orderPointsMap.set(
        row._id.toString(),
        Math.floor(row.totalSpent / POINTS_PER_VND),
      );
    }

    const orderUserIds = orderAgg.map((r) => r._id);
    const bonusUsers = await this.userModel
      .find({ bonusPetPoints: { $gt: 0 } })
      .select("_id")
      .lean();
    const bonusUserIds = bonusUsers.map((u: any) => u._id);

    const allUserIdSet = new Set<string>([
      ...orderUserIds.map((id: any) => id.toString()),
      ...bonusUserIds.map((id: any) => id.toString()),
    ]);

    if (!allUserIdSet.size) return [];

    const users = await this.userModel
      .find({ _id: { $in: [...allUserIdSet] } })
      .select("_id name email avatarUrl bonusPetPoints")
      .lean();

    const ranked = users.map((u: any) => {
      const uid = u._id.toString();
      const pts = (orderPointsMap.get(uid) || 0) + (u.bonusPetPoints || 0);
      return {
        userId: uid,
        name: u.name || u.email,
        avatarUrl: u.avatarUrl || null,
        totalPoints: pts,
      };
    });

    ranked.sort((a, b) => b.totalPoints - a.totalPoints);
    const top = ranked.slice(0, limit);

    const allPets = await this.petModel
      .find({ status: "active" })
      .sort({ maxPoints: -1 })
      .lean();

    const result: any[] = [];
    for (const user of top) {
      const userPets = await this.userPetModel
        .find({ userId: user.userId, isCompleted: true })
        .lean();

      let bestPet: any = null;
      if (userPets.length) {
        let bestMaxPoints = -1;
        for (const up of userPets) {
          const pet = allPets.find(
            (p: any) => p._id.toString() === up.petId.toString(),
          );
          if (pet && (pet as any).maxPoints > bestMaxPoints) {
            bestMaxPoints = (pet as any).maxPoints;
            bestPet = pet;
          }
        }
      }

      result.push({
        ...user,
        pet: bestPet
          ? {
              _id: bestPet._id,
              name: bestPet.name,
              hatchImage: bestPet.hatchImage,
            }
          : null,
      });
    }

    return result;
  }

  private normalizeChestConfig(raw: any): PetChestConfig {
    const source = raw && typeof raw === "object" ? raw : {};
    const sourcePrizes = Array.isArray(source.prizes) ? source.prizes : [];

    const prizes = sourcePrizes
      .map((prize: any, index: number) => this.normalizeChestPrize(prize, index))
      .filter((p) => p.name && p.weight > 0);

    const openCostPoints = Math.max(
      1,
      Math.floor(Number(source.openCostPoints) || 10),
    );

    return {
      enabled: source.enabled !== false,
      openCostPoints,
      prizes,
    };
  }

  private normalizeChestPrize(prize: any, index: number): PetChestPrize {
    return {
      id: String(prize?.id || `prize_${Date.now()}_${index}`),
      name: String(prize?.name || "").trim(),
      weight: Math.max(0, Number(prize?.weight) || 0),
      image: String(prize?.image || ""),
      active: prize?.active !== false,
    };
  }

  private toChestConfigDto(config: PetChestConfig): PetChestConfigDto {
    return new PetChestConfigDto({
      enabled: config.enabled,
      openCostPoints: config.openCostPoints,
      prizes: config.prizes.map(
        (p) =>
          new PetChestPrizeDto(p),
      ),
    });
  }

  private pickWeightedPrize(prizes: PetChestPrize[]): PetChestPrize {
    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    if (totalWeight <= 0) {
      throw new BadRequestException("Tổng tỉ lệ quà không hợp lệ");
    }

    const randomWeight = Math.random() * totalWeight;
    let cumulative = 0;
    for (const prize of prizes) {
      cumulative += prize.weight;
      if (randomWeight <= cumulative) {
        return prize;
      }
    }

    return prizes[prizes.length - 1];
  }

  private async getUserChestPointStats(
    userId: string,
    totalPointsEarned?: number,
  ): Promise<{ spentPoints: number; availablePoints: number }> {
    const user = await this.userModel
      .findById(userId)
      .select("_id petChestPointsSpent")
      .lean();

    const spentPoints = Math.max(0, Number((user as any)?.petChestPointsSpent || 0));
    const totalPoints =
      totalPointsEarned !== undefined
        ? totalPointsEarned
        : (await this.getTotalPoints(userId)).totalPointsEarned;

    return {
      spentPoints,
      availablePoints: Math.max(0, totalPoints - spentPoints),
    };
  }
}
