@echo off
echo 🔧 Updating Email Configuration to Resend Primary...

REM Create backup of current .env
copy .env .env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%

REM Update email configuration
powershell -Command "(Get-Content .env) -replace 'EMAIL_PRIMARY_PROVIDER=mailersend', 'EMAIL_PRIMARY_PROVIDER=resend' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'EMAIL_FALLBACK_PROVIDER=resend', 'EMAIL_FALLBACK_PROVIDER=mailersend' | Set-Content .env"

echo ✅ Configuration updated!
echo.
echo 📊 New Configuration:
echo   - Primary: Resend (no restrictions)
echo   - Fallback: MailerSend (when approved)
echo   - Auto Failover: Enabled
echo.
echo 🔍 Checking updated values...
powershell -Command "Get-Content .env | Select-String 'EMAIL_PRIMARY_PROVIDER|EMAIL_FALLBACK_PROVIDER|EMAIL_AUTO_FAILOVER'"

pause
