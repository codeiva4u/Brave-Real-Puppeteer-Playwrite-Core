# 🦁 Brave Real Puppeteer Playwright Core - Semantic Versioning Guide

## 📋 Overview
Your workflows now use **Semantic Versioning (SemVer)** format instead of timestamp-based versioning.

## 🔄 Version Format Changes

### ❌ Old Format (Timestamp-based)
```
brave.2025.9.13.41
brave.2025.9.13.42
```

### ✅ New Format (Semantic Versioning)
```
v1.0.0
v1.0.1
v1.1.0
v2.0.0
```

## 🚀 Single Unified Workflow

### **brave-auto-publish.yml** - 🦁 Brave Auto-Publish - All Packages
- **📦 Publishes 3 packages**: Main + Puppeteer + Playwright
- **🚀 Latest versions**: Automatically fetches and uses latest puppeteer-core & playwright-core
- **📈 Smart versioning**: Based on manual input or commit message
- **Patch (default)**: 1.0.0 → 1.0.1
- **Minor**: Choose 'minor' or add `[minor]` in commit message → 1.0.0 → 1.1.0
- **Major**: Choose 'major' or add `[major]` in commit message → 1.0.0 → 2.0.0
- **🧪 Test mode**: Safe dry-run option
- **⚡ Quick mode**: Skip tests for faster execution

## 📖 How to Use

### 🔸 Automatic Publishing (Push to main)
```bash
# Normal commit → patch version (1.0.0 → 1.0.1)
git commit -m "fix: bug resolved"

# Minor version bump (1.0.0 → 1.1.0)
git commit -m "[minor] feat: new feature added"

# Major version bump (1.0.0 → 2.0.0)
git commit -m "[major] breaking: API changed"
```

### 🔹 Manual Publishing (GitHub Actions)
1. Go to **Actions** tab
2. Select **"🦁 Brave NPM Auto-Publish"** or **"Free Tier NPM Publish"**
3. Click **"Run workflow"**
4. Choose version bump type (patch/minor/major)

## 📦 Published Package Names
```bash
# Install commands (same as before)
npm install brave-real-puppeteer-playwright-core
```

## 🏷️ Git Tags
All releases now create semantic version tags:
- `v1.0.0` (instead of `brave-v2025.9.13.41`)
- `v1.0.1`
- `v1.1.0`
- `v2.0.0`

## ✅ Benefits
1. **🎯 Standard Format**: Industry-standard semantic versioning
2. **🔄 Better Dependency Management**: npm/yarn can handle version ranges properly
3. **📈 Clear Progression**: Easy to understand version history
4. **🏷️ Clean Tags**: Professional git tag naming
5. **🔧 Automated**: No manual version management needed

## 🛠️ Next Steps
Your next publish will create version `v1.0.1` automatically!

---
**🦁 Brave Real Puppeteer Playwright Core - Now with Professional Semantic Versioning!**