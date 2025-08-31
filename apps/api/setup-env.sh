#!/bin/bash

# 🚀 Quick Setup Script - Missing Environment Variables
# สำหรับเพิ่ม Environment Variables ที่ยังขาดหายไป

echo "🏨 Malai Khaoyai Resort - Environment Setup"
echo "=============================================="
echo ""

# Function to check if variable exists
check_env_var() {
    if grep -q "^$1=" .env 2>/dev/null; then
        echo "✅ $1 already exists"
        return 0
    else
        echo "❌ $1 missing"
        return 1
    fi
}

# Function to add environment variable
add_env_var() {
    local var_name="$1"
    local var_value="$2"
    local description="$3"
    
    if ! check_env_var "$var_name"; then
        echo "$var_name=$var_value" >> .env
        echo "✅ Added $var_name - $description"
    fi
}

echo "📧 CHECKING EMAIL TEMPLATE IDs..."
echo "================================"

# Email Template IDs
add_env_var "BOOKING_CONFIRMATION_TEMPLATE_ID" "" "MailerSend template ID for booking confirmation"
add_env_var "PAYMENT_RECEIPT_TEMPLATE_ID" "" "MailerSend template ID for payment receipt"
add_env_var "CHECKIN_REMINDER_TEMPLATE_ID" "" "MailerSend template ID for check-in reminder"
add_env_var "CHECKOUT_REMINDER_TEMPLATE_ID" "" "MailerSend template ID for check-out reminder"

echo ""
echo "🔐 CHECKING WEBHOOK SECURITY..."
echo "==============================="

# Webhook Security
add_env_var "OMISE_WEBHOOK_SECRET" "" "Omise webhook secret for payment verification"

echo ""
echo "🗓️ CHECKING EXTERNAL APIS..."
echo "============================="

# Google Calendar & External APIs
add_env_var "GOOGLE_CALENDAR_API_KEY" "" "Google Calendar API key for event aggregation"
add_env_var "GOOGLE_CALENDAR_ID" "bangkok-events@gmail.com" "Google Calendar ID for Bangkok events"
add_env_var "TICKETMASTER_API_KEY" "" "Ticketmaster API key for event data"
add_env_var "EVENTBRITE_API_KEY" "" "Eventbrite API key for event data"
add_env_var "FACEBOOK_EVENTS_TOKEN" "" "Facebook API token for event data"

echo ""
echo "🔔 CHECKING NOTIFICATION WEBHOOKS..."
echo "====================================="

# Check notification webhooks (may have test values)
if ! grep -q "^DISCORD_WEBHOOK_URL=" .env 2>/dev/null; then
    add_env_var "DISCORD_WEBHOOK_URL" "" "Discord webhook URL for admin notifications"
fi

if ! grep -q "^SLACK_WEBHOOK_URL=" .env 2>/dev/null; then
    add_env_var "SLACK_WEBHOOK_URL" "" "Slack webhook URL for admin notifications"
fi

if ! grep -q "^TEAMS_WEBHOOK_URL=" .env 2>/dev/null; then
    add_env_var "TEAMS_WEBHOOK_URL" "" "Microsoft Teams webhook URL for admin notifications"
fi

echo ""
echo "🏨 CHECKING HOTEL INFORMATION..."
echo "==============================="

# Hotel Information
add_env_var "HOTEL_PHONE" "-" "Hotel phone number"
add_env_var "HOTEL_ADDRESS" "17/88 หมู่ที่ 1 ต.บางรักน้อย อ.เมืองนนทบุรี จ.นนทบุรี 11000" "Hotel address"
add_env_var "HOTEL_WEBSITE" "https://malaikhaoyai.com" "Hotel website URL"

echo ""
echo "📊 SUMMARY"
echo "=========="

# Count missing variables
missing_count=0
total_count=0

echo ""
echo "🔴 CRITICAL MISSING (need immediate attention):"
for var in "BOOKING_CONFIRMATION_TEMPLATE_ID" "PAYMENT_RECEIPT_TEMPLATE_ID" "CHECKIN_REMINDER_TEMPLATE_ID" "CHECKOUT_REMINDER_TEMPLATE_ID" "OMISE_WEBHOOK_SECRET"; do
    total_count=$((total_count + 1))
    if ! check_env_var "$var" > /dev/null; then
        missing_count=$((missing_count + 1))
        echo "  ❌ $var"
    fi
done

echo ""
echo "🟡 OPTIONAL MISSING (can be added later):"
for var in "GOOGLE_CALENDAR_API_KEY" "TICKETMASTER_API_KEY" "EVENTBRITE_API_KEY" "FACEBOOK_EVENTS_TOKEN"; do
    if ! check_env_var "$var" > /dev/null; then
        echo "  ⚠️ $var"
    fi
done

echo ""
echo "📈 NEXT STEPS:"
echo "=============="
echo ""
echo "1. 📧 SET UP EMAIL TEMPLATES:"
echo "   - Go to MailerSend Dashboard → Templates"
echo "   - Create 4 templates using HTML from /src/templates/"
echo "   - Copy Template IDs to .env file"
echo ""
echo "2. 🔐 SET UP WEBHOOK SECURITY:"
echo "   - Go to Omise Dashboard → Webhooks"
echo "   - Generate webhook secret"
echo "   - Add OMISE_WEBHOOK_SECRET to .env"
echo ""
echo "3. 🗓️ SET UP EXTERNAL APIS (optional):"
echo "   - Get Google Calendar API key from Google Cloud Console"
echo "   - Get Ticketmaster API key from developer portal"
echo "   - Add API keys to .env"
echo ""
echo "4. 🧪 TEST EVERYTHING:"
echo "   - Run: npm start"
echo "   - Test email sending"
echo "   - Test payment webhooks"
echo "   - Test analytics endpoints"
echo ""

if [ $missing_count -gt 0 ]; then
    echo "❗ $missing_count critical environment variables are missing!"
    echo "🔗 See TEMPLATE_SETUP_GUIDE.md for detailed instructions"
    exit 1
else
    echo "✅ All critical environment variables are present!"
    exit 0
fi
