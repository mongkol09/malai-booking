# 🔧 Complete .env Configuration

## 📋 **ตัวแปรที่คุณมีอยู่แล้ว (ถูกต้อง):**
```env
MAILERSEND_API_TOKEN="mlsn.1161c69b36e4571c51ea6f87484e37cf06f63cb3c559bfb51d30482daeacf1fd"
MAILERSEND_DOMAIN_ID="r6ke4n1qozvgon12"
RESEND_API_KEY=re_KkpkmkoV_3vBxwsod1qwM7FYD1ZQpYs3m
FROM_EMAIL=bookings@malaikhaoyai.com
FROM_NAME=Malai Khaoyai Resort
EMAIL_PRIMARY_PROVIDER=resend
EMAIL_FALLBACK_PROVIDER=mailersend
EMAIL_AUTO_FAILOVER=true
```

## ❗ **ตัวแปรที่ต้องเพิ่ม:**
```env
# MailerSend Template ID (ที่คุณมีอยู่แล้ว)
BOOKING_CONFIRMATION_TEMPLATE_ID=z3m5jgrq390ldpyo

# Email addresses for testing and replies
TEST_EMAIL=admin@malaikhaoyai.com
REPLY_TO_EMAIL=support@malaikhaoyai.com

# Enable email notifications
EMAIL_NOTIFICATIONS_ENABLED=true
```

## 🔧 **ปัญหาที่เห็น:**
1. มี `FROM_EMAIL` ซ้ำ 2 ตัว (บรรทัด 3 และ 8)
2. มี `FROM_NAME` ซ้ำ 2 ตัว (บรรทัด 4 และ 9)
3. ขาด `BOOKING_CONFIRMATION_TEMPLATE_ID`

## ✅ **การแก้ไขที่แนะนำ:**

### **ลบตัวซ้ำ:**
```env
# ลบบรรทัดเหล่านี้ (เก่า)
FROM_EMAIL="noreply@malairesort.com"
FROM_NAME="Malai Resort"
EMAIL_VERIFICATION_TEMPLATE_ID="your-verification-template-id"
EMAIL_NOTIFICATIONS_ENABLED="false"
```

### **เก็บแค่ตัวใหม่:**
```env
FROM_EMAIL=bookings@malaikhaoyai.com
FROM_NAME=Malai Khaoyai Resort
EMAIL_NOTIFICATIONS_ENABLED=true
```

## 🎯 **Final .env ที่สมบูรณ์:**
```env
# ============================================
# EMAIL SERVICE CONFIGURATION
# ============================================

# MailerSend (fallback service)
MAILERSEND_API_TOKEN="mlsn.1161c69b36e4571c51ea6f87484e37cf06f63cb3c559bfb51d30482daeacf1fd"
MAILERSEND_DOMAIN_ID="r6ke4n1qozvgon12"
BOOKING_CONFIRMATION_TEMPLATE_ID=z3m5jgrq390ldpyo

# Resend (primary service)
RESEND_API_KEY=re_KkpkmkoV_3vBxwsod1qwM7FYD1ZQpYs3m

# Dual Email Service Configuration
EMAIL_PRIMARY_PROVIDER=resend
EMAIL_FALLBACK_PROVIDER=mailersend
EMAIL_AUTO_FAILOVER=true

# Email Settings
FROM_EMAIL=bookings@malaikhaoyai.com
FROM_NAME=Malai Khaoyai Resort
REPLY_TO_EMAIL=support@malaikhaoyai.com
TEST_EMAIL=admin@malaikhaoyai.com

# Enable email notifications
EMAIL_NOTIFICATIONS_ENABLED=true
```

## 🚀 **สถานะปัจจุบัน:**
- ✅ Resend เป็น primary (ใช้ได้ทันที)
- ✅ MailerSend เป็น fallback (พร้อม template)
- ✅ Auto failover เปิดใช้งาน
- ✅ Domain verified ทั้งคู่
