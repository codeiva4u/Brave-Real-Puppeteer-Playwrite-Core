# 🔐 NPM Token Setup Guide

## 🚨 NPM Authentication Error Fix

If you're getting **E401 Unauthorized** error, follow these steps:

## 📋 Step 1: Generate New NPM Token

### Option 1: NPM Website (Recommended)
1. Visit: https://www.npmjs.com/
2. Login to your account
3. Go to: **Profile → Access Tokens**
4. Click: **Generate New Token**
5. Select: **Automation** (for CI/CD)
6. Copy the token immediately (you won't see it again)

### Option 2: NPM CLI
```bash
npm login
npm token create --type=automation
```

## 📋 Step 2: Add Token to GitHub Secrets

1. Go to your repository: `https://github.com/codeiva4u/Brave-Real-Puppeteer-Playwrite-Core`
2. Navigate: **Settings → Secrets and Variables → Actions**
3. Click: **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your NPM token (starts with `npm_`)
6. Click: **Add secret**

## 🔍 Step 3: Verify Token Format

Your NPM token should:
- Start with `npm_`
- Be around 72 characters long
- Look like: `npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## ❌ Common Issues & Solutions

### Issue 1: Token Expired
```bash
Solution: Generate a new token (tokens can expire)
```

### Issue 2: Wrong Token Type
```bash
Problem: Using "Read-only" token
Solution: Use "Automation" token for publishing
```

### Issue 3: Wrong NPM Account
```bash
Problem: Token from different NPM account
Solution: Use token from account that will own the packages
```

### Issue 4: Package Name Conflict
```bash
Problem: Package names already exist on NPM
Solution: Check if packages exist:
- https://www.npmjs.com/package/brave-real-puppeteer-core
- https://www.npmjs.com/package/brave-real-playwright-core
```

## 🧪 Step 4: Test the Fix

1. **GitHub Actions** → **Free Tier NPM Publish** → **Run workflow**
2. Set: `test_mode: true`
3. Watch for authentication success:
   ```
   ✅ NPM authentication successful! Logged in as: your-username
   ```

## 📋 NPM Package Names

The workflow will create these packages:
- `brave-real-puppeteer-core` 
- `brave-real-playwright-core`

**Make sure these names are available on NPM or you own them!**

## 🚀 After Token Setup

Once token is working:
- `test_mode: true` → Test publishing
- `force_publish: true` → Real publishing
- Leave all false → Auto-publish on dependency updates

## 💡 Pro Tips

### Secure Token Management:
- Never commit tokens to code
- Use GitHub Secrets only
- Regenerate tokens if compromised

### Token Permissions:
- **Automation** tokens can publish packages
- **Read-only** tokens cannot publish
- **Publish** tokens work but Automation is recommended

### Package Ownership:
- You must own the package names to publish
- If names are taken, modify package.json to use different names
- Consider adding your username: `@yourusername/brave-real-puppeteer-core`

## 🔧 Debugging Commands

Test your NPM setup locally:
```bash
# Check if logged in
npm whoami

# Check registry
npm config get registry

# Test publish (dry run)
npm publish --dry-run

# Login if needed
npm login
```

## 📞 Need Help?

If still getting E401 errors:
1. Double-check token format
2. Verify token permissions
3. Ensure token is from correct NPM account
4. Try regenerating the token
5. Check if package names are available

---

**🎯 Once NPM_TOKEN is working, your workflow will publish packages automatically!**