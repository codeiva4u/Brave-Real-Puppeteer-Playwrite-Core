# 🦁 NPM Publishing Guide - Brave Real Packages

This guide explains how to automatically publish `Brave-Real-Puppeteer-Core` and `Brave-Real-Playwright-Core` packages to NPM.

## 📋 Prerequisites

### 1. NPM Account Setup
- Create an NPM account at [npmjs.com](https://www.npmjs.com)
- Verify your email address
- Enable 2FA (Two-Factor Authentication) for better security

### 2. Package Name Availability
Before publishing, verify that the package names are available:

```bash
npm view Brave-Real-Puppeteer-Core
npm view Brave-Real-Playwright-Core
```

If packages don't exist, you're good to go! If they exist and belong to someone else, you'll need to choose different names.

### 3. NPM Authentication

#### Method 1: Interactive Login (Recommended for local development)
```bash
npm login
```

#### Method 2: Token-based Authentication (Recommended for CI/CD)
1. Generate an NPM access token:
   - Go to [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
   - Click "Generate New Token"
   - Choose "Automation" for CI/CD or "Publish" for manual publishing

2. Set environment variable:
   ```bash
   # Windows Command Prompt
   set NPM_TOKEN=your_token_here
   
   # Windows PowerShell
   $env:NPM_TOKEN="your_token_here"
   
   # Linux/Mac
   export NPM_TOKEN=your_token_here
   ```

3. Configure `.npmrc` (optional):
   ```
   //registry.npmjs.org/:_authToken=${NPM_TOKEN}
   ```

## 🚀 Publishing Workflow

### Step 1: Create Brave Packages
First, create the patched packages:

```bash
# Create both packages
npm run create-brave-packages

# Or create individually
npm run create-brave-puppeteer
npm run create-brave-playwright
```

### Step 2: Dry Run (Recommended)
Test the publishing process without actually publishing:

```bash
npm run publish-brave-dry-run
```

This will:
- ✅ Validate package structure
- ✅ Check NPM authentication
- ✅ Verify package.json content
- ✅ Test NPM publish command
- ❌ NOT actually publish to NPM

### Step 3: Publish to NPM

#### Publish Both Packages
```bash
npm run publish-brave-packages
```

#### Publish Individual Packages
```bash
# Publish only Puppeteer package
npm run publish-brave-puppeteer

# Publish only Playwright package
npm run publish-brave-playwright
```

#### One-Command Build and Publish
```bash
npm run build-and-publish-brave
```

### Step 4: Advanced Publishing Options

#### Force Publish (Override Version Check)
```bash
node ./scripts/publish-brave-packages.js --force
```

#### Publish with Custom Tag
```bash
node ./scripts/publish-brave-packages.js --tag beta
node ./scripts/publish-brave-packages.js --tag alpha
```

#### Publish as Private Package (if you have NPM Pro)
```bash
node ./scripts/publish-brave-packages.js --access restricted
```

## 📦 Package Information

### Brave-Real-Puppeteer-Core
- **Name**: `Brave-Real-Puppeteer-Core`
- **Current Version**: `24.19.0-brave.1.0.0`
- **Base Package**: puppeteer-core@24.19.0
- **Install Command**: `npm install Brave-Real-Puppeteer-Core`

### Brave-Real-Playwright-Core
- **Name**: `Brave-Real-Playwright-Core`
- **Current Version**: `1.55.0-brave.1.0.0`
- **Base Package**: playwright-core@1.55.0
- **Install Command**: `npm install Brave-Real-Playwright-Core`

## 🔧 Version Management

### Automatic Version Handling
The scripts automatically use versions in the format:
- `{original-version}-brave.{brave-version}`
- Example: `24.19.0-brave.1.0.0`

### Updating Versions
1. **For Base Package Updates**: Update `puppeteerVersion` and `playwrightVersion` in `scripts/create-brave-package.js`
2. **For Brave Updates**: Update `braveVersion` in the same file or pass via command line:
   ```bash
   node ./scripts/create-brave-package.js --version 1.1.0
   ```

## 🔍 Monitoring and Verification

### After Publishing
1. **Verify on NPM**:
   - [Brave-Real-Puppeteer-Core](https://www.npmjs.com/package/Brave-Real-Puppeteer-Core)
   - [Brave-Real-Playwright-Core](https://www.npmjs.com/package/Brave-Real-Playwright-Core)

2. **Test Installation**:
   ```bash
   # Create test directory
   mkdir brave-test && cd brave-test
   npm init -y
   
   # Test installation
   npm install Brave-Real-Puppeteer-Core
   npm install Brave-Real-Playwright-Core
   
   # Test usage
   node -e "console.log(require('Brave-Real-Puppeteer-Core'))"
   node -e "console.log(require('Brave-Real-Playwright-Core'))"
   ```

3. **Monitor Download Stats**:
   ```bash
   npm info Brave-Real-Puppeteer-Core
   npm info Brave-Real-Playwright-Core
   ```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Authentication Failed
```
❌ NPM authentication failed!
```
**Solution**: Run `npm login` or set NPM_TOKEN environment variable

#### 2. Package Already Exists
```
⚠️ Version X.X.X already exists
```
**Solution**: 
- Update version in package.json, or
- Use `--force` flag (not recommended), or
- Use different tag: `--tag beta`

#### 3. Permission Denied
```
❌ You do not have permission to publish
```
**Solution**: 
- Make sure you own the package name
- Contact package owner to add you as maintainer
- Choose different package name

#### 4. Network Issues
```
❌ Network error during publish
```
**Solution**:
- Check internet connection
- Try again (NPM sometimes has temporary issues)
- Use `--dry-run` to test without publishing

### Getting Help
- **NPM Support**: [npmjs.com/support](https://www.npmjs.com/support)
- **Project Issues**: [GitHub Issues](https://github.com/rebrowser/rebrowser-patches/issues)
- **Email**: info@rebrowser.net

## 🔄 Automated Publishing (CI/CD)

### GitHub Actions Example
Create `.github/workflows/publish-brave-packages.yml`:

```yaml
name: Publish Brave Packages
on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install Dependencies
        run: npm install
        
      - name: Create and Publish Brave Packages
        run: npm run build-and-publish-brave
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Environment Variables for CI/CD
Add these secrets to your CI/CD platform:
- `NPM_TOKEN`: Your NPM automation token

## 📈 Best Practices

1. **Always test with dry-run first**
2. **Use semantic versioning for brave updates**
3. **Monitor package downloads and issues**
4. **Keep documentation up to date**
5. **Test packages after publishing**
6. **Use automation for regular updates**

## 🎯 Quick Commands Reference

```bash
# Complete workflow (recommended)
npm run create-brave-packages      # Create packages
npm run publish-brave-dry-run      # Test publishing
npm run publish-brave-packages     # Actual publishing

# One-liner (for experienced users)
npm run build-and-publish-brave

# Individual packages
npm run create-brave-puppeteer && npm run publish-brave-puppeteer
npm run create-brave-playwright && npm run publish-brave-playwright
```

---

🦁 **Happy Publishing!** Your Brave packages will help developers create undetectable automation with maximum stealth capabilities.
