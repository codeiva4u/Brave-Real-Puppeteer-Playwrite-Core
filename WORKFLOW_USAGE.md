# 🦁 Brave NPM Auto-Publish Workflow Usage

## Overview
यह powerful workflow automatic रूप से semantic versioning के साथ NPM पर packages publish करता है।

## ✨ Features
- ✅ **Semantic Versioning**: `v1.0.0`, `v1.0.1`, `v1.1.0` format
- ✅ **Separate Packages**: Puppeteer और Playwright अलग-अलग publish
- ✅ **Latest Dependencies**: हमेशा latest puppeteer-core और playwright-core
- ✅ **Automatic Tags**: Git tags automatic generate होते हैं
- ✅ **Manual & Auto Trigger**: Push पर या manually trigger कर सकते हैं
- ✅ **Test Mode**: Dry run के लिए test mode available

## 🚀 How to Use

### 1. Manual Trigger (Recommended)
1. GitHub repository में जाएं
2. **Actions** tab पर click करें
3. **"🦁 Brave NPM Auto-Publish Workflow"** select करें
4. **"Run workflow"** button पर click करें
5. Options configure करें:
   - **Version Type**: `patch`, `minor`, या `major`
   - **Test Mode**: `false` (actual publish) या `true` (dry run)
   - **Publish Puppeteer**: `true` या `false`
   - **Publish Playwright**: `true` या `false`

### 2. Automatic Trigger
- Main/Master branch पर push करने पर automatically trigger होता है
- Default: patch version increment होता है

### 3. Command Line Usage
```bash
# Patch release (1.0.0 → 1.0.1)
npm run release

# Minor release (1.0.0 → 1.1.0)  
npm run release-minor

# Major release (1.0.0 → 2.0.0)
npm run release-major

# Test release (dry run)
npm run test-release

# Workflow usage instructions
npm run test-workflow
```

## 📦 What Gets Published

### Packages Created:
1. **`brave-real-puppeteer-core`** - Puppeteer के लिए
2. **`brave-real-playwright-core`** - Playwright के लिए

### Version Format:
```
v1.0.0 → v1.0.1 (patch)
v1.0.0 → v1.1.0 (minor)  
v1.0.0 → v2.0.0 (major)
```

## 🛠️ Setup Requirements

### 1. NPM Token
```bash
# GitHub repository settings में NPM_TOKEN secret add करें
# NPM account से token generate करें
```

### 2. Repository Permissions
- GitHub Actions को write permissions देें
- Contents write access enable करें

## 📊 Workflow Steps

1. **📋 Latest Dependencies**: Latest puppeteer-core और playwright-core versions fetch करता है
2. **🏷️ Version Generation**: Semantic version increment करता है
3. **⚙️ Update Package**: package.json में versions update करता है
4. **🔄 Run Patches**: सभी stealth patches apply करता है
5. **📦 Create Packages**: Brave optimized packages create करता है
6. **🧪 Testing**: Bot detection और AI tests run करता है
7. **🚀 Publish**: NPM पर packages publish करता है
8. **🏷️ Git Tags**: Git tags create और push करता है
9. **📋 GitHub Release**: GitHub release create करता है

## 🧪 Test Mode

Test mode में workflow सब कुछ execute करता है लेकिन:
- ❌ NPM पर publish नहीं करता
- ❌ Git tags push नहीं करता  
- ❌ GitHub release create नहीं करता
- ✅ सिर्फ testing और validation करता है

## 📈 Version Management

### Current Strategy:
- **Patch** (1.0.0 → 1.0.1): Bug fixes, minor updates
- **Minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

### Package Dependencies:
```json
{
  "optionalDependencies": {
    "puppeteer-core": "^24.20.0",
    "playwright-core": "^1.55.0"
  }
}
```

## 🔍 Troubleshooting

### Common Issues:

1. **NPM Token Error**
   ```
   Solution: GitHub Settings → Secrets → Add NPM_TOKEN
   ```

2. **Permission Denied**
   ```
   Solution: Repository Settings → Actions → Permissions → Write
   ```

3. **Version Conflict**
   ```
   Solution: Check package.json version format (x.y.z)
   ```

## 📱 Usage Examples

### Example 1: Manual Release
```
1. GitHub → Actions → Brave NPM Auto-Publish
2. Set version_type: patch
3. Set test_mode: false
4. Run workflow
5. Result: v1.0.1 published
```

### Example 2: Test Run
```
1. GitHub → Actions → Brave NPM Auto-Publish  
2. Set version_type: minor
3. Set test_mode: true
4. Run workflow
5. Result: Dry run completed (no actual publish)
```

## 🎯 Success Indicators

Workflow successful होने पर:
- ✅ NPM पर packages visible होंगे
- ✅ Git tags repository में show होंगे
- ✅ GitHub Releases में new release होगा
- ✅ Latest dependencies के साथ packages update होंगे

## 🔗 Links

- [NPM Puppeteer Package](https://www.npmjs.com/package/brave-real-puppeteer-core)
- [NPM Playwright Package](https://www.npmjs.com/package/brave-real-playwright-core)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)