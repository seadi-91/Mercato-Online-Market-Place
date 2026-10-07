import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'mercatox/general',
    resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto',
  ): Promise<UploadApiResponse> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided for upload');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'mercatox/images',
  ): Promise<UploadApiResponse> {
    return this.uploadFile(file, folder, 'image');
  }

  async uploadVideo(
    file: Express.Multer.File,
    folder: string = 'mercatox/videos',
  ): Promise<UploadApiResponse> {
    return this.uploadFile(file, folder, 'video');
  }

  async uploadDocument(
    file: Express.Multer.File,
    folder: string = 'mercatox/documents',
  ): Promise<UploadApiResponse> {
    return this.uploadFile(file, folder, 'auto');
  }

  async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }
}
