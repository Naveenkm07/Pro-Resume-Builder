# Backend API Dockerfile - Node.js + Express + TypeScript
FROM node:20-alpine AS deps

# Install build essentials for Alpine (needed for native modules)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./

# Copy source files and config
COPY tsconfig.json ./
COPY src ./src

# Build/compile TypeScript to JavaScript
RUN npm run build

# Install production dependencies only, with build tools
FROM node:20-alpine AS prod-deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm", "run", "start"]
