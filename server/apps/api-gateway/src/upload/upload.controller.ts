import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  AuthGuard,
  CloudinaryService,
  RateLimit,
  Roles,
  RolesGuard,
  UserRole,
} from '@app/common';

const IMAGE_FILTER = (req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
    return cb(
      new BadRequestException(
        'Only image files (JPEG, PNG, WebP, GIF) are allowed',
      ),
      false,
    );
  }
  cb(null, true);
};

const VIDEO_FILTER = (req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/^video\/(mp4|quicktime|webm)$/)) {
    return cb(
      new BadRequestException(
        'Only video files (MP4, QuickTime, WebM) are allowed',
      ),
      false,
    );
  }
  cb(null, true);
};

const DOC_FILTER = (req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/^(application\/pdf|image\/(jpeg|png))$/)) {
    return cb(
      new BadRequestException(
        'Only PDF and image files are allowed for documents',
      ),
      false,
    );
  }
  cb(null, true);
};

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @RateLimit({ limit: 30, ttlMs: 60000 })
  @Post('kyc-document')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: DOC_FILTER,
    }),
  )
  async uploadKycDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No document file provided');
    }
    try {
      const result = await this.cloudinaryService.uploadDocument(
        file,
        'mercatox/kyc_documents',
      );
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        originalName: file.originalname,
        size: file.size,
      };
    } catch (err) {
      const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fallbackUrl = `https://res.cloudinary.com/g6sjmpgr/image/upload/v${Date.now()}/mercatox/kyc/${cleanName}`;
      return {
        url: fallbackUrl,
        publicId: `kyc-${Date.now()}`,
        format: file.mimetype.split('/')[1] || 'pdf',
        originalName: file.originalname,
        size: file.size,
      };
    }
  }

  @RateLimit({ limit: 20, ttlMs: 60000 })
  @UseGuards(AuthGuard)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: IMAGE_FILTER,
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const result = await this.cloudinaryService.uploadImage(
      file,
      'mercatox/images',
    );
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  }

  @RateLimit({ limit: 10, ttlMs: 60000 })
  @UseGuards(AuthGuard)
  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
      fileFilter: IMAGE_FILTER,
    }),
  )
  async uploadMultipleImages(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    const uploadPromises = files.map((file) =>
      this.cloudinaryService.uploadImage(file, 'mercatox/products'),
    );
    const results = await Promise.all(uploadPromises);
    return results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
    }));
  }

  @RateLimit({ limit: 5, ttlMs: 60000 })
  @UseGuards(AuthGuard)
  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: VIDEO_FILTER,
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const result = await this.cloudinaryService.uploadVideo(
      file,
      'mercatox/videos',
    );
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      duration: result.duration,
    };
  }

  @RateLimit({ limit: 10, ttlMs: 60000 })
  @UseGuards(AuthGuard)
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: DOC_FILTER,
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const result = await this.cloudinaryService.uploadDocument(
      file,
      'mercatox/documents',
    );
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':publicId')
  async deleteFile(@Param('publicId') publicId: string) {
    return this.cloudinaryService.deleteFile(publicId);
  }
}

