-- Fix Escalations Table Issues
-- Run this in Supabase SQL Editor

-- 1. Disable RLS on escalations table to allow bot to insert/read
ALTER TABLE escalations DISABLE ROW LEVEL SECURITY;

-- 2. Make message_id nullable (optional - useful when escalating without a specific message)
ALTER TABLE escalations ALTER COLUMN message_id DROP NOT NULL;

-- 3. (Optional) If you want to keep RLS but allow service role access:
-- Uncomment the following:
/*
CREATE POLICY "Allow service role full access to escalations"
ON escalations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon full access to escalations"
ON escalations FOR ALL
TO anon
USING (true)
WITH CHECK (true);
*/

-- 4. Verify escalations exist
SELECT * FROM escalations ORDER BY created_at DESC LIMIT 10;
