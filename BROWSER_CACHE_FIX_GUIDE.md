# API KEY และ BROWSER CACHE FIX

## ปัญหาที่พบ
1. **Frontend ใช้ API key เก่า**: `hbk_live_8f9e7d6c5b4...` 
2. **แต่ .env ตั้งไว้**: `hbk_prod_2024_secure_f8e7d6c5b4a392817f4e3d2c1b0a98765432187654321`
3. **URL encoding ผิด**: `/booking-history/?0=%3F&1=p&2=a&3=g...`

## การแก้ไขที่ทำ

### 1. ✅ Hardcode API Key (ชั่วคราว)
แก้ไข `bookingHistoryApi.js` ให้ใช้ API key ที่ถูกต้อง:
```javascript
this.apiKey = 'hbk_prod_2024_secure_f8e7d6c5b4a392817f4e3d2c1b0a98765432187654321';
```

### 2. ✅ แก้ไข getBookingHistory method
แก้ปัญหา URL encoding ที่ผิด:
```javascript
async getBookingHistory(endpoint = '') {
  if (typeof endpoint === 'string' && endpoint.startsWith('?')) {
    const fullEndpoint = `/booking-history/${endpoint}`;
    return await this.request(fullEndpoint);
  }
  // ... legacy object support
}
```

## Browser Cache Issues

### วิธีแก้ Cache ใน Chrome/Edge:
1. เปิด **Developer Tools** (F12)
2. คลิกขวาที่ปุ่ม Refresh 
3. เลือก **"Empty Cache and Hard Reload"**
4. หรือกด **Ctrl+Shift+R**

### วิธีแก้ใน Application:
1. กด **F12** → **Application** tab
2. เลือก **Local Storage** → **http://localhost:3000**
3. คลิกขวา → **Clear**
4. เลือก **Session Storage** → **Clear**

### วิธีแก้แบบสมบูรณ์:
1. ปิด browser ทั้งหมด
2. เปิดใหม่ → **Incognito/Private Mode**
3. เข้า http://localhost:3000

## Testing ผลลัพธ์

ใน Browser Console ควรเห็น:
```
🔧 BookingHistoryApi Config: {
  apiKeyPrefix: "hbk_prod_2...",
  hardcodedKey: "hbk_prod_2...",
  envApiKey: "hbk_live_8..." // ยังเป็นเก่า
}
```

API request ควรได้:
```
🌐 API Request: {
  url: "http://localhost:3001/api/v1/booking-history/...",
  apiKey: "hbk_prod_2..."
}
```

## ขั้นตอนถัดไป

1. **Clear Browser Cache** (สำคัญมาก!)
2. **ทดสอบ BookingHistory features**
3. **หลังจากทดสอบเสร็จ** - เปลี่ยนกลับใช้ `process.env.REACT_APP_API_KEY`

## แก้ไข Environment Variables Cache

React development server บางครั้งไม่โหลด .env ใหม่ ให้:

1. **Stop frontend** (Ctrl+C)
2. **Delete node_modules/.cache** (ถ้ามี)
3. **Start again**: `npm run start`

หรือใช้:
```bash
# Windows
rmdir /s node_modules\.cache
npm run start

# หรือ
npm run start -- --reset-cache
```