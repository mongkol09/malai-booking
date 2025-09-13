-- ============================================
-- BOOKING HISTORY SYSTEM - DATABASE SCHEMA (FIXED)
-- ============================================
-- Fixed version without foreign key issues

-- 1. User Sessions (ปรับให้เข้ากับ existing User table)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL, -- เชื่อมกับ existing User.id
  session_id VARCHAR(500) UNIQUE NOT NULL,
  device_fingerprint VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  login_method VARCHAR(50) DEFAULT 'password',
  revoke_reason VARCHAR(100)
);

-- 2. Booking History (main archive table)
CREATE TABLE IF NOT EXISTS booking_history (
  id SERIAL PRIMARY KEY,
  original_booking_id INTEGER, -- ไม่มี FK constraint
  booking_reference VARCHAR(255) NOT NULL,
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  room_type_id INTEGER,
  room_type_name VARCHAR(255),
  room_number VARCHAR(20),
  room_id INTEGER,
  check_in_date DATE,
  check_out_date DATE,
  booking_date TIMESTAMP,
  stay_duration INTEGER,
  total_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2) DEFAULT 0,
  due_amount DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  currency VARCHAR(10) DEFAULT 'THB',
  booking_status VARCHAR(50) NOT NULL,
  archive_reason VARCHAR(100) NOT NULL,
  special_requests TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  refund_amount DECIMAL(10,2) DEFAULT 0,
  penalty_amount DECIMAL(10,2) DEFAULT 0,
  source VARCHAR(100) DEFAULT 'website',
  data_hash VARCHAR(255), -- For integrity verification
  is_anonymized BOOLEAN DEFAULT false,
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  archived_by VARCHAR(255), -- User ID who archived
  created_by VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 3. Booking Archive Logs (audit trail)
CREATE TABLE IF NOT EXISTS booking_archive_logs (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER, -- ไม่มี FK constraint
  booking_reference VARCHAR(255),
  archive_action VARCHAR(100) NOT NULL, -- 'MANUAL_ARCHIVE', 'AUTO_ARCHIVE', 'BULK_ARCHIVE'
  archive_reason VARCHAR(255),
  batch_id UUID,
  batch_size INTEGER,
  archived_by VARCHAR(255), -- User ID
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processing_time_ms INTEGER,
  status VARCHAR(50) DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'PARTIAL'
  error_message TEXT,
  metadata JSONB -- Additional data like filters, counts, etc.
);

-- 4. Booking Status Rules (configurable archive rules)
CREATE TABLE IF NOT EXISTS booking_status_rules (
  id SERIAL PRIMARY KEY,
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(100) NOT NULL, -- 'STATUS_AGE', 'DATE_BASED', 'CUSTOM'
  condition_expression JSONB NOT NULL, -- Flexible conditions
  days_after_checkout INTEGER DEFAULT 30,
  status VARCHAR(50) NOT NULL, -- Booking status to match
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255)
);

-- 5. Booking History Permissions (role-based access)
CREATE TABLE IF NOT EXISTS booking_history_permissions (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL,
  permission_name VARCHAR(255) NOT NULL,
  permission_value JSONB DEFAULT '{}', -- Additional permission config
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_name, permission_name)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User Sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_activity ON user_sessions(last_activity);

-- Booking History indexes
CREATE INDEX IF NOT EXISTS idx_booking_history_reference ON booking_history(booking_reference);
CREATE INDEX IF NOT EXISTS idx_booking_history_guest_email ON booking_history(guest_email);
CREATE INDEX IF NOT EXISTS idx_booking_history_guest_name ON booking_history(guest_name);
CREATE INDEX IF NOT EXISTS idx_booking_history_dates ON booking_history(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_booking_history_archived_at ON booking_history(archived_at);
CREATE INDEX IF NOT EXISTS idx_booking_history_status ON booking_history(booking_status);
CREATE INDEX IF NOT EXISTS idx_booking_history_reason ON booking_history(archive_reason);
CREATE INDEX IF NOT EXISTS idx_booking_history_room ON booking_history(room_number, room_type_name);
CREATE INDEX IF NOT EXISTS idx_booking_history_amount ON booking_history(total_amount);
CREATE INDEX IF NOT EXISTS idx_booking_history_original_id ON booking_history(original_booking_id);

-- Archive Logs indexes
CREATE INDEX IF NOT EXISTS idx_archive_logs_booking_id ON booking_archive_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_archive_logs_reference ON booking_archive_logs(booking_reference);
CREATE INDEX IF NOT EXISTS idx_archive_logs_action ON booking_archive_logs(archive_action, archived_at);
CREATE INDEX IF NOT EXISTS idx_archive_logs_batch ON booking_archive_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_archive_logs_user ON booking_archive_logs(archived_by);
CREATE INDEX IF NOT EXISTS idx_archive_logs_status ON booking_archive_logs(status, archived_at);

-- ============================================
-- SAMPLE DATA AND CONFIGURATION
-- ============================================

-- Insert default status rules
INSERT INTO booking_status_rules (rule_name, rule_type, condition_expression, days_after_checkout, status, created_by) VALUES
('Auto Archive Cancelled Old', 'STATUS_AGE', '{"min_days": 30, "description": "Archive cancelled bookings after 30 days"}', 30, 'CANCELLED', 'system'),
('Auto Archive Completed Old', 'STATUS_AGE', '{"min_days": 90, "description": "Archive completed bookings after 90 days"}', 90, 'COMPLETED', 'system'),
('Auto Archive No Show', 'STATUS_AGE', '{"min_days": 60, "description": "Archive no-show bookings after 60 days"}', 60, 'NO_SHOW', 'system'),
('Manual Review High Value', 'CUSTOM', '{"min_amount": 10000, "description": "High value bookings require manual review"}', 180, 'COMPLETED', 'system')
ON CONFLICT DO NOTHING;

-- Insert default permissions
INSERT INTO booking_history_permissions (role_name, permission_name, permission_value) VALUES
('ADMIN', 'view_history', '{"all_records": true}'),
('ADMIN', 'manage_archive', '{"bulk_operations": true, "restore": true}'),
('ADMIN', 'view_analytics', '{"all_metrics": true}'),
('ADMIN', 'export_data', '{"unlimited": true}'),
('DEV', 'view_history', '{"all_records": true}'),
('DEV', 'manage_archive', '{"bulk_operations": true, "restore": true}'),
('DEV', 'view_analytics', '{"all_metrics": true}'),
('DEV', 'export_data', '{"unlimited": true}'),
('DEV', 'debug_operations', '{"system_access": true}'),
('MANAGER', 'view_history', '{"date_range_limit": 365}'),
('MANAGER', 'view_analytics', '{"summary_only": true}'),
('MANAGER', 'export_data', '{"max_records": 1000}'),
('STAFF', 'view_history', '{"date_range_limit": 90}')
ON CONFLICT DO NOTHING;

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to get archive candidates
CREATE OR REPLACE FUNCTION get_archive_candidates(rule_id_filter INT DEFAULT NULL)
RETURNS TABLE (
  booking_id INT,
  booking_reference VARCHAR,
  guest_name VARCHAR,
  room_number VARCHAR,
  check_out_date DATE,
  booking_status VARCHAR,
  suggested_reason VARCHAR,
  days_since_criteria INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id::INT as booking_id,
    b.booking_reference::VARCHAR,
    COALESCE(g.first_name || ' ' || g.last_name, 'Unknown Guest')::VARCHAR as guest_name,
    r.room_number::VARCHAR,
    b.check_out_date::DATE,
    b.booking_status::VARCHAR,
    CASE 
      WHEN b.booking_status = 'CANCELLED' AND b.check_out_date < CURRENT_DATE - INTERVAL '30 days' 
        THEN 'CANCELLED_OLD'
      WHEN b.booking_status = 'COMPLETED' AND b.check_out_date < CURRENT_DATE - INTERVAL '90 days'
        THEN 'COMPLETED_OLD'
      WHEN b.booking_status = 'NO_SHOW' AND b.check_out_date < CURRENT_DATE - INTERVAL '60 days'
        THEN 'NO_SHOW_OLD'
      ELSE 'OTHER'
    END::VARCHAR as suggested_reason,
    EXTRACT(DAY FROM CURRENT_DATE - b.check_out_date)::INT as days_since_criteria
  FROM bookings b
  LEFT JOIN guests g ON b.guest_id = g.id
  LEFT JOIN rooms r ON b.room_id = r.id
  WHERE 
    (b.booking_status IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') 
     AND b.check_out_date < CURRENT_DATE - INTERVAL '30 days')
    OR (rule_id_filter IS NOT NULL 
        AND EXISTS (
          SELECT 1 FROM booking_status_rules bsr 
          WHERE bsr.id = rule_id_filter 
          AND b.booking_status = bsr.status
          AND b.check_out_date < CURRENT_DATE - (bsr.days_after_checkout || ' days')::INTERVAL
        ))
  ORDER BY b.check_out_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions 
  WHERE (expires_at < CURRENT_TIMESTAMP OR last_activity < CURRENT_TIMESTAMP - INTERVAL '30 days')
    AND is_active = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Mark very old active sessions as inactive
  UPDATE user_sessions 
  SET is_active = false, revoke_reason = 'INACTIVE_TIMEOUT'
  WHERE last_activity < CURRENT_TIMESTAMP - INTERVAL '30 days' 
    AND is_active = true;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get booking history statistics
CREATE OR REPLACE FUNCTION get_booking_history_stats(
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_archived BIGINT,
  cancelled_count BIGINT,
  completed_count BIGINT,
  no_show_count BIGINT,
  total_value DECIMAL,
  avg_days_to_archive DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_archived,
    COUNT(CASE WHEN archive_reason LIKE '%CANCELLED%' THEN 1 END)::BIGINT as cancelled_count,
    COUNT(CASE WHEN archive_reason LIKE '%COMPLETED%' THEN 1 END)::BIGINT as completed_count,
    COUNT(CASE WHEN archive_reason LIKE '%NO_SHOW%' THEN 1 END)::BIGINT as no_show_count,
    COALESCE(SUM(total_amount), 0)::DECIMAL as total_value,
    COALESCE(AVG(EXTRACT(DAY FROM archived_at - check_out_date)), 0)::DECIMAL as avg_days_to_archive
  FROM booking_history bh
  WHERE 
    (start_date IS NULL OR archived_at >= start_date)
    AND (end_date IS NULL OR archived_at <= end_date);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE booking_history IS 'Archive table for historical booking records';
COMMENT ON TABLE booking_archive_logs IS 'Audit log for all archive operations';
COMMENT ON TABLE user_sessions IS 'User session tracking for booking history system';
COMMENT ON TABLE booking_status_rules IS 'Configurable rules for automatic archiving';
COMMENT ON TABLE booking_history_permissions IS 'Role-based permissions for booking history access';