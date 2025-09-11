#!/usr/bin/env node

/**
 * NPM Publisher for Brave Packages
 * Automatically publishes Brave-Real-Puppeteer-Core and Brave-Real-Playwright-Core to NPM
 */

import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .option('package', {
        alias: 'p',
        describe: 'Package to publish',
        choices: ['puppeteer', 'playwright', 'both'],
        default: 'both'
    })
    .option('dry-run', {
        alias: 'd',
        describe: 'Run without actually publishing (dry run)',
        type: 'boolean',
        default: false
    })
    .option('tag', {
        alias: 't', 
        describe: 'NPM tag to publish under',
        type: 'string',
        default: 'latest'
    })
    .option('access', {
        alias: 'a',
        describe: 'NPM access level',
        choices: ['public', 'restricted'],
        default: 'public'
    })
    .option('force', {
        alias: 'f',
        describe: 'Force publish even if version already exists',
        type: 'boolean',
        default: false
    })
    .help()
    .parse();

class BravePackagePublisher {
    constructor(options = {}) {
        this.distDir = resolve(projectRoot, 'dist');
        this.dryRun = options.dryRun || false;
        this.tag = options.tag || 'latest';
        this.access = options.access || 'public';
        this.force = options.force || false;
        
        this.packages = {
            puppeteer: {
                name: 'Brave-Real-Puppeteer-Core',
                path: join(this.distDir, 'Brave-Real-Puppeteer-Core'),
                displayName: 'Brave Real Puppeteer Core'
            },
            playwright: {
                name: 'Brave-Real-Playwright-Core', 
                path: join(this.distDir, 'Brave-Real-Playwright-Core'),
                displayName: 'Brave Real Playwright Core'
            }
        };
    }

    /**
     * Check if user is authenticated with NPM
     */
    checkNpmAuth() {
        try {
            const whoami = execSync('npm whoami', { encoding: 'utf8' }).trim();
            console.log(`✅ NPM authenticated as: ${whoami}`);
            return whoami;
        } catch (error) {
            console.error('❌ NPM authentication failed!');
            console.error('Please login to NPM using: npm login');
            console.error('Or set NPM_TOKEN environment variable for CI/CD');
            throw new Error('NPM authentication required');
        }
    }

    /**
     * Validate package structure before publishing
     */
    validatePackage(packagePath, packageName) {
        console.log(`🔍 Validating ${packageName}...`);
        
        // Check if package directory exists
        if (!existsSync(packagePath)) {
            throw new Error(`Package directory not found: ${packagePath}`);
        }

        // Check if package.json exists
        const packageJsonPath = join(packagePath, 'package.json');
        if (!existsSync(packageJsonPath)) {
            throw new Error(`package.json not found in: ${packagePath}`);
        }

        // Validate package.json content
        try {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
            
            if (packageJson.name !== packageName) {
                throw new Error(`Package name mismatch. Expected: ${packageName}, Found: ${packageJson.name}`);
            }

            if (!packageJson.version) {
                throw new Error(`Version not specified in package.json for ${packageName}`);
            }

            console.log(`✅ Package validated: ${packageName}@${packageJson.version}`);
            return packageJson;
        } catch (error) {
            throw new Error(`Invalid package.json in ${packagePath}: ${error.message}`);
        }
    }

    /**
     * Check if package version already exists on NPM
     */
    async checkVersionExists(packageName, version) {
        try {
            const result = execSync(`npm view ${packageName}@${version} version 2>/dev/null`, { 
                encoding: 'utf8' 
            }).trim();
            return result === version;
        } catch (error) {
            // If npm view fails, version doesn't exist
            return false;
        }
    }

    /**
     * Publish a single package to NPM
     */
    async publishPackage(packageKey) {
        const pkg = this.packages[packageKey];
        console.log(`\n📦 Publishing ${pkg.displayName}...`);
        console.log('=' + '='.repeat(50));

        try {
            // Validate package
            const packageJson = this.validatePackage(pkg.path, pkg.name);

            // Check if version exists
            const versionExists = await this.checkVersionExists(pkg.name, packageJson.version);
            if (versionExists && !this.force) {
                console.log(`⚠️  Version ${packageJson.version} already exists for ${pkg.name}`);
                console.log('Use --force to force publish or update version in package.json');
                return { success: false, reason: 'version_exists' };
            }

            // Prepare NPM publish command
            let publishCmd = `npm publish`;
            
            if (this.dryRun) {
                publishCmd += ' --dry-run';
            }
            
            if (this.access === 'public') {
                publishCmd += ' --access public';
            }
            
            if (this.tag !== 'latest') {
                publishCmd += ` --tag ${this.tag}`;
            }

            console.log(`🚀 Running: ${publishCmd}`);
            console.log(`📁 Working directory: ${pkg.path}`);

            if (this.dryRun) {
                console.log('🧪 DRY RUN MODE - Not actually publishing');
            }

            // Execute publish command
            const output = execSync(publishCmd, {
                cwd: pkg.path,
                encoding: 'utf8',
                stdio: 'pipe'
            });

            console.log('📋 NPM Output:');
            console.log(output);

            if (this.dryRun) {
                console.log(`✅ DRY RUN: ${pkg.name}@${packageJson.version} would be published successfully`);
            } else {
                console.log(`🎉 SUCCESS: ${pkg.name}@${packageJson.version} published to NPM!`);
                console.log(`🔗 View at: https://www.npmjs.com/package/${pkg.name}`);
            }

            return { success: true, version: packageJson.version };

        } catch (error) {
            console.error(`❌ FAILED to publish ${pkg.displayName}:`);
            console.error(error.message);
            
            if (error.stdout) {
                console.error('STDOUT:', error.stdout);
            }
            if (error.stderr) {
                console.error('STDERR:', error.stderr);
            }

            return { success: false, error: error.message };
        }
    }

    /**
     * Publish specified packages
     */
    async publishPackages(packageSelection) {
        console.log('🦁 BRAVE PACKAGES NPM PUBLISHER');
        console.log('=' + '='.repeat(50));
        
        if (this.dryRun) {
            console.log('🧪 DRY RUN MODE - No actual publishing will occur');
        }
        
        console.log(`📦 Publishing: ${packageSelection}`);
        console.log(`🏷️  Tag: ${this.tag}`);
        console.log(`🔐 Access: ${this.access}`);
        console.log('');

        // Check NPM authentication
        const npmUser = this.checkNpmAuth();
        console.log('');

        const results = {};

        if (packageSelection === 'puppeteer' || packageSelection === 'both') {
            results.puppeteer = await this.publishPackage('puppeteer');
        }

        if (packageSelection === 'playwright' || packageSelection === 'both') {
            results.playwright = await this.publishPackage('playwright');
        }

        return results;
    }

    /**
     * Display final summary
     */
    displaySummary(results) {
        console.log('\n🎯 PUBLISHING SUMMARY');
        console.log('=' + '='.repeat(50));

        let successCount = 0;
        let totalCount = 0;

        for (const [key, result] of Object.entries(results)) {
            totalCount++;
            const pkg = this.packages[key];
            
            if (result.success) {
                successCount++;
                const status = this.dryRun ? 'DRY RUN SUCCESS' : 'PUBLISHED';
                console.log(`✅ ${pkg.displayName}: ${status} (v${result.version})`);
            } else {
                const reason = result.reason === 'version_exists' ? 'VERSION EXISTS' : 'FAILED';
                console.log(`❌ ${pkg.displayName}: ${reason}`);
                if (result.error) {
                    console.log(`   Error: ${result.error}`);
                }
            }
        }

        console.log('');
        console.log(`📊 Results: ${successCount}/${totalCount} packages ${this.dryRun ? 'validated' : 'published'}`);
        
        if (!this.dryRun && successCount > 0) {
            console.log('\n🌟 Next steps:');
            console.log('   - Test installation: npm install <package-name>');
            console.log('   - Update documentation if needed');
            console.log('   - Monitor NPM stats and downloads');
        }
    }
}

// Main execution
async function main() {
    try {
        const publisher = new BravePackagePublisher({
            dryRun: argv['dry-run'],
            tag: argv.tag,
            access: argv.access,
            force: argv.force
        });

        const results = await publisher.publishPackages(argv.package);
        publisher.displaySummary(results);

        // Exit with error code if any package failed to publish
        const hasFailures = Object.values(results).some(result => !result.success);
        if (hasFailures) {
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Publishing failed:', error.message);
        process.exit(1);
    }
}

main();
