-- Add advanced settings columns to ai_coach_settings table

-- Rate Limiting & Usage
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS max_requests_per_user_per_day INTEGER DEFAULT 50;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS max_requests_per_user_per_hour INTEGER DEFAULT 10;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS enable_rate_limiting BOOLEAN DEFAULT true;

-- Response Quality
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS response_style TEXT DEFAULT 'balanced'; -- casual, balanced, professional, technical
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS response_length TEXT DEFAULT 'medium'; -- short, medium, long, comprehensive
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS enable_emojis BOOLEAN DEFAULT true;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en'; -- en, es, fr, de, etc.

-- Safety & Moderation
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS enable_content_filter BOOLEAN DEFAULT true;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS prohibited_topics TEXT[]; -- array of topics to avoid
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS medical_disclaimer BOOLEAN DEFAULT true;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS require_user_consent BOOLEAN DEFAULT false;

-- User Experience
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS welcome_message TEXT DEFAULT 'Hi! I''m your AI Health Coach. How can I help you today?';
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS suggested_questions TEXT[]; -- array of suggested questions
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS enable_typing_indicator BOOLEAN DEFAULT true;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS enable_message_history BOOLEAN DEFAULT true;

-- Integration & Advanced
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS enable_webhooks BOOLEAN DEFAULT false;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS data_retention_days INTEGER DEFAULT 90;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS enable_analytics BOOLEAN DEFAULT true;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS fallback_response TEXT DEFAULT 'I''m having trouble responding right now. Please try again in a moment!';

-- Performance Monitoring
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS max_response_time_ms INTEGER DEFAULT 10000;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS enable_caching BOOLEAN DEFAULT false;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS cache_duration_minutes INTEGER DEFAULT 60;

-- Conversation Management
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS max_conversation_length INTEGER DEFAULT 10; -- number of messages to remember
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS enable_context_memory BOOLEAN DEFAULT true;
ALTER TABLE ai_coach_settings ADD COLUMN IF NOT EXISTS conversation_timeout_minutes INTEGER DEFAULT 30;

COMMENT ON COLUMN ai_coach_settings.max_requests_per_user_per_day IS 'Maximum AI requests per user per day';
COMMENT ON COLUMN ai_coach_settings.response_style IS 'AI response style: casual, balanced, professional, technical';
COMMENT ON COLUMN ai_coach_settings.response_length IS 'Preferred response length: short, medium, long, comprehensive';
COMMENT ON COLUMN ai_coach_settings.prohibited_topics IS 'Topics the AI should avoid discussing';
COMMENT ON COLUMN ai_coach_settings.suggested_questions IS 'Questions to suggest to users';
COMMENT ON COLUMN ai_coach_settings.data_retention_days IS 'How long to keep conversation history';
COMMENT ON COLUMN ai_coach_settings.max_conversation_length IS 'Number of previous messages to include in context';
