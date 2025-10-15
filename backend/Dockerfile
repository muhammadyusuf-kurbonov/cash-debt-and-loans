FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs &&\
    adduser -S nestjs -u 1001

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN pnpm run build

# Change ownership of the app directory to the nestjs user
RUN chown -R nestjs:nodejs /app

USER nestjs

# Expose port (default is 3001 based on project documentation)
EXPOSE 3001

# Create volume for SQLite database if needed
VOLUME ["/app/data"]

# Run database migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && pnpm run start:prod"]