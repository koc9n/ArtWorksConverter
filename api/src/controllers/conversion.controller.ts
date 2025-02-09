import { Request, Response } from 'express';
import { ConversionService } from '../services/converter.service';
import { StorageService } from '../services/storage.service';
import path from 'path';
import { config } from '../config/config';

export class ConversionController {
  private conversionService: ConversionService;
  private storageService: StorageService;

  constructor() {
    this.conversionService = new ConversionService();
    this.storageService = new StorageService();
  }

  convert = async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      if (!req.file || !req.user?.userId) {
        console.warn('Convert attempt without file or userId:', { 
          hasFile: !!req.file, 
          userId: req.user?.userId 
        });
        return res.status(400).json({ error: 'File and user ID are required' });
      }

      const filename = (req as any).generatedFilename || req.file.filename;
      console.info('Starting conversion process:', {
        userId: req.user.userId,
        filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });

      // Queue conversion immediately after upload
      const result = await this.conversionService.queueConversion(
        filename,
        req.user.userId
      );

      const processingTime = Date.now() - startTime;
      console.info('Conversion queued successfully:', {
        userId: req.user.userId,
        filename,
        id: result.id,
        processingTime: `${processingTime}ms`
      });

      // Send response as soon as job is queued
      res.json({
        ...result,
        message: 'File uploaded and conversion queued'
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('Conversion error:', {
        error,
        userId: req.user?.userId,
        filename: req.file?.filename,
        processingTime: `${processingTime}ms`
      });

      // Clean up uploaded file if conversion queueing fails
      if (req.file) {
        await this.storageService.deleteFile(req.file.path).catch(err => {
          console.error('Failed to cleanup file after conversion error:', {
            error: err,
            path: req.file?.path
          });
        });
      }
      res.status(500).json({ error: 'Failed to start conversion' });
    }
  };

  getStatus = async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const userId = req.user!.userId;  // User is guaranteed by auth middleware
      const status = await this.conversionService.getJobStatus(jobId, userId);
      res.json(status);
    } catch (error) {
      console.error('Status check error:', error);
      res.status(404).json({ error: 'Job not found' });
    }
  };

  getHistory = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const history = await this.conversionService.getHistory(userId);
      res.json(history.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch conversion history' });
    }
  };

  deleteFromHistory = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      await this.conversionService.deleteJob(req.params.jobId, userId);
      res.json({ message: 'Job removed from history' });
    } catch (error) {
      if ((error as Error).message === 'Job not found') {
        return res.status(404).json({ error: 'Job not found' });
      }
      res.status(500).json({ error: 'Failed to delete from history' });
    }
  };

  getGif = async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
      }

      const filePath = path.join(config.storage.convertedDir, filename);
      
      if (!await this.storageService.fileExists(filePath)) {
        return res.status(404).json({ error: 'GIF not found' });
      }

      res.sendFile(filePath);
    } catch (error) {
      console.error('GIF retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve GIF' });
    }
  };
} 