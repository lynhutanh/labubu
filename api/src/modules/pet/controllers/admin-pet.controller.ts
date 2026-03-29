import {
  Controller, Get, Post, Put, Delete, Body, Param,
  HttpCode, HttpStatus, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataResponse } from 'src/kernel';
import { RoleGuard } from 'src/modules/auth/guards';
import { Role } from 'src/modules/auth/decorators';
import { ROLE } from 'src/modules/user/constants';
import { PetService } from '../services';
import { PetDto } from '../dtos';
import { CreatePetPayload, UpdatePetPayload } from '../payloads';

@ApiTags('Admin Pet')
@Controller('admin/pet')
export class AdminPetController {
  constructor(private readonly petService: PetService) {}

  @Get('user-points/:userId')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getUserPetPoints(@Param('userId') userId: string): Promise<DataResponse<any>> {
    const result = await this.petService.getAdminPetPoints(userId);
    return DataResponse.ok(result);
  }

  @Get()
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getPets(): Promise<DataResponse<PetDto[]>> {
    return DataResponse.ok(await this.petService.getPets());
  }

  @Get(':id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getPetById(@Param('id') id: string): Promise<DataResponse<PetDto | null>> {
    return DataResponse.ok(await this.petService.getPetById(id));
  }

  @Post()
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createPet(@Body() payload: CreatePetPayload): Promise<DataResponse<PetDto>> {
    return DataResponse.ok(await this.petService.createPet(payload));
  }

  @Put(':id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updatePet(@Param('id') id: string, @Body() payload: UpdatePetPayload): Promise<DataResponse<PetDto>> {
    return DataResponse.ok(await this.petService.updatePet(id, payload));
  }

  @Delete(':id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deletePet(@Param('id') id: string): Promise<DataResponse<{ success: boolean }>> {
    return DataResponse.ok({ success: await this.petService.deletePet(id) });
  }
}
