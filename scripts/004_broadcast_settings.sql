-- Migration: Add broadcast settings for automated health topic broadcasts
-- Description: Creates broadcast_settings table to control auto-send frequency
-- Date: 2025-12-04

-- =============================================
-- BROADCAST SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS broadcast_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_send_enabled BOOLEAN DEFAULT FALSE,
  interval_value INTEGER DEFAULT 1 CHECK (interval_value > 0),
  interval_unit TEXT DEFAULT 'days' CHECK (interval_unit IN ('minutes', 'hours', 'days', 'weeks', 'months')),
  last_broadcast_at TIMESTAMPTZ,
  next_broadcast_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_broadcast_settings_next_broadcast ON broadcast_settings(next_broadcast_at);

-- Insert default settings (only if table is empty)
INSERT INTO broadcast_settings (auto_send_enabled, interval_value, interval_unit)
SELECT FALSE, 1, 'days'
WHERE NOT EXISTS (SELECT 1 FROM broadcast_settings);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_broadcast_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_broadcast_settings_updated_at ON broadcast_settings;
CREATE TRIGGER update_broadcast_settings_updated_at
    BEFORE UPDATE ON broadcast_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_broadcast_settings_updated_at();

-- Row Level Security
ALTER TABLE broadcast_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view broadcast_settings" ON broadcast_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update broadcast_settings" ON broadcast_settings FOR UPDATE TO authenticated USING (true);

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'broadcast_settings'
ORDER BY ordinal_position;

-- Show current settings
SELECT * FROM broadcast_settings;
