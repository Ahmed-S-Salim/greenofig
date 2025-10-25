-- Create site_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to site_content" ON site_content;
DROP POLICY IF EXISTS "Allow authenticated users to read site_content" ON site_content;
DROP POLICY IF EXISTS "Allow admins to insert site_content" ON site_content;
DROP POLICY IF EXISTS "Allow admins to update site_content" ON site_content;
DROP POLICY IF EXISTS "Allow admins to delete site_content" ON site_content;

-- Policy: Everyone can read site_content (for public FAQ page)
CREATE POLICY "Allow public read access to site_content"
ON site_content
FOR SELECT
TO public
USING (true);

-- Policy: Admins can insert site_content
CREATE POLICY "Allow admins to insert site_content"
ON site_content
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- Policy: Admins can update site_content
CREATE POLICY "Allow admins to update site_content"
ON site_content
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- Policy: Admins can delete site_content
CREATE POLICY "Allow admins to delete site_content"
ON site_content
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_site_content_updated_at ON site_content;

CREATE TRIGGER update_site_content_updated_at
    BEFORE UPDATE ON site_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON site_content TO anon;
GRANT ALL ON site_content TO authenticated;
