# 🐛 Calendar Issues - Debug Guide

## 🔍 **ปัญหาที่พบ**

### 1. **API Error 400** ❌
- **Error**: `Failed to load resource: the server responded with a status of 400 (Bad Request)`
- **URL**: `/api/v1/admin/availability/date-detail?date=2025-08-30`
- **สาเหตุ**: 
  - วันที่ต้องเป็น ISO datetime format (มี `T` และ timezone)
  - `roomTypeId` เป็น required (แต่ได้แก้แล้ว)

### 2. **Calendar ไม่แสดง** 📅
- **สาเหตุ**: API error ทำให้ข้อมูลไม่ได้ → Calendar ไม่มีข้อมูลแสดง

---

## ✅ **การแก้ไขที่ทำแล้ว**

### 🔧 **Backend API Fixes**:
1. **แก้ API Schema**:
   ```typescript
   // เก่า
   roomTypeId: z.string().uuid()
   
   // ใหม่
   roomTypeId: z.string().uuid().optional()
   ```

2. **เพิ่ม Logic สำหรับ 'all' room types**:
   ```typescript
   // If no roomTypeId provided, get all room types
   if (!roomTypeId) {
     const roomTypes = await prisma.roomType.findMany({...});
     // Return all room types data
   }
   ```

### 🎨 **Frontend Fixes**:
1. **แก้ไขการส่งวันที่**:
   ```javascript
   // เก่า
   const today = new Date().toISOString().split('T')[0];
   
   // ใหม่  
   const today = new Date().toISOString(); // Full ISO datetime
   ```

2. **ปรับปรุง Date Formatting**:
   ```javascript
   // Convert YYYY-MM-DD to ISO datetime
   if (!date.includes('T')) {
     isoDate = new Date(date + 'T00:00:00.000Z').toISOString();
   }
   ```

3. **Enhanced Error Handling**:
   ```javascript
   // Better error logging
   console.log('Fetching date details with params:', params.toString());
   
   if (!response.ok) {
     const errorText = await response.text();
     console.error('API Error Response:', errorText);
   }
   ```

4. **Flexible Room Type Support**:
   ```javascript
   // Support both single and multiple room types
   if (details.roomTypes) {
     // Multiple room types response
   } else {
     // Single room type response  
   }
   ```

---

## 🧪 **การทดสอบ**

### **ขั้นตอนการทดสอบ**:

1. **เช็คว่า API Server รันอยู่**:
   ```bash
   # ไป http://localhost:3001/health
   # ควรได้ status: "ok"
   ```

2. **ทดสอบ API Endpoints**:
   ```bash
   # ทดสอบ date-detail API
   GET http://localhost:3001/api/v1/admin/availability/date-detail?date=2025-01-15T00:00:00.000Z
   
   # ทดสอบ monthly API  
   GET http://localhost:3001/api/v1/admin/availability/monthly?year=2025&month=1
   ```

3. **เช็ค Frontend Console**:
   - เปิด Developer Tools
   - ดู Console logs
   - ตรวจสอบ Network requests

4. **ทดสอบ Calendar Features**:
   - เลือกประเภทห้อง: "ทุกประเภทห้อง" และ "Standard"
   - เลือกวันที่และกด "เช็คห้องว่าง"
   - คลิกวันที่ใน Calendar
   - ดูว่า Calendar events แสดงหรือไม่

---

## 🔍 **Debug Commands**

### **เช็ค API ด้วย curl**:
```bash
# Health check
curl http://localhost:3001/health

# Date detail API (with auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-API-Key: hotel-booking-api-key-2024" \
     "http://localhost:3001/api/v1/admin/availability/date-detail?date=2025-01-15T00:00:00.000Z"

# Monthly availability API
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-API-Key: hotel-booking-api-key-2024" \
     "http://localhost:3001/api/v1/admin/availability/monthly?year=2025&month=1"
```

### **Debug ใน Browser Console**:
```javascript
// เช็คว่า Calendar instance มีอยู่ไหม
console.log('Calendar instance:', calendarInstance.current);

// เช็คข้อมูลห้องว่าง
console.log('Availability data:', availabilityData);

// เช็ค room types
console.log('Room types:', roomTypes);

// ทดสอบ API call
const token = localStorage.getItem('hotel_admin_token');
fetch('/api/v1/admin/availability/monthly?year=2025&month=1', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-API-Key': 'hotel-booking-api-key-2024'
  }
}).then(r => r.json()).then(console.log);
```

---

## 🚀 **Expected Results**

### **หลังแก้ไขแล้ว ควรเห็น**:

1. **ไม่มี API Errors ใน Console** ✅
2. **Calendar แสดงปฏิทิน** ✅  
3. **มี Events สีแสดงสถานะห้อง** ✅
4. **Stats แสดงตัวเลขจริง** ✅
5. **Quick Search ทำงานได้** ✅

### **Console Logs ที่ควรเห็น**:
```
🏨 Room types loaded: 4
📅 Monthly availability loaded: 31 days
📊 Sample data: {date: "2025-01-01", roomTypes: [...]}
🗑️ Cleared existing calendar events
📅 Creating 31 calendar events
✅ Calendar events created successfully
📅 Template Calendar initialized
```

---

## ⚠️ **หากยังมีปัญหา**

### **ขั้นตอนแก้ไขเพิ่มเติม**:

1. **Hard Refresh Browser**: `Ctrl + F5`
2. **Clear Browser Cache**: Developer Tools > Application > Clear Storage
3. **รีสตาร์ท API Server**: `cd apps/api && npm run dev`
4. **เช็ค Database Connection**: ดูว่า Prisma connect ได้หรือไม่
5. **เช็ค Auth Token**: ดูว่า token หมดอายุหรือไม่

### **Common Issues**:

| ปัญหา | สาเหตุ | วิธีแก้ |
|-------|-------|---------|
| 400 Bad Request | Date format ผิด | แก้ไข ISO datetime |
| 401 Unauthorized | Token หมดอายุ | Login ใหม่ |
| 404 Not Found | API endpoint ผิด | เช็ค URL |
| Calendar ว่าง | ไม่มี Events | เช็ค updateCalendarEvents |
| Loading ตลอด | API ช้า/error | เช็ค Network tab |

---

## 📞 **สำหรับ Production**

### **ก่อน Deploy**:
- [ ] ทดสอบทุก API endpoints  
- [ ] ทดสอบ Calendar ทุกฟีเจอร์
- [ ] ทดสอบ Responsive design
- [ ] ทดสอบ Error handling
- [ ] ทดสอบ Performance
