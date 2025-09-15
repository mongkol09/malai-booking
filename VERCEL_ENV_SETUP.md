# 🚀 Vercel Environment Variables Setup - Updated

## 📋 **Environment Variables สำหรับ Vercel Frontend**

### ⚠️ **UPDATED API KEYS** - ใช้ API Keys ใหม่ที่ปลอดภัยสุด!

---

## 🔑 **Required Environment Variables:**

### 1. **REACT_APP_API_URL**
```
https://malai-booking-production.up.railway.app
```
**หมายเหตุ**: เปลี่ยนเป็น Railway backend URL จริงหลัง deploy

### 2. **REACT_APP_API_KEY** 🆕 **UPDATED!**
```
hbk_prod_2024_ultra_secure_dd9c2f1c643e55a80b50c0985a7ccb058b2388e4f6cdce6d150065d1c0c54f1f
```
**หมายเหตุ**: API key ใหม่ที่ปลอดภัยสุด (64-character hex + prefix)

### 3. **NODE_ENV**
```
production
```

---

## 📝 **วิธีเพิ่มใน Vercel Dashboard:**

### Step 1: ไปที่ Project Settings
1. เลือก project **malai-booking**
2. คลิก **Settings** tab
3. คลิก **Environment Variables** ใน sidebar

### Step 2: เพิ่ม Variables ทั้ง 3 ตัว

| Name | Value | Environment |
|------|--------|-------------|
| `REACT_APP_API_URL` | `https://malai-booking-production.up.railway.app` | Production |
| `REACT_APP_API_KEY` | `hbk_prod_2024_ultra_secure_dd9c2f1c643e55a80b50c0985a7ccb058b2388e4f6cdce6d150065d1c0c54f1f` | Production |
| `NODE_ENV` | `production` | Production |

### Step 3: Redeploy
หลังจากเพิ่ม env variables แล้ว **Redeploy** project เพื่อให้ใช้ค่าใหม่

---

## 🔒 **API Key Security Features:**

### ✅ **Enhanced Security:**
- **Length**: 90+ characters (เพิ่มจาก 64)
- **Entropy**: 256-bit randomness 
- **Prefix**: `hbk_prod_2024_ultra_secure_`
- **Rotation**: สร้างใหม่ล่าสุด (2024-12-19)

### 🆚 **เปรียบเทียบ:**
```bash
# เก่า (64 characters)
hbk_prod_2024_secure_f8e7d6c5b4a392817f4e3d2c1b0a98765432187654321

# ใหม่ (90+ characters) 
hbk_prod_2024_ultra_secure_dd9c2f1c643e55a80b50c0985a7ccb058b2388e4f6cdce6d150065d1c0c54f1f
```

---

## ⚠️ **สำคัญ: ต้องอัปเดตทั้งคู่!**

### 1. **Vercel Frontend**
ใช้ API key ใหม่ตามด้านบน

### 2. **Railway Backend** 
ใช้ API key ใหม่เดียวกันใน environment variables:
```bash
API_KEY=hbk_prod_2024_ultra_secure_dd9c2f1c643e55a80b50c0985a7ccb058b2388e4f6cdce6d150065d1c0c54f1f
```

---

## 🧪 **Testing After Deploy:**

### 1. **Check Frontend Environment**
ใน browser developer tools:
```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('API Key exists:', !!process.env.REACT_APP_API_KEY);
```

### 2. **Test API Connection**
ใน Network tab ดูว่า:
- API calls ไปที่ Railway backend URL ถูกต้อง
- Headers มี `X-API-Key` พร้อม key ใหม่
- ไม่มี CORS errors

---

## 📱 **Next Steps:**

1. ✅ **Deploy Frontend**: ใส่ env vars ใหม่ใน Vercel
2. ⏳ **Deploy Backend**: ใส่ env vars ทั้งหมดใน Railway  
3. ⏳ **Update CORS**: ใส่ Vercel domain ใน Railway CORS_ORIGINS
4. ⏳ **Test Integration**: ทดสอบ full system

---

**Status**: 🟡 **API Keys Updated - Ready for Deployment**

**หมายเหตุ**: API key ใหม่นี้มีความปลอดภัยสูงสุด ใช้สำหรับ production เท่านั้น!