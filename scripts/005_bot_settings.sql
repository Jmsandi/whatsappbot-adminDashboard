-- Migration: Bot Settings for AI Configuration
-- Description: Creates bot_settings table to store AI behavior settings
-- Date: 2025-12-04

-- Drop table if it exists (clean start)
DROP TABLE IF EXISTS bot_settings CASCADE;

-- =============================================
-- BOT SETTINGS TABLE
-- =============================================
CREATE TABLE bot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- System Prompts (Prompts tab)
  system_prompt TEXT,
  welcome_message TEXT,
  fallback_response TEXT,
  escalation_message TEXT,
  away_message TEXT,
  
  -- AI Model Settings (AI Model tab)
  ai_model TEXT DEFAULT 'geneline',
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 1024 CHECK (max_tokens > 0),
  top_p DECIMAL(3,2) DEFAULT 0.9 CHECK (top_p >= 0 AND top_p <= 1),
  frequency_penalty DECIMAL(3,2) DEFAULT 0 CHECK (frequency_penalty >= 0 AND frequency_penalty <= 2),
  presence_penalty DECIMAL(3,2) DEFAULT 0 CHECK (presence_penalty >= 0 AND presence_penalty <= 2),
  
  -- Behavior Settings (Behavior tab)
  response_tone TEXT DEFAULT 'friendly', -- professional, friendly, casual, formal
  response_language TEXT DEFAULT 'en', -- en, es, fr, de, auto
  response_length TEXT DEFAULT 'medium', -- concise, medium, detailed
  emoji_usage TEXT DEFAULT 'moderate', -- none, minimal, moderate, frequent
  bot_name TEXT DEFAULT 'AI Assistant',
  bot_status_text TEXT DEFAULT 'Powered by AI • Always Online',
  
  -- Safety & Guardrails (Behavior tab)
  block_harmful_content BOOLEAN DEFAULT true,
  block_pii_sharing BOOLEAN DEFAULT true,
  block_financial_advice BOOLEAN DEFAULT true,
  block_medical_advice BOOLEAN DEFAULT true,
  block_legal_advice BOOLEAN DEFAULT true,
  
  -- Rate Limits (Behavior tab)
  rate_limit_messages_per_minute INTEGER DEFAULT 20,
  rate_limit_messages_per_day INTEGER DEFAULT 500,
  rate_limit_cooldown_seconds INTEGER DEFAULT 60,
  
  -- Escalation Thresholds (AI Model tab)
  confidence_threshold DECIMAL(3,2) DEFAULT 0.75,
  auto_escalate_threshold DECIMAL(3,2) DEFAULT 0.5,
  
  -- Memory Settings (AI Model tab)
  enable_memory BOOLEAN DEFAULT true,
  memory_window INTEGER DEFAULT 10,
  stream_responses BOOLEAN DEFAULT true,
  
  -- Feature Toggles (Features tab)
  feature_auto_reply BOOLEAN DEFAULT true,
  feature_human_handoff BOOLEAN DEFAULT true,
  feature_multi_language BOOLEAN DEFAULT true,
  feature_analytics BOOLEAN DEFAULT true,
  feature_notifications BOOLEAN DEFAULT true,
  feature_rate_limit BOOLEAN DEFAULT true,
  feature_ai_confidence_check BOOLEAN DEFAULT true,
  feature_sentiment_analysis BOOLEAN DEFAULT true,
  feature_intent_detection BOOLEAN DEFAULT true,
  feature_context_awareness BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified_by TEXT
);

-- Create index for efficient queries
CREATE INDEX idx_bot_settings_updated ON bot_settings(updated_at DESC);

-- Insert default settings
INSERT INTO bot_settings (
  system_prompt,
  welcome_message,
  fallback_response,
  escalation_message,
  away_message,
  ai_model,
  temperature,
  max_tokens
) VALUES (
  'You are a public health assistant for Sierra Leone. You ONLY answer questions related to public health topics in Sierra Leone, including but not limited to: diseases (malaria, cholera, Ebola, etc.), vaccinations, healthcare facilities, maternal and child health, nutrition, sanitation, hygiene, disease prevention, and health services. If a user asks about topics unrelated to public health in Sierra Leone, politely explain that you can only assist with public health questions about Sierra Leone and encourage them to ask a relevant question.',
  'Hello! I''m your AI health assistant for Sierra Leone. How can I help you today?',
  'I''m not quite sure I understand. Let me connect you with a health worker who can better assist you.',
  'I understand this needs special attention. I''m connecting you with a human agent who can better assist you. Please hold on for a moment.',
  'Thank you for your message! Our team is currently offline. The AI assistant is still here to help with common questions, or a human agent will respond during business hours.',
  'geneline',
  0.7,
  1024
);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bot_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bot_settings_updated_at
    BEFORE UPDATE ON bot_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_settings_updated_at();

-- Row Level Security
ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view bot_settings" ON bot_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update bot_settings" ON bot_settings FOR UPDATE TO authenticated USING (true);

-- Verify
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'bot_settings'
ORDER BY ordinal_position;

SELECT * FROM bot_settings;
