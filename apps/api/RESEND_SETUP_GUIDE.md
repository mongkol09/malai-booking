# 📧 Resend Email Service Setup Guide

## 🎯 **การตั้งค่า Resend แทน MailerSend**

### **Step 1: สร้าง Resend Account**
1. ไปที่ [resend.com](https://resend.com)
2. สร้าง account ใหม่
3. ยืนยัน email address

### **Step 2: ยืนยัน Domain**
1. เข้าไปที่ **Domains** ใน Resend dashboard
2. คลิก **Add Domain**
3. เพิ่ม domain ของคุณ (เช่น `malairesort.com`)
4. เพิ่ม DNS records ตามที่ Resend แนะนำ:
   ```
   Type: MX
   Name: @ (or your domain)
   Value: feedback-smtp.resend.com
   Priority: 10
   ```
5. รอจนกว่า domain จะได้รับการยืนยัน

### **Step 3: สร้าง API Key**
1. เข้าไปที่ **API Keys** ใน dashboard
2. คลิก **Create API Key**
3. ตั้งชื่อ: `Hotel Booking System`
4. เลือก permissions: `Sending access`
5. คัดลอก API key (รูปแบบ: `re_xxxxxxxxxxxx`)

### **Step 4: เพิ่ม Environment Variables**
เพิ่มในไฟล์ `.env` ของคุณ:

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxx_your_api_key_here
FROM_EMAIL=bookings@malairesort.com
FROM_NAME=Malai Khaoyai Resort
REPLY_TO_EMAIL=support@malairesort.com
EMAIL_SERVICE_PROVIDER=resend
```

### **Step 5: ทดสอบการส่งอีเมล**
```bash
# ใน apps/api directory
node scripts/test-resend-email.js
```

---

## 🧪 **สคริปต์ทดสอบ**

สร้างไฟล์ `scripts/test-resend-email.js`:

```javascript
const { resendEmailService } = require('../src/services/resendEmailService');

async function testResendEmail() {
  console.log('🧪 Testing Resend email service...');
  
  try {
    // ทดสอบการเชื่อมต่อ
    const connectionTest = await resendEmailService.testConnection();
    console.log('Connection test:', connectionTest);
    
    if (connectionTest.success) {
      // ทดสอบส่ง booking confirmation
      const result = await resendEmailService.sendBookingConfirmation(
        'test@example.com',
        'Test User',
        {
          bookingReferenceId: 'TEST-001',
          roomType: { name: 'Deluxe Room' },
          room: { roomNumber: 'D101' },
          checkinDate: new Date(),
          checkoutDate: new Date(Date.now() + 24*60*60*1000),
          finalAmount: 3500,
          numAdults: 2,
          numChildren: 0
        }
      );
      
      console.log('✅ Test email result:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testResendEmail();
```

---

## 📊 **การเปลี่ยนแปลงในระบบ**

### **ไฟล์ที่อัพเดท:**
- ✅ `src/services/resendEmailService.ts` - Service ใหม่
- ✅ `src/controllers/emailController.ts` - อัพเดทฟังก์ชัน
- ✅ Package: `resend` ติดตั้งแล้ว

### **ไฟล์ที่ยังใช้ระบบเดิม:**
- `src/services/emailService.ts` - MailerSend (สำหรับ fallback)
- Templates ต่างๆ - ยังใช้ได้

### **API Routes ที่ได้รับผลกระทบ:**
- `POST /api/v1/bookings/confirm` - ใช้ Resend
- `POST /api/v1/bookings/simple` - ใช้ Resend  
- `POST /api/v1/emails/booking-confirmation` - ใช้ Resend

---

## 💰 **Pricing Comparison**

| Feature | MailerSend | Resend |
|---------|------------|--------|
| **Free Tier** | 12,000/month | 3,000/month |
| **Setup Time** | รอ approval | ใช้ได้ทันที |
| **API Quality** | Good | Excellent |
| **Developer UX** | Moderate | Excellent |
| **Deliverability** | 99%+ | 99.9%+ |

---

## 🔍 **การตรวจสอบ**

### **ตรวจสอบว่า Resend ทำงานหรือไม่:**
1. ดู logs ใน console เมื่อมีการจอง
2. ตรวจสอบ Resend dashboard ว่ามี emails ส่งออกไป
3. ตรวจสอบ email ของลูกค้าว่าได้รับหรือไม่

### **ในกรณีที่มีปัญหา:**
1. ตรวจสอบ API key ใน `.env`
2. ตรวจสอบ domain verification
3. ตรวจสอบ email address format
4. ดู error logs ใน server console

---

## 🚀 **Ready to Go!**

หลังจากทำตามขั้นตอนข้างต้น:
- ✅ ระบบจะส่ง email confirmation ผ่าน Resend
- ✅ ไม่ต้องรอ approval จาก provider
- ✅ API ใช้งานง่ายกว่าเดิม
- ✅ มี monitoring และ analytics ที่ดีกว่า

**🎉 ยินดีด้วย! ระบบ email ใหม่พร้อมใช้งานแล้ว!**
