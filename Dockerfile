FROM oven/bun:latest as base
WORKDIR /app

# Install dependencies
FROM base as dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the application
FROM dependencies as build
COPY . .

# Expose the port your application runs on (change if needed)
EXPOSE 4090

# Start the application
CMD ["bun", "run", "index.ts"]