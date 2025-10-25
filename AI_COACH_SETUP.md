# AI Coach Setup Guide

## ✅ What's Already Implemented

The AI Coach UI is fully built and working! It includes:
- Chat interface with message history
- Suggested prompts
- Real-time messaging
- Database persistence
- User authentication

## 🔧 What You Need to Set Up

### Step 1: Create the Database Table

1. Open Supabase SQL Editor
2. Run the `create-ai-chat-table.sql` file
3. This creates the `ai_chat_messages` table with RLS policies

### Step 2: Create Supabase Edge Function

You need to create an Edge Function called `ai-coach-memory` that integrates with an AI API.

#### Option A: Using OpenAI (Recommended)

1. In your Supabase Dashboard, go to **Edge Functions**
2. Create a new function named `ai-coach-memory`
3. Use this code:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const openAIKey = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  try {
    const { messages, userProfile } = await req.json()

    // Build conversation context
    const conversationMessages = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))

    // Add system prompt
    const systemPrompt = {
      role: 'system',
      content: `You are a friendly and knowledgeable health and wellness coach for GreenoFig.
      The user's name is ${userProfile?.full_name || 'friend'}.
      Provide personalized health advice, meal suggestions, workout tips, and motivation.
      Keep responses concise, friendly, and actionable. Use emojis occasionally to be engaging.`
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [systemPrompt, ...conversationMessages],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    const data = await response.json()
    const reply = data.choices[0].message.content

    return new Response(
      JSON.stringify({ reply }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

4. Set up your OpenAI API key as a secret:
   - Go to **Project Settings** → **Edge Functions** → **Secrets**
   - Add: `OPENAI_API_KEY` = your OpenAI API key

#### Option B: Using Claude AI (Anthropic)

Replace the OpenAI code with Claude:

```typescript
const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': anthropicKey,
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-3-haiku-20240307',
    max_tokens: 300,
    system: `You are a friendly health coach for GreenoFig...`,
    messages: conversationMessages,
  }),
})

const data = await response.json()
const reply = data.content[0].text
```

#### Option C: Mock Response (For Testing)

If you just want to test without an AI API:

```typescript
serve(async (req) => {
  try {
    const { messages, userProfile } = await req.json()
    const lastMessage = messages[messages.length - 1]?.text || ''

    // Simple mock responses
    const mockResponses = {
      'breakfast': '🍳 Here\'s a healthy breakfast idea: Greek yogurt with berries, granola, and a drizzle of honey. Add some chia seeds for extra omega-3s!',
      'workout': '💪 Try this quick 15-min workout:\n- 2 min jumping jacks\n- 3 min squats\n- 3 min push-ups\n- 3 min plank\n- 2 min cool down stretches\n- 2 min burpees',
      'energy': '⚡ To boost energy:\n- Drink more water\n- Take short walks\n- Eat protein-rich snacks\n- Get 7-8 hours sleep\n- Reduce caffeine after 2pm',
      'stress': '🧘 Destress with:\n- 5-min meditation\n- Deep breathing exercises\n- Light yoga\n- Nature walk\n- Listen to calming music',
      'default': `That's a great question, ${userProfile?.full_name?.split(' ')[0]}! As your health coach, I'd recommend focusing on consistency. Small daily habits make the biggest difference. What specific area would you like to improve? 🎯`
    }

    // Find matching response
    let reply = mockResponses.default
    for (const [key, value] of Object.entries(mockResponses)) {
      if (lastMessage.toLowerCase().includes(key)) {
        reply = value
        break
      }
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### Step 3: Deploy the Edge Function

```bash
# Deploy the function
supabase functions deploy ai-coach-memory

# Or if using Supabase CLI locally
npx supabase functions deploy ai-coach-memory
```

## 🎯 How It Works

1. User types a message and hits send
2. Message is saved to `ai_chat_messages` table
3. Last 10 messages + user profile sent to Edge Function
4. Edge Function calls AI API (OpenAI/Claude/etc)
5. AI response is returned and saved to database
6. Chat UI updates with the response

## 🔍 Testing

1. Run the SQL migration to create the table
2. Deploy your Edge Function (with mock responses for quick testing)
3. Navigate to `/app/ai-coach` in your app
4. Try typing one of the suggested prompts
5. You should see a response!

## 💡 Features You Can Add

- Voice input/output
- Image analysis (meal photos)
- Workout video recommendations
- Progress tracking integration
- Scheduled check-ins
- Export chat history

## 🐛 Troubleshooting

**Error: Table doesn't exist**
- Run the `create-ai-chat-table.sql` migration

**Error: Function not found**
- Deploy the Edge Function
- Check the function name matches 'ai-coach-memory'

**Error: AI not responding**
- Check Edge Function logs in Supabase
- Verify API keys are set correctly
- Try the mock response version first

**Messages not saving**
- Check RLS policies
- Verify user is authenticated
- Check browser console for errors

## 📱 Current UI Features

- ✅ Chat history persistence
- ✅ Suggested prompts for new users
- ✅ Loading states
- ✅ Error handling
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ Keyboard shortcuts (Enter to send)

The AI Coach is production-ready once you set up the Edge Function! 🚀
