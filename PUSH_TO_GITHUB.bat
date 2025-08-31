@echo off
echo 🚀 Pushing Malai Resort Admin to GitHub...
echo Repository: https://github.com/mongkol09/malai-admin
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed or not in PATH
    echo 💡 Please install Git first: https://git-scm.com/download/windows
    pause
    exit /b 1
)

echo ✅ Git is available
echo.

REM Initialize git if not already done
if not exist .git (
    echo 🔧 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

REM Configure git user (update with your details)
echo 🔧 Configuring Git user...
git config user.name "mongkol09"
git config user.email "your-email@example.com"
echo ✅ Git user configured

REM Add remote origin
echo 🔗 Adding remote repository...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/mongkol09/malai-admin.git
echo ✅ Remote repository added

REM Check .env file security
echo 🔐 Checking .env file security...
if exist "apps\api\.env" (
    echo ⚠️  WARNING: .env file exists!
    echo 🛡️  Ensuring .env is in .gitignore...
    findstr /C:".env" .gitignore >nul
    if errorlevel 1 (
        echo .env >> .gitignore
        echo ✅ Added .env to .gitignore
    ) else (
        echo ✅ .env already in .gitignore
    )
) else (
    echo ✅ No .env file found (safe)
)

REM Check current status
echo 📊 Current repository status:
git status --porcelain | find /c /v "" >nul
if errorlevel 1 (
    echo ✅ Repository is clean
) else (
    echo 📁 Files to commit:
    git status --short
)

echo.
echo 📋 Files that will be added to repository:
echo • Frontend React app (app/admin/)
echo • Backend API (apps/api/)  
echo • Database schemas (database/)
echo • Documentation (README.md)
echo • Configuration files (.gitignore)
echo.
echo ⚠️  Files that will NOT be included (for security):
echo • .env files (database credentials, API keys)
echo • node_modules (dependencies)
echo • logs and temporary files
echo • sensitive configuration
echo.

set /p confirm="Continue with GitHub push? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo ❌ Push cancelled by user
    pause
    exit /b 0
)

echo.
echo 🚀 Starting GitHub push process...

REM Add all files (respecting .gitignore)
echo 📦 Adding files to Git...
git add .
echo ✅ Files added

REM Check if there are changes to commit
git diff --staged --quiet
if errorlevel 1 (
    echo 💾 Committing changes...
    git commit -m "Initial commit: Malai Resort Admin Panel

Features:
- Complete hotel management system
- Dual email service (MailerSend + Resend)  
- Telegram notifications
- Room booking and check-in/out
- Payment integration (Omise, Stripe)
- Role-based admin panel
- Real-time dashboard
- Mobile-responsive design

Tech Stack:
- Backend: Node.js + Express + TypeScript + Prisma
- Frontend: React.js + Bootstrap
- Database: PostgreSQL
- Email: MailerSend + Resend (auto-failover)
- Notifications: Telegram Bot API

Security:
- JWT authentication
- Bcrypt password hashing
- Rate limiting
- CORS protection
- Environment variables secured"

    echo ✅ Changes committed
) else (
    echo ✅ No changes to commit (repository up to date)
)

REM Push to GitHub
echo 🌐 Pushing to GitHub...
echo 📡 Repository: https://github.com/mongkol09/malai-admin

git push -u origin main
if errorlevel 1 (
    echo ⚠️  Main branch push failed, trying 'master'...
    git push -u origin master
    if errorlevel 1 (
        echo ❌ Push failed! Possible causes:
        echo • Repository doesn't exist on GitHub
        echo • No write access to repository  
        echo • Network/authentication issues
        echo.
        echo 💡 Manual steps:
        echo 1. Create repository at: https://github.com/mongkol09/malai-admin
        echo 2. Ensure you have write access
        echo 3. Check your GitHub authentication
        echo.
        echo 🔧 Alternative push command:
        echo git push -u origin main --force
        pause
        exit /b 1
    )
)

echo.
echo 🎉 SUCCESS! Project pushed to GitHub!
echo.
echo 📁 Repository URL: https://github.com/mongkol09/malai-admin
echo 🌐 GitHub Page: https://github.com/mongkol09/malai-admin
echo.
echo 📋 What was uploaded:
echo • ✅ Complete hotel management system
echo • ✅ Admin panel (React frontend)
echo • ✅ API backend (Node.js + TypeScript)
echo • ✅ Database schemas (Prisma)
echo • ✅ Documentation (README.md)
echo • ✅ Deployment configurations
echo.
echo 🔐 What was NOT uploaded (for security):
echo • ❌ .env files (credentials secured)
echo • ❌ node_modules (dependencies)
echo • ❌ sensitive data
echo.
echo 🚀 Next steps:
echo 1. 🌐 Visit: https://github.com/mongkol09/malai-admin
echo 2. 📝 Update README if needed
echo 3. 🏷️  Create releases/tags
echo 4. 🔧 Setup CI/CD if desired
echo 5. 📧 Configure deployment

pause
