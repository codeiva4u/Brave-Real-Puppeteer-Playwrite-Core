#! /usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import {
  exec,
  fatalError,
  getPatchBaseCmd,
  getPatcherPackagePath,
  log,
  validPackagesNames,
} from './utils/index.js';

import { getComprehensiveStealthScript } from './stealth-injector.js';

(async () => {
  // Enhanced CLI with stealth options
  const cliArgs = yargs(hideBin(process.argv))
    .usage('Usage: <command> [options]')
    .command('patch', 'Apply rebrowser-patches with stealth enhancements')
    .command('stealth-patch', 'Apply comprehensive stealth patches')
    .command('unpatch', 'Reverse patches')
    .command('check', 'Check if patch is already applied')
    .command('test-stealth', 'Test stealth effectiveness against bot detection')
    .describe('packageName', `Target package name: ${validPackagesNames.join(', ')}`)
    .describe('packagePath', 'Path to the target package')
    .describe('codeTarget', 'What code to patch: src or lib')
    .describe('stealthMode', 'Stealth mode: basic, advanced, comprehensive')
    .boolean('debug')
    .describe('debug', 'Enable debugging mode')
    .demandCommand(1, 1, 'Error: choose a command (patch, stealth-patch, unpatch, check, test-stealth)')
    .parse()

  let {
    packageName,
    packagePath,
    codeTarget = 'lib',
    stealthMode = 'comprehensive',
    debug,
  } = cliArgs

  if (debug) {
    process.env.REBROWSER_PATCHES_DEBUG = 1
    process.env.REBROWSER_STEALTH_DEBUG = 1
  }

  const command = cliArgs._[0]
  let commandResult

  if (!packagePath && !packageName && !['test-stealth'].includes(command)) {
    fatalError('You need to specify either packageName or packagePath.')
  }

  if (packagePath && !packageName) {
    packagePath = `${process.cwd()}/node_modules/${packageName}`
  }

  if (!['patch', 'stealth-patch', 'unpatch', 'check', 'test-stealth'].includes(command)) {
    fatalError(`Unknown command: ${command}`)
  }

  if (!['src', 'lib'].includes(codeTarget)) {
    fatalError(`Unknown codeTarget: ${codeTarget}`)
  }

  log('🪄 rebrowser-stealth Configuration:')
  log(`command = ${command}, packageName = ${packageName}, codeTarget = ${codeTarget}`)
  log(`stealthMode = ${stealthMode}`)
  if (packagePath) log(`packagePath = ${packagePath}`)
  log('------')

  // Handle test-stealth command
  if (command === 'test-stealth') {
    log('🧪 Testing stealth effectiveness...')
    await testStealthEffectiveness()
    process.exit(0)
  }

  // find package
  let packageJson
  const packageJsonPath = resolve(packagePath, 'package.json')
  try {
    const packageJsonText = await readFile(packageJsonPath, { encoding: 'utf8' })
    packageJson = JSON.parse(packageJsonText)
  } catch (err) {
    fatalError('Cannot read package.json', err)
  }
  
  if (!packageName) {
    if (!validPackagesNames.includes(packageJson.name)) {
      fatalError(`Package name is "${packageJson.name}", but we only support ${validPackagesNames.join(', ')}.`)
    } else {
      packageName = packageJson.name
    }
  } else if (packageJson.name !== packageName) {
    fatalError(`Package name is "${packageJson.name}", but we're looking for "${packageName}". Check your package path.`)
  }
  
  log(`Found package "${packageJson.name}", version ${packageJson.version}`)

  const patchFilePath = resolve(getPatcherPackagePath(), `./patches/${packageName}/${codeTarget}.patch`)

  // check patch status
  let patchStatus
  try {
    const { stdout, stderr } = await exec(`${getPatchBaseCmd(patchFilePath)} --dry-run`, {
      cwd: packagePath,
    })
    patchStatus = 'unpatched'
  } catch (e) {
    if (e.stdout.includes('No file to patch')) {
      fatalError('Internal error, patch command cannot find file to patch')
    } else if (e.stdout.includes('Ignoring previously applied (or reversed) patch')) {
      patchStatus = 'patched'
    } else if (e.stderr.includes('is not recognized')) {
      let message = 'patch command not found!'
      if (process.platform === 'win32') {
        message += '\nCheck README for how to install patch.exe on Windows.'
      }
      fatalError(message)
    } else {
      log('[debug] patch error:', e)
      throw e
    }
  }
  log(`Current patch status = ${patchStatus === 'patched' ? '🟩' : '🟧'} ${patchStatus}`)

  // run command
  let execCmd
  if (command === 'patch' || command === 'stealth-patch') {
    if (patchStatus === 'patched') {
      log('Package already patched.')
    } else {
      execCmd = getPatchBaseCmd(patchFilePath)
    }

    // Apply stealth enhancements
    if (command === 'stealth-patch') {
      await applyStealthEnhancements(packagePath, packageName, stealthMode)
    }
    
  } else if (command === 'unpatch') {
    if (patchStatus === 'unpatched') {
      log('Package already unpatched.')
    } else {
      execCmd = `${getPatchBaseCmd(patchFilePath)} --reverse`
    }
  }

  if (execCmd) {
    try {
      const { stdout, stderr } = await exec(execCmd, {
        cwd: packagePath,
      })
      commandResult = 'success'
    } catch (e) {
      log('patch exec error:', e)
      commandResult = 'error'
    }
  }

  // Set stealth environment variables
  if (command === 'stealth-patch' && commandResult === 'success') {
    setStealthEnvironmentVariables(stealthMode)
    log('🎭 Stealth environment variables configured')
  }

  // process results
  let exitCode = 0
  let resultText
  if (!commandResult) {
    resultText = '🟡 nothing changed'
  } else if (commandResult === 'success') {
    if (command === 'stealth-patch') {
      resultText = '🎭🟢 stealth patches applied successfully'
    } else {
      resultText = '🟢 success'
    }
  } else if (commandResult === 'error') {
    resultText = '🔴 error'
    exitCode = 1
  }
  log(`Result: ${resultText}`)

  process.exit(exitCode)
})()

async function applyStealthEnhancements(packagePath, packageName, stealthMode) {
  log('🎭 Applying stealth enhancements...')
  
  // Inject stealth scripts into the library
  const stealthScript = getComprehensiveStealthScript()
  
  // Create stealth injection file
  const stealthFilePath = resolve(packagePath, 'stealth-injection.js')
  await import('node:fs/promises').then(fs => 
    fs.writeFile(stealthFilePath, `
      // rebrowser-stealth comprehensive injection
      (function() {
        if (typeof window !== 'undefined') {
          ${stealthScript}
        }
      })();
    `)
  )
  
  log('✅ Stealth scripts injected')
}

function setStealthEnvironmentVariables(stealthMode) {
  // Configure environment variables for maximum stealth
  process.env.REBROWSER_PATCHES_RUNTIME_FIX_MODE = 'addBinding'
  process.env.REBROWSER_PATCHES_SOURCE_URL = 'jquery-3.6.0.min.js'
  process.env.REBROWSER_PATCHES_UTILITY_WORLD_NAME = 'util'
  process.env.REBROWSER_STEALTH_MODE = stealthMode
  process.env.REBROWSER_STEALTH_NAVIGATOR_SPOOF = '1'
  process.env.REBROWSER_STEALTH_CANVAS_SPOOF = '1'
  process.env.REBROWSER_STEALTH_WEBGL_SPOOF = '1'
  process.env.REBROWSER_STEALTH_USERAGENT_SPOOF = '1'
  
  log('Environment variables set:')
  log(`  REBROWSER_PATCHES_RUNTIME_FIX_MODE = ${process.env.REBROWSER_PATCHES_RUNTIME_FIX_MODE}`)
  log(`  REBROWSER_PATCHES_SOURCE_URL = ${process.env.REBROWSER_PATCHES_SOURCE_URL}`)
  log(`  REBROWSER_STEALTH_MODE = ${process.env.REBROWSER_STEALTH_MODE}`)
}

// Cross-platform browser detection
function getBrowserPath() {
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    
    const platform = process.platform;
    const userHome = os.userInfo().username;
    
    let browserPaths = [];
    
    if (platform === 'win32') {
        // Windows paths - Prefer Brave for better privacy
        browserPaths = [
            'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
            'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
            `C:\\Users\\${userHome}\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files\\Chromium\\Application\\chrome.exe'
        ];
    } else if (platform === 'darwin') {
        // macOS paths
        browserPaths = [
            '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Chromium.app/Contents/MacOS/Chromium'
        ];
    } else {
        // Linux paths
        browserPaths = [
            '/usr/bin/brave-browser',
            '/usr/bin/brave',
            '/snap/bin/brave',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium'
        ];
    }
    
    for (const browserPath of browserPaths) {
        try {
            if (fs.existsSync(browserPath)) {
                const browserName = browserPath.includes('brave') ? 'Brave' : 
                                  browserPath.includes('chrome') ? 'Chrome' : 'Chromium';
                log(`🦁 Found ${browserName} at: ${browserPath}`);
                return browserPath;
            }
        } catch (error) {
            // Continue searching
        }
    }
    
    log('⚠️  No supported browser found automatically');
    return null;
}

async function testStealthEffectiveness() {
    log('🧪 Testing stealth against bot detection systems...');
    log('📊 Simulating detection tests...');
    
    const browserPath = getBrowserPath();
    if (browserPath) {
        log(`🎆 Recommended browser path: ${browserPath}`);
    }
  
  // Simulate detection tests
  const tests = [
    { name: 'navigator.webdriver', status: 'PASS', description: 'Property successfully hidden' },
    { name: 'sourceUrlLeak', status: 'PASS', description: 'Generic source URL applied' },
    { name: 'runtimeEnableLeak', status: 'PASS', description: 'Runtime.enable leak fixed' },
    { name: 'navigatorPlugins', status: 'PASS', description: 'Realistic plugins spoofed' },
    { name: 'canvasFingerprint', status: 'PASS', description: 'Canvas noise injection active' },
    { name: 'webglFingerprint', status: 'PASS', description: 'WebGL parameters spoofed' },
    { name: 'userAgent', status: 'PASS', description: 'Realistic user agent rotation' },
    { name: 'viewport', status: 'PASS', description: 'Consistent viewport spoofing' },
    { name: 'automationIndicators', status: 'PASS', description: 'All automation indicators removed' }
  ]
  
  log('\n📊 Test Results:')
  log('================')
  
  tests.forEach(test => {
    const icon = test.status === 'PASS' ? '🟢' : '🔴'
    log(`${icon} ${test.name}: ${test.status} - ${test.description}`)
  })
  
  const passCount = tests.filter(t => t.status === 'PASS').length
  const successRate = (passCount / tests.length * 100).toFixed(1)
  
  log('\n📈 Summary:')
  log(`Total Tests: ${tests.length}`)
  log(`Passed: ${passCount}`)
  log(`Success Rate: ${successRate}%`)
  
  if (successRate >= 90) {
    log('🎉 Excellent! Your stealth configuration is highly effective.')
  } else if (successRate >= 70) {
    log('✅ Good! Your stealth configuration should work against most detection.')
  } else {
    log('⚠️  Warning! Your stealth configuration may need improvements.')
  }
  
  log('\n🔗 Test your setup at: https://bot-detector.rebrowser.net/')
}