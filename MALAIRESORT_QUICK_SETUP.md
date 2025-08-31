# 🚀 Ready-to-Use Configuration for malairesort.com

## 📧 **Updated .env Configuration**

```bash
# ============================================
# EMAIL CONFIGURATION - MALAIRESORT.COM
# ============================================

# MailerSend API (คงเดิม)
MAILERSEND_API_TOKEN="mlsn.40d7509c3e466a6a3ee91686192b7eb6e5586136b3e67df05b66a50550ab58a4"

# Email Settings (อัพเดทแล้ว)
FROM_EMAIL="noreply@malairesort.com"
FROM_NAME="Malai Resort"
REPLY_TO_EMAIL="support@malairesort.com"
SUPPORT_EMAIL="support@malairesort.com"
ADMIN_EMAIL="admin@malairesort.com"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
# Production: FRONTEND_URL="https://malairesort.com"
```

---

## 📋 **DNS Records ที่ต้องเพิ่ม**

### **ใน Domain Provider (GoDaddy/Cloudflare/ฯลฯ):**

```dns
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:_spf.mlsend.com ~all
TTL: 300

# DKIM Record
Type: CNAME
Name: ml._domainkey
Value: ml._domainkey.mlsend.com
TTL: 300

# DMARC Record (Optional แต่แนะนำ)
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@malairesort.com
TTL: 300
```

---

## 🔄 **ขั้นตอนการทำงาน**

### **Step 1: เพิ่ม Domain ใน MailerSend**
1. เข้า https://app.mailersend.com/domains
2. คลิก **Add Domain**
3. ใส่: `malairesort.com`
4. เลือก **I want to send emails from this domain**

### **Step 2: เพิ่ม DNS Records**
1. คัดลอก DNS records จาก MailerSend
2. ไปที่ Domain Provider ของคุณ
3. เพิ่ม TXT และ CNAME records
4. Save และรอ propagation

### **Step 3: Verify Domain**
1. รอ 10-30 นาที
2. กลับไป MailerSend Dashboard
3. คลิก **Verify** ข้างชื่อ domain
4. ควรแสดง **Verified** ✅

### **Step 4: ทดสอบ**
1. Restart API server
2. ลอง password reset อีกครั้ง
3. ตอนนี้ควรส่งอีเมลได้แล้ว!

---

## 🧪 **ทดสอบ DNS Records**

### **Windows Command:**
```cmd
nslookup -type=TXT malairesort.com
nslookup -type=CNAME ml._domainkey.malairesort.com
```

### **Online Tools:**
- [DNS Checker](https://dnschecker.org/)
- [MX Toolbox](https://mxtoolbox.com/spf.aspx)
- [DKIM Validator](https://dkimvalidator.com/)

---

## 📊 **Expected Results**

### **Before Domain Setup:**
```
❌ Email fails to send
📋 Console fallback shows reset link
⚠️ "Test domain limitation" message
```

### **After Domain Setup:**
```
✅ Real email sent via MailerSend
📧 mongkol09ms@gmail.com receives email
🔗 Professional email template
📱 Mobile-friendly design
```

---

## 🎯 **Timeline**

### **ทันที (0-10 นาที):**
- เพิ่ม domain ใน MailerSend
- เพิ่ม DNS records

### **รอสักหน่อย (10-30 นาที):**
- DNS propagation
- Domain verification

### **พร้อมใช้งาน (30 นาที - 2 ชั่วโมง):**
- ส่งอีเมลได้จริง
- Test กับ mongkol09ms@gmail.com

---

## 💡 **Pro Tips**

### **Email Addresses แนะนำ:**
```
noreply@malairesort.com    # สำหรับระบบ auto email
support@malairesort.com    # สำหรับ customer support  
booking@malairesort.com    # สำหรับการจอง
admin@malairesort.com      # สำหรับผู้ดูแลระบบ
```

### **Subdomain Strategy:**
```
mail.malairesort.com       # Email subdomain
api.malairesort.com        # API subdomain
app.malairesort.com        # Frontend subdomain
```

### **Security Best Practices:**
- ใช้ DMARC policy `p=quarantine`
- Monitor email reputation
- Set up email forwarding สำหรับ admin emails

---

## 🚨 **Troubleshooting**

### **Domain ไม่ verify:**
- ตรวจสอบ DNS records อีกครั้ง
- รอให้ DNS propagate ทั่วโลก (24-48 ชั่วโมง)
- ใช้ DNS checker tools

### **อีเมลยังส่งไม่ได้:**
- ตรวจสอบ MAILERSEND_API_TOKEN
- ดู console logs หา error messages
- Verify ว่า FROM_EMAIL ตรงกับ verified domain

### **Reset link ไม่ทำงาน:**
- ตรวจสอบ FRONTEND_URL
- ตรวจสอบ reset-password route ใน frontend

---

## ✅ **Next Steps**

1. **ไปตั้งค่า DNS records ก่อน**
2. **รอ verification**  
3. **Restart API server**
4. **ทดสอบส่งอีเมล**
5. **Check inbox ของ mongkol09ms@gmail.com**

**เริ่มได้เลยครับ! ใช้เวลาแค่ 30 นาที - 2 ชั่วโมง** 🚀
