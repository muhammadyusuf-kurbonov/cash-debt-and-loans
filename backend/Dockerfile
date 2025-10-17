# Stage 1: Build the application and generate Prisma Client
# Use a Node.js image suitable for pnpm and building
FROM node:20-alpine AS builder

# Install pnpm globally in the builder stage
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for the build and Prisma)
# pnpm is typically much faster here
RUN pnpm install --frozen-lockfile

# Copy the Prisma schema file, which is needed to generate the client
# Assuming your schema is in the default location: prisma/schema.prisma
COPY prisma/schema.prisma ./prisma/

# Copy the rest of the application source code
COPY . .

# Generate the Prisma Client
# This must be run after installing packages and copying the schema
RUN pnpm prisma generate

# Run the NestJS build command
RUN pnpm run build

# ---

# Stage 2: Create the final, lean production image
FROM node:20-alpine AS production

# Install pnpm globally in the production stage as well
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install ONLY production dependencies
# The --prod flag (or --production) is crucial for pnpm to keep the final image small
RUN pnpm install --prod --frozen-lockfile

# Copy the compiled application files from the 'builder' stage's 'dist' folder
COPY --from=builder /usr/src/app/dist ./dist

# Crucial Step for Prisma: Copy the generated Prisma Client files
# Note: pnpm typically creates a symlink structure, but copying the actual generated files works reliably.
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Copy the Prisma schema file to the production image
COPY prisma/schema.prisma ./prisma/

# Expose the port the NestJS application listens on (default is 3000)
EXPOSE 3000

# Command to run the application
# Use 'node' directly on the compiled JavaScript file
CMD [ "node", "dist/main" ]
