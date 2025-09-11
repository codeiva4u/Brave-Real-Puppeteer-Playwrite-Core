#!/usr/bin/env node

/**
 * Test script for https://bot-detector.rebrowser.net/
 * Tests comprehensive stealth capabilities
 */

import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

// Brave browser executable paths
const BRAVE_PATHS = {
    win32: [
        'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
        'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
        process.env.LOCALAPPDATA + '\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
    ],
    darwin: [
        '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
    ],
    linux: [
        '/usr/bin/brave-browser',
        '/usr/bin/brave',
        '/snap/bin/brave'
    ]
};

function findBraveExecutable() {
    const platform = process.platform;
    const paths = BRAVE_PATHS[platform] || [];
    
    for (const path of paths) {
        if (existsSync(path)) {
            return path;
        }
    }
    
    console.log('🔍 Brave browser not found, falling back to Chrome...');
    return null; // Will use Puppeteer's default Chrome
}

async function runBotDetectorTest(options = {}) {
    const { 
        headless = false,
        mobile = false,
        brave = true 
    } = options;
    
    console.log('🛡️ Starting Advanced Stealth Bot Detection Test...');
    console.log(`📱 Mobile: ${mobile ? 'YES' : 'NO'}`);
    console.log(`🎭 Headless: ${headless ? 'YES' : 'NO'}`);
    console.log(`🦁 Brave Browser: ${brave ? 'YES (preferred)' : 'NO (Chrome fallback)'}`);
    
    // Set mobile simulation environment variable if needed
    if (mobile) {
        process.env.REBROWSER_MOBILE_SIMULATION = '1';
    }
    
    const launchOptions = {
        headless,
        defaultViewport: mobile ? { width: 390, height: 844 } : { width: 1920, height: 1080 },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-client-side-phishing-detection',
            '--disable-default-apps',
            '--disable-hang-monitor',
            '--disable-prompt-on-repost',
            '--disable-sync',
            '--metrics-recording-only',
            '--safebrowsing-disable-auto-update',
            '--enable-automation=false',
            '--password-store=basic',
            '--use-mock-keychain'
        ]
    };
    
    // Try to use Brave browser if available
    if (brave) {
        const braveExecutable = findBraveExecutable();
        if (braveExecutable) {
            launchOptions.executablePath = braveExecutable;
            console.log('🦁 Using Brave Browser:', braveExecutable);
        }
    }
    
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    // Set additional user agent for mobile if needed
    if (mobile) {
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    } else {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');
    }
    
    try {
        console.log('🌐 Navigating to bot detector...');
        await page.goto('https://bot-detector.rebrowser.net/', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        console.log('🎯 Running required test triggers...');
        
        // Required test triggers as per the website
        console.log('1. Calling dummyFn...');
        await page.evaluate(() => {
            if (typeof window.dummyFn === 'function') {
                window.dummyFn();
            }
        });
        
        console.log('2. Triggering exposeFunctionLeak...');
        await page.exposeFunction('exposedFn', () => {
            console.log('exposedFn called');
        });
        
        console.log('3. Triggering sourceUrlLeak...');
        await page.evaluate(() => document.getElementById('detections-json'));
        
        console.log('4. Triggering mainWorldExecution...');
        await page.evaluate(() => document.getElementsByClassName('div'));
        
        // Wait for tests to complete
        console.log('⏱️ Waiting for tests to complete...');
        await page.waitForSelector('#detections-json', { timeout: 10000 }).catch(() => {});
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Get test results
        console.log('📊 Getting test results...');
        const results = await page.evaluate(() => {
            const jsonElement = document.getElementById('detections-json');
            if (jsonElement) {
                try {
                    return JSON.parse(jsonElement.textContent);
                } catch (e) {
                    return { error: 'Failed to parse results', text: jsonElement.textContent };
                }
            }
            return { error: 'Results element not found' };
        });
        
        console.log('\n📋 TEST RESULTS:');
        console.log('================');
        
        if (results.error) {
            console.log('❌ Error getting results:', results.error);
            if (results.text) {
                console.log('Raw text:', results.text);
            }
        } else {
            let passCount = 0;
            let totalCount = 0;
            
            for (const [test, result] of Object.entries(results)) {
                totalCount++;
                const status = result === 'PASSED' || result === true ? '✅ PASS' : '❌ FAIL';
                if (result === 'PASSED' || result === true) passCount++;
                console.log(`${status} ${test}: ${result}`);
            }
            
            console.log('================');
            console.log(`📊 SUMMARY: ${passCount}/${totalCount} tests passed (${Math.round(passCount/totalCount*100)}%)`);
            
            if (passCount === totalCount) {
                console.log('🎉 ALL TESTS PASSED! Perfect stealth! 🛡️');
            } else {
                console.log('⚠️  Some tests failed. Stealth needs improvement.');
            }
        }
        
        // Keep browser open for manual inspection if not headless
        if (!headless) {
            console.log('\n🔍 Browser kept open for manual inspection...');
            console.log('Press Ctrl+C to close');
            
            // Keep alive
            await new Promise(() => {});
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (headless) {
            await browser.close();
        }
    }
}

// CLI handling
const args = process.argv.slice(2);
const options = {
    headless: args.includes('--headless'),
    mobile: args.includes('--mobile'),
    brave: !args.includes('--no-brave')
};

// Run the test
runBotDetectorTest(options).catch(console.error);

export { runBotDetectorTest };
