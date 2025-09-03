-- ===============================================
-- Hotel Booking System - Complete Database Schema
-- PostgreSQL Database
-- Generated: 2025-08-11
-- ===============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- ===============================================

-- Users table (สำหรับ Authentication ทั้ง Admin และ Customers)
CREATE TABLE Users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('ADMIN', 'CUSTOMER', 'STAFF')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions
CREATE TABLE UserSessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    access_token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- ===============================================
-- 2. HOTEL CORE MANAGEMENT
-- ===============================================

-- Room Types (ประเภทห้องพัก)
CREATE TABLE RoomTypes (
    room_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_rate DECIMAL(10, 2) NOT NULL,
    capacity_adults INTEGER NOT NULL DEFAULT 2,
    capacity_children INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    amenities JSONB, -- เก็บสิ่งอำนวยความสะดวก
    size_sqm DECIMAL(8, 2), -- ขนาดห้อง
    bed_type VARCHAR(50), -- ประเภทเตียง
    floor_plan_id UUID, -- Foreign Key to FloorPlans
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Floor Plans (แผนผังชั้น)
CREATE TABLE FloorPlans (
    floor_plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_number INTEGER NOT NULL,
    floor_name VARCHAR(100),
    layout_image_url TEXT,
    total_rooms INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bed Types (ประเภทเตียง)
CREATE TABLE BedTypes (
    bed_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- เช่น "King Size", "Queen Size", "Twin Bed"
    description TEXT,
    capacity INTEGER NOT NULL DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rooms (ห้องพักแต่ละห้อง)
CREATE TABLE Rooms (
    room_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(10) NOT NULL UNIQUE,
    room_type_id UUID NOT NULL REFERENCES RoomTypes(room_type_id),
    floor_plan_id UUID REFERENCES FloorPlans(floor_plan_id),
    status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Dirty', 'Cleaning', 'Maintenance', 'Out-of-Order')),
    last_checkout_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guests (ข้อมูลลูกค้า)
CREATE TABLE Guests (
    guest_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES Users(user_id), -- เชื่อมกับ Users table
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    country VARCHAR(100),
    id_number VARCHAR(50), -- เลขบัตรประชาชน/พาสปอร์ต
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Booking Types (ประเภทการจอง)
CREATE TABLE BookingTypes (
    booking_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- เช่น "Online", "Walk-in", "Agent", "Corporate"
    description TEXT,
    commission_rate DECIMAL(5, 2) DEFAULT 0.00, -- เปอร์เซ็นต์ค่าคอมมิชชั่น
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings (การจองหลัก)
CREATE TABLE Bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference_id VARCHAR(20) UNIQUE NOT NULL, -- เช่น "B-12345"
    guest_id UUID NOT NULL REFERENCES Guests(guest_id),
    room_id UUID NOT NULL REFERENCES Rooms(room_id),
    booking_type_id UUID REFERENCES BookingTypes(booking_type_id),
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    num_adults INTEGER NOT NULL DEFAULT 1,
    num_children INTEGER NOT NULL DEFAULT 0,
    total_price DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    final_amount DECIMAL(12, 2) NOT NULL, -- total_price - discount + tax
    status VARCHAR(50) DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'In-House', 'Completed', 'Cancelled', 'No-Show')),
    cancellation_policy_id UUID,
    special_requests TEXT,
    source VARCHAR(100), -- เช่น "Website", "Phone", "Walk-in"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 3. DYNAMIC PRICING SYSTEM
-- ===============================================

-- Daily Room Rates (ราคาประจำวัน)
CREATE TABLE DailyRoomRates (
    daily_rate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    room_type_id UUID NOT NULL REFERENCES RoomTypes(room_type_id),
    current_rate DECIMAL(10, 2) NOT NULL,
    restrictions JSONB, -- เช่น {"mlos": 2, "max_stay": 7}
    availability INTEGER DEFAULT 0, -- จำนวนห้องว่าง
    last_updated_by VARCHAR(255), -- 'User:email' หรือ 'RuleEngine:ruleName'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, room_type_id)
);

-- Dynamic Pricing Rules (กฎการปรับราคา)
CREATE TABLE DynamicPricingRules (
    rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    priority INTEGER NOT NULL, -- ลำดับความสำคัญ (น้อย = สำคัญกว่า)
    is_active BOOLEAN DEFAULT true,
    conditions JSONB NOT NULL, -- เงื่อนไข เช่น {"occupancy_rate": {"gte": 80}}
    action JSONB NOT NULL, -- การกระทำ เช่น {"type": "increase_rate_by_percent", "value": 20}
    date_range_start DATE,
    date_range_end DATE,
    room_types UUID[], -- Array ของ room_type_id ที่ใช้กฎนี้
    created_by UUID REFERENCES Users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rate Audit Log (ประวัติการเปลี่ยนแปลงราคา)
CREATE TABLE RateAuditLog (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_rate_id UUID NOT NULL REFERENCES DailyRoomRates(daily_rate_id),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    changed_by VARCHAR(255) NOT NULL,
    change_reason VARCHAR(500),
    old_values JSONB,
    new_values JSONB
);

-- ===============================================
-- 4. FINANCIAL SYSTEM
-- ===============================================

-- Payment Methods (วิธีการชำระเงิน)
CREATE TABLE PaymentMethods (
    method_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- เช่น "Credit Card", "Cash", "Bank Transfer"
    code VARCHAR(20) UNIQUE, -- เช่น "CC", "CASH", "TRANSFER"
    is_active BOOLEAN DEFAULT true,
    processing_fee_percent DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Folios (แฟ้มบัญชี)
CREATE TABLE Folios (
    folio_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES Bookings(booking_id),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    current_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions (รายการเคลื่อนไหวทางการเงิน)
CREATE TABLE Transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folio_id UUID NOT NULL REFERENCES Folios(folio_id),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('CHARGE', 'PAYMENT', 'REFUND', 'DEPOSIT_COLLECT', 'DEPOSIT_REFUND')),
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL, -- บวก = charge, ลบ = payment
    payment_method_id UUID REFERENCES PaymentMethods(method_id),
    reference_number VARCHAR(100), -- เลขที่อ้างอิง เช่น ใบเสร็จ
    posted_by UUID REFERENCES Users(user_id),
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoices (ใบแจ้งหนี้)
CREATE TABLE Invoices (
    invoice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    folio_id UUID NOT NULL REFERENCES Folios(folio_id),
    issue_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'VOID')),
    pdf_url TEXT,
    total_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 5. HRMS SYSTEM
-- ===============================================

-- Departments (แผนก)
CREATE TABLE Departments (
    department_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id UUID, -- Self-reference to staff
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roles (บทบาท)
CREATE TABLE Roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions (สิทธิ์ของบทบาท)
CREATE TABLE RolePermissions (
    permission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES Roles(role_id) ON DELETE CASCADE,
    resource_name VARCHAR(100) NOT NULL, -- เช่น "bookings", "users", "reports"
    can_read BOOLEAN DEFAULT false,
    can_write BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, resource_name)
);

-- Staffs (พนักงาน)
CREATE TABLE Staffs (
    staff_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES Users(user_id), -- เชื่อมกับ Users table
    employee_id VARCHAR(20) UNIQUE NOT NULL, -- รหัสพนักงาน
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    department_id UUID REFERENCES Departments(department_id),
    role_id UUID REFERENCES Roles(role_id),
    position VARCHAR(100),
    hire_date DATE NOT NULL,
    salary DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Terminated')),
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for department manager
ALTER TABLE Departments ADD CONSTRAINT fk_departments_manager 
    FOREIGN KEY (manager_id) REFERENCES Staffs(staff_id);

-- Leave Requests (การขอลา)
CREATE TABLE LeaveRequests (
    leave_request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES Staffs(staff_id),
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('Sick', 'Annual', 'Personal', 'Maternity', 'Emergency')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    approved_by UUID REFERENCES Staffs(staff_id),
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attendance (การเข้างาน)
CREATE TABLE Attendance (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES Staffs(staff_id),
    date DATE NOT NULL,
    clock_in_time TIMESTAMP WITH TIME ZONE,
    clock_out_time TIMESTAMP WITH TIME ZONE,
    break_duration_minutes INTEGER DEFAULT 0,
    total_hours DECIMAL(4, 2),
    status VARCHAR(20) DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Late', 'Half-Day')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, date)
);

-- Shift Management (การจัดกะ)
CREATE TABLE Shifts (
    shift_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- เช่น "Morning", "Evening", "Night"
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff Shift Assignments (การมอบหมายกะ)
CREATE TABLE StaffShiftAssignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES Staffs(staff_id),
    shift_id UUID NOT NULL REFERENCES Shifts(shift_id),
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Missed', 'Cancelled')),
    assigned_by UUID REFERENCES Staffs(staff_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, date, shift_id)
);

-- ===============================================
-- 6. SERVICES & FACILITIES
-- ===============================================

-- Service Categories (หมวดหมู่บริการ)
CREATE TABLE ServiceCategories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services (บริการเสริม)
CREATE TABLE Services (
    service_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES ServiceCategories(category_id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    pricing_unit VARCHAR(50) DEFAULT 'Per Person', -- เช่น "Per Night", "Per Person", "One-time"
    duration_minutes INTEGER, -- ระยะเวลาบริการ (นาที)
    capacity INTEGER, -- จำนวนคนที่รองรับได้
    image_url TEXT,
    requirements TEXT, -- ข้อกำหนดพิเศษ
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Booking Services (บริการที่จองไว้)
CREATE TABLE BookingServices (
    booking_service_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES Bookings(booking_id),
    service_id UUID NOT NULL REFERENCES Services(service_id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    service_date DATE,
    service_time TIME,
    status VARCHAR(20) DEFAULT 'Booked' CHECK (status IN ('Booked', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 7. HOUSEKEEPING & MAINTENANCE
-- ===============================================

-- Housekeeping Tasks (งานทำความสะอาด)
CREATE TABLE HousekeepingTasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES Rooms(room_id),
    assigned_staff_id UUID REFERENCES Staffs(staff_id),
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('Check-out Clean', 'Daily Tidy-up', 'Deep Clean', 'Maintenance Clean')),
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Inspected', 'Failed')),
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    checklist JSONB, -- รายการตรวจสอบ
    notes TEXT,
    inspector_id UUID REFERENCES Staffs(staff_id),
    inspection_notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Tickets (ใบแจ้งซ่อม)
CREATE TABLE MaintenanceTickets (
    ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES Rooms(room_id),
    reported_by_staff_id UUID NOT NULL REFERENCES Staffs(staff_id),
    assigned_staff_id UUID REFERENCES Staffs(staff_id),
    title VARCHAR(200) NOT NULL,
    issue_description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled')),
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    resolution_notes TEXT,
    images JSONB, -- URLs ของรูปภาพ
    started_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 8. INVENTORY & ITEMS MANAGEMENT
-- ===============================================

-- Item Categories (หมวดหมู่สินค้า)
CREATE TABLE ItemCategories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES ItemCategories(category_id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Item Units (หน่วยนับ)
CREATE TABLE ItemUnits (
    unit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL, -- เช่น "Piece", "Box", "Kg", "Liter"
    abbreviation VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers (ผู้จำหน่าย)
CREATE TABLE Suppliers (
    supplier_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100), -- เช่น "Net 30", "COD"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Items (รายการสินค้า/วัสดุ)
CREATE TABLE Items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES ItemCategories(category_id),
    unit_id UUID REFERENCES ItemUnits(unit_id),
    unit_cost DECIMAL(10, 2),
    reorder_level INTEGER DEFAULT 0, -- จำนวนขั้นต่ำที่ต้องสั่งซื้อใหม่
    max_stock_level INTEGER,
    image_url TEXT,
    barcode VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock (สต็อกสินค้า)
CREATE TABLE Stock (
    stock_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES Items(item_id),
    location VARCHAR(100), -- เช่น "Storage Room", "Housekeeping"
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0, -- จำนวนที่จองไว้
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock Movements (การเคลื่อนไหวสต็อก)
CREATE TABLE StockMovements (
    movement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES Items(item_id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2),
    total_cost DECIMAL(12, 2),
    reference_type VARCHAR(50), -- เช่น "PURCHASE", "CONSUMPTION", "DAMAGE"
    reference_id UUID, -- ID ของเอกสารอ้างอิง
    location VARCHAR(100),
    notes TEXT,
    performed_by UUID REFERENCES Staffs(staff_id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 9. VEHICLE & CAB MANAGEMENT
-- ===============================================

-- Vehicles (ยานพาหนะ)
CREATE TABLE Vehicles (
    vehicle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL, -- เช่น "Sedan", "SUV", "Van", "Bus"
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    color VARCHAR(50),
    capacity INTEGER NOT NULL, -- จำนวนผู้โดยสาร
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'In-Use', 'Maintenance', 'Out-of-Service')),
    driver_id UUID REFERENCES Staffs(staff_id),
    insurance_expiry DATE,
    registration_expiry DATE,
    fuel_type VARCHAR(20), -- เช่น "Gasoline", "Diesel", "Electric"
    rate_per_km DECIMAL(8, 2),
    rate_per_hour DECIMAL(8, 2),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cab Bookings (การจองรถ)
CREATE TABLE CabBookings (
    cab_booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES Bookings(booking_id), -- อาจไม่มี ถ้าจองแยก
    guest_id UUID REFERENCES Guests(guest_id),
    vehicle_id UUID NOT NULL REFERENCES Vehicles(vehicle_id),
    driver_id UUID REFERENCES Staffs(staff_id),
    pickup_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    estimated_duration_minutes INTEGER,
    estimated_distance_km DECIMAL(8, 2),
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'Booked' CHECK (status IN ('Booked', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 10. MARKETING & PROMOTIONS
-- ===============================================

-- Promocodes (รหัสส่วนลด)
CREATE TABLE Promocodes (
    promocode_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_amount DECIMAL(10, 2), -- ยอดขั้นต่ำที่ต้องใช้
    maximum_discount DECIMAL(10, 2), -- ส่วนลดสูงสุด (สำหรับ PERCENTAGE)
    usage_limit INTEGER, -- จำนวนครั้งที่ใช้ได้ทั้งหมด
    usage_count INTEGER DEFAULT 0, -- จำนวนครั้งที่ใช้ไปแล้ว
    per_user_limit INTEGER DEFAULT 1, -- จำนวนครั้งที่ user คนเดียวใช้ได้
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    applicable_room_types UUID[], -- Array ของ room_type_id
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES Users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Promocode Usage (การใช้รหัสส่วนลด)
CREATE TABLE PromocodeUsage (
    usage_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promocode_id UUID NOT NULL REFERENCES Promocodes(promocode_id),
    booking_id UUID NOT NULL REFERENCES Bookings(booking_id),
    user_id UUID REFERENCES Users(user_id),
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 11. SYSTEM CONFIGURATION
-- ===============================================

-- System Settings (การตั้งค่าระบบ)
CREATE TABLE SystemSettings (
    setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    data_type VARCHAR(20) DEFAULT 'STRING' CHECK (data_type IN ('STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'JSON')),
    description TEXT,
    category VARCHAR(50), -- เช่น "GENERAL", "PAYMENT", "EMAIL", "PRICING"
    is_public BOOLEAN DEFAULT false, -- สามารถเข้าถึงจาก frontend ได้หรือไม่
    updated_by UUID REFERENCES Users(user_id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cancellation Policies (นโยบายการยกเลิก)
CREATE TABLE CancellationPolicies (
    policy_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cancellation Policy Rules (กฎของนโยบายการยกเลิก)
CREATE TABLE CancellationPolicyRules (
    rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES CancellationPolicies(policy_id) ON DELETE CASCADE,
    days_before_checkin INTEGER NOT NULL,
    refund_percentage DECIMAL(5, 2) NOT NULL CHECK (refund_percentage >= 0 AND refund_percentage <= 100),
    penalty_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add the foreign key constraint for Bookings
ALTER TABLE Bookings ADD CONSTRAINT fk_bookings_cancellation_policy 
    FOREIGN KEY (cancellation_policy_id) REFERENCES CancellationPolicies(policy_id);

-- Events (ปฏิทินและเหตุการณ์)
CREATE TABLE Events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50), -- เช่น "Holiday", "Conference", "Concert", "Maintenance"
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(200),
    is_public BOOLEAN DEFAULT false, -- แสดงให้ลูกค้าเห็นหรือไม่
    affects_pricing BOOLEAN DEFAULT false, -- ส่งผลต่อการปรับราคาหรือไม่
    created_by UUID REFERENCES Users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 12. NOTIFICATION SYSTEM
-- ===============================================

-- Notification Templates (เทมเพลตการแจ้งเตือน)
CREATE TABLE NotificationTemplates (
    template_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) NOT NULL, -- เช่น "booking_confirmed", "payment_received"
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP')),
    subject_template TEXT,
    body_template TEXT NOT NULL,
    variables JSONB, -- ตัวแปรที่ใช้ใน template
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications (การแจ้งเตือน)
CREATE TABLE Notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES Users(user_id),
    type VARCHAR(50) NOT NULL, -- เช่น "BOOKING", "PAYMENT", "SYSTEM"
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ')),
    reference_type VARCHAR(50), -- เช่น "BOOKING", "INVOICE"
    reference_id UUID,
    metadata JSONB,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 13. AUDIT & LOGGING
-- ===============================================

-- Audit Logs (บันทึกการตรวจสอบ)
CREATE TABLE AuditLogs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES Users(user_id),
    action VARCHAR(100) NOT NULL, -- เช่น "CREATE", "UPDATE", "DELETE", "LOGIN"
    resource_type VARCHAR(100) NOT NULL, -- เช่น "BOOKING", "USER", "ROOM"
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- Users table indexes
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_user_type ON Users(user_type);
CREATE INDEX idx_users_created_at ON Users(created_at);

-- Bookings table indexes
CREATE INDEX idx_bookings_guest_id ON Bookings(guest_id);
CREATE INDEX idx_bookings_room_id ON Bookings(room_id);
CREATE INDEX idx_bookings_checkin_date ON Bookings(checkin_date);
CREATE INDEX idx_bookings_checkout_date ON Bookings(checkout_date);
CREATE INDEX idx_bookings_status ON Bookings(status);
CREATE INDEX idx_bookings_reference_id ON Bookings(booking_reference_id);
CREATE INDEX idx_bookings_dates ON Bookings(checkin_date, checkout_date);

-- DailyRoomRates indexes
CREATE INDEX idx_daily_rates_date ON DailyRoomRates(date);
CREATE INDEX idx_daily_rates_room_type ON DailyRoomRates(room_type_id);
CREATE INDEX idx_daily_rates_date_room_type ON DailyRoomRates(date, room_type_id);

-- Transactions indexes
CREATE INDEX idx_transactions_folio_id ON Transactions(folio_id);
CREATE INDEX idx_transactions_type ON Transactions(transaction_type);
CREATE INDEX idx_transactions_posted_at ON Transactions(posted_at);

-- Staffs indexes
CREATE INDEX idx_staffs_department_id ON Staffs(department_id);
CREATE INDEX idx_staffs_role_id ON Staffs(role_id);
CREATE INDEX idx_staffs_status ON Staffs(status);
CREATE INDEX idx_staffs_employee_id ON Staffs(employee_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON Notifications(user_id);
CREATE INDEX idx_notifications_status ON Notifications(status);
CREATE INDEX idx_notifications_created_at ON Notifications(created_at);

-- Audit Logs indexes
CREATE INDEX idx_audit_logs_user_id ON AuditLogs(user_id);
CREATE INDEX idx_audit_logs_resource ON AuditLogs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON AuditLogs(created_at);

-- ===============================================
-- TRIGGERS FOR UPDATED_AT
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON Users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_types_updated_at BEFORE UPDATE ON RoomTypes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON Rooms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON Guests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON Bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folios_updated_at BEFORE UPDATE ON Folios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staffs_updated_at BEFORE UPDATE ON Staffs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON Services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON Vehicles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promocodes_updated_at BEFORE UPDATE ON Promocodes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- DEFAULT DATA INSERTS
-- ===============================================

-- Insert default payment methods
INSERT INTO PaymentMethods (name, code, is_active) VALUES
('Cash', 'CASH', true),
('Credit Card', 'CC', true),
('Bank Transfer', 'TRANSFER', true),
('QR PromptPay', 'QR', true),
('Debit Card', 'DC', true);

-- Insert default system settings
INSERT INTO SystemSettings (setting_key, setting_value, data_type, description, category) VALUES
('hotel_name', 'Hotel Resort & Spa', 'STRING', 'Hotel name', 'GENERAL'),
('default_currency', 'THB', 'STRING', 'Default currency code', 'GENERAL'),
('tax_rate', '7.00', 'DECIMAL', 'Default tax rate percentage', 'FINANCIAL'),
('service_charge_rate', '10.00', 'DECIMAL', 'Service charge percentage', 'FINANCIAL'),
('default_check_in_time', '15:00', 'STRING', 'Default check-in time', 'OPERATIONS'),
('default_check_out_time', '12:00', 'STRING', 'Default check-out time', 'OPERATIONS'),
('booking_confirmation_email', 'true', 'BOOLEAN', 'Send booking confirmation email', 'EMAIL'),
('enable_dynamic_pricing', 'true', 'BOOLEAN', 'Enable dynamic pricing system', 'PRICING');

-- Insert default roles
INSERT INTO Roles (name, description) VALUES
('Super Admin', 'Full system access'),
('Hotel Manager', 'Hotel operations management'),
('Front Desk', 'Reception and guest services'),
('Housekeeping Manager', 'Housekeeping operations'),
('Housekeeper', 'Room cleaning and maintenance'),
('Maintenance', 'Facility maintenance'),
('Accountant', 'Financial operations'),
('Guest', 'Hotel guest access');

-- Insert default departments
INSERT INTO Departments (name, description) VALUES
('Management', 'Hotel management and administration'),
('Front Office', 'Reception and guest services'),
('Housekeeping', 'Room cleaning and maintenance'),
('Maintenance', 'Facility maintenance and repairs'),
('Food & Beverage', 'Restaurant and catering services'),
('Accounting', 'Financial management'),
('Security', 'Hotel security and safety'),
('Transportation', 'Vehicle and cab services');

-- Insert default service categories
INSERT INTO ServiceCategories (name, description, sort_order) VALUES
('Spa & Wellness', 'Spa treatments and wellness services', 1),
('Food & Beverage', 'Restaurant and room service', 2),
('Transportation', 'Airport transfers and local transport', 3),
('Entertainment', 'Recreation and entertainment facilities', 4),
('Business Services', 'Meeting rooms and business facilities', 5),
('Laundry', 'Laundry and dry cleaning services', 6);

-- Insert default cancellation policy
INSERT INTO CancellationPolicies (name, description, is_default) VALUES
('Standard Cancellation Policy', 'Default cancellation policy for all bookings', true);

-- Insert default cancellation rules
INSERT INTO CancellationPolicyRules (policy_id, days_before_checkin, refund_percentage, penalty_amount) 
SELECT policy_id, 7, 100.00, 0.00 FROM CancellationPolicies WHERE is_default = true
UNION ALL
SELECT policy_id, 3, 50.00, 0.00 FROM CancellationPolicies WHERE is_default = true
UNION ALL
SELECT policy_id, 1, 0.00, 0.00 FROM CancellationPolicies WHERE is_default = true;

-- Insert default floor plans
INSERT INTO FloorPlans (floor_number, floor_name, total_rooms) VALUES
(1, 'Ground Floor', 10),
(2, 'Second Floor', 10),
(3, 'Third Floor', 8);

-- Insert default bed types
INSERT INTO BedTypes (name, description, capacity) VALUES
('King Size', 'King size bed for 2 persons', 2),
('Queen Size', 'Queen size bed for 2 persons', 2),
('Twin Beds', 'Two single beds', 2),
('Single Bed', 'Single bed for 1 person', 1);

-- Insert default item units
INSERT INTO ItemUnits (name, abbreviation) VALUES
('Piece', 'pcs'),
('Box', 'box'),
('Kilogram', 'kg'),
('Liter', 'L'),
('Meter', 'm'),
('Pack', 'pack'),
('Roll', 'roll'),
('Bottle', 'btl');

-- Insert default item categories
INSERT INTO ItemCategories (name, description) VALUES
('Amenities', 'Guest room amenities'),
('Cleaning Supplies', 'Housekeeping cleaning materials'),
('Linens', 'Bed sheets, towels, and textiles'),
('Toiletries', 'Guest toiletries and bathroom supplies'),
('Furniture', 'Room and common area furniture'),
('Electronics', 'Electronic equipment and devices'),
('Food & Beverage', 'Minibar and restaurant supplies'),
('Maintenance', 'Maintenance tools and materials');

-- ===============================================
-- FINAL NOTES
-- ===============================================

/*
This schema provides:

1. ✅ Complete Admin Template Coverage - รองรับทุกฟีเจอร์ใน Admin
2. ✅ Dynamic Pricing System - ระบบปรับราคาอัตโนมัติ
3. ✅ HRMS System - ระบบจัดการพนักงานครบถ้วน  
4. ✅ Financial Management - ระบบการเงินและบัญชี
5. ✅ Housekeeping & Maintenance - ระบบแม่บ้านและซ่อมบำรุง
6. ✅ Inventory Management - ระบบจัดการสต็อกและวัสดุ
7. ✅ Vehicle Management - ระบบจัดการรถและการขนส่ง
8. ✅ Marketing & Promotions - ระบบโปรโมชั่นและส่วนลด
9. ✅ Notification System - ระบบแจ้งเตือน
10. ✅ Audit & Security - ระบบตรวจสอบและความปลอดภัย

Ready for Backend API development! 🚀
*/
