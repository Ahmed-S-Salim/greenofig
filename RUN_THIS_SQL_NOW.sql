-- ========================================
-- AUTO BLOG SCHEDULER - DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ========================================

-- Step 1: Create the content queue table
CREATE TABLE IF NOT EXISTS blog_content_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL,
    keywords TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'generated', 'failed')),
    priority INTEGER DEFAULT 0,
    generated_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_queue_status ON blog_content_queue(status);
CREATE INDEX IF NOT EXISTS idx_blog_queue_created_at ON blog_content_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_queue_priority ON blog_content_queue(priority DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE blog_content_queue ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop old policy if exists and create new one
DROP POLICY IF EXISTS "Admins can manage blog content queue" ON blog_content_queue;

CREATE POLICY "Admins can manage blog content queue"
    ON blog_content_queue FOR ALL
    USING (true);

-- Step 5: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_blog_content_queue_updated_at ON blog_content_queue;

CREATE TRIGGER update_blog_content_queue_updated_at
    BEFORE UPDATE ON blog_content_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Insert 10 starter topics (only if queue is empty)
INSERT INTO blog_content_queue (topic, keywords, status, priority)
SELECT * FROM (VALUES
    ('The Ultimate Guide to AI Health Coaching', 'ai health coach, ai coaching app, personalized health', 'pending', 10),
    ('How to Lose Weight with Personalized Meal Plans', 'weight loss, meal planning, personalized nutrition', 'pending', 9),
    ('Complete Guide to Tracking Macros for Beginners', 'macro tracking, macronutrients, calorie counting', 'pending', 8),
    ('Best Foods for Muscle Building and Recovery', 'muscle building, protein foods, recovery nutrition', 'pending', 7),
    ('30-Day Fitness Challenge with AI Coaching', 'fitness challenge, 30 day workout, ai fitness', 'pending', 6),
    ('Intermittent Fasting: A Complete Guide', 'intermittent fasting, fasting benefits, weight loss', 'pending', 5),
    ('Sleep and Weight Loss: The Surprising Connection', 'sleep quality, weight loss, health habits', 'pending', 4),
    ('How to Stay Motivated on Your Health Journey', 'motivation, health goals, consistency', 'pending', 3),
    ('Understanding BMI and Body Composition', 'bmi calculator, body composition, health metrics', 'pending', 2),
    ('Meal Prep for Busy Professionals', 'meal prep, healthy eating, time management', 'pending', 1)
) AS v(topic, keywords, status, priority)
WHERE NOT EXISTS (SELECT 1 FROM blog_content_queue LIMIT 1);

-- Step 7: Verify setup
SELECT
    COUNT(*) as total_topics,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'generated') as generated
FROM blog_content_queue;

-- Show all topics
SELECT id, topic, status, priority, created_at
FROM blog_content_queue
ORDER BY priority DESC;
