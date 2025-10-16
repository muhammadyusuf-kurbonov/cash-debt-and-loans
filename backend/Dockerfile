# Stage 1: Build the application
# Use a Node.js image suitable for building (e.g., 'alpine' variant for smaller size)
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
# This means npm install only runs if these files change
COPY package*.json ./

# Install dependencies (including devDependencies for the build)
RUN npm install

# Copy the rest of the application source code
# This step only runs if the source code changes
COPY . .

# Run the build command (assuming 'npm run build' generates compiled JS in a 'dist' folder)
# This usually compiles TypeScript into JavaScript
RUN npm run build

# ---

# Stage 2: Create the final, lean production image
# Use a smaller, secure image for the final runtime environment
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /usr/src/app

# Only copy package.json and package-lock.json needed for *production* dependencies
COPY package*.json ./

# Install only production dependencies
# The --omit=dev flag is crucial for keeping the final image small
RUN npm install --omit=dev

# Copy the compiled application files from the 'builder' stage's 'dist' folder
# Change 'dist' if your build output directory is named differently
COPY --from=builder /usr/src/app/dist ./dist

# Copy other necessary production files (like static assets, templates, etc.)
# If you have a 'src/public' folder for static files
# COPY --from=builder /usr/src/app/src/public ./public
# Or if you have a 'node_modules' that needs specific files from the build stage that weren't copied:
# COPY --from=builder /usr/src/app/node_modules ./node_modules

# Expose the port the NestJS application listens on (default is 3000)
EXPOSE 3000

# Command to run the application
# The entry point should point to the compiled main file in the 'dist' directory
# (e.g., dist/main.js for a standard NestJS project)
CMD [ "node", "dist/main" ]
