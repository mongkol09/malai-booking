# 🤖 Telegram Bot Architecture สำหรับโรงแรม

## 📊 ระบบ Bot ปัจจุบัน

### 🔑 **Bot เดิม (CEO/Financial Bot)**
- **Bot Token**: `8090902784:AAHqVuSWGscl_CSG2ojmqF5A7NMmUFxAEA8`
- **Bot Name**: agentM (@AgentBeambot)
- **Chat ID**: `-1002579208700`
- **หน้าที่**: รายงานการเงิน และ Booking notifications real-time
- **กลุ่มเป้าหมาย**: CEO, Management Level
- **ข้อมูลที่ส่ง**: 
  - การจองใหม่พร้อมรายละเอียดการเงิน
  - ยอดขาย, รายได้
  - สถานะการชำระเงิน
  - ข้อมูลลูกค้าครบถ้วน

### 🆕 **Bot ใหม่ (Staff/Operations Bot)**
- **Bot Token**: `8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI`
- **Bot Name**: staffnoti
- **Chat ID**: [ยังไม่มีห้องแชท]
- **หน้าที่**: การดำเนินงานประจำวัน (Operations)
- **กลุ่มเป้าหมาย**: Staff, Manager Level
- **ข้อมูลที่ส่ง**:
  - แจ้งเตือนทำความสะอาดห้อง (Check-out)
  - แจ้งเตือนรับลูกค้า (Check-in)
  - ข้อมูล Booking พื้นฐาน (ไม่เซ็นซิทีฟ)
  - สถานะห้องพัก

---

## 🔧 โครงสร้างระบบใหม่

### 📱 **1. Dual Bot System**

```typescript
// Bot Configuration
const BOTS = {
  ceo: {
    token: "8090902784:AAHqVuSWGscl_CSG2ojmqF5A7NMmUFxAEA8",
    chatId: "-1002579208700",
    level: "executive",
    notifications: ["booking", "payment", "revenue", "financial"]
  },
  staff: {
    token: "8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI", 
    chatId: "[TO_BE_CONFIGURED]",
    level: "operational",
    notifications: ["housekeeping", "checkin", "checkout", "room_status"]
  }
}
```

### 🎯 **2. Message Categories**

#### 📊 **Executive Level (CEO Bot)**
```typescript
interface ExecutiveNotification {
  type: 'booking' | 'payment' | 'revenue' | 'cancellation';
  data: {
    bookingId: string;
    customerName: string;
    totalAmount: number;
    paymentStatus: string;
    roomType: string;
    dates: { checkIn: Date; checkOut: Date };
    contactInfo: { email: string; phone: string };
  }
}
```

#### 🏨 **Operational Level (Staff Bot)**
```typescript
interface OperationalNotification {
  type: 'housekeeping' | 'checkin' | 'checkout' | 'room_status';
  data: {
    roomNumber: string;
    guestName: string; // First name only
    action: string;
    time: Date;
    priority: 'high' | 'medium' | 'normal';
    specialNotes?: string;
  }
}
```

---

## 📤 Message Templates

### 🏨 **CEO Bot - Booking Notification**
```
🏨 MALAI RESORT - การจองใหม่!

🆕 การจองสำเร็จ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 รายละเอียดการจอง:
🔖 หมายเลขการจอง: #BK12345
👤 ชื่อผู้จอง: คุณสมชาย รักสยาม
📧 อีเมล: customer@example.com
📱 เบอร์โทรศัพท์: 081-234-5678

📅 วันที่เข้าพัก: 25/08/2025
📅 วันที่ออก: 27/08/2025
🏠 ประเภทห้อง: Grand Serenity
👥 จำนวนผู้เข้าพัก: 2 คน

💰 ราคารวม: ฿3,500
💳 สถานะการชำระ: รอการยืนยัน

📝 หมายเหตุ: ขอเตียงเสริม

⏰ เวลาที่จอง: 30/08/2025 14:30

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ สถานะ: การจองได้รับการยืนยันแล้ว
```

### 🧹 **Staff Bot - Housekeeping Notification**
```
🧹 แจ้งเตือนทำความสะอาดห้อง

🔴 ห้อง: A101
🏠 ประเภทห้อง: Grand Serenity
👤 ลูกค้า: คุณสมชาย
🚪 เช็คเอาท์: 12:30
⏰ เวลาแจ้งเตือน: 30/08/2025 12:35
📊 ระดับความสำคัญ: สูง

📝 คำแนะนำพิเศษ:
ขอเตียงเสริม - ตรวจสอบอุปกรณ์เพิ่มเติม

✅ กรุณาทำความสะอาดห้องและอัปเดตสถานะเมื่อเสร็จสิ้น

#RoomCleaning #RoomA101 #highPriority
```

### 🏨 **Staff Bot - Check-in Notification**
```
🏨 แจ้งเตือนลูกค้าเข้าพัก

✅ ห้อง: A101
👤 ลูกค้า: คุณสมชาย
🏠 ประเภทห้อง: Grand Serenity
⏰ เช็คอิน: 14:00
📱 ติดต่อ: 081-xxx-x678

📝 ความต้องการพิเศษ:
ขอเตียงเสริม

✅ พร้อมต้อนรับลูกค้า
🔑 เตรียมกุญแจห้องและอุปกรณ์

#CheckIn #RoomA101 #WelcomeGuest
```

---

## 🔒 Security & Privacy

### 📊 **Executive Level Data**
- ✅ ข้อมูลการเงินครบถ้วน
- ✅ ข้อมูลลูกค้าครบถ้วน
- ✅ รายละเอียดการชำระเงิน
- ✅ ข้อมูลสถิติและรายงาน

### 🏨 **Operational Level Data**
- ✅ ชื่อลูกค้า (ชื่อจริงเท่านั้น)
- ✅ หมายเลขห้อง
- ✅ ข้อมูลการดำเนินงาน
- ❌ ราคาเต็ม (แสดงเฉพาะระดับ: ปกติ/พรีเมียม)
- ❌ ข้อมูลบัตรเครดิต
- ❌ ข้อมูลส่วนตัวละเอียด

---

## 🚀 Implementation Plan

### Phase 1: Staff Bot Setup
1. **สร้างห้องแชท Telegram**
2. **เพิ่ม Bot เข้าห้องแชท**
3. **ตั้งค่า Chat ID**
4. **ทดสอบการส่งข้อความ**

### Phase 2: Message System
1. **แยกระบบส่งข้อความตาม Bot**
2. **สร้าง Template สำหรับ Staff**
3. **เพิ่ม Priority System**
4. **เพิ่ม Hashtag System**

### Phase 3: Integration
1. **เชื่อมต่อกับ Check-in/Check-out System**
2. **เชื่อมต่อกับ Housekeeping System**
3. **เพิ่ม Booking Notifications**
4. **ทดสอบ End-to-End**

---

## 💼 Use Cases

### 🏨 **Check-in Process**
1. Staff เช็คอินลูกค้าในระบบ
2. Staff Bot ส่งแจ้งเตือนไปยังทีม
3. ทีมต้อนรับเตรียมความพร้อม

### 🚪 **Check-out Process**
1. Staff เช็คเอาท์ลูกค้า
2. Staff Bot ส่งแจ้งเตือนทำความสะอาด
3. Housekeeping ทำความสะอาดและอัปเดตสถานะ

### 📊 **Booking Process**
1. การจองเข้ามา (Admin หรือ Guest)
2. CEO Bot ส่งข้อมูลครบถ้วน (การเงิน)
3. Staff Bot ส่งข้อมูลการดำเนินงาน

---

## 🔧 Technical Requirements

### Backend Changes:
1. **ปรับปรุง TelegramHousekeepingController**
2. **เพิ่ม Bot Selection Logic**
3. **เพิ่ม Message Template System**
4. **เพิ่ม Privacy Filter**

### Environment Variables:
```env
# CEO Bot (existing)
TELEGRAM_BOT_TOKEN="8090902784:AAHqVuSWGscl_CSG2ojmqF5A7NMmUFxAEA8"
TELEGRAM_CHAT_ID="-1002579208700"

# Staff Bot (new)
STAFF_TELEGRAM_BOT_TOKEN="8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI"
STAFF_TELEGRAM_CHAT_ID="[TO_BE_CONFIGURED]"
```

---

## ✅ Next Steps

1. **สร้างห้องแชท Staff Telegram**
2. **ตั้งค่า Bot ใหม่**
3. **Implement Dual Bot System**
4. **ทดสอบการส่งข้อความ**
5. **Integration กับระบบเดิม**
