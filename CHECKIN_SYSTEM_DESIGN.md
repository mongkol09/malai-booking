# 🏨 Hotel Check-in System Design Document

## 📋 Project Overview
**System**: Hotel Admin Check-in & Room Assignment System  
**Date**: August 23, 2025  
**Status**: Design Phase  
**Target URL**: `/check-in` (adapted from `/housekeeping-assign-room`)

---

## 🎯 System Concept

### **Core Idea**
Transform the existing housekeeping room assignment interface into a comprehensive Check-in & Room Assignment system where:

1. **Visual Room Overview** - Staff see all rooms with real-time status
2. **One-Click Assignment** - Toggle switches to assign guests to rooms
3. **Integrated Workflow** - Check-in + Room Assignment + Payment in one process
4. **Walk-in Support** - Handle both pre-booked and walk-in guests
5. **Document Generation** - Print confirmations, key cards, receipts

---

## 🔄 User Flow Design

### **Primary Workflow**
```
1. Front Desk View → Room Status Grid (Visual Overview)
2. Guest Arrives → Staff clicks room toggle switch  
3. Modal Opens → Shows guest selection for that room type
4. Select Guest → Display full booking form (same as /room-booking)
5. Verify/Update → Confirm guest details & payment
6. Process Payment → Handle any outstanding balance
7. Complete Check-in → Assign room + Update status + Print documents
8. Success → Room shows as "Occupied", guest is checked in
```

### **Alternative Flows**
- **Walk-in Guest**: Create new booking → Assign room → Process payment
- **Room Change**: Move guest from one room to another
- **Group Check-in**: Handle multiple guests/rooms simultaneously

---

## 🏗️ Technical Architecture

### **Frontend Components**

#### **1. CheckInRoomGrid.jsx** (Main Component)
```jsx
// Adapted from HouseKeepingAssignRoom.jsx
- Visual grid of all rooms with toggle switches
- Real-time status indicators
- Filter by room type, status, floor
- Responsive layout for different screen sizes
```

#### **2. CheckInModal.jsx** (Modal Component)  
```jsx
// New component with multiple steps
- Guest Selection (for room type)
- Booking Form (reuse from /room-booking)
- Payment Processing
- Confirmation & Printing
```

#### **3. RoomStatusCard.jsx** (Individual Room)
```jsx
// Enhanced room card component
- Room number & type
- Current status (Available/Occupied/Cleaning/Maintenance)
- Guest information (if occupied)
- Toggle switch for assignment
- Visual status indicators
```

#### **4. GuestSelectionStep.jsx**
```jsx
// Step 1 of modal
- List confirmed bookings for selected room type
- Search functionality
- Guest details preview
- Walk-in option
```

#### **5. PaymentProcessingStep.jsx**
```jsx
// Step 2 of modal  
- Outstanding balance display
- Payment method selection
- Amount collection
- Change calculation
```

#### **6. PrintingStep.jsx**
```jsx
// Step 3 of modal
- Key card printing
- Receipt generation  
- Welcome letter
- Checkout instructions
```

### **Backend API Requirements**

#### **New Endpoints Needed**

1. **`GET /api/v1/rooms/status`**
   ```json
   {
     "rooms": [
       {
         "roomNumber": "101",
         "roomType": "Onsen Villa", 
         "status": "available|occupied|cleaning|maintenance",
         "currentBooking": null,
         "lastCleaned": "2025-08-23T10:00:00Z"
       }
     ]
   }
   ```

2. **`GET /api/v1/bookings/pending-checkin`**
   ```json
   {
     "bookings": [
       {
         "id": "booking-123",
         "guestName": "John Doe",
         "roomType": "Onsen Villa",
         "checkInDate": "2025-08-23",
         "status": "confirmed",
         "outstandingBalance": 1500
       }
     ]
   }
   ```

3. **`POST /api/v1/rooms/:roomNumber/assign`**
   ```json
   {
     "bookingId": "booking-123",
     "checkInTime": "2025-08-23T14:30:00Z",
     "assignedBy": "admin-user-id",
     "paymentDetails": {
       "method": "cash",
       "amount": 1500,
       "change": 0
     }
   }
   ```

4. **`GET /api/v1/rooms/:roomType/available`**
   ```json
   {
     "availableRooms": ["101", "103", "105"],
     "totalAvailable": 3,
     "roomType": "Onsen Villa"
   }
   ```

5. **`PUT /api/v1/bookings/:id/checkin-with-room`**
   ```json
   {
     "roomNumber": "101",
     "checkInTime": "2025-08-23T14:30:00Z",
     "paymentProcessed": true,
     "additionalCharges": 0,
     "specialRequests": "Late checkout requested"
   }
   ```

### **Database Schema Updates**

#### **Bookings Table Enhancement**
```sql
ALTER TABLE bookings ADD COLUMN room_number VARCHAR(10);
ALTER TABLE bookings ADD COLUMN room_assigned_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN checked_in_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN assigned_by VARCHAR(50);
ALTER TABLE bookings ADD COLUMN special_requests TEXT;
```

#### **New Rooms Table**
```sql
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    floor VARCHAR(10),
    status VARCHAR(20) DEFAULT 'available',
    current_booking_id VARCHAR(50),
    last_cleaned_at TIMESTAMP,
    maintenance_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Room Status Events Table**
```sql
CREATE TABLE room_status_events (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    booking_id VARCHAR(50),
    changed_by VARCHAR(50),
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 UI/UX Design Specifications

### **Room Status Color Coding**
- 🟢 **Available/Ready** - Green (can assign guest)
- 🔴 **Occupied** - Red (guest currently staying)
- 🟡 **Pending Check-in** - Yellow (reserved, waiting for guest)
- 🔵 **Cleaning** - Blue (housekeeping in progress)  
- ⚫ **Maintenance** - Gray (out of service)
- 🟣 **Checkout** - Purple (guest left, needs cleaning)

### **Room Card Layout**
```
┌─────────────────────┐
│ 🟢 [Toggle Switch]  │
│                     │
│    Room No. 101     │
│    Onsen Villa      │
│                     │
│ Status: Available   │
│ Last Cleaned: 10:00 │
└─────────────────────┘
```

### **Modal Flow Wireframe**
```
Step 1: Guest Selection
┌─────────────────────────────────┐
│ Select Guest for Room 101       │
├─────────────────────────────────┤
│ ○ John Doe - Onsen Villa        │
│   Check-in: Today, Balance: ฿0  │
│                                 │
│ ○ Jane Smith - Onsen Villa      │
│   Check-in: Today, Balance: ฿500│
│                                 │
│ + Add Walk-in Guest             │
├─────────────────────────────────┤
│ [Cancel]           [Continue] → │
└─────────────────────────────────┘

Step 2: Booking Details & Payment
┌─────────────────────────────────┐
│ Complete Check-in: John Doe     │
├─────────────────────────────────┤
│ [Full booking form - same as    │
│  /room-booking interface]       │
│                                 │
│ Outstanding Balance: ฿1,500     │
│ Payment Method: [Cash ▼]        │
│ Amount Received: [1,500]        │
│ Change: ฿0                      │
├─────────────────────────────────┤
│ [Back] [Skip Payment] [Process] │
└─────────────────────────────────┘

Step 3: Confirmation & Printing
┌─────────────────────────────────┐
│ ✅ Check-in Successful!         │
├─────────────────────────────────┤
│ Guest: John Doe                 │
│ Room: 101 (Onsen Villa)         │
│ Check-in: 2:30 PM               │
│                                 │
│ Print Options:                  │
│ ☑️ Key Card                     │
│ ☑️ Receipt                      │
│ ☑️ Welcome Letter               │
│ ☑️ Checkout Instructions        │
├─────────────────────────────────┤
│ [Print All] [Close]             │
└─────────────────────────────────┘
```

---

## 🔧 Implementation Phases

### **Phase 1: Foundation (Week 1)**
- [ ] Create room management API endpoints
- [ ] Update booking schema with room assignment
- [ ] Setup room status tracking
- [ ] Create basic room grid UI

### **Phase 2: Core Functionality (Week 2)**  
- [ ] Implement check-in modal flow
- [ ] Integrate guest selection logic
- [ ] Connect payment processing
- [ ] Add room assignment functionality

### **Phase 3: Enhancement (Week 3)**
- [ ] Add printing capabilities
- [ ] Implement real-time status updates
- [ ] Create walk-in booking flow
- [ ] Add error handling & validation

### **Phase 4: Polish (Week 4)**
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Testing & bug fixes
- [ ] Documentation & training

---

## 🚨 Potential Issues & Solutions

### **Problem 1: Room Assignment Conflicts**
**Issue**: Multiple staff assign same room simultaneously  
**Solution**: Implement room locking mechanism with 5-minute timeout

### **Problem 2: Guest No-Show**
**Issue**: Room assigned but guest doesn't arrive  
**Solution**: Add "Release Room" function with confirmation

### **Problem 3: Overbooking**
**Issue**: More confirmed bookings than available rooms  
**Solution**: Waiting list system + upgrade options

### **Problem 4: Walk-in During Peak**
**Issue**: No rooms available for walk-in guests  
**Solution**: Waitlist + automatic notification when rooms become available

### **Problem 5: Payment Integration**
**Issue**: Multiple payment methods and complex billing  
**Solution**: Modular payment system with plugin architecture

---

## 📊 Success Metrics

### **Operational Efficiency**
- Check-in time reduction: Target < 3 minutes per guest
- Room assignment accuracy: 99%+ correct assignments
- Staff training time: < 2 hours for new staff

### **Guest Experience**
- Check-in satisfaction score: > 4.5/5
- Wait time reduction: 50% compared to current process
- Error rate: < 1% incorrect room assignments

### **System Performance**
- Room status update latency: < 2 seconds
- Modal load time: < 1 second
- Print job completion: < 30 seconds

---

## 🔮 Future Enhancements

### **Advanced Features**
- **Mobile Check-in**: Guest self-service via QR codes
- **AI Room Optimization**: Automatic room assignment based on preferences
- **Integration Hub**: Connect with PMS, accounting, and marketing systems
- **Analytics Dashboard**: Occupancy trends, revenue optimization
- **Guest Communication**: Automated welcome messages and instructions

### **Scalability Considerations**
- **Multi-property Support**: Manage multiple hotel locations
- **Role-based Permissions**: Different access levels for staff
- **API Rate Limiting**: Handle high-traffic periods
- **Backup & Recovery**: Ensure data safety and system uptime

---

## 📞 Technical Contacts & Resources

### **Development Team**
- **Frontend Lead**: React.js specialist needed
- **Backend Lead**: Node.js + PostgreSQL expert
- **UI/UX Designer**: Hotel industry experience preferred
- **QA Tester**: Focus on hospitality workflows

### **External Dependencies**
- **Printing Service**: Research thermal printer APIs
- **Payment Gateway**: Integration with existing payment processor
- **Notification System**: SMS/Email service for confirmations
- **Backup Solution**: Cloud storage for document archival

---

*Last Updated: August 23, 2025*  
*Version: 1.0*  
*Status: Design Complete - Ready for Development*
