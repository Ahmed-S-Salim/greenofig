#!/bin/bash

# 🚀 GreenoFig Automated Deployment Script
# Version: 2.0
# Date: November 23, 2025
# Author: Development Team

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server Configuration
SERVER_HOST="157.173.209.161"
SERVER_PORT="65002"
SERVER_USER="u492735793"
SERVER_PATH="domains/greenofig.com"
SSH_CMD="ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST}"
SCP_CMD="scp -P ${SERVER_PORT}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   GreenoFig Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Find Latest Tarball
echo -e "${YELLOW}[1/6] Finding latest deployment tarball...${NC}"

TARBALL=$(ls -t greenofig-deploy-*.tar.gz 2>/dev/null | head -1)

if [ -z "$TARBALL" ]; then
    echo -e "${RED}❌ Error: No deployment tarball found${NC}"
    echo -e "${YELLOW}Please run ./build-production.sh first${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found tarball: ${TARBALL}${NC}"

TARBALL_SIZE=$(du -sh ${TARBALL} | cut -f1)
echo -e "${GREEN}✓ Size: ${TARBALL_SIZE}${NC}"

# Step 2: Test SSH Connection
echo ""
echo -e "${YELLOW}[2/6] Testing server connection...${NC}"

if ! ${SSH_CMD} "echo 'Connection successful'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Cannot connect to server${NC}"
    echo -e "${YELLOW}Please check your SSH credentials and network connection${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Server connection successful${NC}"

# Step 3: Upload Tarball
echo ""
echo -e "${YELLOW}[3/6] Uploading tarball to server...${NC}"

UPLOAD_START=$(date +%s)

${SCP_CMD} ${TARBALL} ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

UPLOAD_END=$(date +%s)
UPLOAD_TIME=$((UPLOAD_END - UPLOAD_START))

echo -e "${GREEN}✓ Upload completed in ${UPLOAD_TIME} seconds${NC}"

# Step 4: Backup Current Deployment
echo ""
echo -e "${YELLOW}[4/6] Backing up current deployment...${NC}"

BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)

${SSH_CMD} << EOF
cd ${SERVER_PATH}
if [ -d "public_html" ]; then
    mv public_html public_html.backup.${BACKUP_TIMESTAMP}
    echo "✓ Backup created: public_html.backup.${BACKUP_TIMESTAMP}"
else
    echo "⚠ No existing deployment to backup"
fi
EOF

echo -e "${GREEN}✓ Backup complete${NC}"

# Step 5: Deploy New Build
echo ""
echo -e "${YELLOW}[5/6] Deploying new build...${NC}"

${SSH_CMD} << 'EOF'
cd domains/greenofig.com

# Create new public_html directory
mkdir -p public_html

# Extract tarball
TARBALL=$(ls -t greenofig-deploy-*.tar.gz | head -1)
tar -xzf ${TARBALL} -C public_html/

# Set permissions
chmod -R 755 public_html/
find public_html -type f -exec chmod 644 {} \;

# Create .htaccess
cat > public_html/.htaccess << 'HTACCESS_END'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_headers.c>
  # Cache busting
  Header set X-Deployment-Time "$(date +%Y-%m-%d-%H:%M:%S)"

  # Cache static assets for 1 year
  <FilesMatch "\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  # Cache CSS and JS for 1 year
  <FilesMatch "\.(css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  # Don't cache HTML files
  <FilesMatch "\.(html|htm)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
  </FilesMatch>

  # Security headers
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Block access to sensitive files
<FilesMatch "^\.">
  Order allow,deny
  Deny from all
</FilesMatch>

# Prevent directory browsing
Options -Indexes
HTACCESS_END

# Cleanup tarball
rm ${TARBALL}

echo "✓ Deployment complete"
echo "✓ Files deployed to public_html/"
echo "✓ .htaccess configured"
echo "✓ Permissions set"
echo "✓ Tarball cleaned up"
EOF

echo -e "${GREEN}✓ Deployment successful${NC}"

# Step 6: Verify Deployment
echo ""
echo -e "${YELLOW}[6/6] Verifying deployment...${NC}"

# Check if site is accessible
if curl -I -s https://greenofig.com | grep -q "200"; then
    echo -e "${GREEN}✓ Site is accessible (HTTP 200)${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Could not verify site accessibility${NC}"
fi

# Check if Service Worker is accessible
if curl -I -s https://greenofig.com/sw.js | grep -q "200"; then
    echo -e "${GREEN}✓ Service Worker is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Service Worker not found${NC}"
fi

# Get deployment info from server
echo ""
echo -e "${BLUE}Deployment Info:${NC}"

${SSH_CMD} << 'EOF'
cd domains/greenofig.com/public_html

# Count files
HTML_COUNT=$(find . -name "*.html" | wc -l)
JS_COUNT=$(find assets -name "*.js" 2>/dev/null | wc -l)
CSS_COUNT=$(find assets -name "*.css" 2>/dev/null | wc -l)

# Total size
TOTAL_SIZE=$(du -sh . | cut -f1)

echo "  • HTML files: ${HTML_COUNT}"
echo "  • JavaScript files: ${JS_COUNT}"
echo "  • CSS files: ${CSS_COUNT}"
echo "  • Total size: ${TOTAL_SIZE}"
EOF

# Final Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   ✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${BLUE}Deployment Summary:${NC}"
echo -e "  • Tarball: ${TARBALL} (${TARBALL_SIZE})"
echo -e "  • Upload time: ${UPLOAD_TIME} seconds"
echo -e "  • Backup: public_html.backup.${BACKUP_TIMESTAMP}"
echo -e "  • Site URL: ${GREEN}https://greenofig.com${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Test the live site: ${GREEN}https://greenofig.com${NC}"
echo -e "  2. Check mobile responsiveness"
echo -e "  3. Verify Service Worker registration"
echo -e "  4. Test login/signup flow"
echo -e "  5. Monitor for any errors"
echo ""
echo -e "${YELLOW}Rollback (if needed):${NC}"
echo -e "  ${SSH_CMD} 'cd ${SERVER_PATH} && rm -rf public_html && mv public_html.backup.${BACKUP_TIMESTAMP} public_html'"
echo ""
echo -e "${BLUE}========================================${NC}"
