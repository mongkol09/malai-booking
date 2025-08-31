# Hotel Booking API - Complete Endpoints Documentation

## 🚀 Server Information
- **Base URL**: `http://localhost:3001/api/v1`
- **Health Check**: `http://localhost:3001/health`
- **Environment**: Development
- **Status**: ✅ Running

## 🔐 Authentication
All protected routes require:
- **Header**: `Authorization: Bearer <jwt_token>`
- **API Key**: `X-API-Key: <api_key>` (configured in .env)

## 📋 Available API Endpoints

### 1. Authentication Routes (`/api/v1/auth`)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### 2. User Management (`/api/v1/users`)
- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update current user profile
- `GET /api/v1/users/:id` - Get user by ID (Admin only)
- `PUT /api/v1/users/:id` - Update user by ID (Admin only)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### 3. Room Management (`/api/v1/rooms`)
- `GET /api/v1/rooms` - Get all rooms
- `GET /api/v1/rooms/:id` - Get room by ID
- `POST /api/v1/rooms` - Create new room (Admin/Manager)
- `PUT /api/v1/rooms/:id` - Update room (Admin/Manager)
- `DELETE /api/v1/rooms/:id` - Delete room (Admin only)
- `GET /api/v1/rooms/available` - Check room availability
- `PUT /api/v1/rooms/:id/status` - Update room status

### 4. Booking Management (`/api/v1/bookings`)
- `GET /api/v1/bookings` - Get all bookings
- `GET /api/v1/bookings/:id` - Get booking by ID
- `POST /api/v1/bookings` - Create new booking
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Cancel booking
- `POST /api/v1/bookings/:id/checkin` - Check-in guest
- `POST /api/v1/bookings/:id/checkout` - Check-out guest

### 5. Dynamic Pricing (`/api/v1/pricing`)
- `GET /api/v1/pricing/rules` - Get all pricing rules
- `GET /api/v1/pricing/rules/:id` - Get pricing rule by ID
- `POST /api/v1/pricing/rules` - Create new pricing rule (Admin/Manager)
- `PUT /api/v1/pricing/rules/:id` - Update pricing rule (Admin/Manager)
- `DELETE /api/v1/pricing/rules/:id` - Delete pricing rule (Admin only)
- `POST /api/v1/pricing/calculate` - Calculate dynamic pricing
- `GET /api/v1/pricing/preview` - Preview pricing for date range

### 6. Financial Management (`/api/v1/financial`)

#### Folios
- `GET /api/v1/financial/folios` - Get all folios
- `GET /api/v1/financial/folios/:id` - Get folio by ID
- `POST /api/v1/financial/folios` - Create new folio (Admin/Front Desk)

#### Transactions
- `GET /api/v1/financial/transactions` - Get all transactions
- `POST /api/v1/financial/transactions` - Create new transaction (Admin/Front Desk/Cashier)

#### Invoices
- `GET /api/v1/financial/invoices` - Get all invoices
- `POST /api/v1/financial/invoices` - Create new invoice (Admin/Front Desk/Accounting)

#### Payments
- `POST /api/v1/financial/payments` - Process payment (Admin/Front Desk/Cashier)

#### Reports & Analytics
- `GET /api/v1/financial/reports/revenue` - Revenue report (Admin/Manager/Accounting)
- `GET /api/v1/financial/reports/outstanding` - Outstanding balances (Admin/Manager/Accounting)
- `GET /api/v1/financial/reports/payment-methods` - Payment methods analysis (Admin/Manager/Accounting)

## 🎯 Feature Coverage

### ✅ Implemented Features
1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Password encryption (bcrypt)
   - Session management

2. **User Management**
   - User registration/login
   - Profile management
   - Admin user management

3. **Room & Booking System**
   - Room availability checking
   - Booking creation/management
   - Check-in/check-out processes

4. **Dynamic Pricing Engine**
   - Rule-based pricing system
   - Real-time price calculation
   - Date range pricing
   - Room type specific pricing

5. **Financial Management**
   - Folio management
   - Transaction recording
   - Invoice generation
   - Payment processing
   - Financial reporting

6. **Security & Compliance**
   - API key validation
   - Rate limiting
   - Input validation
   - SQL injection prevention
   - CORS protection

### 🔄 Next Phase Features (Ready for Implementation)
1. **Advanced Analytics Dashboard**
2. **Real-time Notifications**
3. **Email Integration (MailerSend)**
4. **Inventory Management**
5. **Housekeeping Management**
6. **Maintenance Tracking**
7. **Event Management**
8. **Cab/Vehicle Booking**
9. **Loyalty Program**
10. **Multi-language Support**

## 🛠️ Technical Architecture

### Database
- **PostgreSQL** with Prisma ORM
- **Schema**: 50+ tables covering all hotel operations
- **Relations**: Properly normalized with foreign keys
- **Indexing**: Optimized for performance

### Security
- **JWT Authentication**: Access + Refresh tokens
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: express-validator
- **SQL Injection Protection**: Prisma ORM
- **CORS Protection**: Configurable origins

### API Standards
- **RESTful Design**: Standard HTTP methods
- **Consistent Response Format**: JSON with success/error flags
- **Error Handling**: Centralized error middleware
- **Logging**: Winston logger with audit trails
- **Documentation**: Comprehensive endpoint docs

## 🧪 Testing Endpoints

### Test Health Check
```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:3001/health

# Node.js
node -e "const http = require('http'); http.get('http://localhost:3001/health', (res) => { let data = ''; res.on('data', chunk => data += chunk); res.on('end', () => console.log(JSON.parse(data))); });"
```

### Test API Endpoints (with API Key)
```bash
# Example: Get all pricing rules
Invoke-WebRequest -Uri "http://localhost:3001/api/v1/pricing/rules" -Headers @{"X-API-Key" = "your-api-key"}
```

## 📊 Database Models
- Users, Guests, Staff
- Rooms, RoomTypes, Bookings
- DynamicPricingRules, DailyRoomRates
- Folios, Transactions, PaymentMethods
- Services, Promotions, Events
- Inventory, Maintenance, Housekeeping
- Notifications, AuditLogs

## 🎉 Ready for Production Features
- ✅ Complete backend API
- ✅ Database schema implemented
- ✅ Authentication & authorization
- ✅ Dynamic pricing engine
- ✅ Financial management system
- ✅ Comprehensive error handling
- ✅ Security best practices
- ✅ Scalable architecture

The Hotel Booking API is now **fully functional** and ready for frontend integration and advanced feature development!
