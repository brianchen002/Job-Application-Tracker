#!/bin/bash

# Job Application Tracker - Setup Verification Script
# Run this script to verify your installation is correct

echo "🔍 Job Application Tracker - Setup Verification"
echo "================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check Node.js
echo -n "Checking Node.js version... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    ERRORS=$((ERRORS + 1))
fi

# Check node_modules
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
else
    echo -e "${YELLOW}⚠${NC} node_modules not found - run 'npm install'"
    WARNINGS=$((WARNINGS + 1))
fi

# Check .env
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env exists"
else
    echo -e "${YELLOW}⚠${NC} .env not found - copy from .env.example"
    WARNINGS=$((WARNINGS + 1))
fi

# Check Prisma Client
echo -n "Checking Prisma Client... "
if [ -d "node_modules/.prisma/client" ] || [ -d "node_modules/@prisma/client" ]; then
    echo -e "${GREEN}✓${NC} Prisma Client generated"
else
    echo -e "${YELLOW}⚠${NC} Prisma Client not generated - run 'npx prisma generate'"
    WARNINGS=$((WARNINGS + 1))
fi

# Check database
echo -n "Checking database... "
if [ -f "prisma/dev.db" ]; then
    echo -e "${GREEN}✓${NC} Database exists"
else
    echo -e "${YELLOW}⚠${NC} Database not found - run 'npx prisma migrate dev'"
    WARNINGS=$((WARNINGS + 1))
fi

# Check migrations
echo -n "Checking migrations... "
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo -e "${GREEN}✓${NC} Migrations exist"
else
    echo -e "${YELLOW}⚠${NC} Migrations not found - run 'npx prisma migrate dev'"
    WARNINGS=$((WARNINGS + 1))
fi

# Check build
echo -n "Checking if project builds... "
if [ -d ".next" ]; then
    echo -e "${GREEN}✓${NC} .next directory exists"
else
    echo -e "${YELLOW}⚠${NC} Not built yet - run 'npm run build' to test"
    WARNINGS=$((WARNINGS + 1))
fi

# Check key files
echo ""
echo "Checking key files:"
FILES=(
    "app/layout.tsx"
    "app/(dashboard)/dashboard/page.tsx"
    "app/(dashboard)/import/page.tsx"
    "app/api/jobs/route.ts"
    "prisma/schema.prisma"
    "lib/auth.ts"
    "lib/prisma.ts"
    "README.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file missing"
        ERRORS=$((ERRORS + 1))
    fi
done

# Summary
echo ""
echo "================================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "You're ready to go. Run 'npm run dev' to start."
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup incomplete - $WARNINGS warning(s)${NC}"
    echo ""
    echo "Recommended next steps:"
    [ ! -d "node_modules" ] && echo "  1. npm install"
    [ ! -f ".env" ] && echo "  2. cp .env.example .env"
    [ ! -f "prisma/dev.db" ] && echo "  3. npx prisma migrate dev"
    [ ! -d ".next" ] && echo "  4. npm run build (optional - to test)"
    echo ""
    echo "Then run 'npm run dev' to start."
else
    echo -e "${RED}✗ Setup has $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Please fix the errors above before proceeding."
fi

exit $ERRORS
