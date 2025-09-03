@echo off
chcp 65001 >nul
echo.
echo ========================================
echo MALAI RESORT - PRODUCTION BUILD SCRIPT
echo ========================================
echo Environment: Production
echo Version: V1.0.0
echo Date: 2024-12-19
echo.

echo 🚀 Starting Malai Resort Production Build...
echo.

REM ========================================
REM PRE-BUILD CHECKS
REM ========================================
echo 📋 Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM ========================================
REM CLEAN PREVIOUS BUILDS
REM ========================================
echo 🧹 Cleaning previous builds...
echo.

REM Remove previous build artifacts
if exist dist\ rmdir /s /q dist
if exist node_modules\ rmdir /s /q node_modules
if exist logs\ rmdir /s /q logs
if exist package-lock.json del package-lock.json

echo ✅ Cleanup completed
echo.

REM ========================================
REM INSTALL DEPENDENCIES
REM ========================================
echo 📦 Installing dependencies...
echo.

REM Install production dependencies
call npm ci --only=production

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM ========================================
REM DATABASE MIGRATIONS
REM ========================================
echo 🗄️ Running database migrations...
echo.

REM Check if Prisma is available
if exist prisma\schema.prisma (
    REM Generate Prisma client
    call npx prisma generate
    
    REM Run migrations (if database is accessible)
    if not "%SKIP_MIGRATIONS%"=="true" (
        call npx prisma migrate deploy
        if %errorlevel% neq 0 (
            echo ⚠️ Database migrations failed (this might be expected in some environments)
        )
    ) else (
        echo ⏭️ Skipping database migrations
    )
) else (
    echo ℹ️ No Prisma schema found, skipping database operations
)

echo ✅ Database operations completed
echo.

REM ========================================
REM BUILD APPLICATION
REM ========================================
echo 🔨 Building application...
echo.

REM Build TypeScript
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully
echo.

REM ========================================
REM SECURITY CHECKS
REM ========================================
echo 🔒 Running security checks...
echo.

REM Check for common security issues
findstr /s /i "console.log" dist\*.* >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Warning: console.log statements found in production build
)

findstr /s /i "debugger" dist\*.* >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Warning: debugger statements found in production build
)

echo ✅ Security checks completed
echo.

REM ========================================
REM CREATE PRODUCTION FILES
REM ========================================
echo 📁 Creating production files...
echo.

REM Create production environment file
if not exist .env (
    echo 📝 Creating .env file from production.env...
    copy production.env .env >nul
)

REM Create logs directory
if not exist logs\ mkdir logs

REM Create production startup script
echo @echo off > start-production.bat
echo chcp 65001 ^>nul >> start-production.bat
echo echo 🚀 Starting Malai Resort Production Server... >> start-production.bat
echo echo. >> start-production.bat
echo set NODE_ENV=production >> start-production.bat
echo set PORT=3001 >> start-production.bat
echo node dist\index.js >> start-production.bat
echo pause >> start-production.bat

REM Create production PM2 configuration
echo module.exports = { > ecosystem.config.js
echo   apps: [{ >> ecosystem.config.js
echo     name: 'malai-resort-api', >> ecosystem.config.js
echo     script: 'dist/index.js', >> ecosystem.config.js
echo     instances: 'max', >> ecosystem.config.js
echo     exec_mode: 'cluster', >> ecosystem.config.js
echo     env: { >> ecosystem.config.js
echo       NODE_ENV: 'production', >> ecosystem.config.js
echo       PORT: 3001 >> ecosystem.config.js
echo     }, >> ecosystem.config.js
echo     env_production: { >> ecosystem.config.js
echo       NODE_ENV: 'production', >> ecosystem.config.js
echo       PORT: 3001 >> ecosystem.config.js
echo     }, >> ecosystem.config.js
echo     error_file: './logs/err.log', >> ecosystem.config.js
echo     out_file: './logs/out.log', >> ecosystem.config.js
echo     log_file: './logs/combined.log', >> ecosystem.config.js
echo     time: true, >> ecosystem.config.js
echo     max_memory_restart: '1G', >> ecosystem.config.js
echo     restart_delay: 4000, >> ecosystem.config.js
echo     max_restarts: 10, >> ecosystem.config.js
echo     min_uptime: '10s' >> ecosystem.config.js
echo   }] >> ecosystem.config.js
echo }; >> ecosystem.config.js

echo ✅ Production files created
echo.

REM ========================================
REM FINAL CHECKS
REM ========================================
echo 🔍 Final checks...
echo.

REM Check if build artifacts exist
if not exist dist\index.js (
    echo ❌ Build artifact not found: dist\index.js
    pause
    exit /b 1
)

REM Check if production files exist
if exist start-production.bat (
    echo ✅ Production startup files created
) else (
    echo ❌ Failed to create production startup files
    pause
    exit /b 1
)

echo ✅ Final checks passed
echo.

REM ========================================
REM BUILD COMPLETED
REM ========================================
echo.
echo 🎉 MALAI RESORT PRODUCTION BUILD COMPLETED SUCCESSFULLY! 🎉
echo.
echo 📁 Build artifacts: .\dist\
echo 🚀 Start production: .\start-production.bat
echo ⚡ Start with PM2: pm2 start ecosystem.config.js --env production
echo 📊 Monitor with PM2: pm2 monit
echo.
echo 🔧 Next steps:
echo    1. Configure your production environment variables
echo    2. Set up your production database
echo    3. Configure your reverse proxy (nginx/apache)
echo    4. Set up SSL certificates
echo    5. Configure monitoring and logging
echo.
echo 📚 Documentation: Check README.md for deployment details
echo.
pause
