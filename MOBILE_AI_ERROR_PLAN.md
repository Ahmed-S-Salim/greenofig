# Mobile Responsiveness & AI Error Monitor Implementation Plan

## Problem 1: Mobile Layout Issues ❌

**Issues Found:**
1. Tab navigation overflows on mobile - can't see all tabs
2. Tables require horizontal scrolling to see Edit/Delete buttons
3. Content doesn't adapt to mobile screens

**Solution:**
1. ✅ Made tab navigation horizontally scrollable with better touch support
2. 🔄 Create responsive component that shows:
   - Tables on desktop (≥768px)
   - Cards on mobile (<768px) with actions always visible
3. Add mobile-first CSS classes

## Problem 2: AI Error Monitoring & Auto-Fix ❌

**Requested Feature:**
- Admin dashboard panel to view all app errors
- AI agent that can analyze errors and suggest fixes
- Ability to ask AI to automatically fix errors

**Implementation Plan:**

### Step 1: Error Logging Infrastructure
```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_type VARCHAR(100),
  component_name VARCHAR(255),
  user_id UUID REFERENCES user_profiles(id),
  user_agent TEXT,
  url TEXT,
  severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'fixed', 'ignored'
  ai_analysis JSONB, -- Store AI's analysis
  ai_fix_suggestion TEXT, -- Store AI's suggested fix
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
```

### Step 2: Global Error Handler
- Catch all React errors via ErrorBoundary
- Catch all unhandled promise rejections
- Catch all window.onerror events
- Send to Supabase

### Step 3: Admin Error Monitor Panel
Components to create:
- `ErrorMonitorPanel.jsx` - Main panel with error list
- `ErrorDetailDialog.jsx` - Shows full error details
- `AiErrorAnalyzer.jsx` - AI integration component

Features:
- Real-time error list with filters (severity, status, date)
- Error details view
- "Analyze with AI" button - sends error to Claude API
- "Apply AI Fix" button - creates a PR or shows code to copy
- Mark as fixed/ignored

### Step 4: AI Integration
Using Anthropic Claude API:
```javascript
const analyzeError = async (error) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Analyze this error and suggest a fix:

Error: ${error.message}
Stack: ${error.stack}
Component: ${error.component}

Provide:
1. Root cause analysis
2. Suggested fix with code
3. Prevention tips`
      }]
    })
  });
  return response.json();
};
```

## Implementation Steps

### Phase 1: Mobile Responsive (ASAP) ⚡
1. ✅ Fix tab navigation
2. Create ResponsiveTable component
3. Update User Management to use ResponsiveTable
4. Update other admin tables
5. Test on mobile

### Phase 2: AI Error Monitor (Next) 🤖
1. Create database migration for error_logs table
2. Create ErrorLogger service
3. Create ErrorMonitorPanel component
4. Add AI analysis integration
5. Test error capturing and AI suggestions

Would you like me to:
A) Implement both parts now (will take longer)
B) Deploy mobile fixes first, then add AI error monitor
C) Just focus on AI error monitor first

**Recommendation:** Option B - Deploy mobile fixes immediately (users can use dashboard now), then add AI error monitor as an enhancement.
