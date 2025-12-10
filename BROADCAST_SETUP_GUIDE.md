# Quick Setup Guide - Auto-Send Controls

## Problem
The broadcast settings toggle button is not showing on the Health Topics page.

## Root Cause
The `broadcast_settings` table doesn't exist yet in your Supabase database.

## Solution

### Step 1: Run the Database Migration

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click on **SQL Editor** in the left sidebar

2. **Run the Migration**
   - Copy the **entire contents** of this file:
     ```
     admin/v0-admin-dashboard-build/scripts/004_broadcast_settings.sql
     ```
   - Paste into Supabase SQL Editor
   - Click **Run** button

3. **Verify Success**
   - You should see messages like:
     ```
     CREATE TABLE
     CREATE INDEX
     INSERT 0 1
     ```
   - Check the output at the bottom shows the table structure

### Step 2: Refresh Admin Dashboard

1. Go to your admin dashboard
2. Navigate to `/dashboard/health-topics`
3. Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Step 3: Verify the Controls Appear

You should now see a **Broadcast Settings** card at the top with:
- ✅ Auto-Send toggle (OFF by default)
- ✅ Interval controls (default: 1 day)
- ✅ Last/Next broadcast times
- ✅ "Send Broadcast Now" button

## If Still Not Showing

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors related to `broadcast_settings`
4. Share the error message

### Check Database
Run this query in Supabase SQL Editor:
```sql
SELECT * FROM broadcast_settings;
```

You should see one row with default settings.

### Check API Response
In browser DevTools:
1. Go to Network tab
2. Refresh the page
3. Look for request to `getBroadcastSettings`
4. Check if it returns data or an error

## Common Issues

### Issue: "relation broadcast_settings does not exist"
**Solution**: Migration hasn't been run. Go back to Step 1.

### Issue: "No data returned"
**Solution**: Run this in Supabase:
```sql
INSERT INTO broadcast_settings (auto_send_enabled, interval_value, interval_unit)
VALUES (FALSE, 1, 'days');
```

### Issue: Component not rendering
**Solution**: Check if `broadcastSettings` is undefined:
```typescript
// In browser console
console.log(broadcastSettings)
```

If undefined, the API call is failing. Check Supabase connection.

## Testing After Setup

1. **Toggle Auto-Send ON**
   - Click the toggle switch
   - Should change from OFF to ON

2. **Change Interval**
   - Set to "2 minutes" for testing
   - Click "Save Frequency"
   - Check "Next broadcast" updates

3. **Manual Trigger**
   - Click "Send Broadcast Now"
   - Confirm the dialog
   - Check Broadcast History tab for new entry

4. **Auto-Send Test**
   - Wait 2 minutes
   - Check if broadcast sent automatically
   - Verify in Broadcast History

## Need Help?

If you're still having issues:
1. Share the exact error message from browser console
2. Share the output from running the migration
3. Share the result of `SELECT * FROM broadcast_settings;`
