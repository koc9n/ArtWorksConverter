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

## Production Deployment

### Prerequisites

- Docker Engine in Swarm mode
- Docker Compose v3.8+
- At least 2GB RAM per node
- Sufficient disk space for video processing

### Deploying to Production

1. Initialize Docker Swarm (on manager node):
```bash
docker swarm init
```

2. Join worker nodes (optional):
```bash
# On manager node, get join token
docker swarm join-token worker

# On worker nodes, use the token to join
docker swarm join --token <token> <manager-ip>:2377
```

3. Deploy the stack:
```bash
# Build and deploy services
./deploy-swarm.sh

# Verify deployment
docker service ls
```

### Scaling Services

```bash
# Scale worker service
docker service scale art-works-converter_worker=10

# Scale API service
docker service scale art-works-converter_api=3
```

### Monitoring

```bash
# Check service status
docker service ls

# View service logs
docker service logs art-works-converter_api
docker service logs art-works-converter_worker

# Check health status
curl http://localhost:3000/health
```

### Updating Services

```bash
# Update the stack with new configurations
docker stack deploy -c docker-compose.yml art-works-converter
```

### Troubleshooting

1. Check service status:
```bash
docker service ps art-works-converter_worker --no-trunc
```

2. View detailed logs:
```bash
docker service logs art-works-converter_api --tail 100 -f
```

3. Inspect node status:
```bash
docker node ls
docker node inspect <node-id>
```

## Load Testing

The project includes a load testing script to test the API's performance under heavy load.

### Prerequisites

- Bash shell
- curl
- jq (for JSON processing)
- bc (for calculations)

### Running Load Tests

1. Make sure the API and worker service is running (`docker-compose up api worker`)
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

