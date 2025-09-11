import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { platform, arch } from 'os';
import path from 'path';

/**
 * Cross-Platform Browser Detection Module
 * Supports: Linux (x64/arm64), macOS (Intel/Apple Silicon), Windows (x64/arm64)
 * Features: Brave auto-detection, Xvfb support, Registry detection
 */

class CrossPlatformBrowserDetector {
    constructor() {
        this.platform = platform();
        this.arch = arch();
        this.xvfbAvailable = false;
        this.detectedBrowsers = {};
    }

    /**
     * Get system display dimensions
     */
    getSystemDisplaySize() {
        try {
            let width = 1920;
            let height = 1080;
            
            switch (this.platform) {
                case 'win32':
                    try {
                        // Method 1: PowerShell with System.Windows.Forms (most accurate)
                        const result = execSync('powershell "Add-Type -AssemblyName System.Windows.Forms; $screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; Write-Output \"$($screen.Width)x$($screen.Height)\""', { encoding: 'utf8', stdio: 'pipe' });
                        const match = result.trim().match(/(\d+)x(\d+)/);
                        if (match) {
                            width = parseInt(match[1]) || 1920;
                            height = parseInt(match[2]) || 1080;
                        }
                    } catch (e) {
                        try {
                            // Method 2: WMI Query
                            const result = execSync('wmic desktopmonitor get screenwidth,screenheight /format:csv', { encoding: 'utf8', stdio: 'pipe' });
                            const lines = result.split('\n').filter(line => line.includes(','));
                            if (lines.length > 0) {
                                const parts = lines[0].split(',');
                                if (parts.length >= 3) {
                                    height = parseInt(parts[1]) || 1080;
                                    width = parseInt(parts[2]) || 1920;
                                }
                            }
                        } catch (e2) {
                            try {
                                // Method 3: PowerShell alternative syntax
                                const result = execSync('powershell "(Get-WmiObject -Class Win32_VideoController).CurrentHorizontalResolution, (Get-WmiObject -Class Win32_VideoController).CurrentVerticalResolution"', { encoding: 'utf8', stdio: 'pipe' });
                                const values = result.trim().split('\n').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
                                if (values.length >= 2) {
                                    width = values[0] || 1920;
                                    height = values[1] || 1080;
                                }
                            } catch (e3) {
                                console.log('[display-detect] Windows: All methods failed, using default resolution');
                            }
                        }
                    }
                    break;
                    
                case 'darwin':
                    try {
                        const result = execSync('system_profiler SPDisplaysDataType | grep Resolution', { encoding: 'utf8', stdio: 'pipe' });
                        const match = result.match(/(\d+)\s*x\s*(\d+)/);
                        if (match) {
                            width = parseInt(match[1]) || 1920;
                            height = parseInt(match[2]) || 1080;
                        }
                    } catch (e) {
                        console.log('[display-detect] macOS: Using default resolution');
                    }
                    break;
                    
                case 'linux':
                    try {
                        const result = execSync('xrandr | grep "*" | head -1', { encoding: 'utf8', stdio: 'pipe' });
                        const match = result.match(/(\d+)x(\d+)/);
                        if (match) {
                            width = parseInt(match[1]) || 1920;
                            height = parseInt(match[2]) || 1080;
                        }
                    } catch (e) {
                        console.log('[display-detect] Linux: Using default resolution');
                    }
                    break;
            }
            
            console.log(`[display-detect] Detected resolution: ${width}x${height}`);
            return { width, height };
        } catch (error) {
            console.log('[display-detect] Error detecting display, using defaults: 1920x1080');
            return { width: 1920, height: 1080 };
        }
    }

    /**
     * Auto-detect Xvfb on Linux systems
     */
    detectXvfb() {
        if (this.platform !== 'linux') return false;
        
        try {
            execSync('which xvfb-run', { stdio: 'ignore' });
            this.xvfbAvailable = true;
            console.log('✅ Xvfb detected and available for headless Linux operation');
            return true;
        } catch {
            try {
                execSync('dpkg -l | grep xvfb', { stdio: 'ignore' });
                this.xvfbAvailable = true;
                console.log('✅ Xvfb package detected');
                return true;
            } catch {
                console.log('❌ Xvfb not found. Install with: sudo apt-get install xvfb');
                return false;
            }
        }
    }

    /**
     * Windows Registry-based Brave browser detection
     */
    detectBraveWindows() {
        const registryPaths = [
            'HKEY_LOCAL_MACHINE\\SOFTWARE\\BraveSoftware\\Brave-Browser\\Application',
            'HKEY_CURRENT_USER\\SOFTWARE\\BraveSoftware\\Brave-Browser\\Application',
            'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\BraveSoftware\\Brave-Browser\\Application'
        ];

        for (const regPath of registryPaths) {
            try {
                const result = execSync(`reg query "${regPath}" /v Version`, { encoding: 'utf8', stdio: 'pipe' });
                if (result.includes('Version')) {
                    // Try to get the installation path
                    try {
                        const pathResult = execSync(`reg query "${regPath}" /v Path`, { encoding: 'utf8', stdio: 'pipe' });
                        const pathMatch = pathResult.match(/Path\s+REG_SZ\s+(.+)/);
                        if (pathMatch) {
                            return path.join(pathMatch[1], 'brave.exe');
                        }
                    } catch {}
                }
            } catch {}
        }

        // Fallback to common installation paths
        const commonPaths = [
            'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
            'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
            `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
            `${process.env.PROGRAMFILES}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`
        ];

        return commonPaths.find(path => existsSync(path)) || null;
    }

    /**
     * macOS Brave browser detection
     */
    detectBraveMacOS() {
        const commonPaths = [
            '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
            '/Applications/Brave Browser Beta.app/Contents/MacOS/Brave Browser Beta',
            '/Applications/Brave Browser Dev.app/Contents/MacOS/Brave Browser Dev',
            '/Applications/Brave Browser Nightly.app/Contents/MacOS/Brave Browser Nightly'
        ];

        // Check common application paths
        const foundPath = commonPaths.find(path => existsSync(path));
        if (foundPath) return foundPath;

        // Try to find via spotlight/mdfind
        try {
            const result = execSync('mdfind "kMDItemCFBundleIdentifier = com.brave.Browser"', { encoding: 'utf8', stdio: 'pipe' });
            const lines = result.trim().split('\n');
            for (const line of lines) {
                if (line.endsWith('.app')) {
                    const execPath = path.join(line, 'Contents/MacOS/Brave Browser');
                    if (existsSync(execPath)) return execPath;
                }
            }
        } catch {}

        return null;
    }

    /**
     * Linux Brave browser detection
     */
    detectBraveLinux() {
        // Try to find via which command
        try {
            const result = execSync('which brave-browser', { encoding: 'utf8', stdio: 'pipe' }).trim();
            if (result && existsSync(result)) return result;
        } catch {}

        try {
            const result = execSync('which brave', { encoding: 'utf8', stdio: 'pipe' }).trim();
            if (result && existsSync(result)) return result;
        } catch {}

        // Common Linux installation paths
        const commonPaths = [
            '/usr/bin/brave-browser',
            '/usr/bin/brave',
            '/opt/brave.com/brave/brave-browser',
            '/opt/brave/brave-browser',
            '/snap/bin/brave',
            '/var/lib/flatpak/app/com.brave.Browser/current/active/export/bin/com.brave.Browser',
            `${process.env.HOME}/.local/share/flatpak/app/com.brave.Browser/current/active/export/bin/com.brave.Browser`
        ];

        return commonPaths.find(path => existsSync(path)) || null;
    }

    /**
     * Detect Chrome as fallback
     */
    detectChrome() {
        let chromePaths = [];

        switch (this.platform) {
            case 'win32':
                chromePaths = [
                    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
                    `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`
                ];
                break;
            case 'darwin':
                chromePaths = [
                    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
                ];
                break;
            case 'linux':
                chromePaths = [
                    '/usr/bin/google-chrome',
                    '/usr/bin/google-chrome-stable',
                    '/usr/bin/chromium-browser',
                    '/usr/bin/chromium',
                    '/snap/bin/chromium'
                ];
                break;
        }

        return chromePaths.find(path => existsSync(path)) || null;
    }

    /**
     * Main browser detection method
     */
    detectBrowsers() {
        console.log(`🔍 Detecting browsers on ${this.platform} (${this.arch})...`);

        // Detect Xvfb first on Linux
        if (this.platform === 'linux') {
            this.detectXvfb();
        }

        // Detect Brave browser (priority)
        let bravePath = null;
        switch (this.platform) {
            case 'win32':
                bravePath = this.detectBraveWindows();
                break;
            case 'darwin':
                bravePath = this.detectBraveMacOS();
                break;
            case 'linux':
                bravePath = this.detectBraveLinux();
                break;
        }

        if (bravePath) {
            this.detectedBrowsers.brave = bravePath;
            console.log(`✅ Brave Browser found: ${bravePath}`);
        } else {
            console.log('❌ Brave Browser not found');
        }

        // Detect Chrome as fallback
        const chromePath = this.detectChrome();
        if (chromePath) {
            this.detectedBrowsers.chrome = chromePath;
            console.log(`✅ Chrome found: ${chromePath}`);
        }

        return this.detectedBrowsers;
    }

    /**
     * Get the best available browser path
     */
    getBestBrowser() {
        if (!Object.keys(this.detectedBrowsers).length) {
            this.detectBrowsers();
        }

        // Prefer Brave, fallback to Chrome
        return this.detectedBrowsers.brave || this.detectedBrowsers.chrome || null;
    }

    /**
     * Get enhanced browser launch arguments with auto window adjustment
     */
    getBrowserArgs(options = {}) {
        const {
            headless = false,
            devtools = false,
            stealth = true,
            width = 1920,
            height = 1080,
            autoAdjust = true
        } = options;

        let args = [];

        if (headless) {
            args.push('--headless=new');
        }
        // Window sizing is now handled by test.js - no auto-adjustment here

        if (devtools && !headless) {
            args.push('--auto-open-devtools-for-tabs');
        }

        // Enhanced stealth arguments
        if (stealth) {
            args.push(
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--exclude-switches=enable-automation',
                '--disable-extensions-file-access-check',
                '--disable-extensions-http-throttling',
                '--disable-extensions-except',
                '--disable-component-extensions-with-background-pages',
                '--disable-default-apps',
                '--disable-sync',
                '--disable-translate',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection',
                '--enable-features=NetworkService,NetworkServiceLogging',
                '--force-color-profile=srgb',
                '--metrics-recording-only',
                '--no-first-run',
                '--no-default-browser-check',
                '--no-pings',
                '--password-store=basic',
                '--use-mock-keychain',
                '--disable-component-update',
                '--disable-domain-reliability',
                '--disable-features=VizDisplayCompositor',
                '--run-all-compositor-stages-before-draw',
                '--disable-threaded-animation',
                '--disable-threaded-scrolling',
                '--disable-checker-imaging',
                '--disable-new-content-rendering-timeout',
                '--disable-image-animation-resync',
                '--disable-partial-raster',
                '--disable-skia-runtime-opts',
                '--disable-zero-copy',
                `--window-size=${width},${height}`
            );

            // Brave-specific optimizations
            if (this.detectedBrowsers.brave) {
                args.push(
                    '--disable-brave-rewards',
                    '--disable-brave-sync',
                    '--disable-brave-ads',
                    '--disable-brave-stats',
                    '--disable-brave-news'
                );
            }
        }

        return args;
    }

    /**
     * Get Xvfb command wrapper for Linux
     */
    getXvfbWrapper(command) {
        if (this.platform !== 'linux' || !this.xvfbAvailable) {
            return command;
        }

        return `xvfb-run --auto-servernum --server-args="-screen 0 1920x1080x24 -ac" ${command}`;
    }

    /**
     * Get platform info
     */
    getPlatformInfo() {
        return {
            platform: this.platform,
            arch: this.arch,
            xvfbAvailable: this.xvfbAvailable,
            detectedBrowsers: this.detectedBrowsers
        };
    }
}

export default CrossPlatformBrowserDetector;

// Export for direct usage
export { CrossPlatformBrowserDetector };
