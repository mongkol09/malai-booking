# 🏨 Hotel Booking System - Technical Documentation

## 📋 System Overview
ระบบจองห้องพักที่ใช้ **Date-based Room Availability** และ **Dynamic Pricing Rules** เพื่อจัดการความพร้อมของห้องและราคาแบบอัตโนมัติ

---

## 🗓️ Date-based Room Availability System

### 🎯 Core Concept
```
❌ เก่า: room.status = 'Occupied' → ห้องล็อคตลอดกาล
✅ ใหม่: Date-based conflicts → ล็อคเฉพาะวันที่จอง
```

### 🔍 Availability Check Logic
```typescript
// Logic การตรวจสอบความพร้อมของห้อง
function checkRoomAvailability(roomId, checkIn, checkOut) {
  // 1. ตรวจสอบสถานะห้องพื้นฐาน
  if (room.status !== 'Available') return false;
  
  // 2. ตรวจสอบการจองที่ทับซ้อน (Date Overlap)
  const conflictingBookings = await Booking.findMany({
    where: {
      roomId: roomId,
      status: ['Confirmed', 'InHouse'],
      AND: [
        { checkinDate: { lt: checkOut } },    // เริ่มก่อน checkout
        { checkoutDate: { gt: checkIn } }     // จบหลัง checkin
      ]
    }
  });
  
  return conflictingBookings.length === 0;
}
```

### 📊 Timeline Example
```
Timeline: |-----|-----|-----|-----|-----|
         20Aug  21Aug  22Aug  23Aug  24Aug

Booking A: [21Aug-------22Aug]  ✅ จอง F3
Booking B:         [22Aug-------23Aug]  ✅ จอง F3 (วันอื่น)
User wants:  [20Aug----21Aug]  ✅ ว่าง
User wants:     [21Aug----22Aug]  ❌ ทับซ้อน
```

### 🗂️ Related API Files

#### 1. Room Availability API
**Path:** `apps/api/src/routes/rooms.ts`
- **Endpoint:** `GET /rooms/type/:roomTypeId?checkIn&checkOut`
- **Function:** ตรวจสอบห้องว่างตามประเภทและวันที่
- **Logic:** Date-based conflict checking

```typescript
// Key Code Section (Line 228-280)
router.get('/type/:roomTypeId', async (req, res) => {
  const { roomTypeId } = req.params;
  const { checkIn, checkOut } = req.query;

  let whereClause = {
    roomTypeId: roomTypeId,
    status: 'Available'  // เช็คเฉพาะห้องที่พร้อมใช้งาน
  };

  // Date-based availability checking
  if (checkIn && checkOut) {
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        AND: [
          { checkinDate: { lt: new Date(checkOut) } },
          { checkoutDate: { gt: new Date(checkIn) } }
        ],
        status: { in: ['Confirmed', 'InHouse'] }
      }
    });
    
    const unavailableRoomIds = conflictingBookings.map(b => b.roomId);
    if (unavailableRoomIds.length > 0) {
      whereClause.id = { notIn: unavailableRoomIds };
    }
  }
});
```

#### 2. Booking Creation API
**Path:** `apps/api/src/controllers/simpleBookingControllerNew.ts`
- **Function:** สร้างการจองใหม่โดย**ไม่เปลี่ยน room.status**
- **Logic:** ใช้ date-based availability management

```typescript
// Key Code Section (Line 118-125)
console.log('✅ Booking created successfully:', booking.id);

// Note: We do NOT change room.status to 'Occupied' here
// Room availability is managed by date-based booking conflicts  
// The room remains 'Available' for other dates
```

#### 3. Room Types API
**Path:** `apps/api/src/routes/rooms.ts`
- **Endpoint:** `GET /rooms/types`
- **Function:** ดึงประเภทห้องทั้งหมด

---

## 💰 Dynamic Pricing Rules System

### 🎯 Core Concept
```
Base Rate → Apply Rules (Priority Order) → Final Rate

Rule Evaluation: "First Match Wins" based on Priority
```

### 📋 Pricing Rule Categories

#### 1. Strategic Rules (Priority 1-10)
- **MLOS (Minimum Length of Stay)**
- **Holiday Restrictions**
- **Peak Season Requirements**

#### 2. Event-Driven Rules (Priority 11-20)
- **Concert/Festival Surcharge**
- **Local Event Premium**
- **Special Occasion Pricing**

#### 3. Behavioral Rules (Priority 21-40)
- **Last Minute Premium** (จองกะทันหัน +25%)
- **Early Bird Discount** (จองล่วงหน้า -15%)
- **Loyalty Customer Rates**

#### 4. Occupancy-Based Rules (Priority 41-60)
- **High Occupancy Premium** (85%+ occupancy +20%)
- **Very High Occupancy** (90%+ occupancy +1000 THB)
- **Low Occupancy Discounts**

#### 5. Pattern-Based Rules (Priority 61-80)
- **Weekend Pricing** (Fri-Sat +20%)
- **Weekday Discounts** (Mon-Thu)
- **Seasonal Patterns**

#### 6. Gap Filling Rules (Priority 81-110)
- **Orphan Night Discount** (คืนที่ว่างคั่นกลาง -25%)
- **Accelerated Pacing** (ยอดจองเร็วกว่าปกติ +10%)

### 🗂️ Related API Files

#### 1. Pricing Controller
**Path:** `apps/api/src/controllers/pricingController.ts`
- **Endpoint:** `POST /pricing/calculate`
- **Function:** คำนวณราคาแบบ Dynamic

```typescript
// Key Code Section - Rule Evaluation Logic
for (const rule of rules) {
  let matchesAllConditions = true;
  
  // ตรวจสอบเงื่อนไข: occupancy, lead_time, day_of_week
  if (conditions.and) {
    for (const condition of conditions.and) {
      // Occupancy checking
      if (condition.occupancy_percent) {
        const { gte, lte } = condition.occupancy_percent;
        if (gte && occupancyPercent < gte) matchesAllConditions = false;
      }
      
      // Lead time checking  
      if (condition.lead_time_days) {
        const { gte, lte } = condition.lead_time_days;
        if (gte && leadTimeDays < gte) matchesAllConditions = false;
      }
    }
  }
  
  // First Match Wins - ใช้กฎแรกที่ตรงเงื่อนไข
  if (matchesAllConditions) {
    appliedRule = rule;
    // Apply pricing action
    switch (action.type) {
      case 'increase_rate_by_percent':
        finalRate = finalRate * (1 + action.value / 100);
        break;
      // ... other actions
    }
    break; // หยุดหากฎแรกที่ตรง
  }
}
```

#### 2. Pricing Rules Seeder
**Path:** `apps/api/src/controllers/pricingRulesSeeder.ts`
- **Function:** สร้างกฎ Pricing แบบต่างๆ
- **Endpoint:** `POST /pricing/seed-rules`

#### 3. Room Type Base Rates
**Path:** Database `RoomType` table
- **Fields:** `baseRate` - ราคาพื้นฐานของแต่ละประเภทห้อง

---

## 🔄 Complete Booking Flow

### 1. User Input
```
User selects:
├── Check-in Date: 2025-08-21
├── Check-out Date: 2025-08-22  
└── Room Type: Grand Serenity
```

### 2. Room Availability Check
```
API Call: GET /rooms/type/{roomTypeId}?checkIn=2025-08-21&checkOut=2025-08-22

Logic:
├── Find all rooms of type "Grand Serenity"
├── Check date conflicts with existing bookings
├── Return only available rooms: [F1, F2] (F3 occupied)
└── Frontend shows available rooms to user
```

### 3. Dynamic Pricing Calculation
```
API Call: POST /pricing/calculate
{
  "roomTypeId": "...",
  "checkInDate": "2025-08-21", 
  "checkOutDate": "2025-08-22",
  "leadTimeDays": 1
}

Calculation:
├── Base Rate: 8,500 THB (Grand Serenity)
├── Check Occupancy: 85% (High)
├── Check Lead Time: 1 day (Last minute)
├── Apply Rule: "Last Minute Premium" +25%
└── Final Rate: 10,625 THB
```

### 4. Booking Creation
```
API Call: POST /bookings
{
  "roomId": "F1",
  "checkInDate": "2025-08-21",
  "checkOutDate": "2025-08-22",
  "guestFirstName": "John",
  "guestLastName": "Doe",
  // ... other fields
}

Process:
├── Validate room availability (double-check)
├── Create Guest record (if new)
├── Create Booking record with status: 'Confirmed'
├── DO NOT change room.status (keep as 'Available')
└── Return booking confirmation
```

### 5. Updated Availability
```
ผลลัพธ์:
├── Room F1 ไม่ว่างสำหรับ 21-22 Aug
├── Room F1 ยังว่างสำหรับวันอื่น (22-23 Aug)
└── Room F2, F3 ยังคงว่างสำหรับ 21-22 Aug
```

---

## 📊 Current System Status

### 🏨 Room Inventory (12 ห้อง)
```
├── Private House: 1 ห้อง (PH-1)
├── Onsen Villa: 5 ห้อง (B1, B2, C1, C2, D1)
├── Serenity Villa: 3 ห้อง (E1, E2, E3)  
└── Grand Serenity: 3 ห้อง (F1, F2, F3)
```

### ✅ System Capabilities
```
✅ Date-based room availability
✅ Dynamic pricing with 6 rule categories
✅ Multiple bookings per room (different dates)
✅ Real-time availability checking
✅ Priority-based pricing rules
✅ Occupancy-based rate adjustments
```

### 🧪 Tested Scenarios
```
✅ Same room, different dates → Both bookings successful
✅ Overlapping dates → Correctly blocked
✅ Weekend pricing → Applied correctly
✅ High occupancy surcharge → Working
✅ Last minute premium → Applied
```

---

## 🚀 API Endpoints Summary

### Room Management
- `GET /api/v1/rooms/types` - ดึงประเภทห้องทั้งหมด
- `GET /api/v1/rooms/type/:id?checkIn&checkOut` - ห้องว่างตามประเภทและวันที่
- `GET /api/v1/rooms` - ดึงห้องทั้งหมด (Admin)

### Pricing
- `POST /api/v1/pricing/calculate` - คำนวณราคาแบบ Dynamic
- `GET /api/v1/pricing/rules` - ดึงกฎ Pricing ทั้งหมด
- `POST /api/v1/pricing/rules` - สร้างกฎ Pricing ใหม่

### Booking
- `POST /api/v1/bookings` - สร้างการจองใหม่
- `GET /api/v1/bookings/admin/all` - ดึงรายการจองทั้งหมด (Admin)

---

## 🔧 Technical Notes

### Database Design
```sql
-- Room availability managed by date ranges, not status
SELECT * FROM rooms WHERE status = 'Available';  -- All rooms available

-- Conflicts checked via booking date overlaps
SELECT * FROM bookings 
WHERE checkinDate < '2025-08-22' 
  AND checkoutDate > '2025-08-21'
  AND status IN ('Confirmed', 'InHouse');
```

### Key Benefits
1. **Revenue Maximization** - ห้องเดียวจองได้หลายครั้ง/เดือน
2. **Accurate Inventory** - แสดงความพร้อมตามวันที่จริง  
3. **Dynamic Revenue** - ราคาปรับตามอุปสงค์อัตโนมัติ
4. **Flexible Operations** - จัดการการจองได้ยืดหยุ่น

---

## 📝 Development Status
- ✅ **Complete:** Date-based availability system
- ✅ **Complete:** Dynamic pricing rules engine  
- ✅ **Complete:** Room inventory management
- ✅ **Complete:** Booking creation and validation
- 🔄 **In Progress:** Frontend integration optimization
- 📋 **Planned:** Email notifications, check-in/out workflows

---

*Last Updated: August 20, 2025*
*System Version: v2.0 (Date-based Availability)*
