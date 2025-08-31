# 🚀 Production Email Setup Guide

## 🎯 **Current Status:**

### **MailerSend:**
- ✅ Domain verified: malaikhaoyai.com
- ✅ Template ready: z3m5jgrq390ldpyo  
- ⚠️ Trial account: Can only send to admin email
- 💰 Free tier: 12,000 emails/month after approval

### **Resend:**
- ✅ Working immediately
- ✅ No restrictions
- ✅ Verified and tested
- 💰 Free tier: 3,000 emails/month

---

## 📋 **Recommended Setup:**

### **Phase 1: Immediate Production (ตอนนี้)**
```env
# ใช้ Resend เป็นหลักเพราะไม่มีข้อจำกัด
EMAIL_PRIMARY_PROVIDER=resend
EMAIL_FALLBACK_PROVIDER=mailersend
EMAIL_AUTO_FAILOVER=true

# Resend configuration
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=onboarding@resend.dev  # ใช้ sandbox ชั่วคราว

# MailerSend configuration (for fallback)
MAILERSEND_API_TOKEN=your_verified_token
BOOKING_CONFIRMATION_TEMPLATE_ID=z3m5jgrq390ldpyo
```

### **Phase 2: Long-term Production (หลัง MailerSend approved)**
```env
# เปลี่ยนเป็น MailerSend หลัก (template สวย + free tier สูง)
EMAIL_PRIMARY_PROVIDER=mailersend
EMAIL_FALLBACK_PROVIDER=resend
EMAIL_AUTO_FAILOVER=true

# MailerSend configuration
MAILERSEND_API_TOKEN=your_approved_token
FROM_EMAIL=bookings@malaikhaoyai.com  # ใช้ domain จริง
BOOKING_CONFIRMATION_TEMPLATE_ID=z3m5jgrq390ldpyo

# Resend configuration (backup)
RESEND_API_KEY=re_your_api_key
```

---

## 🔄 **Auto Failover Benefits:**

### **Scenario 1: Resend Primary**
```
📧 Booking Email → Resend (primary)
✅ Success → Done!
❌ Failed → MailerSend (fallback)
```

### **Scenario 2: MailerSend Primary** 
```
📧 Booking Email → MailerSend (primary)
✅ Success → Beautiful template!
❌ Failed → Resend (fallback)
```

---

## ⚡ **Quick Implementation:**

### **1. Update .env file:**
```bash
# เพิ่มใน .env
EMAIL_PRIMARY_PROVIDER=resend
EMAIL_FALLBACK_PROVIDER=mailersend
EMAIL_AUTO_FAILOVER=true
```

### **2. Update Controllers:**
```typescript
// แทนที่ในทุก controllers
import { unifiedEmailService } from '../services/unifiedEmailService';

// เปลี่ยนจาก
await sendBookingConfirmationEmailDirect(booking, guest, roomType);

// เป็น
await unifiedEmailService.sendBookingConfirmation(
  guest.email,
  `${guest.firstName} ${guest.lastName}`,
  booking
);
```

### **3. Test System:**
```bash
node scripts/test-unified-email.js
```

---

## 📊 **Cost Comparison:**

| Provider | Free Tier | Template | Domain | Restrictions |
|----------|-----------|----------|---------|--------------|
| **MailerSend** | 12k/month | ✅ Ready | ✅ Verified | ⚠️ Trial only admin |
| **Resend** | 3k/month | 🔧 HTML | 🔄 Sandbox | ✅ No restrictions |

---

## 🎯 **Advantages of Dual System:**

### **Business Continuity:**
- 📧 **99.9% Email delivery** (2 providers)
- 🔄 **Auto switch** on service issues
- 📊 **Best of both worlds** (template + reliability)

### **Flexibility:**
- 🎛️ **Switch providers** via environment variable
- 🧪 **A/B testing** different services
- 💰 **Cost optimization** (use free tiers strategically)

### **Risk Mitigation:**
- 🛡️ **No single point of failure**
- 📈 **Service outage protection**
- 🔧 **Easy maintenance** and updates

---

## 🚀 **Ready to Deploy:**

### **Immediate Steps:**
1. ✅ Set EMAIL_PRIMARY_PROVIDER=resend
2. ✅ Test booking creation
3. ✅ Monitor email delivery
4. 🔄 Switch to MailerSend when trial approved

### **Long-term Plan:**
1. 📧 Request MailerSend trial approval
2. 🔄 Switch primary to MailerSend
3. 🎨 Use beautiful existing template
4. 💰 Enjoy 12k free emails/month

---

## 🎊 **Perfect Solution:**

✅ **Immediate:** Use Resend (no restrictions)  
✅ **Future:** Use MailerSend (beautiful template)  
✅ **Always:** Auto failover for 99.9% uptime  
✅ **Flexible:** Switch anytime via config  

**🔥 Best email strategy for your hotel! 🔥**
