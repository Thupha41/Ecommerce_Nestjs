FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Pin npm version for consistent lock resolution
RUN corepack enable && corepack prepare npm@10.8.2 --activate

# Install dependencies
RUN npm ci --legacy-peer-deps --force

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

# Copy all node_modules from builder to ensure all dependencies are available
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy i18n files (needed for internationalization)
COPY --from=builder /app/src/i18n ./src/i18n

# Copy prisma schema (needed for migrations)
COPY prisma ./prisma/

# Expose the application port
EXPOSE 3000

# Set NODE_ENV
ENV NODE_ENV=production
COPY .env ./

# Start the application
CMD ["npm", "run", "start:prod"]
