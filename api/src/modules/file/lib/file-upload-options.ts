import { UserDto } from "src/modules/user/dtos";

export interface IFileUploadOptions {
  uploader?: UserDto;
  convertMp4?: boolean;
  fileName?: string;
  destination?: string;
  server?: string;
  uploadImmediately?: boolean;
}
