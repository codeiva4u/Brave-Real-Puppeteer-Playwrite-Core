#!/usr/bin/env node

/**
 * Rebrowser Patches Setup Wizard
 * Interactive setup for choosing between Puppeteer-core or Playwright-core
 */

import { readFile, writeFile } from 'fs/promises';
import { spawn } from 'child_process';
import { resolve } from 'path';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(query) {
    return new Promise(resolve => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        readline.question(query, answer => {
            readline.close();
            resolve(answer);
        });
    });
}

async function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { 
            stdio: 'inherit',
            shell: true
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
    });
}

async function detectInstalledEngines() {
    const engines = {
        puppeteer: false,
        playwright: false
    };
    
    try {
        const packageJsonPath = resolve(process.cwd(), 'package.json');
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
        
        const allDeps = {
            ...(packageJson.dependencies || {}),
            ...(packageJson.devDependencies || {}),
            ...(packageJson.optionalDependencies || {})
        };
        
        engines.puppeteer = !!(allDeps['puppeteer-core'] || allDeps['puppeteer']);
        engines.playwright = !!(allDeps['playwright-core'] || allDeps['playwright']);
        
        // Also check node_modules
        const fs = require('fs');
        const path = require('path');
        
        try {
            if (fs.existsSync(path.resolve(process.cwd(), 'node_modules', 'puppeteer-core'))) {
                engines.puppeteer = true;
            }
        } catch (e) {}
        
        try {
            if (fs.existsSync(path.resolve(process.cwd(), 'node_modules', 'playwright-core'))) {
                engines.playwright = true;
            }
        } catch (e) {}
        
    } catch (error) {
        log(`Warning: Could not detect installed engines: ${error.message}`, 'yellow');
    }
    
    return engines;
}

async function main() {
    log('🎯 REBROWSER PATCHES SETUP WIZARD', 'cyan');
    log('=' + '='.repeat(50), 'cyan');
    log('');
    
    log('This wizard will help you set up rebrowser-patches for your automation needs.', 'bright');
    log('');
    
    // Detect current engines
    log('🔍 Detecting currently installed automation engines...', 'blue');
    const installed = await detectInstalledEngines();
    
    log('');
    log('📊 Current Status:', 'yellow');
    log(`  Puppeteer-core: ${installed.puppeteer ? '✅ Installed' : '❌ Not installed'}`, installed.puppeteer ? 'green' : 'red');
    log(`  Playwright-core: ${installed.playwright ? '✅ Installed' : '❌ Not installed'}`, installed.playwright ? 'green' : 'red');
    log('');
    
    // Choose engine
    log('🤖 Which automation engine would you like to use?', 'bright');
    log('');
    log('1. 🎭 Puppeteer-core (Lightweight, fast, Chrome DevTools Protocol)');
    log('2. 🎪 Playwright-core (Multi-browser support, modern features)');
    log('3. 🎯 Both (Maximum compatibility)');
    log('4. ℹ️  Skip installation (I\'ll install manually)');
    log('');
    
    const choice = await question('Enter your choice (1-4): ');
    
    let selectedEngines = [];
    
    switch (choice.trim()) {
        case '1':
            selectedEngines = ['puppeteer'];
            break;
        case '2':
            selectedEngines = ['playwright'];
            break;
        case '3':
            selectedEngines = ['puppeteer', 'playwright'];
            break;
        case '4':
            selectedEngines = [];
            break;
        default:
            log('❌ Invalid choice. Defaulting to Puppeteer-core.', 'red');
            selectedEngines = ['puppeteer'];
    }
    
    log('');
    
    // Install and patch selected engines
    for (const engine of selectedEngines) {
        log(`🚀 Installing and patching ${engine}-core...`, 'blue');
        
        try {
            if (engine === 'puppeteer' && !installed.puppeteer) {
                log('📦 Installing puppeteer-core...', 'yellow');
                await runCommand('npm', ['install', 'puppeteer-core']);
            } else if (engine === 'playwright' && !installed.playwright) {
                log('📦 Installing playwright-core...', 'yellow');
                await runCommand('npm', ['install', 'playwright-core']);
            }
            
            log(`🔧 Applying patches to ${engine}-core...`, 'yellow');
            await runCommand('npm', [`run`, `patch-${engine}`]);
            
            log(`✅ ${engine}-core setup completed!`, 'green');
        } catch (error) {
            log(`❌ Error setting up ${engine}-core: ${error.message}`, 'red');
        }
        
        log('');
    }
    
    // Browser detection
    log('🌐 Detecting browsers...', 'blue');
    const { getBrowserPath } = await import('./stealth-patcher.js');
    const browserPath = getBrowserPath();
    
    if (browserPath) {
        log(`🎉 Found browser: ${browserPath}`, 'green');
    } else {
        log('⚠️  No browser detected automatically.', 'yellow');
        log('Please install Chrome, Chromium, or Brave browser.', 'yellow');
    }
    
    log('');
    
    // Usage instructions
    log('🎓 USAGE INSTRUCTIONS:', 'bright');
    log('=' + '='.repeat(25), 'bright');
    log('');
    
    if (selectedEngines.includes('puppeteer')) {
        log('🎭 For Puppeteer-core:', 'cyan');
        log('   npm run test-puppeteer     # Test with Puppeteer');
        log('   npm run patch-puppeteer    # Re-apply patches');
        log('');
    }
    
    if (selectedEngines.includes('playwright')) {
        log('🎪 For Playwright-core:', 'magenta');
        log('   npm run test-playwright    # Test with Playwright');
        log('   npm run patch-playwright   # Re-apply patches');
        log('');
    }
    
    log('🔧 General commands:', 'yellow');
    log('   npm run test-detection     # Test stealth effectiveness');
    log('   npm run setup              # Run this wizard again');
    log('');
    
    log('📚 Example Usage:', 'blue');
    log('');
    
    if (selectedEngines.includes('puppeteer')) {
        log('```javascript', 'cyan');
        log('import puppeteer from \'puppeteer-core\';', 'cyan');
        log('', 'cyan');
        log('// Environment variables for stealth', 'cyan');
        log('process.env.REBROWSER_STEALTH_MODE = \'comprehensive\';', 'cyan');
        log('', 'cyan');
        log('const browser = await puppeteer.launch({', 'cyan');
        log('    executablePath: \'/path/to/browser\',', 'cyan');
        log('    headless: false', 'cyan');
        log('});', 'cyan');
        log('```', 'cyan');
        log('');
    }
    
    if (selectedEngines.includes('playwright')) {
        log('```javascript', 'magenta');
        log('import { chromium } from \'playwright-core\';', 'magenta');
        log('', 'magenta');
        log('// Environment variables for stealth', 'magenta');
        log('process.env.REBROWSER_STEALTH_MODE = \'comprehensive\';', 'magenta');
        log('', 'magenta');
        log('const browser = await chromium.launch({', 'magenta');
        log('    executablePath: \'/path/to/browser\',', 'magenta');
        log('    headless: false', 'magenta');
        log('});', 'magenta');
        log('```', 'magenta');
        log('');
    }
    
    log('🏆 Setup completed successfully!', 'green');
    log('🛡️  Your automation is now protected against bot detection.', 'green');
    log('');
    log('💡 Tip: Test your setup with the bot detector at:', 'blue');
    log('   https://bot-detector.rebrowser.net/', 'blue');
    log('');
}

// Run the wizard
main().catch(error => {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
});
