@echo off
echo 🔧 Adding missing environment variables for Dual Email Service...

REM Add missing variables to .env
echo. >> .env
echo # ============================================ >> .env
echo # DUAL EMAIL SERVICE CONFIGURATION >> .env
echo # ============================================ >> .env
echo BOOKING_CONFIRMATION_TEMPLATE_ID=z3m5jgrq390ldpyo >> .env
echo TEST_EMAIL=admin@malaikhaoyai.com >> .env
echo REPLY_TO_EMAIL=support@malaikhaoyai.com >> .env
echo. >> .env
echo # Email service switching >> .env
echo EMAIL_NOTIFICATIONS_ENABLED=true >> .env
echo. >> .env

echo ✅ Missing variables added!
echo.
echo 📊 Complete Email Configuration:
powershell -Command "Get-Content .env | Select-String 'EMAIL_|RESEND_|MAILERSEND_|FROM_|BOOKING_|TEST_|REPLY_'"
echo.
echo 🎯 Current Setup:
echo   - Primary: Resend (working immediately)
echo   - Fallback: MailerSend (when approved)
echo   - Template: z3m5jgrq390ldpyo
echo   - Domain: malaikhaoyai.com

pause
