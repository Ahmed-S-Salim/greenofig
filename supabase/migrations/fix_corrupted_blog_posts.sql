-- Fix corrupted blog posts that have JSON/markdown code showing
-- This cleans posts created before the content cleaning fixes

DO $$
DECLARE
    post_record RECORD;
    cleaned_content TEXT;
    json_data JSONB;
BEGIN
    -- Loop through all blog posts
    FOR post_record IN
        SELECT id, title, content, content_format
        FROM blog_posts
        WHERE content LIKE '%```json%'
           OR content LIKE '%{"title":%'
           OR content LIKE '%"content":%'
    LOOP
        cleaned_content := post_record.content;

        -- Try to extract content from JSON if present
        IF cleaned_content ~ '^\s*```json' THEN
            -- Remove opening ```json
            cleaned_content := regexp_replace(cleaned_content, '^\s*```json\s*', '');
            -- Remove closing ```
            cleaned_content := regexp_replace(cleaned_content, '\s*```\s*$', '');
        END IF;

        -- If it's a JSON object, try to parse it
        IF cleaned_content ~ '^\s*\{' AND cleaned_content ~ '\}\s*$' THEN
            BEGIN
                json_data := cleaned_content::JSONB;

                -- Extract the actual content from the JSON
                IF json_data ? 'content' THEN
                    cleaned_content := json_data->>'content';

                    -- Update the post with cleaned content
                    UPDATE blog_posts
                    SET
                        content = cleaned_content,
                        content_format = 'markdown',
                        updated_at = NOW()
                    WHERE id = post_record.id;

                    RAISE NOTICE 'Cleaned post: %', post_record.title;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Could not parse JSON for post: %', post_record.title;
            END;
        END IF;
    END LOOP;

    RAISE NOTICE 'Blog post cleanup completed!';
END $$;
