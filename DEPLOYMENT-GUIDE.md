# CORRECT DEPLOYMENT PROCESS

## THE PROBLEM
When rebuilding from source (`npm run build`), ALL files get regenerated with new hashes, 
even if the source code didn't change. This replaces the entire website instead of just 
updating the specific files that were modified.

## THE SOLUTION

### Step 1: Keep Working Version Safe
- **LOCKED VERSION**: `LOCKED-WORKING-VERSION-DO-NOT-DELETE.tar.gz`
- **LIVE VERSION**: `working_temp/dist/` (matches what's deployed)
- These should NEVER be overwritten accidentally

### Step 2: For Small Changes (FeaturesPage, SiteLayout, etc.)

DO NOT deploy the entire dist folder!

Instead:
1. Make changes to source files (e.g., src/pages/FeaturesPage.jsx)
2. Build: `npm run build`
3. Find which files changed (compare file sizes/dates)
4. Upload ONLY those specific files to server

Example:
```bash
# After build, check what changed:
ls -lh dist/assets/ | grep FeaturesPage
# Shows: FeaturesPage-ABC123.js (new hash)

# Upload ONLY this file:
scp -P 65002 dist/assets/FeaturesPage-ABC123.js u492735793@157.173.209.161:domains/greenofig.com/public_html/assets/

# Also need to update index.html if it references the new hash
```

### Step 3: Full Deployment (Only when necessary)
Only do full deployment when:
- Multiple pages changed
- Major updates across the site
- User explicitly requests it

## CURRENT STATE
- **Working Version**: working_temp/dist/ (index-BvIBwmWA.js)
- **Last Full Deploy**: Nov 3, 6:13 PM
- **Locked Backup**: LOCKED-WORKING-VERSION-DO-NOT-DELETE.tar.gz

## NEVER DO THIS
❌ Deploy entire dist folder for small changes
❌ Replace working version without backup
❌ Assume current src/ matches working dist/

## ALWAYS DO THIS  
✅ Keep LOCKED-WORKING-VERSION-DO-NOT-DELETE.tar.gz updated
✅ Deploy only changed files for small updates
✅ Test changes before full deployment
✅ Ask user before replacing entire site
