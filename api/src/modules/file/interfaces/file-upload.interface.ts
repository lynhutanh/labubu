export interface IFileUpload {
  fromFile?: string;
  basePath?: string;
  fileName?: string;
  key: string;
  filePath?: string;
  body?: Buffer | any;
  contentType?: string;
  rename?: boolean;
  deleteOriginalFile?: boolean;
  engine?: "diskStorage";
}

export interface IFileUploadResponse {
  success: boolean;
  data?: any;
  error?: string;
  _id?: string;
  fileName?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  absolutePath?: string;
  metadata?: any;
  uploadTime?: number;
}
