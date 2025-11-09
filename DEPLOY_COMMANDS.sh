#!/bin/bash

# GreenoFig Quick Deployment Commands
# Run these commands one by one in Git Bash

echo "=========================================="
echo "  GreenoFig Deployment to Hostinger"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

SSH_CMD="ssh -p 65002 u492735793@157.173.209.161"
REMOTE_PATH="domains/greenofig.com/public_html"

echo -e "${BLUE}Step 1: Testing SSH connection...${NC}"
$SSH_CMD "echo 'SSH connection successful!'"

if [ $? -ne 0 ]; then
    echo "SSH connection failed! Please check your credentials."
    exit 1
fi

echo -e "${GREEN}✓ SSH connected${NC}"
echo ""

echo -e "${BLUE}Step 2: Creating backup on server...${NC}"
$SSH_CMD "cd domains/greenofig.com && tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz public_html/"
echo -e "${GREEN}✓ Backup created${NC}"
echo ""

echo -e "${BLUE}Step 3: Creating deployment archive...${NC}"
tar -czf dist-deploy.tar.gz -C dist .
echo -e "${GREEN}✓ Archive created: dist-deploy.tar.gz${NC}"
echo ""

echo -e "${BLUE}Step 4: Uploading to server (this may take a minute)...${NC}"
scp -P 65002 dist-deploy.tar.gz u492735793@157.173.209.161:~/dist-deploy.tar.gz
echo -e "${GREEN}✓ Files uploaded${NC}"
echo ""

echo -e "${BLUE}Step 5: Extracting files on server...${NC}"
$SSH_CMD "cd $REMOTE_PATH && rm -rf assets/ *.html *.js *.css *.png *.txt *.xml 2>/dev/null || true"
$SSH_CMD "cd $REMOTE_PATH && tar -xzf ~/dist-deploy.tar.gz"
$SSH_CMD "rm ~/dist-deploy.tar.gz"
echo -e "${GREEN}✓ Files extracted${NC}"
echo ""

echo -e "${BLUE}Step 6: Setting permissions...${NC}"
$SSH_CMD "cd $REMOTE_PATH && find . -type f -exec chmod 644 {} \;"
$SSH_CMD "cd $REMOTE_PATH && find . -type d -exec chmod 755 {} \;"
echo -e "${GREEN}✓ Permissions set${NC}"
echo ""

echo -e "${BLUE}Step 7: Verifying deployment...${NC}"
$SSH_CMD "cd $REMOTE_PATH && ls -la | head -10"
echo ""

echo -e "${GREEN}=========================================="
echo -e "  ✅ Deployment Complete!"
echo -e "==========================================${NC}"
echo ""
echo "🎉 Your site is live at: https://greenofig.com"
echo ""
echo "Next steps:"
echo "1. Visit https://greenofig.com"
echo "2. Press Ctrl+Shift+R to hard refresh"
echo "3. Test the survey: https://greenofig.com/survey"
echo "4. Check all 9 questions appear"
echo "5. Verify plan recommendation works"
echo ""

# Cleanup
rm -f dist-deploy.tar.gz
echo "Local deployment file cleaned up."
echo ""
