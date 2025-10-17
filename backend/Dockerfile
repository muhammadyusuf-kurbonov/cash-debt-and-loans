# Stage 1: Build the application and generate Prisma Client
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies (including devDependencies for the build and Prisma)
RUN npm install

# Copy the Prisma schema file, which is needed to generate the client
# Assuming your schema is in the default location: prisma/schema.prisma
COPY prisma/schema.prisma ./prisma/

# Copy the rest of the application source code
COPY . .

# Generate the Prisma Client
# This must be run after installing packages and copying the schema
RUN npx prisma generate

# Run the NestJS build command
# This compiles TypeScript into JavaScript in the 'dist' folder
RUN npm run build

# ---

# Stage 2: Create the final, lean production image
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /usr/src/app

# Only copy package.json and package-lock.json needed for *production* dependencies
COPY package*.json ./

# Install only production dependencies
# The --omit=dev flag is crucial for keeping the final image small
RUN npm install --omit=dev

# Copy the compiled application files from the 'builder' stage's 'dist' folder
COPY --from=builder /usr/src/app/dist ./dist

# Crucial Step for Prisma: Copy the generated Prisma Client files
# The .prisma folder contains the platform-specific query engine and the generated code.
# The path /usr/src/app/node_modules/.prisma is where 'npx prisma generate' puts the files.
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Copy the Prisma schema file to the production image
# This is needed by the Prisma Client at runtime to locate the engine.
COPY prisma/schema.prisma ./prisma/

# Expose the port the NestJS application listens on (default is 3000)
EXPOSE 3000

# Command to run the application
CMD [ "node", "dist/main" ]
