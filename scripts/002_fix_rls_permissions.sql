-- Fix RLS Permissions for Admin Dashboard
-- Run this in Supabase SQL Editor to allow dashboard access

-- OPTION 1: Disable RLS on tables (Quick Fix - Use for Development)
-- This allows full access without authentication checks

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE intents DISABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE bot_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE special_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE corrections DISABLE ROW LEVEL SECURITY;

-- OPTION 2: Keep RLS but allow service role access (Recommended for Production)
-- Uncomment these if you want to keep RLS enabled but allow service role

/*
-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Create new policies that allow service role
CREATE POLICY "Allow service role full access to users"
ON users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to users"
ON users FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Repeat for other tables
CREATE POLICY "Allow service role full access to messages"
ON messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to broadcasts"
ON broadcasts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to bot_settings"
ON bot_settings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to training_data"
ON training_data FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to intents"
ON intents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to special_contacts"
ON special_contacts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to system_logs"
ON system_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to admins"
ON admins FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to corrections"
ON corrections FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
*/
