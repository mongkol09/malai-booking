# 📧 MailerSend Domain Setup Guide

## 🚨 **ปัญหาปัจจุบัน: Test Domain Limitation**

**MailerSend Test Domain** มีข้อจำกัด:
- ✅ ส่งได้เฉพาะ **verified email addresses** เท่านั้น
- ❌ ไม่สามารถส่งไปยัง email อื่นๆ ได้ (เช่น mongkol09ms@gmail.com)
- ⚠️ จำกัดจำนวนอีเมลที่ส่งได้

---

## 🔧 **วิธีแก้ไข: 3 ตัวเลือก**

### **Option 1: Verify Individual Email (ง่ายที่สุด)**
1. เข้า [MailerSend Dashboard](https://app.mailersend.com/)
2. ไป **Settings** → **Verified Emails**
3. เพิ่ม `mongkol09ms@gmail.com`
4. ตรวจสอบอีเมลและ verify

### **Option 2: Add Custom Domain (แนะนำสำหรับ Production)**
1. เข้า **Domain Management**
2. เพิ่ม domain ของคุณ (เช่น `hotel.com`)
3. ตั้งค่า DNS records:
   ```
   TXT Record: v=spf1 include:_spf.mlsend.com ~all
   CNAME Record: ml._domainkey → ml._domainkey.mlsend.com
   ```
4. Verify domain

### **Option 3: ใช้ Development Fallback (ชั่วคราว)**
ผมได้ปรับโค้ดให้ใช้ console logging สำหรับ development แล้ว

---

## 💻 **Development Solution (ใช้ได้ทันที)**

ตอนนี้ระบบจะ:
- 🔍 ตรวจสอบว่าเป็น development mode หรือไม่
- 📧 ถ้าอีเมลไม่ verified → แสดงใน console
- ✅ ถ้าอีเมล verified → ส่งจริงผ่าน MailerSend

### **Console Output Example:**
```
📧 PASSWORD RESET EMAIL (DEVELOPMENT):
════════════════════════════════════════════════════════════
📮 To: mongkol09ms@gmail.com
📝 Subject: รีเซ็ตรหัสผ่าน - Hotel Management System
🔗 Reset URL: http://localhost:3000/admin/reset-password?token=abc123...
🎫 Token: abc123...
⏰ Expires: 60 minutes
════════════════════════════════════════════════════════════
✅ In production, this would be sent via MailerSend
🔧 To test real emails, verify your domain in MailerSend
```

---

## 🧪 **ทดสอบตอนนี้**

1. **Restart API Server** (เพื่อโหลดโค้ดใหม่)
2. **ลองส่ง Password Reset** ที่ http://localhost:3000/password-reset
3. **ดู Console ของ API Server** จะแสดง reset link
4. **คัดลอก Reset URL** ไปใส่ในเบราว์เซอร์

---

## 🚀 **Production Setup**

### **Environment Variables**
```bash
# MailerSend API
MAILERSEND_API_TOKEN=your_production_token
FROM_EMAIL=noreply@yourhotel.com
FROM_NAME=Your Hotel Name
REPLY_TO_EMAIL=support@yourhotel.com

# Frontend URL
FRONTEND_URL=https://yourhotel.com
NODE_ENV=production
```

### **Verified Emails for Testing**
เพิ่มอีเมลเหล่านี้ใน MailerSend:
- `mongkol09ms@gmail.com` (สำหรับทดสอบ)
- `support@yourhotel.com` (สำหรับ support)
- อีเมลของทีมพัฒนาอื่นๆ

---

## 📋 **Summary**

### **ตอนนี้ (Development)**:
- ✅ ระบบทำงานได้ผ่าน console fallback
- ✅ แสดง reset link ใน console
- ✅ สามารถทดสอบ flow ได้ครบ

### **ใน Production**:
- 🔧 ต้อง verify domain หรือ individual emails
- 📧 อีเมลจะส่งจริงผ่าน MailerSend
- 🔒 ปลอดภัยและเชื่อถือได้

**ลองทดสอบดูครับ! ตอนนี้ควรทำงานได้แล้ว** 🚀
