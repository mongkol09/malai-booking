# 🗂️ API Files Reference - Hotel Booking System

## 📋 Quick Reference Guide
ไฟล์และ Path ที่สำคัญสำหรับระบบ Date-based Availability และ Dynamic Pricing

---

## 🗓️ Date-based Room Availability

### 🎯 Main Files

#### 1. Room Routes Handler
**📁 Path:** `apps/api/src/routes/rooms.ts`
```typescript
// Key Functions:
├── GET /rooms/types (Line 86-120)          → ดึงประเภทห้องทั้งหมด
├── GET /rooms/type/:roomTypeId (Line 228-300) → ห้องว่างตามวันที่
├── GET /rooms (Line 14-85)                 → ดึงห้องทั้งหมด (Admin)
└── POST /rooms (Line 315-400)              → สร้างห้องใหม่ (Admin)

// Critical Logic (Line 240-270):
const conflictingBookings = await prisma.booking.findMany({
  where: {
    AND: [
      { checkinDate: { lt: new Date(checkOut) } },
      { checkoutDate: { gt: new Date(checkIn) } }
    ],
    status: { in: ['Confirmed', 'InHouse'] }
  }
});
```

#### 2. Booking Controller (Fixed Version)
**📁 Path:** `apps/api/src/controllers/simpleBookingControllerNew.ts`
```typescript
// Key Changes (Line 118-125):
console.log('✅ Booking created successfully:', booking.id);

// Note: We do NOT change room.status to 'Occupied' here
// Room availability is managed by date-based booking conflicts
// The room remains 'Available' for other dates

// Function: createSimpleBooking (Line 7-172)
├── Validate required fields
├── Find/create guest
├── Check room availability (date-based)
├── Create booking with status: 'Confirmed'
└── Keep room.status = 'Available'
```

#### 3. Booking Routes
**📁 Path:** `apps/api/src/routes/bookings.ts`
```typescript
// Uses the new controller:
router.post('/', createSimpleBooking);  // Line updated to use new controller
```

### 🔧 Supporting Files

#### Database Models
**📁 Path:** `apps/api/prisma/schema.prisma`
```prisma
model Room {
  id           String    @id @default(uuid())
  roomNumber   String    @unique
  status       RoomStatus @default(Available)  // Stays 'Available'
  roomTypeId   String
  // ... other fields
}

model Booking {
  id              String        @id @default(uuid())
  checkinDate     DateTime      // For date-based conflicts
  checkoutDate    DateTime      // For date-based conflicts  
  status          BookingStatus @default(Pending)
  // ... other fields
}
```

---

## 💰 Dynamic Pricing Rules

### 🎯 Main Files

#### 1. Pricing Controller
**📁 Path:** `apps/api/src/controllers/pricingController.ts`
```typescript
// Key Functions:
├── calculateDynamicPrice (Line 45-150)     → คำนวณราคาแบบ Dynamic
├── createPricingRule (Line 15-44)          → สร้างกฎใหม่
├── getPricingRules (Line 65-85)            → ดึงกฎทั้งหมด
├── updatePricingRule (Line 180-200)        → แก้ไขกฎ
└── deletePricingRule (Line 220-240)        → ลบกฎ

// Critical Logic - Rule Evaluation (Line 90-140):
for (const rule of rules) {
  // Check conditions: occupancy, lead_time, day_of_week
  if (matchesAllConditions) {
    appliedRule = rule;
    // Apply pricing action based on rule.action
    break; // First Match Wins
  }
}
```

#### 2. Pricing Rules Seeder
**📁 Path:** `apps/api/src/controllers/pricingRulesSeeder.ts`
```typescript
// Key Functions:
├── seedPricingRules (Line 10-150)          → สร้างกฎตัวอย่าง
└── previewPricingRulesApplication (Line 170-250) → แสดงตัวอย่างการใช้กฎ

// Rule Categories:
├── Strategic Rules (Priority 1-10)         → Line 25-35
├── Event-Driven Rules (Priority 11-20)     → Line 40-55  
├── Behavioral Rules (Priority 21-40)       → Line 60-85
├── Occupancy-Based Rules (Priority 41-60)  → Line 90-115
├── Pattern-Based Rules (Priority 61-80)    → Line 120-135
└── Gap Filling Rules (Priority 81-110)     → Line 140-160
```

#### 3. Pricing Routes
**📁 Path:** `apps/api/src/routes/pricing.ts`
```typescript
// Pricing endpoints:
├── POST /calculate                          → คำนวณราคา
├── GET /rules                              → ดึงกฎทั้งหมด
├── POST /rules                             → สร้างกฎใหม่
├── PUT /rules/:id                          → แก้ไขกฎ
├── DELETE /rules/:id                       → ลบกฎ
└── POST /seed-rules                        → สร้างกฎตัวอย่าง
```

---

## 🔗 Integration Points

### Frontend to Backend

#### 1. Room Booking Component
**📁 Path:** `app/admin/src/Partials/Universal/Hotels/Components/RoomBooking/RoomBooking.jsx`
```javascript
// Key Functions:
├── loadRoomTypes() (Line 88-105)           → เรียก GET /rooms/types
├── loadAvailableRooms() (Line 115-130)     → เรียก GET /rooms/type/:id?dates
├── handleSubmit() (Line 190-210)          → เรียก POST /bookings
└── calculateBookingTotal() (Line 250-270) → เรียก POST /pricing/calculate
```

#### 2. Booking Service
**📁 Path:** `app/admin/src/services/bookingService.js`
```javascript
// Key Functions:
├── getRoomTypes() (Line 380-400)          → GET /rooms/types
├── getAvailableRooms() (Line 434-460)     → GET /rooms/type/:id
├── createBooking() (Line 483-540)         → POST /bookings
└── calculatePrice() (Line 560-590)       → POST /pricing/calculate

// Data Mapping (Line 485-530):
const apiData = {
  roomId: bookingData.roomId,              // Maps to backend
  checkInDate: bookingData.checkInDate,    // Date format
  checkOutDate: bookingData.checkOutDate,  // Date format
  guestFirstName: bookingData.guestFirstName,
  guestLastName: bookingData.guestLastName,
  // ... other fields
};
```

### 🗄️ Database Schema

#### Core Tables
```sql
-- Room Types (ประเภทห้อง)
RoomType {
  id          VARCHAR(UUID)   PRIMARY KEY
  name        VARCHAR(100)    -- "Grand Serenity", "Onsen Villa" 
  baseRate    DECIMAL(10,2)   -- ราคาพื้นฐาน เช่น 8500.00
  capacity    INTEGER         -- จำนวนผู้เข้าพักสูงสุด
}

-- Rooms (ห้องจริง)  
Room {
  id          VARCHAR(UUID)   PRIMARY KEY
  roomNumber  VARCHAR(20)     -- "F1", "F2", "F3"
  status      ENUM            -- 'Available' (เก็บไว้เป็น Available เสมอ)
  roomTypeId  VARCHAR(UUID)   FOREIGN KEY
}

-- Bookings (การจอง)
Booking {
  id              VARCHAR(UUID)   PRIMARY KEY
  bookingReferenceId VARCHAR(20)  -- "BK12345678"
  roomId          VARCHAR(UUID)   FOREIGN KEY  
  checkinDate     DATE           -- วันที่เข้าพัก (สำคัญสำหรับ conflict check)
  checkoutDate    DATE           -- วันที่ออก (สำคัญสำหรับ conflict check)
  status          ENUM           -- 'Confirmed', 'InHouse', 'Cancelled'
  totalPrice      DECIMAL(10,2)  -- ราคารวม (หลัง Dynamic Pricing)
}

-- Dynamic Pricing Rules (กฎการกำหนดราคา)
DynamicPricingRule {
  id          VARCHAR(UUID)   PRIMARY KEY
  name        VARCHAR(200)    -- ชื่อกฎ เช่น "Weekend Pricing"
  priority    INTEGER         -- ลำดับความสำคัญ (น้อย = สำคัญมาก)
  conditions  JSON           -- เงื่อนไข เช่น {"occupancy_percent": {"gte": 80}}
  action      JSON           -- การกระทำ เช่น {"type": "increase_rate_by_percent", "value": 20}
  isActive    BOOLEAN        -- เปิด/ปิดใช้งาน
}
```

---

## 🧪 Testing Files

### Unit Tests
```
📁 test-files/ (ใน project root):
├── test-full-date-availability.js        → ทดสอบ Date-based Availability
├── simple-availability-test.js           → ทดสอบ API connectivity  
├── debug-frontend-booking.js             → ทดสอบ Booking creation
├── check-room-availability.js            → ตรวจสอบห้องว่าง
└── cleanup-empty-room-types.js           → ลบ Room Types ที่ไม่ใช้งาน
```

### Database Scripts
```
📁 database-scripts/ (ใน project root):
├── reset-room-status.js                  → รีเซ็ต Room status เป็น Available
├── check-room-types-db.js                → ตรวจสอบ Room Types ในฐานข้อมูล
└── check-room-f3-type.js                 → ตรวจสอบห้อง F3 เฉพาะ
```

---

## 🔄 Data Flow Diagram

```
Frontend Request → API Routes → Controllers → Prisma → Database
      ↓              ↓           ↓           ↓         ↓
   RoomBooking.jsx → rooms.ts → (none) → prisma.room.findMany()
   bookingService → bookings.ts → simpleBookingControllerNew → prisma.booking.create()
   pricingCalc → pricing.ts → pricingController → prisma.dynamicPricingRule.findMany()
```

### Request Flow Example
```
1. User selects dates → RoomBooking.jsx
2. loadAvailableRooms() → bookingService.js  
3. GET /rooms/type/123?checkIn&checkOut → rooms.ts
4. Date conflict checking → Prisma query
5. Return available rooms → Frontend
6. User submits booking → handleSubmit()
7. POST /bookings → simpleBookingControllerNew.ts
8. Create booking (keep room Available) → Database
9. Return confirmation → Frontend
```

---

## 🚨 Critical Notes

### ⚠️ Important Changes Made
1. **Removed `room.status = 'Occupied'`** from booking creation
2. **Date-based conflict checking** is the primary availability method
3. **Room.status stays 'Available'** for all operational rooms
4. **Priority-based pricing rules** with "First Match Wins" logic

### 🎯 Key Benefits
- Same room can be booked for different date ranges
- Revenue maximization through flexible inventory
- Dynamic pricing adapts to demand automatically
- Clean separation between room status and availability

### 🔧 Maintenance Tasks
- Monitor pricing rule performance
- Regular cleanup of empty room types  
- Backup booking data before major changes
- Test date overlap logic thoroughly

---

*File Reference Guide - v2.0*
*Last Updated: August 20, 2025*
