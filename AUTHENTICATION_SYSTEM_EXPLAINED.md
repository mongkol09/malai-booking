# 🔐 ระบบ Authentication ของ Hotel Booking API

## 📋 Overview
ระบบเรามี **4 ประเภทของ Authentication** ที่ใช้ในสถานการณ์ต่างกัน เพื่อรองรับการใช้งานที่หลากหลาย

---

## 🗂️ ประเภทของ Authentication

### 1. 🚫 **No Authentication (Public Routes)**
**ใช้เมื่อไร:** สำหรับ API ที่ใครๆ ก็เข้าถึงได้

**ตัวอย่าง:**
```
✅ /health - Health check
✅ /api/v1/auth/login - Login endpoint
✅ /api/v1/auth/register - Register endpoint
✅ /api/v1/public/bookings - สำหรับลูกค้าจอง
✅ /api/v1/rooms - ดูข้อมูลห้อง
✅ /api/v1/pricing - ดูราคา
✅ /api/v1/holidays - ดูวันหยุด
```

**เหตุผล:** ลูกค้าต้องดูข้อมูลพื้นฐานได้โดยไม่ต้อง login

---

### 2. 🔑 **API Key Authentication**
**ใช้เมื่อไร:** สำหรับ Development, Testing, หรือ Internal Services

**Header:** `X-API-Key: dev-api-key-2024`

**Valid API Keys:**
```javascript
const validApiKeys = [
  'hotel-booking-api-key-2024',  // Production key
  'dev-api-key-2024',            // Development key
  process.env.HOTEL_API_KEY,     // Environment key
  process.env.ADMIN_API_KEY,     // Admin key
  process.env.INTERNAL_API_SECRET // Internal service key
];
```

**ตัวอย่างการใช้:**
```bash
curl -X GET "http://localhost:3001/api/v1/booking-history/health" \
  -H "X-API-Key: dev-api-key-2024"
```

**Mock User ที่ได้:**
```javascript
req.user = {
  userId: 'api-user-123',
  email: 'api@hotel.com',
  userType: 'ADMIN',        // มีสิทธิ์ ADMIN เสมอ
  sessionId: 'api-session-123'
};
```

**เหตุผล:** 
- 🧪 Testing API ง่าย (ไม่ต้อง login)
- 🔧 Development tools
- 🤖 Internal services ที่ต้องการสิทธิ์ ADMIN

---

### 3. 🎫 **JWT Token Authentication**
**ใช้เมื่อไร:** สำหรับ User ที่ login แล้ว (Web/Mobile App)

**Header:** `Authorization: Bearer <JWT_TOKEN>`

**JWT Payload:**
```javascript
{
  userId: "e75a1482-4b69-47c8-b7fd-f69c3ab4e9d3",
  email: "admin@hotel.com",
  userType: "ADMIN",        // Role: ADMIN, MANAGER, STAFF, DEV
  sessionId: "session-123",
  iat: 1757781760,
  exp: 1757785360
}
```

**User Roles:**
- `DEV` - Developer (สิทธิ์สูงสุด)
- `ADMIN` - Administrator 
- `MANAGER` - Manager
- `STAFF` - Staff

**ตัวอย่างการใช้:**
```bash
curl -X GET "http://localhost:3001/api/v1/users" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Session Validation:**
- ตรวจสอบ JWT signature
- ตรวจสอบ UserSession ใน database
- ตรวจสอบ expiration
- ตรวจสอบ user.isActive

**เหตุผล:**
- 🔒 Security สูง
- 👤 Role-based access control
- 📱 Support mobile apps
- 🕐 Session management

---

### 4. 🎛️ **Special Authentication**
**Manual Override Routes:** ใช้ authentication แยกต่างหาก
```
/api/v1/override/* - ใช้ manual override authentication
```

---

## 🛣️ Route Authentication Mapping

### 📂 **No Auth Required:**
```javascript
// Public routes (ก่อน validateApiKey middleware)
app.use('/health', healthRoutes);                    // Health check
apiRouter.use('/auth', authRoutes);                  // Login/Register
apiRouter.use('/public/bookings', publicBookingRoutes); // Customer booking
apiRouter.use('/rooms', roomRoutes);                 // Room info
apiRouter.use('/pricing', pricingRoutes);            // Pricing info
apiRouter.use('/holidays', holidayRoutes);           // Holiday calendar
```

### 🔑 **API Key OR JWT Required:**
```javascript
// หลัง validateApiKey middleware
apiRouter.use(validateApiKey);                       // <-- Authentication wall

apiRouter.use('/users', userRoutes);                 // User management
apiRouter.use('/booking-history', bookingHistoryRoutes); // Booking history
apiRouter.use('/financial', financialRoutes);        // Financial data
apiRouter.use('/checkin', checkinRoutes);            // Check-in system
apiRouter.use('/notifications', notificationRoutes);  // Notifications
```

---

## 🔄 Authentication Flow

### 1. **validateApiKey Middleware Logic:**
```javascript
export const validateApiKey = async (req, res, next) => {
  // 1. ตรวจสอบ X-API-Key header ก่อน
  if (req.headers['x-api-key']) {
    if (validApiKeys.includes(apiKey)) {
      req.user = { userId: 'api-user-123', userType: 'ADMIN' };
      return next(); // ✅ API Key success
    }
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // 2. ถ้าไม่มี API Key ให้ตรวจสอบ JWT Token
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = req.headers.authorization.substring(7); // Remove 'Bearer '
  
  // 3. Verify JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // ✅ JWT success
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 🎯 เมื่อไรใช้อะไร?

### 🔑 **ใช้ API Key เมื่อ:**
1. **Development/Testing** - ง่าย ไม่ต้อง login
2. **Internal Services** - Service-to-service communication
3. **Admin Tools** - Quick admin access
4. **Debugging** - ทดสอบ API อย่างรวดเร็ว

**ข้อดี:**
- ✅ Simple & Fast
- ✅ No expiration
- ✅ Always ADMIN role

**ข้อเสีย:**
- ❌ ไม่มี role control (เป็น ADMIN เสมอ)
- ❌ ไม่มี user tracking
- ❌ Security ต่ำกว่า JWT

### 🎫 **ใช้ JWT เมื่อ:**
1. **Production Web App** - User login system
2. **Mobile App** - User authentication
3. **Role-based Access** - ต้องการ ADMIN/STAFF/MANAGER
4. **Session Management** - ต้องการ logout, session tracking

**ข้อดี:**
- ✅ Security สูง
- ✅ Role-based access control
- ✅ Session management
- ✅ User tracking
- ✅ Token expiration

**ข้อเสีย:**
- ❌ ซับซ้อนกว่า API Key
- ❌ ต้อง login ก่อน
- ❌ Token อาจ expire

---

## 💡 **สรุปแนวคิด:**

1. **Public Routes** → ไม่ต้อง auth (ลูกค้าดูข้อมูล)
2. **API Key** → Development & Internal services (ง่าย+เร็ว)
3. **JWT Token** → Production user authentication (ปลอดภัย+role)
4. **Special Auth** → Custom authentication logic

**ระบบนี้ยืดหยุ่น** - รองรับทั้ง development และ production ในเวลาเดียวกัน!

---

## 🧪 **ตัวอย่างการใช้งาน:**

### Development Testing:
```bash
# ใช้ API Key (ง่าย)
curl -H "X-API-Key: dev-api-key-2024" \
  http://localhost:3001/api/v1/booking-history/health
```

### Production Web App:
```javascript
// ใช้ JWT Token (ปลอดภัย)
const response = await fetch('/api/v1/users', {
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Customer Booking:
```javascript
// ไม่ต้อง auth (public)
const response = await fetch('/api/v1/public/bookings', {
  method: 'POST',
  body: JSON.stringify(bookingData)
});
```

นี่คือเหตุผลที่เรามีหลายแบบผสมกัน - เพื่อรองรับ use case ที่แตกต่างกัน! 🎯