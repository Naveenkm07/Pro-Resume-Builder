# Backend API Dockerfile - Node.js + Express + TypeScript
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy source files and config
COPY tsconfig.json ./
COPY src ./src

# Install dev dependencies for ts-node
RUN npm install --save-dev ts-node typescript

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm", "run", "start"]
