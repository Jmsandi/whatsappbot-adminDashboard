-- Fix Escalation Constraints
-- Run this in Supabase SQL Editor

-- Step 1: See what trigger_type values exist
SELECT DISTINCT trigger_type FROM escalations;

-- Step 2: Drop existing constraints first
ALTER TABLE escalations DROP CONSTRAINT IF EXISTS escalations_status_check;
ALTER TABLE escalations DROP CONSTRAINT IF EXISTS escalations_trigger_type_check;
ALTER TABLE escalations DROP CONSTRAINT IF EXISTS escalations_priority_check;

-- Step 3: Fix any invalid trigger_type values
UPDATE escalations 
SET trigger_type = 'manual' 
WHERE trigger_type IS NULL OR trigger_type NOT IN ('keyword', 'low_confidence', 'user_request', 'safety', 'failed_intent', 'manual');

-- Step 4: Fix any invalid status values
UPDATE escalations 
SET status = 'pending' 
WHERE status IS NULL OR status NOT IN ('pending', 'assigned', 'in_progress', 'resolved', 'closed');

-- Step 5: Fix any invalid priority values  
UPDATE escalations 
SET priority = 'normal' 
WHERE priority IS NULL OR priority NOT IN ('low', 'normal', 'high', 'urgent');

-- Step 6: Now add the constraints back
ALTER TABLE escalations ADD CONSTRAINT escalations_status_check 
CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'closed'));

ALTER TABLE escalations ADD CONSTRAINT escalations_trigger_type_check 
CHECK (trigger_type IN ('keyword', 'low_confidence', 'user_request', 'safety', 'failed_intent', 'manual'));

ALTER TABLE escalations ADD CONSTRAINT escalations_priority_check 
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Verify
SELECT DISTINCT status, trigger_type, priority FROM escalations;

