-- Add new columns to messages table for enhanced chat features

-- Add message_type column (text, offer, system, etc.)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';

-- Add offer_type column for tracking offer types
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS offer_type TEXT;

-- Add attachment_url column for future file attachments
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Add attachment_type column (image, file, document, etc.)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachment_type TEXT;

-- Create index on message_type for filtering
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

-- Create index on offer_type for analytics
CREATE INDEX IF NOT EXISTS idx_messages_offer_type ON messages(offer_type) WHERE offer_type IS NOT NULL;

COMMENT ON COLUMN messages.message_type IS 'Type of message: text, offer, system, etc.';
COMMENT ON COLUMN messages.offer_type IS 'Type of offer if message_type is offer: discount_10, discount_20, free_month, upgrade, trial';
COMMENT ON COLUMN messages.attachment_url IS 'URL to attached file (future feature)';
COMMENT ON COLUMN messages.attachment_type IS 'Type of attachment: image, file, document (future feature)';
