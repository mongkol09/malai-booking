# 📧 EMAIL TEMPLATE VARIABLES - COMPLETE SUMMARY

> **สรุปข้อมูลตัวแปรที่ใช้ในอีเมล Booking Confirmation สำหรับ MailerSend Template**

## 🎯 คำตอบสำหรับคำถามของคุณ

### ❓ "มีตัวแปร tax มีไหม room_price มีไหม"
**✅ มีครับ! ทั้งคู่พร้อมใช้งาน:**

- `{{tax_amount}}` - จำนวนภาษี (เช่น ฿350)
- `{{tax_rate}}` - อัตราภาษี (เช่น 7.00%)
- `{{room_price_per_night}}` - ราคาห้องต่อคืน (เช่น ฿2,500)

---

## 📋 รายการตัวแปรทั้งหมดสำหรับ MailerSend

### 👤 ข้อมูลลูกค้า
- `{{guest_name}}` - ชื่อ-นามสกุลลูกค้า
- `{{guest_email}}` - อีเมลลูกค้า  
- `{{guest_phone}}` - เบอร์โทรลูกค้า

### 📅 ข้อมูลการจอง
- `{{booking_reference}}` - หมายเลขการจอง (เช่น BK1755402984299)
- `{{check_in_date}}` - วันที่เช็คอิน
- `{{check_out_date}}` - วันที่เช็คเอาต์
- `{{number_of_nights}}` - จำนวนคืน
- `{{number_of_guests}}` - จำนวนผู้เข้าพัก
- `{{booking_status}}` - สถานะการจอง
- `{{booking_date}}` - วันที่ทำการจอง

### 🏨 ข้อมูลห้องพัก
- `{{room_type}}` - ประเภทห้อง (เช่น Deluxe Suite)
- `{{room_number}}` - หมายเลขห้อง (เช่น B1)
- `{{room_description}}` - รายละเอียดห้อง

### 💰 ข้อมูลราคา (ที่คุณถามหา)
- `{{room_price_per_night}}` - ราคาห้องต่อคืน (เช่น ฿2,500)
- `{{subtotal}}` - ราคารวม (เช่น ฿5,000)
- `{{tax_rate}}` - อัตราภาษี (เช่น 7.00%)
- `{{tax_amount}}` - จำนวนภาษี (เช่น ฿350)
- `{{service_charge_rate}}` - อัตราค่าบริการ (เช่น 10.00%)
- `{{service_charge}}` - ค่าบริการ (เช่น ฿500)
- `{{grand_total}}` - ยอดรวมสุทธิ (เช่น ฿5,850)
- `{{currency}}` - สกุลเงิน (THB)

### 🏩 ข้อมูลโรงแรม
- `{{hotel_name}}` - ชื่อโรงแรม
- `{{booking_confirmation_url}}` - ลิงก์ยืนยันการจอง
- `{{checkin_url}}` - ลิงก์เช็คอิน

---

## 🧮 ตัวอย่างการคำนวณ

```
Room Type: Deluxe Suite
Base Rate: ฿2,500/night
Nights: 2
─────────────────────────
Subtotal: ฿5,000
Tax (7.00%): ฿350
Service Charge (10.00%): ฿500
─────────────────────────
Grand Total: ฿5,850
```

---

## 🗄️ การเก็บข้อมูลในฐานข้อมูล

### 📊 Room Types Table
- `base_rate` - ราคาพื้นฐานต่อคืน (Decimal)
- `name`, `description` - ชื่อและรายละเอียดห้อง

### 📋 Bookings Table  
- `total_price` - ราคารวม (Decimal)
- `tax_amount` - จำนวนภาษี (Decimal)
- `final_amount` - ยอดสุทธิ (Decimal)
- `checkin_date`, `checkout_date` - วันที่เข้า-ออก

### ⚙️ System Settings Table
- `tax_rate` - อัตราภาษี (7.00%)
- `service_charge_rate` - อัตราค่าบริการ (10.00%)
- `hotel_name` - ชื่อโรงแรม
- `default_currency` - สกุลเงิน

---

## 🚀 Logic การคำนวณ

```javascript
// การคำนวณราคา
const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
const subtotal = baseRate * nights;
const taxAmount = subtotal * (taxRate / 100);
const serviceCharge = subtotal * (serviceChargeRate / 100);
const finalAmount = subtotal + taxAmount + serviceCharge;
```

---

## 📧 ตัวอย่างการใช้ใน MailerSend Template

### Booking Confirmation Email
```html
<h2>การจองของคุณได้รับการยืนยันแล้ว</h2>
<p>เรียน คุณ{{guest_name}}</p>
<p>หมายเลขการจอง: <strong>{{booking_reference}}</strong></p>

<h3>รายละเอียดการจอง</h3>
<ul>
  <li>ห้อง: {{room_type}} ({{room_number}})</li>
  <li>วันที่เข้าพัก: {{check_in_date}}</li>
  <li>วันที่ออก: {{check_out_date}}</li>
  <li>จำนวน: {{number_of_nights}} คืน</li>
</ul>

<h3>สรุปค่าใช้จ่าย</h3>
<table>
  <tr><td>ราคาห้องต่อคืน:</td><td>{{room_price_per_night}}</td></tr>
  <tr><td>รวม {{number_of_nights}} คืน:</td><td>{{subtotal}}</td></tr>
  <tr><td>ภาษี ({{tax_rate}}):</td><td>{{tax_amount}}</td></tr>
  <tr><td>ค่าบริการ ({{service_charge_rate}}):</td><td>{{service_charge}}</td></tr>
  <tr><th>ยอดรวมสุทธิ:</th><th>{{grand_total}}</th></tr>
</table>
```

### E-Receipt Email
```html
<h2>ใบเสร็จรับเงิน - {{hotel_name}}</h2>
<p>หมายเลขการจอง: {{booking_reference}}</p>
<p>วันที่: {{booking_date}}</p>

<h3>รายการ</h3>
<p>{{room_type}} - {{number_of_nights}} คืน @ {{room_price_per_night}}</p>
<p>ภาษี {{tax_rate}}: {{tax_amount}}</p>
<p>ค่าบริการ {{service_charge_rate}}: {{service_charge}}</p>
<p><strong>รวมทั้งสิ้น: {{grand_total}} {{currency}}</strong></p>
```

---

## ✅ สถานะปัจจุบัน

- ✅ ตัวแปร tax และ room_price พร้อมใช้งาน
- ✅ ฐานข้อมูลมีข้อมูลครบถ้วน
- ✅ Logic การคำนวณทำงานถูกต้อง  
- ✅ พร้อมออกแบบ MailerSend Template
- ✅ ทดสอบการสร้างการจองเรียบร้อย

## 🎯 ขั้นตอนถัดไป

1. นำตัวแปรเหล่านี้ไปใช้ใน MailerSend Template Designer
2. ทดสอบส่งอีเมลจริง
3. ปรับแต่ง Template ตามความต้องการ

---

*📝 Generated on: 17/8/2568, 10:56:35*
