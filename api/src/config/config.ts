export const config = {
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  server: {
    port: process.env.PORT || 3000,
  },
  storage: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    uploadsDir: '/app/shared/uploads',    // Shared volume path
    convertedDir: '/app/shared/converted', // Shared volume path
  },
  queue: {
    attempts: Number(process.env.QUEUE_ATTEMPTS) || 3,
    removeOnComplete: process.env.QUEUE_REMOVE_COMPLETE === 'true' || false,
    removeOnFail: process.env.QUEUE_REMOVE_FAIL === 'true' || false,
    jobTtl: Number(process.env.QUEUE_JOB_TTL) || 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },
  conversion: {
    outputHeight: 400,   // Target output height
    fps: 5,             // Target output FPS
  },
}; 