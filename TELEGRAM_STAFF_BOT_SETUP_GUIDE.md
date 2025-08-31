# 📱 คู่มือการตั้งค่า Staff Bot สำหรับโรงแรม

## 🤖 ข้อมูล Bot

- **Bot Name**: `staffnoti`
- **Bot Username**: `@malaistaffbot` 
- **Bot Token**: `8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI`
- **สถานะ**: ✅ พร้อมใช้งาน

---

## 📋 ขั้นตอนการตั้งค่า

### 1️⃣ **สร้างกลุ่ม Telegram**

1. **เปิดแอป Telegram**
2. **สร้างกลุ่มใหม่**:
   - กดปุ่ม "New Group" 
   - ตั้งชื่อกลุ่ม เช่น:
     - `"Malai Resort - Operations"`
     - `"โรงแรมมาลัย - พนักงาน"`
     - `"Hotel Staff Notifications"`

3. **เพิ่มสมาชิก**:
   - เพิ่มพนักงานที่เกี่ยวข้อง
   - แม่บ้าน (Housekeeping)
   - พนักงานต้อนรับ (Front Desk)
   - ผู้จัดการ (Manager)

### 2️⃣ **เพิ่ม Staff Bot เข้ากลุ่ม**

1. **ค้นหา Bot**:
   - ในกลุ่มที่สร้าง กด "Add Members"
   - ค้นหา: `@malaistaffbot`
   - หรือค้นหา: `staffnoti`

2. **เพิ่ม Bot**:
   - เลือก Bot และกด "Add"
   - Bot จะเข้าร่วมกลุ่มอัตโนมัติ

3. **ตั้งค่าสิทธิ์**:
   - กดที่ชื่อกลุ่ม > "Edit"
   - กดที่ "Administrators" 
   - เพิ่ม `@malaistaffbot` เป็น Admin
   - ให้สิทธิ์: **Send Messages**, **Delete Messages**

### 3️⃣ **ทดสอบ Bot**

1. **ส่งข้อความทดสอบ**:
   ```
   Hello @malaistaffbot
   ```
   หรือ
   ```
   ทดสอบระบบแจ้งเตือน
   ```

2. **ตรวจสอบ**:
   - Bot ไม่จำเป็นต้องตอบกลับ
   - แต่ข้อความจะถูกบันทึกไว้

### 4️⃣ **หา Chat ID**

1. **รันสคริปต์**:
   ```bash
   cd D:\Hotel_Version\hotel_v2\apps\api
   node scripts/get-telegram-chat-id.js
   ```

2. **ผลลัพธ์ที่ควรได้รับ**:
   ```
   ✅ พบกลุ่มสำหรับ Staff:
      🎯 "Malai Resort - Operations" - Chat ID: -1001234567890
   
   🔧 เพิ่มใน environment variables:
   STAFF_TELEGRAM_CHAT_ID="-1001234567890"
   ```

### 5️⃣ **บันทึก Chat ID**

1. **สร้างไฟล์ .env** (ถ้ายังไม่มี):
   ```bash
   # ใน D:\Hotel_Version\hotel_v2\apps\api\
   touch .env
   ```

2. **เพิ่มตัวแปรใน .env**:
   ```env
   # CEO Bot (existing)
   TELEGRAM_BOT_TOKEN="8090902784:AAHqVuSWGscl_CSG2ojmqF5A7NMmUFxAEA8"
   TELEGRAM_CHAT_ID="-1002579208700"

   # Staff Bot (new - ใส่ Chat ID ที่ได้จากสคริปต์)
   STAFF_TELEGRAM_BOT_TOKEN="8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI"
   STAFF_TELEGRAM_CHAT_ID="-1001234567890"
   ```

### 6️⃣ **ทดสอบระบบ**

1. **เริ่ม API Server**:
   ```bash
   npm run dev
   ```

2. **ทดสอบ Dual Bot**:
   ```bash
   node scripts/test-dual-bot-system.js
   ```

3. **ผลลัพธ์ที่ควรได้รับ**:
   ```
   ✅ ALL TESTS COMPLETED!
   
   🤖 BOT RESULTS:
   👔 CEO Bot: ✅ Working
   🏨 Staff Bot: ✅ Working
   
   📋 BOOKING NOTIFICATION RESULTS:
   👔 CEO (Executive): ✅ Sent
   🏨 Staff (Operational): ✅ Sent
   ```

---

## 🧪 วิธีทดสอบเฉพาะข้อความ

### **ทดสอบส่งข้อความด้วยมือ**:

```bash
# แทนที่ [CHAT_ID] ด้วย Chat ID ที่ได้
node scripts/get-telegram-chat-id.js test [CHAT_ID]

# ตัวอย่าง:
node scripts/get-telegram-chat-id.js test "-1001234567890"
```

### **ทดสอบผ่าน API**:

```bash
# ทดสอบ Bot Connection
curl -X POST http://localhost:3001/api/v1/housekeeping/test-bots

# ทดสอบ Booking Notification
curl -X POST http://localhost:3001/api/v1/housekeeping/test-booking-notification

# ทดสอบ Housekeeping Notification
curl -X POST http://localhost:3001/api/v1/housekeeping/cleaning-notification \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "A101",
    "roomType": "Grand Serenity",
    "guestName": "คุณทดสอบ ระบบ",
    "checkOutTime": "12:30",
    "priority": "high"
  }'
```

---

## 🎯 ผลลัพธ์ที่คาดหวัง

### **CEO Bot จะได้รับ** (ข้อมูลครบถ้วน):
```
🏨 MALAI RESORT - การจองใหม่!

📋 รายละเอียดการจอง:
🔖 หมายเลขการจอง: #BK12345
👤 ชื่อผู้จอง: คุณสมชาย รักสยาม
📧 อีเมล: customer@example.com
📱 เบอร์โทรศัพท์: 081-234-5678
💰 ราคารวม: ฿3,500
💳 สถานะการชำระ: รอการยืนยัน
```

### **Staff Bot จะได้รับ** (ข้อมูลกรองแล้ว):
```
🧹 แจ้งเตือนทำความสะอาดห้อง

🔴 ห้อง: A101
👤 ลูกค้า: คุณสมชาย
🏠 ประเภทห้อง: Grand Serenity
🚪 เช็คเอาท์: 12:30
📊 ระดับความสำคัญ: สูง

✅ กรุณาทำความสะอาดห้องและอัปเดตสถานะเมื่อเสร็จสิ้น
```

---

## ❗ แก้ไขปัญหาที่อาจเกิดขึ้น

### **1. ไม่พบ Bot**
```
❌ ปัญหา: ค้นหา @malaistaffbot ไม่เจอ
✅ วิธีแก้: ค้นหา "staffnoti" แทน
```

### **2. Bot ไม่ตอบสนอง**
```
❌ ปัญหา: Bot เข้ากลุ่มแล้วแต่ไม่ทำงาน
✅ วิธีแก้: ตรวจสอบสิทธิ์ Admin และ Send Messages
```

### **3. สคริปต์ไม่พบข้อความ**
```
❌ ปัญหา: ⚠️ ไม่พบข้อความใหม่
✅ วิธีแก้: ส่งข้อความในกลุ่มก่อน แล้วรันสคริปต์ใหม่
```

### **4. Chat ID ผิด**
```
❌ ปัญหา: Chat ID ไม่ถูกต้อง
✅ วิธีแก้: Chat ID ของกลุ่มจะขึ้นต้นด้วย -100 เสมอ
```

---

## 🔧 ขั้นตอนหลังจากตั้งค่าเสร็จ

1. **รีสตาร์ท API Server**:
   ```bash
   # หยุด server (Ctrl+C) แล้วเริ่มใหม่
   npm run dev
   ```

2. **ทดสอบ Check-out**:
   - ไปที่ http://localhost:3000/professional-checkin
   - เลือกลูกค้าที่ checked-in
   - กด "Check-out"
   - ตรวจสอบข้อความใน Staff group

3. **ทดสอบ Booking**:
   - สร้าง booking ใหม่ในระบบ
   - ตรวจสอบข้อความใน CEO group (ข้อมูลครบ)
   - ตรวจสอบข้อความใน Staff group (ข้อมูลกรอง)

---

## 🎊 เสร็จสิ้น!

หลังจากทำตามขั้นตอนนี้ ระบบ Dual Bot จะพร้อมใช้งาน:

- ✅ **CEO Bot**: รับข้อมูลการเงินและการจองครบถ้วน
- ✅ **Staff Bot**: รับแจ้งเตือนการดำเนินงานที่กรองแล้ว
- ✅ **Privacy Protection**: ข้อมูลละเอียดอ่อนไม่ส่งไปหา Staff
- ✅ **Real-time Notifications**: แจ้งเตือนทันทีเมื่อมีกิจกรรม

**หากมีปัญหาหรือข้อสงสัย สามารถรันสคริปต์ทดสอบเพื่อตรวจสอบสถานะได้ตลอดเวลา** 🚀
