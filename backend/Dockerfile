# Use a Node.js image suitable for building. Matches the local toolchain (Node 26),
# so the container and local runs resolve the same dependency tree.
FROM node:26-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install all dependencies (for build + runtime)
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma client. Prisma 7 emits plain TypeScript into src/generated, which
# `nest build` below must compile — so generate after the full copy, before the build.
RUN npx prisma generate

# Build NestJS application
RUN npm run build

# Expose port
EXPOSE 3001

CMD node dist/main.js
