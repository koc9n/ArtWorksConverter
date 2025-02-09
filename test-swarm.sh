#!/bin/bash

# Initialize swarm mode
docker swarm init

# Build and tag images
echo "Building images..."
docker build -t art-works-converter-api ./api
docker build -t art-works-converter-worker ./worker
docker build -t art-works-converter-client ./client

# Build and deploy
docker stack deploy -c docker-compose.yml art-works-converter

# Wait for services to start
echo "Waiting for services to start..."
sleep 30

# Check service status
echo "Checking service status..."
docker service ls

# Test scaling workers
echo "Testing worker scaling..."
docker service scale art-works-converter_worker=7
sleep 10
docker service ls

# Test service logs
echo "Checking service logs..."
docker service logs art-works-converter_api
docker service logs art-works-converter_worker

# Test failover
echo "Testing failover..."
# Kill one worker to test recovery
WORKER_ID=$(docker ps -q -f name=art-works-converter_worker)
docker kill $WORKER_ID
sleep 10
docker service ls

# Run load test
echo "Running load test..."
cd api
./tests/load-test.sh

# Clean up
echo "Cleaning up..."
docker stack rm art-works-converter
docker swarm leave --force 