# ⚠️ IMPORTANT: Run This Migration First!

Before the AI Error Monitor will work, you MUST create the `error_logs` table in Supabase.

## Quick Steps:

### 1. Go to Supabase Dashboard
Open: https://app.supabase.com

### 2. Select Your Project
Click on your GreenoFig project

### 3. Open SQL Editor
- Click "SQL Editor" in the left sidebar
- Click "New Query"

### 4. Copy the Migration
Open this file on your computer:
```
supabase/migrations/create_error_logs_table.sql
```

Copy ALL the contents

### 5. Paste and Run
- Paste into the SQL Editor
- Click "Run" (or press Ctrl+Enter)
- You should see: "Success. No rows returned"

### 6. Verify
- Go to "Table Editor"
- You should see a new table called `error_logs`
- Click on it to see the columns (error_message, error_stack, etc.)

## Done!
The Error Monitor will now work. Any errors in your app will be automatically logged to this table!

## What Happens If You Don't Run This?
- The Error Monitor tab will show an error
- Error logging will fail silently
- No errors will be captured

## Need Help?
If you get any errors when running the migration, let me know and I'll help fix them!
