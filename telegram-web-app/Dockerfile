# Use pnpm for package management instead of npm
FROM node:20-alpine
# Install pnpm globally
RUN npm install -g pnpm
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-* ./

# Install all dependencies (for build + runtime)
RUN pnpm install --frozen-lockfile

COPY . .

# Build the application
RUN pnpm run build

EXPOSE 3000

# Start the application using serve
CMD ["serve", "-s", "build/client", "-l", "3000"]