# 📧 Email Templates Setup Guide - MailerSend Integration

## 🎯 Overview
เราสร้าง HTML Email Templates ทั้งหมด 4 อัน ที่ต้องอัปโหลดไปยัง MailerSend Dashboard เพื่อได้ Template IDs พร้อมหัวบิลบริษัทที่ถูกต้อง

## � Templates List

### 1. **Booking Confirmation Template** ✅
- **File:** `bookingConfirmationTemplate.ts`
- **Purpose:** ยืนยันการจองเมื่อลูกค้าจองสำเร็จ
- **When to Send:** หลังจากชำระเงินเสร็จสิ้น
- **Features:** QR Code, ข้อมูลการจอง, ข้อมูลผู้เข้าพัก, ข้อควรรู้

### 2. **Payment Receipt Template** ✅
- **File:** `paymentReceiptTemplate.ts`  
- **Purpose:** ใบเสร็จรับเงินพร้อมหัวบิลบริษัท "มาลัย เวลเนส จำกัด"
- **When to Send:** หลังจากชำระเงินสำเร็จ
- **Features:** หัวบิลครบถ้วน, เลขประจำตัวผู้เสียภาษี, รายละเอียดการชำระ

### 3. **Check-in Reminder Template** ✅
- **File:** `checkinReminderTemplate.ts`
- **Purpose:** แจ้งเตือนก่อนวันเช็คอิน 24 ชั่วโมง
- **When to Send:** อัตโนมัติ 24 ชั่วโมงก่อนเช็คอิน
- **Features:** Countdown timer, Checklist การเตรียมตัว, ข้อมูลสภาพอากาศ

### 4. **Check-out Reminder Template** ✅
- **File:** `checkoutReminderTemplate.ts`
- **Purpose:** แจ้งเตือนก่อนเวลาเช็คเอาท์ 2 ชั่วโมง
- **When to Send:** อัตโนมัติ 2 ชั่วโมงก่อนเช็คเอาท์
- **Features:** ขั้นตอนเช็คเอาท์, Feedback form, Special offers

### **Nested Object Variables** *(MailerSend Auto-Generated)*
```javascript
// VAT/Tax Information (Nested)
Vat: {
  tax: '0.00'  // VAT amount string
}

// Check-out Information (Capital C)
Check: {
  out: {
    date: {
      time: '17 สิงหาคม 2568 11:00 น.'  // Full checkout datetime
    }
  }
}

// Check-in Information (lowercase c) 
check: {
  in: {
    date: {
      time: '15 สิงหาคม 2568 15:00 น.'  // Full checkin datetime
    }
  }
}

// Price with Tax Included
price: {
  included: {
    tax: '4,500 บาท'  // Total price with currency
  }
}

// Customer Phone (Note: typo in MailerSend)
cuntomer_phone: {
  no: '+66 81 234 5678'  // Phone number
}
```

### **Basic Flat Variables**
```
{{name}}              - ชื่อลูกค้า (primary)
{{Customer_name}}     - ชื่อลูกค้า (backup)
{{account_name}}      - ชื่อบัญชี
{{customer_email}}    - อีเมลลูกค้า
{{customer_city}}     - เมืองลูกค้า
{{customer_country}}  - ประเทศลูกค้า
{{customer_postal_code}} - รหัสไปรษณีย์
{{booking_id}}        - หมายเลขการจอง
{{room_type}}         - ประเภทห้อง
{{hotel_name}}        - ชื่อโรงแรม
{{hotel_email}}       - อีเมลโรงแรม
{{hotel_phone}}       - เบอร์โทรโรงแรม
{{hotel_address}}     - ที่อยู่โรงแรม
{{hotel_website}}     - เว็บไซต์โรงแรม
{{hotel_signature_name}} - ลายเซ็นทีม
{{receipt_url}}       - ลิงก์ใบเสร็จ
{{manage_booking_url}} - ลิงก์จัดการการจอง
```

### **Legacy Compatibility Variables** *(for backward compatibility)*
```
{{check_in_date}}     - วันเข้าพัก (flat)
{{check_in_time}}     - เวลาเข้าพัก (flat)
{{check_out_date}}    - วันออก (flat)
{{check_out_time}}    - เวลาออก (flat)
{{guest_count}}       - จำนวนผู้เข้าพัก
{{nights}}            - จำนวนคืน
{{total}}             - ยอดรวม (flat)
{{tax}}               - ภาษี (flat)
{{qr_code_data}}      - QR Code (base64)
```

## 🚀 How to Use in MailerSend:

### Step 1: Create New Template
1. ไปที่ MailerSend Dashboard
2. เลือก **Templates** → **Create Template**
3. เลือก **Drag & Drop Editor**

### Step 2: Upload Logo
1. ใน Header section
2. Upload logo ที่ส่งมา (Malai Khaoyai logo)
3. ตั้งขนาด 120px width

### Step 3: Copy HTML Code
1. เปลี่ยนเป็น **HTML mode**
2. Copy HTML จากไฟล์ `malai-booking-confirmation-template.html`
3. Paste ลงใน template editor

### Step 4: Test Template
1. กด **Preview** เพื่อดูตัวอย่าง
2. ทดสอบใน desktop และ mobile view
3. ตรวจสอบ variables ทั้งหมด

### Step 5: Save & Get Template ID
1. กด **Save Template**
2. Copy Template ID ใหม่
3. อัปเดตใน `.env` file

## 📱 Mobile Optimization:
- **Responsive breakpoint**: 600px
- **Touch-friendly buttons**: ขนาดที่เหมาะสมสำหรับมือถือ
- **Readable font sizes**: ไม่เล็กเกินไปบนมือถือ
- **Proper spacing**: ระยะห่างที่เหมาะสม

## 🎯 Benefits vs Old Template:
- **60% shorter** - อ่านง่าย เข้าใจเร็ว
- **No duplicate info** - ไม่มีข้อมูลซ้ำซ้อน
- **Better UX** - ปุ่มและ action ชัดเจน
- **Brand consistent** - สีและ style ตรงกับ brand
- **Mobile-first** - ออกแบบสำหรับมือถือเป็นหลัก

## 🔧 Technical Notes:
- **CSS**: ใช้ internal CSS สำหรับ email compatibility
- **Fonts**: Google Fonts (Sarabun) with fallback
- **Images**: Support for base64 QR codes
- **Links**: External links สำหรับ CTA buttons

## 📊 Estimated Performance:
- **Load time**: < 2 seconds
- **Email length**: ~300-400 words (vs 800+ เดิม)
- **Mobile scroll**: 2-3 scrolls (vs 5-6 เดิม)
- **User engagement**: Higher click-through rate
