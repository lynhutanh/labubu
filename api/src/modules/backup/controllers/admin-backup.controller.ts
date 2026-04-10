import {
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Res,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { DataResponse } from "src/kernel";
import { Role } from "src/modules/auth/decorators";
import { RoleGuard } from "src/modules/auth/guards";
import { ROLE } from "src/modules/user/constants";
import { BackupService } from "../backup.service";

@ApiTags("Admin Backup")
@Controller("admin/backup")
export class AdminBackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get("download")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin download full database backup" })
  async downloadBackup(@Res() res: Response): Promise<void> {
    const data = await this.backupService.exportAllData();
    const date = new Date().toISOString().split("T")[0];
    const filename = `backup_${date}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(JSON.stringify(data, null, 2));
  }

  @Post("restore")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Admin restore database from backup file" })
  async restoreBackup(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<DataResponse<any>> {
    const result = await this.backupService.restoreFromData(file.buffer);
    return DataResponse.ok(result);
  }
}
