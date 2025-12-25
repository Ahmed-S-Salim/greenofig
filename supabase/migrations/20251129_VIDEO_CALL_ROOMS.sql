-- Video Call Rooms Table
-- Stores information about video call sessions

CREATE TABLE IF NOT EXISTS video_call_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id TEXT UNIQUE NOT NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended', 'cancelled')),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0,
    recording_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Call Participants Table
-- Tracks who joined which call and when

CREATE TABLE IF NOT EXISTS video_call_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES video_call_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    connection_quality TEXT DEFAULT 'good',
    device_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Call Events Table
-- Logs events during calls for analytics

CREATE TABLE IF NOT EXISTS video_call_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES video_call_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'join', 'leave', 'mute', 'unmute',
        'video_on', 'video_off', 'screen_share_start',
        'screen_share_stop', 'connection_issue', 'reconnect'
    )),
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_video_call_rooms_appointment ON video_call_rooms(appointment_id);
CREATE INDEX IF NOT EXISTS idx_video_call_rooms_host ON video_call_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_video_call_rooms_status ON video_call_rooms(status);
CREATE INDEX IF NOT EXISTS idx_video_call_participants_room ON video_call_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_video_call_participants_user ON video_call_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_video_call_events_room ON video_call_events(room_id);

-- Enable RLS
ALTER TABLE video_call_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_call_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_call_rooms
CREATE POLICY "Users can view their own calls"
    ON video_call_rooms FOR SELECT
    USING (host_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Hosts can create video call rooms"
    ON video_call_rooms FOR INSERT
    WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update their video call rooms"
    ON video_call_rooms FOR UPDATE
    USING (host_id = auth.uid());

-- RLS Policies for video_call_participants
CREATE POLICY "Users can view participants in their calls"
    ON video_call_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM video_call_rooms
            WHERE id = video_call_participants.room_id
            AND (host_id = auth.uid() OR client_id = auth.uid())
        )
    );

CREATE POLICY "Users can join calls"
    ON video_call_participants FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
    ON video_call_participants FOR UPDATE
    USING (user_id = auth.uid());

-- RLS Policies for video_call_events
CREATE POLICY "Users can view events in their calls"
    ON video_call_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM video_call_rooms
            WHERE id = video_call_events.room_id
            AND (host_id = auth.uid() OR client_id = auth.uid())
        )
    );

CREATE POLICY "Users can log their own events"
    ON video_call_events FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Function to automatically update room duration when call ends
CREATE OR REPLACE FUNCTION update_video_call_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ended' AND OLD.status = 'active' AND NEW.started_at IS NOT NULL THEN
        NEW.ended_at = NOW();
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NOW() - NEW.started_at))::INTEGER;
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating duration
DROP TRIGGER IF EXISTS video_call_duration_trigger ON video_call_rooms;
CREATE TRIGGER video_call_duration_trigger
    BEFORE UPDATE ON video_call_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_video_call_duration();

-- Grant necessary permissions
GRANT ALL ON video_call_rooms TO authenticated;
GRANT ALL ON video_call_participants TO authenticated;
GRANT ALL ON video_call_events TO authenticated;

-- Enable Realtime for video call signaling
ALTER PUBLICATION supabase_realtime ADD TABLE video_call_rooms;

COMMENT ON TABLE video_call_rooms IS 'Stores video call room information for native WebRTC calls';
COMMENT ON TABLE video_call_participants IS 'Tracks participants in video calls';
COMMENT ON TABLE video_call_events IS 'Logs events during video calls for analytics';
