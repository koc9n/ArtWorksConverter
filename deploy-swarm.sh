#!/bin/bash

# Set environment variables
export REGISTRY=localhost
export TAG=latest

# Initialize swarm if not already in swarm mode
if ! docker info | grep -q "Swarm: active"; then
    echo "Initializing swarm mode..."
    docker swarm init
fi

# Create required directories
mkdir -p shared/uploads shared/converted

# Build images
echo "Building images..."
docker compose -f docker-compose.swarm.yml build

# Deploy stack
echo "Deploying stack..."
docker stack deploy -c docker-compose.swarm.yml mp4-to-gif

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check service status
echo "Checking service status..."
docker service ls

# Scale workers
echo "Scaling worker service..."
docker service scale mp4-to-gif_worker=5

# Monitor deployment
echo "Monitoring service logs..."
echo "Use the following commands to check logs:"
echo "docker service logs mp4-to-gif_api -f"
echo "docker service logs mp4-to-gif_worker -f"
echo "docker service logs mp4-to-gif_nginx -f"

echo "Stack deployed successfully!"
echo "Access the application at http://localhost" 