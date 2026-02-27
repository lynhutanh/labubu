import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { RankService } from '../services/rank.service';

@Controller('ranks')
export class RankController {
    constructor(private readonly rankService: RankService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async search() {
        return DataResponse.ok(await this.rankService.search());
    }
}
