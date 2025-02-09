FROM node:18

WORKDIR /app

# Install ffmpeg and curl for healthcheck
RUN apt-get update && apt-get install -y ffmpeg curl

# Create shared directories
RUN mkdir -p /app/shared/uploads /app/shared/converted

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"] 