import { Injectable, BadRequestException } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { FILE_MODEL_PROVIDER } from "../providers/file.provider";
import { FileModel } from "../models/file.model";
import { FileDto } from "../dtos/file.dto";
import { getConfig } from "../../../kernel";
import { Express } from "express";
import { VideoThumbnailService } from "./video-thumbnail.service";
import { logData, logError, logWarn } from "../../../lib/utils";

@Injectable()
export class FileService {
  constructor(
    @Inject(FILE_MODEL_PROVIDER) private readonly fileModel: Model<FileModel>,
    private readonly videoThumbnailService: VideoThumbnailService,
  ) {}

  async createFromUpload(
    type: string,
    file: Express.Multer.File,
    uploader?: any,
  ): Promise<FileDto> {
    try {
      const { publicDir, publicPath } = getConfig("file")();

      let relativePath = file.path.replace(/\\/g, "/");
      const normalizedPublicDir = publicDir.replace(/\\/g, "/");

      if (relativePath.includes(normalizedPublicDir)) {
        const publicDirIndex = relativePath.indexOf(normalizedPublicDir);
        const pathAfterPublic = relativePath.substring(
          publicDirIndex + normalizedPublicDir.length,
        );
        relativePath = `${publicPath}${pathAfterPublic.startsWith("/") ? pathAfterPublic : `/${pathAfterPublic}`}`;
      } else if (!relativePath.startsWith("/public")) {
        relativePath = `/public${relativePath.startsWith("/") ? relativePath : `/${relativePath}`}`;
      }

      const typeMap: Record<string, string> = {
        avatar: "avatar-image",
        product: "product-image",
        cover: "cover-image",
        gallery: "gallery-image",
        video: "video-file",
      };

      let thumbnailPath = "";
      let thumbnailAbsolutePath = "";
      const isVideo = file.mimetype?.startsWith("video/");

      if (isVideo) {
        try {
          thumbnailAbsolutePath =
            await this.videoThumbnailService.generateThumbnail(file.path);
          thumbnailPath = this.videoThumbnailService.getThumbnailRelativePath(
            thumbnailAbsolutePath,
          );
          logData(`Thumbnail created for video: ${thumbnailPath}`);
        } catch (error) {
          logWarn(
            `Failed to generate thumbnail for video ${file.originalname}: ${(error as Error).message}`,
          );
        }
      }

      const fileData = {
        name: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        type: typeMap[type] || "other",
        path: relativePath,
        absolutePath: file.path,
        publicUrl: relativePath,
        server: "diskStorage",
        size: file.size,
        thumbnailPath: thumbnailPath,
        thumbnailAbsolutePath: thumbnailAbsolutePath,
        uploadedBy: uploader?._id || uploader?.id,
        status: "completed",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdFile = await this.fileModel.create(fileData);
      return new FileDto(createdFile);
    } catch (error) {
      logError("FileService.createFromUpload", error);
      throw new BadRequestException(
        `Failed to create file record: ${(error as Error).message}`,
      );
    }
  }

  async getById(id: string): Promise<FileDto | null> {
    try {
      const file = await this.fileModel.findById(id);
      return file ? new FileDto(file) : null;
    } catch (error) {
      logError("FileService.getById", error);
      return null;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const file = await this.fileModel.findByIdAndDelete(id);
      if (file) {
        return true;
      }
      return false;
    } catch (error) {
      logError("FileService.deleteById", error);
      return false;
    }
  }

  async createFromMulter(
    type: string,
    file: Express.Multer.File,
    options?: any,
  ): Promise<FileDto> {
    try {
      const { publicDir, publicPath } = getConfig("file")();

      let relativePath = file.path.replace(/\\/g, "/");
      const normalizedPublicDir = publicDir.replace(/\\/g, "/");

      if (relativePath.includes(normalizedPublicDir)) {
        const publicDirIndex = relativePath.indexOf(normalizedPublicDir);
        const pathAfterPublic = relativePath.substring(
          publicDirIndex + normalizedPublicDir.length,
        );
        relativePath = `${publicPath}${pathAfterPublic.startsWith("/") ? pathAfterPublic : `/${pathAfterPublic}`}`;
      } else if (!relativePath.startsWith("/public")) {
        relativePath = `/public${relativePath.startsWith("/") ? relativePath : `/${relativePath}`}`;
      }

      const typeMap: Record<string, string> = {
        avatar: "avatar-image",
        product: "product-image",
        cover: "cover-image",
        gallery: "gallery-image",
        video: "video-file",
      };

      let thumbnailPath = "";
      let thumbnailAbsolutePath = "";
      const isVideo = file.mimetype?.startsWith("video/");

      if (isVideo) {
        try {
          thumbnailAbsolutePath =
            await this.videoThumbnailService.generateThumbnail(file.path);
          thumbnailPath = this.videoThumbnailService.getThumbnailRelativePath(
            thumbnailAbsolutePath,
          );
          logData(`Thumbnail created for video: ${thumbnailPath}`);
        } catch (error) {
          logWarn(
            `Failed to generate thumbnail for video ${file.originalname}: ${(error as Error).message}`,
          );
        }
      }

      const fileData = {
        name: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        type: typeMap[type] || "other",
        path: relativePath,
        absolutePath: file.path,
        publicUrl: relativePath,
        server: "diskStorage",
        size: file.size,
        thumbnailPath: thumbnailPath,
        thumbnailAbsolutePath: thumbnailAbsolutePath,
        uploadedBy: options?.uploadedBy || options?._id || options?.id,
        status: "completed",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdFile = await this.fileModel.create(fileData);
      return new FileDto(createdFile);
    } catch (error) {
      logError("FileService.createFromMulter", error);
      throw new BadRequestException(
        `Failed to create file record: ${(error as Error).message}`,
      );
    }
  }

  async findByIdAsFileDto(id: string): Promise<FileDto | null> {
    try {
      const file = await this.fileModel.findById(id);
      return file ? new FileDto(file) : null;
    } catch (error) {
      logError("FileService.findByIdAsFileDto", error);
      return null;
    }
  }

  async findByIds(ids: string[]): Promise<FileDto[]> {
    try {
      const files = await this.fileModel.find({ _id: { $in: ids } });
      return files.map((f) => new FileDto(f));
    } catch (error) {
      logError("FileService.findByIds", error);
      return [];
    }
  }

  async findByPath(path: string): Promise<FileDto[]> {
    try {
      const files = await this.fileModel.find({ path: path });
      return files.map((f) => new FileDto(f));
    } catch (error) {
      logError("FileService.findByPath", error);
      return [];
    }
  }

  async deleteFile(id: string): Promise<boolean> {
    try {
      const file = await this.fileModel.findByIdAndDelete(id);
      if (file) {
        return true;
      }
      return false;
    } catch (error) {
      logError("FileService.deleteFile", error);
      return false;
    }
  }

  async createMultipleFromMulter(
    type: string,
    files: Express.Multer.File[],
    options?: any,
  ): Promise<any> {
    try {
      const { publicDir, publicPath } = getConfig("file")();
      const typeMap: Record<string, string> = {
        avatar: "avatar-image",
        product: "product-image",
        cover: "cover-image",
        gallery: "gallery-image",
        video: "video-file",
      };

      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          let relativePath = file.path.replace(/\\/g, "/");
          const normalizedPublicDir = publicDir.replace(/\\/g, "/");

          if (relativePath.includes(normalizedPublicDir)) {
            const publicDirIndex = relativePath.indexOf(normalizedPublicDir);
            const pathAfterPublic = relativePath.substring(
              publicDirIndex + normalizedPublicDir.length,
            );
            relativePath = `${publicPath}${pathAfterPublic.startsWith("/") ? pathAfterPublic : `/${pathAfterPublic}`}`;
          } else if (!relativePath.startsWith("/public")) {
            relativePath = `/public${relativePath.startsWith("/") ? relativePath : `/${relativePath}`}`;
          }

          let thumbnailPath = "";
          let thumbnailAbsolutePath = "";
          const isVideo = file.mimetype?.startsWith("video/");

          if (isVideo) {
            try {
              thumbnailAbsolutePath =
                await this.videoThumbnailService.generateThumbnail(file.path);
              thumbnailPath =
                this.videoThumbnailService.getThumbnailRelativePath(
                  thumbnailAbsolutePath,
                );
              logData(`Thumbnail created for video: ${thumbnailPath}`);
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              logWarn(
                `Failed to generate thumbnail for video ${file.originalname}: ${errorMessage}`,
              );
            }
          }

          const fileData = {
            name: file.originalname,
            fileName: file.filename,
            mimeType: file.mimetype,
            type: typeMap[type] || "other",
            path: relativePath,
            absolutePath: file.path,
            publicUrl: relativePath,
            server: "diskStorage",
            size: file.size,
            thumbnailPath: thumbnailPath,
            thumbnailAbsolutePath: thumbnailAbsolutePath,
            uploadedBy: options?.uploadedBy || options?._id || options?.id,
            status: "completed",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const createdFile = await this.fileModel.create(fileData);
          return new FileDto(createdFile);
        }),
      );

      return {
        success: true,
        files: uploadedFiles,
        totalFiles: uploadedFiles.length,
      };
    } catch (error) {
      logError("FileService.createMultipleFromMulter", error);
      throw new BadRequestException(
        `Failed to upload multiple files: ${(error as Error).message}`,
      );
    }
  }
}
