-- ===============================================
-- EMAIL SETTINGS & SYSTEM CONFIGURATION SCHEMA
-- Hotel Booking System - Email Control Panel
-- ===============================================

-- Email Settings Table - ตาราง settings สำหรับควบคุมการส่ง email
CREATE TABLE EmailSettings (
    setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,  -- เช่น 'checkin_reminder_enabled'
    setting_value BOOLEAN NOT NULL DEFAULT true,
    email_type VARCHAR(50),                    -- booking_confirmation, payment_receipt, checkin_reminder
    description TEXT,                          -- คำอธิบายการตั้งค่า
    last_updated_by UUID REFERENCES Users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email Settings Audit Log - ติดตามการเปลี่ยนแปลง settings
CREATE TABLE EmailSettingsAudit (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_id UUID REFERENCES EmailSettings(setting_id),
    setting_key VARCHAR(100) NOT NULL,
    old_value BOOLEAN,
    new_value BOOLEAN NOT NULL,
    changed_by UUID REFERENCES Users(user_id),
    changed_reason VARCHAR(255),              -- เหตุผลการเปลี่ยนแปลง
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Status Table - สถานะระบบโดยรวม
CREATE TABLE SystemStatus (
    status_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component VARCHAR(50) NOT NULL,           -- email_service, booking_system, payment_gateway
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(20) DEFAULT 'ACTIVE',      -- ACTIVE, MAINTENANCE, DISABLED
    last_health_check TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    updated_by UUID REFERENCES Users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- INSERT DEFAULT EMAIL SETTINGS
-- ===============================================

-- Email Service ทั้งหมด
INSERT INTO EmailSettings (setting_key, setting_value, email_type, description) VALUES
-- การเปิด/ปิด email แต่ละประเภท
('booking_confirmation_enabled', true, 'booking_confirmation', 'เปิด/ปิดการส่งอีเมลยืนยันการจอง'),
('payment_receipt_enabled', true, 'payment_receipt', 'เปิด/ปิดการส่งอีเมลใบเสร็จการชำระเงิน'),
('checkin_reminder_enabled', true, 'checkin_reminder', 'เปิด/ปิดการส่งอีเมลแจ้งเตือนเช็คอิน'),

-- ======== GRANULAR CHECK-IN REMINDER CONTROLS ========
-- แยกย่อยการควบคุม Check-in Reminder ตาม timing
('checkin_reminder_24h_enabled', true, 'checkin_reminder', 'เปิด/ปิดการส่งอีเมลแจ้งเตือน 24 ชั่วโมงก่อนเช็คอิน'),
('checkin_reminder_3h_enabled', true, 'checkin_reminder', 'เปิด/ปิดการส่งอีเมลแจ้งเตือน 3 ชั่วโมงก่อนเช็คอิน'),
('checkin_reminder_1h_enabled', true, 'checkin_reminder', 'เปิด/ปิดการส่งอีเมลแจ้งเตือน 1 ชั่วโมงก่อนเช็คอิน'),

-- แยกตาม guest type
('checkin_reminder_vip_enabled', true, 'checkin_reminder', 'เปิด/ปิดการส่งอีเมลแจ้งเตือนสำหรับลูกค้า VIP'),
('checkin_reminder_regular_enabled', true, 'checkin_reminder', 'เปิด/ปิดการส่งอีเมลแจ้งเตือนสำหรับลูกค้าทั่วไป'),

-- แยกตาม booking channel
('checkin_reminder_online_booking_enabled', true, 'checkin_reminder', 'เปิด/ปิดการส่งอีเมลสำหรับการจองออนไลน์'),
('checkin_reminder_walk_in_enabled', true, 'checkin_reminder', 'เปิด/ปิดการส่งอีเมลสำหรับ Walk-in guests'),

-- แยกตาม room type
('checkin_reminder_suite_enabled', true, 'checkin_reminder', 'เปิด/ปิดการส่งอีเมลสำหรับ Suite rooms'),
('checkin_reminder_standard_enabled', true, 'checkin_reminder', 'เปิด/ปิดการส่งอีเมลสำหรับ Standard rooms'),

-- การควบคุมระบบโดยรวม
('email_service_enabled', true, 'system', 'เปิด/ปิดระบบส่งอีเมลทั้งหมด'),
('email_queue_enabled', true, 'system', 'เปิด/ปิดระบบคิวอีเมล'),
('email_retry_enabled', true, 'system', 'เปิด/ปิดการลองส่งซ้ำเมื่อส่งไม่สำเร็จ'),

-- การตั้งค่าเพิ่มเติม
('email_rate_limit_enabled', true, 'system', 'เปิด/ปิดการจำกัดอัตราการส่งอีเมล'),
('email_template_override', false, 'system', 'อนุญาตให้ override template ได้'),
('email_debug_mode', false, 'system', 'โหมดดีบักสำหรับทดสอบ');

-- ===============================================
-- INSERT DEFAULT SYSTEM STATUS
-- ===============================================

INSERT INTO SystemStatus (component, is_enabled, status) VALUES
('email_service', true, 'ACTIVE'),
('booking_system', true, 'ACTIVE'),
('payment_gateway', true, 'ACTIVE'),
('notification_system', true, 'ACTIVE');

-- ===============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ===============================================

CREATE INDEX idx_email_settings_key ON EmailSettings(setting_key);
CREATE INDEX idx_email_settings_type ON EmailSettings(email_type);
CREATE INDEX idx_email_settings_audit_setting ON EmailSettingsAudit(setting_id);
CREATE INDEX idx_email_settings_audit_date ON EmailSettingsAudit(created_at);
CREATE INDEX idx_system_status_component ON SystemStatus(component);

-- ===============================================
-- FUNCTIONS FOR SETTINGS MANAGEMENT
-- ===============================================

-- ฟังก์ชั่นสำหรับดึงค่า setting
CREATE OR REPLACE FUNCTION get_email_setting(setting_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    setting_value BOOLEAN;
BEGIN
    SELECT setting_value INTO setting_value
    FROM EmailSettings
    WHERE setting_key = setting_name AND setting_value IS NOT NULL;
    
    -- หากไม่พบ setting ให้คืนค่า false (ปลอดภัย)
    RETURN COALESCE(setting_value, false);
END;
$$ LANGUAGE plpgsql;

-- ฟังก์ชั่นสำหรับอัพเดต setting พร้อม audit log
CREATE OR REPLACE FUNCTION update_email_setting(
    setting_name VARCHAR,
    new_value BOOLEAN,
    user_id UUID,
    change_reason VARCHAR DEFAULT NULL,
    user_ip INET DEFAULT NULL,
    user_agent_str TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    old_value BOOLEAN;
    setting_uuid UUID;
BEGIN
    -- ดึงค่าเดิมและ ID
    SELECT setting_value, setting_id INTO old_value, setting_uuid
    FROM EmailSettings
    WHERE setting_key = setting_name;
    
    -- หากไม่พบ setting
    IF setting_uuid IS NULL THEN
        RETURN false;
    END IF;
    
    -- อัพเดตค่าใหม่
    UPDATE EmailSettings
    SET setting_value = new_value,
        updated_at = CURRENT_TIMESTAMP,
        last_updated_by = user_id
    WHERE setting_key = setting_name;
    
    -- เพิ่ม audit log
    INSERT INTO EmailSettingsAudit (
        setting_id, setting_key, old_value, new_value,
        changed_by, changed_reason, ip_address, user_agent
    ) VALUES (
        setting_uuid, setting_name, old_value, new_value,
        user_id, change_reason, user_ip, user_agent_str
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- SAMPLE QUERIES FOR TESTING
-- ===============================================

-- ตรวจสอบว่า checkin reminder เปิดอยู่หรือไม่
-- SELECT get_email_setting('checkin_reminder_enabled');

-- อัพเดต setting (ปิด checkin reminder)
-- SELECT update_email_setting('checkin_reminder_enabled', false, 'user-uuid-here', 'System maintenance');

-- ดู audit log
-- SELECT * FROM EmailSettingsAudit ORDER BY created_at DESC LIMIT 10;
