# Use pnpm for package management instead of npm
FROM node:20-alpine AS development-dependencies-env
# Install pnpm globally
RUN npm install -g pnpm

# Copy project files
COPY . /app
WORKDIR /app
ENV PNPM_SCRIPT_SHIM_EXEC_IGNORING_PATH=true
# Install dependencies with pnpm
RUN pnpm install

FROM node:20-alpine AS production-dependencies-env
RUN npm install -g pnpm

# Copy package files
COPY pnpm-lock.yaml /app/
COPY package.json /app/
WORKDIR /app
ENV PNPM_SCRIPT_SHIM_EXEC_IGNORING_PATH=true
# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

FROM node:20-alpine AS build-env
RUN npm install -g pnpm

# Copy project files
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app

# Build the application
RUN pnpm run build

# Production stage - serve the built application
FROM node:20-alpine

# Install pnpm and serve globally
RUN npm install -g pnpm serve

COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app

EXPOSE 3000

# Start the application using serve
CMD ["serve", "-s", "build", "-l", "3000"]