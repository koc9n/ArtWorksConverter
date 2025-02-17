import Bull from 'bull';
import { config } from '../config/config';
import path from 'path';
import { StorageService } from './storage.service';

interface JobData {
  filename: string;
  outputFilename: string;
  userId: string;
}

export class ConversionService {
  private queue: Bull.Queue<JobData>;
  private storageService: StorageService;

  constructor() {
    this.queue = new Bull('video-conversion', config.redis.url);
    this.storageService = new StorageService();
  }

  async queueConversion(filename: string, userId: string): Promise<{ id: string; message: string }> {
    try {
      if (!filename) {
        throw new Error('No filename provided');
      }

      // Generate output filename, replacing any video extension with .gif
      const outputFilename = `${path.basename(filename, path.extname(filename))}.gif`;

      const job = await this.queue.add({
        filename,
        outputFilename,
        userId,
      }, {
        attempts: config.queue.attempts,
        timeout: config.queue.jobTtl,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      });

      console.log('Queued conversion job:', {
        id: job.id,
        filename,
        outputFilename
      });

      return {
        id: job.id.toString(),
        message: 'Conversion started'
      };
    } catch (error) {
      console.error('Conversion queue error:', error);
      throw new Error('Failed to start conversion');
    }
  }

  async getJobStatus(jobId: string, userId: string): Promise<any> {
    const job = await this.queue.getJob(jobId);
    if (!job || job.data.userId !== userId) {
      throw new Error('Job not found');
    }

    const state = await job.getState();
    const progress = await job.progress();

    return {
      id: job.id,
      state,
      progress,
      result: job.returnvalue,
      error: job.failedReason
    };
  }

  async getHistory(userId: string) {
    const jobs = await this.queue.getJobs(['completed', 'failed']);
    return jobs
      .filter(job => job.data.userId === userId)
      .map(job => ({
        id: job.id,
        state: job.finishedOn ? 'completed' : 'failed',
        progress: job.progress(),
        result: job.returnvalue,
        error: job.failedReason,
        timestamp: job.finishedOn
      }));
  }

  async deleteJob(jobId: string, userId: string) {
    const job = await this.queue.getJob(jobId);
    if (!job || job.data.userId !== userId) {
      throw new Error('Job not found');
    }

    // Clean up converted files, because uploaded files cleaned up on completion of job
    try {
      const outputPath = path.join(config.storage.convertedDir, job.data.outputFilename);

      // Delete output file
      await this.storageService.deleteFile(outputPath);

      console.log('Cleaned up files for job:', {
        jobId,
        outputPath
      });
    } catch (error) {
      console.error('Error cleaning up files:', error);
      // Continue with job removal even if file cleanup fails
    }

    await job.remove();
  }
} 