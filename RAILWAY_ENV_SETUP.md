# � Railway Environment Variables Setup Guide - Complete

## � ขั้นตอนการตั้งค่า Environment Variables ใน Railway

### 1. เข้าสู่ Railway Dashboard  
- เข้า [railway.app](https://railway.app)
- เลือก project **malai-booking**
- เลือก service **backend/api**

### 2. ไปที่ Variables Tab
- คลิก **Variables** ใน sidebar 
- เริ่มเพิ่ม environment variables ตามรายการด้านล่าง

---

## 🔑 **CRITICAL VARIABLES** (ต้องตั้งก่อน)

### Database Configuration
```bash
DATABASE_URL=postgresql://postgres:your_password@your_host:port/railway
NODE_ENV=production
PORT=3001
```

### JWT Security
```bash
JWT_SECRET=b72bc72cf65eeffb918b25e5664c4bc342cf405b620b52bd1112618b85eb7343e1d6fb36ed8546d222002d3efa300cd9ea0cee5d913d7c5517325ce309cf8c46
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=848c94eef6d8fd619a8b12ee7ed04d6f5280b271effd15e1a8057f3b4bd7574cea37b7ca6b51797dc3f193ffb79451ddafc72d9466b50ead3c985696034d50e4
JWT_REFRESH_EXPIRES_IN=7d
```

### Security Configuration
```bash
ALLOW_DEV_BYPASS=false
ENCRYPTION_KEY=2173d0fbb40a48b5a1e39f3fb4a0c4efe3686f4ce5b3e50fb0cf91ba44f4292f
CORS_ORIGINS=https://your-frontend-domain.railway.app,https://malai-resort.com
```

---

## 📧 **EMAIL CONFIGURATION** (สำคัญ)

### MailerSend (Primary)
```bash
EMAIL_PRIMARY_PROVIDER=mailersend
MAILERSEND_API_TOKEN=mlsn.ee4ef76c01536d6e7dfb54cb3fc7bb7e8ee236b77b91434b75d77884e4604e0d
MAILERSEND_SMTP_HOST=smtp.mailersend.net
MAILERSEND_SMTP_PORT=587
MAILERSEND_SMTP_USER=MS_9NrrJx@malairesort.com
MAILERSEND_SMTP_PASS=mssp.iWjP5Z3.3z0vklodzyvg7qrx.vXOx2G8
FROM_EMAIL=noreply@malairesort.com
FROM_NAME=Malai Resort Khaoyai
SUPPORT_EMAIL=center@malaikhaoyai.com
ADMIN_EMAIL=center@malaikhaoyai.com
```

---

## 🔔 **TELEGRAM BOTS** (ต้องใช้ real tokens)

### CEO Bot
```bash
TELEGRAM_BOT_TOKEN=YOUR_REAL_CEO_BOT_TOKEN  
TELEGRAM_CHAT_ID=-1002579208700
TELEGRAM_ADMIN_CHAT_ID=-1002579208700
```

### Staff Bot
```bash
STAFF_TELEGRAM_BOT_TOKEN=YOUR_REAL_STAFF_BOT_TOKEN
STAFF_TELEGRAM_CHAT_ID=-1002926114573
```

**⚠️ หมายเหตุ**: ต้องแทนที่ `YOUR_REAL_*_TOKEN` ด้วย token จริงจาก @BotFather

---

## 💳 **PAYMENT GATEWAY** (Omise)

```bash
OMISE_PUBLIC_KEY=pkey_test_64oiiilaiztfl3h9619
OMISE_SECRET_KEY=skey_test_64oiiiloi7mf5nmyxn5  
OMISE_WEBHOOK_SECRET=malai-resort-omise-webhook-secret-2024
OMISE_VERIFY_IP=false
```

---

## 🔐 **API KEYS** (สำคัญมาก)

```bash
API_KEY=hbk_prod_2024_ultra_secure_dd9c2f1c643e55a80b50c0985a7ccb058b2388e4f6cdce6d150065d1c0c54f1f
ADMIN_API_KEY=hbk_admin_2024_ultra_secure_4a94def33f3c8131deb140f721809baf8e23ce23e020b104290f06ace6a2c8c7
API_KEY_INTERNAL=mhr_internal_4a66513109a3a4880ebcb69a6ba1cf149738babdaf8a1ff54fe890fc807e9d4a
API_KEY_ANALYTICS=mhr_analytics_09f513597f113b318e770d9cc378232d01c154e4c9959c8a035b5be304b2ff9a
API_KEY_ADMIN=mhr_admin_1cbce72c45bd831c266003feaf575e5eded84cb24a5250ae1aa388d41bd6e786
```

---

## 👤 **ADMIN USER** (Initial Setup)

```bash
ADMIN_EMAIL=center@malaikhaoyai.com
ADMIN_PASSWORD=noi889988
ADMIN_FIRST_NAME=Ruuk
ADMIN_LAST_NAME=Administrator
```

---

## 🛠️ **APPLICATION SETTINGS**

### Basic Settings
```bash
API_VERSION=v1
APP_NAME=Malai Resort
APP_VERSION=V1.0.0
```

### Feature Flags
```bash
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_TELEGRAM_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
ENABLE_ANALYTICS=true
ENABLE_REGISTRATION=false
ENABLE_MAINTENANCE_MODE=false
ENABLE_DEBUG_MODE=false
ENABLE_TEST_ENDPOINTS=false
ENABLE_BACKUP=true
```

### Rate Limiting
```bash
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Logging Configuration
```bash
LOG_LEVEL=info
LOG_FILE_PATH=./logs
ENABLE_REQUEST_LOGGING=true
ENABLE_ERROR_LOGGING=true
ENABLE_PERFORMANCE_LOGGING=true
```

### Room Management
```bash
DEFAULT_ROOM_STATUS=Available
DEFAULT_HOUSEKEEPING_STATUS=Clean
ENABLE_AUTO_ROOM_STATUS_UPDATE=true
ENABLE_AUTO_HOUSEKEEPING_UPDATE=true
```

### Booking System
```bash
BOOKING_CONFIRMATION_DELAY_MS=5000
CANCELLATION_REFUND_PROCESSING_DAYS=3
BOOKING_CONFIRMATION_TEMPLATE_ID=z3m5jgrq390ldpyo
```

---

## 🚨 **สำคัญมาก: สิ่งที่ต้องเปลี่ยน**

### 1. Database URL
- ใช้ Railway database URL ที่ได้รับจากการ deploy database
- รูปแบบ: `postgresql://postgres:password@host:port/database`

### 2. CORS Origins
- เปลี่ยนเป็น domain ที่ deploy frontend บน Railway
- เช่น: `https://malai-frontend-production.up.railway.app`

### 3. Telegram Bot Tokens  
- ได้จาก @BotFather ใน Telegram
- ต้องเป็น token จริง ไม่ใช่ placeholder

### 4. Email Configuration (ถ้าจำเป็น)
- ตรวจสอบ MailerSend credentials ว่ายังใช้ได้
- หรืออัปเดตเป็น credentials ใหม่

---

## ✅ **ขั้นตอนหลังตั้งค่า**

1. **Redeploy Service**: หลังตั้งค่า env vars เสร็จ ให้ redeploy
2. **Check Logs**: ดู deployment logs ว่ามี error หรือไม่  
3. **Test API**: ทดสอบ health check endpoint
4. **Test Database**: ทดสอบการเชื่อมต่อ database

---

## 🔍 **การทดสอบ**

### Health Check
```
GET https://your-api-domain.railway.app/health
```

### Database Connection  
```
GET https://your-api-domain.railway.app/api/v1/health/database
```

### API Test
```
GET https://your-api-domain.railway.app/api/v1/users
Headers: X-API-Key: your_api_key
```

---

## 📱 **Contact**
หากมีปัญหาในการตั้งค่า ติดต่อ:
- **Email**: center@malaikhaoyai.com
- **ระบบ**: Malai Resort Booking System

---

**หมายเหตุ**: ไฟล์นี้มี sensitive information - **ห้ามแชร์** หรือ commit ลง git
```bash
# เก่า (local database)
DATABASE_URL=postgresql://postgres:Aa123456@localhost:5432/hotel_booking

# ใหม่ (Railway database)
DATABASE_URL=postgresql://postgres:abc123xyz@viaduct.proxy.rlwy.net:12345/railway
```

## ✅ ทดสอบการเชื่อมต่อ

หลังจากแก้ไข .env แล้ว ให้รันคำสั่ง:
```bash
cd apps/api
node check-railway-connection.js
```

## 🆘 หากมีปัญหา

### Error: Connection refused
- ตรวจสอบ URL ว่าคัดลอกถูกต้องหรือไม่
- ตรวจสอบ Railway database ว่า running อยู่หรือไม่

### Error: Authentication failed  
- ตรวจสอบ username/password ใน URL
- ลองคัดลอก URL ใหม่จาก Railway