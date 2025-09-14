# API KEY AUTHENTICATION DEBUG

## ปัญหาที่พบ
Frontend ได้รับ error "Invalid API key" แม้ว่า backend จะมี API key ที่ถูกต้องแล้ว

## การแก้ไขที่ทำ

### 1. ✅ อัพเดต validateApiKey middleware
- เพิ่ม environment variables ใหม่:
  - `process.env.API_KEY`
  - `process.env.ADMIN_API_KEY` 
  - `process.env.API_KEY_DEV`
  - `process.env.API_KEY_TEST`
  - `process.env.API_KEY_INTERNAL`
  - `process.env.API_KEY_ANALYTICS`
  - `process.env.API_KEY_ADMIN`
- เพิ่ม debug logging

### 2. ✅ เพิ่ม debug ใน bookingHistoryApi.js
- แสดง API key configuration ตอน constructor
- แสดง request details
- แสดง error response details

### 3. ✅ ทดสอบ backend API
```powershell
$headers = @{ "X-API-Key" = "hbk_prod_2024_secure_f8e7d6c5b4a392817f4e3d2c1b0a98765432187654321" }
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/booking-history/analytics/statistics" -Headers $headers
```
**ผลลัพธ์**: ✅ ทำงานได้ปกติ backend รับ API key แล้ว

## ขั้นตอนแก้ไข

### ให้ RESTART FRONTEND APPLICATION
```bash
# ใน terminal ของ frontend (Ctrl+C แล้ว restart)
cd d:\Hotel_Version\hotel_v2\app\admin
npm run start
```

### เหตุผล
- Frontend ต้อง restart เพื่อโหลด environment variables ใหม่
- React development server ไม่ auto-reload .env files
- ต้องการให้ debug console.log แสดงผล

## ตรวจสอบหลัง Restart

ใน Browser Console ดูว่ามี log แบบนี้:
```
🔧 BookingHistoryApi Config: {
  baseURL: "http://localhost:3001",
  apiKeyExists: true,
  apiKeyLength: 65,
  apiKeyPrefix: "hbk_prod_2..."
}
```

และเมื่อมี API call:
```
🌐 API Request: {
  url: "http://localhost:3001/api/v1/booking-history/analytics/statistics",
  apiKey: "hbk_prod_2...",
  headers: { "X-API-Key": "Present" }
}
```

## ถ้ายังไม่ได้
ลอง hardcode API key ชั่วคราว:
```javascript
// ใน bookingHistoryApi.js
this.apiKey = 'hbk_prod_2024_secure_f8e7d6c5b4a392817f4e3d2c1b0a98765432187654321';
```

## Environment Variables ปัจจุบัน
- **Frontend**: `REACT_APP_API_KEY=hbk_prod_2024_secure_f8e7d6c5b4a392817f4e3d2c1b0a98765432187654321`
- **Backend**: `API_KEY=hbk_prod_2024_secure_f8e7d6c5b4a392817f4e3d2c1b0a98765432187654321`
- **ตรงกัน**: ✅