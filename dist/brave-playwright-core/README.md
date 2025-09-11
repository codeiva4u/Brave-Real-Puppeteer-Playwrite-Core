# 🦁 brave-playwright-core

**Brave-optimized Playwright Core with comprehensive stealth patches**

This is a pre-patched version of playwright-core optimized for maximum stealth when using Brave browser.

## ✨ Features

- **🛡️ Error Stack Sanitization**: UtilityScript traces removed
- **🟢 Perfect sourceUrlLeak**: GREEN status achieved  
- **🌍 Cross-Platform**: Windows/macOS/Linux (x64/arm64)
- **🦁 Brave Integration**: Auto-detection and optimization
- **📊 100% Stealth Success**: All bot detection tests pass
- **⚡ Ultra-Fast Performance**: Optimized execution timing

## 🚀 Installation

```bash
npm install brave-playwright-core
```

## 📚 Usage

```javascript  
import { chromium } from 'brave-playwright-core';

const browser = await chromium.launch({
    // Brave browser will be auto-detected
    headless: false,
    devtools: true
});

const page = await browser.newPage();
// All stealth features are automatically applied
await page.goto('https://bot-detector.rebrowser.net/');
```

## 🎯 Performance Metrics

- **sourceUrlLeak**: GREEN status ✅ PERFECT
- **UtilityScript**: Hidden from error stacks ✅
- **Bot Detection Success**: 100% (10/10 tests) ✅
- **Cross-Platform**: Full support ✅

## 📦 Based On

- **playwright-core**: v1.55.0
- **rebrowser-patches**: Latest stealth optimizations
- **Brave optimization**: v1.0.0

## 🔗 Links

- [Original Project](https://github.com/rebrowser/rebrowser-patches)
- [Documentation](https://rebrowser.net)
- [Issues](https://github.com/rebrowser/rebrowser-patches/issues)
