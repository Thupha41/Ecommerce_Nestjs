FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

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

# Install production dependencies only
RUN npm ci --omit=dev

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