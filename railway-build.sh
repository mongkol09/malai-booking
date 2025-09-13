# Railway Build Configuration

# Ensure we're in the correct directory for API
cd apps/api

# Generate Prisma client
npx prisma generate

# Build TypeScript
npm run build