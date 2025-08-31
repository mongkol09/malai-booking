# 📧 Email Service Migration Plan

## 🎯 **เป้าหมาย:** 
เปลี่ยนจาก MailerSend (รอ approval) ไปใช้ **Resend** สำหรับ booking confirmation emails

---

## 📋 **Current Status:**
- ✅ MailerSend มี template: `z3m5jgrq390ldpyo`
- ❌ MailerSend ยังไม่ได้ approved
- ✅ Email service อยู่ใน `src/services/emailService.ts`
- ✅ Booking controller มีการเรียก email ใน `confirmBooking`

---

## 🚀 **Migration Steps:**

### **Step 1: Setup Resend Account**
1. ไปที่ [resend.com](https://resend.com)
2. สร้าง account
3. ยืนยัน domain (malairesort.com หรือ malaikhaoyai.com)
4. สร้าง API key

### **Step 2: Install Resend SDK**
```bash
npm install resend
```

### **Step 3: Create Resend Email Service**
```typescript
// src/services/resendEmailService.ts
import { Resend } from 'resend';

export class ResendEmailService {
  private resend: Resend;
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }
  
  async sendBookingConfirmation(booking, guest) {
    // Implementation here
  }
}
```

### **Step 4: Create Email Template**
- สร้าง HTML template ใหม่ใน Resend
- หรือใช้ React component template
- คัดลอก content จาก MailerSend template

### **Step 5: Update Environment Variables**
```env
# เพิ่มใน .env
RESEND_API_KEY=re_xxxxxxxxxx
EMAIL_SERVICE_PROVIDER=resend
```

### **Step 6: Update Controllers**
- อัพเดท `bookingController.ts`
- อัพเดท `simpleBookingController.ts`
- อัพเดท `emailController.ts`

### **Step 7: Testing**
1. ทดสอบส่ง email ใน development
2. ตรวจสอบ deliverability
3. ทดสอบ booking flow แบบเต็ม

---

## 💰 **Cost Comparison:**

| Service | Free Tier | Paid Plan | Approval Required |
|---------|-----------|-----------|-------------------|
| **Resend** | 3,000/month | $20/50k | ❌ No |
| **MailerSend** | 12,000/month | $25/50k | ✅ Yes |
| **SendGrid** | 100/day | $14.95/50k | ⚠️ Sometimes |
| **Brevo** | 300/day | $25/20k | ❌ No |

---

## 🎨 **Template Migration:**

### **MailerSend Template Content:**
```
Template ID: z3m5jgrq390ldpyo
- Booking confirmation
- Guest details
- QR code
- Hotel branding
```

### **Resend Template Structure:**
```typescript
const bookingConfirmationTemplate = {
  subject: "ยืนยันการจอง {{bookingId}} ที่ {{hotelName}}",
  html: `
    <div style="font-family: Arial;">
      <h1>ยืนยันการจอง</h1>
      <p>เลขที่การจอง: {{bookingId}}</p>
      <p>ผู้เข้าพัก: {{guestName}}</p>
      <p>ห้อง: {{roomNumber}}</p>
      <!-- QR Code -->
      <!-- Hotel details -->
    </div>
  `
};
```

---

## ⚡ **Quick Implementation (1 Hour):**

### **Fast Track Option:**
1. **สร้าง Resend account** (5 min)
2. **เพิ่ม Resend service** (20 min)
3. **สร้าง simple template** (15 min)
4. **Test กับ booking จริง** (20 min)

### **Alternative: SMTP Fallback**
หากต้องการเริ่มใช้ทันที สามารถใช้:
1. **Gmail SMTP** (ฟรี แต่จำกัด)
2. **Outlook SMTP** (ฟรี)
3. **Custom SMTP server**

---

## 🔧 **Implementation Code:**

### **Resend Service Example:**
```typescript
export const sendBookingConfirmationWithResend = async (booking, guest) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const emailData = {
    from: 'bookings@malairesort.com',
    to: guest.email,
    subject: `ยืนยันการจอง ${booking.bookingReferenceId}`,
    html: bookingConfirmationTemplate({
      guestName: `${guest.firstName} ${guest.lastName}`,
      bookingId: booking.bookingReferenceId,
      roomNumber: booking.room?.roomNumber,
      checkinDate: booking.checkinDate,
      checkoutDate: booking.checkoutDate,
      totalAmount: booking.finalAmount
    })
  };
  
  return await resend.emails.send(emailData);
};
```

---

## 📊 **Success Metrics:**
- ✅ Email delivery rate > 95%
- ✅ Setup time < 1 hour
- ✅ Cost < current solution
- ✅ No approval required
- ✅ Better developer experience

---

**Recommendation: ใช้ Resend เพราะไม่ต้องรออนุมัติและเริ่มใช้ได้ทันที!** 🚀
