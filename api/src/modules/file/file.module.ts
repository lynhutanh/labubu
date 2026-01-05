import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongoDBModule } from "src/kernel";
import { FileService } from "./services";
import { VideoThumbnailService } from "./services/video-thumbnail.service";
import { FileController } from "./controllers";
import { fileProviders } from "./providers";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [ConfigModule, MongoDBModule, forwardRef(() => AuthModule)],
  controllers: [FileController],
  providers: [...fileProviders, FileService, VideoThumbnailService],
  exports: [...fileProviders, FileService, VideoThumbnailService],
})
export class FileModule {}

