# 💰 DATABASE PRICING & FINANCIAL ANALYSIS
*สรุปการเก็บข้อมูลราคาและการคำนวณเงินในระบบ*

## 🏗️ **โครงสร้างฐานข้อมูลด้านราคา**

### 1. **RoomTypes Table - ราคาพื้นฐาน**
```sql
CREATE TABLE RoomTypes (
    room_type_id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    base_rate DECIMAL(10, 2) NOT NULL,  -- ⭐ ราคาพื้นฐานต่อคืน
    capacity_adults INTEGER,
    capacity_children INTEGER,
    amenities JSONB,
    size_sqm DECIMAL(8, 2),
    bed_type VARCHAR(50)
);
```

### 2. **Bookings Table - ราคาการจอง**
```sql
CREATE TABLE Bookings (
    booking_id UUID PRIMARY KEY,
    total_price DECIMAL(12, 2) NOT NULL,      -- ⭐ ราคารวมก่อนหักลด/ภาษี
    discount_amount DECIMAL(12, 2) DEFAULT 0, -- ⭐ ส่วนลด
    tax_amount DECIMAL(12, 2) DEFAULT 0,      -- ⭐ ภาษี
    final_amount DECIMAL(12, 2) NOT NULL,     -- ⭐ ราคาสุดท้าย
    num_adults INTEGER,
    num_children INTEGER,
    checkin_date DATE,
    checkout_date DATE
);
```

### 3. **SystemSettings Table - การตั้งค่าภาษี**
```sql
INSERT INTO SystemSettings VALUES
('tax_rate', '7.00', 'DECIMAL', 'Default tax rate percentage', 'FINANCIAL'),
('service_charge_rate', '10.00', 'DECIMAL', 'Service charge percentage', 'FINANCIAL');
```

### 4. **DailyRoomRates Table - ราคารายวัน**
```sql
CREATE TABLE DailyRoomRates (
    daily_rate_id UUID PRIMARY KEY,
    date DATE NOT NULL,
    room_type_id UUID REFERENCES RoomTypes,
    current_rate DECIMAL(10, 2) NOT NULL,    -- ⭐ ราคาวันนั้นๆ
    restrictions JSONB,
    availability INTEGER
);
```

---

## 🧮 **Logic การคำนวณเงินปัจจุบัน**

### 📋 **จากการวิเคราะห์โค้ด:**

#### 1. **ราคาพื้นฐาน (Base Rate)**
```javascript
// จาก RoomTypes.base_rate
const baseRate = roomType.baseRate; // เช่น 2500 บาท/คืน
```

#### 2. **ราคารวมก่อนภาษี**
```javascript
// จาก bookingController.ts
const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
const totalPrice = baseRate * nights; // 2500 × 2 คืน = 5000 บาท
```

#### 3. **การคำนวณภาษีและค่าบริการ**
```javascript
// จาก emailTemplateService.ts (ที่เราเพิ่งอัพเดต)
const taxRate = 0.07;           // 7% จาก SystemSettings
const serviceChargeRate = 0.10; // 10% จาก SystemSettings

const baseAmount = totalPrice;                      // 5000
const taxAmount = baseAmount * taxRate;             // 5000 × 0.07 = 350
const serviceCharge = baseAmount * serviceChargeRate; // 5000 × 0.10 = 500
const grandTotal = baseAmount + taxAmount + serviceCharge; // 5000 + 350 + 500 = 5850
```

---

## ⚠️ **ปัญหาที่พบในระบบปัจจุบัน**

### 🚨 **1. Tax & Service Charge ไม่ได้ถูกบันทึกจริง**
```javascript
// ใน Bookings table
tax_amount: '0.00',      // ❌ ยังไม่ได้คำนวณจริง
service_charge: '0.00'   // ❌ ยังไม่ได้คำนวณจริง
```

### 🚨 **2. การคำนวณไม่สอดคล้องกัน**
- **Database:** เก็บ `total_price` และ `final_amount` เท่ากัน
- **Email Template:** คำนวณ tax/service charge แยก
- **การแสดงผล:** ไม่มี breakdown ที่ชัดเจน

### 🚨 **3. ราคาต่อคืนไม่ได้แยกเก็บ**
- มีแค่ `total_price` รวม
- ไม่มี `room_price_per_night` แยกใน database

---

## 🔧 **แนะนำการปรับปรุง Logic**

### 📊 **1. ปรับปรุงการคำนวณใน bookingController.ts**

```javascript
// เพิ่มการดึง tax rate จาก SystemSettings
async function calculateBookingAmounts(baseRate, nights, discountAmount = 0) {
  // ดึงการตั้งค่าจาก database
  const taxRate = await getSystemSetting('tax_rate') / 100;           // 0.07
  const serviceChargeRate = await getSystemSetting('service_charge_rate') / 100; // 0.10
  
  // คำนวณ
  const subtotal = (baseRate * nights) - discountAmount;               // ราคาหลังหักส่วนลด
  const taxAmount = subtotal * taxRate;                                // ภาษี
  const serviceChargeAmount = subtotal * serviceChargeRate;            // ค่าบริการ
  const finalAmount = subtotal + taxAmount + serviceChargeAmount;      // ราคาสุดท้าย
  
  return {
    room_price_per_night: baseRate,
    nights: nights,
    subtotal: subtotal,
    discount_amount: discountAmount,
    tax_rate: taxRate * 100,
    tax_amount: taxAmount,
    service_charge_rate: serviceChargeRate * 100,
    service_charge_amount: serviceChargeAmount,
    total_price: subtotal,           // ราคาก่อนภาษี
    final_amount: finalAmount        // ราคาสุดท้าย
  };
}
```

### 📊 **2. อัพเดต Bookings Table Structure**

```sql
-- เพิ่มฟิลด์ใหม่
ALTER TABLE Bookings ADD COLUMN room_price_per_night DECIMAL(10, 2);
ALTER TABLE Bookings ADD COLUMN service_charge_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE Bookings ADD COLUMN tax_rate DECIMAL(5, 2) DEFAULT 7.00;
ALTER TABLE Bookings ADD COLUMN service_charge_rate DECIMAL(5, 2) DEFAULT 10.00;

-- อัพเดต calculation logic
-- total_price = (room_price_per_night × nights) - discount_amount
-- tax_amount = total_price × (tax_rate / 100)
-- service_charge_amount = total_price × (service_charge_rate / 100)  
-- final_amount = total_price + tax_amount + service_charge_amount
```

### 📊 **3. สร้าง Helper Function สำหรับ SystemSettings**

```javascript
// เพิ่มใน services/settingsService.js
async function getSystemSetting(settingKey) {
  const setting = await prisma.systemSettings.findUnique({
    where: { setting_key: settingKey }
  });
  
  if (!setting) {
    // ค่า default
    const defaults = {
      'tax_rate': 7.00,
      'service_charge_rate': 10.00
    };
    return defaults[settingKey] || 0;
  }
  
  return parseFloat(setting.setting_value);
}
```

---

## 💡 **แนะนำการ Implement**

### 🎯 **Phase 1: แก้ไขการคำนวณทันที**
1. อัพเดต `bookingController.ts` ให้คำนวณภาษีจริง
2. อัพเดต `emailTemplateService.ts` ให้ดึงค่าจาก SystemSettings
3. เทสต์การคำนวณให้ถูกต้อง

### 🎯 **Phase 2: ปรับปรุง Database**
1. เพิ่มฟิลด์ใหม่ใน Bookings table
2. Migrate ข้อมูลเก่า
3. อัพเดต API responses

### 🎯 **Phase 3: Frontend Integration**
1. อัพเดต booking flow ให้แสดง breakdown
2. เพิ่ม tax/service charge ใน receipt template
3. อัพเดต admin dashboard

---

## 📋 **ตัวอย่างข้อมูลที่ควรมี**

### 🧾 **Booking Confirmation Email Variables**
```javascript
{
  // ราคาแยกรายการ
  "room_price_per_night": "2,500",      // baseRate
  "nights": 2,
  "subtotal": "5,000",                  // baseRate × nights - discount
  "discount_amount": "0",               // ส่วนลด
  
  // ภาษีและค่าบริการ
  "tax_rate": "7%",                     // จาก SystemSettings
  "tax_amount": "350",                  // subtotal × 0.07
  "service_charge_rate": "10%",         // จาก SystemSettings
  "service_charge_amount": "500",       // subtotal × 0.10
  
  // ราคาสุดท้าย
  "total_before_tax": "5,000",          // subtotal
  "total_tax_and_fees": "850",          // tax + service charge
  "grand_total": "5,850",               // subtotal + tax + service charge
  "currency": "THB"
}
```

### 🧾 **E-Tax Invoice Variables**
```javascript
{
  "company_tax_id": "0123456789012",    // เลขประจำตัวผู้เสียภาษี
  "invoice_number": "INV-2025-001",     // เลขที่ใบกำกับภาษี
  "tax_breakdown": {
    "taxable_amount": "5,000",          // มูลค่าก่อนภาษี
    "vat_rate": "7%",                   // อัตราภาษี
    "vat_amount": "350",                // ภาษีมูลค่าเพิ่ม
    "total_amount": "5,350"             // รวมภาษี
  }
}
```

---

## ✅ **สรุปจุดสำคัญ**

1. **💰 Database มีโครงสร้างพร้อม** แต่การคำนวณยังไม่สมบูรณ์
2. **🧮 Logic ปัจจุบัน** ใช้ fixed rate ใน email template
3. **⚠️ ปัญหาหลัก** คือ tax/service charge ไม่ได้บันทึกจริงใน database
4. **🔧 แก้ไข** ต้องเชื่อม SystemSettings กับการคำนวณจริง
5. **📊 Template Variables** ครบถ้วนสำหรับ MailerSend แล้ว

**ตอนนี้ระบบพร้อมสำหรับการออกแบบ Template แล้วครับ!** 🎯
