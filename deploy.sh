#!/bin/bash

# GreenoFig Deployment Script for Hostinger
# This script builds and deploys your app to Hostinger via SSH

set -e  # Exit on any error

echo "🚀 Starting GreenoFig Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration - Hostinger Settings for greenofig.com
SSH_USER="u492735793"                   # Your Hostinger SSH username
SSH_HOST="157.173.209.161"              # Your Hostinger server IP
SSH_PORT="65002"                        # Your SSH port
REMOTE_PATH="~/public_html"             # Path to your website root

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  SSH User: $SSH_USER"
echo "  SSH Host: $SSH_HOST"
echo "  Remote Path: $REMOTE_PATH"
echo ""

# Step 1: Build the project
echo -e "${BLUE}🔨 Step 1: Building project...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed! dist folder not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully${NC}"
echo ""

# Step 2: Create backup on server
echo -e "${BLUE}💾 Step 2: Creating backup on server...${NC}"
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "cd public_html && mkdir -p ../backups && tar -czf ../backups/$BACKUP_NAME.tar.gz . 2>/dev/null || true"
echo -e "${GREEN}✓ Backup created: $BACKUP_NAME${NC}"
echo ""

# Step 3: Deploy to Hostinger
echo -e "${BLUE}🌐 Step 3: Deploying to Hostinger...${NC}"
rsync -avz --delete \
    -e "ssh -p $SSH_PORT" \
    --progress \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.env' \
    dist/ $SSH_USER@$SSH_HOST:$REMOTE_PATH/

echo -e "${GREEN}✓ Files uploaded successfully${NC}"
echo ""

# Step 4: Set proper permissions
echo -e "${BLUE}🔒 Step 4: Setting permissions...${NC}"
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "cd $REMOTE_PATH && find . -type f -exec chmod 644 {} \; && find . -type d -exec chmod 755 {} \;"
echo -e "${GREEN}✓ Permissions set${NC}"
echo ""

# Step 5: Clear cache (if Cloudflare or similar is used)
echo -e "${BLUE}🧹 Step 5: Clearing browser cache hint...${NC}"
echo "  Visit: https://greenofig.com and press Ctrl+Shift+R"
echo ""

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🎉 Your site is live at: https://greenofig.com${NC}"
echo ""
echo "📝 Next steps:"
echo "  1. Visit https://greenofig.com"
echo "  2. Press Ctrl+Shift+R to hard refresh"
echo "  3. Test the survey page: https://greenofig.com/survey"
echo ""
echo "💡 If you see a blank page:"
echo "  1. Open browser console (F12)"
echo "  2. Look for CSP errors"
echo "  3. Clear cache completely: Ctrl+Shift+Delete"
echo "  4. Try incognito mode: Ctrl+Shift+N"
echo ""
