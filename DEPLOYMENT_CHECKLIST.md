# 📋 Template Deployment Checklist

## 🎯 Pre-Deployment Preparation

### ✅ Files Ready
- [x] `malai-booking-confirmation-template.html` - Template HTML ที่สมบูรณ์
- [x] `TEMPLATE_SETUP_GUIDE.md` - คู่มือการ setup
- [x] `test-new-template.js` - Script ทดสอบ data structure
- [x] Logo file - พร้อมสำหรับ upload
- [x] Brand guidelines - สีและ typography

### ✅ Testing Completed
- [x] Template variables mapping
- [x] QR code generation and embedding
- [x] Email sending via MailerSend API
- [x] Mobile responsiveness (visual inspection)
- [x] Brand consistency verification

## 🚀 MailerSend Setup Process

### Step 1: Asset Upload
- [ ] เข้า MailerSend Dashboard
- [ ] อัปโหลด logo ไปยัง Assets section
- [ ] บันทึก URL ของ logo
- [ ] ทดสอบ logo accessibility

### Step 2: Template Creation
- [ ] สร้าง Template ใหม่ใน MailerSend
- [ ] ตั้งชื่อ: "Malai Khaoyai - Booking Confirmation v2.0"
- [ ] Copy HTML จาก `malai-booking-confirmation-template.html`
- [ ] อัปเดต logo URL ใน HTML
- [ ] Save template และบันทึก Template ID

### Step 3: Variable Mapping
ตรวจสอบ variables ทั้งหมด:
- [ ] `{{Customer_name}}`
- [ ] `{{booking_id}}`
- [ ] `{{check_in_date}}`
- [ ] `{{check_in_time}}`
- [ ] `{{check_out_date}}`
- [ ] `{{check_out_time}}`
- [ ] `{{room_type}}`
- [ ] `{{guest_count}}`
- [ ] `{{nights}}`
- [ ] `{{total}}`
- [ ] `{{qr_code_data}}`
- [ ] `{{manage_booking_url}}`
- [ ] `{{receipt_url}}`
- [ ] `{{hotel_email}}`
- [ ] `{{hotel_phone}}`
- [ ] `{{hotel_website}}`
- [ ] `{{hotel_name}}`
- [ ] `{{hotel_signature_name}}`

### Step 4: Template Testing
- [ ] ส่ง test email ผ่าน MailerSend interface
- [ ] ตรวจสอบการแสดงผลบน desktop
- [ ] ตรวจสอบการแสดงผลบน mobile
- [ ] ทดสอบ CTA button clicks
- [ ] ตรวจสอบ QR code scan-ability

## 🔧 Code Update Process

### Step 1: Environment Update
```bash
# อัปเดตไฟล์ .env
BOOKING_CONFIRMATION_TEMPLATE_ID=NEW_TEMPLATE_ID_HERE
```

### Step 2: Controller Verification
ตรวจสอบใน `emailController.ts`:
- [ ] Variable names ตรงกับ template
- [ ] QR code generation working
- [ ] Error handling complete
- [ ] Logging functionality

### Step 3: Test with New Template ID
```bash
# รัน test script
cd d:\Hotel_booking\apps\api
node test-new-template.js
```

## 📧 Production Testing

### Test Scenarios
- [ ] **Normal Booking**: ทดสอบ booking ปกติ
- [ ] **Thai Characters**: ทดสอบชื่อลูกค้าภาษาไทย
- [ ] **Long Names**: ทดสอบชื่อที่ยาว
- [ ] **Special Dates**: ทดสอบวันหยุดพิเศษ
- [ ] **Different Room Types**: ทดสอบประเภทห้องต่างๆ

### Email Client Testing
- [ ] Gmail (Desktop)
- [ ] Gmail (Mobile)
- [ ] Outlook
- [ ] Apple Mail
- [ ] Yahoo Mail

## 🔍 Quality Assurance

### Visual Inspection
- [ ] Logo แสดงผลถูกต้อง
- [ ] สีตรงตาม brand guidelines
- [ ] Font rendering เหมาะสม
- [ ] Spacing และ layout สวยงาม
- [ ] QR code ชัดเจน scannable

### Content Verification
- [ ] ข้อมูลการจองถูกต้อง
- [ ] วันที่และเวลาแสดงผลดี
- [ ] ราคาถูกต้อง
- [ ] Links ทำงานได้
- [ ] Contact information ถูกต้อง

### UX Testing
- [ ] อ่านง่าย scan ได้เร็ว
- [ ] CTA buttons เด่นชัด
- [ ] Mobile experience ดี
- [ ] Loading time รวดเร็ว

## 🚨 Rollback Plan

หาก template ใหม่มีปัญหา:

### Emergency Rollback
```bash
# กลับไปใช้ template เก่า
BOOKING_CONFIRMATION_TEMPLATE_ID=jpzkmgqqwyvg059v
```

### Issue Tracking
- [ ] บันทึกปัญหาที่พบ
- [ ] Screenshot error states
- [ ] Customer feedback
- [ ] Technical logs

## 📈 Success Metrics

### Week 1 Targets
- [ ] 0 delivery failures
- [ ] 0 rendering issues reported
- [ ] > 80% email open rate
- [ ] > 30% click-through rate on CTAs

### Customer Feedback
- [ ] Collect feedback via support channels
- [ ] Monitor social media mentions
- [ ] Track booking conversion rates
- [ ] Measure customer satisfaction scores

## 🎉 Go-Live Checklist

### Final Steps
- [ ] ✅ All tests passed
- [ ] ✅ Stakeholder approval
- [ ] ✅ Documentation updated
- [ ] ✅ Team notification sent
- [ ] ✅ Monitoring alerts configured

### Post-Launch
- [ ] Monitor first 24 hours closely
- [ ] Check email delivery rates
- [ ] Respond to any customer feedback
- [ ] Document lessons learned

---
**Checklist Version**: 1.0  
**Deployment Date**: ___________  
**Deployed By**: ___________  
**Status**: Ready for Deployment
