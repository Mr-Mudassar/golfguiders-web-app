# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Add build dependencies for native modules
RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
COPY .env .env
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build Next.js app
RUN pnpm build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm

# Copy build output and necessary files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/.env .env

# Install development dependencies only
RUN pnpm install --prod --frozen-lockfile

# ENV NODE_ENV=development
EXPOSE 8080

CMD ["pnpm", "start", "--port", "8080", "--hostname", "0.0.0.0"]
