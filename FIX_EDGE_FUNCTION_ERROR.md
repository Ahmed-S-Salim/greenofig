# 🔧 Fix Edge Function Error

## The Problem

When you click "Generate Next", you get:
```
Generation failed: failed to send request to the edge function
```

This means the OpenAI edge function doesn't exist or isn't working.

---

## ✅ SOLUTION 1: Check if Edge Function Exists

### Step 1: Check Supabase Functions

1. Go to: https://hwnukzxlluykxcgcebwr.supabase.co/project/hwnukzxlluykxcgcebwr/functions
2. Look for a function called **"openai-chat"**

**If you see it**: Go to Solution 2 (Function exists but has issues)
**If you don't see it**: Go to Solution 3 (Need to deploy function)

---

## ✅ SOLUTION 2: Function Exists But Failing

The function exists but might have auth or API key issues.

### Check Function Logs:

1. Go to: https://hwnukzxlluykxcgcebwr.supabase.co/project/hwnukzxlluykxcgcebwr/functions
2. Click on **"openai-chat"** function
3. Click **"Logs"** tab
4. Look for error messages

**Common errors**:
- `OPENAI_API_KEY is not set` → Need to add OpenAI API key
- `401 Unauthorized` → OpenAI API key is invalid
- `429 Rate limit` → OpenAI API quota exceeded

### Add OpenAI API Key:

1. Go to: https://hwnukzxlluykxcgcebwr.supabase.co/project/hwnukzxlluykxcgcebwr/settings/functions
2. Scroll to **"Secrets"** section
3. Add secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (get from https://platform.openai.com/api-keys)
4. Click **"Add secret"**
5. Redeploy the function

---

## ✅ SOLUTION 3: Deploy Edge Function

If the function doesn't exist, deploy it:

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref hwnukzxlluykxcgcebwr

# Deploy the function
npx supabase functions deploy openai-chat

# Set your OpenAI API key
npx supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

### Option B: Manual Deployment via Dashboard

1. Go to: https://hwnukzxlluykxcgcebwr.supabase.co/project/hwnukzxlluykxcgcebwr/functions
2. Click **"Create a new function"**
3. Name: `openai-chat`
4. Copy code from: `supabase/functions/openai-chat/index.ts`
5. Paste into editor
6. Click **"Deploy function"**
7. Add `OPENAI_API_KEY` secret (see Solution 2)

---

## ✅ SOLUTION 4: Use Direct OpenAI API (Alternative)

If Supabase Edge Functions are too complex, we can modify the code to call OpenAI directly from the browser.

### Pros:
- No edge function needed
- Simpler setup

### Cons:
- OpenAI API key exposed in browser (only use with domain restrictions)
- Less secure

**Would you like me to implement this alternative?**

---

## 🧪 Test Edge Function Manually

After deploying, test it:

### Via cURL:
```bash
curl -X POST https://hwnukzxlluykxcgcebwr.supabase.co/functions/v1/openai-chat \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Say hello"}
    ],
    "model": "gpt-4",
    "max_tokens": 100
  }'
```

Expected response:
```json
{
  "response": "Hello! How can I assist you today?",
  "usage": {...}
}
```

---

## 📋 Quick Checklist

```
[ ] Check if openai-chat function exists in Supabase
[ ] If exists: Check function logs for errors
[ ] If not exists: Deploy edge function
[ ] Add OPENAI_API_KEY secret to Supabase
[ ] Test function manually with cURL
[ ] Try "Generate Next" again in Auto Scheduler
```

---

## 🆘 Quick Fix (Remove Duplicates First)

Before fixing edge function, clean up duplicate topics:

```sql
-- Run this in Supabase SQL Editor
DELETE FROM blog_content_queue
WHERE id NOT IN (
    SELECT DISTINCT ON (topic) id
    FROM blog_content_queue
    ORDER BY topic, created_at
);

SELECT COUNT(*) FROM blog_content_queue;
-- Should show: 10
```

---

## 🎯 What To Do Now

1. **First**: Remove duplicate topics (SQL above)
2. **Second**: Check if edge function exists (link above)
3. **Third**: Deploy or fix edge function based on what you find
4. **Fourth**: Test "Generate Next" again

**Which solution do you need? Let me know what you see in Supabase Functions!** 🚀
