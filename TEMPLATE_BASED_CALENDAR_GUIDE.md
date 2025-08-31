# 🎨 Template-Based Room Availability Calendar - คู่มือการใช้งาน

## 🎯 วัตถุประสงค์
ปฏิทินห้องว่างที่ปรับปรุงใหม่ โดยใช้ **Template Layout ต้นแบบ** ที่คุณให้มา พร้อมฟังก์ชันเช็คห้องว่างแบบครบครัน

---

## 🆕 **สิ่งที่เปลี่ยนแปลง**

### ✨ **Layout ใหม่ (ตาม Template ต้นแบบ)**
- **Sidebar แบบ Offcanvas**: เหมือน template ต้นแบบ
- **Profile Section**: แสดงข้อมูล Admin
- **Stats Cards**: สถิติห้องว่างแบบเรียลไทม์
- **Calendar Main Area**: พื้นที่หลักสำหรับปฏิทิน

### 🎨 **Design ใหม่**
- **Color Scheme**: ใช้ gradient สีม่วง-น้ำเงินตาม template
- **Typography**: ฟอนต์และขนาดตาม template
- **Spacing**: ระยะห่างและ padding ตาม template
- **Responsive**: รองรับมือถือแบบ template

---

## 🏗️ **โครงสร้างหน้า**

```
┌─────────────────────────────────────────────────────────────┐
│                     Page Header                             │
└─────────────────────────────────────────────────────────────┘
┌──────────────────┬──────────────────────────────────────────┐
│                  │                                          │
│     SIDEBAR      │           MAIN CALENDAR AREA             │
│                  │                                          │
│  📊 Profile      │  📅 Room Availability Calendar          │
│  📈 Stats        │                                          │
│  🔍 Quick Search │      [Calendar Grid View]                │
│  🏨 Room Types   │                                          │
│  📅 Date Picker  │                                          │
│  🧭 Navigation   │                                          │
│  🎨 Legend       │                                          │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

---

## 🚀 **ฟีเจอร์หลัก**

### 📊 **Admin Profile & Stats**
- **Profile**: แสดงข้อมูล Admin
- **Today's Stats**: 
  - Available Rooms (ห้องว่างวันนี้)
  - Bookings (จำนวนการจองวันนี้)  
  - In-House (แขกที่พักอยู่)

### 🔍 **Quick Room Check Panel**
```
🛏️ Room Type Selector
   [Dropdown: ทุกประเภทห้อง / Standard / Deluxe / ...]

📅 Date Selector  
   [Date Input: วันที่ต้องการเช็ค]
   [Button: เช็คห้องว่าง]

🧭 Calendar Navigation
   [← Today →]
```

### 📅 **Enhanced Calendar View**
- **Color-Coded Availability**:
  - 🟢 เขียว: ห้องว่างมาก (< 40% จอง)
  - 🟡 เหลือง: จองบางส่วน (40-80% จอง)
  - 🔴 แดง: เกือบเต็ม/เต็ม (> 80% จอง)

- **Interactive Features**:
  - คลิกวันที่ → ดูรายละเอียดห้องว่าง
  - Hover effects ตาม template
  - Responsive design

---

## 📱 **การใช้งานจริง**

### 📞 **สถานการณ์: ลูกค้าโทรมาจอง**

**ลูกค้า**: "สวัสดีครับ ผมอยากจองห้อง Deluxe วันที่ 25 ธันวาคม 2567"

**Admin ใช้งานได้ดังนี้**:

1. **เข้าหน้า Room Calendar**: 
   - URL: `http://localhost:3000/room-availability-calendar`

2. **ใช้ Quick Search (ใน Sidebar)**:
   ```
   🛏️ เลือกประเภทห้อง: "Deluxe"
   📅 เลือกวันที่: "2567-12-25"  
   🔍 กด "เช็คห้องว่าง"
   ```

3. **ได้ผลลัพธ์ทันที**:
   - ✅ "Deluxe: 2/4 ห้องว่าง" → **มีห้องว่าง**
   - ❌ "Deluxe: 0/4 ห้องว่าง" → **เต็มหมด**

4. **ตอบลูกค้าได้ทันที**: 
   - "ครับ วันที่ 25 ธันวาคม ห้อง Deluxe ยังมีว่าง 2 ห้องครับ"

---

## 🎯 **ข้อดีของ Template ใหม่**

### 🎨 **Design ที่สวยงาม**
- ใช้ gradient สีตาม template ต้นแบบ
- Layout สะอาดตา เป็นระเบียบ
- Typography ที่อ่านง่าย

### 📱 **Responsive Design**
- ใช้งานได้ทั้งเดสก์ท็อปและมือถือ
- Sidebar แบบ Offcanvas บนมือถือ
- Calendar ปรับขนาดอัตโนมัติ

### ⚡ **Performance ที่ดีขึ้น**
- Layout เพิ่มเร็วขึ้น
- Animation ที่ลื่นไหล
- การใช้งานที่ responsive

### 👥 **User Experience ที่ดีขึ้น**
- การจัดวางที่สมเหตุสมผล
- ข้อมูลที่สำคัญอยู่ใน sidebar
- Calendar เป็นจุดโฟกัสหลัก

---

## 🛠️ **การติดตั้งและใช้งาน**

### ไฟล์ที่เพิ่มใหม่:
```
app/admin/src/components/
├── TemplateBasedRoomCalendar.jsx     // Component หลัก (ใหม่)
├── TemplateBasedRoomCalendar.css     // Styling ตาม template (ใหม่)
└── EnhancedRoomAvailabilityCalendar.jsx  // เวอร์ชันเก่า (สำรอง)

app/admin/src/Routes.jsx              // อัปเดต routing
```

### URL Routes:
- **ใหม่**: `http://localhost:3000/room-availability-calendar` → TemplateBasedRoomCalendar
- **เก่า**: `http://localhost:3000/room-availability-calendar-old` → EnhancedRoomAvailabilityCalendar

---

## 🎨 **Template Features**

### Layout Elements:
- ✅ **Header Section**: ชื่อหน้าและ navigation
- ✅ **Sidebar**: Profile, stats, controls
- ✅ **Main Content**: Calendar view
- ✅ **Responsive**: Mobile-friendly

### Design Elements:
- ✅ **Gradient Colors**: ม่วง-น้ำเงินตาม template
- ✅ **Card Design**: Border, shadow, radius
- ✅ **Typography**: Title fonts, sizing
- ✅ **Icons**: FontAwesome icons
- ✅ **Animations**: Hover effects, transitions

---

## 📊 **API Integration**

ใช้ API เดิม (ไม่เปลี่ยน):
- `GET /api/v1/admin/availability/monthly`
- `GET /api/v1/admin/availability/date-detail`  
- `GET /api/v1/admin/availability/room-types`

---

## 🔧 **Customization**

### เปลี่ยนสี:
```css
/* ในไฟล์ TemplateBasedRoomCalendar.css */
.text-gradient {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}

.btn-primary {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}
```

### เปลี่ยน Layout:
```jsx
// ในไฟล์ TemplateBasedRoomCalendar.jsx
<div className="body-sidebar" style={{width: 'your-width'}}>
  // Sidebar content
</div>
```

---

## 🧪 **การทดสอบ**

### Test Flow:
1. **เข้าหน้า**: `http://localhost:3000/room-availability-calendar`
2. **เช็ค Layout**: Sidebar + Main content
3. **ทดสอบ Quick Search**: เลือกห้อง + วันที่ + กดเช็ค
4. **ทดสอบ Calendar**: คลิกวันที่ดูรายละเอียด
5. **ทดสอบ Mobile**: ขยาย/ย่อหน้าจอ

---

## 💡 **Tips การใช้งาน**

1. **Bookmark URL**: เพิ่ม `/room-availability-calendar` ใน bookmark
2. **Keyboard Shortcuts**: Tab → เลือกฟิลด์, Enter → ค้นหา
3. **Mobile**: ใช้ hamburger menu เพื่อเปิด sidebar
4. **Print**: Calendar สามารถพิมพ์ได้ (sidebar จะหายไป)

---

## 🎉 **สรุป**

**Template-Based Room Calendar** ใหม่นี้ผสมผสานระหว่าง:
- ✨ **ความสวยงาม** ของ template ต้นแบบ  
- ⚡ **ความเร็ว** ในการเช็คห้องว่าง
- 📱 **ความสะดวก** ในการใช้งาน
- 🎯 **ประสิทธิภาพ** ในการตอบลูกค้า

**พร้อมให้บริการลูกค้าแบบมืออาชีพแล้ว!** 🚀
