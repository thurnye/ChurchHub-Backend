import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  key: string;
  url: string;
  path: string;
}

/**
 * Storage service abstraction - currently uses local filesystem
 * Can be extended to support S3 or other cloud storage in the future
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
    this.baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';

    // Ensure upload directory exists
    this.ensureDirectoryExists(this.uploadDir);
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async upload(
    file: Buffer,
    mimeType: string,
    folder: string = 'uploads',
    tenantId?: string,
  ): Promise<UploadResult> {
    try {
      const key = this.generateKey(folder, tenantId, mimeType);
      const filePath = path.join(this.uploadDir, key);

      // Ensure directory exists
      this.ensureDirectoryExists(path.dirname(filePath));

      // Write file
      fs.writeFileSync(filePath, file);

      const url = `${this.baseUrl}/uploads/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        key,
        url,
        path: filePath,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, key);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`File deleted successfully: ${key}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getFile(key: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(this.uploadDir, key);

      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to read file: ${error.message}`, error.stack);
      throw error;
    }
  }

  private generateKey(folder: string, tenantId?: string, mimeType?: string): string {
    const uuid = uuidv4();
    const timestamp = Date.now();
    const extension = this.getExtensionFromMimeType(mimeType);

    if (tenantId) {
      return `${folder}/${tenantId}/${timestamp}-${uuid}${extension}`;
    }

    return `${folder}/${timestamp}-${uuid}${extension}`;
  }

  private getExtensionFromMimeType(mimeType?: string): string {
    if (!mimeType) return '';

    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
      'application/pdf': '.pdf',
    };

    return mimeToExt[mimeType] || '';
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/uploads/${key}`;
  }
}
