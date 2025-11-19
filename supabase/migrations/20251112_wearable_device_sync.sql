-- Migration: Wearable Device Sync Tables
-- Created: 2025-11-12
-- Purpose: Support wearable device integration (Fitbit, Apple Health, Google Fit, Garmin, etc.)

-- Table: wearable_connections
-- Stores OAuth tokens and connection status for wearable devices
CREATE TABLE IF NOT EXISTS wearable_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL, -- 'fitbit', 'google-fit', 'apple-health', 'garmin', etc.
  device_name TEXT NOT NULL,
  access_token TEXT, -- Encrypted OAuth access token
  refresh_token TEXT, -- Encrypted OAuth refresh token
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT[], -- Permissions granted (steps, heart_rate, sleep, etc.)
  device_user_id TEXT, -- User ID from the wearable platform
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- Table: wearable_sync_history
-- Tracks all sync operations and imported data
CREATE TABLE IF NOT EXISTS wearable_sync_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'manual', 'auto', 'scheduled'
  sync_status TEXT NOT NULL, -- 'success', 'failed', 'partial'
  records_imported INTEGER DEFAULT 0,
  stats JSONB, -- { steps: 8543, calories: 2345, activeMinutes: 45, avgHeartRate: 72 }
  error_message TEXT,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: wearable_activity_data
-- Stores daily activity data from wearable devices
CREATE TABLE IF NOT EXISTS wearable_activity_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id) ON DELETE SET NULL,
  device_id TEXT NOT NULL,
  activity_date DATE NOT NULL,
  steps INTEGER DEFAULT 0,
  distance_meters NUMERIC(10, 2) DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,
  sedentary_minutes INTEGER DEFAULT 0,
  floors_climbed INTEGER DEFAULT 0,
  elevation_gain_meters NUMERIC(10, 2) DEFAULT 0,
  raw_data JSONB, -- Store complete response from wearable API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_id, activity_date)
);

-- Table: wearable_heart_rate_data
-- Stores heart rate data from wearable devices
CREATE TABLE IF NOT EXISTS wearable_heart_rate_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id) ON DELETE SET NULL,
  device_id TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  heart_rate INTEGER NOT NULL, -- BPM
  heart_rate_zone TEXT, -- 'resting', 'fat_burn', 'cardio', 'peak'
  is_resting BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_id, recorded_at)
);

-- Table: wearable_sleep_data
-- Stores sleep tracking data from wearable devices
CREATE TABLE IF NOT EXISTS wearable_sleep_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id) ON DELETE SET NULL,
  device_id TEXT NOT NULL,
  sleep_date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_minutes INTEGER NOT NULL,
  deep_sleep_minutes INTEGER DEFAULT 0,
  light_sleep_minutes INTEGER DEFAULT 0,
  rem_sleep_minutes INTEGER DEFAULT 0,
  awake_minutes INTEGER DEFAULT 0,
  sleep_quality_score INTEGER, -- 0-100
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_id, sleep_date)
);

-- Table: wearable_workout_data
-- Stores workout/exercise sessions from wearable devices
CREATE TABLE IF NOT EXISTS wearable_workout_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id) ON DELETE SET NULL,
  device_id TEXT NOT NULL,
  workout_type TEXT NOT NULL, -- 'run', 'walk', 'bike', 'swim', 'strength', etc.
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER DEFAULT 0,
  distance_meters NUMERIC(10, 2) DEFAULT 0,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  avg_pace NUMERIC(10, 2), -- minutes per km
  elevation_gain_meters NUMERIC(10, 2) DEFAULT 0,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_wearable_connections_user_id ON wearable_connections(user_id);
CREATE INDEX idx_wearable_connections_device_id ON wearable_connections(device_id);
CREATE INDEX idx_wearable_connections_last_sync ON wearable_connections(last_sync_at);

CREATE INDEX idx_wearable_sync_history_user_id ON wearable_sync_history(user_id);
CREATE INDEX idx_wearable_sync_history_synced_at ON wearable_sync_history(synced_at DESC);

CREATE INDEX idx_wearable_activity_user_date ON wearable_activity_data(user_id, activity_date DESC);
CREATE INDEX idx_wearable_activity_device ON wearable_activity_data(device_id);

CREATE INDEX idx_wearable_heart_rate_user_time ON wearable_heart_rate_data(user_id, recorded_at DESC);

CREATE INDEX idx_wearable_sleep_user_date ON wearable_sleep_data(user_id, sleep_date DESC);

CREATE INDEX idx_wearable_workout_user_time ON wearable_workout_data(user_id, start_time DESC);
CREATE INDEX idx_wearable_workout_type ON wearable_workout_data(workout_type);

-- Add RLS policies
ALTER TABLE wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_activity_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_heart_rate_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_sleep_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_workout_data ENABLE ROW LEVEL SECURITY;

-- Users can manage their own wearable connections
CREATE POLICY "Users can manage own wearable connections"
  ON wearable_connections
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own sync history"
  ON wearable_sync_history
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own activity data"
  ON wearable_activity_data
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own heart rate data"
  ON wearable_heart_rate_data
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own sleep data"
  ON wearable_sleep_data
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own workout data"
  ON wearable_workout_data
  FOR SELECT
  USING (user_id = auth.uid());

-- Super admins can view all wearable data for support purposes
CREATE POLICY "Super admins can view all wearable connections"
  ON wearable_connections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Add comments
COMMENT ON TABLE wearable_connections IS 'OAuth connections to wearable devices (Fitbit, Apple Health, Google Fit, Garmin)';
COMMENT ON TABLE wearable_sync_history IS 'History of all sync operations with wearable devices';
COMMENT ON TABLE wearable_activity_data IS 'Daily activity metrics from wearable devices (steps, calories, distance)';
COMMENT ON TABLE wearable_heart_rate_data IS 'Heart rate measurements from wearable devices';
COMMENT ON TABLE wearable_sleep_data IS 'Sleep tracking data from wearable devices';
COMMENT ON TABLE wearable_workout_data IS 'Workout/exercise sessions from wearable devices';

-- Add updated_at triggers
CREATE TRIGGER trigger_update_wearable_connections_updated_at
  BEFORE UPDATE ON wearable_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_wearable_activity_updated_at
  BEFORE UPDATE ON wearable_activity_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_wearable_workout_updated_at
  BEFORE UPDATE ON wearable_workout_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
