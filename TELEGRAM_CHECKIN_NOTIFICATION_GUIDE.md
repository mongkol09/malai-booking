# 🏨 Telegram Check-in Notification System

## ✅ สำเร็จแล้ว! ระบบแจ้งเตือน Check-in ผ่าน Telegram

### 🎯 **Template ข้อความใหม่**

เมื่อมีผู้เข้าพัก Check-in ระบบจะส่งข้อความแจ้งเตือนไปยัง Telegram โดยอัตโนมัติ:

```
🏨 แจ้งเตือน: ผู้เข้าพักเช็คอิน
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 ผู้เข้าพัก: คุณสมชาย ใจดี
🏨 หมายเลขห้อง: 101
📋 เลขที่การจอง: BK001-2024-001
📱 โทรศัพท์: 081-234-5678
📧 อีเมล: somchai@email.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 วันที่เช็คอิน: 15/01/2024
📅 วันที่เช็คเอาท์: 17/01/2024
👥 จำนวนผู้เข้าพัก: 2 คน
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 ยอดรวม: 3,500 บาท
💳 สถานะการชำระ: ชำระครบแล้ว
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ เวลาเช็คอิน: 15/01/2024 14:30:25
👨‍💼 ดำเนินการโดย: Staff ID: admin01
```

---

## 🔧 **การติดตั้งที่เสร็จสมบูรณ์**

### 1. ✅ **Template สำหรับ 2 ระบบ:**
- **Legacy Notification Service** (`externalNotificationService.ts`)
- **Updated Notification Service** (`updatedNotificationService.ts`)

### 2. ✅ **เชื่อมต่อกับ Check-in Controllers:**
- **Standard Check-in** (`checkInOutController.ts` → `processCheckIn`)
- **Advanced Check-in** (`advancedCheckinController.ts` → `completeCheckin`)

### 3. ✅ **ข้อมูลที่แสดงครบถ้วน:**
- เลขที่การจอง (Booking ID)
- ข้อมูลผู้เข้าพัก (ชื่อ, โทร, อีเมล)
- รายละเอียดห้องพัก
- วันที่เข้า-ออก
- ยอดเงินและสถานะการชำระ
- เวลาและผู้ดำเนินการ

---

## 🚀 **วิธีการทดสอบ**

### **ทดสอบผ่าน API:**

```bash
# 1. ทดสอบ Standard Check-in
curl -X POST http://localhost:5000/api/checkin/[BOOKING_ID]/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Check-in ปกติ",
    "staffId": "admin01"
  }'

# 2. ทดสอบ Advanced Check-in  
curl -X POST http://localhost:5000/api/advanced-checkin/complete/[SESSION_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "checkinBy": "admin01",
    "idVerified": true,
    "keyCardIssued": true
  }'
```

### **ทดสอบ Notification อย่างเดียว:**

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "GuestCheckIn",
    "data": {
      "bookingId": "TEST-001",
      "guestName": "คุณทดสอบ ระบบ",
      "roomNumber": "999",
      "phoneNumber": "081-234-5678",
      "email": "test@email.com"
    }
  }'
```

---

## 📱 **การตั้งค่า Telegram Bot**

### **ตรวจสอบ Environment Variables:**

```env
# .env file
TELEGRAM_BOT_TOKEN="your_bot_token_here"
TELEGRAM_CHAT_ID="your_chat_id_here"
```

### **ทดสอบการเชื่อมต่อ:**

1. **ส่งข้อความทดสอบ:**
   ```bash
   curl -X GET "https://api.telegram.org/bot[BOT_TOKEN]/getMe"
   ```

2. **หา Chat ID:**
   ```bash
   curl -X GET "https://api.telegram.org/bot[BOT_TOKEN]/getUpdates"
   ```

---

## 🎯 **การใช้งานจริง**

### **Workflow การแจ้งเตือน:**

1. **ผู้เข้าพักมาถึงโรงแรม**
2. **พนักงานดำเนินการ Check-in ผ่านระบบ**
3. **ระบบอัพเดท:**
   - สถานะการจอง → `InHouse` หรือ `CheckedIn`
   - สถานะห้อง → `Occupied`
   - บันทึก Check-in time
4. **ส่งการแจ้งเตือนไปยัง:**
   - 🔔 **Telegram** (ข้อความที่สวยงาม)
   - 💻 **Admin Dashboard** (WebSocket real-time)
   - 📧 **Email** (หากต้องการ)

### **ประโยชน์:**
- ✅ **ทันทีที่เกิดเหตุการณ์** - ไม่ต้องรอรีเฟรชหน้าจอ
- ✅ **ข้อมูลครบถ้วน** - มีเลข Booking และรายละเอียดสำคัญ
- ✅ **ติดตามได้ตลอดเวลา** - แม้อยู่นอกสถานที่
- ✅ **บันทึกหลักฐาน** - มี log ในฐานข้อมูล

---

## 🔄 **อัปเดตเพิ่มเติม**

หากต้องการแก้ไขรูปแบบข้อความ สามารถแก้ไขได้ที่:

1. **`/apps/api/src/services/externalNotificationService.ts`** (บรรทัด 151-168)
2. **`/apps/api/src/services/updatedNotificationService.ts`** (บรรทัด 91-108)

**ระบบพร้อมใช้งานแล้ว!** 🎉
