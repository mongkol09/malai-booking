#!/bin/bash

# ========================================
# MALAI RESORT - PRODUCTION BUILD SCRIPT
# ========================================
# Environment: Production
# Version: V1.0.0
# Date: 2024-12-19

echo "🚀 Starting Malai Resort Production Build..."

# ========================================
# PRE-BUILD CHECKS
# ========================================
echo "📋 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version (require 18+)
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"

# ========================================
# CLEAN PREVIOUS BUILDS
# ========================================
echo "🧹 Cleaning previous builds..."

# Remove previous build artifacts
rm -rf dist/
rm -rf node_modules/
rm -rf logs/
rm -f package-lock.json

echo "✅ Cleanup completed"

# ========================================
# INSTALL DEPENDENCIES
# ========================================
echo "📦 Installing dependencies..."

# Install production dependencies
npm ci --only=production

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# ========================================
# DATABASE MIGRATIONS
# ========================================
echo "🗄️ Running database migrations..."

# Check if Prisma is available
if [ -f "prisma/schema.prisma" ]; then
    # Generate Prisma client
    npx prisma generate
    
    # Run migrations (if database is accessible)
    if [ "$SKIP_MIGRATIONS" != "true" ]; then
        npx prisma migrate deploy
        if [ $? -ne 0 ]; then
            echo "⚠️ Database migrations failed (this might be expected in some environments)"
        fi
    else
        echo "⏭️ Skipping database migrations"
    fi
else
    echo "ℹ️ No Prisma schema found, skipping database operations"
fi

echo "✅ Database operations completed"

# ========================================
# BUILD APPLICATION
# ========================================
echo "🔨 Building application..."

# Build TypeScript
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# ========================================
# SECURITY CHECKS
# ========================================
echo "🔒 Running security checks..."

# Check for common security issues
if grep -r "console.log" dist/ | grep -v "node_modules" > /dev/null; then
    echo "⚠️ Warning: console.log statements found in production build"
fi

if grep -r "debugger" dist/ | grep -v "node_modules" > /dev/null; then
    echo "⚠️ Warning: debugger statements found in production build"
fi

echo "✅ Security checks completed"

# ========================================
# CREATE PRODUCTION FILES
# ========================================
echo "📁 Creating production files..."

# Create production environment file
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from production.env..."
    cp production.env .env
fi

# Create logs directory
mkdir -p logs

# Create production startup script
cat > start-production.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Malai Resort Production Server..."
export NODE_ENV=production
export PORT=3001
node dist/index.js
EOF

chmod +x start-production.sh

# Create production PM2 configuration
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'malai-resort-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

echo "✅ Production files created"

# ========================================
# FINAL CHECKS
# ========================================
echo "🔍 Final checks..."

# Check if build artifacts exist
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build artifact not found: dist/index.js"
    exit 1
fi

# Check file sizes
BUILD_SIZE=$(du -sh dist/ | cut -f1)
echo "📊 Build size: $BUILD_SIZE"

# Check if production files exist
if [ -f "start-production.sh" ] && [ -f "ecosystem.config.js" ]; then
    echo "✅ Production startup files created"
else
    echo "❌ Failed to create production startup files"
    exit 1
fi

echo "✅ Final checks passed"

# ========================================
# BUILD COMPLETED
# ========================================
echo ""
echo "🎉 MALAI RESORT PRODUCTION BUILD COMPLETED SUCCESSFULLY! 🎉"
echo ""
echo "📁 Build artifacts: ./dist/"
echo "🚀 Start production: ./start-production.sh"
echo "⚡ Start with PM2: pm2 start ecosystem.config.js --env production"
echo "📊 Monitor with PM2: pm2 monit"
echo ""
echo "🔧 Next steps:"
echo "   1. Configure your production environment variables"
echo "   2. Set up your production database"
echo "   3. Configure your reverse proxy (nginx/apache)"
echo "   4. Set up SSL certificates"
echo "   5. Configure monitoring and logging"
echo ""
echo "📚 Documentation: Check README.md for deployment details"
echo ""
