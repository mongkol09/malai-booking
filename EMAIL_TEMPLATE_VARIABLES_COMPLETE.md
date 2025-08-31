# 📧 BOOKING CONFIRMATION EMAIL TEMPLATE VARIABLES
*สำหรับการออกแบบ Template ใน MailerSend*

## 🎯 ตัวแปรที่มีในระบบ Booking Confirmation

### 📋 **ข้อมูลผู้เข้าพัก (Guest Information)**
```javascript
{
  "guest_name": "คำนิงค์ เพ็ชรรัตน์",           // ชื่อ-นามสกุลผู้เข้าพัก
  "guest_email": "kmnink@example.com",      // อีเมลผู้เข้าพัก
  "guest_phone": "081-234-5678",            // เบอร์โทรศัพท์
  "guest_country": "Thailand",              // ประเทศ
  "adults": 2,                              // จำนวนผู้ใหญ่
  "children": 0,                            // จำนวนเด็ก
  "guest_count": 2                          // จำนวนผู้เข้าพักรวม
}
```

### 🏷️ **ข้อมูลการจอง (Booking Information)**
```javascript
{
  "booking_reference": "B-20250817001",     // หมายเลขการจอง
  "booking_status": "ยืนยันแล้ว",            // สถานะการจอง
  "nights": 2                               // จำนวนคืน
}
```

### 📅 **วันที่เข้าพัก (Date Information)**
```javascript
{
  "checkin_date": "วันจันทร์ที่ 19 สิงหาคม พ.ศ. 2567",    // วันเช็คอิน (รูปแบบไทย)
  "checkin_time": "15:00 น.",                         // เวลาเช็คอิน
  "checkout_date": "วันพุธที่ 21 สิงหาคม พ.ศ. 2567",   // วันเช็คเอาท์ (รูปแบบไทย)
  "checkout_time": "11:00 น.",                        // เวลาเช็คเอาท์
  "current_date": "17/8/2567"                         // วันที่ปัจจุบัน
}
```

### 🏠 **ข้อมูลห้องพัก (Room Information)**
```javascript
{
  "room_type": "Deluxe Suite",              // ประเภทห้องพัก
  "room_number": "จะแจ้งให้ทราบในวันเช็คอิน"  // หมายเลขห้อง
}
```

### 💰 **ข้อมูลราคา (Pricing Information)**
```javascript
{
  "total_amount": "4,500",                  // ราคารวม (รูปแบบไทย)
  "currency": "THB"                         // สกุลเงิน
}
```

### 🏨 **ข้อมูลโรงแรม (Hotel Information)**
```javascript
{
  "hotel_name": "Malai Khaoyai Resort",
  "hotel_email": "center@malaikhaoyai.com",
  "hotel_phone": "+66 44 123 456",
  "hotel_address": "199 หมู่ 4 ตำบลโคกกรวด อำเภอปากช่อง จังหวัดนครราชสีมา 30130",
  "hotel_website": "https://malaikhaoyai.com"
}
```

### 🔗 **ลิงก์และ QR Code**
```javascript
{
  "qr_code_url": "data:image/png;base64,iVBORw0KGgo...",  // QR Code สำหรับเช็คอิน
  "receipt_url": "https://app.malaikhaoyai.com/receipt/123",       // ลิงก์ใบเสร็จ
  "manage_booking_url": "https://app.malaikhaoyai.com/booking/B-20250817001"  // ลิงก์จัดการการจอง
}
```

---

## 📋 **ตัวแปรสำหรับ E-Receipt / E-Tax Invoice**

### 💳 **Payment Receipt Variables**
```javascript
{
  "receipt_number": "RCP-12345ABC",         // เลขที่ใบเสร็จ
  "payment_date": "17 สิงหาคม 2567 14:30",  // วันที่ชำระเงิน
  "payment_id": "pay_abc123def456",         // รหัสการชำระเงิน
  "payment_reference": "omise_ch_abc123",   // รหัสอ้างอิงการชำระเงิน
  "payment_method": "Credit Card",          // วิธีการชำระเงิน
  "payment_amount": "4,500",                // จำนวนเงินที่ชำระ
  "payment_status": "ชำระเงินแล้ว"           // สถานะการชำระเงิน
}
```

### 🧾 **Tax & Financial Variables**
```javascript
{
  "tax_amount": "0.00",                     // ภาษี (ปัจจุบันเป็น 0)
  "service_charge": "0.00",                 // ค่าบริการ (ปัจจุบันเป็น 0)
  "receipt_download_url": "https://app.malaikhaoyai.com/receipt/pay_abc123/download"
}
```

---

## ⚠️ **ข้อสำคัญสำหรับการออกแบบ Template**

### 🚫 **ตัวแปรที่ยังไม่มี (ต้องเพิ่มในอนาคต)**
- `room_price` - ราคาห้องต่อคืน (ปัจจุบันมีแค่ total_amount)
- `tax_rate` - เปอร์เซ็นต์ภาษี (มีในฐานข้อมูล แต่ยังไม่ได้ implement)
- `service_charge_rate` - เปอร์เซ็นต์ค่าบริการ
- `price_breakdown` - รายละเอียดการคำนวณราคา
- `vat_number` - เลขประจำตัวผู้เสียภาษี

### ✅ **วิธีใช้ใน MailerSend Template**
```html
<!-- ตัวอย่างการใช้ในเทมเพลต -->
<h2>สวัสดี {{guest_name}}</h2>
<p>การจองของคุณ หมายเลข <strong>{{booking_reference}}</strong> ได้รับการยืนยันแล้ว</p>

<div class="booking-details">
  <p><strong>ประเภทห้อง:</strong> {{room_type}}</p>
  <p><strong>วันเช็คอิน:</strong> {{checkin_date}} เวลา {{checkin_time}}</p>
  <p><strong>วันเช็คเอาท์:</strong> {{checkout_date}} เวลา {{checkout_time}}</p>
  <p><strong>จำนวนคืน:</strong> {{nights}} คืน</p>
  <p><strong>จำนวนผู้เข้าพัก:</strong> {{guest_count}} คน</p>
  <p><strong>ราคารวม:</strong> ฿{{total_amount}}</p>
</div>

<img src="{{qr_code_url}}" alt="QR Code สำหรับเช็คอิน" />
```

---

## 📊 **สรุปการใช้งาน**

### 🎯 **Booking Confirmation Template**
- **รูปแบบปัจจุบัน:** ครบถ้วนสำหรับการจองทั่วไป
- **เหมาะสำหรับ:** ยืนยันการจอง, QR Code เช็คอิน

### 🧾 **E-Receipt Template**
- **รูปแบบปัจจุบัน:** ใบเสร็จการชำระเงินพื้นฐาน
- **ขาดหายไป:** รายละเอียดการคำนวณราคา, ภาษี

### 💼 **E-Tax Invoice Template**
- **ต้องเพิ่ม:** เลขประจำตัวผู้เสียภาษี, รายละเอียดภาษี, breakdown ราคา
- **ต้องปรับปรุง:** ระบบการคำนวณภาษีในโค้ด

---

## 🔧 **แนะนำการพัฒนาต่อ**

### 1. **เพิ่มตัวแปรราคาโดยละเอียด**
```javascript
// ควรเพิ่มใน emailTemplateService.ts
{
  "room_price_per_night": "2,250",         // ราคาห้องต่อคืน
  "base_price": "4,500",                   // ราคาพื้นฐาน
  "discount_amount": "0",                  // ส่วนลด
  "tax_rate": "7%",                        // เปอร์เซ็นต์ภาษี
  "tax_amount": "315",                     // จำนวนภาษี
  "service_charge_rate": "10%",            // เปอร์เซ็นต์ค่าบริการ
  "service_charge_amount": "450",          // จำนวนค่าบริการ
  "grand_total": "5,265"                   // ราคารวมสุดท้าย
}
```

### 2. **อัพเดต emailTemplateService.ts**
```javascript
// เพิ่มใน prepareBookingConfirmationData()
const taxRate = 7; // ดึงจาก settings
const serviceChargeRate = 10; // ดึงจาก settings
const baseAmount = Number(booking.totalPrice || 0);
const taxAmount = (baseAmount * taxRate) / 100;
const serviceCharge = (baseAmount * serviceChargeRate) / 100;
const grandTotal = baseAmount + taxAmount + serviceCharge;
```

ตัวแปรทั้งหมดพร้อมใช้งานสำหรับการออกแบบ Template ครับ! 🎯
