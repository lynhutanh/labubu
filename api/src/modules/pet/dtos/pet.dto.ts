import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';

export class PetDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose() name: string;
  @Expose() description: string;
  @Expose() backgroundImage: string;
  @Expose() order: number;
  @Expose() minPoints: number;
  @Expose() crackPoints: number;
  @Expose() maxPoints: number;
  @Expose() eggImage: string;
  @Expose() crackImage: string;
  @Expose() hatchImage: string;
  @Expose() rewardPoints: number;
  @Expose() status: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}

export class UserPetDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose() userId: ObjectId;
  @Expose() petId: ObjectId;
  @Expose() currentStage: number;
  @Expose() isCompleted: boolean;
  @Expose() rewardClaimed: boolean;
  @Expose() completedAt: Date;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}

export class PetFarmItemDto {
  @Expose() userPet: UserPetDto;
  @Expose() pet: PetDto;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}

export class PetFarmDto {
  @Expose() items: PetFarmItemDto[];
  @Expose() totalPointsEarned: number;
  @Expose() availableChestPoints?: number;
  @Expose() spentChestPoints?: number;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}

export class PetChestPrizeDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() rewardPoints: number;
  @Expose() rewardVnd: number;
  @Expose() weight: number;
  @Expose() image: string;
  @Expose() active: boolean;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}

export class PetChestConfigDto {
  @Expose() enabled: boolean;
  @Expose() openCostPoints: number;
  @Expose() prizes: PetChestPrizeDto[];

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}
