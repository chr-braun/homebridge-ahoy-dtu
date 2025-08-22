#!/bin/bash

# Homebridge AHOY-DTU Plugin - Git Setup Script
# This script helps set up the Git repository for the first time

echo "🚀 Setting up Git repository for Homebridge AHOY-DTU Plugin"
echo "==========================================================="

# Initialize git repository if not already done
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Set up git config (if not already set globally)
echo "⚙️ Checking Git configuration..."
if [ -z "$(git config user.name)" ]; then
    read -p "Enter your name for Git commits: " git_name
    git config user.name "$git_name"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "Enter your email for Git commits: " git_email
    git config user.email "$git_email"
fi

# Add all files to staging
echo "📦 Adding files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "🎉 Initial release of Homebridge AHOY-DTU Plugin

Features:
- 🌞 AHOY-DTU solar inverter monitoring via MQTT
- 🎨 Modern Homebridge UI with responsive design
- 🔍 Automatic device discovery
- 🚀 Quick setup presets (Basic, Detailed, Individual Inverters)
- 🌙 Smart offline detection for night/no sun periods
- ✅ Comprehensive data validation
- 📊 Health monitoring and connectivity tracking
- 📱 Mobile-friendly configuration interface
- ⚡ Real-time solar power monitoring in HomeKit

Ready for npm publication and GitHub hosting!"

# Set up main branch
echo "🌳 Setting up main branch..."
git branch -M main

# Instructions for adding remote and pushing
echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: homebridge-ahoy-dtu"
echo "   - Description: Homebridge plugin for AHOY-DTU solar inverter monitoring via MQTT"
echo "   - Make it public"
echo "   - Don't initialize with README (we already have one)"
echo ""
echo "2. Add the GitHub remote and push:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/homebridge-ahoy-dtu.git"
echo "   git push -u origin main"
echo ""
echo "3. Publish to npm (optional):"
echo "   npm publish"
echo ""
echo "4. Submit to Homebridge Plugin Registry:"
echo "   https://github.com/homebridge/homebridge/wiki/Plugin-Registry"
echo ""
echo "✅ Git setup complete! Repository is ready for GitHub."

# Show current status
echo ""
echo "📊 Current Git Status:"
echo "====================="
git status --short
echo ""
echo "📈 Commit History:"
echo "=================="
git log --oneline -n 5