# Development stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Development server
CMD ["npm", "run", "start"]
EXPOSE 4200 