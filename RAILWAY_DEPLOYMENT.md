# 🚀 Railway Deployment Guide - Ready to Deploy!

## ✅ **เตรียมพร้อมแล้ว!**
ไฟล์ทั้งหมดที่จำเป็นสำหรับ Railway deployment ถูกสร้างเสร็จแล้ว:

- [x] `railway.json` - Configuration สำหรับ Railway
- [x] `Dockerfile` - Container setup
- [x] `.dockerignore` - Build optimization  
- [x] `package.json` - อัพเดทแล้วด้วย postinstall script
- [x] Environment variables template

---

## 🎯 **ขั้นตอนใน Railway Dashboard:**

### 1️⃣ **สร้าง Project**
1. ไปที่ https://railway.app
2. คลิก **"Start a New Project"**
3. เลือก **"Deploy from GitHub repo"**
4. เชื่อม GitHub account และเลือก repo นี้

### 2️⃣ **เพิ่ม Database**
1. คลิก **"+ New"** > **"Database"** > **"PostgreSQL"**
2. Railway จะสร้าง DATABASE_URL ให้อัตโนมัติ

### 3️⃣ **ตั้งค่า Environment Variables**
ไปที่ **Variables** tab และเพิ่มตัวแปรเหล่านี้:

```env
NODE_ENV=production
PORT=3001
API_VERSION=v1
JWT_SECRET=hotel-booking-railway-production-jwt-secret-key-2024-secure-32-chars-minimum
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=hotel-booking-railway-refresh-secret-2024-production-32-chars-min
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGINS=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENCRYPTION_KEY=production-32-character-encryption-key-here-secure
SMTP_HOST=smtp.mailersend.net
SMTP_PORT=587
SMTP_USER=MS_w7nYvI@test-nrw7gymv5mog2k8e.mlsender.net
SMTP_PASS=mssp.0qJyEpL.pxkjn41qkk6lz781.sSoIsyi
MAILERSEND_API_TOKEN=mlsn.193f6b4e6f8f026586bd51e642762d9c77a735b4f96c2a3ed2f21b699b96f995
FROM_EMAIL=MS_w7nYvI@test-nrw7gymv5mog2k8e.mlsender.net
FROM_NAME=Malai Resort
SUPPORT_EMAIL=ruuk@malaikhaoyai.com
ADMIN_EMAIL=ruuk@malaikhaoyai.com
BOOKING_CONFIRMATION_TEMPLATE_ID=jpzkmgqqwyvg059v
OMISE_PUBLIC_KEY=pkey_test_64oiiilaiztfl3h9619
OMISE_SECRET_KEY=skey_test_64oiiiloi7mf5nmyxn5
OMISE_WEBHOOK_SECRET=
OMISE_VERIFY_IP=false
LOG_LEVEL=info
LOG_FILE_PATH=/tmp/logs
ADMIN_PASSWORD=noi889988
ADMIN_FIRST_NAME=Ruuk
ADMIN_LAST_NAME=Administrator
```

### 4️⃣ **Configure Build Settings**
ไปที่ **Settings** > **Build**:
- **Root Directory**: `apps/api`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 5️⃣ **Deploy!**
1. คลิก **"Deploy"**
2. รอ build process (3-5 นาที)
3. เมื่อเสร็จจะได้ URL: `https://your-app-name.up.railway.app`

---

## 🧪 **หลังจาก Deploy เสร็จ:**

### ✅ **Test Health Endpoint:**
```bash
curl https://your-app-name.up.railway.app/api/v1/payments/health
```

**Expected Response:**
```json
{
  "service": "payment-verification",
  "status": "healthy",
  "timestamp": "2025-08-11T19:30:00.000Z",
  "version": "1.0.0"
}
```

### 🔗 **Update Omise Webhook:**
```
ไปที่ Omise Dashboard > Webhooks > Update Endpoint:
https://your-app-name.up.railway.app/api/v1/payments/webhooks/omise
```

---

## 🎉 **ผลลัพธ์ที่คาดหวัง:**
- ✅ **Stable HTTPS URL** - ไม่มีปัญหา tunnel อีกต่อไป
- ✅ **24/7 Uptime** - เซิร์ฟเวอร์ทำงานตลอดเวลา
- ✅ **Production Database** - PostgreSQL พร้อมใช้งาน
- ✅ **Secure Environment** - Environment variables ปลอดภัย
- ✅ **Automatic SSL** - HTTPS certificates อัตโนมัติ
- ✅ **No Browser Warnings** - Omise webhook ทำงานได้เต็มที่

---

## 🚨 **Troubleshooting:**
- **Build Fails**: ดู build logs ใน Railway dashboard
- **Database Issues**: ตรวจสอบ DATABASE_URL variable
- **Health Check Fails**: ตรวจสอบ PORT configuration
- **Omise Webhook Issues**: Test endpoint ด้วย curl ก่อน

---

**🚀 พร้อม Deploy แล้ว! ไปที่ https://railway.app เลย!**
