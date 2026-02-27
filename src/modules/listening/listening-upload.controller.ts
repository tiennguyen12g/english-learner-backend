import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { handleRequest } from '../../global/handleRequest';
import { ResponseDataOutput, ResponseDataWhenError } from '../../global/GlobalResponseData';
import { JwtUserPayload } from '../user/user.interface';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { memoryStorage } from 'multer';

@Controller('api/v1/listening')
export class ListeningUploadController {
  /**
   * Upload audio file
   * POST /api/v1/listening/upload-audio
   * Requires authentication
   */
  @Post('upload-audio')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio', {
    // Note: For large files, consider using diskStorage instead of memoryStorage
    // to avoid memory issues. However, memoryStorage is fine for files up to 100MB
    storage: memoryStorage(), // Store in memory
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit for audio files
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/webm',
        'audio/m4a',
        'audio/aac',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only MP3, WAV, OGG, WebM, M4A, and AAC are allowed.'), false);
      }
    },
  }))
  async uploadAudio(
    @Request() req: { user: JwtUserPayload },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseDataOutput<{ url: string; filename: string } | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<{ url: string; filename: string }>({
      execute: async () => {
        if (!file) {
          throw new Error('No file uploaded');
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'uploads', 'listening');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const fileExt = path.extname(file.originalname) || '.mp3';
        const filename = `${uuidv4()}${fileExt}`;
        const filepath = path.join(uploadsDir, filename);

        // Save file
        fs.writeFileSync(filepath, new Uint8Array(file.buffer));

        // Return relative URL
        const url = `/uploads/listening/${filename}`;

        return {
          url,
          filename,
        };
      },
      actionName: 'uploadAudio',
    });
  }
}
