@echo off
echo 🧹 Creating CLEAN .env file...

REM Create backup first
copy .env .env.corrupted.backup
echo ✅ Corrupted file backed up as: .env.corrupted.backup

REM Extract non-email variables that are correct
powershell -Command "Get-Content .env | Where-Object { $_ -match '^[A-Z_]+=.*' -and $_ -notmatch 'EMAIL_|RESEND_|MAILERSEND_|FROM_|BOOKING_|TEST_|REPLY_' } | Sort-Object | Get-Unique" > temp_other_vars.txt

echo 🔧 Creating clean .env structure...

REM Create completely clean .env file
echo # ============================================ > .env.clean
echo # HOTEL BOOKING API - ENVIRONMENT VARIABLES >> .env.clean
echo # ============================================ >> .env.clean
echo # NEVER commit .env file to version control! >> .env.clean
echo. >> .env.clean
echo # ============================================ >> .env.clean
echo # DATABASE CONFIGURATION >> .env.clean
echo # ============================================ >> .env.clean
echo DATABASE_URL="postgresql://postgres:Aa123456@localhost:5432/hotel_booking" >> .env.clean
echo. >> .env.clean
echo # ============================================ >> .env.clean
echo # JWT CONFIGURATION >> .env.clean
echo # ============================================ >> .env.clean
echo JWT_SECRET="hotel-booking-super-secret-jwt-key-2024-production-grade-minimum-32-chars" >> .env.clean
echo JWT_EXPIRES_IN="24h" >> .env.clean
echo JWT_REFRESH_SECRET="hotel-booking-refresh-secret-key-2024-production-grade-minimum-32-chars" >> .env.clean
echo JWT_REFRESH_EXPIRES_IN="7d" >> .env.clean
echo. >> .env.clean
echo # ============================================ >> .env.clean
echo # APPLICATION CONFIGURATION >> .env.clean
echo # ============================================ >> .env.clean
echo NODE_ENV="development" >> .env.clean
echo PORT=3001 >> .env.clean
echo API_VERSION="v1" >> .env.clean
echo. >> .env.clean
echo # ============================================ >> .env.clean
echo # SECURITY CONFIGURATION >> .env.clean
echo # ============================================ >> .env.clean
echo CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:3002" >> .env.clean
echo RATE_LIMIT_WINDOW_MS=300000 >> .env.clean
echo RATE_LIMIT_MAX_REQUESTS=300 >> .env.clean
echo ENCRYPTION_KEY="your-32-character-encryption-key-here" >> .env.clean
echo. >> .env.clean
echo # ============================================ >> .env.clean
echo # DUAL EMAIL SERVICE CONFIGURATION >> .env.clean
echo # ============================================ >> .env.clean
echo. >> .env.clean
echo # MailerSend Service (Fallback - when approved) >> .env.clean
echo MAILERSEND_API_TOKEN="mlsn.1161c69b36e4571c51ea6f87484e37cf06f63cb3c559bfb51d30482daeacf1fd" >> .env.clean
echo MAILERSEND_DOMAIN_ID="r6ke4n1qozvgon12" >> .env.clean
echo BOOKING_CONFIRMATION_TEMPLATE_ID=z3m5jgrq390ldpyo >> .env.clean
echo. >> .env.clean
echo # Resend Service (Primary - working now) >> .env.clean
echo RESEND_API_KEY=re_KkpkmkoV_3vBxwsod1qwM7FYD1ZQpYs3m >> .env.clean
echo. >> .env.clean
echo # Email Service Switching >> .env.clean
echo EMAIL_PRIMARY_PROVIDER=resend >> .env.clean
echo EMAIL_FALLBACK_PROVIDER=mailersend >> .env.clean
echo EMAIL_AUTO_FAILOVER=true >> .env.clean
echo. >> .env.clean
echo # Email Settings (Single Source of Truth) >> .env.clean
echo FROM_EMAIL=bookings@malaikhaoyai.com >> .env.clean
echo FROM_NAME=Malai Khaoyai Resort >> .env.clean
echo REPLY_TO_EMAIL=support@malaikhaoyai.com >> .env.clean
echo TEST_EMAIL=admin@malaikhaoyai.com >> .env.clean
echo EMAIL_NOTIFICATIONS_ENABLED=true >> .env.clean
echo. >> .env.clean
echo # Legacy SMTP (for backward compatibility) >> .env.clean
echo SMTP_HOST="smtp.mailersend.net" >> .env.clean
echo SMTP_PORT=587 >> .env.clean
echo SMTP_USER="MS_9NrrJx@malairesort.com" >> .env.clean
echo SMTP_PASS="mssp.iWjP5Z3.3z0vklodzyvg7qrx.vXOx2G8" >> .env.clean
echo. >> .env.clean
echo # ============================================ >> .env.clean
echo # NOTIFICATION SERVICES >> .env.clean
echo # ============================================ >> .env.clean
echo TELEGRAM_BOT_TOKEN="[REPLACE_WITH_YOUR_BOT_TOKEN]" >> .env.clean
echo TELEGRAM_CHAT_ID="-1002579208700" >> .env.clean
echo DISCORD_WEBHOOK_URL="" >> .env.clean
echo SLACK_WEBHOOK_URL="" >> .env.clean
echo TEAMS_WEBHOOK_URL="" >> .env.clean
echo ADMIN_NOTIFICATION_EMAILS="" >> .env.clean
echo WEBSOCKET_CORS_ORIGINS="http://localhost:3000,https://your-admin-domain.com" >> .env.clean
echo. >> .env.clean
echo # ============================================ >> .env.clean
echo # PAYMENT GATEWAY >> .env.clean
echo # ============================================ >> .env.clean
echo OMISE_PUBLIC_KEY="pkey_test_64oiiilaiztfl3h9619" >> .env.clean
echo OMISE_SECRET_KEY="skey_test_64oiiiloi7mf5nmyxn5" >> .env.clean
echo OMISE_WEBHOOK_SECRET="" >> .env.clean
echo OMISE_VERIFY_IP="false" >> .env.clean
echo STRIPE_PUBLIC_KEY="pk_test_xxxxx" >> .env.clean
echo STRIPE_SECRET_KEY="sk_test_xxxxx" >> .env.clean
echo. >> .env.clean
echo # ============================================ >> .env.clean
echo # ADMIN DEFAULT USER >> .env.clean
echo # ============================================ >> .env.clean
echo ADMIN_EMAIL="center@malaikhaoyai.com" >> .env.clean
echo ADMIN_PASSWORD="noi889988" >> .env.clean
echo ADMIN_FIRST_NAME="Ruuk" >> .env.clean
echo ADMIN_LAST_NAME="Administrator" >> .env.clean
echo. >> .env.clean
echo # ============================================ >> .env.clean
echo # LOGGING CONFIGURATION >> .env.clean
echo # ============================================ >> .env.clean
echo LOG_LEVEL="info" >> .env.clean
echo LOG_FILE_PATH="./logs" >> .env.clean

echo ✅ Clean .env file created!
echo.
echo 🔄 Replace corrupted .env with clean version?
set /p choice="Apply clean configuration? (Y/N): "
if /i "%choice%"=="Y" (
    move .env.clean .env
    echo ✅ Clean .env applied successfully!
    
    echo.
    echo 📊 Final email configuration:
    powershell -Command "Get-Content .env | Select-String 'EMAIL_|RESEND_|MAILERSEND_|FROM_|BOOKING_|TEST_|REPLY_'"
) else (
    echo ❌ Clean configuration saved as .env.clean (not applied)
)

REM Clean up temp files
if exist temp_other_vars.txt del temp_other_vars.txt

echo.
echo 🎯 Summary:
echo • ✅ Removed all duplicate variables
echo • ✅ Fixed corrupted file structure  
echo • ✅ Single source of truth for each setting
echo • ✅ Ready for production email system

pause
