# AI Coach - Final Setup Guide

## 🎉 What's Been Completed

All code and configuration is ready! Here's what's been implemented:

### ✅ Completed Components:

1. **AI Coach Settings Panel** - Full admin UI in the dashboard
2. **Flexible AI Provider System** - Supports Gemini, OpenAI, Claude, and custom APIs
3. **Edge Function** - Multi-provider AI integration (`ai-coach-memory`)
4. **Database Schema** - Tables for AI settings and chat history
5. **API Key Configuration** - Your Gemini API key is ready
6. **Admin Dashboard Integration** - New "AI Coach" tab

---

## 🚀 Final Deployment Steps (5 Minutes)

You only need to complete these 3 simple steps:

### Step 1: Run SQL Migrations

Go to your **Supabase Dashboard** → **SQL Editor** → **New Query**

#### Migration 1: AI Chat Messages Table
Copy and paste this file:
```
create-ai-chat-table.sql
```

#### Migration 2: AI Coach Settings Table
Copy and paste this file:
```
create-ai-settings-table.sql
```

**Note:** The second migration will automatically insert your Gemini configuration with the API key you provided!

---

### Step 2: Deploy Edge Function

You have 2 options:

#### Option A: Via Supabase Dashboard (Easiest)

1. Go to **Supabase Dashboard** → **Edge Functions**
2. Click **"Create Function"**
3. Name: `ai-coach-memory`
4. Copy the entire content from: `supabase/functions/ai-coach-memory/index.ts`
5. Paste and click **"Deploy"**

#### Option B: Via CLI

```bash
# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref xdzoikocriuvgkoenjqk

# Deploy the function
npx supabase functions deploy ai-coach-memory
```

---

### Step 3: Test Everything

1. **Test AI Coach (Public)**
   - Go to: http://localhost:3000/app/ai-coach
   - Try asking: "Give me a healthy breakfast idea"
   - You should get a personalized response from Gemini!

2. **Test AI Settings Panel (Admin)**
   - Go to: http://localhost:3000/app/admin?tab=ai-coach
   - You'll see your Gemini provider (already active)
   - You can add more providers (OpenAI, Claude) anytime

---

## 🎯 Using the AI Coach Settings Panel

### Location
Admin Dashboard → **AI Coach** tab

### Features

1. **View All Providers**
   - See configured AI providers in a table
   - Check which one is active (green badge)
   - View model names, temperature settings

2. **Add New Provider**
   - Click "Add AI Provider"
   - Choose from: Gemini, OpenAI, Claude, Custom
   - Enter API key and configure settings
   - Set as active to use immediately

3. **Edit Provider**
   - Click the edit button on any row
   - Update API keys, models, or prompts
   - Adjust temperature and max tokens

4. **Switch Providers**
   - Click "Activate" on any provider
   - Only one can be active at a time
   - Changes take effect immediately

5. **Delete Provider**
   - Click delete button
   - Confirms before removing

### Provider Presets

When you select a provider, it auto-fills:

**Gemini:**
- Models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash
- Default: gemini-2.5-flash (fastest)
- System Prompt: Health coach personality

**OpenAI:**
- Models: gpt-4o, gpt-4-turbo, gpt-4, gpt-3.5-turbo
- Default: gpt-3.5-turbo (cost-effective)
- System Prompt: Professional health coach

**Claude:**
- Models: claude-3-5-sonnet, claude-3-opus, claude-3-haiku
- Default: claude-3-haiku (fast & affordable)
- System Prompt: Empathetic health coach

**Custom:**
- Enter your own API endpoint
- Configure request format
- Full flexibility

---

## 📊 Configuration Options Explained

### Temperature (0.0 - 2.0)
- **0.0 - 0.3**: Very focused, consistent, factual
- **0.4 - 0.7**: Balanced (recommended for health advice)
- **0.8 - 1.2**: More creative and varied
- **1.3 - 2.0**: Very creative, unpredictable

### Max Tokens
- **500 tokens** ≈ 200 words (default, good for quick answers)
- **1000 tokens** ≈ 400 words (detailed explanations)
- **2000 tokens** ≈ 800 words (comprehensive guides)

### System Prompt
- Define the AI's personality
- Set expertise areas
- Guide response style
- Can be customized per provider

---

## 🎨 Current Setup

Your Gemini provider is pre-configured with:

```
Provider: Gemini
Model: gemini-2.5-flash
API Key: AIzaSyBUH3HZjwbIzMqrk-RfxqqK5iU9TRiRrw0
Temperature: 0.7
Max Tokens: 500
Status: Active ✅
```

This configuration is:
- ✅ Fast (gemini-2.5-flash is the fastest model)
- ✅ Free tier available (60 requests/minute)
- ✅ Optimized for health coaching
- ✅ Ready to use immediately

---

## 🔄 Adding More Providers

### To Add OpenAI (GPT):

1. Get API key from: https://platform.openai.com/api-keys
2. Go to Admin → AI Coach
3. Click "Add AI Provider"
4. Select "OpenAI (GPT)"
5. Paste your API key
6. Choose model (gpt-3.5-turbo recommended)
7. Save & Activate

### To Add Claude:

1. Get API key from: https://console.anthropic.com/
2. Go to Admin → AI Coach
3. Click "Add AI Provider"
4. Select "Anthropic Claude"
5. Paste your API key
6. Choose model (claude-3-haiku recommended)
7. Save & Activate

### To Add Custom Provider:

1. Have your API endpoint ready
2. Go to Admin → AI Coach
3. Click "Add AI Provider"
4. Select "Custom API"
5. Enter endpoint URL and API key
6. Configure model name and settings
7. Save & Activate

---

## 💡 Pro Tips

1. **Start with Gemini**
   - Free tier is generous
   - Fast responses
   - Great for development

2. **Use Multiple Providers**
   - Keep backups configured
   - Switch if one has issues
   - Compare response quality

3. **Customize System Prompts**
   - Tailor to your brand voice
   - Add specific expertise areas
   - Include disclaimers if needed

4. **Monitor Usage**
   - Check provider dashboards
   - Stay within free tiers
   - Upgrade when needed

5. **Test Before Activating**
   - Add new provider
   - Keep it inactive
   - Test in AI Coach page
   - Activate when satisfied

---

## 🐛 Troubleshooting

### Issue: "No active AI provider configured"
**Solution:**
- Go to Admin → AI Coach
- Click "Activate" on Gemini provider
- Or add a new provider and activate it

### Issue: AI not responding
**Solution:**
- Check Edge Function is deployed
- Verify API key is correct
- Check provider's API status
- Look at Edge Function logs

### Issue: Slow responses
**Solution:**
- Switch to a faster model (e.g., gemini-2.5-flash)
- Reduce max_tokens to 300-500
- Check your internet connection

### Issue: Poor response quality
**Solution:**
- Try a more advanced model
- Adjust system prompt
- Increase max_tokens
- Adjust temperature

---

## 📱 How It Works

### User Flow:
1. User goes to `/app/ai-coach`
2. Types a health question
3. Message saved to `ai_chat_messages` table
4. Frontend calls Edge Function `ai-coach-memory`
5. Edge Function fetches active provider from `ai_coach_settings`
6. Calls appropriate AI API (Gemini/OpenAI/Claude)
7. Returns response to user
8. Response saved to database

### Admin Flow:
1. Admin goes to `/app/admin?tab=ai-coach`
2. Can view all configured providers
3. Add/edit/delete providers
4. Switch active provider instantly
5. Changes take effect immediately

---

## 🎓 API Provider Comparison

| Provider | Best For | Speed | Cost | Free Tier |
|----------|----------|-------|------|-----------|
| **Gemini** | Development, High volume | ⚡⚡⚡ Fast | 💰 Cheap | ✅ 60 req/min |
| **OpenAI GPT-3.5** | Cost-effective prod | ⚡⚡ Medium | 💰💰 Medium | ❌ Pay per use |
| **OpenAI GPT-4** | Best quality | ⚡ Slower | 💰💰💰 Expensive | ❌ Pay per use |
| **Claude Haiku** | Balance speed/quality | ⚡⚡⚡ Fast | 💰💰 Medium | ❌ Pay per use |
| **Claude Opus** | Complex reasoning | ⚡ Slower | 💰💰💰 Expensive | ❌ Pay per use |

---

## ✅ Deployment Checklist

- [ ] Run `create-ai-chat-table.sql` in Supabase
- [ ] Run `create-ai-settings-table.sql` in Supabase
- [ ] Deploy `ai-coach-memory` Edge Function
- [ ] Test at `/app/ai-coach`
- [ ] Check admin panel at `/app/admin?tab=ai-coach`
- [ ] Verify Gemini provider is active
- [ ] Try a test question
- [ ] (Optional) Add additional providers

---

## 🎉 You're All Set!

Once you complete the 3 deployment steps above, your AI Coach will be fully functional with:

- ✅ Multi-provider support (switch anytime)
- ✅ Admin panel for easy management
- ✅ Gemini AI pre-configured
- ✅ Conversation history
- ✅ Personalized responses
- ✅ Professional health coaching

**Your users can now get instant health advice powered by AI!** 🌱

---

## 📞 Need Help?

If you run into issues:
1. Check Edge Function logs in Supabase Dashboard
2. Verify API keys are correct
3. Ensure tables were created successfully
4. Test with different providers
5. Check browser console for errors

---

**Happy Coaching!** 🚀
