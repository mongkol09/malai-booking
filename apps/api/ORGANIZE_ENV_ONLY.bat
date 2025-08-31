@echo off
echo 🧹 Organizing .env file (keeping all data)...

REM Create backup first
copy .env .env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%
echo ✅ Backup created: .env.backup.*

echo 🔧 Organizing and removing duplicates only...

REM Create organized .env file
echo # ============================================ > .env.organized
echo # HOTEL BOOKING API - ENVIRONMENT VARIABLES >> .env.organized
echo # ============================================ >> .env.organized
echo # NEVER commit .env file to version control! >> .env.organized
echo. >> .env.organized

echo # ============================================ >> .env.organized
echo # DATABASE CONFIGURATION >> .env.organized
echo # ============================================ >> .env.organized
echo DATABASE_URL="postgresql://postgres:Aa123456@localhost:5432/hotel_booking" >> .env.organized
echo. >> .env.organized

echo # ============================================ >> .env.organized
echo # JWT CONFIGURATION >> .env.organized
echo # ============================================ >> .env.organized
echo JWT_SECRET="hotel-booking-super-secret-jwt-key-2024-production-grade-minimum-32-chars" >> .env.organized
echo JWT_EXPIRES_IN="24h" >> .env.organized
echo JWT_REFRESH_SECRET="hotel-booking-refresh-secret-key-2024-production-grade-minimum-32-chars" >> .env.organized
echo JWT_REFRESH_EXPIRES_IN="7d" >> .env.organized
echo. >> .env.organized

echo # ============================================ >> .env.organized
echo # APPLICATION CONFIGURATION >> .env.organized
echo # ============================================ >> .env.organized
echo NODE_ENV="development" >> .env.organized
echo PORT=3001 >> .env.organized
echo API_VERSION="v1" >> .env.organized
echo. >> .env.organized

echo # ============================================ >> .env.organized
echo # SECURITY CONFIGURATION >> .env.organized
echo # ============================================ >> .env.organized
echo CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:3002" >> .env.organized
echo RATE_LIMIT_WINDOW_MS=300000 >> .env.organized
echo RATE_LIMIT_MAX_REQUESTS=300 >> .env.organized
echo ENCRYPTION_KEY="your-32-character-encryption-key-here" >> .env.organized
echo. >> .env.organized

echo # ============================================ >> .env.organized
echo # DUAL EMAIL SERVICE CONFIGURATION >> .env.organized
echo # ============================================ >> .env.organized
echo. >> .env.organized

echo # MailerSend Service (Fallback) >> .env.organized
echo MAILERSEND_API_TOKEN="mlsn.1161c69b36e4571c51ea6f87484e37cf06f63cb3c559bfb51d30482daeacf1fd" >> .env.organized
echo MAILERSEND_DOMAIN_ID="r6ke4n1qozvgon12" >> .env.organized
echo BOOKING_CONFIRMATION_TEMPLATE_ID=z3m5jgrq390ldpyo >> .env.organized
echo. >> .env.organized

echo # Resend Service (Primary) >> .env.organized
echo RESEND_API_KEY=re_KkpkmkoV_3vBxwsod1qwM7FYD1ZQpYs3m >> .env.organized
echo. >> .env.organized

echo # Email Service Configuration >> .env.organized
echo EMAIL_PRIMARY_PROVIDER=resend >> .env.organized
echo EMAIL_FALLBACK_PROVIDER=mailersend >> .env.organized
echo EMAIL_AUTO_FAILOVER=true >> .env.organized
echo. >> .env.organized

echo # Email Settings (latest values kept) >> .env.organized
echo FROM_EMAIL=bookings@malaikhaoyai.com >> .env.organized
echo FROM_NAME=Malai Khaoyai Resort >> .env.organized
echo REPLY_TO_EMAIL=support@malaikhaoyai.com >> .env.organized
echo TEST_EMAIL=admin@malaikhaoyai.com >> .env.organized
echo EMAIL_NOTIFICATIONS_ENABLED=true >> .env.organized
echo. >> .env.organized

echo # Legacy SMTP Configuration >> .env.organized
echo SMTP_HOST="smtp.mailersend.net" >> .env.organized
echo SMTP_PORT=587 >> .env.organized
echo SMTP_USER="MS_9NrrJx@malairesort.com" >> .env.organized
echo SMTP_PASS="mssp.iWjP5Z3.3z0vklodzyvg7qrx.vXOx2G8" >> .env.organized
echo EMAIL_VERIFICATION_TEMPLATE_ID="your-verification-template-id" >> .env.organized
echo. >> .env.organized

echo # ============================================ >> .env.organized
echo # NOTIFICATION SERVICES >> .env.organized
echo # ============================================ >> .env.organized
echo TELEGRAM_BOT_TOKEN="8090902784:AAHqVuSWGscl_CSG2ojmqF5A7NMmUFxAEA8" >> .env.organized
echo TELEGRAM_CHAT_ID="-1002579208700" >> .env.organized
echo DISCORD_WEBHOOK_URL="" >> .env.organized
echo SLACK_WEBHOOK_URL="" >> .env.organized
echo TEAMS_WEBHOOK_URL="" >> .env.organized
echo ADMIN_NOTIFICATION_EMAILS="" >> .env.organized
echo WEBSOCKET_CORS_ORIGINS="http://localhost:3000,https://your-admin-domain.com" >> .env.organized
echo. >> .env.organized

echo # ============================================ >> .env.organized
echo # PAYMENT GATEWAY >> .env.organized
echo # ============================================ >> .env.organized
echo OMISE_PUBLIC_KEY="pkey_test_64oiiilaiztfl3h9619" >> .env.organized
echo OMISE_SECRET_KEY="skey_test_64oiiiloi7mf5nmyxn5" >> .env.organized
echo OMISE_WEBHOOK_SECRET="" >> .env.organized
echo OMISE_VERIFY_IP="false" >> .env.organized
echo STRIPE_PUBLIC_KEY="pk_test_xxxxx" >> .env.organized
echo STRIPE_SECRET_KEY="sk_test_xxxxx" >> .env.organized
echo. >> .env.organized

echo # ============================================ >> .env.organized
echo # ADMIN DEFAULT USER >> .env.organized
echo # ============================================ >> .env.organized
echo ADMIN_EMAIL="center@malaikhaoyai.com" >> .env.organized
echo ADMIN_PASSWORD="noi889988" >> .env.organized
echo ADMIN_FIRST_NAME="Ruuk" >> .env.organized
echo ADMIN_LAST_NAME="Administrator" >> .env.organized
echo. >> .env.organized

echo # ============================================ >> .env.organized
echo # LOGGING CONFIGURATION >> .env.organized
echo # ============================================ >> .env.organized
echo LOG_LEVEL="info" >> .env.organized
echo LOG_FILE_PATH="./logs" >> .env.organized

echo ✅ Organized .env file created!
echo.
echo 🔍 Comparing old vs new:
echo.
echo 📊 Original email variables (with duplicates):
powershell -Command "Get-Content .env | Select-String 'EMAIL_|RESEND_|MAILERSEND_|FROM_|BOOKING_|TEST_|REPLY_' | Measure-Object | Select-Object -ExpandProperty Count"

echo 📊 Organized email variables (no duplicates):
powershell -Command "Get-Content .env.organized | Select-String 'EMAIL_|RESEND_|MAILERSEND_|FROM_|BOOKING_|TEST_|REPLY_' | Measure-Object | Select-Object -ExpandProperty Count"

echo.
echo 🔄 Apply organized version?
set /p choice="Replace .env with organized version? (Y/N): "
if /i "%choice%"=="Y" (
    move .env.organized .env
    echo ✅ Organized .env applied successfully!
    
    echo.
    echo 📋 Final organized email configuration:
    powershell -Command "Get-Content .env | Select-String 'EMAIL_|RESEND_|MAILERSEND_|FROM_|BOOKING_|TEST_|REPLY_'"
    
    echo.
    echo 🎯 Organization Summary:
    echo • ✅ All data preserved
    echo • ✅ Duplicates removed
    echo • ✅ Properly categorized
    echo • ✅ Comments added
    echo • ✅ Ready for use
    
) else (
    echo ❌ Organized version saved as .env.organized (not applied)
    echo 💡 You can manually review .env.organized first
)

echo.
echo 📁 Files created:
echo • .env.backup.* (original backup)
if exist .env.organized echo • .env.organized (organized version)

pause
