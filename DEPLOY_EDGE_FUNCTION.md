# Deploy Edge Function - Quick Guide

## ✅ What You've Done So Far:
- ✅ SQL migrations run (ai_chat_messages & ai_coach_settings tables created)
- ✅ Dev server running on http://localhost:3000
- ✅ Gemini API key configured in database

## 🚀 Last Step: Deploy Edge Function (2 minutes)

You just need to deploy the `ai-coach-memory` Edge Function to Supabase.

### Option 1: Via Supabase Dashboard (Easiest - Recommended)

1. Open your **Supabase Dashboard**
2. Go to **Edge Functions** (in the left sidebar)
3. Click **"Create a new function"** or **"New Function"**
4. Enter function name: `ai-coach-memory`
5. Copy ALL the code from this file:
   ```
   supabase/functions/ai-coach-memory/index.ts
   ```
6. Paste it into the function editor
7. Click **"Deploy"**

**That's it!** The function will be live in ~30 seconds.

### Option 2: Via Supabase CLI

If you prefer using the command line:

```bash
# 1. Login to Supabase
npx supabase login

# 2. Link your project
npx supabase link --project-ref xdzoikocriuvgkoenjqk

# 3. Deploy the function
npx supabase functions deploy ai-coach-memory
```

---

## 🎯 Test Everything

Once the Edge Function is deployed:

### 1. Test AI Coach (User View):
- Go to: http://localhost:3000/app/ai-coach
- Type: "Give me a healthy breakfast idea"
- You should get an AI response! ✨

### 2. Test AI Settings Panel (Admin View):
- Go to: http://localhost:3000/app/admin?tab=ai-coach
- You'll see the AI Coach settings panel
- Your Gemini provider should be listed and active (green badge)

---

## 🎉 What You Can Do After Deployment:

1. **Add More AI Providers:**
   - Get an OpenAI API key → Add it in the admin panel
   - Get a Claude API key → Add it in the admin panel
   - Switch between them anytime!

2. **Customize Settings:**
   - Edit the Gemini provider
   - Change the system prompt
   - Adjust temperature or max tokens
   - Update the model

3. **Test Different Providers:**
   - Add multiple providers (keep inactive)
   - Test each one
   - Activate the best one

---

## 🐛 If Something Goes Wrong:

### Error: "No active AI provider configured"
**Solution:** Go to Admin → AI Coach → Click "Activate" on Gemini

### Error: AI not responding
**Solution:**
- Check Edge Function logs in Supabase Dashboard
- Verify the function deployed successfully
- Check your API key is correct in the database

### Error: "Function not found"
**Solution:** Deploy the function (see steps above)

---

## 📝 Quick Reference:

**Edge Function File:** `supabase/functions/ai-coach-memory/index.ts`
**Function Name:** `ai-coach-memory`
**AI Coach URL:** http://localhost:3000/app/ai-coach
**Admin Panel:** http://localhost:3000/app/admin?tab=ai-coach

---

**You're almost there! Just deploy the Edge Function and you're done!** 🚀
