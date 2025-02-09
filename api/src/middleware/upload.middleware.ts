import multer from 'multer';
import { config } from '../config/config';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { NextFunction, Request, Response} from 'express';

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, '..', '..', config.storage.uploadsDir);
fs.mkdirSync(uploadsDir, { recursive: true });

// Use disk storage with streaming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.mp4`;
    (req as any).generatedFilename = filename;
    cb(null, filename);
  }
});

// Optimized file filter with early rejection
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file size early (in bytes)
  const maxSize = config.storage.maxFileSize || 50 * 1024 * 1024; // 50MB default
  if (parseInt(req.headers['content-length'] || '0') > maxSize) {
    cb(new Error('File too large'));
    return;
  }

  // Check file type
  if (file.mimetype !== 'video/mp4') {
    cb(new Error('Invalid file type'));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.storage.maxFileSize,
    files: 1
  }
});

// Wrapped middleware for better error handling
export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        error: 'Upload error', 
        details: err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        error: err.message 
      });
    }
    next();
  });
}; 