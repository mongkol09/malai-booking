-- Migration: Add guest data fields and ML data collection
-- Created: 2025-08-30

-- Add new columns to guests table for comprehensive data
ALTER TABLE guests
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS id_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS id_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,
ADD COLUMN IF NOT EXISTS accessibility_needs TEXT,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS newsletter_subscription BOOLEAN DEFAULT false;

-- Create ML data collection table
CREATE TABLE IF NOT EXISTS ml_data_collection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    staff_id UUID REFERENCES users(id),
    event_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ml_data_event_type ON ml_data_collection(event_type);
CREATE INDEX IF NOT EXISTS idx_ml_data_booking_id ON ml_data_collection(booking_id);
CREATE INDEX IF NOT EXISTS idx_ml_data_created_at ON ml_data_collection(created_at);

-- Add comments
COMMENT ON TABLE ml_data_collection IS 'Collection of data for machine learning analysis';
COMMENT ON COLUMN ml_data_collection.event_type IS 'Type of event: guest_data_update, booking_created, pricing_applied, etc.';
COMMENT ON COLUMN ml_data_collection.event_data IS 'JSON data specific to the event type';
