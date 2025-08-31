# 🚀 คู่มือ Set Domain ใน Cloudflare แบบละเอียด Step-by-Step

## 📋 **Overview ก่อนเริ่ม**

### **สิ่งที่คุณต้องมี:**
- [ ] Domain `malairesort.com` (ซื้อจากที่ไหนก็ได้)
- [ ] Account Cloudflare (สมัครฟรี)
- [ ] Access ไปยัง Domain Management ของ registrar เดิม

### **สิ่งที่เราจะทำ:**
1. **เพิ่ม Domain เข้า Cloudflare**
2. **ย้าย DNS จาก Registrar → Cloudflare**
3. **ตั้งค่า DNS Records สำหรับ MailerSend**
4. **Verify การทำงาน**

---

## 🎯 **PART 1: สมัครและเพิ่ม Domain ใน Cloudflare**

### **STEP 1.1: สมัคร Cloudflare Account**

1. **เข้าเว็บ:** https://dash.cloudflare.com/sign-up

2. **กรอกข้อมูล:**
   ```
   Email: [อีเมลของคุณ]
   Password: [รหัสผ่านที่แข็งแกร่ง]
   ✅ I agree to Cloudflare's Terms...
   [Create Account]
   ```

3. **Verify Email:**
   - เช็คอีเมล inbox
   - คลิกลิงก์ verify
   - กลับไปหน้า Cloudflare

### **STEP 1.2: เพิ่ม Domain เข้า Cloudflare**

1. **หน้าแรกหลัง Login:**
   ```
   [Add a Site] ← คลิกปุ่มนี้
   ```

2. **ใส่ชื่อ Domain:**
   ```
   Enter your site (example.com)
   ┌─────────────────────────────┐
   │ malairesort.com             │ ← พิมพ์ตรงนี้
   └─────────────────────────────┘
   [Add Site]
   ```

3. **เลือก Plan:**
   ```
   ✅ Free Plan ($ 0 /month)
   [Continue]
   ```

4. **Cloudflare จะ Scan DNS Records:**
   ```
   Scanning DNS records for malairesort.com...
   ⏳ Please wait...
   ```

### **STEP 1.3: ตรวจสอบ DNS Records ที่ Scan ได้**

Cloudflare จะแสดง records ที่เจอ:
```
Found DNS Records:
┌──────────┬─────────────┬──────────────────────┬─────┐
│ Type     │ Name        │ Content              │ TTL │
├──────────┼─────────────┼──────────────────────┼─────┤
│ A        │ @           │ 192.168.1.100        │ Auto│
│ CNAME    │ www         │ malairesort.com      │ Auto│
│ MX       │ @           │ mail.malairesort.com │ Auto│
└──────────┴─────────────┴──────────────────────┴─────┘

[Continue] ← คลิก
```

---

## 🔧 **PART 2: เปลี่ยน Nameservers**

### **STEP 2.1: รับ Nameservers จาก Cloudflare**

Cloudflare จะให้ nameservers 2 ตัว:
```
Update your nameservers

Replace your registrar's nameservers with:
┌──────────────────────────────────────┐
│ aldo.ns.cloudflare.com               │ ← copy ตัวนี้
│ sara.ns.cloudflare.com               │ ← copy ตัวนี้
└──────────────────────────────────────┘

⚠️ Important: This change may take up to 24 hours
```

### **STEP 2.2: เปลี่ยน Nameservers ที่ Registrar**

**📍 ถ้าใช้ Namecheap:**

1. **Login Namecheap:** https://ap.www.namecheap.com/
2. **ไป Domain List:**
   ```
   Dashboard → Domain List
   ```
3. **หา malairesort.com:**
   ```
   malairesort.com    [Manage] ← คลิก
   ```
4. **เปลี่ยน Nameservers:**
   ```
   NAMESERVERS
   ┌─────────────────────────────────────┐
   │ ● Custom DNS                        │ ← เลือกตัวนี้
   │ ○ Namecheap BasicDNS               │
   └─────────────────────────────────────┘
   
   Nameserver 1: [aldo.ns.cloudflare.com    ]
   Nameserver 2: [sara.ns.cloudflare.com    ]
   
   [Save] ← คลิก
   ```

**📍 ถ้าใช้ GoDaddy:**

1. **Login GoDaddy:** https://account.godaddy.com/
2. **ไป My Products:**
   ```
   My Products → Domains → DNS
   ```
3. **หา malairesort.com:**
   ```
   malairesort.com    [DNS] ← คลิก
   ```
4. **เปลี่ยน Nameservers:**
   ```
   Nameservers
   ┌─────────────────────────────────────┐
   │ ● I'll use my own nameservers       │ ← เลือก
   └─────────────────────────────────────┘
   
   Nameserver 1: aldo.ns.cloudflare.com
   Nameserver 2: sara.ns.cloudflare.com
   
   [Save]
   ```

### **STEP 2.3: รอ DNS Propagation**

```
⏳ DNS Propagation: 5 นาที - 24 ชั่วโมง
📊 ปกติ: 30 นาที - 2 ชั่วโมง
```

**ตรวจสอบความคืบหน้า:**
- กลับไป Cloudflare Dashboard
- จะเห็น status: "Pending" → "Active"

---

## 📧 **PART 3: ตั้งค่า DNS Records สำหรับ MailerSend**

### **STEP 3.1: เข้าไป DNS Management**

1. **ใน Cloudflare Dashboard:**
   ```
   malairesort.com → [DNS] tab
   ```

2. **หน้า DNS Management:**
   ```
   DNS Records for malairesort.com
   ┌─────────────────────────────────────────────────────┐
   │ [Add record]                              [Import]  │
   └─────────────────────────────────────────────────────┘
   ```

### **STEP 3.2: เพิ่ม SPF Record (TXT)**

1. **คลิก [Add record]**

2. **กรอกข้อมูล SPF:**
   ```
   Add DNS record
   
   Type: [TXT        ▼] ← เลือก TXT
   Name: [@              ] ← พิมพ์ @ (หรือ malairesort.com)
   TTL:  [Auto       ▼] ← ปล่อยเป็น Auto
   Content: ┌─────────────────────────────────────────┐
            │ v=spf1 include:_spf.mailersend.net ~all │ ← copy/paste
            └─────────────────────────────────────────┘
   
   Proxy status: [🔘 DNS only] ← สำคัญ! ต้องเป็น DNS only
   
   [Save]
   ```

**✅ ผลลัพธ์ที่ได้:**
```
Type  Name  Content                                  TTL   Proxy
TXT   @     v=spf1 include:_spf.mailersend.net ~all Auto  DNS only
```

### **STEP 3.3: เพิ่ม DKIM Record (CNAME)**

1. **คลิก [Add record] อีกครั้ง**

2. **กรอกข้อมูล DKIM:**
   ```
   Add DNS record
   
   Type: [CNAME      ▼] ← เลือก CNAME
   Name: [mlsend2._domainkey] ← พิมพ์ชื่อนี้เป๊ะ ๆ
   TTL:  [Auto       ▼] ← ปล่อยเป็น Auto
   Target: ┌─────────────────────────────────────────────┐
           │ mlsend2._domainkey.mailersend.net           │ ← copy/paste
           └─────────────────────────────────────────────┘
   
   Proxy status: [🔘 DNS only] ← สำคัญ! ต้องเป็น DNS only
   
   [Save]
   ```

**✅ ผลลัพธ์ที่ได้:**
```
Type   Name                  Target                              TTL   Proxy
CNAME  mlsend2._domainkey   mlsend2._domainkey.mailersend.net   Auto  DNS only
```

### **STEP 3.4: เพิ่ม Return-Path Record (CNAME)**

1. **คลิก [Add record] อีกครั้ง**

2. **กรอกข้อมูล Return-Path:**
   ```
   Add DNS record
   
   Type: [CNAME      ▼] ← เลือก CNAME
   Name: [malaikhaoyai   ] ← พิมพ์ชื่อนี้ (จาก MailerSend)
   TTL:  [Auto       ▼] ← ปล่อยเป็น Auto
   Target: ┌─────────────────────────────────────────────┐
           │ mailersend.net                              │ ← copy/paste
           └─────────────────────────────────────────────┘
   
   Proxy status: [🔘 DNS only] ← สำคัญ! ต้องเป็น DNS only
   
   [Save]
   ```

**✅ ผลลัพธ์ที่ได้:**
```
Type   Name          Target           TTL   Proxy
CNAME  malaikhaoyai  mailersend.net   Auto  DNS only
```

### **STEP 3.5: ตรวจสอบ DNS Records ทั้งหมด**

**หน้า DNS Records ควรมี:**
```
DNS Records for malairesort.com
┌───────┬─────────────────────┬─────────────────────────────────────┬──────┬──────────┐
│ Type  │ Name                │ Content/Target                      │ TTL  │ Proxy    │
├───────┼─────────────────────┼─────────────────────────────────────┼──────┼──────────┤
│ TXT   │ @                   │ v=spf1 include:_spf.mailersend.n... │ Auto │ DNS only │
│ CNAME │ mlsend2._domainkey  │ mlsend2._domainkey.mailersend.net   │ Auto │ DNS only │
│ CNAME │ malaikhaoyai        │ mailersend.net                      │ Auto │ DNS only │
└───────┴─────────────────────┴─────────────────────────────────────┴──────┴──────────┘
```

---

## ✅ **PART 4: Verify การทำงาน**

### **STEP 4.1: ตรวจสอบ DNS Propagation**

**Online Tools:**
```
🔍 DNS Checker: https://dnschecker.org/
🔍 What's My DNS: https://www.whatsmydns.net/
```

**ใช้ Command Line:**
```powershell
# ตรวจสอบ SPF
nslookup -type=TXT malairesort.com

# ตรวจสอบ DKIM  
nslookup -type=CNAME mlsend2._domainkey.malairesort.com

# ตรวจสอบ Return-Path
nslookup -type=CNAME malaikhaoyai.malairesort.com
```

**✅ ผลลัพธ์ที่ต้องการ:**
```
SPF: v=spf1 include:_spf.mailersend.net ~all
DKIM: mlsend2._domainkey.mailersend.net
Return-Path: mailersend.net
```

### **STEP 4.2: Verify ใน MailerSend**

1. **เข้า MailerSend Dashboard:**
   ```
   https://app.mailersend.com/domains
   ```

2. **หา Domain ของคุณ:**
   ```
   malairesort.com    [Verify] ← คลิก
   ```

3. **ผลลัพธ์ที่คาดหวัง:**
   ```
   Domain Verification Status
   ✅ SPF Record: Verified
   ✅ DKIM Record: Verified
   ✅ Return-Path: Verified
   ✅ Domain Status: Active
   ```

---

## 🚀 **PART 5: Test Email System**

### **STEP 5.1: Update .env File**

ตรวจสอบไฟล์ `.env`:
```env
# MailerSend Settings
MAILERSEND_API_TOKEN=mlsnd_your_api_token_here
MAILERSEND_FROM_EMAIL=noreply@malairesort.com
MAILERSEND_FROM_NAME=Malai Resort

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### **STEP 5.2: Restart API Server**

```powershell
cd d:\Hotel_booking\apps\api
npm run dev
```

### **STEP 5.3: Test Password Reset**

1. **เปิด Frontend:**
   ```
   http://localhost:3000/password-reset
   ```

2. **กรอก Email:**
   ```
   Email: mongkol09ms@gmail.com
   [Submit]
   ```

3. **ตรวจสอบ Email:**
   - ดู inbox ของ mongkol09ms@gmail.com
   - ตรวจ spam folder ด้วย

### **STEP 5.4: ผลลัพธ์ที่คาดหวัง**

**Email ที่ได้รับ:**
```
From: noreply@malairesort.com
To: mongkol09ms@gmail.com
Subject: 🔐 รีเซ็ตรหัสผ่าน - Hotel Management System

[Professional HTML Template with Reset Link]
```

---

## 🔧 **PART 6: Troubleshooting**

### **❌ Problem 1: DNS Records ไม่ propagate**

**Symptoms:**
```powershell
nslookup -type=TXT malairesort.com
# ไม่เจอ SPF record
```

**Solutions:**
1. **รอเวลาเพิ่ม** (ถึง 24 ชั่วโมง)
2. **ตรวจสอบ Nameservers:**
   ```powershell
   nslookup -type=NS malairesort.com
   # ต้องได้ cloudflare nameservers
   ```
3. **ลบ records เก่า แล้วเพิ่มใหม่**

### **❌ Problem 2: MailerSend Verify ไม่ผ่าน**

**Symptoms:**
```
❌ SPF Record: Failed
❌ DKIM Record: Failed
```

**Solutions:**
1. **ตรวจสอบ Proxy Status:**
   - ต้องเป็น "DNS only" (สีเทา)
   - ไม่ใช่ "Proxied" (สีส้ม)

2. **ตรวจสอบ Record Values:**
   ```
   SPF: v=spf1 include:_spf.mailersend.net ~all
   DKIM: mlsend2._domainkey.mailersend.net  
   Return-Path: mailersend.net
   ```

3. **ลบ records เก่า:**
   - คลิก [Edit] → [Delete]
   - เพิ่มใหม่ตามคู่มือ

### **❌ Problem 3: Email ไม่ส่ง**

**Symptoms:**
```
API Error: Failed to send email
```

**Solutions:**
1. **ตรวจสอบ .env:**
   ```env
   MAILERSEND_API_TOKEN=mlsnd_xxxxx
   MAILERSEND_FROM_EMAIL=noreply@malairesort.com
   ```

2. **ตรวจสอบ API Token:**
   - เข้า MailerSend → API Tokens
   - สร้าง token ใหม่ถ้าจำเป็น

3. **ดู Console Logs:**
   ```javascript
   console.log('Email sending attempt...');
   ```

---

## 📋 **Checklist สำหรับความสำเร็จ**

### **Domain Setup:**
- [ ] Domain เพิ่มเข้า Cloudflare แล้ว
- [ ] Nameservers เปลี่ยนที่ registrar แล้ว
- [ ] DNS Records propagate แล้ว (nslookup ผ่าน)
- [ ] Domain Status = "Active" ใน Cloudflare

### **MailerSend Setup:**
- [ ] SPF Record เพิ่มแล้ว (TXT)
- [ ] DKIM Record เพิ่มแล้ว (CNAME)
- [ ] Return-Path Record เพิ่มแล้ว (CNAME)
- [ ] ทุก Record เป็น "DNS only" (ไม่ใช่ Proxied)
- [ ] MailerSend Verification ผ่านแล้ว

### **Email Testing:**
- [ ] .env file update แล้ว
- [ ] API Server restart แล้ว
- [ ] Frontend test ผ่าน
- [ ] Email delivery สำเร็จ

---

## 🎯 **Summary: สิ่งสำคัญที่ต้องจำ**

### **📍 Key Points:**

1. **Proxy Status:** ต้องเป็น "DNS only" เสมอ
2. **TTL:** ใช้ "Auto" หรือ "300" 
3. **Record Names:** พิมพ์ให้ถูกต้องเป๊ะ ๆ
4. **Propagation:** รอ 30 นาที - 2 ชั่วโมง
5. **Testing:** ตรวจสอบทีละขั้นตอน

### **🚀 Next Steps หลังจากนี้:**

1. **Production Deployment** (Railway/Vercel)
2. **Custom Email Templates** 
3. **Email Analytics** tracking
4. **Domain SSL Certificate** (Cloudflare ให้ฟรี)

---

**🎉 เรียบร้อย! ระบบ Email ของคุณพร้อมใช้งานแล้ว!**

มีคำถามเพิ่มเติมหรือติดขัดตรงไหนไหมครับ? 😊
