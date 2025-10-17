# Use a Node.js image suitable for pnpm and building
FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /usr/src/app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
ENV PNPM_SCRIPT_SHIM_EXEC_IGNORING_PATH=true

# Install all dependencies (for build + runtime)
RUN pnpm install --frozen-lockfile --dangerously-allow-all-builds

# Copy Prisma schema first (for generate)
COPY prisma ./prisma

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build NestJS application
RUN pnpm run build

# Expose port
EXPOSE 3001

# Run Prisma migrations on startup, then start the app
CMD pnpm prisma migrate deploy && node dist/main.js
