# 🚀 Deployment Guide - homebridge-ahoy-dtu

## Pre-Deployment Checklist ✅

Your plugin is now **ready for deployment**! All verification checks have passed:

- ✅ All required files present
- ✅ Package.json properly configured  
- ✅ Build output generated (31KB)
- ✅ npm pack test successful (14.7KB package)
- ✅ GitHub integration files ready
- ✅ Documentation complete
- ✅ MQTT port slider issue fixed
- ✅ Power measurement options implemented

## 📦 Publishing to npm

### Option 1: Automated Release (Recommended)
```bash
# Run the automated release script
./release-prepare.sh
```

This script will:
- Build the project
- Run verification checks
- Switch to npm-optimized README
- Test package creation
- Publish to npm
- Restore GitHub README
- Provide next steps

### Option 2: Manual Release
```bash
# 1. Final build and verification
npm run build
npm run verify-release

# 2. Switch to npm README (optional)
cp README.md README-github.md
cp README-npm-production.md README.md

# 3. Publish to npm
npm publish

# 4. Restore GitHub README
mv README-github.md README.md
```

## 🐙 Publishing to GitHub

### 1. Commit and Tag
```bash
# Commit all changes
git add .
git commit -m "Release v1.0.1 - Add configurable power measurement and fix MQTT port UI"

# Create version tag
git tag v1.1.0

# Push to GitHub
git push origin main
git push origin v1.1.0
```

### 2. Create GitHub Release
1. Go to: https://github.com/chr-braun/homebridge-ahoy-dtu/releases
2. Click "Create a new release"
3. Choose tag: `v1.1.0`
4. Release title: `v1.1.0 - Configurable Power Measurement`
5. Description: Use content from CHANGELOG.md

```markdown
## ⚡ New Features
- **Configurable Power Display**: Choose between Light Sensor (exact watts as lux) or Outlet Service (on/off state with logged watts)
- **Enhanced Documentation**: Comprehensive guides for power measurement choices

## 🔧 Fixes
- **MQTT Port Input**: Removed slider behavior - now displays as proper number input
- **UI Usability**: Improved user experience for port configuration

## 📦 Package Info
- Package size: 14.7KB
- Compiled size: 31KB
- Full backward compatibility maintained
```

## 🔄 Post-Release Steps

### 1. Verify npm Publication
```bash
# Check npm package
npm view homebridge-ahoy-dtu

# Test installation
npm install -g homebridge-ahoy-dtu@latest
```

### 2. Update Homebridge Verified Plugins
1. Fork: https://github.com/homebridge/homebridge/
2. Edit: `config/verified-plugins.json`
3. Add or update entry for `homebridge-ahoy-dtu`
4. Submit pull request

### 3. Community Announcements
- Post in Homebridge Discord
- Update relevant solar/IoT forums
- Share on r/homebridge subreddit
- Update project documentation

## 📊 Version Information

- **Current Version**: 1.1.0
- **Previous Version**: 1.0.1
- **Release Date**: 2024-08-23
- **Breaking Changes**: None (full backward compatibility)

## 🎯 Key Features for Users

### Power Measurement Options
```json
{
  "usePowerOutlets": false,  // Light Sensor (default) - shows exact watts as lux
  "usePowerOutlets": true    // Outlet Service - shows on/off + logs watts
}
```

### Fixed MQTT Port Issue
- No more slider interface
- Clean number input field
- Better user experience

### Documentation
- Comprehensive power measurement guide
- Visual examples and comparisons
- Migration instructions
- Configuration templates

## 🛠️ Technical Details

### Package Contents
- **Core**: `dist/index.js` (31KB compiled TypeScript)
- **Schema**: `config.schema.json` (8.7KB Homebridge UI)
- **Docs**: `README.md`, `LICENSE`, `CHANGELOG.md`
- **Total**: 14.7KB npm package

### Compatibility
- **Node.js**: >=14.18.1
- **Homebridge**: >=1.3.0
- **AHOY-DTU**: All versions with MQTT
- **HomeKit**: iOS 13+ / macOS 10.15+

## 🆘 Troubleshooting

### If npm publish fails:
```bash
# Check npm login
npm whoami

# Login if needed
npm login

# Check version conflicts
npm view homebridge-ahoy-dtu versions --json
```

### If GitHub release fails:
- Ensure you have push permissions
- Check if tag already exists
- Verify all files are committed

### Support Channels
- **Issues**: GitHub Issues tab
- **Discussions**: GitHub Discussions
- **Community**: Homebridge Discord
- **Email**: chr-braun@users.noreply.github.com

---

## 🎉 Congratulations!

Your homebridge-ahoy-dtu plugin is now ready for the world! 

**Key improvements in this release:**
- ⚡ Configurable power measurement units
- 🔧 Fixed MQTT port slider issue  
- 📚 Enhanced documentation
- 🏠 Better HomeKit integration options

**Ready to deploy? Run:** `./release-prepare.sh` 🚀