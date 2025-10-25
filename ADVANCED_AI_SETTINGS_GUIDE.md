# Advanced AI Coach Settings - Complete Guide

## 🎯 Overview

You now have comprehensive control over your AI Coach with **6 categories** of advanced settings organized in easy-to-use tabs.

---

## 📋 Setup Instructions

### Step 1: Run the Database Migration

```sql
-- Run this in Supabase SQL Editor
update-ai-settings-advanced.sql
```

This adds all the advanced settings columns to your `ai_coach_settings` table.

### Step 2: Access Advanced Settings

1. Go to **Admin Dashboard** → **AI Coach** tab
2. Find your AI provider in the table
3. Click the **⚙️ Settings** button
4. Configure each tab according to your needs

---

## 🔧 Settings Categories Explained

### 1. ⚡ Rate Limiting & Usage Controls

**Purpose:** Prevent abuse and control API costs

**Settings:**
- **Enable Rate Limiting** (Recommended: ON)
  - Prevents users from spamming requests
  - Controls your API costs
  - Professional behavior

- **Max Requests Per User/Day** (Recommended: 50)
  - Free users: 20-50
  - Premium users: 100-200
  - Unlimited: 500+

- **Max Requests Per User/Hour** (Recommended: 10)
  - Prevents rapid-fire spam
  - Allows genuine conversations
  - Stops abuse patterns

**Best Practices:**
```
Free Tier:
- 30 requests/day
- 5 requests/hour

Basic Plan:
- 50 requests/day
- 10 requests/hour

Premium Plan:
- 100 requests/day
- 20 requests/hour

Enterprise:
- Unlimited or very high (500/day)
```

**Why This Matters:**
- **Cost Control:** Each AI request costs money
- **Fair Usage:** Prevents one user from monopolizing
- **Quality:** Encourages thoughtful questions
- **Scaling:** Predictable costs as you grow

---

### 2. ✨ Response Quality & Style

**Purpose:** Control how the AI communicates

**Settings:**

**Response Style:**
- 😊 **Casual & Friendly** - "Hey! Let's get you healthy!"
  - Use for: Young audience, fitness apps
  - Tone: Fun, energetic, lots of emojis

- ⚖️ **Balanced** (Recommended) - "I'm here to help you achieve your goals"
  - Use for: General audience
  - Tone: Professional yet warm

- 👔 **Professional** - "I recommend a balanced nutrition plan"
  - Use for: Medical professionals, clinical
  - Tone: Formal, evidence-based

- 🔬 **Technical & Detailed** - "Based on nutritional science..."
  - Use for: Researchers, advanced users
  - Tone: Scientific, detailed

**Response Length:**
- 📝 **Short (50-100 words)** - Quick tips
  - Use for: Mobile users, quick questions
  - Example: "Try oatmeal with berries!"

- 📄 **Medium (100-200 words)** (Recommended)
  - Use for: Most questions
  - Example: Full breakfast recipe + benefits

- 📖 **Long (200-400 words)** - Detailed guidance
  - Use for: Complex questions
  - Example: Complete meal plan explanation

- 📚 **Comprehensive (400+ words)** - In-depth answers
  - Use for: Research, education
  - Example: Full nutritional analysis

**Language:**
- 🇺🇸 English (default)
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇸🇦 Arabic

**Enable Emojis:**
- ✅ ON (Recommended for health/wellness)
  - Makes responses friendly
  - Increases engagement
  - Modern feel

- ❌ OFF
  - More professional
  - Corporate feel
  - Medical/clinical use

**Recommendation:**
```
Health & Wellness App:
- Style: Balanced
- Length: Medium
- Emojis: ON
- Language: English (or user preference)
```

---

### 3. 🛡️ Safety & Moderation

**Purpose:** Protect users and your liability

**Settings:**

**Enable Content Filter** (Recommended: ON)
- Blocks inappropriate content
- Prevents harmful advice
- Required for public apps

**Medical Disclaimer** (Recommended: ON)
- Shows disclaimer about consulting doctors
- Protects you legally
- Professional standard

**Prohibited Topics:**
Add topics the AI should refuse to discuss:
- ✅ "Prescription medications"
- ✅ "Self-diagnosis of diseases"
- ✅ "Medical procedures"
- ✅ "Supplements dosages"
- ✅ "Treatment of conditions"
- ✅ "Pregnancy medical advice"

**Example Prohibited Topics:**
```
Medical:
- "diagnosing conditions"
- "prescribing medication"
- "medical procedures"
- "interpreting lab results"

Dangerous:
- "extreme diets"
- "unverified supplements"
- "bypassing doctor advice"
```

**Safety Best Practices:**
1. **Always** keep content filtering ON
2. **Always** show medical disclaimer
3. **Add** prohibited topics for liability
4. **Review** AI responses regularly
5. **Update** as new issues arise

**Legal Protection:**
```
Disclaimer Example:
"This AI provides general wellness information only.
Always consult qualified healthcare professionals
for medical advice, diagnosis, or treatment."
```

---

### 4. 💬 User Experience

**Purpose:** Customize the conversation flow

**Settings:**

**Welcome Message:**
```
Examples:

Friendly:
"Hi! 👋 I'm your AI Health Coach.
Ready to crush your wellness goals?"

Professional:
"Welcome. I'm here to provide personalized
health and nutrition guidance."

Motivational:
"Let's make today the start of your
transformation! How can I help?"
```

**Suggested Questions:**
Add 4-6 questions to prompt users:
```
Nutrition:
- "Give me a healthy breakfast idea"
- "What should I eat before a workout?"
- "Plan a balanced meal for me"

Fitness:
- "Suggest a quick 15-minute workout"
- "How can I build muscle at home?"
- "What exercises help with flexibility?"

Wellness:
- "How can I improve my sleep quality?"
- "Tips for reducing stress naturally"
- "How to stay motivated long-term?"
```

**Enable Typing Indicator** (Recommended: ON)
- Shows "..." while AI thinks
- Better UX
- Professional feel

**Enable Message History** (Recommended: ON)
- Remembers past conversations
- Provides context
- Better responses

**Recommendation:**
```
Best UX Setup:
✅ Warm, personalized welcome message
✅ 5-6 diverse suggested questions
✅ Typing indicator ON
✅ Message history ON
```

---

### 5. 📈 Performance & Optimization

**Purpose:** Speed and reliability

**Settings:**

**Max Response Time (ms):**
- 5000ms (5s) - Very fast, may timeout complex questions
- 10000ms (10s) - **Recommended** - Good balance
- 15000ms (15s) - Allows complex responses
- 30000ms (30s) - Very patient, rarely timeouts

**Max Conversation Length:**
- 5 messages - Short context, less cost
- **10 messages** - **Recommended** - Good memory
- 20 messages - Long context, better continuity
- 50 messages - Entire conversation remembered

**Conversation Timeout (minutes):**
- 15 min - Aggressive cleanup
- **30 min** - **Recommended** - Normal chat session
- 60 min - Long sessions
- 1440 min (24h) - All-day context

**Enable Caching:**
- ✅ ON - Faster responses, lower costs
  - Cache common questions
  - Instant answers for popular queries
  - Reduces API calls

- ❌ OFF - Always fresh, slower
  - Every response unique
  - Higher costs
  - More personalized

**Cache Duration (if enabled):**
- 30 min - Fresh responses
- **60 min** - **Recommended** - Balance
- 180 min (3h) - Longer cache
- 1440 min (24h) - All day

**Enable Context Memory:**
- ✅ ON - AI remembers conversation
- ❌ OFF - Each question standalone

**Recommendations:**
```
High-Traffic App (cost-sensitive):
- Response Time: 10000ms
- Conversation Length: 10
- Timeout: 30 min
- Caching: ON (60 min)
- Context Memory: ON

Low-Traffic App (quality-focused):
- Response Time: 15000ms
- Conversation Length: 20
- Timeout: 60 min
- Caching: OFF
- Context Memory: ON
```

---

### 6. 🌐 Integration & Data

**Purpose:** Connect with other services

**Settings:**

**Fallback Response:**
```
Examples:

Friendly:
"Oops! I'm having a moment.
Try again in a sec? 😊"

Professional:
"I apologize for the delay.
Please try again momentarily."

Helpful:
"I'm experiencing technical difficulties.
While I recover, check out our FAQ!"
```

**Enable Webhooks:**
- Send notifications when users chat
- Integrate with CRM
- Track conversations externally

**Webhook URL:**
```
Example: https://yourdomain.com/webhooks/ai-chat

Payload includes:
{
  "user_id": "uuid",
  "message": "User's question",
  "response": "AI's answer",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Data Retention (days):**
- 30 days - Minimal storage
- **90 days** - **Recommended** - Good balance
- 180 days - Half year
- 365 days - Full year
- 0 days - Delete immediately (privacy-focused)

**Enable Analytics:**
- ✅ ON - Track usage, improve service
- ❌ OFF - Privacy-focused, no tracking

**Use Cases:**
```
GDPR-Compliant:
- Retention: 90 days
- Webhooks: OFF
- Analytics: ON (anonymized)

Enterprise Integration:
- Retention: 365 days
- Webhooks: ON
- Analytics: ON
- Webhook: Internal CRM
```

---

## 💡 Recommended Configurations

### For Small Health & Wellness App

```
Rate Limiting:
✅ Enabled: true
- 50 requests/day
- 10 requests/hour

Quality:
- Style: Balanced
- Length: Medium
- Emojis: ON
- Language: English

Safety:
✅ Content Filter: ON
✅ Medical Disclaimer: ON
- Prohibited: prescription drugs, diagnosis

UX:
- Welcome: Friendly message
- 5 suggested questions
- Typing indicator: ON
- History: ON

Performance:
- Timeout: 10000ms
- Conversation: 10 messages
- Caching: ON (60 min)
- Context: ON

Integration:
- Fallback: Friendly message
- Webhooks: OFF
- Retention: 90 days
- Analytics: ON
```

### For Premium/Enterprise

```
Rate Limiting:
✅ Enabled: true
- 200 requests/day
- 30 requests/hour

Quality:
- Style: Professional
- Length: Long
- Emojis: Optional
- Language: Multi-language

Safety:
✅ Content Filter: ON
✅ Medical Disclaimer: ON
✅ Comprehensive prohibited list

UX:
- Welcome: Personalized
- Custom questions
- All features ON

Performance:
- Timeout: 15000ms
- Conversation: 20 messages
- Caching: OFF (personalized)
- Context: ON

Integration:
- Webhooks: ON
- CRM integration
- Retention: 365 days
- Full analytics
```

### For Clinical/Medical Use

```
Rate Limiting:
- Moderate limits

Quality:
- Style: Professional
- Length: Comprehensive
- Emojis: OFF
- Language: Professional

Safety:
✅ Maximum restrictions
✅ Extensive prohibited topics
✅ Clear disclaimers
- Regular review required

UX:
- Professional welcome
- Evidence-based questions

Performance:
- High quality over speed
- Long context
- No caching (unique responses)

Integration:
- HIPAA-compliant webhooks
- Audit logging
- Long retention
```

---

## 🎯 Quick Start Checklist

After running the migration:

1. **Go to Admin → AI Coach**
2. **Click ⚙️ Settings** on your active provider
3. **Configure each tab:**
   - [ ] Rate Limiting (enable + set limits)
   - [ ] Quality (style + length)
   - [ ] Safety (enable filters + add topics)
   - [ ] UX (welcome + suggested questions)
   - [ ] Performance (timeouts + caching)
   - [ ] Integration (fallback + retention)
4. **Click "Save All Settings"**
5. **Test the AI Coach** with various questions

---

## 🚀 Impact of Settings

### User Experience:
- **Welcome Message** → First impression
- **Suggested Questions** → Engagement rate
- **Response Style** → User satisfaction
- **Emojis** → Perceived friendliness

### Business Metrics:
- **Rate Limiting** → Cost control
- **Caching** → Response speed + costs
- **Analytics** → Usage insights
- **Retention** → Compliance + insights

### Safety & Legal:
- **Content Filter** → User protection
- **Disclaimers** → Legal protection
- **Prohibited Topics** → Liability control
- **Data Retention** → Compliance

---

## 📊 Monitoring & Optimization

### What to Track:
1. **Usage Patterns**
   - Peak hours
   - Popular questions
   - User satisfaction

2. **Performance**
   - Average response time
   - Timeout rate
   - Cache hit rate

3. **Costs**
   - API calls per day
   - Cost per conversation
   - ROI on caching

### Optimization Tips:
1. Start conservative, expand based on data
2. Monitor costs weekly
3. Adjust rate limits seasonally
4. Update prohibited topics based on feedback
5. A/B test response styles

---

## ✅ Summary

Your AI Coach now has **professional-grade** configuration options:

- ⚡ **Rate Limiting** - Control costs and prevent abuse
- ✨ **Quality Controls** - Perfect tone and style
- 🛡️ **Safety Features** - Protect users and yourself
- 💬 **UX Customization** - Engaging experience
- 📈 **Performance Tuning** - Fast and reliable
- 🌐 **Integration Ready** - Connect with your stack

**All configurable through an intuitive UI!** 🎉

---

**Ready to configure? Go to Admin → AI Coach → Click ⚙️ Settings!**
