# ============================
# 1) Builder stage
# ============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files only (cache tốt hơn)
COPY package*.json ./

# Enable specific npm version
RUN corepack enable && corepack prepare npm@10.8.2 --activate

# Install ALL deps (dev + prod)
RUN npm ci --legacy-peer-deps --force

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy application source
COPY . .

# Build NestJS app
RUN npm run build


# ============================
# 2) Production stage
# ============================
FROM node:20-alpine AS production

WORKDIR /app

# Copy only package files
COPY package*.json ./

# Enable npm
RUN corepack enable && corepack prepare npm@10.8.2 --activate

# Install ONLY production dependencies
RUN npm ci --omit=dev --legacy-peer-deps --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy Prisma Client only (not full node_modules)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy i18n, nếu bạn dùng i18n JSON nằm trong src/i18n
COPY src/i18n ./src/i18n

# Copy schema nếu cần migration trong container
COPY prisma ./prisma

# ENV
ENV NODE_ENV=production
EXPOSE 3000

# Add application env variables
COPY .env .env

CMD ["node", "dist/main.js"]
