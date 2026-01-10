# Base image
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install production dependencies
# Using npm ci for reliable builds
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user for security (good practice)
# Alpine handles users slightly differently, but standard adduser works
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 3000

# Health check
# Note: Alpine node images might not have curl/wget by default, but we can use node itself for a simple check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"

# Development stage
FROM base AS development
USER root
# Install ALL dependencies (including devDependencies like nodemon, eslint)
RUN npm ci && npm cache clean --force
# Switch back to non-root user
USER nodejs
# Start with dev script (nodemon)
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
# Uses the production dependencies installed in base
CMD ["npm", "start"]
