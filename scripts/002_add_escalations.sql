-- Escalation System - Database Migration
-- Add escalation tracking to existing schema

-- =============================================
-- ESCALATIONS TABLE (Flagged conversations)
-- =============================================
CREATE TABLE IF NOT EXISTS escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('keyword', 'low_confidence', 'user_request', 'safety', 'failed_intent', 'manual')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to VARCHAR(255),
  admin_notes TEXT,
  admin_response TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Add escalation fields to messages table
-- =============================================
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_escalated BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS escalation_id UUID REFERENCES escalations(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS confidence_score FLOAT;

-- =============================================
-- Add failed_count to broadcasts table
-- =============================================
ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0;

-- =============================================
-- INDEXES for escalations
-- =============================================
CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_user_id ON escalations(user_id);
CREATE INDEX IF NOT EXISTS idx_escalations_priority ON escalations(priority);
CREATE INDEX IF NOT EXISTS idx_escalations_created_at ON escalations(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_escalated ON messages(is_escalated);

-- =============================================
-- ROW LEVEL SECURITY for escalations
-- =============================================
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all escalations" ON escalations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert escalations" ON escalations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update escalations" ON escalations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete escalations" ON escalations FOR DELETE TO authenticated USING (true);

-- =============================================
-- Function to auto-update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for escalations table
DROP TRIGGER IF EXISTS update_escalations_updated_at ON escalations;
CREATE TRIGGER update_escalations_updated_at
    BEFORE UPDATE ON escalations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
