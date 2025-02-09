export const config = {
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  storage: {
    uploadsDir: '/app/shared/uploads',    // Shared volume path
    convertedDir: '/app/shared/converted', // Shared volume path
  },
  conversion: {
    outputHeight: 400,
    fps: 5,
    quality: 10
  },
  queue: {
    jobTtl: Number(process.env.QUEUE_JOB_TTL) || 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  }
}; 