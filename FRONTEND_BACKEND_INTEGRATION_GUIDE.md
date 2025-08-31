# 🚀 Frontend Dashboard Integration Setup Guide

## ขั้นตอนการเชื่อมต่อ Frontend กับ Backend

### 1. ตั้งค่า Backend API (Terminal 1)
```bash
cd d:\Hotel_booking\apps\api
npm run dev
```
Backend จะรันที่: `http://localhost:3001`

### 2. ตั้งค่า Frontend Admin Dashboard (Terminal 2)
```bash
cd d:\Hotel_booking\app\admin
npm start
```
Frontend จะรันที่: `http://localhost:3000` (หรือ port ที่ว่าง)

### 3. Environment Variables ที่ใช้

#### Backend (.env)
```properties
# ✅ ตั้งค่าแล้ว
CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:3002"
PORT=3001
DATABASE_URL="postgresql://postgres:Aa123456@localhost:5432/hotel_booking"
```

#### Frontend (.env.local)
```properties
# ✅ ตั้งค่าแล้ว
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_API_KEY=dev-api-key-2024
REACT_APP_APP_NAME=Malai Khaoyai Resort Admin
```

### 4. การทำงานของระบบ

#### ✅ อัปเดตแล้ว - Dashboard Cards
- **Today Booking**: ข้อมูลจาก `realtimeData.activeBookings`
- **Total Amount**: ข้อมูลจาก `kpis.totalRevenue`
- **Total Customer**: ข้อมูลจาก `kpis.totalCustomers`
- **Occupancy Rate**: ข้อมูลจาก `kpis.occupancyRate`

#### ✅ อัปเดตแล้ว - Reservations Chart
- ข้อมูลจาก `api/v1/analytics/booking-trends`
- แสดง Confirmed และ Pending bookings
- Auto-refresh ทุก 10 นาที

#### ✅ อัปเดตแล้ว - Booking Table
- ข้อมูลจาก `realtimeData.recentBookings`
- แสดงข้อมูล booking ล่าสุด
- Auto-refresh ทุก 2 นาที

### 5. API Endpoints ที่ใช้

```javascript
// Dashboard KPIs
GET /api/v1/analytics/hotel-kpis

// Realtime Dashboard
GET /api/v1/analytics/realtime-dashboard

// Revenue Analytics
GET /api/v1/analytics/revenue?period=monthly

// Booking Trends
GET /api/v1/analytics/booking-trends?period=daily
```

### 6. Error Handling

#### ✅ Fallback System
- หากไม่สามารถเชื่อมต่อ API ได้ จะใช้ static data
- แสดงข้อความ warning เมื่อใช้ cached data
- Loading state ระหว่างดึงข้อมูล

#### ✅ Auto-refresh
- Dashboard Cards: ทุก 5 นาที
- Charts: ทุก 10 นาที  
- Recent Bookings: ทุก 2 นาที

### 7. การทดสอบ

```bash
# ทดสอบ API connection
cd d:\Hotel_booking\app\admin
node test-api-connection.js
```

### 8. Features ที่รักษาไว้

#### ✅ Design & Structure
- **Bootstrap 5** styling ยังคงเดิม
- **Component structure** ไม่เปลี่ยนแปลง
- **ApexCharts** configuration เดิม
- **DataTable** functionality เดิม

#### ✅ Performance
- **React hooks** สำหรับ state management
- **Error boundaries** สำหรับ graceful fallback
- **Memory optimization** ด้วย cleanup functions

### 9. ขั้นตอนถัดไป (ถ้าต้องการ)

1. **Real-time WebSocket**: สำหรับ live updates
2. **Caching Strategy**: Redis หรือ localStorage
3. **Analytics Menu**: เพิ่มหน้าวิเคราะห์เชิงลึก
4. **Export Features**: ดาวน์โหลดรายงาน

### 10. troubleshooting

#### ❌ CORS Error
```bash
# ตรวจสอบ CORS_ORIGINS ใน backend .env
CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:3002"
```

#### ❌ API Key Error  
```bash
# ตรวจสอบ X-API-Key ใน request headers
X-API-Key: dev-api-key-2024
```

#### ❌ Database Connection
```bash
# ตรวจสอบ PostgreSQL และ DATABASE_URL
DATABASE_URL="postgresql://postgres:Aa123456@localhost:5432/hotel_booking"
```

---

## 🎯 สำเร็จแล้ว!

Frontend dashboard ตอนนี้เชื่อมต่อกับ backend โดย:
- **รักษารูปแบบเดิมไว้ 100%**
- **ใช้ข้อมูลจริงจาก database**
- **มี error handling ที่ดี**
- **Auto-refresh สำหรับข้อมูลล่าสุด**
