# ✅ Railway Deployment Checklist - Malai Resort

## 🎯 Pre-Deployment Checks (เสร็จแล้ว)

- [x] **Security Hardening**: ลบ hardcoded secrets ทั้งหมด
- [x] **Environment Migration**: ย้าย config ไป .env
- [x] **Admin Signup Disabled**: ปิดระบบสมัครสมาชิก admin
- [x] **Code Pushed**: push code ขึ้น GitHub แล้ว
- [x] **Database Deployed**: deploy PostgreSQL ใน Railway แล้ว
- [x] **Backend Deployed**: deploy API service ใน Railway แล้ว

---

## 🚀 Current Status: Backend Environment Setup

### ✅ สิ่งที่ทำเสร็จแล้ว
1. **Database Service**: ✅ ทำงานใน Railway
2. **Backend Service**: ✅ deploy แล้ว แต่ยัง**ไม่มี env variables**
3. **Code Security**: ✅ ระบบปลอดภัยแล้ว
4. **GitHub Sync**: ✅ code ล่าสุดใน GitHub

### 🔄 สิ่งที่กำลังทำ
**ตั้งค่า Environment Variables ใน Railway Backend**

---

## 📋 Next Steps (ลำดับการทำ)

### Step 1: ตั้งค่า Environment Variables
1. **เข้า Railway Dashboard**
   - ไป https://railway.app
   - เลือก project **malai-booking**
   - เลือก service **backend/api**

2. **ไปที่ Variables Tab**
   - คลิก **Variables** ใน sidebar
   - เริ่มเพิ่ม env vars ตาม `RAILWAY_ENV_SETUP.md`

3. **เปลี่ยน Critical Values**
   - **DATABASE_URL**: ใช้ URL จริงจาก Railway database
   - **CORS_ORIGINS**: เปลี่ยนเป็น frontend domain จริง
   - **Telegram Tokens**: ใช้ token จริงจาก @BotFather

### Step 2: Redeploy Backend
1. หลังตั้งค่า env variables เสร็จ
2. คลิก **Deploy** หรือ **Redeploy** ใน Railway
3. รอจนกว่า deployment จะเสร็จ

### Step 3: ทดสอบ Backend
1. **Health Check**:
   ```
   GET https://your-backend-domain.railway.app/health
   ```

2. **Database Connection**:
   ```
   GET https://your-backend-domain.railway.app/api/v1/health/database
   ```

3. **API Test**:
   ```
   GET https://your-backend-domain.railway.app/api/v1/users
   Headers: X-API-Key: your_api_key
   ```

### Step 4: Deploy Frontend
1. **สร้าง Frontend Service** ใน Railway
2. **Connect GitHub Repository** 
3. **ตั้งค่า Build Settings**:
   - Build Command: `npm run build`
   - Start Command: `npm run start`
   - Root Directory: `app/admin`

4. **ตั้งค่า Frontend Environment Variables**:
   ```bash
   REACT_APP_API_URL=https://your-backend-domain.railway.app
   REACT_APP_API_KEY=your_api_key
   NODE_ENV=production
   ```

### Step 5: Final Testing
1. **Full System Test**: ทดสอบ booking flow ทั้งหมด
2. **Email Test**: ทดสอบการส่ง email confirmation
3. **Telegram Test**: ทดสอบการส่ง notification
4. **Payment Test**: ทดสอบ Omise integration

---

## 🚨 Critical Environment Variables (ต้องใส่ก่อน)

### 1. Database & Security
```bash
DATABASE_URL=postgresql://postgres:password@host:port/railway
NODE_ENV=production
JWT_SECRET=b72bc72cf65eeffb918b25e5664c4bc342cf405b620b52bd1112618b85eb7343e1d6fb36ed8546d222002d3efa300cd9ea0cee5d913d7c5517325ce309cf8c46
ALLOW_DEV_BYPASS=false
```

### 2. API Keys
```bash
API_KEY=hbk_prod_2024_secure_f8e7d6c5b4a392817f4e3d2c1b0a98765432187654321
ADMIN_API_KEY=hbk_admin_2024_secure_a9b8c7d6e5f4321087654321abcdef0123456789
```

### 3. Email Configuration
```bash
EMAIL_PRIMARY_PROVIDER=mailersend
MAILERSEND_API_TOKEN=mlsn.ee4ef76c01536d6e7dfb54cb3fc7bb7e8ee236b77b91434b75d77884e4604e0d
FROM_EMAIL=noreply@malairesort.com
```

### 4. Telegram Bots (ต้องได้ token จริง)
```bash
TELEGRAM_BOT_TOKEN=YOUR_REAL_CEO_BOT_TOKEN
STAFF_TELEGRAM_BOT_TOKEN=YOUR_REAL_STAFF_BOT_TOKEN
```

---

## 🔍 Troubleshooting

### ถ้า Backend ไม่ทำงาน
1. **ดู Logs**: ไปที่ Railway service > Deployments > View Logs
2. **ตรวจสอบ DATABASE_URL**: ต้องเป็น URL จริงจาก Railway
3. **ตรวจสอบ Required Env Vars**: ดูว่าครบหรือไม่

### ถ้า Database Connection Error
1. **ตรวจสอบ DATABASE_URL format**
2. **ตรวจสอบ Network**: Railway services ต้องอยู่ใน region เดียวกัน
3. **ดู Database Logs**: ไปที่ PostgreSQL service > Logs

### ถ้า API Keys Error
1. **ตรวจสอบ API_KEY**: ต้องตรงกับที่ frontend ใช้
2. **ตรวจสอบ Headers**: X-API-Key header ต้องถูกต้อง
3. **ดู validateApiKey.ts**: ตรวจสอบ logic การ validate

---

## 📞 Support

หากมีปัญหา:
1. **Check Railway Logs** ก่อนเสมอ
2. **อ่าน Error Messages** ให้ละเอียด  
3. **ทดสอบทีละ component**: Database → API → Frontend

---

**Status**: 🟡 **Environment Variables Pending**
**Next**: ⏳ **Copy all env vars to Railway backend service**

---

**Note**: ทุก critical security issues แก้เสร็จแล้ว ✅
Railway deployment อยู่ในขั้นตอนสุดท้าย! 🚀