#!/usr/bin/env node

/**
 * Validate Patches Script - rebrowser-patches
 * Comprehensive validation of all applied patches and stealth features
 */

import { existsSync } from 'fs';
import { resolve } from 'path';
import { exec } from './utils/index.js';

const projectRoot = resolve(process.cwd());

async function validatePackage(packageName) {
    const packagePath = resolve(projectRoot, 'node_modules', packageName);
    
    if (!existsSync(packagePath)) {
        return {
            name: packageName,
            installed: false,
            basicPatches: false,
            stealthPatches: false,
            status: 'NOT_INSTALLED'
        };
    }
    
    console.log(`📦 Validating ${packageName}...`);
    
    // Check basic patches
    let basicPatchesApplied = false;
    let stealthPatchesApplied = false;
    
    try {
        // Test for basic patch indicators
        const libFiles = existsSync(resolve(packagePath, 'lib'));
        const srcFiles = existsSync(resolve(packagePath, 'src'));
        
        if (libFiles && srcFiles) {
            basicPatchesApplied = true;
            console.log(`  ✅ Basic patches: Applied`);
        } else {
            console.log(`  ❌ Basic patches: Missing files`);
        }
        
        // Test for stealth indicators (environment variables or injected files)
        if (process.env.REBROWSER_STEALTH_MODE || 
            existsSync(resolve(packagePath, 'stealth-injection.js'))) {
            stealthPatchesApplied = true;
            console.log(`  ✅ Stealth patches: Applied`);
        } else {
            console.log(`  ⚠️ Stealth patches: Not detected`);
        }
        
    } catch (error) {
        console.log(`  ❌ Validation error: ${error.message}`);
    }
    
    const status = basicPatchesApplied && stealthPatchesApplied ? 'FULLY_PATCHED' :
                  basicPatchesApplied ? 'BASIC_ONLY' :
                  'NOT_PATCHED';
    
    return {
        name: packageName,
        installed: true,
        basicPatches: basicPatchesApplied,
        stealthPatches: stealthPatchesApplied,
        status: status
    };
}

async function validateEnvironment() {
    console.log('🔍 Environment Variables:');
    const envVars = [
        'REBROWSER_PATCHES_RUNTIME_FIX_MODE',
        'REBROWSER_PATCHES_SOURCE_URL', 
        'REBROWSER_STEALTH_MODE',
        'REBROWSER_STEALTH_NAVIGATOR_SPOOF'
    ];
    
    let envConfigured = 0;
    for (const envVar of envVars) {
        if (process.env[envVar]) {
            console.log(`  ✅ ${envVar} = ${process.env[envVar]}`);
            envConfigured++;
        } else {
            console.log(`  ❌ ${envVar} = not set`);
        }
    }
    
    return envConfigured > 0;
}

async function main() {
    console.log('🎯 REBROWSER PATCHES - COMPREHENSIVE VALIDATION');
    console.log('='.repeat(55));
    
    // Validate packages
    const packages = ['puppeteer-core', 'playwright-core'];
    const results = [];
    
    for (const pkg of packages) {
        const result = await validatePackage(pkg);
        results.push(result);
    }
    
    console.log('\n🌟 Environment Validation:');
    const envConfigured = await validateEnvironment();
    
    console.log('\n📊 VALIDATION SUMMARY:');
    console.log('='.repeat(30));
    
    let allGood = true;
    for (const result of results) {
        let statusIcon = result.status === 'FULLY_PATCHED' ? '🟢' :
                        result.status === 'BASIC_ONLY' ? '🟡' :
                        result.status === 'NOT_INSTALLED' ? '🔴' : '⚠️';
        
        console.log(`${statusIcon} ${result.name}: ${result.status}`);
        
        if (result.status !== 'FULLY_PATCHED' && result.status !== 'NOT_INSTALLED') {
            allGood = false;
        }
    }
    
    console.log(`${envConfigured ? '🟢' : '🔴'} Environment: ${envConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED'}`);
    
    console.log('\n🎯 RECOMMENDATIONS:');
    
    const installedPackages = results.filter(r => r.installed);
    const notFullyPatched = installedPackages.filter(r => r.status !== 'FULLY_PATCHED');
    
    if (notFullyPatched.length > 0) {
        console.log('⚡ Apply comprehensive patches:');
        for (const pkg of notFullyPatched) {
            console.log(`   npm run patch-${pkg.name.split('-')[0]}`);
        }
    }
    
    if (!envConfigured) {
        console.log('⚡ Configure stealth environment:');
        console.log('   npm run stealth-patch');
    }
    
    const notInstalled = results.filter(r => !r.installed);
    if (notInstalled.length > 0) {
        console.log('⚡ Install missing packages:');
        for (const pkg of notInstalled) {
            console.log(`   npm run setup-${pkg.name.split('-')[0]}`);
        }
    }
    
    if (allGood && envConfigured && installedPackages.length > 0) {
        console.log('🎉 Everything looks perfect! Ready for stealth automation.');
        process.exit(0);
    } else {
        console.log('⚠️ Some improvements recommended. See above suggestions.');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
});
