# AI Coach - Quick Reference

## 🎯 What's Done
✅ **UI**: Fully built chat interface at `/app/ai-coach`
✅ **Database**: Table schema created in `create-ai-chat-table.sql`
✅ **Edge Function**: Gemini integration in `supabase/functions/ai-coach-memory/index.ts`
✅ **Documentation**: Complete guides in `DEPLOY_AI_COACH.md` and `AI_COACH_SETUP.md`

## 🚀 Quick Deploy (3 Steps)

### 1. Create Database Table
```sql
-- Run this in Supabase SQL Editor
-- File: create-ai-chat-table.sql
```

### 2. Deploy Edge Function

**Option A - Dashboard (Easiest):**
1. Go to Supabase Dashboard → Edge Functions
2. Click "Create Function" → Name: `ai-coach-memory`
3. Copy content from `supabase/functions/ai-coach-memory/index.ts`
4. Click "Deploy"

**Option B - CLI:**
```bash
npx supabase functions deploy ai-coach-memory
```

### 3. Set API Key

**Get your key:** https://ai.google.dev/ (starts with `AIza...`)

**Set in Supabase:**
- Dashboard → Project Settings → Edge Functions → Secrets
- Name: `GEMINI_API_KEY`
- Value: Your API key

**Or via CLI:**
```bash
npx supabase secrets set GEMINI_API_KEY=your_key_here
```

## 🧪 Test Your Setup

### Method 1: Use the App
1. Run `npm run dev`
2. Go to http://localhost:3000/app/ai-coach
3. Try: "Give me a healthy breakfast idea"

### Method 2: Test API Key Locally
```bash
node test-gemini-local.js
```
(Update the API key in the file first)

### Method 3: Interactive Helper
```bash
node deploy-ai-coach.js
```

## 🔍 Troubleshooting

| Error | Solution |
|-------|----------|
| "GEMINI_API_KEY is not set" | Add secret in Supabase Dashboard → redeploy function |
| "Function not found" | Deploy the `ai-coach-memory` function |
| "Table doesn't exist" | Run `create-ai-chat-table.sql` migration |
| "Gemini API error: 400" | Check API key is valid and active |
| White page / blank screen | Check browser console for errors |

## 📊 What the AI Coach Does

- **Remembers context** - Last 10 messages stored and sent
- **Personalized** - Uses user's name from their profile
- **Health focused** - Nutrition, fitness, wellness, stress management
- **Safe** - Gemini's built-in content safety filters
- **Fast** - Gemini Pro model optimized for chat
- **Free tier** - 60 requests/minute free

## 🎨 Features

- ✅ Real-time chat interface
- ✅ Message history persistence
- ✅ Suggested conversation starters
- ✅ Loading states and error handling
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ Auto-scroll to latest message

## 📝 Test Questions

Try these to test the AI Coach:
- "Give me a healthy breakfast idea"
- "Suggest a quick 15-minute workout"
- "How can I increase my energy levels?"
- "What's a good way to de-stress?"
- "How much water should I drink daily?"
- "Create a meal plan for today"

## 🔗 Important Files

| File | Purpose |
|------|---------|
| `src/pages/AiCoachPage.jsx` | Main UI component |
| `supabase/functions/ai-coach-memory/index.ts` | Gemini API integration |
| `create-ai-chat-table.sql` | Database schema |
| `DEPLOY_AI_COACH.md` | Full deployment guide |
| `test-gemini-local.js` | Local API key tester |
| `deploy-ai-coach.js` | Interactive setup helper |

## 💰 Cost Estimate

**Gemini Free Tier:**
- 60 requests per minute
- Perfect for development + small user base

**Paid Tier:**
- Very affordable
- Pay per 1000 requests
- Check: https://ai.google.dev/pricing

## ✅ Pre-Launch Checklist

- [ ] Database table created (`ai_chat_messages`)
- [ ] Edge Function deployed (`ai-coach-memory`)
- [ ] API key secret set (`GEMINI_API_KEY`)
- [ ] Tested with sample questions
- [ ] Checked error handling works
- [ ] Verified message history saves correctly
- [ ] Tested on mobile devices

## 🆘 Need Help?

1. **Check logs:** Supabase Dashboard → Edge Functions → Logs
2. **Browser console:** F12 → Console tab
3. **Network tab:** Check if Edge Function is being called
4. **Review docs:** See `DEPLOY_AI_COACH.md` for detailed info

---

**Last Updated:** 2025-10-18
**Status:** Ready for deployment
**Model:** Gemini Pro
**API:** Google Generative AI
