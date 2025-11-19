-- Migration: Community Features
-- Created: 2025-11-12
-- Purpose: Success stories, challenges, achievements, leaderboards

-- Add community_points to user_profiles if not exists
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS community_points INTEGER DEFAULT 0;

-- Table: success_stories
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  weight_lost NUMERIC(5, 2), -- kg lost
  time_period_months INTEGER, -- How long it took
  before_photo_url TEXT,
  after_photo_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: story_likes
CREATE TABLE IF NOT EXISTS story_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES success_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Table: story_comments
CREATE TABLE IF NOT EXISTS story_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES success_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: community_challenges
CREATE TABLE IF NOT EXISTS community_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'steps', 'calories', 'workouts', 'meals', 'water', etc.
  goal_value INTEGER NOT NULL, -- Target value to achieve
  duration INTEGER NOT NULL, -- Duration in days
  difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  points_reward INTEGER DEFAULT 100,
  status TEXT DEFAULT 'active', -- 'upcoming', 'active', 'completed'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: challenge_participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'failed', 'abandoned'
  progress INTEGER DEFAULT 0, -- Current progress towards goal
  completed_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Table: achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '🏆', -- Emoji or icon identifier
  category TEXT NOT NULL, -- 'weight_loss', 'consistency', 'social', 'challenges', etc.
  requirement_type TEXT NOT NULL, -- 'weight_lost', 'days_logged', 'challenges_completed', etc.
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 50,
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: user_achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Add indexes
CREATE INDEX idx_success_stories_user_id ON success_stories(user_id);
CREATE INDEX idx_success_stories_status ON success_stories(status);
CREATE INDEX idx_success_stories_featured ON success_stories(is_featured) WHERE is_featured = true;
CREATE INDEX idx_success_stories_created ON success_stories(created_at DESC);

CREATE INDEX idx_story_likes_story_id ON story_likes(story_id);
CREATE INDEX idx_story_likes_user_id ON story_likes(user_id);

CREATE INDEX idx_community_challenges_status ON community_challenges(status);
CREATE INDEX idx_community_challenges_dates ON community_challenges(start_date, end_date);

CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX idx_challenge_participants_status ON challenge_participants(status);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_profiles_community_points ON user_profiles(community_points DESC);

-- Add RLS policies
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can view approved success stories
CREATE POLICY "Users can view approved success stories"
  ON success_stories
  FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid());

-- Users can create their own success stories
CREATE POLICY "Users can create own success stories"
  ON success_stories
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own pending stories
CREATE POLICY "Users can update own pending stories"
  ON success_stories
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

-- Users can like stories
CREATE POLICY "Users can like stories"
  ON story_likes
  FOR ALL
  USING (user_id = auth.uid());

-- Users can comment on stories
CREATE POLICY "Users can comment on stories"
  ON story_comments
  FOR ALL
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM success_stories WHERE id = story_id
  ));

-- Everyone can view active challenges
CREATE POLICY "Everyone can view challenges"
  ON community_challenges
  FOR SELECT
  USING (status = 'active' OR status = 'upcoming');

-- Users can join and update their challenge participation
CREATE POLICY "Users can manage own challenge participation"
  ON challenge_participants
  FOR ALL
  USING (user_id = auth.uid());

-- Everyone can view achievements
CREATE POLICY "Everyone can view achievements"
  ON achievements
  FOR SELECT
  USING (true);

-- Users can view their own achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can manage all community content
CREATE POLICY "Admins can manage success stories"
  ON success_stories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can manage challenges"
  ON community_challenges
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Add comments
COMMENT ON TABLE success_stories IS 'User success stories with before/after photos';
COMMENT ON TABLE community_challenges IS 'Community challenges (7-day, 30-day health goals)';
COMMENT ON TABLE achievements IS 'Achievement badges users can earn';
COMMENT ON TABLE user_achievements IS 'Achievements earned by users';

-- Add updated_at triggers
CREATE TRIGGER trigger_update_success_stories_updated_at
  BEFORE UPDATE ON success_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_community_challenges_updated_at
  BEFORE UPDATE ON community_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points_reward, rarity) VALUES
('First Steps', 'Log your first meal', '🎯', 'consistency', 'meals_logged', 1, 10, 'common'),
('Week Warrior', 'Log meals for 7 consecutive days', '📅', 'consistency', 'consecutive_days', 7, 50, 'common'),
('Month Master', 'Log meals for 30 consecutive days', '📆', 'consistency', 'consecutive_days', 30, 200, 'rare'),
('5kg Victor', 'Lose 5kg of weight', '⚖️', 'weight_loss', 'weight_lost_kg', 5, 100, 'common'),
('10kg Champion', 'Lose 10kg of weight', '🏆', 'weight_loss', 'weight_lost_kg', 10, 250, 'epic'),
('Challenge Rookie', 'Complete your first challenge', '🎖️', 'challenges', 'challenges_completed', 1, 50, 'common'),
('Challenge Master', 'Complete 5 challenges', '💪', 'challenges', 'challenges_completed', 5, 300, 'epic'),
('Social Butterfly', 'Share 10 success stories', '🦋', 'social', 'stories_shared', 10, 150, 'rare'),
('Motivator', 'Get 50 likes on your success story', '❤️', 'social', 'story_likes_received', 50, 200, 'rare'),
('Hydration Hero', 'Log 2L of water for 7 days', '💧', 'consistency', 'water_days', 7, 75, 'common')
ON CONFLICT DO NOTHING;

-- Insert sample challenges
INSERT INTO community_challenges (title, description, challenge_type, goal_value, duration, difficulty, points_reward, status, start_date, end_date) VALUES
('7-Day Hydration Challenge', 'Drink 2 liters of water every day for a week', 'water', 14, 7, 'easy', 100, 'active', NOW(), NOW() + INTERVAL '7 days'),
('30-Day Meal Logging', 'Log all your meals every day for 30 days', 'meals', 90, 30, 'medium', 500, 'active', NOW(), NOW() + INTERVAL '30 days'),
('10K Steps Daily', 'Walk 10,000 steps every day for 14 days', 'steps', 140000, 14, 'medium', 300, 'active', NOW(), NOW() + INTERVAL '14 days'),
('Veggie Power Week', 'Eat 5+ servings of vegetables daily for 7 days', 'nutrition', 35, 7, 'easy', 150, 'active', NOW(), NOW() + INTERVAL '7 days'),
('No Sugar November', 'Avoid added sugars for 30 days', 'nutrition', 30, 30, 'hard', 1000, 'active', NOW(), NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;
