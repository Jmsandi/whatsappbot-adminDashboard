-- WhatsApp Bot Admin Dashboard Database Schema
-- Run this script to create all necessary tables

-- =============================================
-- USERS TABLE (WhatsApp users interacting with bot)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  tags TEXT[] DEFAULT '{}',
  messages_count INTEGER DEFAULT 0,
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MESSAGES TABLE (Conversation history)
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot')),
  content TEXT NOT NULL,
  intent VARCHAR(100),
  is_handled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SPECIAL CONTACTS TABLE (Priority contacts)
-- =============================================
CREATE TABLE IF NOT EXISTS special_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Health Worker', 'Supervisor', 'Support')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRAINING DATA TABLE (Q/A pairs for bot)
-- =============================================
CREATE TABLE IF NOT EXISTS training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  added_by VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'needs_review', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INTENTS TABLE (Bot intents/categories)
-- =============================================
CREATE TABLE IF NOT EXISTS intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT 'bg-chart-1',
  qa_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CORRECTIONS TABLE (Wrong answers reported)
-- =============================================
CREATE TABLE IF NOT EXISTS corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  wrong_answer TEXT NOT NULL,
  correct_answer TEXT,
  reported_by VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADMINS TABLE (Dashboard administrators)
-- =============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Super Admin', 'Bot Trainer', 'Support Admin', 'Data Annotator')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BOT SETTINGS TABLE (Bot configuration)
-- =============================================
CREATE TABLE IF NOT EXISTS bot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  updated_by VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SYSTEM LOGS TABLE (Admin activity logs)
-- =============================================
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'login', 'export', 'broadcast', 'settings')),
  admin_name VARCHAR(255),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BROADCASTS TABLE (WhatsApp campaigns)
-- =============================================
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target VARCHAR(50) NOT NULL CHECK (target IN ('All Users', 'VIP Only', 'Active Users', 'Custom')),
  target_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES for better query performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_training_data_intent ON training_data(intent);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON broadcasts(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- For this admin dashboard, we allow authenticated admins to access all data
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users (admins) full access
-- In production, you'd want more granular policies based on admin roles

CREATE POLICY "Admins can view all users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert users" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update users" ON users FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete users" ON users FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can view all messages" ON messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert messages" ON messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update messages" ON messages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete messages" ON messages FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can view all contacts" ON special_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert contacts" ON special_contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update contacts" ON special_contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete contacts" ON special_contacts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can view all training_data" ON training_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert training_data" ON training_data FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update training_data" ON training_data FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete training_data" ON training_data FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can view all intents" ON intents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert intents" ON intents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update intents" ON intents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete intents" ON intents FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can view all corrections" ON corrections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert corrections" ON corrections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update corrections" ON corrections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete corrections" ON corrections FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can view all admins" ON admins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert admins" ON admins FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update admins" ON admins FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete admins" ON admins FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can view all settings" ON bot_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert settings" ON bot_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update settings" ON bot_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete settings" ON bot_settings FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can view all logs" ON system_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert logs" ON system_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can view all broadcasts" ON broadcasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert broadcasts" ON broadcasts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update broadcasts" ON broadcasts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete broadcasts" ON broadcasts FOR DELETE TO authenticated USING (true);
