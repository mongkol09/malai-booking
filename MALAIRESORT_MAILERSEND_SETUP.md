# 🌐 การตั้งค่า Domain malairesort.com กับ MailerSend

## 📋 **ขั้นตอนการตั้งค่า**

### **Step 1: เพิ่ม Domain ใน MailerSend**
1. เข้า [MailerSend Dashboard](https://app.mailersend.com/)
2. ไป **Domains** → **Add Domain**
3. ใส่ `malairesort.com`
4. เลือก **Use for sending emails**

### **Step 2: ตั้งค่า DNS Records**
MailerSend จะให้ DNS records ที่ต้องเพิ่มใน Domain ของคุณ:

#### **A. SPF Record (TXT Record)**
```
Type: TXT
Name: @ (หรือ malairesort.com)
Value: v=spf1 include:_spf.mlsend.com ~all
TTL: 300
```

#### **B. DKIM Record (CNAME)**
```
Type: CNAME
Name: ml._domainkey
Value: ml._domainkey.mlsend.com
TTL: 300
```

#### **C. DMARC Record (TXT Record) - ไม่บังคับแต่แนะนำ**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@malairesort.com
TTL: 300
```

### **Step 3: Verify Domain**
1. หลังจากเพิ่ม DNS records แล้ว
2. รอ 10-30 นาที (DNS propagation)
3. กดปุ่ม **Verify** ใน MailerSend
4. จะได้สถานะ **Verified** ✅

---

## 🔧 **ที่ต้องทำใน Domain Provider**

### **กรณีใช้ Cloudflare:**
1. เข้า Cloudflare Dashboard
2. เลือก `malairesort.com`
3. ไป **DNS** tab
4. เพิ่ม records ตามด้านบน

### **กรณีใช้ GoDaddy/Namecheap:**
1. เข้า DNS Management
2. เพิ่ม TXT และ CNAME records
3. Save changes

### **กรณีใช้ Provider อื่น:**
- หาหน้า **DNS Management** หรือ **Zone File Editor**
- เพิ่ม records ตามที่ MailerSend บอก

---

## 📧 **ปรับ Environment Variables**

### **ใน .env (apps/api/.env):**
```bash
# MailerSend Configuration
MAILERSEND_API_TOKEN=your_mailersend_token
FROM_EMAIL=noreply@malairesort.com
FROM_NAME=Malai Resort
REPLY_TO_EMAIL=support@malairesort.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
# ใน production จะเป็น: https://malairesort.com
```

---

## 🧪 **การทดสอบหลังตั้งค่า**

### **Test 1: ตรวจสอบ DNS**
```bash
# ตรวจสอบ SPF record
nslookup -type=TXT malairesort.com

# ตรวจสอบ DKIM record  
nslookup -type=CNAME ml._domainkey.malairesort.com
```

### **Test 2: ส่งอีเมลทดสอบ**
```javascript
// หลังจาก verify domain แล้ว
// ลองส่ง password reset ไปยัง mongkol09ms@gmail.com
// ควรส่งได้แล้ว!
```

---

## ⚠️ **ข้อควรระวัง**

### **DNS Propagation Time:**
- **Local:** 10-30 นาที
- **Global:** 24-48 ชั่วโมง
- ใช้ [DNS Checker](https://dnschecker.org/) ตรวจสอบ

### **Email Subdomain (แนะนำ):**
แทนที่จะใช้ `noreply@malairesort.com` ให้สร้าง subdomain:
- `mail.malairesort.com` 
- `noreply@mail.malairesort.com`
- ป้องกัน main domain ถ้ามี email reputation ไม่ดี

---

## 🚀 **ขั้นตอนสำหรับ Production Deploy**

### **Phase 1: Email Setup (ทำได้เลย)**
1. ✅ ตั้งค่า DNS records
2. ✅ Verify domain ใน MailerSend
3. ✅ อัพเดท environment variables
4. ✅ ทดสอบส่งอีเมล

### **Phase 2: Web Hosting (ไม่จำเป็นสำหรับ Email)**
- Email ทำงานได้แล้วโดยไม่ต้อง deploy website
- แต่ถ้าต้องการ reset link ที่ production ต้องมี:
  - Frontend hosting (Vercel, Netlify, etc.)
  - Backend hosting (Railway, Heroku, VPS, etc.)

### **Phase 3: SSL Certificate**
- สำหรับ https://malairesort.com
- ใช้ Cloudflare (ฟรี) หรือ Let's Encrypt

---

## 📝 **Quick Start Checklist**

### **ทำทันที (ไม่ต้อง deploy):**
- [ ] เข้า MailerSend Dashboard
- [ ] เพิ่ม domain `malairesort.com`
- [ ] เพิ่ม DNS records ใน domain provider
- [ ] รอ DNS propagation (10-30 นาที)
- [ ] Verify domain ใน MailerSend
- [ ] อัพเดท .env file
- [ ] Restart API server
- [ ] ทดสอบส่งอีเมล

### **ทำทีหลัง (สำหรับ Production):**
- [ ] Deploy frontend & backend
- [ ] ตั้งค่า HTTPS
- [ ] อัพเดท FRONTEND_URL
- [ ] ทดสอบ production

---

## 💡 **Pro Tips**

### **Email Best Practices:**
```bash
# แนะนำให้ใช้ subdomain
FROM_EMAIL=noreply@mail.malairesort.com
REPLY_TO_EMAIL=support@malairesort.com

# หรือใช้ department-specific
FROM_EMAIL=booking@malairesort.com
FROM_EMAIL=support@malairesort.com
```

### **Testing Strategy:**
1. **Development:** Console fallback (ตอนนี้)
2. **Staging:** MailerSend กับ verified domain
3. **Production:** Full email service

---

## ❓ **FAQs**

**Q: ต้อง deploy website ก่อนไหม?**
A: ไม่ต้อง! Email service ทำงานแยกจาก website

**Q: DNS ใช้เวลานานไหม?**
A: ปกติ 10-30 นาที, บางครั้งถึง 24 ชั่วโมง

**Q: ถ้า verify ไม่ผ่านทำไง?**
A: ตรวจสอบ DNS records อีกครั้ง และรอให้ propagate

**Q: ต้องใช้ Cloudflare ไหม?**
A: ไม่จำเป็น แต่แนะนำเพราะง่ายและมี SSL ฟรี

---

## 🎯 **Next Steps**

1. **เริ่มจาก DNS Setup** ก่อน
2. **ทดสอบ Email** หลัง verify
3. **Deploy Website** ทีหลัง (ถ้าต้องการ)

**เริ่มจากขั้นตอนแรกได้เลยครับ!** 🚀
