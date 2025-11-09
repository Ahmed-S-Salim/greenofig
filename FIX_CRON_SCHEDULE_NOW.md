# ✅ Fix Cron Schedule - Quick Guide

## Current Status
- ✅ Path is correct: `/home/u492735793/domains/greenofig.com/public_html/cron-generate-blog.php`
- ❌ Schedule is wrong: Runs every hour instead of once at 9 AM

## What to Change

### Job 1 (Monday):
- **Current**: `0 * * * 1` (runs every hour)
- **Change to**: `0 9 * * 1` (runs at 9 AM)

### Job 2 (Wednesday):
- **Current**: `0 * * * 3` (runs every hour)
- **Change to**: `0 9 * * 3` (runs at 9 AM)

### Job 3 (Friday):
- **Current**: `0 * * * 5` (runs every hour)
- **Change to**: `0 9 * * 5` (runs at 9 AM)

## How to Edit in Hostinger

1. Go to your Hostinger cron jobs page
2. For each job, click the **Edit** button (or icon)
3. Find the **Hour** field (currently shows `*`)
4. Change `*` to `9`
5. Save the job
6. Repeat for all 3 jobs

## Visual Guide

```
Minute  Hour  Day  Month  Weekday
   0      *     *     *       1      ❌ WRONG (every hour)
   0      9     *     *       1      ✅ CORRECT (9 AM only)
```

## After Editing - Verify

Your cron jobs should look like this:
```
0 9 * * 1 /usr/bin/php /home/u492735793/domains/greenofig.com/public_html/cron-generate-blog.php
0 9 * * 3 /usr/bin/php /home/u492735793/domains/greenofig.com/public_html/cron-generate-blog.php
0 9 * * 5 /usr/bin/php /home/u492735793/domains/greenofig.com/public_html/cron-generate-blog.php
```

## When Will It Run?

- **Monday** at 9:00 AM
- **Wednesday** at 9:00 AM
- **Friday** at 9:00 AM

Total: **3 blog posts per week** automatically generated

## Next Steps After Fixing

1. ✅ Edit all 3 cron jobs (change Hour to 9)
2. Test manual generation first (click "Generate Next" in Auto Scheduler)
3. Wait for next Monday/Wednesday/Friday at 9 AM
4. Check `/home/u492735793/domains/greenofig.com/public_html/cron-blog-log.txt` for results
