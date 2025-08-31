# 🎛️ Email Control Panel Implementation Guide

## 📋 Overview
ระบบควบคุมเปิด/ปิดการส่งอีเมล Check-in Reminder และอีเมลประเภทอื่นๆ ในหน้า Admin Frontend ที่สามารถจัดการได้แบบ Real-time

## 🗂️ Files Created

### 1. Database Schema
```
📁 database/
  └── email_settings_schema.sql     # Schema สำหรับตาราง EmailSettings และ Audit
```

### 2. Backend Components
```
📁 apps/api/src/
  ├── controllers/
  │   └── emailSettingsController.ts    # API Controller สำหรับจัดการ Settings
  ├── services/
  │   └── emailSettingsService.ts       # Business Logic สำหรับตรวจสอบ Settings
  └── routes/
      └── emailSettingsRoutes.ts        # API Routes
```

### 3. Frontend Components
```
📁 app/admin/src/
  └── components/
      └── EmailControlPanel.jsx         # React Component สำหรับ Admin Panel
```

## 🔧 Installation Steps

### Step 1: Database Setup
```sql
-- รัน SQL script เพื่อสร้างตารางและ default settings
psql -d hotel_booking -f database/email_settings_schema.sql
```

### Step 2: Backend Integration
```javascript
// 1. เพิ่ม Routes ใน main app
// apps/api/src/app.ts หรือ index.ts
import emailSettingsRoutes from './routes/emailSettingsRoutes';
app.use('/api/v1/admin/email-settings', emailSettingsRoutes);

// 2. อัปเดต emailService ให้ใช้ permission check
// ใน emailController.ts หรือจุดที่ส่งอีเมล
import { emailService } from './services/emailService';

// เปลี่ยนจาก
// await emailService.sendHtmlEmail(emailData);

// เป็น
// await emailService.sendEmailWithPermissionCheck(emailData);
```

### Step 3: Frontend Integration
```javascript
// 1. เพิ่ม Component ใน Admin App
// app/admin/src/Routes.jsx
import EmailControlPanel from './components/EmailControlPanel';

// 2. เพิ่ม Route
{
  path: "/email-control",
  element: <EmailControlPanel />
}

// 3. เพิ่มใน Navigation Menu
{
  title: "Email Control",
  path: "/email-control",
  icon: "Settings"
}
```

## 🎯 Features & Usage

### 🔐 System-wide Controls
- **Email Service Enabled**: เปิด/ปิดระบบส่งอีเมลทั้งหมด
- **Email Queue Enabled**: เปิด/ปิดระบบคิวอีเมล
- **Email Retry Enabled**: เปิด/ปิดการลองส่งซ้ำ
- **Email Debug Mode**: โหมดทดสอบ (ไม่ส่งอีเมลจริง)

### 📧 Email Type Controls
- **Booking Confirmation**: เปิด/ปิดอีเมลยืนยันการจอง
- **Payment Receipt**: เปิด/ปิดอีเมลใบเสร็จ
- **Check-in Reminder**: เปิด/ปิดอีเมลแจ้งเตือนเช็คอิน

### 🚨 Emergency Controls
- **Disable All**: ปิดการส่งอีเมลทั้งหมดฉุกเฉิน
- **Enable All**: เปิดการส่งอีเมลทั้งหมด
- **Audit Trail**: ติดตามการเปลี่ยนแปลงทั้งหมด

## 🔍 How It Works

### 1. Permission Check Flow
```javascript
// ก่อนส่งอีเมล Check-in Reminder
const emailData = {
  type: EmailType.CHECKIN_REMINDER,
  to: 'customer@email.com',
  // ... other data
};

// ระบบจะตรวจสอบ settings อัตโนมัติ
const result = await emailService.sendEmailWithPermissionCheck(emailData);

if (result.blocked) {
  console.log('Email blocked:', result.error);
  // ระบบจะไม่ส่งอีเมลและบันทึก log
}
```

### 2. Settings Caching
- Cache settings เป็นเวลา 30 วินาที
- Auto-refresh เมื่อมีการเปลี่ยนแปลง
- Fallback เป็น `false` เมื่อเกิดข้อผิดพลาด (ปลอดภัย)

### 3. Audit Logging
- บันทึกการเปลี่ยนแปลงทุกครั้ง
- เก็บ IP Address และ User Agent
- ระบุผู้ทำการเปลี่ยนแปลงและเหตุผล

## 📊 Database Tables

### EmailSettings
```sql
- setting_id (UUID, PK)
- setting_key (VARCHAR, Unique) -- 'checkin_reminder_enabled'
- setting_value (BOOLEAN)
- email_type (VARCHAR)          -- 'checkin_reminder'
- description (TEXT)
- last_updated_by (UUID)
- created_at, updated_at
```

### EmailSettingsAudit
```sql
- audit_id (UUID, PK)
- setting_id (UUID, FK)
- setting_key (VARCHAR)
- old_value (BOOLEAN)
- new_value (BOOLEAN)
- changed_by (UUID, FK)
- changed_reason (VARCHAR)
- ip_address (INET)
- user_agent (TEXT)
- created_at
```

## 🔧 API Endpoints

### GET /api/v1/admin/email-settings
ดึงการตั้งค่าทั้งหมด

### PUT /api/v1/admin/email-settings/:settingKey
อัปเดตการตั้งค่าเดียว
```json
{
  "settingValue": false,
  "reason": "Maintenance period"
}
```

### PUT /api/v1/admin/email-settings/bulk
อัปเดตหลายการตั้งค่าพร้อมกัน

### POST /api/v1/admin/email-settings/emergency-toggle
ควบคุมฉุกเฉิน
```json
{
  "action": "disable_all",
  "reason": "System maintenance"
}
```

### GET /api/v1/admin/email-settings/audit
ดู audit log

### GET /api/v1/admin/email-settings/check/:settingKey
ตรวจสอบการตั้งค่าเฉพาะ

## 🔒 Security Features

### Authentication Required
- ต้องมี JWT token ที่ valid
- ต้องเป็น Admin role
- IP Address tracking

### Audit Trail
- บันทึกการเปลี่ยนแปลงทุกครั้ง
- ไม่สามารถลบ audit log ได้
- Immutable history

### Safe Defaults
- เมื่อเกิดข้อผิดพลาด จะ block การส่งอีเมล
- Cache timeout กันการ query database บ่อยเกินไป
- Validation ทุก input

## 🚀 Deployment Checklist

### 1. Database Migration
- [ ] รัน email_settings_schema.sql
- [ ] ตรวจสอบ default settings
- [ ] Test database functions

### 2. Backend Deployment
- [ ] เพิ่ม emailSettingsController
- [ ] เพิ่ม emailSettingsService  
- [ ] เพิ่ม routes ใน main app
- [ ] อัปเดต emailService ให้ใช้ permission check
- [ ] Test API endpoints

### 3. Frontend Deployment
- [ ] เพิ่ม EmailControlPanel component
- [ ] เพิ่ม route ใน navigation
- [ ] เพิ่มใน admin menu
- [ ] Test UI functionality

### 4. Testing
- [ ] ทดสอบเปิด/ปิด check-in reminder
- [ ] ทดสอบ emergency toggle
- [ ] ทดสอบ audit logging
- [ ] ทดสอบ permission check ใน email sending

## 📈 Usage Examples

### Example 1: Disable Check-in Reminders
```javascript
// ผ่าน API
PUT /api/v1/admin/email-settings/checkin_reminder_enabled
{
  "settingValue": false,
  "reason": "High email bounce rate"
}

// ผลลัพธ์: อีเมล check-in reminder จะถูกบล็อกทั้งหมด
```

### Example 2: Emergency Shutdown
```javascript
// ปิดระบบส่งอีเมลทั้งหมดฉุกเฉิน
POST /api/v1/admin/email-settings/emergency-toggle
{
  "action": "disable_all",
  "reason": "Email provider maintenance"
}

// ผลลัพธ์: อีเมลทุกประเภทจะถูกบล็อก
```

### Example 3: Debug Mode
```javascript
// เปิด debug mode เพื่อทดสอบ
PUT /api/v1/admin/email-settings/email_debug_mode
{
  "settingValue": true,
  "reason": "Testing new email templates"
}

// ผลลัพธ์: อีเมลจะไม่ถูกส่งจริง แต่จะแสดง log ใน console
```

## 💡 Best Practices

### 1. Change Management
- ระบุเหตุผลทุกครั้งที่เปลี่ยนแปลง
- Coordinate กับทีมก่อนปิดระบบ
- Monitor email metrics หลังเปลี่ยนแปลง

### 2. Monitoring
- ตรวจสอบ audit log เป็นประจำ
- Set up alerts สำหรับการเปลี่ยนแปลงสำคัญ
- Monitor email delivery rates

### 3. Testing
- ทดสอบใน debug mode ก่อน
- ใช้ test email addresses
- Verify settings ก่อน production

---

## ✅ Summary

ระบบนี้ให้คุณสามารถ:
1. **เปิด/ปิด Check-in Reminder emails** ได้ทันที
2. **ควบคุมระบบส่งอีเมลทั้งหมด** ในกรณีฉุกเฉิน
3. **ติดตามการเปลี่ยนแปลง** ผ่าน audit trail
4. **ทดสอบระบบ** ด้วย debug mode
5. **จัดการได้ง่าย** ผ่านหน้า admin ที่ใช้งานสะดวก

ระบบนี้ช่วยให้คุณมีความยืดหยุ่นในการจัดการระบบส่งอีเมลและสามารถตอบสนองต่อสถานการณ์ต่างๆ ได้อย่างรวดเร็วและปลอดภัย!
