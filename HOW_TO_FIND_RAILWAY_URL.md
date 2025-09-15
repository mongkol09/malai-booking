# 🔍 วิธีหา Railway Backend URL

## 📍 **ขั้นตอนการหา Railway Backend URL**

### 1. **เข้า Railway Dashboard**
- ไปที่ [railway.app](https://railway.app)
- Login เข้าบัญชีของคุณ
- เลือก project **malai-booking**

### 2. **เลือก Backend Service**
- จะเห็น services หลายตัว (Database, Backend/API)
- คลิกที่ service **Backend** หรือ **API** (ไม่ใช่ PostgreSQL)

### 3. **ไปที่ Deployments Tab**
- คลิก **Deployments** ใน sidebar
- จะเห็น deployment ล่าสุด

### 4. **ดู Domain/URL**
ใน deployment จะมี URL แสดงอยู่ รูปแบบประมาณ:

```
https://your-service-name.up.railway.app
```

หรือ

```
https://malai-booking-production.up.railway.app
```

---

## 🎯 **ตำแหน่งที่หา URL ได้:**

### **วิธีที่ 1: ใน Deployments**
1. Project → Backend Service → **Deployments**
2. คลิกที่ deployment ล่าสุด
3. จะเห็น **Domain** หรือ **URL** 

### **วิธีที่ 2: ใน Settings**
1. Project → Backend Service → **Settings**
2. ไปที่ **Domains** section
3. จะเห็น domain ที่ Railway generate ให้

### **วิธีที่ 3: ใน Overview**
1. Project → Backend Service → **Overview**
2. ดูใน **Service Details**
3. จะมี **Public URL** แสดงอยู่

---

## 📋 **รูปแบบ URL ที่จะได้:**

### **Auto-generated Domain:**
```
https://web-production-xxxx.up.railway.app
```

### **Custom Domain (ถ้าตั้ง):**
```
https://api.malai-resort.com
```

---

## ⚠️ **หมายเหตุสำคัญ:**

### **ถ้าไม่เห็น URL:**
1. **ตรวจสอบว่า deployment สำเร็จ** - ต้องมีสถานะ "Success"
2. **ตรวจสอบ PORT setting** - ต้องมี `PORT=3001` ใน environment variables
3. **ดู Build Logs** - อาจมี error ทำให้ service ไม่ start

### **ถ้า URL ไม่ทำงาน:**
1. **ตรวจสอบ Health Check** - เข้า `https://your-url/health`
2. **ดู Runtime Logs** - ดูว่ามี error อะไร
3. **ตรวจสอบ Environment Variables** - อาจขาด critical variables

---

## 🔧 **Test Railway Backend URL:**

### **Health Check:**
```
GET https://your-railway-url/health
```

### **API Test:**
```
GET https://your-railway-url/api/v1/users
Headers: X-API-Key: your_api_key
```

---

## 📱 **หลังได้ URL แล้ว:**

### **1. อัปเดต Vercel Environment Variables:**
```bash
REACT_APP_API_URL=https://your-railway-url.up.railway.app
```

### **2. อัปเดต Railway CORS_ORIGINS:**
```bash
CORS_ORIGINS=https://malai-booking.vercel.app,https://malai-resort.com
```

### **3. Redeploy ทั้งคู่**
- Redeploy Railway backend (หลังตั้งค่า env vars)
- Redeploy Vercel frontend (หลังอัปเดต API URL)

---

**ตำแหน่งหลัก**: **Railway Dashboard** → **Project** → **Backend Service** → **Deployments** ครับ! 🎯