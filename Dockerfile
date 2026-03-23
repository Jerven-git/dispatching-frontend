# Use specific Bun version
FROM oven/bun:1.3.6

LABEL maintainer="tech7@sumomedia.co"
LABEL app_environment="development"

# Set working dir
WORKDIR /app

# Copy package files first
COPY package.json ./

# Install dependencies
RUN bun install

# Copy the rest of the app
COPY . .

# Expose Next.js dev port and HMR port
EXPOSE 3000 24678

# Start dev server
CMD ["bun", "run", "dev"]