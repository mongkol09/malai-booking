// ============================================
// DATABASE SCHEMA UPDATES FOR ROOM BOOKING FORM
// ============================================

/*
REQUIRED DATABASE ADDITIONS FOR ROOM BOOKING FORM:

1. Guest Details Extensions
2. Contact Details Table
3. Identity Details Table  
4. Booking Details Extensions
5. Payment Details Table
6. Reference Data Tables

Based on analysis of RoomBooking.jsx form requirements.
*/

-- ============================================
-- 1. GUEST DETAILS EXTENSIONS
-- ============================================

-- Add new columns to existing guests table
ALTER TABLE guests ADD COLUMN title VARCHAR(20);
ALTER TABLE guests ADD COLUMN father_name VARCHAR(100);
ALTER TABLE guests ADD COLUMN occupation VARCHAR(100);
ALTER TABLE guests ADD COLUMN anniversary DATE;
ALTER TABLE guests ADD COLUMN nationality VARCHAR(100);
ALTER TABLE guests ADD COLUMN is_vip BOOLEAN DEFAULT FALSE;
ALTER TABLE guests ADD COLUMN customer_image_url VARCHAR(500);

-- ============================================
-- 2. CONTACT DETAILS TABLE (NEW)
-- ============================================

CREATE TABLE guest_contacts (
    contact_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_id UUID NOT NULL REFERENCES guests(guest_id) ON DELETE CASCADE,
    contact_type VARCHAR(50), -- 'Home', 'Personal', 'Official', 'Business'
    email VARCHAR(255),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    zipcode VARCHAR(20),
    address TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. IDENTITY DETAILS TABLE (NEW)  
-- ============================================

CREATE TABLE guest_identities (
    identity_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_id UUID NOT NULL REFERENCES guests(guest_id) ON DELETE CASCADE,
    identity_type VARCHAR(100), -- 'Passport', 'ID Card', 'Driving License', etc.
    identity_number VARCHAR(100),
    front_side_document_url VARCHAR(500),
    back_side_document_url VARCHAR(500),
    comments TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. BOOKING DETAILS EXTENSIONS
-- ============================================

-- Add new columns to existing bookings table
ALTER TABLE bookings ADD COLUMN arrival_from VARCHAR(200);
ALTER TABLE bookings ADD COLUMN purpose_of_visit VARCHAR(200);
ALTER TABLE bookings ADD COLUMN booking_remarks TEXT;

-- ============================================
-- 5. PAYMENT DETAILS TABLE (NEW)
-- ============================================

CREATE TABLE booking_payments (
    payment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    discount_reason VARCHAR(200),
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    commission_percentage DECIMAL(5,2) DEFAULT 0.00,
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_mode VARCHAR(50), -- 'Card Payment', 'Paypal', 'Cash Payment', 'Bank Payment'
    total_amount DECIMAL(10,2) NOT NULL,
    advance_amount DECIMAL(10,2) DEFAULT 0.00,
    advance_remarks TEXT,
    booking_charge DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    service_charge DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. REFERENCE DATA TABLES
-- ============================================

-- Guest Titles Reference
CREATE TABLE guest_titles (
    title_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_name VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO guest_titles (title_name) VALUES 
('Mr'), ('Ms'), ('Mrs'), ('Dr'), ('Engineer');

-- Contact Types Reference  
CREATE TABLE contact_types (
    contact_type_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO contact_types (type_name) VALUES 
('Home'), ('Personal'), ('Official'), ('Business');

-- Identity Types Reference
CREATE TABLE identity_types (
    identity_type_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO identity_types (type_name) VALUES 
('Passport'), ('National ID Card'), ('Driving License'), ('Other Government ID');

-- Payment Modes Reference
CREATE TABLE payment_modes (
    payment_mode_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mode_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO payment_modes (mode_name) VALUES 
('Card Payment'), ('Paypal'), ('Cash Payment'), ('Bank Payment');

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_guest_contacts_guest_id ON guest_contacts(guest_id);
CREATE INDEX idx_guest_identities_guest_id ON guest_identities(guest_id);
CREATE INDEX idx_booking_payments_booking_id ON booking_payments(booking_id);

-- ============================================
-- 8. SAMPLE DATA FOR TESTING
-- ============================================

-- Sample guest with extended details
INSERT INTO guests (
    first_name, last_name, email, phone_number, country,
    title, father_name, occupation, nationality, is_vip
) VALUES (
    'สมชาย', 'ใจดี', 'somchai@gmail.com', '081-234-5678', 'Thailand',
    'Mr', 'สมศักดิ์ ใจดี', 'นักธุรกิจ', 'Thai', FALSE
);

-- Get the guest_id for sample data
-- (This would be done programmatically in real implementation)
