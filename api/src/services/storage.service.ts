import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config/config';

export class StorageService {
  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    await fs.mkdir(config.storage.uploadsDir, { recursive: true });
    await fs.mkdir(config.storage.convertedDir, { recursive: true });
  }

  getUploadPath(filename: string): string {
    return path.join(config.storage.uploadsDir, filename);
  }

  getConvertedPath(filename: string): string {
    const baseName = path.basename(filename, path.extname(filename));
    return path.join(config.storage.convertedDir, `${baseName}.gif`);
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async deleteFile(filepath: string): Promise<void> {
    try {
      if (await this.fileExists(filepath)) {
        await fs.unlink(filepath);
        console.log(`Deleted file: ${filepath}`);
        
        // Try to remove parent directory if empty
        const dirPath = path.dirname(filepath);
        const files = await fs.readdir(dirPath);
        if (files.length === 0) {
          await fs.rmdir(dirPath);
          console.log(`Removed empty directory: ${dirPath}`);
        }
      }
    } catch (error) {
      console.error(`Failed to delete file ${filepath}:`, error);
    }
  }
} 