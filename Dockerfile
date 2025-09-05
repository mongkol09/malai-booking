# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from apps/api
COPY apps/api/package*.json ./
COPY apps/api/prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN npm ci --include=dev

# Generate Prisma client
RUN npx prisma generate

# Copy source code from apps/api
COPY apps/api/ .

# Build the application
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/app.js"]
