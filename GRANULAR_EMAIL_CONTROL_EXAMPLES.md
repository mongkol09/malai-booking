# 🎯 Granular Email Control - Usage Examples

## 📋 Overview
ระบบควบคุมอีเมลแบบละเอียด (Granular Control) ที่สามารถปิดเฉพาะบางส่วนได้ เช่น ปิดแค่ Check-in Reminder แต่เปิดอีเมลอื่นๆ ปกติ

## 🔧 Available Controls

### 1. **Check-in Reminder Controls**

#### 📅 **Timing-based Controls**
```javascript
// ปิดเฉพาะการแจ้งเตือน 24 ชั่วโมงก่อน (เพราะ bounce rate สูง)
PUT /api/v1/admin/email-settings/checkin_reminder_24h_enabled
{
  "settingValue": false,
  "reason": "High bounce rate on 24h reminders"
}

// เหลือเฉพาะ 3 ชั่วโมง และ 1 ชั่วโมงก่อนที่ยังทำงาน
// ✅ checkin_reminder_3h_enabled: true
// ✅ checkin_reminder_1h_enabled: true
// ❌ checkin_reminder_24h_enabled: false
```

#### 👥 **Guest Type Controls**
```javascript
// ปิดเฉพาะการแจ้งเตือนสำหรับลูกค้า VIP (เพราะพวกเขาไม่ชอบ)
PUT /api/v1/admin/email-settings/checkin_reminder_vip_enabled
{
  "settingValue": false,
  "reason": "VIP guests prefer phone call reminders"
}

// ลูกค้าทั่วไปยังได้รับการแจ้งเตือนปกติ
// ✅ checkin_reminder_regular_enabled: true
// ❌ checkin_reminder_vip_enabled: false
```

#### 🏨 **Room Type Controls**
```javascript
// ปิดเฉพาะการแจ้งเตือนสำหรับ Suite rooms
PUT /api/v1/admin/email-settings/checkin_reminder_suite_enabled
{
  "settingValue": false,
  "reason": "Suite guests get personal concierge service"
}

// Standard rooms ยังได้รับการแจ้งเตือน
// ✅ checkin_reminder_standard_enabled: true
// ❌ checkin_reminder_suite_enabled: false
```

#### 📱 **Booking Channel Controls**
```javascript
// ปิดเฉพาะการแจ้งเตือนสำหรับ Walk-in guests
PUT /api/v1/admin/email-settings/checkin_reminder_walk_in_enabled
{
  "settingValue": false,
  "reason": "Walk-in guests already at hotel"
}

// Online bookings ยังได้รับการแจ้งเตือน
// ✅ checkin_reminder_online_booking_enabled: true
// ❌ checkin_reminder_walk_in_enabled: false
```

## 🎛️ Real-world Use Cases

### **Case 1: High Email Bounce Rate**
```
ปัญหา: อีเมลแจ้งเตือน 24 ชั่วโมงก่อนมี bounce rate สูง
วิธีแก้: ปิดเฉพาะ 24h reminders เท่านั้น

Action:
- ❌ Disable: checkin_reminder_24h_enabled  
- ✅ Keep: checkin_reminder_3h_enabled
- ✅ Keep: checkin_reminder_1h_enabled

ผลลัพธ์: ลดจำนวนอีเมล bounce แต่ยังคงการแจ้งเตือนใกล้เวลาเช็คอิน
```

### **Case 2: VIP Guest Complaints**
```
ปัญหา: ลูกค้า VIP บ่นว่าได้รับอีเมลเยอะเกินไป
วิธีแก้: ปิดการแจ้งเตือนเฉพาะ VIP guests

Action:
- ❌ Disable: checkin_reminder_vip_enabled
- ✅ Keep: checkin_reminder_regular_enabled
- ✅ Keep: booking_confirmation_enabled (ทุกคน)
- ✅ Keep: payment_receipt_enabled (ทุกคน)

ผลลัพธ์: VIP ไม่ได้รับ reminder แต่ยังได้ confirmation และ receipt
```

### **Case 3: Specific Room Type Issues**
```
ปัญหา: ผู้เข้าพัก Suite rooms ต้องการบริการแบบส่วนตัว
วิธีแก้: ปิดอีเมลอัตโนมัติสำหรับ Suite เท่านั้น

Action:
- ❌ Disable: checkin_reminder_suite_enabled
- ✅ Keep: checkin_reminder_standard_enabled
- ✅ Keep: checkin_reminder_deluxe_enabled

ผลลัพธ์: Suite guests ได้รับบริการ personal concierge แทน
```

### **Case 4: Channel-specific Strategy**
```
ปัญหา: Walk-in guests สับสนเพราะได้รับอีเมลหลังเช็คอินแล้ว
วิธีแก้: ปิดการแจ้งเตือนเฉพาะ Walk-in guests

Action:
- ❌ Disable: checkin_reminder_walk_in_enabled  
- ✅ Keep: checkin_reminder_online_booking_enabled

ผลลัพธ์: เฉพาะคนจองออนไลน์ที่ได้รับ reminder
```

## 🔍 How to Check Current Status

### **Check Individual Setting**
```javascript
GET /api/v1/admin/email-settings/check/checkin_reminder_24h_enabled

Response:
{
  "success": true,
  "data": {
    "settingKey": "checkin_reminder_24h_enabled",
    "enabled": false,
    "checkedAt": "2025-08-13T10:30:00Z"
  }
}
```

### **Check Permission for Specific Context**
```javascript
// ใน email sending code
const emailData = {
  type: EmailType.CHECKIN_REMINDER,
  to: 'vip@customer.com',
  // ... other data
};

const context = {
  timing: '24h',
  guestType: 'vip',
  roomType: 'suite',
  bookingChannel: 'online'
};

const result = await emailService.sendEmailWithGranularCheck(emailData, context);

// ถ้า VIP reminders ถูกปิด:
// result.success = false
// result.blocked = true  
// result.error = "Blocked by: checkin_reminder_vip_enabled"
```

## 💡 Advanced Examples

### **Gradual Rollback Strategy**
```javascript
// เมื่อเกิดปัญหา - ปิดทีละขั้น
// Step 1: ปิดเฉพาะ timing ที่มีปัญหา
PUT checkin_reminder_24h_enabled = false

// Step 2: ถ้ายังมีปัญหา - ปิดเฉพาะ guest type ที่บ่น  
PUT checkin_reminder_vip_enabled = false

// Step 3: ถ้ายังมีปัญหา - ปิดเฉพาะ room type ที่มีปัญหา
PUT checkin_reminder_suite_enabled = false

// Step 4: สุดท้าย - ปิดทั้งระบบ check-in reminder
PUT checkin_reminder_enabled = false
```

### **A/B Testing Strategy**
```javascript
// Test 1: ปิดการแจ้งเตือน 24h เฉพาะลูกค้าทั่วไป
PUT checkin_reminder_24h_regular_enabled = false  // ถ้ามี setting นี้

// Test 2: เก็บ VIP ไว้เพื่อเปรียบเทียบ conversion rate
// ✅ Keep: checkin_reminder_24h_vip_enabled = true

// วัดผล: show-up rate, customer satisfaction
```

## 🔧 Implementation in Email Sending Code

### **Enhanced Email Sending**
```javascript
// แทนที่การใช้
// await emailService.sendEmailWithPermissionCheck(emailData);

// ด้วย
await emailService.sendEmailWithGranularCheck(emailData, {
  timing: '3h',           // 3 ชั่วโมงก่อนเช็คอิน
  guestType: 'vip',      // ลูกค้า VIP
  roomType: 'suite',     // Suite room
  bookingChannel: 'online' // จองออนไลน์
});

// ระบบจะตรวจสอบ:
// 1. checkin_reminder_enabled (ระบบโดยรวม)
// 2. checkin_reminder_3h_enabled (timing เฉพาะ)  
// 3. checkin_reminder_vip_enabled (guest type เฉพาะ)
// 4. checkin_reminder_suite_enabled (room type เฉพาะ)
// 5. checkin_reminder_online_booking_enabled (channel เฉพาะ)
```

### **Quick Disable Examples**
```javascript
// ❌ ปิดเฉพาะ Check-in Reminders (อีเมลอื่นยังทำงาน)
await updateSetting('checkin_reminder_enabled', false, 'Too many complaints');

// ❌ ปิดเฉพาะ 24h timing (3h และ 1h ยังทำงาน)  
await updateSetting('checkin_reminder_24h_enabled', false, 'High bounce rate');

// ❌ ปิดเฉพาะ VIP guests (Regular guests ยังได้รับ)
await updateSetting('checkin_reminder_vip_enabled', false, 'VIP prefer calls');

// ❌ ปิดเฉพาะ Walk-in guests (Online bookings ยังได้รับ)
await updateSetting('checkin_reminder_walk_in_enabled', false, 'Already at hotel');
```

## 📊 Benefits of Granular Control

### ✅ **Precision**
- ปิดเฉพาะส่วนที่มีปัญหา
- เก็บส่วนที่ทำงานดีไว้
- ลดผลกระทบต่อลูกค้าอื่น

### ✅ **Flexibility**  
- แก้ปัญหาได้ทันที
- ทดสอบ strategy ใหม่ได้
- ปรับแต่งตาม feedback

### ✅ **Analytics**
- วัดผล A/B testing ได้
- เปรียบเทียบ conversion rate
- ปรับปรุงอย่างต่อเนื่อง

### ✅ **Customer Experience**
- ลดการรบกวนที่ไม่จำเป็น
- ปรับแต่งตาม preference
- เพิ่มความพึงพอใจ

---

## 🎯 Summary

**ตอนนี้คุณสามารถ:**
1. **ปิดเฉพาะ Check-in Reminder** โดยไม่กระทบอีเมลอื่น
2. **ปิดเฉพาะ timing เฉพาะ** เช่น 24h แต่เก็บ 3h, 1h
3. **ปิดเฉพาะ guest type** เช่น VIP แต่เก็บ regular  
4. **ปิดเฉพาะ room type** เช่น Suite แต่เก็บ Standard
5. **ปิดเฉพาะ booking channel** เช่น Walk-in แต่เก็บ Online

ระบบนี้ให้ความยืดหยุ่นสูงสุดในการจัดการปัญหาและปรับปรุงประสบการณ์ลูกค้า! 🎛️✨
