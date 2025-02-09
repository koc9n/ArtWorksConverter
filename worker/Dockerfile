FROM node:18
WORKDIR /app
RUN apt-get update && apt-get install -y ffmpeg
RUN mkdir -p /app/shared/uploads /app/shared/converted
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"] 