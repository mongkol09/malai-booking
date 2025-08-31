# API Readiness Check - Booking Detail, Cancellation & Payment Integration

## 📋 การตรวจสอบ API ที่มีอยู่

### ✅ API ที่พร้อมใช้งานแล้ว

#### 1. **Booking Detail APIs** ✅ (มีบางส่วน)
| Endpoint | Status | Description | Implementation |
|----------|---------|-------------|----------------|
| `GET /admin/bookings/:bookingReferenceId` | ✅ **Ready** | ดูรายละเอียดการจองด้วย QR/Reference ID | เต็มรูปแบบ |
| `GET /bookings/:id` | ⚠️ **Placeholder** | ดูรายละเอียดการจองด้วย UUID | ยังเป็น mock data |
| `GET /admin/bookings/search` | ✅ **Ready** | ค้นหาการจอง | เต็มรูปแบบ |

#### 2. **Payment Integration APIs** ✅ (สมบูรณ์)
| Endpoint | Status | Description | Implementation |
|----------|---------|-------------|----------------|
| `POST /api/bookings/charge` | ✅ **Ready** | สร้าง payment charge กับ Omise | เต็มรูปแบบ |
| `GET /api/payments/:id` | ✅ **Ready** | ดูรายละเอียดการชำระเงิน | เต็มรูปแบบ |
| `POST /webhooks/omise` | ✅ **Ready** | รับ webhook จาก Omise | เต็มรูปแบบ |
| `GET /api/payments/:id/verify` | ✅ **Ready** | ตรวจสอบการชำระเงินกับ Omise | เต็มรูปแบบ |
| `GET /api/payments/:id/audit-trail` | ✅ **Ready** | ประวัติการชำระเงิน | เต็มรูปแบบ |

#### 3. **Basic Booking Operations** ✅ (พร้อมใช้)
| Endpoint | Status | Description | Implementation |
|----------|---------|-------------|----------------|
| `GET /admin/bookings/all` | ⚠️ **Mock** | รายการการจองทั้งหมด | ต้องเชื่อมกับ controller จริง |
| `POST /bookings/:id/check-in` | ✅ **Ready** | เช็คอิน | เต็มรูปแบบ |
| `POST /bookings/:id/check-out` | ✅ **Ready** | เช็คเอาท์ | เต็มรูปแบบ |
| `GET /bookings/arrivals` | ✅ **Ready** | แขกที่เข้าวันนี้ | เต็มรูปแบบ |
| `GET /bookings/departures` | ✅ **Ready** | แขกที่ออกวันนี้ | เต็มรูปแบบ |

---

## ❌ API ที่ยังขาดหายไป

### 1. **Booking Detail (Complete)** ⚠️
**สถานะ**: มีแล้วแต่ไม่สมบูรณ์
```typescript
// ปัจจุบัน: GET /bookings/:id เป็น placeholder
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Booking details',
    data: { booking: `booking ${req.params.id}` }  // ⚠️ Mock data
  });
});
```

**ต้องการ**: Controller จริงที่ส่งข้อมูลครบ
```typescript
// ควรจะเป็น:
GET /admin/bookings/:id
- ข้อมูลการจองเต็มรูปแบบ
- ข้อมูลแขก (guest details)
- ข้อมูลห้อง (room details)
- ประวัติการชำระเงิน (payment history)
- Special requests และ notes
- Check-in/out history
```

### 2. **Booking Edit/Update** ❌
**สถานะ**: ยังไม่มีเลย

**ต้องสร้าง**:
```typescript
PUT /admin/bookings/:id
{
  "guestInfo": { ... },
  "dates": {
    "checkinDate": "2025-08-20",
    "checkoutDate": "2025-08-22"
  },
  "roomType": "deluxe",
  "specialRequests": "...",
  "numberOfGuests": 2
}
```

### 3. **Booking Cancellation** ❌ 
**สถานะ**: ยังไม่มีเลย

**ต้องสร้าง**:
```typescript
POST /admin/bookings/:id/cancel
{
  "reason": "Customer request",
  "refundAmount": 1500.00,
  "refundMethod": "original_payment",
  "notifyGuest": true
}

// หรือ
DELETE /admin/bookings/:id
```

### 4. **Payment Refund** ❌
**สถานะ**: ยังไม่มีเลย

**ต้องสร้าง**:
```typescript
POST /admin/payments/:id/refund
{
  "amount": 1500.00,
  "reason": "Booking cancellation",
  "refundType": "partial" | "full"
}
```

### 5. **Booking Status Update** ⚠️
**สถานะ**: มีบางส่วน (check-in/out เท่านั้น)

**ต้องเพิ่ม**:
```typescript
PUT /admin/bookings/:id/status
{
  "status": "Confirmed" | "Cancelled" | "NoShow" | "InHouse" | "Completed",
  "notes": "Additional notes"
}
```

---

## 🎯 Priority Implementation Plan

### **Priority 1 (Critical)** - ต้องทำก่อน
1. **Complete Booking Detail API** ⚠️
   - แก้ไข `GET /bookings/:id` ให้ส่งข้อมูลจริง
   - รวมข้อมูล guest, room, payments, history

2. **Booking Cancellation API** ❌
   - สร้าง `POST /admin/bookings/:id/cancel`
   - Logic การยกเลิกและการคืนเงิน
   - Email notification

### **Priority 2 (Important)** - ทำต่อมา
3. **Booking Edit/Update API** ❌
   - สร้าง `PUT /admin/bookings/:id`
   - Validation และ business rules
   - Update availability

4. **Payment Refund API** ❌
   - สร้าง `POST /admin/payments/:id/refund`
   - Integration กับ Omise refund API
   - Refund tracking

### **Priority 3 (Enhancement)** - ปรับปรุง
5. **Advanced Status Management** ⚠️
   - สร้าง `PUT /admin/bookings/:id/status`
   - Bulk status updates
   - Status change logs

---

## 📊 API Readiness Summary

### ✅ **Ready to Use (60%)**
- **Payment Integration**: 100% ✅
- **Basic Booking Operations**: 80% ✅
- **Search & Filter**: 100% ✅
- **Check-in/Check-out**: 100% ✅

### ⚠️ **Partially Ready (30%)**
- **Booking Detail**: 70% (QR lookup OK, ID lookup needs work)
- **Status Management**: 50% (check-in/out only)

### ❌ **Missing (10%)**
- **Booking Edit/Update**: 0%
- **Booking Cancellation**: 0%
- **Payment Refund**: 0%

---

## 🚀 Immediate Next Steps

### สำหรับ Frontend Development
**เริ่มได้เลย**:
1. **Booking Detail Modal** - ใช้ `GET /admin/bookings/:bookingReferenceId` ก่อน
2. **Payment Status Display** - ใช้ `GET /api/payments/:id`
3. **Basic Operations** - Check-in/out, Search ใช้งานได้แล้ว

**รอ API**:
1. **Booking Edit Form** - รอ `PUT /admin/bookings/:id`
2. **Cancellation Feature** - รอ `POST /admin/bookings/:id/cancel`

### สำหรับ Backend Development
**ต้องทำก่อน**:
1. แก้ไข `GET /bookings/:id` controller
2. สร้าง booking cancellation endpoint
3. สร้าง booking update endpoint

---

## 💡 แนะนำการพัฒนา

### เริ่มจาก Frontend First
1. **Booking Detail Modal** - ใช้ API ที่มีอยู่แล้ว (`getBookingByQR`)
2. **Payment Integration** - เชื่อมต่อ payment status และ history
3. **Mock Cancellation** - สร้าง UI แต่ยัง mock backend call

### Backend Development Parallel
1. **Fix Booking Detail API** - เปลี่ยน placeholder เป็น real controller
2. **Add Missing Endpoints** - Cancellation, Edit, Refund APIs
3. **Testing** - ทดสอบ integration กับ frontend

**ผลลัพธ์**: สามารถเริ่มพัฒนา Frontend ได้เลย ขณะที่ Backend ทำ missing APIs แบบ parallel ✅
