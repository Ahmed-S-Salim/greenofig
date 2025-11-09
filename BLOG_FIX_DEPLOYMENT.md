# Blog Rendering Fix - Deployment Guide

## Issue Summary
- **Old blog posts**: Showing HTML code instead of rendering
- **New AI blog posts**: Very wide (horizontal scrolling) with HTML/JSON visible
- **Root cause**: No differentiation between HTML vs Markdown content

## What Was Fixed

### 1. Content Format Detection
- Added `content_format` column to distinguish between 'html' (old) and 'markdown' (new)
- BlogPage now renders correctly based on content type
- Old posts display as HTML (as they were created)
- New AI posts parse markdown to beautiful HTML

### 2. Horizontal Scrolling Fixed
- Added `break-words` and `overflow-hidden` CSS classes
- Added `max-w-full` on images and pre blocks
- Added `whitespace-pre-wrap` on code elements
- Content now wraps properly on all screen sizes

### 3. Clean AI Content Generation
- Cron script now strips JSON artifacts
- Removes stray code blocks
- Removes HTML tags from AI output
- Saves pure markdown only

## Deployment Steps

### Step 1: Run SQL Migration in Supabase

1. Go to Supabase SQL Editor:
   ```
   https://xdzoikocriuvgkoenjqk.supabase.co/project/xdzoikocriuvgkoenjqk/sql/new
   ```

2. Copy and paste the entire content from:
   ```
   supabase/migrations/add_content_format_to_blog_posts.sql
   ```

3. Click "Run" - this will:
   - Add `content_format` column to `blog_posts` table
   - Mark all existing posts as 'html' format
   - Create index for performance

4. Verify success - you should see:
   ```
   "Successfully added content_format column to blog_posts"
   ```

### Step 2: Deploy Updated Files

Files ready in `dist/` folder. Deploy to Hostinger now!

## Testing After Deployment

### Test Old Posts (HTML format):
1. Go to any blog post created before today
2. Should display properly without HTML tags showing
3. No horizontal scrolling

### Test New Posts (Markdown format):
1. Go to Admin → Blog → Auto Scheduler
2. Click "Generate Next Blog Post"
3. Wait for generation to complete
4. View the new post
5. Should display with:
   - Beautiful headers (H1, H2, H3)
   - Properly formatted paragraphs
   - Bullet/numbered lists
   - Bold and italic text
   - No JSON or code blocks visible
   - No horizontal scrolling

### Test Content Width:
1. Open any blog post on mobile
2. Content should wrap and fit screen width
3. No horizontal scrolling required

## Key Changes Made

### BlogPage.jsx
- Fetches `content_format` field from database
- Conditionally renders:
  - `content_format === 'html'` → Direct HTML rendering
  - `content_format === 'markdown'` → Parse with `marked` library
- Added responsive CSS for proper wrapping

### cron-generate-blog.php
- Cleans AI output by removing:
  - JSON wrappers
  - Code block artifacts
  - Stray HTML tags
- Sets `content_format = 'markdown'`
- Logs content length for debugging

### Database
- New column: `content_format TEXT DEFAULT 'html'`
- Constraint: CHECK (content_format IN ('html', 'markdown'))
- Index: idx_blog_posts_content_format

## If Issues Persist

### Old posts still showing HTML:
Check if migration ran successfully:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'blog_posts'
AND column_name = 'content_format';
```

### New posts still broken:
Check cron log:
```bash
ssh to server
cat /domains/greenofig.com/public_html/cron-blog-log.txt
```

### Content still too wide:
Hard refresh browser: Ctrl + Shift + R

## Files Modified
1. `src/pages/BlogPage.jsx` - Added content format detection
2. `public/cron-generate-blog.php` - Added content cleaning
3. `supabase/migrations/add_content_format_to_blog_posts.sql` - New migration

## Files Built
- `dist/` - Ready to deploy
- `dist-blog-format-fix.tar.gz` - Package for deployment
