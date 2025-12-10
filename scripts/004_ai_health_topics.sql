-- AI-Generated Health Topics with Admin Approval - Database Schema Updates
-- Adds status workflow, generation tracking, and system settings

-- =============================================
-- UPDATE HEALTH_TOPICS TABLE (Add status workflow)
-- =============================================
ALTER TABLE health_topics ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' 
  CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'rejected'));

ALTER TABLE health_topics ADD COLUMN IF NOT EXISTS generated_by TEXT DEFAULT 'manual';
ALTER TABLE health_topics ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE health_topics ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE health_topics ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update existing topics to 'published' status
UPDATE health_topics SET status = 'published' WHERE status IS NULL;

-- =============================================
-- SYSTEM SETTINGS TABLE (Configuration storage)
-- =============================================
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
  ('health_topics_auto_publish', '{"enabled": false, "frequency": "weekly", "last_generated": null}'),
  ('ai_content_generation', '{"enabled": true, "require_review": true, "categories": ["hygiene", "water_safety", "vector_control", "food_safety", "sanitation", "sexual_health", "mental_health", "immunization"]}')
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_health_topics_status ON health_topics(status);
CREATE INDEX IF NOT EXISTS idx_health_topics_generated_by ON health_topics(generated_by);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- =============================================
-- ROW LEVEL SECURITY for system_settings
-- =============================================
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all system_settings" ON system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update system_settings" ON system_settings FOR UPDATE TO authenticated USING (true);

-- =============================================
-- Function to update system setting
-- =============================================
CREATE OR REPLACE FUNCTION update_system_setting(
  p_setting_key TEXT,
  p_setting_value JSONB,
  p_updated_by TEXT DEFAULT NULL
)
RETURNS system_settings AS $$
DECLARE
  v_setting system_settings;
BEGIN
  INSERT INTO system_settings (setting_key, setting_value, updated_by, updated_at)
  VALUES (p_setting_key, p_setting_value, p_updated_by, NOW())
  ON CONFLICT (setting_key) 
  DO UPDATE SET 
    setting_value = p_setting_value,
    updated_by = p_updated_by,
    updated_at = NOW()
  RETURNING * INTO v_setting;
  
  RETURN v_setting;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Function to get system setting
-- =============================================
CREATE OR REPLACE FUNCTION get_system_setting(p_setting_key TEXT)
RETURNS JSONB AS $$
DECLARE
  v_value JSONB;
BEGIN
  SELECT setting_value INTO v_value
  FROM system_settings
  WHERE setting_key = p_setting_key;
  
  RETURN v_value;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Function to approve health topic
-- =============================================
CREATE OR REPLACE FUNCTION approve_health_topic(
  p_topic_id UUID,
  p_reviewed_by TEXT
)
RETURNS health_topics AS $$
DECLARE
  v_topic health_topics;
BEGIN
  UPDATE health_topics
  SET 
    status = 'published',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    is_active = TRUE
  WHERE id = p_topic_id
  RETURNING * INTO v_topic;
  
  RETURN v_topic;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Function to reject health topic
-- =============================================
CREATE OR REPLACE FUNCTION reject_health_topic(
  p_topic_id UUID,
  p_reviewed_by TEXT,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS health_topics AS $$
DECLARE
  v_topic health_topics;
BEGIN
  UPDATE health_topics
  SET 
    status = 'rejected',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    rejection_reason = p_rejection_reason,
    is_active = FALSE
  WHERE id = p_topic_id
  RETURNING * INTO v_topic;
  
  RETURN v_topic;
END;
$$ LANGUAGE plpgsql;
