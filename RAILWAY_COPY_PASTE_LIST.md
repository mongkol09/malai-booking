# 📋 Railway Environment Variables - Copy & Paste Ready

## 🚀 **Copy ตัวแปรเหล่านี้ไปใส่ใน Railway Backend Service:**

### **📌 CRITICAL VARIABLES (ต้องใส่ก่อน)**

```
DATABASE_URL
```
```
postgresql://postgres:zwLnHwedYPekJyhAiBnfswlDxKHwaaom@shinkansen.proxy.rlwy.net:29459/railway
```

```
NODE_ENV
```
```
production
```

```
PORT
```
```
3001
```

```
CORS_ORIGINS
```
```
https://malai-booking.vercel.app,https://malai-resort.com,https://admin.malai-resort.com
```

```
ALLOW_DEV_BYPASS
```
```
false
```

### **🔐 SECURITY & ENCRYPTION**

```
ENCRYPTION_KEY
```
```
2173d0fbb40a48b5a1e39f3fb4a0c4efe3686f4ce5b3e50fb0cf91ba44f4292f
```

```
JWT_SECRET
```
```
b72bc72cf65eeffb918b25e5664c4bc342cf405b620b52bd1112618b85eb7343e1d6fb36ed8546d222002d3efa300cd9ea0cee5d913d7c5517325ce309cf8c46
```

```
JWT_EXPIRES_IN
```
```
24h
```

```
JWT_REFRESH_SECRET
```
```
848c94eef6d8fd619a8b12ee7ed04d6f5280b271effd15e1a8057f3b4bd7574cea37b7ca6b51797dc3f193ffb79451ddafc72d9466b50ead3c985696034d50e4
```

```
JWT_REFRESH_EXPIRES_IN
```
```
7d
```

### **🔑 API KEYS (Ultra-Secure)**

```
API_KEY
```
```
hbk_prod_2024_ultra_secure_dd9c2f1c643e55a80b50c0985a7ccb058b2388e4f6cdce6d150065d1c0c54f1f
```

```
ADMIN_API_KEY
```
```
hbk_admin_2024_ultra_secure_4a94def33f3c8131deb140f721809baf8e23ce23e020b104290f06ace6a2c8c7
```

```
API_KEY_INTERNAL
```
```
mhr_internal_4a66513109a3a4880ebcb69a6ba1cf149738babdaf8a1ff54fe890fc807e9d4a
```

```
API_KEY_ANALYTICS
```
```
mhr_analytics_09f513597f113b318e770d9cc378232d01c154e4c9959c8a035b5be304b2ff9a
```

```
API_KEY_ADMIN
```
```
mhr_admin_1cbce72c45bd831c266003feaf575e5eded84cb24a5250ae1aa388d41bd6e786
```

### **📧 EMAIL CONFIGURATION**

```
EMAIL_PRIMARY_PROVIDER
```
```
mailersend
```

```
MAILERSEND_API_TOKEN
```
```
mlsn.ee4ef76c01536d6e7dfb54cb3fc7bb7e8ee236b77b91434b75d77884e4604e0d
```

```
MAILERSEND_SMTP_HOST
```
```
smtp.mailersend.net
```

```
MAILERSEND_SMTP_PORT
```
```
587
```

```
MAILERSEND_SMTP_USER
```
```
MS_9NrrJx@malairesort.com
```

```
MAILERSEND_SMTP_PASS
```
```
mssp.iWjP5Z3.3z0vklodzyvg7qrx.vXOx2G8
```

```
FROM_EMAIL
```
```
noreply@malairesort.com
```

```
FROM_NAME
```
```
Malai Resort Khaoyai
```

```
SUPPORT_EMAIL
```
```
center@malaikhaoyai.com
```

```
ADMIN_EMAIL
```
```
center@malaikhaoyai.com
```

### **💳 PAYMENT (Omise)**

```
OMISE_PUBLIC_KEY
```
```
pkey_test_64oiiilaiztfl3h9619
```

```
OMISE_SECRET_KEY
```
```
skey_test_64oiiiloi7mf5nmyxn5
```

```
OMISE_WEBHOOK_SECRET
```
```
malai-resort-omise-webhook-secret-2024
```

```
OMISE_VERIFY_IP
```
```
false
```

### **🔔 TELEGRAM BOTS (ต้องใส่ token จริง)**

```
TELEGRAM_BOT_TOKEN
```
```
YOUR_CEO_BOT_TOKEN_HERE
```

```
TELEGRAM_CHAT_ID
```
```
-1002579208700
```

```
TELEGRAM_ADMIN_CHAT_ID
```
```
-1002579208700
```

```
STAFF_TELEGRAM_BOT_TOKEN
```
```
YOUR_STAFF_BOT_TOKEN_HERE
```

```
STAFF_TELEGRAM_CHAT_ID
```
```
-1002926114573
```

### **👤 ADMIN USER**

```
ADMIN_EMAIL
```
```
center@malaikhaoyai.com
```

```
ADMIN_PASSWORD
```
```
noi889988
```

```
ADMIN_FIRST_NAME
```
```
Ruuk
```

```
ADMIN_LAST_NAME
```
```
Administrator
```

### **⚙️ APPLICATION SETTINGS**

```
API_VERSION
```
```
v1
```

```
APP_NAME
```
```
Malai Resort
```

```
APP_VERSION
```
```
V1.0.0
```

```
ENABLE_REGISTRATION
```
```
false
```

```
ENABLE_EMAIL_NOTIFICATIONS
```
```
true
```

```
ENABLE_TELEGRAM_NOTIFICATIONS
```
```
true
```

```
ENABLE_MAINTENANCE_MODE
```
```
false
```

```
ENABLE_DEBUG_MODE
```
```
false
```

```
LOG_LEVEL
```
```
info
```

---

## 📝 **วิธีใช้:**

1. **Copy Name** (บรรทัดแรก)
2. **Copy Value** (บรรทัดที่สอง) 
3. **Paste ใน Railway Variables**
4. **Add Variable**
5. **ทำซ้ำทุกตัว**

## ⚠️ **สำคัญ:**

- **Telegram Tokens**: ต้องแทนที่ `YOUR_*_TOKEN_HERE` ด้วย token จริงจาก @BotFather
- **CORS_ORIGINS**: อัปเดตแล้วให้รวม Vercel domain
- **DATABASE_URL**: ใช้ Railway database URL จริง

## ✅ **หลัง Copy เสร็จ:**

1. **Redeploy Railway Backend**
2. **Test Health Check**: `https://malai-booking-env.up.railway.app/health`
3. **Test API**: `https://malai-booking-env.up.railway.app/api/v1/users`

---

**Status**: 🟢 **Ready to Copy to Railway!**