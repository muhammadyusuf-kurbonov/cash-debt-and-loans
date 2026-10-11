# Use a Node.js image suitable for building
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install all dependencies (for build + runtime)
RUN npm ci

# Copy Prisma schema first (for generate)
COPY prisma ./prisma

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS application
RUN npm run build

# Expose port
EXPOSE 3001

CMD node dist/main.js
