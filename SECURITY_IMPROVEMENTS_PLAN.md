# 🔒 Security Improvements Plan (เร่งด่วน)

## ❌ ปัญหาที่ต้องแก้ทันที

### 1. JWT Storage in localStorage (CRITICAL)
**ปัญหา**: เสี่ยงต่อ XSS attacks
**แก้ไข**: 
- เปลี่ยนเป็น HttpOnly + Secure + SameSite cookies
- หรือใช้ in-memory storage + session management

### 2. API Key Security (HIGH)
**ปัญหา**: ฮาร์ดโค้ด API keys, ไม่มี rotation
**แก้ไข**:
- เก็บ API keys ใน environment variables หรือ secure vault
- เพิ่ม API key expiration และ rotation
- Implement scoped permissions per API key

### 3. Token Lifetime (HIGH) 
**ปัญหา**: Access token 24h, Refresh token 7d ยาวเกินไป
**แก้ไข**:
- Access token: 5-15 นาที
- Refresh token: 1-3 วัน พร้อม rotation

### 4. CSRF Protection (MEDIUM)
**ปัญหา**: ไม่มี CSRF protection
**แก้ไข**:
- เพิ่ม CSRF token middleware
- กำหนด SameSite=Strict สำหรับ cookies

## 🛠️ Implementation Priority

### Phase 1 (ภายใน 1 สัปดาห์)
1. แก้ JWT storage เป็น HttpOnly cookies
2. ลด token lifetime ลง
3. เพิ่ม CSRF protection

### Phase 2 (ภายใน 2 สัปดาห์)  
1. API key management system
2. Refresh token rotation
3. Security headers enhancement

### Phase 3 (ภายใน 1 เดือน)
1. Rate limiting per user/IP
2. Security audit logging
3. Intrusion detection

## 🔧 Quick Fixes ที่ทำได้เลย

### 1. เปลี่ยน Token TTL (.env)
```env
JWT_EXPIRES_IN="15m"           # จาก 24h
JWT_REFRESH_EXPIRES_IN="1d"    # จาก 7d
```

### 2. เพิ่ม Cookie Security (app.ts)
```typescript
app.use(session({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000  // 15 minutes
  }
}));
```

### 3. Environment API Keys
```env
API_KEYS_ADMIN="admin-key-2024-$(openssl rand -hex 16)"
API_KEYS_SERVICE="service-key-2024-$(openssl rand -hex 16)"
```

## 📋 Security Checklist

- [ ] JWT เก็บใน HttpOnly cookies แทน localStorage  
- [ ] ลด access token TTL เป็น 15 นาที
- [ ] เพิ่ม refresh token rotation
- [ ] เพิ่ม CSRF protection
- [ ] API key จาก environment variables
- [ ] เพิ่ม security headers (CSP, HSTS)
- [ ] Rate limiting per user
- [ ] Security audit logging
- [ ] Input validation enhancement
- [ ] SQL injection protection

## ⚠️ คำเตือน

**อย่าปล่อยให้ JWT อยู่ใน localStorage ใน production!** 
นี่คือความเสี่ยงด้านความปลอดภัยระดับ CRITICAL

## 🎯 Target Security Level

หลังการแก้ไข ระบบจะมีความปลอดภัยระดับ:
- ✅ OWASP Top 10 compliance
- ✅ Enterprise-grade authentication
- ✅ Zero-trust security model
- ✅ PCI DSS compatible (สำหรับการชำระเงิน)
