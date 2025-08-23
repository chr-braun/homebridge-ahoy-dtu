#!/bin/bash

# homebridge-ahoy-dtu Release Preparation Script
# Prepares the project for publishing to npm and GitHub

set -e

echo "🚀 homebridge-ahoy-dtu Release Preparation"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
fi

# Check if git repo is clean
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Git working directory is not clean. Uncommitted changes detected."
    echo "Committed changes:"
    git status --short
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_info "Step 1: Building project..."
npm run build
print_status "Build completed"

print_info "Step 2: Running release verification..."
npm run verify-release
print_status "Verification passed"

print_info "Step 3: Preparing npm README..."
# Use the production README for npm
if [ -f "README-npm-production.md" ]; then
    cp README.md README-github.md
    cp README-npm-production.md README.md
    print_status "Switched to npm README (GitHub README backed up)"
fi

print_info "Step 4: Testing npm package..."
npm pack --dry-run > npm-pack-test.log 2>&1
if [ $? -eq 0 ]; then
    print_status "npm pack test successful"
    rm npm-pack-test.log
else
    print_error "npm pack test failed"
fi

print_info "Step 5: Checking package size..."
PACK_SIZE=$(npm pack --dry-run 2>/dev/null | tail -1 | grep -o '[0-9.]*[kMG]B' || echo "unknown")
print_status "Package size: $PACK_SIZE"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "Current version: $CURRENT_VERSION"

echo ""
echo "🎯 Release checklist completed!"
echo "==============================="
echo ""
echo "📦 NPM Publishing:"
echo "   npm publish"
echo ""
echo "🐙 GitHub Release:"
echo "   git add ."
echo "   git commit -m \"Release v$CURRENT_VERSION\""
echo "   git tag v$CURRENT_VERSION"
echo "   git push origin main"
echo "   git push origin v$CURRENT_VERSION"
echo ""
echo "🔄 Post-publish cleanup:"
echo "   # Restore GitHub README"
echo "   mv README-github.md README.md"
echo "   git add README.md"
echo "   git commit -m \"Restore GitHub README\""
echo "   git push origin main"
echo ""
echo "✨ Remember to:"
echo "   - Create GitHub release with changelog"
echo "   - Update Homebridge verified plugins list"
echo "   - Announce on relevant forums/communities"
echo ""

# Ask if user wants to proceed with npm publish
echo "Ready to publish to npm?"
read -p "Proceed with 'npm publish'? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Publishing to npm..."
    npm publish
    print_status "Successfully published to npm!"
    
    print_info "Restoring GitHub README..."
    if [ -f "README-github.md" ]; then
        mv README-github.md README.md
        print_status "GitHub README restored"
    fi
    
    echo ""
    print_status "🎉 Release completed successfully!"
    print_info "Don't forget to create a GitHub release and tag!"
else
    print_info "Skipping npm publish. You can run 'npm publish' manually when ready."
    
    print_info "Restoring GitHub README..."
    if [ -f "README-github.md" ]; then
        mv README-github.md README.md
        print_status "GitHub README restored"
    fi
fi