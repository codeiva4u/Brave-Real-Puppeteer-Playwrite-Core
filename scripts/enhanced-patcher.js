#! /usr/bin/env node

/**
 * Enhanced Rebrowser Patcher with Integrated Stealth Features
 * Combines basic patches + stealth patches + environment setup in one command
 */

import { readFile, access, constants, writeFile } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Enhanced validation and backup functionality
async function validatePackage(packagePath, packageName) {
  try {
    await access(packagePath, constants.F_OK);
    const packageJsonPath = resolve(packagePath, 'package.json');
    const packageJsonText = await readFile(packageJsonPath, { encoding: 'utf8' });
    const packageJson = JSON.parse(packageJsonText);
    
    if (packageName && packageJson.name !== packageName) {
      throw new Error(`Package name mismatch: found "${packageJson.name}", expected "${packageName}"`);
    }
    
    return packageJson;
  } catch (error) {
    throw new Error(`Package validation failed: ${error.message}`);
  }
}

// Apply stealth environment variables automatically
function setStealthEnvironmentVariables() {
  process.env.REBROWSER_PATCHES_RUNTIME_FIX_MODE = 'addBinding';
  process.env.REBROWSER_PATCHES_SOURCE_URL = 'jquery-3.6.0.min.js';
  process.env.REBROWSER_PATCHES_UTILITY_WORLD_NAME = 'util';
  process.env.REBROWSER_STEALTH_MODE = 'comprehensive';
  process.env.REBROWSER_STEALTH_NAVIGATOR_SPOOF = '1';
  process.env.REBROWSER_STEALTH_CANVAS_SPOOF = '1';
  process.env.REBROWSER_STEALTH_WEBGL_SPOOF = '1';
  process.env.REBROWSER_STEALTH_USERAGENT_SPOOF = '1';
  
  log('🎭 Stealth environment variables configured automatically');
}

// Apply comprehensive stealth enhancements
async function applyStealthEnhancements(packagePath, packageName) {
  log('🎭 Applying comprehensive stealth enhancements...');
  
  try {
    // Inject stealth scripts into the library
    const stealthScript = getComprehensiveStealthScript();
    
    // Create stealth injection file
    const stealthFilePath = resolve(packagePath, 'stealth-injection.js');
    await writeFile(stealthFilePath, `
      // rebrowser-stealth comprehensive injection - Auto-generated
      (function() {
        if (typeof window !== 'undefined') {
          ${stealthScript}
        }
      })();
    `);
    
    log('✅ Comprehensive stealth scripts injected');
    return true;
  } catch (error) {
    log(`⚠️ Stealth enhancement failed: ${error.message}`);
    return false;
  }
}

(async () => {
  // Enhanced config with auto-stealth
  const cliArgs = yargs(hideBin(process.argv))
    .usage('Usage: <command> [options]')
    .command('patch', 'Apply patches with integrated stealth features')
    .command('patch-comprehensive', 'Apply all patches + advanced stealth')
    .command('unpatch', 'Reverse all patches')
    .command('check', 'Check patch status')
    .command('validate', 'Validate package compatibility')
    .describe('packageName', `Target package: ${validPackagesNames.join(', ')}`)
    .describe('packagePath', 'Custom package path')
    .describe('codeTarget', 'Target code: src or lib')
    .describe('noStealth', 'Skip stealth enhancements')
    .describe('backup', 'Create backup before patching')
    .describe('force', 'Force patch even if already applied')
    .boolean('debug')
    .boolean('backup')
    .boolean('force')
    .boolean('noStealth')
    .describe('debug', 'Enable verbose debugging')
    .demandCommand(1, 1, 'Error: specify command')
    .parse()

  let {
    packageName,
    packagePath,
    codeTarget = 'lib',
    debug,
    backup = false,
    force = false,
    noStealth = false,
  } = cliArgs

  if (debug) {
    process.env.REBROWSER_PATCHES_DEBUG = 1
    process.env.REBROWSER_STEALTH_DEBUG = 1
    log('🐛 Debug mode enabled')
  }

  const command = cliArgs._[0]
  let commandResult

  if (!packagePath && !packageName && !['validate'].includes(command)) {
    fatalError('You need to specify either packageName or packagePath.')
  }

  if (!packagePath) {
    packagePath = `${process.cwd()}/node_modules/${packageName}`
  }

  if (!['patch', 'patch-comprehensive', 'unpatch', 'check', 'validate'].includes(command)) {
    fatalError(`Unknown command: ${command}`)
  }

  if (!['src', 'lib'].includes(codeTarget)) {
    fatalError(`Unknown codeTarget: ${codeTarget}. Use: src or lib`)
  }

  log('🎯 Enhanced Patcher Configuration:')
  log(`command = ${command}, packageName = ${packageName}, codeTarget = ${codeTarget}`)
  log(`stealth = ${!noStealth ? '🎭 ENABLED' : '❌ DISABLED'}`)
  log(`packagePath = ${packagePath}`)
  log('------')

  // Package validation
  let packageJson
  try {
    packageJson = await validatePackage(packagePath, packageName);
    if (!packageName) {
      packageName = packageJson.name;
    }
    log(`📦 Found package "${packageJson.name}" v${packageJson.version}`);
    log(`📍 Package path: ${packagePath}`);
  } catch (error) {
    fatalError(`Package validation failed: ${error.message}`);
  }
  
  if (!validPackagesNames.includes(packageName)) {
    fatalError(`Package "${packageName}" is not supported. Supported: ${validPackagesNames.join(', ')}`);
  }

  // Apply patches for both lib and src automatically
  const targets = command === 'patch-comprehensive' ? ['lib', 'src'] : [codeTarget];
  let allSuccess = true;
  
  for (const target of targets) {
    const patchFilePath = resolve(getPatcherPackagePath(), `./patches/${packageName}/${target}.patch`);
    
    // Check patch status
    let patchStatus = 'unknown';
    try {
      await exec(`${getPatchBaseCmd(patchFilePath)} --dry-run`, { cwd: packagePath });
      patchStatus = 'unpatched';
    } catch (e) {
      if (e.stdout.includes('Ignoring previously applied (or reversed) patch')) {
        patchStatus = 'patched';
      }
    }
    
    log(`${target.toUpperCase()} patch status = ${patchStatus === 'patched' ? '🟩' : '🟧'} ${patchStatus}`);

    // Apply patches
    if (command === 'patch' || command === 'patch-comprehensive') {
      if (patchStatus === 'patched' && !force) {
        log(`✅ ${target.toUpperCase()} already patched`);
      } else {
        try {
          const patchCmd = getPatchBaseCmd(patchFilePath);
          await exec(patchCmd, { cwd: packagePath });
          log(`✅ ${target.toUpperCase()} patches applied successfully`);
        } catch (error) {
          log(`❌ ${target.toUpperCase()} patch failed: ${error.message}`);
          allSuccess = false;
        }
      }
      
      // Apply stealth patches automatically
      if (!noStealth) {
        const stealthPatchFilePath = resolve(getPatcherPackagePath(), `./patches/${packageName}/stealth-${target}.patch`);
        try {
          await access(stealthPatchFilePath, constants.F_OK);
          try {
            const stealthCmd = getPatchBaseCmd(stealthPatchFilePath);
            await exec(stealthCmd, { cwd: packagePath });
            log(`🎭 ${target.toUpperCase()} stealth patches applied successfully`);
          } catch (error) {
            if (!error.stdout.includes('Ignoring previously applied')) {
              log(`⚠️ ${target.toUpperCase()} stealth patch warning: ${error.message}`);
            }
          }
        } catch {
          // Stealth patch file doesn't exist, skip
        }
      }
    }
  }
  
  // Apply comprehensive stealth enhancements
  if (!noStealth && (command === 'patch' || command === 'patch-comprehensive')) {
    setStealthEnvironmentVariables();
    const stealthSuccess = await applyStealthEnhancements(packagePath, packageName);
    allSuccess = allSuccess && stealthSuccess;
  }

  // Final result
  let exitCode = 0;
  let resultText;
  
  if (allSuccess) {
    if (!noStealth) {
      resultText = '🎭🟢 Comprehensive patches + stealth applied successfully';
    } else {
      resultText = '🟢 Patches applied successfully';
    }
  } else {
    resultText = '🔴 Some operations failed';
    exitCode = 1;
  }
  
  log(`Result: ${resultText}`);
  
  if (!noStealth && allSuccess) {
    log('');
    log('🎯 Stealth Features Enabled:');
    log('  ✅ Navigator spoofing');
    log('  ✅ Canvas fingerprint protection');
    log('  ✅ WebGL spoofing');
    log('  ✅ UserAgent randomization');
    log('  ✅ Screen dimension spoofing');
    log('  ✅ Error stack sanitization');
    log('  ✅ Environment variables configured');
    log('  ✅ Comprehensive stealth injection');
  }

  process.exit(exitCode);
})();
