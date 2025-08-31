# 📧 Dual Email Service System

## 🎯 **ความสามารถ:**
- ✅ **ใช้ MailerSend และ Resend พร้อมกัน**
- ✅ **Switch ระหว่าง 2 services ได้ทันที**
- ✅ **Auto failover** เมื่อ primary service ล้มเหลว
- ✅ **ใช้ template ที่มีอยู่แล้วใน MailerSend**
- ✅ **Monitoring และ health check**

---

## 🔧 **Environment Configuration:**

### **Option 1: MailerSend Primary (แนะนำ)**
```env
# ใช้ MailerSend เป็นหลัก (template ที่มีอยู่แล้ว)
EMAIL_PRIMARY_PROVIDER=mailersend
EMAIL_FALLBACK_PROVIDER=resend
EMAIL_AUTO_FAILOVER=true

# MailerSend (verified domain)
MAILERSEND_API_TOKEN=your_verified_token
BOOKING_CONFIRMATION_TEMPLATE_ID=z3m5jgrq390ldpyo

# Resend (backup)
RESEND_API_KEY=re_your_resend_key

# Common settings
FROM_EMAIL=bookings@malaikhaoyai.com
FROM_NAME=Malai Khaoyai Resort
```

### **Option 2: Resend Primary**
```env
# ใช้ Resend เป็นหลัก (developer-friendly)
EMAIL_PRIMARY_PROVIDER=resend
EMAIL_FALLBACK_PROVIDER=mailersend
EMAIL_AUTO_FAILOVER=true
```

### **Option 3: Single Service Only**
```env
# ใช้แค่ MailerSend
EMAIL_PRIMARY_PROVIDER=mailersend
EMAIL_FALLBACK_PROVIDER=mailersend
EMAIL_AUTO_FAILOVER=false
```

---

## 🚀 **การใช้งาน:**

### **1. Basic Email Sending**
```typescript
import { unifiedEmailService } from './services/unifiedEmailService';

// ส่งอีเมลผ่านระบบ unified (auto-switch)
const result = await unifiedEmailService.sendBookingConfirmation(
  'guest@email.com',
  'Guest Name', 
  bookingData
);
```

### **2. Manual Provider Switch**
```typescript
// เปลี่ยนเป็น Resend ชั่วคราว
await unifiedEmailService.switchPrimaryProvider(EmailProvider.RESEND);

// เปลี่ยนกลับเป็น MailerSend
await unifiedEmailService.switchPrimaryProvider(EmailProvider.MAILERSEND);
```

### **3. Health Check**
```typescript
// ตรวจสอบสถานะทุก services
const status = await unifiedEmailService.getServiceStatus();
console.log('Service Status:', status);

// ทดสอบทุก services
const testResults = await unifiedEmailService.testAllServices();
console.log('Test Results:', testResults);
```

---

## 📊 **ข้อดีของแต่ละ Service:**

### **MailerSend:**
- ✅ **Template ที่ทำไว้แล้ว** (z3m5jgrq390ldpyo)
- ✅ **Domain verified แล้ว** (malaikhaoyai.com)
- ✅ **Free tier 12,000 emails/month**
- ✅ **Advanced analytics**

### **Resend:**
- ✅ **Developer-friendly API**
- ✅ **Better reliability**  
- ✅ **React template support**
- ✅ **No approval process**

---

## 🔄 **Auto Failover Flow:**

```
1. 📧 Send email via PRIMARY service
2. ✅ Success? → Done!
3. ❌ Failed? → Try FALLBACK service  
4. ✅ Success? → Done (log failover)
5. ❌ Both failed? → Return error
```

**Example:**
- Primary: MailerSend → ❌ API limit exceeded
- Fallback: Resend → ✅ Success! 
- Result: Email sent via Resend (auto failover)

---

## 🧪 **Testing Scripts:**

### **Test Both Services:**
```bash
node scripts/test-unified-email.js
```

### **Test Specific Provider:**
```bash
# Test MailerSend only
EMAIL_PRIMARY_PROVIDER=mailersend node scripts/test-unified-email.js

# Test Resend only  
EMAIL_PRIMARY_PROVIDER=resend node scripts/test-unified-email.js
```

---

## 🎛️ **Dashboard Control (Future):**

**ในอนาคตสามารถเพิ่ม Admin Panel เพื่อ:**
- 🔄 Switch email provider real-time
- 📊 Monitor email delivery rates
- 📈 View service performance metrics
- ⚠️ Alert on service failures
- 🧪 Test email services

---

## 🚀 **Implementation Flow:**

### **Step 1: Update Controller**
```typescript
// แทนที่ในทุก controllers
import { unifiedEmailService } from '../services/unifiedEmailService';

// แทนที่
await sendBookingConfirmationEmailDirect(booking, guest, roomType);

// ด้วย
await unifiedEmailService.sendBookingConfirmation(
  guest.email,
  `${guest.firstName} ${guest.lastName}`,
  booking
);
```

### **Step 2: Configure Environment**
```env
# เพิ่มในไฟล์ .env
EMAIL_PRIMARY_PROVIDER=mailersend
EMAIL_FALLBACK_PROVIDER=resend  
EMAIL_AUTO_FAILOVER=true
```

### **Step 3: Test System**
```bash
# Test ทั้งระบบ
node scripts/test-unified-email.js
```

---

## 💡 **Recommendations:**

### **Production Setup:**
1. **Primary: MailerSend** (ใช้ template ที่มีแล้ว)
2. **Fallback: Resend** (backup reliability)
3. **Auto Failover: Enabled** (ความมั่นใจ 99.9%)

### **Development Setup:**
1. **Primary: Resend** (ง่ายกว่าในการทดสอบ)
2. **Fallback: MailerSend** (ทดสอบ template จริง)

---

## 🎊 **Benefits:**

✅ **ความเสถียร:** 2 providers = 99.9% uptime  
✅ **ความยืดหยุ่น:** เปลี่ยน provider ได้ทันที  
✅ **ใช้ template เก่า:** ไม่ต้องทำ template ใหม่  
✅ **Future-proof:** เพิ่ม provider อื่นได้ง่าย  
✅ **Monitoring:** ตรวจสอบ health ได้  

**🔥 Best of both worlds! 🔥**
