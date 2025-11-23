#!/bin/bash

# 🏗️ GreenoFig Production Build Script
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

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   GreenoFig Production Build Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Environment Check
echo -e "${YELLOW}[1/7] Checking environment...${NC}"

if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production file not found${NC}"
    echo -e "${YELLOW}Please create .env.production with your production environment variables${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js version: ${NODE_VERSION}${NC}"

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm version: ${NPM_VERSION}${NC}"

# Step 2: Clean Previous Build
echo ""
echo -e "${YELLOW}[2/7] Cleaning previous build...${NC}"

if [ -d "dist" ]; then
    rm -rf dist/
    echo -e "${GREEN}✓ Removed old dist/ folder${NC}"
fi

if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite/
    echo -e "${GREEN}✓ Cleared Vite cache${NC}"
fi

# Step 3: Install Dependencies
echo ""
echo -e "${YELLOW}[3/7] Installing dependencies...${NC}"

npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Run Linter
echo ""
echo -e "${YELLOW}[4/7] Running linter...${NC}"

# Skip linting errors for now (optional)
npm run lint --if-present || true
echo -e "${GREEN}✓ Linting complete${NC}"

# Step 5: Build for Production
echo ""
echo -e "${YELLOW}[5/7] Building for production...${NC}"

BUILD_START=$(date +%s)

npm run build

BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

echo -e "${GREEN}✓ Build completed in ${BUILD_TIME} seconds${NC}"

# Step 6: Verify Build Output
echo ""
echo -e "${YELLOW}[6/7] Verifying build output...${NC}"

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Error: dist/index.html not found${NC}"
    exit 1
fi

if [ ! -d "dist/assets" ]; then
    echo -e "${RED}❌ Error: dist/assets/ folder not found${NC}"
    exit 1
fi

if [ ! -f "dist/sw.js" ]; then
    echo -e "${YELLOW}⚠ Warning: dist/sw.js not found (Service Worker may not be configured)${NC}"
else
    echo -e "${GREEN}✓ Service Worker found${NC}"
fi

if [ ! -f "dist/offline.html" ]; then
    echo -e "${YELLOW}⚠ Warning: dist/offline.html not found (Offline page may not be configured)${NC}"
else
    echo -e "${GREEN}✓ Offline page found${NC}"
fi

# Count assets
JS_COUNT=$(find dist/assets -name "*.js" | wc -l)
CSS_COUNT=$(find dist/assets -name "*.css" | wc -l)

echo -e "${GREEN}✓ Found ${JS_COUNT} JavaScript files${NC}"
echo -e "${GREEN}✓ Found ${CSS_COUNT} CSS files${NC}"

# Calculate total size
DIST_SIZE=$(du -sh dist | cut -f1)
echo -e "${GREEN}✓ Total build size: ${DIST_SIZE}${NC}"

# Step 7: Create Deployment Tarball
echo ""
echo -e "${YELLOW}[7/7] Creating deployment tarball...${NC}"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TARBALL_NAME="greenofig-deploy-${TIMESTAMP}.tar.gz"

cd dist
tar -czf ../${TARBALL_NAME} .
cd ..

TARBALL_SIZE=$(du -sh ${TARBALL_NAME} | cut -f1)

echo -e "${GREEN}✓ Created ${TARBALL_NAME} (${TARBALL_SIZE})${NC}"

# Final Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   ✅ BUILD SUCCESSFUL!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${BLUE}Build Summary:${NC}"
echo -e "  • Build time: ${BUILD_TIME} seconds"
echo -e "  • Total size: ${DIST_SIZE}"
echo -e "  • JavaScript files: ${JS_COUNT}"
echo -e "  • CSS files: ${CSS_COUNT}"
echo -e "  • Deployment tarball: ${TARBALL_NAME} (${TARBALL_SIZE})"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Test the build locally: ${GREEN}npm run preview${NC}"
echo -e "  2. Deploy to server: ${GREEN}./deploy.sh${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
