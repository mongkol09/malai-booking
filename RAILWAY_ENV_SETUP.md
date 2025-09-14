# 🔧 วิธีตั้งค่า Railway Database URL

## 📝 ขั้นตอนการรับ Database URL

### 1. ไปที่ Railway Dashboard
- เปิด https://railway.app
- เข้าสู่ project ของคุณ

### 2. คลิกที่ PostgreSQL Service
- จะเห็น service ที่ชื่อ "postgres-..." 
- คลิกเข้าไป

### 3. ไปแท็บ "Connect"
- จะเห็นข้อมูล connection หลายรูปแบบ
- หา **"Postgres Connection URL"**

### 4. คัดลอก URL
จะได้ URL แบบนี้:
```
postgresql://postgres:abc123xyz@viaduct.proxy.rlwy.net:12345/railway
```

## 🔄 อัปเดต .env File

### วิธีที่ 1: แก้ไขใน VS Code (แนะนำ)
1. เปิดไฟล์ `apps/api/.env`
2. หาบรรทัด `DATABASE_URL=`
3. แทนที่ด้วย URL ที่คัดลอกมาจาก Railway

### ตัวอย่าง:
```bash
# เก่า (local database)
DATABASE_URL=postgresql://postgres:Aa123456@localhost:5432/hotel_booking

# ใหม่ (Railway database)
DATABASE_URL=postgresql://postgres:abc123xyz@viaduct.proxy.rlwy.net:12345/railway
```

## ✅ ทดสอบการเชื่อมต่อ

หลังจากแก้ไข .env แล้ว ให้รันคำสั่ง:
```bash
cd apps/api
node check-railway-connection.js
```

## 🆘 หากมีปัญหา

### Error: Connection refused
- ตรวจสอบ URL ว่าคัดลอกถูกต้องหรือไม่
- ตรวจสอบ Railway database ว่า running อยู่หรือไม่

### Error: Authentication failed  
- ตรวจสอบ username/password ใน URL
- ลองคัดลอก URL ใหม่จาก Railway