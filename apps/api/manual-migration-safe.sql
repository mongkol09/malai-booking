-- Manual Migration: Add Booking Archive System
-- This is a SAFE migration that only adds new columns

-- Step 1: Add new columns (all nullable first for safety)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS archived_reason VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS archived_by TEXT; -- Using TEXT to match user_id type

-- Step 2: Add performance optimization columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_number VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_type_name VARCHAR(100);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stay_nights INTEGER;

-- Step 3: Add indexes for performance (one by one to avoid conflicts)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_is_archived ON bookings (is_archived);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_archived_status ON bookings (is_archived, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_archived_dates ON bookings (is_archived, checkin_date);

-- Step 4: Add foreign key constraint (after ensuring data type compatibility)
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_archived_by 
  FOREIGN KEY (archived_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- Step 5: Set default values for existing records
UPDATE bookings SET is_archived = FALSE WHERE is_archived IS NULL;

-- Step 6: Make is_archived NOT NULL after setting defaults
ALTER TABLE bookings ALTER COLUMN is_archived SET NOT NULL;