# ARCHIVE MANAGEMENT ANALYSIS & STRATEGY

## ปัจจุบันระบบเป็นอย่างไร? 🔍

### Database Schema ที่พบ ✅
```sql
-- Booking table มี archive fields แล้ว
isArchived            Boolean    @default(false)
archivedAt            DateTime?
archivedReason        String?
archivedBy            String?
```

### Booking Status ที่มี ✅
```
Confirmed, InHouse, CheckedIn, CheckedOut, Completed, Cancelled, NoShow
```

### ปัญหาปัจจุบัน ❌
1. **API `/admin/all` ไม่ filter `isArchived`** → ทุก booking แสดงใน room-booking-list
2. **Cancelled bookings** ยังปรากฎใน active booking list
3. **ไม่มี auto-archive** สำหรับ cancelled/completed bookings

## Hotel Industry Best Practices 🏨

### 1. **Active Booking List ควรแสดง**:
- ✅ `Confirmed` - รอ check-in
- ✅ `InHouse` - กำลังเข้าพัก  
- ✅ `CheckedIn` - เข้าพักแล้ว
- ❓ `CheckedOut` - **ควร auto-archive ภายใน 24-48 ชม.**
- ❓ `Completed` - **ควร auto-archive ทันที**

### 2. **ไม่ควรแสดงใน Active List**:
- ❌ `Cancelled` - **ควร auto-archive ทันที หรือ 7 วัน**
- ❌ `NoShow` - **ควร auto-archive หลัง check-in date + 1 วัน**
- ❌ `isArchived: true` - **อยู่ใน Archive Management เท่านั้น**

## กลยุทธ์ที่แนะนำ 🎯

### Option A: **Conservative Approach** (แนะนำ)
```javascript
// ซ่อน cancelled bookings จาก active list ทันที
// แต่ยังไม่ archive (เก็บไว้ในกรณีต้อง restore)
where: {
  isArchived: false,
  status: { notIn: ['Cancelled', 'NoShow'] }
}
```

### Option B: **Aggressive Approach**
```javascript  
// Auto-archive cancelled bookings ทันที
if (booking.status === 'Cancelled') {
  await archiveBooking(booking.id, 'AUTO_CANCELLED');
}
```

### Option C: **Hybrid Approach** (ยืดหยุ่นที่สุด)
```javascript
// กำหนด grace period ก่อน archive
const cancelledGracePeriod = 7; // วัน
const checkoutGracePeriod = 2;  // วัน

// ซ่อนจาก active list ทันที + auto-archive ตาม period
```

## การพัฒนาที่แนะนำ 🚀

### Phase 1: **Quick Fix** (30 นาที)
1. ✅ แก้ไข `getAllBookingsAdmin` → filter out archived + cancelled
2. ✅ เพิ่ม query parameter สำหรับแสดง cancelled (optional)

### Phase 2: **Auto-Archive System** (2-3 ชั่วโมง)
1. ✅ สร้าง auto-archive service
2. ✅ กำหนด rules สำหรับแต่ละ status
3. ✅ เพิ่ม cron job หรือ scheduled task

### Phase 3: **UI Enhancement** (1 ชั่วโมง)
1. ✅ เพิ่ม toggle "Show Cancelled Bookings"
2. ✅ เพิ่ม bulk archive actions
3. ✅ แสดง archive statistics

## Business Rules ที่แนะนำ 📋

### Auto-Archive Triggers:
| Status | Condition | Archive After | Reason |
|--------|-----------|---------------|---------|
| `Cancelled` | Immediate | 7 days | `AUTO_CANCELLED_CLEANUP` |
| `NoShow` | Past check-in + 1 day | 3 days | `AUTO_NO_SHOW` |
| `CheckedOut` | Past checkout | 2 days | `AUTO_COMPLETED` |
| `Completed` | Status changed | 1 day | `AUTO_COMPLETED` |

### Manual Archive Options:
- ✅ Admin can manually archive any booking
- ✅ Bulk archive by date range
- ✅ Restore from archive (with audit log)

## คำถามสำหรับผู้ใช้ 🤔

1. **Cancelled bookings** ควร:
   - A) ซ่อนจาก active list ทันที (แนะนำ)
   - B) Auto-archive ทันที  
   - C) แสดงต่อไปแต่เพิ่ม filter

2. **Grace period** ก่อน auto-archive:
   - Cancelled: 0-7 วัน?
   - Completed/CheckedOut: 1-3 วัน?

3. **UI preference**:
   - ต้องการ toggle "Show Archived"?
   - ต้องการ bulk operations?

## ขั้นตอนถัดไป ⚡
ให้เลือก approach ที่ต้องการ แล้วเราจะเริ่ม implement กัน!