# MP4 to GIF Conversion Service

A scalable service for converting MP4 videos to GIFs using Angular, Express, and Docker Swarm.

## Features

- MP4 to GIF conversion with specified parameters
- Support for high load (1000 requests/minute)
- Docker Swarm ready
- Scalable worker architecture
- Real-time conversion status updates
- Bull Queue for job management
- File cleanup automation

## Architecture

The application consists of three main components:

- **API Server**: Express.js REST API handling file uploads and conversion requests
- **Worker**: Background service processing video conversions using FFmpeg
- **Client**: Angular frontend application
- **Redis**: Used for job queue management and session storage

## Requirements

- Docker
- Docker Compose
- Node.js 16+

## Environment Variables

### API Server
- `PORT`: API server port (default: 3000)
- `REDIS_URL`: Redis connection URL
- `QUEUE_JOB_TTL`: Job time-to-live in ms (default: 24h)

### Worker
- `REDIS_URL`: Redis connection URL

### Client
- `API_URL`: API server URL (default: http://localhost:3000)

## File Management

- Files are automatically cleaned up:
  - After job TTL expires
  - When deleting from history
  - After successful conversion
- Temporary files are managed by the worker service

## Support

For issues and feature requests, please create an issue in the repository.

## Services and Access Points

- **Frontend Application**: 
  - URL: http://localhost:4200
  - Features:
    - Video upload interface
    - Real-time conversion status
    - History of conversions
    - Download converted GIFs

- **Bull Queue Dashboard**: 
  - URL: http://localhost:3000/admin/queues
  - Monitor:
    - Active jobs
    - Failed jobs
    - Completed jobs
    - Queue metrics

## Development Setup

### Running with Docker Compose (Recommended) because we use shared folders to store files

1. Build and start all services:
```bash
docker-compose up --build -d
```

2. Access the services:
   - Frontend: http://localhost:4200
   - API: http://localhost:3000
   - Bull Queue Dashboard: http://localhost:3000/admin/queues

3. View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f client
docker-compose logs -f api
docker-compose logs -f worker
```

4. Remove all services:
```bash
docker-compose down
```

## Load Testing

The project includes a load testing script to test the API's performance under heavy load.

### Prerequisites

- Bash shell
- curl
- jq (for JSON processing)
- bc (for calculations)

### Running Load Tests

1. Make sure the API service is running (`docker-compose up api`)
2. Place a test video file at `api/tests/data/test_me.mp4` (should be a small MP4 file)
3. Run the load test:

```bash
cd api
chmod +x tests/load-test.sh
./tests/load-test.sh
```

### Configuration

You can modify the following variables in `tests/load-test.sh`:

- `REQUESTS_PER_MINUTE`: Target number of requests per minute
- `TEST_DURATION_MINUTES`: Duration of the test in minutes
- `TOTAL_USERS`: Number of concurrent users to simulate

### Test Output

The script will show:
- Real-time progress of requests
- Success/failure counts
- Final statistics including:
  - Total duration
  - Success/failure rates
  - Actual requests per minute achieved

