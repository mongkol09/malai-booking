# 🚫 Booking Cancellation API Documentation

## 📋 Overview

ระบบการยกเลิกการจองที่ครบถ้วนและปลอดภัย ประกอบด้วย:
- **Validation** - ตรวจสอบข้อมูลและสิทธิ์
- **Business Logic** - คำนวณการคืนเงินตามนโยบาย
- **Database Transaction** - อัปเดตข้อมูลอย่างปลอดภัย
- **Notifications** - แจ้งเตือนลูกค้าและทีมงาน
- **Audit Logging** - บันทึกประวัติการเปลี่ยนแปลง

---

## 🔗 API Endpoints

### 1. ยกเลิกการจอง
```http
POST /api/v1/bookings/:id/cancel
```

**Authentication:** Session Auth หรือ JWT Auth  
**Roles:** DEV, ADMIN, STAFF

**Request Body:**
```json
{
  "reason": "customer_request",
  "refundAmount": 1500.00,
  "refundMethod": "original_payment",
  "notifyGuest": true,
  "internalNotes": "หมายเหตุภายใน"
}
```

**Response:**
```json
{
  "success": true,
  "message": "ยกเลิกการจองสำเร็จ",
  "data": {
    "cancellationId": "uuid",
    "bookingId": "uuid",
    "refundId": "uuid",
    "refundAmount": 1500.00,
    "cancellationTime": "2025-09-01T10:30:00Z",
    "emailSent": true
  }
}
```

### 2. ดูนโยบายการยกเลิก
```http
GET /api/v1/bookings/:id/cancellation-policy
```

**Response:**
```json
{
  "success": true,
  "data": {
    "policy": {
      "id": "uuid",
      "name": "Standard Policy",
      "rules": [
        {
          "daysBeforeCheckin": 7,
          "refundPercentage": 100.00,
          "penaltyAmount": 0.00
        }
      ]
    },
    "totalPaid": 2500.00,
    "bookingStatus": "Confirmed",
    "checkinDate": "2025-09-15"
  }
}
```

### 3. ดูประวัติการยกเลิก
```http
GET /api/v1/bookings/:id/cancellations
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "reason": "customer_request",
      "refundAmount": 1500.00,
      "refundMethod": "original_payment",
      "cancellationTime": "2025-09-01T10:30:00Z",
      "policyApplied": "Standard Policy",
      "refund": {
        "id": "uuid",
        "status": "PENDING",
        "amount": 1500.00
      }
    }
  ]
}
```

---

## 🔧 Request Parameters

### Cancellation Request
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | ✅ | เหตุผลการยกเลิก |
| `refundAmount` | number | ✅ | จำนวนเงินคืน (บาท) |
| `refundMethod` | string | ✅ | วิธีการคืนเงิน |
| `notifyGuest` | boolean | ✅ | ส่งอีเมลแจ้งลูกค้า |
| `internalNotes` | string | ❌ | หมายเหตุภายใน |

### Refund Methods
- `original_payment` - คืนเงินไปยังบัตรเครดิต/เดบิตเดิม
- `credit_note` - เครดิตโน๊ตสำหรับการจองครั้งต่อไป
- `bank_transfer` - โอนเงินเข้าบัญชีธนาคาร
- `cash` - เงินสด

### Cancellation Reasons
- `customer_request` - แขกขอยกเลิก
- `payment_failed` - การชำระเงินไม่สำเร็จ
- `room_unavailable` - ห้องไม่พร้อมให้บริการ
- `force_majeure` - เหตุสุดวิสัย
- `duplicate_booking` - การจองซ้ำ
- `admin_decision` - ตัดสินใจโดยผู้ดูแลระบบ
- `other` - อื่นๆ

---

## 🛡️ Security Features

### 1. **Authentication & Authorization**
- Session-based authentication สำหรับ admin panel
- JWT authentication สำหรับ professional dashboard
- Role-based access control (DEV, ADMIN, STAFF)

### 2. **Input Validation**
- ตรวจสอบเหตุผลการยกเลิก (ไม่ว่าง)
- ตรวจสอบจำนวนเงินคืน (ไม่ติดลบ, ไม่เกินยอดจ่าย)
- ตรวจสอบวิธีการคืนเงิน (ต้องเป็นค่าที่อนุญาต)
- ตรวจสอบสถานะการจอง (ไม่สามารถยกเลิกได้ทุกสถานะ)

### 3. **Business Logic Validation**
- ตรวจสอบว่าการจองมีอยู่จริง
- ตรวจสอบสถานะการจอง (ไม่สามารถยกเลิกได้หากเช็คเอาท์แล้ว)
- ตรวจสอบจำนวนเงินคืนไม่เกินยอดที่จ่าย
- ใช้ Cancellation Policy ในการคำนวณการคืนเงิน

### 4. **Database Transaction**
- ใช้ Prisma transaction เพื่อความปลอดภัยของข้อมูล
- อัปเดตสถานะการจองเป็น "Cancelled"
- สร้าง cancellation record
- สร้าง refund record (ถ้ามีการคืนเงิน)
- อัปเดตสถานะห้อง (ถ้ามีการจัดห้อง)
- สร้าง audit log

---

## 📊 Database Models

### BookingCancellation
```sql
CREATE TABLE booking_cancellations (
  cancellation_id UUID PRIMARY KEY,
  booking_id UUID NOT NULL,
  reason VARCHAR NOT NULL,
  refund_amount DECIMAL(12,2) NOT NULL,
  refund_method VARCHAR NOT NULL,
  cancelled_by UUID NOT NULL,
  internal_notes TEXT,
  cancellation_time TIMESTAMP NOT NULL,
  policy_applied VARCHAR,
  original_amount DECIMAL(12,2) NOT NULL,
  penalty_amount DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### PaymentRefund
```sql
CREATE TABLE payment_refunds (
  refund_id UUID PRIMARY KEY,
  booking_id UUID NOT NULL,
  cancellation_id UUID UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  method VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'PENDING',
  processed_by UUID NOT NULL,
  refund_reason VARCHAR NOT NULL,
  processed_at TIMESTAMP,
  gateway_response JSON,
  failure_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

---

## 🔄 Business Logic

### 1. **Cancellation Policy Application**
```typescript
const applyCancellationPolicy = (booking, refundAmount) => {
  if (!booking.cancellationPolicy) {
    return refundAmount; // คืนเงินเต็มจำนวน
  }

  const daysUntilCheckin = calculateDaysUntilCheckin(booking.checkinDate);
  const applicableRule = findApplicableRule(policy.rules, daysUntilCheckin);
  
  if (!applicableRule) {
    return 0; // ไม่คืนเงิน
  }

  const refundPercentage = applicableRule.refundPercentage;
  const calculatedRefund = (refundAmount * refundPercentage) / 100;
  const finalRefund = Math.max(0, calculatedRefund - applicableRule.penaltyAmount);
  
  return finalRefund;
};
```

### 2. **Refund Calculation**
```typescript
const calculateRefundAmount = (booking, requestedRefund) => {
  const totalPaid = sumCompletedPayments(booking.payments);
  
  if (requestedRefund > totalPaid) {
    throw new Error('จำนวนเงินคืนเกินกว่าจำนวนที่จ่าย');
  }
  
  return requestedRefund;
};
```

---

## 📧 Email Notifications

### Cancellation Email Template Variables
```json
{
  "guest_name": "ชื่อลูกค้า",
  "booking_reference": "BK12345678",
  "room_type": "Grand Serenity",
  "room_number": "A1",
  "checkin_date": "15/9/2568",
  "checkout_date": "17/9/2568",
  "cancellation_reason": "แขกขอยกเลิก",
  "cancellation_time": "1/9/2568 17:30:00",
  "refund_amount": "฿1,500",
  "refund_method": "คืนเงินไปยังบัตรเครดิต/เดบิตเดิม",
  "original_amount": "฿2,500",
  "hotel_name": "Malai Khaoyai Resort",
  "contact_info": "โทร: 044-123-456 หรือ อีเมล: info@malaikhaoyai.com"
}
```

---

## 🔍 Error Handling

### Common Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "success": false,
  "message": "Validation failed: เหตุผลการยกเลิกเป็นสิ่งจำเป็น, จำนวนเงินคืนต้องเป็นตัวเลขและไม่ติดลบ"
}
```

**400 Bad Request - Business Logic Errors**
```json
{
  "success": false,
  "message": "ไม่สามารถยกเลิกการจองที่เช็คเอาท์แล้วได้"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "ไม่พบข้อมูลการจอง"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "เกิดข้อผิดพลาดในการยกเลิกการจอง"
}
```

---

## 🧪 Testing

### Test Scripts
1. **`test-cancellation-api.js`** - ทดสอบ API พื้นฐาน
2. **`test-cancellation-with-real-booking.js`** - ทดสอบกับ booking จริง

### Test Commands
```bash
# ทดสอบ API พื้นฐาน
node test-cancellation-api.js

# ทดสอบกับ booking จริง
node test-cancellation-with-real-booking.js
```

---

## 📈 Monitoring & Logging

### Audit Logs
ทุกการยกเลิกจะถูกบันทึกใน audit log:
```json
{
  "action": "BOOKING_CANCELLED",
  "entityType": "Booking",
  "entityId": "booking-uuid",
  "userId": "user-uuid",
  "details": {
    "reason": "customer_request",
    "refundAmount": 1500.00,
    "refundMethod": "original_payment",
    "cancellationId": "cancellation-uuid",
    "refundId": "refund-uuid"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

### Console Logs
```
🚫 [Cancellation] Starting cancellation process for booking: uuid
💰 [Cancellation] Refund calculation: { requested: 1500, calculated: 1500, final: 1500, policyApplied: "Standard Policy" }
✅ [Cancellation] Booking uuid cancelled successfully
📧 [Cancellation] Cancellation email sent to: guest@email.com
```

---

## 🚀 Frontend Integration

### BookingCancelModal Component
```jsx
import bookingService from '../../../../../../../services/bookingService';

const handleCancel = async () => {
  try {
    const response = await bookingService.cancelBooking(booking.id, formData);
    console.log('✅ Cancellation successful:', response);
  } catch (error) {
    console.error('❌ Cancellation failed:', error);
  }
};
```

### BookingService Methods
```javascript
// ยกเลิกการจอง
async cancelBooking(bookingId, cancellationData) {
  return await this.request(`/admin/bookings/${bookingId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(cancellationData)
  });
}

// ดึงข้อมูลนโยบายการยกเลิก
async getCancellationPolicy(bookingId) {
  return await this.request(`/admin/bookings/${bookingId}/cancellation-policy`, {
    method: 'GET'
  });
}

// ดึงประวัติการยกเลิก
async getCancellationHistory(bookingId) {
  return await this.request(`/admin/bookings/${bookingId}/cancellations`, {
    method: 'GET'
  });
}
```

---

## 🔧 Configuration

### Environment Variables
```env
# Email Configuration
CANCELLATION_TEMPLATE_ID=cancellation_template_id
EMAIL_PRIMARY_PROVIDER=mailersend
MAILERSEND_API_TOKEN=your_token

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hotel_booking

# Logging
NODE_ENV=development
```

---

## 📋 Checklist

### ✅ Completed Features
- [x] Cancellation API endpoints
- [x] Input validation
- [x] Business logic validation
- [x] Database transaction
- [x] Email notifications
- [x] Telegram notifications
- [x] Audit logging
- [x] Frontend integration
- [x] Error handling
- [x] Test scripts
- [x] Documentation

### 🔄 Future Enhancements
- [ ] Bulk cancellation
- [ ] Partial cancellation
- [ ] Cancellation templates
- [ ] Advanced refund processing
- [ ] Cancellation analytics
- [ ] Mobile app integration

---

## 📞 Support

หากมีปัญหาหรือคำถามเกี่ยวกับ Cancellation API กรุณาติดต่อ:
- **Email:** dev@malaikhaoyai.com
- **Telegram:** @malai_dev_support
- **Documentation:** `/docs/api/cancellation`
