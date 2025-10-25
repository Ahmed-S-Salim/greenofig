# Website Management System - Complete Guide

## Overview

You've successfully implemented a comprehensive **Website Content Management System** with the following features:

### New Managers Added:
1. **Homepage Manager** - Manage homepage sections (hero, features, CTAs, stats, process)
2. **Testimonials Manager** - Customer reviews, ratings, and social proof
3. **Contact Info Manager** - Contact details, social media, business hours
4. **SEO Manager** - Meta tags, Open Graph, Twitter Cards for all pages

### Enhanced Database:
- 6 new tables for website content
- Activity logging and audit trails
- Row Level Security (RLS) policies
- Automated triggers and functions

---

## Table of Contents

1. [Database Setup](#database-setup)
2. [Homepage Manager](#homepage-manager)
3. [Testimonials Manager](#testimonials-manager)
4. [Contact Info Manager](#contact-info-manager)
5. [SEO Manager](#seo-manager)
6. [Integration](#integration)
7. [Testing Guide](#testing-guide)
8. [Common Issues](#common-issues)

---

## Database Setup

### Step 1: Run SQL Migration

1. Open Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open `WEBSITE_ENHANCEMENTS.sql` from your project root
4. Click **Run** to execute the migration

### What Gets Created:

**Tables:**
- `homepage_content` - Homepage sections management
- `testimonials` - Customer reviews and ratings
- `contact_info` - Contact information (single record)
- `navigation_menus` - Header/footer navigation (future use)
- `seo_settings` - SEO for all pages
- `media_library` - Centralized media management (future use)
- `website_activity_log` - Audit trail for all changes

**Functions:**
- `get_website_statistics()` - Dashboard statistics
- `get_testimonials_by_rating()` - Rating breakdown
- `increment_media_usage()` - Track media usage
- `update_website_updated_at()` - Auto-update timestamps
- `log_website_activity()` - Activity logging

**Triggers:**
- Auto-update `updated_at` on all tables
- Activity logging on INSERT/UPDATE/DELETE
- Automatic audit trail

**Default Data:**
- Contact information template
- Default SEO settings for main pages (/, /features, /pricing, etc.)
- Sample homepage sections
- Sample testimonials

### Step 2: Verify Installation

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('homepage_content', 'testimonials', 'contact_info', 'seo_settings');

-- Verify default data
SELECT * FROM seo_settings;
SELECT * FROM contact_info;
SELECT * FROM homepage_content;
SELECT * FROM testimonials;
```

---

## Homepage Manager

**Location:** `http://localhost:3000/app/admin?tab=website` → Click "Homepage"

### Features:

- **Section Types:**
  - Hero - Main banner with title, subtitle, description, CTA
  - Features - Key features overview
  - CTA - Call-to-action sections
  - Stats - Statistics and numbers
  - Process - How it works steps

- **Content Fields:**
  - Title, subtitle, description
  - Multiple images (main, background, video)
  - CTA button (text, link, style)
  - Colors (background, text)

- **Display Settings:**
  - Active/inactive toggle
  - Display order (drag to reorder)
  - Section ordering

### Usage Example:

1. Click **"Add Section"**
2. Select Section Type: **Hero**
3. Fill in:
   ```
   Title: Transform Your Health with AI
   Subtitle: Your Personal Health Companion
   Description: Get personalized nutrition and fitness guidance...
   CTA Text: Get Started Free
   CTA Link: /signup
   ```
4. Click **"Save Section"**
5. Use up/down arrows to reorder sections
6. Toggle eye icon to show/hide sections

### Best Practices:

- Keep hero sections above the fold
- Use high-quality images (1920x1080 for backgrounds)
- Limit to 3-5 main sections on homepage
- Test CTAs lead to correct pages
- Keep descriptions concise (under 200 characters)

---

## Testimonials Manager

**Location:** `http://localhost:3000/app/admin?tab=website` → Click "Testimonials"

### Features:

- **Customer Information:**
  - Name, title/role, company
  - Avatar image
  - Location

- **Review Content:**
  - Quote (main testimonial)
  - Full review (optional extended version)
  - Star rating (1-5)

- **Verification:**
  - Verified badge
  - Source (website, Google, Trustpilot, App Store)
  - Source URL for proof

- **Categorization:**
  - Category (nutrition, fitness, wellness, general)
  - Featured toggle
  - Display order

- **Statistics Dashboard:**
  - Total testimonials
  - Featured count
  - Average rating

- **Filtering:**
  - Search by name/quote
  - Filter by category
  - Filter by rating

### Usage Example:

1. Click **"Add Testimonial"**
2. Fill in Customer Info:
   ```
   Name: Sarah Johnson
   Title: Fitness Enthusiast
   Location: San Francisco, CA
   Avatar URL: https://example.com/avatar.jpg
   ```
3. Add Review:
   ```
   Quote: GreenoFig completely changed how I approach nutrition!
   Rating: 5 stars
   Category: Nutrition
   ```
4. Check **"Featured"** to show on homepage
5. Check **"Verified"** to add verification badge
6. Click **"Save Testimonial"**

### Best Practices:

- Get permission before posting customer reviews
- Include real names and locations for authenticity
- Feature diverse testimonials (different use cases)
- Update regularly with fresh reviews
- Aim for 4.5+ average rating display
- Include source URLs for credibility

---

## Contact Info Manager

**Location:** `http://localhost:3000/app/admin?tab=website` → Click "Contact Info"

### Features:

- **Contact Details:**
  - Email, phone
  - Full address (street, city, state, zip, country)

- **Business Hours:**
  - Hours for each day of the week
  - Timezone selection
  - Support for "Closed" days

- **Social Media:**
  - Facebook, Twitter, Instagram
  - LinkedIn, YouTube, TikTok

- **Other Links:**
  - Blog URL
  - Support URL
  - Privacy Policy URL
  - Terms of Service URL

### Usage:

1. Navigate to Contact Info Manager
2. Update all fields as needed
3. Set business hours for each day
4. Add social media profile URLs
5. Click **"Save All Changes"**

### Important Notes:

- Only ONE active contact info record exists
- Changes apply immediately across the site
- Email is required
- Use full URLs for social media (https://...)
- Business hours format: "9:00 AM - 5:00 PM" or "Closed"

---

## SEO Manager

**Location:** `http://localhost:3000/app/admin?tab=website` → Click "SEO Settings"

### Features:

- **Meta Tags:**
  - Title (60 characters recommended)
  - Description (160 characters recommended)
  - Keywords (array)

- **Open Graph (Social Media):**
  - OG Title, Description, Image
  - OG Type (website, article, product)

- **Twitter Card:**
  - Card type (summary, summary_large_image, etc.)
  - Twitter-specific title, description, image

- **Advanced Settings:**
  - Canonical URL
  - Robots meta (index/noindex, follow/nofollow)
  - Sitemap priority (0.0 to 1.0)
  - Change frequency

### Usage for Each Page:

1. Click **"Add Page"**
2. Set Page Info:
   ```
   Page Path: /about
   Page Name: About Us
   ```
3. Configure Meta Tags:
   ```
   Meta Title: About GreenoFig - Our Mission & Story
   Meta Description: Learn about GreenoFig's mission to make health accessible through AI technology.
   Keywords: health tech, AI wellness, nutrition coaching
   ```
4. Set Open Graph:
   ```
   OG Image URL: https://greenofig.com/og-about.jpg (1200x630px)
   ```
5. Configure Advanced:
   ```
   Robots: index,follow
   Sitemap Priority: 0.7
   Change Frequency: monthly
   ```
6. Click **"Save Settings"**

### SEO Best Practices:

**Meta Titles:**
- Include target keyword
- Keep under 60 characters
- Format: "Primary Keyword - Brand Name"
- Make each page unique

**Meta Descriptions:**
- Include call-to-action
- Keep 150-160 characters
- Include primary keyword naturally
- Make it compelling to click

**Keywords:**
- 3-5 keywords per page
- Focus on long-tail keywords
- Don't keyword stuff

**OG Images:**
- Use 1200x630px images
- Include text overlay with page title
- Ensure readable on mobile
- Test with Facebook Sharing Debugger

**Sitemap Priority:**
- Homepage: 1.0
- Main pages (Features, Pricing): 0.9
- Secondary pages (About, Contact): 0.7
- Blog posts: 0.6-0.8
- Archive pages: 0.4

---

## Integration

### Files Created:

```
src/components/admin/
├── HomepageManager.jsx          ✅ CREATED
├── TestimonialsManager.jsx      ✅ CREATED
├── ContactInfoManager.jsx       ✅ CREATED
└── SEOManager.jsx               ✅ CREATED

src/components/admin/
└── WebsiteManager.jsx           ✅ UPDATED (new manager cards added)

Root/
└── WEBSITE_ENHANCEMENTS.sql     ✅ CREATED (run in Supabase)
```

### WebsiteManager Integration:

The `WebsiteManager.jsx` now includes 8 manager cards:

1. Homepage Manager *(new)*
2. Features Manager *(existing)*
3. Pricing Manager *(existing)*
4. Testimonials Manager *(new)*
5. Contact Info Manager *(new)*
6. SEO Settings *(new)*
7. About Page *(existing)*
8. FAQ Page *(existing)*

### Access Points:

```
Admin Dashboard → Website Tab → Click any manager card
```

Direct URLs:
- Homepage: `?tab=website` → Homepage card
- Testimonials: `?tab=website` → Testimonials card
- Contact: `?tab=website` → Contact Info card
- SEO: `?tab=website` → SEO Settings card

---

## Testing Guide

### 1. Database Verification

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%homepage%'
OR table_name LIKE '%testimon%'
OR table_name LIKE '%contact%'
OR table_name LIKE '%seo%';

-- Verify RLS policies
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('homepage_content', 'testimonials', 'contact_info', 'seo_settings');

-- Test statistics function
SELECT * FROM get_website_statistics();
```

### 2. Homepage Manager Testing

- [ ] Navigate to Homepage Manager
- [ ] Create new hero section
- [ ] Add title, subtitle, description
- [ ] Upload/add images
- [ ] Add CTA button
- [ ] Save and verify appears in list
- [ ] Reorder sections using arrows
- [ ] Toggle active/inactive
- [ ] Edit existing section
- [ ] Delete section with confirmation

### 3. Testimonials Manager Testing

- [ ] View statistics cards (Total, Featured, Avg Rating)
- [ ] Create new testimonial
- [ ] Add customer info with avatar
- [ ] Set 5-star rating
- [ ] Mark as featured
- [ ] Mark as verified
- [ ] Save and verify
- [ ] Search testimonials
- [ ] Filter by category
- [ ] Filter by rating
- [ ] Edit testimonial
- [ ] Delete with confirmation

### 4. Contact Info Manager Testing

- [ ] Load existing contact info
- [ ] Update email and phone
- [ ] Set address fields
- [ ] Configure business hours for all days
- [ ] Add social media URLs
- [ ] Add other links (blog, support, privacy, terms)
- [ ] Save all changes
- [ ] Refresh page and verify saved

### 5. SEO Manager Testing

- [ ] View existing SEO pages
- [ ] Create new page SEO settings
- [ ] Add meta title (check character count)
- [ ] Add meta description (check character count)
- [ ] Add keywords as tags
- [ ] Configure Open Graph
- [ ] Add OG image URL
- [ ] Configure Twitter Card
- [ ] Set canonical URL
- [ ] Set robots meta
- [ ] Set sitemap priority and frequency
- [ ] Save and verify
- [ ] Edit existing page
- [ ] Search pages
- [ ] Toggle active/inactive
- [ ] Delete page

### 6. Integration Testing

- [ ] Access Website Manager
- [ ] See all 8 manager cards
- [ ] Click each card and verify it loads
- [ ] Use back button to return to main view
- [ ] Navigate between managers
- [ ] Verify HMR (Hot Module Replacement) works
- [ ] Check no console errors
- [ ] Test on different screen sizes

---

## Common Issues

### Issue: Tables not created

**Solution:**
```sql
-- Check if SQL ran successfully
SELECT COUNT(*) FROM homepage_content; -- Should not error

-- If error, re-run WEBSITE_ENHANCEMENTS.sql
```

### Issue: Permission denied errors

**Solution:**
- Verify you're logged in as admin user
- Check RLS policies in Supabase:
  ```sql
  SELECT * FROM user_profiles WHERE id = auth.uid();
  -- Should show role = 'admin' or 'super_admin'
  ```

### Issue: Components not loading

**Solution:**
1. Check browser console for errors
2. Verify file paths are correct
3. Restart dev server: `npm run dev`
4. Clear browser cache

### Issue: SEO settings not saving

**Solution:**
- Check page_path is unique
- Verify all required fields filled
- Check browser console for validation errors
- Ensure user has admin permissions

### Issue: Statistics showing zero

**Solution:**
```sql
-- Manually verify data exists
SELECT COUNT(*) FROM testimonials;
SELECT COUNT(*) FROM homepage_content;

-- Test function directly
SELECT * FROM get_website_statistics();
```

### Issue: Activity log not working

**Solution:**
```sql
-- Check triggers exist
SELECT tgname FROM pg_trigger WHERE tgname LIKE '%activity%';

-- Manually test function
SELECT * FROM website_activity_log ORDER BY created_at DESC LIMIT 10;
```

---

## Next Steps & Recommendations

### Immediate:

1. **Apply SQL Migration:**
   - Run `WEBSITE_ENHANCEMENTS.sql` in Supabase

2. **Test All Managers:**
   - Create test data in each manager
   - Verify CRUD operations work
   - Check permissions

3. **Configure Default Content:**
   - Set up contact information
   - Add SEO settings for main pages
   - Create initial testimonials
   - Design homepage sections

### Short-term:

1. **Frontend Integration:**
   - Connect Homepage to `homepage_content` table
   - Display testimonials on homepage/reviews page
   - Add contact info to footer
   - Implement SEO meta tags in page headers

2. **Navigation Manager:**
   - Build UI for managing header/footer menus
   - Allow dynamic menu creation
   - Support nested menu items

3. **Media Library:**
   - Create upload interface
   - Integrate with cloud storage (S3, Cloudinary)
   - Track media usage across site

### Long-term:

1. **Advanced Features:**
   - A/B testing for homepage sections
   - Testimonial import from review platforms
   - SEO audit and recommendations
   - Content versioning and rollback
   - Scheduled content publishing
   - Multi-language support

2. **Analytics Integration:**
   - Track homepage section performance
   - Monitor testimonial conversion rates
   - SEO ranking tracking
   - Content engagement metrics

3. **Automation:**
   - Auto-generate OG images
   - Scheduled sitemap generation
   - Automated SEO audits
   - Review reminder emails

---

## API Reference

### Get Website Statistics

```javascript
const { data, error } = await supabase.rpc('get_website_statistics');

// Returns:
{
  total_homepage_sections: 5,
  active_homepage_sections: 4,
  total_testimonials: 12,
  featured_testimonials: 4,
  total_media_files: 0,
  total_media_size_mb: 0,
  total_seo_pages: 6,
  recent_activities: 15
}
```

### Get Testimonials by Rating

```javascript
const { data, error } = await supabase.rpc('get_testimonials_by_rating');

// Returns:
[
  { rating: 5, count: 8, percentage: 66.67 },
  { rating: 4, count: 3, percentage: 25.00 },
  { rating: 3, count: 1, percentage: 8.33 }
]
```

### Query Homepage Sections

```javascript
const { data, error } = await supabase
  .from('homepage_content')
  .select('*')
  .eq('is_active', true)
  .order('section_order', { ascending: true });
```

### Query Active Testimonials

```javascript
const { data, error } = await supabase
  .from('testimonials')
  .select('*')
  .eq('is_active', true)
  .eq('is_featured', true)
  .order('display_order', { ascending: true })
  .limit(3);
```

### Get Contact Information

```javascript
const { data, error } = await supabase
  .from('contact_info')
  .select('*')
  .eq('is_active', true)
  .single();
```

### Get Page SEO Settings

```javascript
const { data, error } = await supabase
  .from('seo_settings')
  .select('*')
  .eq('page_path', '/about')
  .single();
```

---

## Support

For questions or issues:

1. Check this guide first
2. Review Supabase logs in Dashboard → Logs
3. Check browser console for errors
4. Verify SQL migration ran successfully
5. Test with a fresh admin user account

---

## Changelog

### Version 1.0.0 (Current)

**Added:**
- Homepage Manager with 5 section types
- Testimonials Manager with ratings and verification
- Contact Info Manager with social media integration
- SEO Manager with Open Graph and Twitter Cards
- 6 new database tables
- Activity logging and audit trails
- Statistics dashboard functions
- Comprehensive RLS policies
- Default data for quick start

**Database:**
- `homepage_content` table
- `testimonials` table
- `contact_info` table
- `navigation_menus` table (placeholder)
- `seo_settings` table
- `media_library` table (placeholder)
- `website_activity_log` table

**Components:**
- HomepageManager.jsx
- TestimonialsManager.jsx
- ContactInfoManager.jsx
- SEOManager.jsx
- WebsiteManager.jsx (updated)

---

## Credits

Built with:
- React + Vite
- Supabase (PostgreSQL)
- Radix UI Components
- Framer Motion
- Lucide Icons
- Tailwind CSS

---

**Documentation Version:** 1.0.0
**Last Updated:** 2025-10-18
**Author:** Claude (Anthropic)
