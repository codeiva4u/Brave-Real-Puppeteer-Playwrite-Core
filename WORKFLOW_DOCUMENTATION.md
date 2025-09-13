# 🚀 GitHub Actions Workflow Documentation

## 📋 **Workflow Overview (वर्कफ़्लो अवलोकन)**

इस repository में तीन main workflows हैं:

### 1. 🔄 **CI Workflow** (`ci.yml`)
- **Purpose**: Code quality और functionality testing
- **Trigger**: Push to main/master/develop branches, Pull Requests
- **Tests**: Cross-platform testing (Ubuntu, Windows, macOS) × 3 Node.js versions

### 2. 🚀 **Publish Workflow** (`publish-packages.yml`) - MAIN WORKFLOW
- **Purpose**: Automatic version detection, building, और NPM publishing
- **Triggers**: Multiple (automatic और manual)
- **Output**: NPM packages और GitHub releases

### 3. ⚡ **Simple Publish** (`simple-publish.yml`)
- **Purpose**: Basic manual publishing (backup option)
- **Trigger**: Manual workflow dispatch

---

## 🎯 **Main Publish Workflow - Detailed Explanation**

### **📊 Job Flow:**

```
🔍 Version Check → 🧪 Testing → 🏷️ Version Gen → 🎭🎪 Build → 🚀 Publish
```

### **🔍 Job 1: Check Versions**
```bash
Purpose: नए versions detect करना
├── Current vs Latest versions compare करता है
├── Publishing decision लेता है
├── Package.json automatic update करता है
└── Git commit और push करता है
```

### **🧪 Job 2: Cross-Platform Testing**
```bash
Test Matrix: 3 OS × 3 Node versions = 9 combinations
├── Ubuntu: 🦁 Brave browser install करता है (optimal stealth)
├── Windows: Default browser use करता है
├── macOS: Default browser use करता है
├── Puppeteer setup करता है
├── Playwright setup करता है
└── AI Agent testing (Brave browser preferred)
```

### **🏷️ Job 3: Version Generation**
```bash
Smart Versioning System:
├── Format: YYYY.MM.DD.{build_number}
├── Example: 2025.01.13.456
├── Git tag: brave-v2025.01.13.456
├── Automatic push to GitHub
└── हमेशा unique version guarantee
```

### **🎭🎪 Job 4 & 5: Package Building**
```bash
Separate jobs for each engine:
├── Latest versions install करते हैं
├── Custom patches apply करते हैं
├── Error handling के साथ
├── Fallback methods available हैं
└── Build artifacts create करते हैं
```

### **🚀 Job 6: NPM Publishing**
```bash
Production Publishing:
├── Authentication verify करता है
├── Packages validate करता है
├── NPM पर publish करता है
├── Status tracking के साथ
├── GitHub release create करता है
└── Detailed release notes के साथ
```

---

## 🦁 **Brave Browser Integration**

### **क्यों Brave Browser?**
```bash
🔒 Enhanced Stealth: Brave में built-in privacy features
🚀 Better Performance: Optimized for automation testing
🎯 Perfect Match: Project का नाम "Brave-Real" है!
🛡️ Ad Blocking: Built-in ad blocker से cleaner testing
🌐 Chromium-based: Full compatibility with Puppeteer/Playwright
```

### **Browser Priority Order:**
```bash
1️⃣ 🦁 Brave Browser (Preferred - Ubuntu auto-install)
2️⃣ 🌐 Google Chrome (Fallback)
3️⃣ 🔵 Chromium (Alternative)
```

### **Platform Support:**
```bash
🐧 Ubuntu: Auto Brave installation
🎨 Windows: Uses available browsers
🍎 macOS: Uses available browsers
```

---

## 🎮 **How to Use (कैसे इस्तेमाल करें)**

### **🤖 Automatic Mode:**
```bash
कुछ नहीं करना है! Workflow automatically:
├── हर Sunday check करेगा (00:00 UTC)
├── नया version detect करेगा
├── Automatic publish करेगा
└── Release create करेगा
```

### **📋 Manual Mode:**
1. GitHub Repository में जाएं
2. **Actions** tab click करें
3. **"🚀 Build & Publish NPM Packages"** select करें
4. **"Run workflow"** button click करें
5. Options configure करें:

```yaml
📝 Available Options:
├── publish_type: patch/minor/major (version type)
├── dry_run: true/false (testing mode)
└── force_update: true/false (force immediate publish)
```

### **🧪 Testing Mode:**
```bash
Dry Run के लिए:
├── dry_run = true select करें
├── सब कुछ test होगा
├── लेकिन actual publish नहीं होगा
└── Safety check complete होगा
```

---

## ⚙️ **Configuration Requirements**

### **🔐 Required Secrets:**
```bash
Repository Settings → Secrets and Variables → Actions:
├── NPM_TOKEN: Your NPM publishing token
└── GH_TOKEN: GitHub personal access token (optional)
```

### **🛠️ NPM Token Setup:**
```bash
1. NPM website पर login करें
2. Account settings → Access Tokens
3. "Generate New Token" click करें
4. "Automation" type select करें
5. Token copy करके GitHub secrets में add करें
```

### **📁 Required Files:**
```bash
Project Structure:
├── scripts/check-versions.js (version checker)
├── scripts/create-brave-package.js (package creator)
├── scripts/enhanced-patcher.js (patcher)
├── scripts/ai-agent.js (testing agent)
└── patches/ directory (patch files)
```

---

## 📊 **Monitoring & Troubleshooting**

### **📍 Where to Check Status:**
```bash
GitHub Repository → Actions Tab
├── Real-time workflow status
├── Detailed step-by-step logs
├── Error messages और solutions
├── Success/failure notifications
└── Artifact downloads
```

### **✅ Success Indicators:**
```bash
Publishing Successful होने के signs:
├── All jobs में green checkmarks
├── NPM packages published
├── GitHub release created
├── Git tags pushed
└── No error logs
```

### **🚨 Common Issues & Solutions:**

#### **1. NPM Authentication Error:**
```bash
Error: 401 Unauthorized
Solution:
├── NPM_TOKEN check करें
├── Token expiry verify करें
├── Token permissions check करें
└── Fresh token generate करें
```

#### **2. Version Already Exists:**
```bash
Error: Package already published
Solution:
├── यह normal है (version collision)
├── Workflow automatically handle करता है
├── Next build में new version मिलेगा
└── Force update से immediate new version मिल सकता है
```

#### **3. Build Failed:**
```bash
Error: Package creation failed
Solution:
├── Dependencies check करें
├── Patch compatibility verify करें
├── Fallback methods available हैं
└── Workflow logs detailed info देती हैं
```

#### **4. Browser Not Found (AI Agent):**
```bash
Error: No compatible browser found
Solution:
├── यह expected है कुछ environments में
├── continue-on-error enabled है
├── Testing पर कोई impact नहीं है
└── Main functionality work करती है
```

#### **5. Brave Browser Installation Failed:**
```bash
Error: Brave installation failed on Ubuntu
Solution:
├── Repository key पर issue हो सकता है
├── Workflow Chrome fallback पर switch करेगा
├── continue-on-error से workflow block नहीं होगा
└── Manual retry से usually resolve हो जाता है
```

#### **6. AI Agent Performance with Brave:**
```bash
Tip: Brave के साथ optimal performance
├── Stealth features automatically enabled
├── Ad blocking improves test reliability
├── Privacy settings enhance detection bypass
└── Built-in fingerprint protection

---

## 📈 **Performance & Optimization**

### **⚡ Speed Optimizations:**
```bash
Workflow Efficiency:
├── Parallel job execution
├── Caching enabled (npm cache)
├── continue-on-error for non-critical steps
├── Smart conditional execution
└── Artifacts के बजाय rebuilding नहीं
```

### **💾 Resource Management:**
```bash
Resource Conservation:
├── Artifact retention: 30 days
├── Only necessary steps run करते हैं
├── Smart browser installation
├── Conditional AI Agent testing
└── Error recovery mechanisms
```

---

## 🎯 **Best Practices**

### **📝 Commit Messages:**
```bash
Workflow को skip करने के लिए:
git commit -m "docs: update README [skip-workflow]"

यह automatically workflow trigger नहीं करेगा।
```

### **🔄 Regular Maintenance:**
```bash
Weekly Tasks:
├── Workflow logs review करें
├── Published packages verify करें
├── Token expiry check करें
└── Dependencies update करें
```

### **🛡️ Security Practices:**
```bash
Security Guidelines:
├── Secrets को code में hardcode न करें
├── Regular token rotation करें
├── Public packages के लिए appropriate access levels
└── GitHub environment protection use करें
```

---

## 🚀 **Advanced Usage**

### **🎛️ Workflow Customization:**
```yaml
Workflow को customize करने के लिए:
├── Cron schedule change कर सकते हैं
├── Test matrix modify कर सकते हैं
├── Version generation logic adjust कर सकते हैं
└── Publishing conditions customize कर सकते हैं
```

### **📊 Monitoring Webhooks:**
```bash
External Monitoring:
├── GitHub webhooks setup कर सकते हैं
├── Slack/Discord notifications
├── Email alerts for failures
└── Custom monitoring solutions integrate कर सकते हैं
```

---

## 📞 **Support & Debugging**

### **🔍 Debugging Steps:**
1. Actions tab में detailed logs check करें
2. Individual job failures analyze करें
3. Secrets और permissions verify करें
4. Local testing करें before workflow changes
5. Incremental fixes apply करें

### **📚 Additional Resources:**
- GitHub Actions Documentation
- NPM Publishing Guide
- Node.js Best Practices
- Puppeteer/Playwright Docs

---

**यह comprehensive workflow आपको complete automation देता है version management, testing, building, और publishing के लिए! 🎉**