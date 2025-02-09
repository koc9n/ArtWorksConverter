#!/bin/bash

# Initialize swarm if not already
docker swarm init

# Build and tag images
echo "Building images..."
docker build -t art-works-converter-api ./api
docker build -t art-works-converter-worker ./worker
docker build -t art-works-converter-client ./client

# Build images
docker-compose build

# Deploy stack
docker stack deploy -c docker-compose.yml art-works-converter

# Scale workers if needed
docker service scale art-works-converter_worker=5 