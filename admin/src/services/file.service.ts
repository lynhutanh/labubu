import { APIRequest } from './api-request';
import { FileUploadResponse } from '../interfaces';

class FileService extends APIRequest {
  public async uploadCategoryImage(file: File): Promise<FileUploadResponse> {
    try {
      const response = await this.upload(
        '/file/upload/category',
        [{ file, fieldname: 'file' }],
        { onProgress: () => {} }
      );

      if ((response as any).data) {
        return (response as any).data;
      } else {
        throw new Error((response as any).message || 'Upload failed');
      }
    } catch {
      throw new Error('Không thể tải ảnh danh mục lên. Vui lòng thử lại.');
    }
  }

  public async uploadProductImage(file: File): Promise<FileUploadResponse> {
    try {
      const response = await this.upload(
        '/file/upload/product',
        [{ file, fieldname: 'file' }],
        { onProgress: () => {} }
      );

      if ((response as any).data) {
        return (response as any).data;
      } else {
        throw new Error((response as any).message || 'Upload failed');
      }
    } catch {
      throw new Error('Không thể tải ảnh sản phẩm lên. Vui lòng thử lại.');
    }
  }

  public async uploadProductMedia(file: File): Promise<FileUploadResponse> {
    try {
      const response = await this.upload(
        '/file/upload/product',
        [{ file, fieldname: 'file' }],
        { onProgress: () => {} }
      );

      if ((response as any).data) {
        return (response as any).data;
      } else {
        throw new Error((response as any).message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload product media error:', error);
      const message = error?.message || error?.error || 'Không thể tải media sản phẩm lên. Vui lòng thử lại.';
      throw new Error(message);
    }
  }

  public async uploadBrandLogo(file: File): Promise<FileUploadResponse> {
    try {
      const response = await this.upload(
        '/file/upload/brand',
        [{ file, fieldname: 'file' }],
        { onProgress: () => {} }
      );

      if ((response as any).data) {
        return (response as any).data;
      } else {
        throw new Error((response as any).message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload brand logo error:', error);
      const message = error?.message || error?.error || 'Không thể tải logo thương hiệu lên. Vui lòng thử lại.';
      throw new Error(message);
    }
  }

  public async uploadAvatar(file: File): Promise<FileUploadResponse> {
    try {
      const response = await this.upload(
        '/file/upload/avatar',
        [{ file, fieldname: 'file' }],
        { onProgress: () => {} }
      );

      if ((response as any).data) {
        return (response as any).data;
      } else {
        throw new Error((response as any).message || 'Upload failed');
      }
    } catch {
      throw new Error('Không thể tải ảnh đại diện lên. Vui lòng thử lại.');
    }
  }
}

export const fileService = new FileService();
