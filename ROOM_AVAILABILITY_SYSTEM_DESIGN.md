# 🏨 Advanced Room Availability Management System Design

## 📋 ปัญหาปัจจุบัน

### สถานการณ์ที่พบ:
- Admin ไม่สามารถดูห้องว่างในอนาคตได้อย่างรวดเร็ว
- ต้องเลื่อนหาข้อมูลใน Booking List ทีละส่วน
- ไม่มีมุมมองแบบ Calendar หรือ Timeline
- เมื่อลูกค้าโทรมาจอง Admin ต้องใช้เวลานานในการหาห้องว่าง

### ข้อจำกัดปัจจุบัน:
- มีข้อมูล Booking แต่ไม่มีข้อมูล Available Rooms
- ไม่มี Calendar View สำหรับ Admin
- ไม่มีฟังก์ชัน Quick Search สำหรับวันที่ในอนาคต

## 🎯 เป้าหมายของระบบใหม่

### หลัก (Core Features) - ปรับตาม Customer Call Flow:
1. **Room Type Selection** - เลือกประเภทห้องที่ลูกค้าสนใจ
2. **Pricing Display** - แสดงราคาแต่ละ Room Type
3. **Monthly Calendar View** - ดูห้องว่างทั้งเดือนตาม Room Type
4. **Quick Date Check** - คลิกวันที่เพื่อดูห้องว่างทันที
5. **Instant Walk-in Booking** - สร้าง Booking ในระหว่างสาย

### Customer Call Flow Integration:
```
ลูกค้าโทรมา → Admin เปิด Calendar
1. "คุณต้องการห้องประเภทไหนครับ?" → เลือก Room Type
2. "ราคาห้องนี้ XXX บาท/คืน" → แสดงราคา Real-time
3. "วันที่เท่าไรครับ?" → คลิกวันที่ใน Calendar
4. "มีห้องว่าง X ห้อง" → แสดงห้องว่างทันที
5. "จองเลยไหมครับ?" → สร้าง Booking ทันที
```

### เสริม (Enhancement Features):
1. **Timeline View** - มุมมอง 7 วัน, 30 วัน
2. **Occupancy Rate** - แสดงอัตราการใช้งาน
3. **Revenue Forecast** - คาดการณ์รายได้
4. **Quick Actions** - Block/Unblock dates, Maintenance mode

## 🏗️ สถาปัตยกรรมระบบ

### Backend Enhancement (APIs ใหม่):

#### 1. Room Availability APIs
```typescript
// GET /api/admin/availability/calendar
// Parameters: year, month, roomTypeId (optional)
{
  "month": "2025-12",
  "dailyAvailability": [
    {
      "date": "2025-12-25",
      "roomTypes": [
        {
          "roomTypeId": "uuid",
          "roomTypeName": "Deluxe Room",
          "totalRooms": 10,
          "availableRooms": 3,
          "bookedRooms": 7,
          "blockedRooms": 0,
          "occupancyRate": 70,
          "availableRoomNumbers": ["201", "305", "407"]
        }
      ]
    }
  ]
}

// GET /api/admin/availability/search
// Parameters: startDate, endDate, guests, roomTypeId
{
  "searchCriteria": {...},
  "results": [
    {
      "date": "2025-12-25",
      "availableRooms": [...],
      "pricing": {...}
    }
  ]
}

// GET /api/admin/availability/quick-search
// Parameters: date, guests
{
  "date": "2025-12-25",
  "totalAvailable": 15,
  "roomTypes": [...]
}
```

#### 2. Booking Management APIs (ปรับปรุง)
```typescript
// POST /api/admin/bookings/walk-in
// สร้าง Walk-in Booking ทันที
{
  "roomId": "uuid",
  "guestInfo": {...},
  "dates": {...},
  "source": "walk-in",
  "createdBy": "admin-id"
}

// PUT /api/admin/rooms/block
// Block ห้องสำหรับ Maintenance
{
  "roomIds": ["uuid"],
  "startDate": "2025-12-25",
  "endDate": "2025-12-26",
  "reason": "maintenance",
  "notes": "Air conditioning repair"
}
```

### Frontend Components (ใหม่):

#### 1. AvailabilityCalendar Component
```jsx
// app/admin/src/components/AvailabilityCalendar/
├── AvailabilityCalendar.jsx        // Main calendar component
├── CalendarHeader.jsx              // Month navigation, filters
├── CalendarGrid.jsx                // Calendar grid layout
├── DayCell.jsx                     // Individual day cell
├── RoomTypeFilter.jsx              // Room type selector
├── QuickSearchModal.jsx            // Quick date search
└── AvailabilityCalendar.css        // Calendar styles
```

#### 2. AvailabilityDashboard Component
```jsx
// app/admin/src/components/AvailabilityDashboard/
├── AvailabilityDashboard.jsx       // Main dashboard
├── AvailabilityStats.jsx           // Statistics cards
├── TimelineView.jsx                // 7-day timeline
├── QuickActions.jsx                // Quick booking, block rooms
└── AvailabilitySearch.jsx          // Advanced search form
```

## 📱 UI/UX Design

### 1. Monthly Calendar View
```
┌─────────────────────────────────────────────────────────┐
│  🗓️ December 2025    [< Previous] [Next >]              │
│  Room Type: [All ▼] [Deluxe ▼] [Suite ▼]              │
├─────────────────────────────────────────────────────────┤
│  Sun   Mon   Tue   Wed   Thu   Fri   Sat              │
│   1     2     3     4     5     6     7              │
│  🟢15  🟡8   🟢12  🟢14  🟢11  🔴0   🟡3             │
│                                                         │
│   8     9    10    11    12    13    14              │
│  🟢9   🟢13  🟢15  🟢12  🟢14  🟡7   🟡5             │
│                                                         │
│  15    16    17    18    19    20    21              │
│  🟢10  🟢11  🟢9   🟢13  🟢8   🟡4   🟡6             │
│                                                         │
│  22    23    24    25    26    27    28              │
│  🟢12  🟢14  🔴0   🔴0   🟡3   🟢8   🟢11            │
│                                                         │
│  29    30    31                                        │
│  🟢13  🟢15  🟢14                                     │
└─────────────────────────────────────────────────────────┘

Legend:
🟢 Available (10+ rooms)  🟡 Limited (1-9 rooms)  🔴 Full (0 rooms)
```

### 2. Day Detail View (Click on date)
```
┌─────────────────────────────────────────────────────────┐
│  📅 December 25, 2025 - Room Availability              │
├─────────────────────────────────────────────────────────┤
│  Standard Room    [██████░░░░] 6/10 available          │
│  Available: 201, 203, 205, 207, 301, 303              │
│  [+ Quick Book]                                         │
│                                                         │
│  Deluxe Room      [████░░░░░░] 4/10 available          │
│  Available: 401, 403, 501, 503                        │
│  [+ Quick Book]                                         │
│                                                         │
│  Suite            [██░░░░░░░░] 2/5 available           │
│  Available: 601, 603                                   │
│  [+ Quick Book]                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Quick Search Modal
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Quick Room Search                           [✕]     │
├─────────────────────────────────────────────────────────┤
│  Check-in Date:   [📅 2025-12-25        ]              │
│  Check-out Date:  [📅 2025-12-27        ]              │
│  Guests:          [2 ▼]                                │
│  Room Type:       [Any ▼]                              │
│                                                         │
│  [🔍 Search Available Rooms]                           │
│                                                         │
│  Results (3 nights):                                   │
│  ✅ Standard Room - 5 available - ฿3,000/night        │
│  ✅ Deluxe Room   - 2 available - ฿4,500/night        │
│  ❌ Suite         - 0 available                        │
│                                                         │
│  [📝 Create Walk-in Booking]                          │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Implementation Plan

### Phase 1: Backend APIs (1-2 weeks)
1. **Create availability calculation logic**
   - Daily availability aggregation
   - Room type grouping
   - Occupancy rate calculation

2. **Admin availability endpoints**
   - Calendar month view API
   - Quick search API
   - Detailed day view API

3. **Walk-in booking API**
   - Direct booking creation
   - Room assignment logic
   - Admin audit trail

### Phase 2: Frontend Components (2-3 weeks)
1. **Calendar Component**
   - Monthly grid layout
   - Color-coded availability
   - Click interactions

2. **Dashboard Integration**
   - Add to admin menu
   - Responsive design
   - Loading states

3. **Quick Actions**
   - Search modal
   - Walk-in booking form
   - Room blocking tools

### Phase 3: Advanced Features (1-2 weeks)
1. **Timeline Views**
   - 7-day timeline
   - 30-day overview
   - Custom date ranges

2. **Analytics Integration**
   - Occupancy trends
   - Revenue forecasting
   - Booking patterns

3. **Export & Reports**
   - Availability reports
   - Excel export
   - PDF summaries

## 📊 Expected Benefits

### สำหรับ Admin:
- ⏰ **ลดเวลาการค้นหา** จาก 5-10 นาที เป็น 30 วินาที
- 👁️ **มุมมองรวม** ห้องว่างทั้งเดือน
- 📞 **ตอบลูกค้าได้เร็ว** เมื่อโทรมาจอง
- 🎯 **สร้าง Walk-in Booking** ได้ทันที

### สำหรับธุรกิจ:
- 💰 **เพิ่มโอกาสขาย** จากการตอบเร็ว
- 📈 **ปรับปรุงบริการ** ลูกค้า
- 📊 **วางแผนการตลาด** ได้ดีขึ้น
- 🔧 **จัดการ Maintenance** อย่างมีประสิทธิภาพ

## 🚀 Quick Start Implementation

### Step 1: Create Basic Calendar API
```typescript
// apps/api/src/controllers/availabilityController.ts
export const getMonthlyAvailability = async (req: Request, res: Response) => {
  const { year, month, roomTypeId } = req.query;
  // Implementation logic
};
```

### Step 2: Create Calendar Component
```jsx
// app/admin/src/components/AvailabilityCalendar.jsx
const AvailabilityCalendar = () => {
  // Component implementation
};
```

### Step 3: Integrate with Admin Dashboard
```jsx
// Add to admin navigation
{
  path: '/availability-calendar',
  component: AvailabilityCalendar,
  title: 'Room Availability'
}
```

---

**คุณต้องการให้ผมเริ่มทำขั้นตอนไหนก่อนครับ?**
- 🔧 Backend APIs สำหรับ Calendar
- 🎨 Frontend Calendar Component  
- 📱 UI/UX Mockup แบบละเอียด
- 🚀 Quick Prototype ทั้งระบบ
