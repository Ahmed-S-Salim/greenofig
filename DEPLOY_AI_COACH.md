# Deploy AI Coach with Gemini API

## 🎯 Quick Setup (10 minutes)

### Step 1: Create Database Table

1. Open **Supabase SQL Editor**
2. Run the `create-ai-chat-table.sql` file
3. Verify the table was created

### Step 2: Get Your Gemini API Key

1. Go to https://ai.google.dev/
2. Click "Get API Key" or "Get Started"
3. Create a new project or select existing
4. Generate an API key
5. Copy the key (starts with `AIza...`)

### Step 3: Set Up Gemini API Key in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Project Settings** → **Edge Functions**
3. Click on **Secrets** or **Environment Variables**
4. Add a new secret:
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key (paste the key you copied)
5. Save

### Step 4: Deploy the Edge Function

**Option A: Using Supabase Dashboard (Easiest)**

1. Go to **Edge Functions** in Supabase Dashboard
2. Click "Create Function"
3. Name it: `ai-coach-memory`
4. Copy the entire content from `supabase/functions/ai-coach-memory/index.ts`
5. Paste it into the function editor
6. Click "Deploy"

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref xdzoikocriuvgkoenjqk

# Deploy the function
npx supabase functions deploy ai-coach-memory

# Set the secret
npx supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 5: Test the AI Coach

1. Navigate to `http://localhost:3000/app/ai-coach`
2. Try typing: "Give me a healthy breakfast idea"
3. You should get a response from Gemini! 🎉

## 🔍 Troubleshooting

### Error: "GEMINI_API_KEY is not set"

**Solution:**
- Make sure you added the secret in Supabase Dashboard
- Secret name must be exactly: `GEMINI_API_KEY`
- Redeploy the function after adding the secret

### Error: "Gemini API error: 400"

**Solution:**
- Check if your API key is valid
- Make sure you copied the full key (including `AIza`)
- Verify the key is active in Google AI Studio

### Error: "Function not found"

**Solution:**
- Verify the function name is exactly: `ai-coach-memory`
- Check the function is deployed
- Try refreshing the page

### Messages not saving

**Solution:**
- Run the `create-ai-chat-table.sql` migration
- Check user is logged in
- Check browser console for errors

## ✨ Features

The AI Coach now has:
- ✅ **Personalized responses** using user's name and profile
- ✅ **Conversation memory** - remembers last 10 messages
- ✅ **Health expertise** - nutrition, fitness, wellness advice
- ✅ **Safety filters** - Gemini's built-in content safety
- ✅ **Error handling** - graceful fallbacks
- ✅ **CORS enabled** - works from your frontend

## 📊 Gemini API Details

**Model Used:** `gemini-pro`
- Fast responses
- Free tier available
- Good for conversational AI
- 500 token max output (about 200 words)

**Settings:**
- Temperature: 0.7 (balanced creativity)
- Safety: Medium and above blocked
- Max tokens: 500

## 💰 Cost Estimate

**Gemini Free Tier:**
- 60 requests per minute
- Should be plenty for development and initial users

**Paid Tier:**
- Very affordable
- Pay per 1000 requests
- Check latest pricing: https://ai.google.dev/pricing

## 🚀 Going to Production

Before launching to users:

1. ✅ Add rate limiting to prevent abuse
2. ✅ Monitor function logs in Supabase
3. ✅ Set up error alerts
4. ✅ Test with various questions
5. ✅ Add user feedback mechanism

## 📝 Next Steps (Optional Enhancements)

1. **Add voice input/output**
2. **Image analysis** - analyze meal photos
3. **Scheduled check-ins** - daily motivation
4. **Progress tracking** - integrate with user goals
5. **Export chat history** - download as PDF
6. **Multi-language support**

## 🎯 Test Questions to Try

Once deployed, test with:
- "Give me a healthy breakfast idea"
- "Suggest a quick 15-minute workout"
- "How can I increase my energy levels?"
- "What's a good way to de-stress?"
- "How much water should I drink daily?"
- "Give me a meal plan for today"

The AI Coach is ready to help your users achieve their health goals! 🌱
