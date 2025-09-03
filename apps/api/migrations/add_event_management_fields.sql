-- ============================================
-- EVENT MANAGEMENT MIGRATION SCRIPT
-- ============================================

-- Backup existing data first
CREATE TABLE events_backup AS SELECT * FROM events;

-- Add new columns to events table
ALTER TABLE events 
ADD COLUMN category VARCHAR(100),
ADD COLUMN source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
ADD COLUMN source_event_id TEXT UNIQUE,
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
ADD COLUMN suggested_pricing_rule_id VARCHAR(36),
ADD COLUMN suggestion_details TEXT,
ADD COLUMN projected_impact JSONB,
ADD COLUMN reviewed_by_staff_id VARCHAR(36),
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;

-- Create EventStatus enum (if using PostgreSQL)
-- Note: Prisma will handle enum creation automatically

-- Add foreign key constraints
ALTER TABLE events
ADD CONSTRAINT fk_events_suggested_pricing_rule
FOREIGN KEY (suggested_pricing_rule_id) REFERENCES dynamicpricingrules(rule_id);

ALTER TABLE events
ADD CONSTRAINT fk_events_reviewed_by_staff
FOREIGN KEY (reviewed_by_staff_id) REFERENCES staffs(staff_id);

-- Create indexes for better performance
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_source ON events(source);
CREATE INDEX idx_events_source_event_id ON events(source_event_id);

-- Update existing events with default values
UPDATE events 
SET 
    source = 'MANUAL',
    status = 'CONFIRMED'
WHERE source IS NULL OR status IS NULL;
