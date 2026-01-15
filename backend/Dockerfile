# Backend API Dockerfile - Node.js + Express + TypeScript
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev dependencies for TypeScript compilation)
RUN npm ci

# Copy source files and config
COPY tsconfig.json ./
COPY src ./src

# Build/compile TypeScript to JavaScript
RUN npm run build

# Remove dev dependencies for smaller final image (optional)
RUN npm ci --only=production

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm", "start"]
