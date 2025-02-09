FROM node:18

WORKDIR /app

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Create shared directories
RUN mkdir -p /app/shared/uploads /app/shared/converted

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"] 