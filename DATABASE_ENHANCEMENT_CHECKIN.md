# 🗄️ Database Enhancement for Check-in System

## 📋 Required Database Changes

### 1. **Booking Model Enhancement**
```prisma
model Booking {
  // Existing fields...
  
  // NEW FIELDS FOR CHECK-IN SYSTEM
  actualRoomId          String?    @map("actual_room_id")           // ห้องที่จริงๆ assign ให้
  checkinTime           DateTime?  @map("checkin_time")             // เวลา check-in จริง
  checkoutTime          DateTime?  @map("checkout_time")            // เวลา check-out จริง  
  assignedBy            String?    @map("assigned_by")              // admin ที่ assign ห้อง
  checkinBy             String?    @map("checkin_by")               // admin ที่ทำ check-in
  checkoutBy            String?    @map("checkout_by")              // admin ที่ทำ check-out
  specialRequestsCheckin String?   @map("special_requests_checkin") // คำขอพิเศษตอน check-in
  earlyCheckinTime      DateTime?  @map("early_checkin_time")       // ถ้า check-in เร็วกว่าเวลา
  lateCheckoutTime      DateTime?  @map("late_checkout_time")       // ถ้า check-out ช้ากว่าเวลา
  roomAssignedAt        DateTime?  @map("room_assigned_at")         // เวลาที่ assign ห้อง
  walkInGuest           Boolean    @default(false) @map("walk_in_guest")  // ลูกค้า walk-in
  
  // Relations  
  actualRoom            Room?      @relation("ActualRoomAssignment", fields: [actualRoomId], references: [id])
  assignedByUser        User?      @relation("BookingAssignedBy", fields: [assignedBy], references: [id])
  checkinByUser         User?      @relation("BookingCheckinBy", fields: [checkinBy], references: [id])
  checkoutByUser        User?      @relation("BookingCheckoutBy", fields: [checkoutBy], references: [id])
}
```

### 2. **Room Model Enhancement**  
```prisma
model Room {
  // Existing fields...
  
  // NEW FIELDS FOR CHECK-IN SYSTEM
  currentBookingId      String?        @map("current_booking_id")      // booking ปัจจุบัน
  lastAssignedAt        DateTime?      @map("last_assigned_at")        // เวลาที่ assign ล่าสุด
  lastCleanedAt         DateTime?      @map("last_cleaned_at")         // เวลาทำความสะอาดล่าสุด
  maintenanceNotes      String?        @map("maintenance_notes")       // หมายเหตุการซ่อมบำรุง
  housekeepingStatus    HousekeepingStatus @default(Clean) @map("housekeeping_status")
  
  // Enhanced Relations
  currentBooking        Booking?       @relation("CurrentRoomBooking", fields: [currentBookingId], references: [id])
  actualBookings        Booking[]      @relation("ActualRoomAssignment")  // ห้องที่ถูก assign จริง
  statusHistory         RoomStatusHistory[]
  checkinSessions       CheckinSession[]
}
```

### 3. **New Table: CheckinSession** 
```prisma
model CheckinSession {
  id                String    @id @default(uuid()) @map("checkin_session_id")
  bookingId         String    @map("booking_id")
  roomId            String    @map("room_id") 
  guestId           String    @map("guest_id")
  checkinStartTime  DateTime  @map("checkin_start_time")           // เริ่ม check-in
  checkinCompleteTime DateTime? @map("checkin_complete_time")      // เสร็จ check-in
  assignedBy        String    @map("assigned_by")                 // admin ที่ assign
  
  // Payment Info during check-in
  outstandingAmount Decimal   @default(0.00) @map("outstanding_amount") @db.Decimal(12, 2)
  paidAmount        Decimal   @default(0.00) @map("paid_amount") @db.Decimal(12, 2)
  paymentMethod     String?   @map("payment_method") 
  changeAmount      Decimal   @default(0.00) @map("change_amount") @db.Decimal(12, 2)
  
  // Guest Verification
  idVerified        Boolean   @default(false) @map("id_verified")
  idNumber          String?   @map("id_number")
  idType            String?   @map("id_type")                     // passport, national_id, etc.
  
  // Special Requests & Notes
  specialRequests   String?   @map("special_requests")
  checkinNotes      String?   @map("checkin_notes")
  keyCardIssued     Boolean   @default(false) @map("key_card_issued")
  
  // Status
  status            CheckinStatus @default(IN_PROGRESS) @map("status")
  
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  // Relations
  booking           Booking   @relation(fields: [bookingId], references: [id])
  room              Room      @relation(fields: [roomId], references: [id])
  guest             Guest     @relation(fields: [guestId], references: [id])
  assignedByUser    User      @relation("CheckinAssignedBy", fields: [assignedBy], references: [id])
  
  @@map("checkin_sessions")
}
```

### 4. **New Table: RoomStatusHistory**
```prisma
model RoomStatusHistory {
  id            String      @id @default(uuid()) @map("status_history_id")
  roomId        String      @map("room_id")
  previousStatus RoomStatus @map("previous_status")
  newStatus     RoomStatus  @map("new_status")
  changedBy     String      @map("changed_by")
  reason        String?     @map("reason")
  bookingId     String?     @map("booking_id")           // เกี่ยวข้องกับ booking ไหน
  notes         String?     @map("notes")
  changedAt     DateTime    @default(now()) @map("changed_at")
  
  // Relations
  room          Room        @relation(fields: [roomId], references: [id])
  changedByUser User        @relation("RoomStatusChangedBy", fields: [changedBy], references: [id])
  booking       Booking?    @relation("RoomStatusBooking", fields: [bookingId], references: [id])
  
  @@map("room_status_history")
}
```

### 5. **New Table: WalkInGuest** 
```prisma
model WalkInGuest {
  id                String    @id @default(uuid()) @map("walkin_id")
  firstName         String    @map("first_name")
  lastName          String    @map("last_name")
  email             String?   
  phoneNumber       String?   @map("phone_number")
  idNumber          String?   @map("id_number")
  idType            String?   @map("id_type")
  nationality       String?   @map("nationality")
  
  // Booking Details
  roomTypeRequested String    @map("room_type_requested")
  numberOfNights    Int       @map("number_of_nights")
  numberOfAdults    Int       @default(1) @map("number_of_adults")
  numberOfChildren  Int       @default(0) @map("number_of_children")
  
  // Pricing
  quotedRate        Decimal   @map("quoted_rate") @db.Decimal(10, 2)
  totalAmount       Decimal   @map("total_amount") @db.Decimal(12, 2)
  
  // Status
  status            WalkInStatus @default(QUOTED) @map("status")
  convertedBookingId String?   @unique @map("converted_booking_id")    // ถ้าแปลงเป็น booking แล้ว
  
  // Staff Info  
  handledBy         String    @map("handled_by")
  createdAt         DateTime  @default(now()) @map("created_at")
  
  // Relations
  handledByUser     User      @relation("WalkInHandledBy", fields: [handledBy], references: [id])
  convertedBooking  Booking?  @relation("WalkInConvertedBooking", fields: [convertedBookingId], references: [id])
  
  @@map("walkin_guests")
}
```

### 6. **New Enums**
```prisma
enum CheckinStatus {
  IN_PROGRESS
  COMPLETED
  CANCELLED
  FAILED
}

enum HousekeepingStatus {
  Clean
  Dirty  
  InProgress
  OutOfOrder
  Maintenance
}

enum WalkInStatus {
  QUOTED
  CONFIRMED
  CHECKED_IN
  CANCELLED
}
```

### 7. **Enhanced RoomStatus Enum**
```prisma
enum RoomStatus {
  Available        // ห้องพร้อมใช้
  Occupied        // มีแขกอยู่
  Reserved        // จองแล้วรอ check-in
  Cleaning        // กำลังทำความสะอาด
  Maintenance     // ซ่อมแซม
  OutOfOrder      // ชำรุด ใช้ไม่ได้
  CheckingOut     // กำลัง check-out
  CheckingIn      // กำลัง check-in
}
```

### 8. **User Model Enhancement**
```prisma
model User {
  // Existing fields...
  
  // NEW RELATIONS FOR CHECK-IN SYSTEM
  assignedBookings      Booking[]         @relation("BookingAssignedBy")
  checkinBookings       Booking[]         @relation("BookingCheckinBy")  
  checkoutBookings      Booking[]         @relation("BookingCheckoutBy")
  checkinSessions       CheckinSession[]  @relation("CheckinAssignedBy")
  roomStatusChanges     RoomStatusHistory[] @relation("RoomStatusChangedBy")
  walkInGuests          WalkInGuest[]     @relation("WalkInHandledBy")
}
```

## 🚀 Migration Script

```sql
-- Add new columns to existing tables
ALTER TABLE bookings ADD COLUMN actual_room_id UUID;
ALTER TABLE bookings ADD COLUMN checkin_time TIMESTAMP;
ALTER TABLE bookings ADD COLUMN checkout_time TIMESTAMP;
ALTER TABLE bookings ADD COLUMN assigned_by UUID;
ALTER TABLE bookings ADD COLUMN checkin_by UUID;
ALTER TABLE bookings ADD COLUMN checkout_by UUID;
ALTER TABLE bookings ADD COLUMN special_requests_checkin TEXT;
ALTER TABLE bookings ADD COLUMN early_checkin_time TIMESTAMP;
ALTER TABLE bookings ADD COLUMN late_checkout_time TIMESTAMP; 
ALTER TABLE bookings ADD COLUMN room_assigned_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN walk_in_guest BOOLEAN DEFAULT FALSE;

ALTER TABLE rooms ADD COLUMN current_booking_id UUID;
ALTER TABLE rooms ADD COLUMN last_assigned_at TIMESTAMP;
ALTER TABLE rooms ADD COLUMN last_cleaned_at TIMESTAMP;
ALTER TABLE rooms ADD COLUMN maintenance_notes TEXT;
ALTER TABLE rooms ADD COLUMN housekeeping_status VARCHAR(20) DEFAULT 'Clean';

-- Create new tables
CREATE TABLE checkin_sessions (
  checkin_session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  room_id UUID NOT NULL,
  guest_id UUID NOT NULL,
  checkin_start_time TIMESTAMP NOT NULL,
  checkin_complete_time TIMESTAMP,
  assigned_by UUID NOT NULL,
  outstanding_amount DECIMAL(12,2) DEFAULT 0.00,
  paid_amount DECIMAL(12,2) DEFAULT 0.00,
  payment_method VARCHAR(50),
  change_amount DECIMAL(12,2) DEFAULT 0.00,
  id_verified BOOLEAN DEFAULT FALSE,
  id_number VARCHAR(50),
  id_type VARCHAR(30),
  special_requests TEXT,
  checkin_notes TEXT,
  key_card_issued BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'IN_PROGRESS',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE room_status_history (
  status_history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  previous_status VARCHAR(20) NOT NULL,
  new_status VARCHAR(20) NOT NULL,
  changed_by UUID NOT NULL,
  reason TEXT,
  booking_id UUID,
  notes TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE walkin_guests (
  walkin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(50),
  id_number VARCHAR(50),
  id_type VARCHAR(30),
  nationality VARCHAR(100),
  room_type_requested VARCHAR(100) NOT NULL,
  number_of_nights INT NOT NULL,
  number_of_adults INT DEFAULT 1,
  number_of_children INT DEFAULT 0,
  quoted_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'QUOTED',
  converted_booking_id UUID UNIQUE,
  handled_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE bookings ADD CONSTRAINT fk_booking_actual_room 
  FOREIGN KEY (actual_room_id) REFERENCES rooms(room_id);
ALTER TABLE bookings ADD CONSTRAINT fk_booking_assigned_by 
  FOREIGN KEY (assigned_by) REFERENCES users(user_id);
ALTER TABLE bookings ADD CONSTRAINT fk_booking_checkin_by 
  FOREIGN KEY (checkin_by) REFERENCES users(user_id);
ALTER TABLE bookings ADD CONSTRAINT fk_booking_checkout_by 
  FOREIGN KEY (checkout_by) REFERENCES users(user_id);

ALTER TABLE rooms ADD CONSTRAINT fk_room_current_booking 
  FOREIGN KEY (current_booking_id) REFERENCES bookings(booking_id);

-- Add indexes for performance
CREATE INDEX idx_bookings_actual_room ON bookings(actual_room_id);
CREATE INDEX idx_bookings_checkin_time ON bookings(checkin_time);
CREATE INDEX idx_bookings_assigned_by ON bookings(assigned_by);
CREATE INDEX idx_rooms_current_booking ON rooms(current_booking_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_checkin_sessions_booking ON checkin_sessions(booking_id);
CREATE INDEX idx_checkin_sessions_room ON checkin_sessions(room_id);
CREATE INDEX idx_room_status_history_room ON room_status_history(room_id);
CREATE INDEX idx_walkin_guests_status ON walkin_guests(status);
```

## 📊 Benefits of This Design

### 1. **Complete Audit Trail**
- ติดตามได้ว่าใครทำอะไรเมื่อไหร่
- ประวัติการเปลี่ยนสถานะห้อง
- ข้อมูล check-in session ครบถ้วน

### 2. **Room Assignment Flexibility**  
- ห้องที่จองไว้ vs ห้องที่ได้จริง
- รองรับการเปลี่ยนห้อง
- ติดตามห้องว่าง/จอง แบบ real-time

### 3. **Walk-in Support**
- จัดการลูกค้า walk-in ได้
- แปลงเป็น booking ปกติได้
- ติดตาม conversion rate

### 4. **Payment Integration**
- บันทึกการชำระเงินตอน check-in
- รองรับหลายวิธีชำระ
- คำนวณเงินทอนอัตโนมัติ

### 5. **Housekeeping Integration**
- เชื่อมกับสถานะการทำความสะอาด
- ติดตามงานแม่บ้าน
- จัดการห้องพัก efficiently
