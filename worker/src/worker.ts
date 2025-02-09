import Bull from 'bull';
import { config } from './config/config';
import { ConverterService } from './services/converter.service';
import path from 'path';
import { promises as fs } from 'fs';

const converterService = new ConverterService();
const conversionQueue = new Bull('video-conversion', {
  redis: config.redis.url,
  defaultJobOptions: {
    attempts: 3
  }
});

// Set concurrency after queue creation
conversionQueue.process(2, async (job) => {
  return processJob(job);
});

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Process jobs
async function processJob(job: Bull.Job) {
  const { filename } = job.data;
  if (!filename) {
    throw new Error('No filename provided in job data');
  }

  const inputPath = path.join(config.storage.uploadsDir, filename);
  const outputPath = path.join(
    config.storage.convertedDir, 
    `${path.basename(filename, path.extname(filename))}.gif`
  );

  try {
    console.log('Starting conversion:', { inputPath, outputPath });

    await converterService.convertToGif(
      inputPath,
      outputPath,
      (progress) => job.progress(progress)
    );

    job.progress(100);

    // Remove input file immediately after successful conversion
    try {
      await fs.unlink(inputPath);
      console.log('Removed input file after successful conversion:', inputPath);
    } catch (error) {
      console.error('Failed to remove input file:', error);
    }

    return {
      outputPath: path.relative(process.cwd(), outputPath),
      outputFilename: path.basename(outputPath)
    };
  } catch (error) {
    console.error('Conversion failed:', error);
    throw error;
  }
}

// Process jobs
conversionQueue.on('completed', async (job) => {
  const { outputFilename } = job.data;
  const outputPath = path.join(
    config.storage.convertedDir, outputFilename
  );

  // Schedule cleanup of converted file after TTL
  setTimeout(async () => {
    try {
      if (await fileExists(outputPath)) {
        await fs.unlink(outputPath);
        console.log('Removed converted file after TTL:', outputPath);
      }
    } catch (error) {
      console.error('Failed to remove converted file:', error);
    }
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