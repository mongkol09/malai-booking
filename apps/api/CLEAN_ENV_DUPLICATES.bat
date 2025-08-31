@echo off
echo 🧹 Cleaning duplicate environment variables...

REM Create backup first
copy .env .env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%
echo ✅ Backup created: .env.backup.*

REM Create clean email section
echo # ============================================ > temp_email_config.txt
echo # CLEAN EMAIL SERVICE CONFIGURATION >> temp_email_config.txt
echo # ============================================ >> temp_email_config.txt
echo. >> temp_email_config.txt
echo # MailerSend Service (Fallback) >> temp_email_config.txt
echo MAILERSEND_API_TOKEN="mlsn.1161c69b36e4571c51ea6f87484e37cf06f63cb3c559bfb51d30482daeacf1fd" >> temp_email_config.txt
echo MAILERSEND_DOMAIN_ID="r6ke4n1qozvgon12" >> temp_email_config.txt
echo BOOKING_CONFIRMATION_TEMPLATE_ID=z3m5jgrq390ldpyo >> temp_email_config.txt
echo. >> temp_email_config.txt
echo # Resend Service (Primary) >> temp_email_config.txt
echo RESEND_API_KEY=re_KkpkmkoV_3vBxwsod1qwM7FYD1ZQpYs3m >> temp_email_config.txt
echo. >> temp_email_config.txt
echo # Dual Email Service Configuration >> temp_email_config.txt
echo EMAIL_PRIMARY_PROVIDER=resend >> temp_email_config.txt
echo EMAIL_FALLBACK_PROVIDER=mailersend >> temp_email_config.txt
echo EMAIL_AUTO_FAILOVER=true >> temp_email_config.txt
echo. >> temp_email_config.txt
echo # Email Settings >> temp_email_config.txt
echo FROM_EMAIL=bookings@malaikhaoyai.com >> temp_email_config.txt
echo FROM_NAME=Malai Khaoyai Resort >> temp_email_config.txt
echo REPLY_TO_EMAIL=support@malaikhaoyai.com >> temp_email_config.txt
echo TEST_EMAIL=admin@malaikhaoyai.com >> temp_email_config.txt
echo EMAIL_NOTIFICATIONS_ENABLED=true >> temp_email_config.txt
echo. >> temp_email_config.txt

echo 📋 Clean email configuration created!
echo.
echo 🔍 Preview of clean configuration:
type temp_email_config.txt
echo.
echo ⚠️  This will replace your email configuration.
echo ✅ Your .env backup is saved as .env.backup.*
echo.
set /p choice="Do you want to apply this clean configuration? (Y/N): "
if /i "%choice%"=="Y" (
    echo 🔄 Applying clean configuration...
    
    REM Remove all email-related lines from current .env
    powershell -Command "(Get-Content .env) | Where-Object { $_ -notmatch 'EMAIL_|RESEND_|MAILERSEND_|FROM_|BOOKING_|TEST_|REPLY_' } | Set-Content temp_other_config.txt"
    
    REM Combine non-email config with clean email config
    copy temp_other_config.txt + temp_email_config.txt .env
    
    echo ✅ Clean configuration applied!
    echo 🗑️  Removed duplicates and organized sections
    
    REM Clean up temp files
    del temp_email_config.txt
    del temp_other_config.txt
    
    echo.
    echo 📊 Final email configuration:
    powershell -Command "Get-Content .env | Select-String 'EMAIL_|RESEND_|MAILERSEND_|FROM_|BOOKING_|TEST_|REPLY_'"
    
) else (
    echo ❌ Configuration not applied
    del temp_email_config.txt
)

pause
