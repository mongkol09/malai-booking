-- ================================================
-- BOOKING HISTORY SYSTEM - DATABASE SCHEMA
-- ================================================
-- 
-- Created: September 12, 2025
-- Purpose: Archive and manage booking history efficiently
-- Authentication: JWT-Only approach (no Redis dependency)
--

-- ==============================================
-- 1. USER SESSIONS TABLE (JWT Session Tracking)
-- ==============================================
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  device_fingerprint VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
  
  -- Additional security fields
  login_method VARCHAR(50) DEFAULT 'password', -- 'password', 'refresh_token'
  revoke_reason VARCHAR(255),
  
  -- Performance indexes
  CONSTRAINT idx_user_sessions_user_id_active 
    UNIQUE(user_id, session_id) DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at) WHERE is_active = true;
CREATE INDEX idx_user_sessions_cleanup ON user_sessions(expires_at, last_activity) WHERE is_active = false;

-- ==============================================
-- 2. BOOKING STATUS RULES TABLE
-- ==============================================
CREATE TABLE booking_status_rules (
  id SERIAL PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'AUTO_ARCHIVE', 'STATUS_UPDATE'
  condition_type VARCHAR(50) NOT NULL, -- 'DAYS_AFTER_CHECKOUT', 'DAYS_AFTER_CHECKIN', 'DAYS_AFTER_CANCELLED'
  condition_value INTEGER NOT NULL, -- Number of days
  target_status VARCHAR(50), -- 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'ARCHIVED'
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1, -- Higher number = higher priority
  
  -- Audit fields
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_condition_value_positive CHECK (condition_value >= 0),
  CONSTRAINT chk_priority_positive CHECK (priority > 0)
);

-- ==============================================
-- 3. BOOKING HISTORY TABLE (Main Archive)
-- ==============================================
CREATE TABLE booking_history (
  id SERIAL PRIMARY KEY,
  original_booking_id INTEGER, -- Reference to original booking (may be deleted)
  booking_reference VARCHAR(100) NOT NULL, -- Original booking reference
  
  -- Guest Information
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  guest_id_number VARCHAR(50), -- For GDPR compliance tracking
  
  -- Room Information
  room_type_id INTEGER,
  room_type_name VARCHAR(100),
  room_number VARCHAR(20),
  room_id VARCHAR(255),
  
  -- Booking Dates & Duration
  check_in_date DATE,
  check_out_date DATE,
  booking_date TIMESTAMP,
  stay_duration INTEGER, -- Calculated nights
  
  -- Financial Information
  total_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  due_amount DECIMAL(10,2),
  payment_status VARCHAR(50),
  currency VARCHAR(3) DEFAULT 'THB',
  
  -- Status Information
  booking_status VARCHAR(50) NOT NULL,
  archive_reason VARCHAR(100) NOT NULL, -- 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'MANUAL'
  
  -- Additional Information
  special_requests TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  refund_amount DECIMAL(10,2),
  penalty_amount DECIMAL(10,2),
  
  -- Source tracking
  source VARCHAR(50), -- 'website', 'admin_panel', 'phone', 'walk_in'
  booking_source_details JSONB,
  
  -- Data integrity
  data_hash VARCHAR(64), -- For data integrity verification
  is_anonymized BOOLEAN DEFAULT false, -- GDPR compliance
  
  -- Audit Information
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  archived_at TIMESTAMP DEFAULT NOW(),
  archived_by INTEGER REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT chk_amounts_positive CHECK (total_amount >= 0 AND paid_amount >= 0),
  CONSTRAINT chk_dates_logical CHECK (check_out_date >= check_in_date),
  CONSTRAINT chk_stay_duration CHECK (stay_duration > 0)
);

-- Performance indexes for booking_history
CREATE INDEX idx_booking_history_guest_name ON booking_history(guest_name) WHERE guest_name IS NOT NULL;
CREATE INDEX idx_booking_history_guest_email ON booking_history(guest_email) WHERE guest_email IS NOT NULL;
CREATE INDEX idx_booking_history_check_in_date ON booking_history(check_in_date);
CREATE INDEX idx_booking_history_check_out_date ON booking_history(check_out_date);
CREATE INDEX idx_booking_history_booking_status ON booking_history(booking_status);
CREATE INDEX idx_booking_history_archive_reason ON booking_history(archive_reason);
CREATE INDEX idx_booking_history_archived_at ON booking_history(archived_at);
CREATE INDEX idx_booking_history_booking_reference ON booking_history(booking_reference);

-- Composite indexes for common queries
CREATE INDEX idx_booking_history_date_status ON booking_history(archived_at DESC, booking_status, archive_reason);
CREATE INDEX idx_booking_history_guest_search ON booking_history(guest_name, guest_email, booking_reference);

-- ==============================================
-- 4. BOOKING ARCHIVE LOGS TABLE
-- ==============================================
CREATE TABLE booking_archive_logs (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER,
  booking_reference VARCHAR(100),
  archive_action VARCHAR(50) NOT NULL, -- 'AUTO_ARCHIVE', 'MANUAL_ARCHIVE', 'BULK_ARCHIVE', 'RESTORE'
  archive_reason VARCHAR(100),
  
  -- Batch processing
  batch_id VARCHAR(100), -- For bulk operations
  batch_size INTEGER,
  processing_time_ms INTEGER,
  
  -- User & audit
  archived_by INTEGER REFERENCES users(id),
  archived_at TIMESTAMP DEFAULT NOW(),
  
  -- Additional context
  metadata JSONB, -- Flexible field for additional context
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'PARTIAL'
  error_message TEXT,
  
  -- Performance tracking
  CONSTRAINT chk_processing_time CHECK (processing_time_ms >= 0)
);

-- Indexes for archive logs
CREATE INDEX idx_archive_logs_booking_reference ON booking_archive_logs(booking_reference);
CREATE INDEX idx_archive_logs_action_date ON booking_archive_logs(archive_action, archived_at DESC);
CREATE INDEX idx_archive_logs_batch_id ON booking_archive_logs(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_archive_logs_status ON booking_archive_logs(status, archived_at DESC);

-- ==============================================
-- 5. BOOKING HISTORY PERMISSIONS
-- ==============================================
CREATE TABLE booking_history_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_type VARCHAR(50) NOT NULL, -- 'READ', 'EXPORT', 'ARCHIVE', 'RESTORE', 'BULK_OPERATIONS'
  granted_by INTEGER REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- NULL = never expires
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  CONSTRAINT unique_user_permission UNIQUE(user_id, permission_type),
  CONSTRAINT chk_expiry_future CHECK (expires_at IS NULL OR expires_at > granted_at)
);

-- ==============================================
-- 6. DEFAULT DATA SETUP
-- ==============================================

-- Default archive rules
INSERT INTO booking_status_rules (rule_name, rule_type, condition_type, condition_value, target_status, priority) VALUES
('Auto Complete After Checkout', 'STATUS_UPDATE', 'DAYS_AFTER_CHECKOUT', 0, 'COMPLETED', 1),
('Archive Completed Bookings', 'AUTO_ARCHIVE', 'DAYS_AFTER_CHECKOUT', 7, 'ARCHIVED', 2),
('Archive Cancelled Bookings', 'AUTO_ARCHIVE', 'DAYS_AFTER_CANCELLED', 3, 'ARCHIVED', 3),
('Archive No-show Bookings', 'AUTO_ARCHIVE', 'DAYS_AFTER_CHECKIN', 1, 'ARCHIVED', 4);

-- ==============================================
-- 7. PERFORMANCE OPTIMIZATION
-- ==============================================

-- Partitioning for booking_history (by year) - Future enhancement
-- CREATE TABLE booking_history_2025 PARTITION OF booking_history
-- FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- ==============================================
-- 8. MAINTENANCE FUNCTIONS
-- ==============================================

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions 
  WHERE (expires_at < NOW() OR last_activity < NOW() - INTERVAL '30 days')
    AND is_active = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Also cleanup very old active sessions (> 30 days inactive)
  UPDATE user_sessions 
  SET is_active = false, 
      revoke_reason = 'INACTIVE_TIMEOUT'
  WHERE last_activity < NOW() - INTERVAL '30 days' 
    AND is_active = true;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate booking archive candidates
CREATE OR REPLACE FUNCTION get_archive_candidates(rule_id INTEGER DEFAULT NULL)
RETURNS TABLE (
  booking_id INTEGER,
  booking_reference VARCHAR,
  guest_name VARCHAR,
  room_number VARCHAR,
  check_out_date DATE,
  booking_status VARCHAR,
  suggested_reason VARCHAR,
  days_since_criteria INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.booking_reference,
    COALESCE(g.first_name || ' ' || g.last_name, 'Unknown Guest'),
    r.room_number,
    b.check_out_date,
    b.booking_status,
    bsr.target_status,
    CASE 
      WHEN bsr.condition_type = 'DAYS_AFTER_CHECKOUT' THEN 
        EXTRACT(DAY FROM NOW() - b.check_out_date)::INTEGER
      WHEN bsr.condition_type = 'DAYS_AFTER_CHECKIN' THEN 
        EXTRACT(DAY FROM NOW() - b.check_in_date)::INTEGER
      WHEN bsr.condition_type = 'DAYS_AFTER_CANCELLED' THEN 
        EXTRACT(DAY FROM NOW() - b.updated_at)::INTEGER
      ELSE 0
    END
  FROM bookings b
  LEFT JOIN guests g ON b.guest_id = g.id  
  LEFT JOIN rooms r ON b.room_id = r.id
  CROSS JOIN booking_status_rules bsr
  WHERE bsr.is_active = true
    AND bsr.rule_type = 'AUTO_ARCHIVE'
    AND (rule_id IS NULL OR bsr.id = rule_id)
    AND (
      (bsr.condition_type = 'DAYS_AFTER_CHECKOUT' 
       AND b.check_out_date IS NOT NULL 
       AND b.check_out_date <= NOW() - INTERVAL '1 day' * bsr.condition_value)
      OR
      (bsr.condition_type = 'DAYS_AFTER_CHECKIN' 
       AND b.check_in_date IS NOT NULL 
       AND b.check_in_date <= NOW() - INTERVAL '1 day' * bsr.condition_value
       AND b.booking_status = 'NO_SHOW')
      OR  
      (bsr.condition_type = 'DAYS_AFTER_CANCELLED'
       AND b.booking_status = 'CANCELLED'
       AND b.updated_at <= NOW() - INTERVAL '1 day' * bsr.condition_value)
    )
  ORDER BY bsr.priority DESC, b.check_out_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 9. TRIGGERS FOR AUTOMATION
-- ==============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER tr_booking_status_rules_updated_at
  BEFORE UPDATE ON booking_status_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Session activity trigger
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_user_sessions_activity
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_session_activity();

-- ==============================================
-- 10. VIEWS FOR EASY QUERYING
-- ==============================================

-- Archive statistics view
CREATE VIEW booking_archive_stats AS
SELECT 
  DATE(archived_at) as archive_date,
  archive_reason,
  COUNT(*) as booking_count,
  SUM(total_amount) as total_value,
  AVG(total_amount) as avg_booking_value,
  MIN(total_amount) as min_booking_value,
  MAX(total_amount) as max_booking_value
FROM booking_history
GROUP BY DATE(archived_at), archive_reason
ORDER BY archive_date DESC, archive_reason;

-- Recent activity view
CREATE VIEW recent_archive_activity AS
SELECT 
  bh.booking_reference,
  bh.guest_name,
  bh.room_number,
  bh.total_amount,
  bh.archive_reason,
  bh.archived_at,
  u.first_name || ' ' || u.last_name as archived_by_name
FROM booking_history bh
LEFT JOIN users u ON bh.archived_by = u.id
WHERE bh.archived_at >= NOW() - INTERVAL '7 days'
ORDER BY bh.archived_at DESC;

-- ==============================================
-- COMMENTS & DOCUMENTATION
-- ==============================================

COMMENT ON TABLE user_sessions IS 'JWT session tracking for stateless authentication with database fallback';
COMMENT ON TABLE booking_status_rules IS 'Configurable rules for automatic booking status updates and archiving';
COMMENT ON TABLE booking_history IS 'Archived booking records for historical reporting and compliance';
COMMENT ON TABLE booking_archive_logs IS 'Audit trail for all archive operations and batch processing';
COMMENT ON TABLE booking_history_permissions IS 'Role-based permissions for booking history access control';

COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Maintenance function to clean up expired and inactive user sessions';
COMMENT ON FUNCTION get_archive_candidates(INTEGER) IS 'Identifies bookings eligible for archiving based on configured rules';

-- ==============================================
-- PERFORMANCE NOTES
-- ==============================================
-- 
-- 1. All indexes are optimized for common query patterns
-- 2. Partitioning can be added later for very large datasets
-- 3. JSONB fields allow flexible metadata without schema changes
-- 4. Functions use proper error handling and performance optimization
-- 5. Views provide pre-computed aggregations for dashboards
--