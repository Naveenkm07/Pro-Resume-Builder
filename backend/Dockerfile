# Backend API Dockerfile - Node.js + Express + TypeScript
FROM node:20-alpine

# Install build essentials for Alpine (needed for native modules)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source files and config
COPY tsconfig.json ./
COPY src ./src

# Build/compile TypeScript to JavaScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm", "start"]
