# 🚀 Step-by-Step Domain Setup สำหรับ malairesort.com

## 📋 **ข้อมูลจาก MailerSend ของคุณ**

จากข้อมูลที่คุณได้จาก MailerSend:
```
SPF: v=spf1 include:_spf.mailersend.net ~all
DKIM: mlsend2._domainkey.mailersend.net
Return-path: malaikhaoyai
Record value: mailersend.net
```

---

## 🔧 **STEP 1: เข้าไปจัดการ Domain**

### **ถ้าใช้ Cloudflare:**
1. เข้า https://dash.cloudflare.com/
2. เลือก domain `malairesort.com`
3. คลิก **DNS** tab

### **ถ้าใช้ GoDaddy:**
1. เข้า https://account.godaddy.com/
2. ไป **My Products** → **Domains**
3. คลิก **DNS** ข้างชื่อ domain

### **ถ้าใช้ Namecheap:**
1. เข้า https://ap.www.namecheap.com/domains/list/
2. คลิก **Manage** ข้างชื่อ domain
3. เลือก **Advanced DNS**

---

## 📝 **STEP 2: เพิ่ม DNS Records (3 Records)**

### **Record 1: SPF (TXT Record)**
```
Type: TXT
Name: @ (หรือ malairesort.com หรือ root domain)
Value: v=spf1 include:_spf.mailersend.net ~all
TTL: 300 (หรือ Auto/Default)
```

**การกรอก:**
- **Host/Name:** `@` 
- **Type:** `TXT`
- **Value/Content:** `v=spf1 include:_spf.mailersend.net ~all`
- **TTL:** `300`

### **Record 2: DKIM (CNAME Record)**
```
Type: CNAME
Name: mlsend2._domainkey
Value: mlsend2._domainkey.mailersend.net
TTL: 300
```

**การกรอก:**
- **Host/Name:** `mlsend2._domainkey`
- **Type:** `CNAME`
- **Target/Value:** `mlsend2._domainkey.mailersend.net`
- **TTL:** `300`

### **Record 3: Return-Path (CNAME Record)**
```
Type: CNAME
Name: malaikhaoyai
Value: mailersend.net
TTL: 300
```

**การกรอก:**
- **Host/Name:** `malaikhaoyai`
- **Type:** `CNAME`
- **Target/Value:** `mailersend.net`
- **TTL:** `300`

---

## 💻 **STEP 3: ตัวอย่างการกรอกใน Cloudflare**

### **Interface จะมีหน้าตาแบบนี้:**

**Add Record 1:**
```
Type: [TXT ▼]
Name: [@        ]
Content: [v=spf1 include:_spf.mailersend.net ~all]
TTL: [Auto ▼]
[Save]
```

**Add Record 2:**
```
Type: [CNAME ▼]
Name: [mlsend2._domainkey]
Target: [mlsend2._domainkey.mailersend.net]
TTL: [Auto ▼]
[Save]
```

**Add Record 3:**
```
Type: [CNAME ▼]
Name: [malaikhaoyai]
Target: [mailersend.net]
TTL: [Auto ▼]
[Save]
```

---

## 🕐 **STEP 4: รอ DNS Propagation**

### **ระยะเวลา:**
- **เร็วสุด:** 5-10 นาที
- **ปกติ:** 30 นาที - 2 ชั่วโมง
- **ช้าสุด:** 24-48 ชั่วโมง

### **ตรวจสอบการทำงาน:**
```bash
# ตรวจสอบ SPF
nslookup -type=TXT malairesort.com

# ตรวจสอบ DKIM
nslookup -type=CNAME mlsend2._domainkey.malairesort.com

# ตรวจสอบ Return-Path
nslookup -type=CNAME malaikhaoyai.malairesort.com
```

### **Online Tools:**
- [DNS Checker](https://dnschecker.org/)
- [What's My DNS](https://www.whatsmydns.net/)

---

## ✅ **STEP 5: Verify ใน MailerSend**

1. **เข้า MailerSend Dashboard**
   - https://app.mailersend.com/domains

2. **หา Domain ของคุณ**
   - มองหา `malairesort.com` ในรายการ

3. **คลิก Verify**
   - จะมีปุ่ม **Verify** หรือ **Check**
   - คลิกแล้วรอผลลัพธ์

4. **ผลลัพธ์ที่คาดหวัง:**
   ```
   ✅ SPF: Verified
   ✅ DKIM: Verified  
   ✅ Return-Path: Verified
   ✅ Domain Status: Active
   ```

---

## 🚀 **STEP 6: Test Email System**

### **หลังจาก Verify สำเร็จ:**

1. **Restart API Server:**
   ```bash
   cd d:\Hotel_booking\apps\api
   npm run dev
   ```

2. **ทดสอบ Frontend:**
   - เปิด http://localhost:3000/password-reset
   - กรอก `mongkol09ms@gmail.com`
   - คลิก Submit

3. **ตรวจสอบ Email:**
   - เช็ค inbox ของ mongkol09ms@gmail.com
   - เช็ค spam folder ด้วย

4. **ผลลัพธ์ที่คาดหวัง:**
   ```
   From: noreply@malairesort.com
   Subject: 🔐 รีเซ็ตรหัสผ่าน - Hotel Management System
   Content: Professional HTML template
   ```

---

## 🔍 **STEP 7: Troubleshooting**

### **ถ้า Verify ไม่ผ่าน:**

**1. ตรวจสอบ Record Values:**
```bash
# SPF ต้องได้ผลลัพธ์นี้
malairesort.com. TXT "v=spf1 include:_spf.mailersend.net ~all"

# DKIM ต้องได้ผลลัพธ์นี้
mlsend2._domainkey.malairesort.com. CNAME mlsend2._domainkey.mailersend.net.

# Return-Path ต้องได้ผลลัพธ์นี้
malaikhaoyai.malairesort.com. CNAME mailersend.net.
```

**2. Common Mistakes:**
- ❌ ใส่ `http://` หรือ `https://` ใน CNAME value
- ❌ เว้นวรรคใน record values
- ❌ ใส่ domain name ซ้ำ (เช่น malairesort.com.malairesort.com)
- ❌ TTL สูงเกินไป (ใช้ 300 หรือ Auto)

**3. วิธีแก้:**
- ลบ records เก่า
- เพิ่มใหม่ตามตัวอย่าง
- รอ DNS propagate อีกครั้ง

---

## 📋 **Checklist สำหรับการทำงาน**

### **ก่อนเริ่ม:**
- [ ] มี access ไปยัง domain management
- [ ] รู้ว่าใช้ provider ไหน (Cloudflare/GoDaddy/etc.)
- [ ] มี login credentials พร้อม

### **ขณะทำ:**
- [ ] เพิ่ม SPF record (TXT)
- [ ] เพิ่ม DKIM record (CNAME)
- [ ] เพิ่ม Return-Path record (CNAME)
- [ ] Save changes ทั้งหมด

### **หลังทำ:**
- [ ] รอ DNS propagation
- [ ] ตรวจสอบด้วย nslookup หรือ online tools
- [ ] Verify ใน MailerSend
- [ ] Test email system
- [ ] Confirm email received

---

## 🎯 **สรุป: ขั้นตอนหลัก**

1. **เข้า Domain Management** ของ provider
2. **เพิ่ม 3 DNS Records** ตามข้อมูลที่ให้
3. **รอ DNS Propagation** (10-30 นาที)
4. **Verify ใน MailerSend** Dashboard
5. **Test Email System** ของเรา

**หลังจากทำตามขั้นตอนแล้ว ระบบอีเมลจะทำงานได้ทันที!** 🚀

---

## ❓ **มีคำถามเพิ่มเติม?**

- **DNS Records ไม่ propagate:** รอเวลาเพิ่ม หรือลองเปลี่ยน DNS server
- **Verify ไม่ผ่าน:** ตรวจสอบ spelling และ format อีกครั้ง
- **Email ไม่ส่ง:** ดู console logs ของ API server
- **Reset link ไม่ทำงาน:** ตรวจสอบ FRONTEND_URL ใน .env

**เริ่มจาก Step 1 ได้เลยครับ!** 💪
