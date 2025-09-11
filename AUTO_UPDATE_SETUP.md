# 🤖 Auto-Update Workflow Setup Guide

यह guide आपको बताएगी कि automatic version checking और publishing workflow को कैसे setup करें।

## ✨ Features

### 🕐 **Weekly Automatic Checks (हफ्तेवार ऑटोमेटिक चेक)**
- हर रविवार को 00:00 UTC पर automatically check करता है
- नए versions मिलने पर automatic update और publish करता है
- Schedule: `'0 0 * * 0'` (Every Sunday)

### 🎯 **Manual Trigger (मैनुअल ट्रिगर)**
- GitHub Actions UI से manually workflow trigger कर सकते हैं
- Force update option available है
- Dry run option भी है testing के लिए

### 🔍 **Smart Version Detection**
- Puppeteer-core और Playwright-core के latest versions check करता है
- Only when updates are found, publishing pipeline triggers होती है
- Automatic package.json updates

## 🛠️ Setup Instructions

### 1. **Required GitHub Secrets**

आपको निम्नलिखित secrets को अपनी GitHub repository में add करना होगा:

#### **NPM_TOKEN** (Required for publishing)
```bash
# NPM token generate करने के लिए:
npm login
npm token create --access=read-write

# फिर इस token को GitHub Secrets में add करें:
# Settings > Secrets and variables > Actions > New repository secret
# Name: NPM_TOKEN
# Value: npm_xxx... (your token)
```

#### **GH_TOKEN** (Optional, better for git operations)
```bash
# GitHub Personal Access Token create करें:
# GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens
# Repository permissions: Contents (Read and write), Pull requests (Read)

# GitHub Secrets में add करें:
# Name: GH_TOKEN  
# Value: github_pat_xxx... (your token)
```

### 2. **Enable GitHub Actions**

Repository settings में जाकर:
```
Settings > Actions > General > Actions permissions
Select: "Allow all actions and reusable workflows"
```

### 3. **Test the Workflow**

#### Manual Test:
```bash
# Repository में जाकर:
Actions > 🚀 Build & Publish NPM Packages > Run workflow
# Select: force_update = true, dry_run = true
```

#### Local Test:
```bash
# Version check locally test करें:
npm run check-versions

# Only check, don't update:
npm run check-versions-only
```

## 📊 Workflow Behavior

### **Schedule Trigger (हर रविवार)**
```yaml
schedule:
  - cron: '0 0 * * 0'  # Every Sunday at midnight UTC
```

### **Manual Trigger Options**
- **Publish Type**: patch/minor/major
- **Dry Run**: Test without actual publishing
- **Force Update**: Force check even if no updates

### **Automatic Decision Logic**
```
IF (new versions found) OR (force_update = true) OR (push to main)
THEN proceed with build and publish
ELSE skip workflow
```

## 🔄 Workflow Steps

### 1. **Version Check**
```bash
🔍 Check puppeteer-core and playwright-core versions
📝 Update package.json if new versions found
📤 Commit changes to repository
```

### 2. **Build Process**
```bash
🎭 Install latest Puppeteer + apply patches
🎪 Install latest Playwright + apply patches  
📦 Create brave-real-puppeteer-core package
📦 Create brave-real-playwright-core package
```

### 3. **Publishing**
```bash
🚀 Publish to NPM with public access
🏷️ Create GitHub release with auto-generated notes
📊 Generate performance metrics in release notes
```

## 📋 Monitoring and Troubleshooting

### **Check Workflow Status**
```bash
# Repository में जाकर:
Actions > 🚀 Build & Publish NPM Packages
```

### **Common Issues**

#### **"Version check failed"**
```bash
# Local में test करें:
npm run check-versions --verbose
```

#### **"NPM publish failed"**  
```bash
# NPM token check करें:
npm whoami  # Should show your username

# Token permissions check करें:
# NPM tokens should have "Automation" type with read-write access
```

#### **"Git push failed"**
```bash
# GH_TOKEN permissions check करें:
# Token should have "Contents: Write" permission
```

### **Logs and Debugging**
```bash
# Workflow logs में detailed information मिलती है:
# - Version comparison details
# - Package installation logs  
# - Publishing success/failure messages
# - Performance metrics
```

## 🎯 Customization

### **Change Schedule**
```yaml
# .github/workflows/publish-packages.yml में:
schedule:
  - cron: '0 0 * * 1'  # Monday instead of Sunday
  - cron: '0 12 * * *'  # Daily at noon
  - cron: '0 0 1 * *'   # Monthly on 1st
```

### **Add More Packages**
```javascript
// scripts/check-versions.js में:
const packages = [
  'puppeteer-core', 
  'playwright-core',
  'new-package-name'  // Add here
];
```

### **Custom Version Logic**
```javascript  
// scripts/check-versions.js में checkForUpdates() function को modify करें
```

## 📈 Success Metrics

Workflow successful होने के बाद:
- ✅ NPM packages published with latest versions
- ✅ GitHub release created with performance metrics
- ✅ Repository updated with new versions
- ✅ All stealth patches applied correctly

## 🎉 Usage Examples

### **Check for Updates**
```bash
npm run check-versions
```

### **Force Manual Update**  
```bash
# GitHub UI में:
Actions > Run workflow > force_update = ✅
```

### **Test Without Publishing**
```bash
# GitHub UI में:  
Actions > Run workflow > dry_run = ✅
```

---

## 🤝 Support

अगर कोई issue आता है तो:
1. Workflow logs check करें
2. Local testing करें (`npm run check-versions`)
3. GitHub secrets verify करें
4. NPM permissions check करें

**Happy Automation! 🎉**
