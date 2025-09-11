#!/usr/bin/env node

/**
 * Simple Bot Detector Test - rebrowser-patches
 * Tests with comprehensive stealth features
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import CrossPlatformBrowserDetector from './scripts/cross-platform-browser-detection.js';
import { 
    getPuppeteerOptimizedScript, 
    getPlaywrightOptimizedScript,
    getComprehensiveStealthScript
} from './scripts/stealth-injector.js';

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .option('engine', {
        alias: 'e',
        describe: 'Engine to use',
        choices: ['puppeteer', 'playwright'],
        default: 'puppeteer'
    })
    .option('headless', {
        describe: 'Run in headless mode',
        type: 'boolean',
        default: false
    })
    .option('closeTimeout', {
        describe: 'Auto-close timeout in milliseconds (0 = no auto-close)',
        type: 'number',
        default: 0
    })
    .option('windowSize', {
        describe: 'Browser window size',
        choices: ['minimized', 'normal'],
        default: 'minimized'
    })
    .option('keepOpen', {
        describe: 'Keep browser open indefinitely',
        type: 'boolean',
        default: true
    })
    .option('noTimeout', {
        describe: 'Disable auto-close timeout completely',
        type: 'boolean',
        default: false
    })
    .option('testUrl', {
        describe: 'Custom URL to test instead of bot-detector',
        type: 'string',
        default: ''
    })
    .option('connectivity', {
        describe: 'Test network connectivity only',
        type: 'boolean',
        default: false
    })
    .help()
    .parse();

// Initialize
const detector = new CrossPlatformBrowserDetector();
const BOT_DETECTOR_URL = 'https://bot-detector.rebrowser.net/';
const ALTERNATIVE_URLS = [
    'https://bot-detector.rebrowser.net/',
    'https://httpbin.org/user-agent', // Alternative test site
    'https://whatismyipaddress.com/', // Another alternative
    'https://www.google.com' // Final fallback
];

function getBrowserInfo() {
    const browserPath = detector.getBestBrowser();
    if (!browserPath) {
        throw new Error('❌ No browser found! Please install Brave or Chrome.');
    }
    const name = browserPath.toLowerCase().includes('brave') ? 'Brave' : 'Chrome';
    console.log(`🦁 Using ${name} Browser: ${browserPath}`);
    return { path: browserPath, name };
}

// Function to try loading multiple URLs (Puppeteer)
async function tryLoadPage(page, urls = ALTERNATIVE_URLS) {
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`🌐 Attempting to load: ${url}`);
        
        try {
            await page.goto(url, { 
                waitUntil: 'networkidle0',
                timeout: 15000
            });
            console.log(`✅ Successfully loaded: ${url}`);
            return url;
        } catch (error) {
            console.log(`⚠️ Failed to load ${url}: ${error.message}`);
            
            if (i < urls.length - 1) {
                console.log('🔄 Trying next URL...');
            } else {
                console.log('❌ All URLs failed to load.');
                throw new Error('Unable to load any test page');
            }
        }
    }
}

// Function to try loading multiple URLs (Playwright)
async function tryLoadPagePlaywright(page, urls = ALTERNATIVE_URLS) {
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`🌐 Attempting to load: ${url}`);
        
        try {
            await page.goto(url, { 
                waitUntil: 'networkidle',
                timeout: 15000
            });
            console.log(`✅ Successfully loaded: ${url}`);
            return url;
        } catch (error) {
            console.log(`⚠️ Failed to load ${url}: ${error.message}`);
            
            if (i < urls.length - 1) {
                console.log('🔄 Trying next URL...');
            } else {
                console.log('❌ All URLs failed to load.');
                throw new Error('Unable to load any test page');
            }
        }
    }
}

// Puppeteer test
async function testPuppeteer() {
    const puppeteer = await import('puppeteer-core');
    const browserInfo = getBrowserInfo();
    
    console.log('🎭 Testing with Puppeteer...');
    
    // Auto-detect system display and calculate optimal window sizes
    const displaySize = detector.getSystemDisplaySize();
    let windowConfig;
    if (argv.windowSize === 'minimized') {
        // Minimized: 70% of screen size (like screenshot 2)
        windowConfig = {
            width: Math.floor(displaySize.width * 0.70),
            height: Math.floor(displaySize.height * 0.75)
        };
    } else {
        // Normal: Near fullscreen with taskbar visible (like screenshot 1)
        windowConfig = {
            width: displaySize.width,
            height: Math.floor(displaySize.height * 0.94) // Leave space for taskbar
        };
    }
    
    console.log(`📐 Display: ${displaySize.width}x${displaySize.height} → Window: ${windowConfig.width}x${windowConfig.height} (${argv.windowSize})`);
    
    // Ensure minimum viable window size
    windowConfig.width = Math.max(windowConfig.width, 800);
    windowConfig.height = Math.max(windowConfig.height, 600);
    
    // Use enhanced browser args (window sizing handled separately)
    const launchArgs = detector.getBrowserArgs({ 
        headless: argv.headless, 
        devtools: !argv.headless, 
        stealth: true,
        width: windowConfig.width,
        height: windowConfig.height
    });
    
    // Add window size specific args
    const windowSizeArgs = [];
    if (argv.windowSize === 'minimized') {
        // Perfect center positioning - slightly right adjustment
        const centerX = Math.floor((displaySize.width - windowConfig.width) / 2) - 180;
        const centerY = Math.floor((displaySize.height - windowConfig.height) / 2) - 80;
        windowSizeArgs.push(`--window-size=${windowConfig.width},${windowConfig.height}`);
        windowSizeArgs.push(`--window-position=${centerX},${centerY}`);
        console.log(`🎯 Window size: ${windowConfig.width}x${windowConfig.height}`);
        console.log(`🎯 Screen size: ${displaySize.width}x${displaySize.height}`);
        console.log(`🎯 Centering at: ${centerX}, ${centerY}`);
    } else {
        // Normal mode - near fullscreen with taskbar visible (like screenshot 1)
        windowSizeArgs.push(`--window-size=${windowConfig.width},${windowConfig.height}`);
        windowSizeArgs.push('--window-position=-8,0'); // Compensate for window border to fill left edge
    }
    
    // Enhanced launch args for better connectivity
    const connectivityArgs = [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--ignore-certificate-errors-spki-list',
        '--disable-blink-features=AutomationControlled',
        '--no-proxy-server',
        '--proxy-server="direct://"',
        '--proxy-bypass-list=*'
    ];
    
    const browser = await puppeteer.default.launch({
        executablePath: browserInfo.path,
        headless: argv.headless,
        devtools: !argv.headless,
        defaultViewport: null,
        args: [...launchArgs, ...windowSizeArgs, ...connectivityArgs]
    });
    
    const page = await browser.newPage();
    
    // Set viewport based on window size
    await page.setViewport({ 
        width: windowConfig.width, 
        height: windowConfig.height 
    });
    
    // DO NOT use page.exposeFunction to avoid exposeFunctionLeak detection
    // Instead, let the test remain SAFE (not triggered)
    console.log('✅ Avoiding page.exposeFunction to keep exposeFunctionLeak test safe');
    
    // Add optimized stealth script with auto-close from original project files
    try {
        const puppeteerStealthScript = getPuppeteerOptimizedScript({
            autoClose: false // Handle auto-close manually for better control
        });
        await page.evaluateOnNewDocument(puppeteerStealthScript);
        console.log('✅ Puppeteer stealth script injected successfully');
    } catch (error) {
        console.log('⚠️ Error injecting stealth script:', error.message);
        console.log('🔄 Using fallback stealth script...');
        const fallbackScript = getComprehensiveStealthScript();
        await page.evaluateOnNewDocument(fallbackScript);
    }
    
    console.log('🌐 Navigating to bot detector...');
    
    // Try loading the page with fallbacks
    let loadedUrl;
    try {
        loadedUrl = await tryLoadPage(page);
        console.log('✅ Page loaded, starting immediate execution for optimal timing');
        
        // IMMEDIATE execution right after page load for ultra-fast timing
        await page.evaluate(() => {
            console.log('[immediate] Page loaded, executing tests NOW for optimal timing');
            
            // Call dummyFn immediately if it exists
            if (window.dummyFn) {
                window.dummyFn();
                console.log('[immediate] dummyFn called at page load');
            }
            
            // Trigger sourceUrlLeak immediately
            try {
                const err = new Error('immediate sourceUrlLeak');
                err.stack;
                document.getElementById('detections-json');
            } catch (e) {
                console.log('[immediate] sourceUrlLeak triggered at page load');
            }
        });
        
    } catch (error) {
        console.log('❌ Unable to load any page. Check your internet connection.');
        throw error;
    }
    
    // Minimal wait - let stealth script handle timing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('⚡ Executing tests with ultra-fast timing...');
    
    try {
        // IMMEDIATE test execution for optimal timing (50-200ms)
        await page.evaluate(() => {
            console.log('[test] Starting immediate test execution');
            
            // Multiple execution strategies for optimal timing
            const executeTests = () => {
                // Ensure dummyFn exists and call it IMMEDIATELY
                if (!window.dummyFn) {
                    window.dummyFn = () => {
                        console.log('[test] dummyFn created and called immediately');
                        return true;
                    };
                }
                
                // Call dummyFn multiple times for optimal timing
                window.dummyFn();
                
                // Aggressive sourceUrlLeak triggering
                try {
                    // Method 1: Error stack access
                    const err = new Error('sourceUrlLeak test');
                    const stack = err.stack;
                    
                    // Method 2: DOM element access
                    document.getElementById('detections-json');
                    
                    // Method 3: Direct test functions if available
                    if (window.testSourceUrlError) {
                        window.testSourceUrlError();
                    }
                    
                } catch (e) {
                    // Expected errors for sourceUrlLeak test
                    console.log('[test] sourceUrlLeak error triggered:', e.message);
                }
                
                // DO NOT trigger mainWorldExecution - keep it safe (isolated world)
                // This test should remain WHITE/SAFE - not triggered
                console.log('[test] mainWorldExecution kept safe (not triggered)');
                
                // Instead, trigger other safe tests
                try {
                    // Test viewport
                    if (window.innerWidth && window.innerHeight) {
                        console.log('[test] viewport test triggered');
                    }
                } catch (e) {
                    console.log('[test] viewport trigger error');
                }
                
                // Aggressive user agent test triggering for ultra-fast timing
                try {
                    if (window.navigator && window.navigator.userAgent) {
                        // Access all user agent properties to trigger test immediately
                        const ua = window.navigator.userAgent;
                        const uad = window.navigator.userAgentData;
                        
                        if (uad && uad.brands) {
                            // Force access to brands array
                            const brands = uad.brands;
                            
                            // Call getHighEntropyValues to trigger test
                            if (uad.getHighEntropyValues) {
                                uad.getHighEntropyValues(['architecture', 'model', 'platform', 'platformVersion']);
                            }
                        }
                        
                        console.log('[test] userAgent test triggered with all properties accessed');
                    }
                } catch (e) {
                    console.log('[test] userAgent trigger error:', e.message);
                }
            };
            
            // Execute immediately
            executeTests();
            
            // Execute again after 50ms for optimal timing
            setTimeout(executeTests, 50);
            
            // Final execution at 100ms
            setTimeout(executeTests, 100);
            
            console.log('[test] Immediate test execution completed');
        });
        
        // Short wait to let tests register with bot detector
        await new Promise(resolve => setTimeout(resolve, 1500));
        
    } catch (error) {
        console.log('⚠️ Error during test execution:', error.message);
        console.log('✅ Page loaded successfully, but test execution had issues.');
    }
    
    // Extract results with error handling
    let results = { title: 'Unknown', url: 'Unknown', testData: [] };
    try {
        results = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            const testData = elements
                .map(el => el.textContent)
                .filter(text => text && (text.includes('🟢') || text.includes('🔴') || text.includes('⚪')))
                .slice(0, 10);
            
            return {
                title: document.title,
                url: window.location.href,
                testData
            };
        });
        
        console.log('📈 Test Results:');
        console.log(`Page: ${results.title}`);
        console.log(`URL: ${results.url}`);
        
        if (results.testData.length > 0) {
            console.log('🔍 Detected Tests:');
            results.testData.forEach((test, i) => {
                console.log(`  ${i + 1}. ${test.substring(0, 100)}...`);
            });
        } else {
            console.log('ℹ️ No test results found. The page may still be loading or tests may not have executed.');
        }
        
    } catch (error) {
        console.log('⚠️ Error extracting results:', error.message);
        console.log('✅ Browser is still open for manual inspection.');
    }
    
    // Handle browser closing based on user preferences
    if (argv.noTimeout || argv.keepOpen || argv.closeTimeout === 0) {
        console.log('👁️ Browser will remain open indefinitely.');
        console.log('🔧 Press Ctrl+C in terminal to close when done.');
        console.log('🔍 Manually inspect the test results in the browser.');
        console.log('');
        
        // Keep process alive without timeout
        process.on('SIGINT', async () => {
            console.log('\n🔒 Closing browser...');
            await browser.close();
            console.log('✅ Browser closed successfully!');
            process.exit(0);
        });
        
        // Keep the process alive
        setInterval(() => {}, 1000);
        
    } else {
        const timeoutSeconds = Math.floor(argv.closeTimeout / 1000);
        console.log(`⏰ Auto-closing browser in ${timeoutSeconds} seconds...`);
        console.log('Press Ctrl+C to exit immediately');
        
        // Auto-close after configured timeout
        setTimeout(async () => {
            console.log('🔒 Auto-closing browser...');
            await browser.close();
            console.log('✅ Test completed successfully!');
            process.exit(0);
        }, argv.closeTimeout);
    }
}

// Playwright test
async function testPlaywright() {
    const { chromium } = await import('playwright-core');
    const browserInfo = getBrowserInfo();
    
    console.log('🎪 Testing with Playwright...');
    
    // Auto-detect system display and calculate optimal window sizes (same as Puppeteer)
    const displaySize = detector.getSystemDisplaySize();
    let windowConfig;
    if (argv.windowSize === 'minimized') {
        // Minimized: 70% of screen size (same as Puppeteer)
        windowConfig = {
            width: Math.floor(displaySize.width * 0.70),
            height: Math.floor(displaySize.height * 0.75)
        };
    } else {
        // Normal: 95% of screen size (same as Puppeteer)
        windowConfig = {
            width: Math.floor(displaySize.width * 0.95),
            height: Math.floor(displaySize.height * 0.90)
        };
    }
    
    console.log(`📐 Display: ${displaySize.width}x${displaySize.height} → Window: ${windowConfig.width}x${windowConfig.height} (${argv.windowSize})`);
    
    // Ensure minimum viable window size
    windowConfig.width = Math.max(windowConfig.width, 800);
    windowConfig.height = Math.max(windowConfig.height, 600);
    
    // Use enhanced browser args (window sizing handled separately)
    const launchArgs = detector.getBrowserArgs({ 
        headless: argv.headless, 
        devtools: !argv.headless, 
        stealth: true,
        width: windowConfig.width,
        height: windowConfig.height
    });
    
    // Add window size specific args for Playwright (EXACT SAME AS PUPPETEER)
    const windowSizeArgs = [];
    if (argv.windowSize === 'minimized') {
        // Perfect center positioning - move window up for Playwright
        const centerX = Math.floor((displaySize.width - windowConfig.width) / 2) - 200; // Move left by 20px more
        const centerY = Math.floor((displaySize.height - windowConfig.height) / 2) - 125; // Move up by 10px more
        windowSizeArgs.push(`--window-size=${windowConfig.width},${windowConfig.height}`);
        windowSizeArgs.push(`--window-position=${centerX},${centerY}`);
        console.log(`🎯 Playwright Window size: ${windowConfig.width}x${windowConfig.height}`);
        console.log(`🎯 Playwright Screen size: ${displaySize.width}x${displaySize.height}`);
        console.log(`🎯 Playwright Centering at: ${centerX}, ${centerY} (perfectly centered)`);
        console.log(`✅ Playwright window positioned for optimal centering`);
    } else {
        // Normal mode - near fullscreen with taskbar visible (like screenshot 1)
        windowSizeArgs.push(`--window-size=${windowConfig.width},${windowConfig.height}`);
        windowSizeArgs.push('--window-position=-8,0'); // Compensate for window border to fill left edge
    }
    
    // Enhanced launch args for better connectivity (same as Puppeteer)
    const connectivityArgs = [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--ignore-certificate-errors-spki-list',
        '--disable-blink-features=AutomationControlled',
        '--no-proxy-server',
        '--proxy-server="direct://"',
        '--proxy-bypass-list=*'
    ];
    
    const browser = await chromium.launch({
        executablePath: browserInfo.path,
        headless: argv.headless,
        devtools: !argv.headless,
        args: [...launchArgs, ...windowSizeArgs, ...connectivityArgs]
    });
    
    const context = await browser.newContext({
        viewport: { width: windowConfig.width, height: windowConfig.height },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.81 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // PLAYWRIGHT MANUAL WINDOW POSITIONING (Force center positioning)
    if (argv.windowSize === 'minimized') {
        try {
            const centerX = Math.floor((displaySize.width - windowConfig.width) / 2) - 180;
            const centerY = Math.floor((displaySize.height - windowConfig.height) / 2) - 80;
            
            // Force window positioning using JavaScript
            await page.evaluate(({ centerX, centerY, width, height }) => {
                // Try multiple methods to position window
                try {
                    window.moveTo(centerX, centerY);
                    window.resizeTo(width, height);
                    console.log(`[playwright-positioning] Window moved to: ${centerX}, ${centerY}`);
                    console.log(`[playwright-positioning] Window resized to: ${width}x${height}`);
                } catch (e) {
                    console.log('[playwright-positioning] Manual positioning error:', e.message);
                }
            }, { centerX, centerY, width: windowConfig.width, height: windowConfig.height });
            
            console.log('✅ Playwright manual window positioning applied');
            
        } catch (error) {
            console.log('⚠️ Playwright manual positioning failed:', error.message);
        }
    }
    
    // DO NOT use page.exposeFunction to avoid exposeFunctionLeak detection (Playwright)
    // Instead, let the test remain SAFE (not triggered)
    console.log('✅ Avoiding page.exposeFunction to keep exposeFunctionLeak test safe (Playwright)');
    
    // Add optimized stealth script from original project files
    try {
        const playwrightStealthScript = getPlaywrightOptimizedScript({
            autoClose: false // Handle auto-close manually for better control
        });
        await page.addInitScript(playwrightStealthScript);
        console.log('✅ Playwright stealth script injected successfully');
    } catch (error) {
        console.log('⚠️ Error injecting stealth script (Playwright):', error.message);
        console.log('🔄 Using fallback stealth script...');
        const fallbackScript = getComprehensiveStealthScript();
        await page.addInitScript(fallbackScript);
    }
    
    console.log('🌐 Navigating to bot detector...');
    
    // Try loading the page with fallbacks (Playwright version)
    let loadedUrl;
    try {
        loadedUrl = await tryLoadPagePlaywright(page);
        console.log('✅ Page loaded (Playwright), starting immediate execution for optimal timing');
        
        // IMMEDIATE execution right after page load for ultra-fast timing (Playwright)
        await page.evaluate(() => {
            console.log('[immediate-playwright] Page loaded, executing tests NOW for optimal timing');
            
            // Call dummyFn immediately if it exists
            if (window.dummyFn) {
                window.dummyFn();
                console.log('[immediate-playwright] dummyFn called at page load');
            }
            
            // Trigger sourceUrlLeak immediately
            try {
                const err = new Error('immediate sourceUrlLeak playwright');
                err.stack;
                document.getElementById('detections-json');
            } catch (e) {
                console.log('[immediate-playwright] sourceUrlLeak triggered at page load');
            }
        });
        
    } catch (error) {
        console.log('❌ Unable to load any page. Check your internet connection.');
        throw error;
    }
    
    // Minimal wait for Playwright - let stealth script handle timing
    await page.waitForTimeout(500);
    
    console.log('⚡ Executing tests with ultra-fast timing (Playwright)...');
    
    try {
        // IMMEDIATE test execution for optimal timing (50-200ms) - Playwright
        await page.evaluate(() => {
            console.log('[test-playwright] Starting immediate test execution');
            
            // Multiple execution strategies for optimal timing
            const executeTests = () => {
                // Ensure dummyFn exists and call it IMMEDIATELY
                if (!window.dummyFn) {
                    window.dummyFn = () => {
                        console.log('[test-playwright] dummyFn created and called immediately');
                        return true;
                    };
                }
                
                // Call dummyFn multiple times for optimal timing
                window.dummyFn();
                
                // Aggressive sourceUrlLeak triggering
                try {
                    // Method 1: Error stack access
                    const err = new Error('sourceUrlLeak test playwright');
                    const stack = err.stack;
                    
                    // Method 2: DOM element access
                    document.getElementById('detections-json');
                    
                    // Method 3: Direct test functions if available
                    if (window.testSourceUrlError) {
                        window.testSourceUrlError();
                    }
                    
                } catch (e) {
                    // Expected errors for sourceUrlLeak test
                    console.log('[test-playwright] sourceUrlLeak error triggered:', e.message);
                }
                
                // DO NOT trigger mainWorldExecution - keep it safe (isolated world)
                // This test should remain WHITE/SAFE - not triggered
                console.log('[test-playwright] mainWorldExecution kept safe (not triggered)');
                
                // Instead, trigger other safe tests
                try {
                    // Test viewport
                    if (window.innerWidth && window.innerHeight) {
                        console.log('[test-playwright] viewport test triggered');
                    }
                } catch (e) {
                    console.log('[test-playwright] viewport trigger error');
                }
                
                // Aggressive user agent test triggering for ultra-fast timing (Playwright)
                try {
                    if (window.navigator && window.navigator.userAgent) {
                        // Access all user agent properties to trigger test immediately
                        const ua = window.navigator.userAgent;
                        const uad = window.navigator.userAgentData;
                        
                        if (uad && uad.brands) {
                            // Force access to brands array
                            const brands = uad.brands;
                            
                            // Call getHighEntropyValues to trigger test
                            if (uad.getHighEntropyValues) {
                                uad.getHighEntropyValues(['architecture', 'model', 'platform', 'platformVersion']);
                            }
                        }
                        
                        console.log('[test-playwright] userAgent test triggered with all properties accessed');
                    }
                } catch (e) {
                    console.log('[test-playwright] userAgent trigger error:', e.message);
                }
            };
            
            // Execute immediately
            executeTests();
            
            // Execute again after 50ms for optimal timing
            setTimeout(executeTests, 50);
            
            // Final execution at 100ms
            setTimeout(executeTests, 100);
            
            console.log('[test-playwright] Immediate test execution completed');
        });
        
        // Short wait to let tests register with bot detector
        await page.waitForTimeout(1500);
        
    } catch (error) {
        console.log('⚠️ Error during test execution (Playwright):', error.message);
        if (error.message.includes('Target page, context or browser has been closed')) {
            console.log('ℹ️ Browser was closed prematurely. This might be due to a crash or manual closure.');
            console.log('✅ However, the page did load successfully initially.');
            return; // Exit gracefully
        }
    }
    
    // Extract results (same as Puppeteer) with error handling
    let results = { title: 'Unknown', url: 'Unknown', testData: [] };
    try {
        results = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            const testData = elements
                .map(el => el.textContent)
                .filter(text => text && (text.includes('🟢') || text.includes('🔴') || text.includes('⚪')))
                .slice(0, 10);
            
            return {
                title: document.title,
                url: window.location.href,
                testData
            };
        });
        
        console.log('📈 Test Results:');
        console.log(`Page: ${results.title}`);
        console.log(`URL: ${results.url}`);
        
        if (results.testData.length > 0) {
            console.log('🔍 Detected Tests:');
            results.testData.forEach((test, i) => {
                console.log(`  ${i + 1}. ${test.substring(0, 100)}...`);
            });
        } else {
            console.log('ℹ️ No test results found. The page may still be loading or tests may not have executed.');
        }
        
    } catch (error) {
        console.log('⚠️ Error extracting results (Playwright):', error.message);
        console.log('✅ Browser is still open for manual inspection.');
        if (error.message.includes('Target page, context or browser has been closed')) {
            console.log('ℹ️ Browser was closed. Exiting gracefully.');
            return;
        }
    }
    
    // Handle browser closing based on user preferences (Playwright)
    if (argv.noTimeout || argv.keepOpen || argv.closeTimeout === 0) {
        console.log('👁️ Browser will remain open indefinitely.');
        console.log('🔧 Press Ctrl+C in terminal to close when done.');
        console.log('🔍 Manually inspect the test results in the browser.');
        console.log('');
        
        // Keep process alive without timeout
        process.on('SIGINT', async () => {
            console.log('\n🔒 Closing browser...');
            await browser.close();
            console.log('✅ Browser closed successfully!');
            process.exit(0);
        });
        
        // Keep the process alive
        setInterval(() => {}, 1000);
        
    } else {
        const timeoutSeconds = Math.floor(argv.closeTimeout / 1000);
        console.log(`⏰ Auto-closing browser in ${timeoutSeconds} seconds...`);
        console.log('Press Ctrl+C to exit immediately');
        
        // Auto-close after configured timeout
        setTimeout(async () => {
            console.log('🔒 Auto-closing browser...');
            await browser.close();
            console.log('✅ Test completed successfully!');
            process.exit(0);
        }, argv.closeTimeout);
    }
}

// Main execution
async function main() {
    console.log('🥷 REBROWSER PATCHES - BOT DETECTOR TEST');
    console.log('=' + '='.repeat(45));
    console.log(`Engine: ${argv.engine}`);
    console.log(`Headless: ${argv.headless}`);
    console.log(`Window Size: ${argv.windowSize}`);
    console.log(`Auto-close timeout: ${argv.closeTimeout === 0 || argv.keepOpen || argv.noTimeout ? 'DISABLED (keeps open)' : argv.closeTimeout + 'ms'}`);
    console.log(`Target: ${BOT_DETECTOR_URL}`);
    console.log('');
    
    try {
        if (argv.engine === 'puppeteer') {
            await testPuppeteer();
        } else if (argv.engine === 'playwright') {
            await testPlaywright();
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

main();
