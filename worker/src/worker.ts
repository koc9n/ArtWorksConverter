import Bull from 'bull';
import { config } from './config/config';
import { ConverterService } from './services/converter.service';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';

// Add type declaration at the top of the file
declare global {
  namespace NodeJS {
    interface Global {
      gc: () => void;
    }
  }
}

const converterService = new ConverterService();
const conversionQueue = new Bull('video-conversion', {
  redis: config.redis.url,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

// Set concurrency after queue creation
conversionQueue.process(Math.max(1, os.cpus().length - 1), async (job) => {
  return processJob(job);
});

// Add file cleanup function
async function cleanupFiles(inputPath: string, outputPath: string) {
  try {
    // Delete input file
    if (await fileExists(inputPath)) {
      await fs.unlink(inputPath);
      console.log('Deleted input file:', inputPath);
    }

    // Delete output file
    if (await fileExists(outputPath)) {
      await fs.unlink(outputPath);
      console.log('Deleted output file:', outputPath);
    }
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Memory management
const MEMORY_THRESHOLD = 0.8; // 80% memory usage threshold

async function checkMemoryUsage() {
  const used = process.memoryUsage().heapUsed;
  const total = process.memoryUsage().heapTotal;
  if (used / total >= MEMORY_THRESHOLD) {
    await conversionQueue.pause();
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    await conversionQueue.resume();
    return false;
  }
  return true;
}

// Process jobs
async function processJob(job: Bull.Job) {
  const { filename } = job.data;
  
  try {
    if (!filename) {
      throw new Error('No filename provided in job data');
    }

    const inputPath = path.join(config.storage.uploadsDir, filename);
    const outputPath = path.join(
      config.storage.convertedDir, 
      `${path.basename(filename, path.extname(filename))}.gif`
    );

    console.log('Starting conversion:', { inputPath, outputPath });

    // Verify input file exists
    if (!await fileExists(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    if (!await checkMemoryUsage()) {
      // Wait for GC
      if (global.gc) {
        global.gc();
      }
    }

    await converterService.convertToGif(
      inputPath,
      outputPath,
      (progress) => job.progress(progress)
    );

    // Schedule cleanup after TTL
    setTimeout(() => {
      cleanupFiles(inputPath, outputPath);
    }, config.queue.jobTtl);

    return {
      outputPath: path.relative(process.cwd(), outputPath),
      outputFilename: path.basename(outputPath)
    };
  } catch (error) {
    console.error('Conversion failed:', error);
    throw error;
  }
}

// Set up cleanup for completed jobs
conversionQueue.on('completed', async (job) => {
  const { filename } = job.data;
  const inputPath = path.join(config.storage.uploadsDir, filename);
  const outputPath = path.join(
    config.storage.convertedDir, 
    `${path.basename(filename, path.extname(filename))}.gif`
  );

  // Schedule cleanup after TTL
  setTimeout(() => {
    cleanupFiles(inputPath, outputPath);
  }, config.queue.jobTtl);
});

// Monitor queue health
conversionQueue.on('error', error => {
  console.error('Queue error:', error);
  // Implement error reporting/monitoring
});

conversionQueue.on('stalled', jobId => {
  console.warn('Job stalled:', jobId);
  // Handle stalled jobs
});

// Add metrics
setInterval(async () => {
  const metrics = await conversionQueue.getJobCounts();
  console.log('Queue metrics:', metrics);
}, 60000);

// Initialize and start the worker
async function start() {
  try {
    // Ensure directories exist
    await fs.mkdir(config.storage.uploadsDir, { recursive: true });
    await fs.mkdir(config.storage.convertedDir, { recursive: true });

    console.log('Worker service started with config:', {
      uploadsDir: config.storage.uploadsDir,
      convertedDir: config.storage.convertedDir,
      jobTtl: config.queue.jobTtl
    });

  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
}

start(); 