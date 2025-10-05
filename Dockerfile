FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Pin npm version for consistent lock resolution
RUN corepack enable && corepack prepare npm@10.8.2 --activate

# Install dependencies (relax peer deps to avoid ERESOLVE)
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Pin npm version for consistent lock resolution
RUN corepack enable && corepack prepare npm@10.8.2 --activate

# Install production dependencies only (relax peer deps)
RUN npm ci --omit=dev --legacy-peer-deps --no-audit --no-fund

# Copy Prisma client from builder
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy prisma schema (needed for migrations)
COPY prisma ./prisma/

# Expose the application port
EXPOSE 3000

# Set NODE_ENV
ENV NODE_ENV=production
COPY .env ./

# Start the application
CMD ["npm", "run", "start:prod"]
