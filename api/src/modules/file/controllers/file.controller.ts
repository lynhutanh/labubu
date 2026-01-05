import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { Request } from "express";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { AuthGuard } from "src/modules/auth/guards";
import { CurrentUser } from "src/modules/auth/decorators";
import { FileService } from "../services/file.service";
import { UploadFileInterceptor } from "../interceptors";
import { getConfig } from "src/kernel";

@ApiTags("File")
@Controller("file")
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post("upload")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Upload single file" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        type: {
          type: "string",
          enum: ["avatar", "product", "category", "image", "media"],
        },
      },
    },
  })
  @UseInterceptors(
    UploadFileInterceptor({
      destination: getConfig("file")().uploadsDir,
      fieldName: "file",
    }),
  )
  async uploadFile(
    @Req() req: Request,
    @CurrentUser() user: any,
    @Query("type") type?: string,
  ): Promise<DataResponse<any>> {
    if (!req.file) {
      throw new BadRequestException("No file uploaded");
    }

    const fileDto = await this.fileService.createFromMulter(
      type || "image",
      req.file,
      { uploadedBy: user._id },
    );

    return DataResponse.ok(fileDto.toPublicResponse());
  }

  @Post("upload/product")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Upload product image" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    UploadFileInterceptor({
      destination: getConfig("file")().productImageDir,
      fieldName: "file",
    }),
  )
  async uploadProductImage(
    @Req() req: Request,
    @CurrentUser() user: any,
  ): Promise<DataResponse<any>> {
    if (!req.file) {
      throw new BadRequestException("No file uploaded");
    }

    const fileDto = await this.fileService.createFromMulter(
      "product",
      req.file,
      {
        uploadedBy: user._id,
      },
    );

    return DataResponse.ok(fileDto.toPublicResponse());
  }

  @Post("upload/avatar")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Upload avatar image" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    UploadFileInterceptor({
      destination: getConfig("file")().avatarDir,
      fieldName: "file",
    }),
  )
  async uploadAvatar(
    @Req() req: Request,
    @CurrentUser() user: any,
  ): Promise<DataResponse<any>> {
    if (!req.file) {
      throw new BadRequestException("No file uploaded");
    }

    const fileDto = await this.fileService.createFromMulter(
      "avatar",
      req.file,
      {
        uploadedBy: user._id,
      },
    );

    return DataResponse.ok(fileDto.toPublicResponse());
  }

  @Post("upload/category")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Upload category image" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    UploadFileInterceptor({
      destination: getConfig("file")().categoryDir,
      fieldName: "file",
    }),
  )
  async uploadCategoryImage(
    @Req() req: Request,
    @CurrentUser() user: any,
  ): Promise<DataResponse<any>> {
    if (!req.file) {
      throw new BadRequestException("No file uploaded");
    }

    const fileDto = await this.fileService.createFromMulter(
      "category",
      req.file,
      {
        uploadedBy: user._id,
      },
    );

    return DataResponse.ok(fileDto.toPublicResponse());
  }

  @Post("upload/brand")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Upload brand logo" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    UploadFileInterceptor({
      destination: getConfig("file")().brandDir,
      fieldName: "file",
    }),
  )
  async uploadBrandLogo(
    @Req() req: Request,
    @CurrentUser() user: any,
  ): Promise<DataResponse<any>> {
    if (!req.file) {
      throw new BadRequestException("No file uploaded");
    }

    const fileDto = await this.fileService.createFromMulter("brand", req.file, {
      uploadedBy: user._id,
    });

    return DataResponse.ok(fileDto.toPublicResponse());
  }

  @Get(":id/info")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get file information" })
  async getFileInfo(@Param("id") id: string): Promise<DataResponse<any>> {
    const fileDto = await this.fileService.findByIdAsFileDto(id);

    if (!fileDto) {
      throw new NotFoundException(`File not found with ID: ${id}`);
    }

    return DataResponse.ok(fileDto.toPublicResponse());
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete file" })
  async deleteFile(
    @Param("id") id: string,
  ): Promise<DataResponse<{ success: boolean }>> {
    const success = await this.fileService.deleteFile(id);
    return DataResponse.ok({ success });
  }
}
