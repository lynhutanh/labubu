import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { RankService } from '../services/rank.service';
import { Role } from 'src/modules/auth/decorators';
import { RoleGuard } from 'src/modules/auth/guards';
import { ROLE } from 'src/modules/user/constants';

@Controller('admin/ranks')
export class AdminRankController {
    constructor(private readonly rankService: RankService) { }

    @Get()
    @Role(ROLE.ADMIN)
    @UseGuards(RoleGuard)
    @HttpCode(HttpStatus.OK)
    async search() {
        return DataResponse.ok(await this.rankService.search());
    }

    @Post()
    @Role(ROLE.ADMIN)
    @UseGuards(RoleGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() payload: any) {
        return DataResponse.ok(await this.rankService.create(payload));
    }

    @Put(':id')
    @Role(ROLE.ADMIN)
    @UseGuards(RoleGuard)
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() payload: any) {
        return DataResponse.ok(await this.rankService.update(id, payload));
    }

    @Delete(':id')
    @Role(ROLE.ADMIN)
    @UseGuards(RoleGuard)
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string) {
        return DataResponse.ok(await this.rankService.delete(id));
    }
}
