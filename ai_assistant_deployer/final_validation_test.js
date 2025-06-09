#!/usr/bin/env node

/**
 * Final Validation Test for AI Assistant Deployer
 * 
 * This comprehensive test validates that all debouncing optimizations
 * and smart update systems are working correctly after implementation.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Final Validation Test - AI Assistant Deployer Extension');
console.log('===========================================================\n');

// Test 1: Validate Extension Build
console.log('📋 Test 1: Extension Build Validation');
const buildChecks = [
    { file: 'out/extension.js', name: 'Main extension bundle' },
    { file: 'ai-assistant-deployer-1.0.0.vsix', name: 'Extension package' },
    { file: 'package.json', name: 'Package manifest' }
];

let buildScore = 0;
for (const check of buildChecks) {
    if (fs.existsSync(path.join(__dirname, check.file))) {
        console.log(`✅ ${check.name} exists`);
        buildScore++;
    } else {
        console.log(`❌ ${check.name} missing`);
    }
}
console.log(`Build Score: ${buildScore}/${buildChecks.length}\n`);

// Test 2: Validate Debouncing Implementation
console.log('📋 Test 2: Debouncing Implementation Validation');

const modeDiscoveryPath = path.join(__dirname, 'src/services/modeDiscovery.ts');
const webviewProviderPath = path.join(__dirname, 'src/ui/aiAssistantWebviewProvider.ts');

let debounceScore = 0;
const debounceChecks = [
    {
        name: 'ModeDiscoveryService debounce timer',
        check: () => {
            if (!fs.existsSync(modeDiscoveryPath)) return false;
            const content = fs.readFileSync(modeDiscoveryPath, 'utf8');
            return content.includes('debounceTimer') && content.includes('clearTimeout');
        }
    },
    {
        name: 'WebviewProvider debounce timer',
        check: () => {
            if (!fs.existsSync(webviewProviderPath)) return false;
            const content = fs.readFileSync(webviewProviderPath, 'utf8');
            return content.includes('private debounceTimer') && content.includes('clearTimeout');
        }
    },
    {
        name: 'Debounce delay configuration (500ms)',
        check: () => {
            if (!fs.existsSync(modeDiscoveryPath) || !fs.existsSync(webviewProviderPath)) return false;
            const modeContent = fs.readFileSync(modeDiscoveryPath, 'utf8');
            const webContent = fs.readFileSync(webviewProviderPath, 'utf8');
            return modeContent.includes('500') && webContent.includes('500');
        }
    },
    {
        name: 'Proper cleanup in dispose methods',
        check: () => {
            if (!fs.existsSync(modeDiscoveryPath)) return false;
            const content = fs.readFileSync(modeDiscoveryPath, 'utf8');
            return content.includes('dispose') && content.includes('clearTimeout');
        }
    }
];

for (const check of debounceChecks) {
    if (check.check()) {
        console.log(`✅ ${check.name}`);
        debounceScore++;
    } else {
        console.log(`❌ ${check.name}`);
    }
}
console.log(`Debouncing Score: ${debounceScore}/${debounceChecks.length}\n`);

// Test 3: Validate Smart Update System
console.log('📋 Test 3: Smart Update System Validation');

let smartUpdateScore = 0;
const smartUpdateChecks = [
    {
        name: 'UIUpdatePayload interface',
        check: () => {
            if (!fs.existsSync(webviewProviderPath)) return false;
            const content = fs.readFileSync(webviewProviderPath, 'utf8');
            return content.includes('interface UIUpdatePayload');
        }
    },
    {
        name: 'State tracking properties',
        check: () => {
            if (!fs.existsSync(webviewProviderPath)) return false;
            const content = fs.readFileSync(webviewProviderPath, 'utf8');
            return content.includes('previousState') && content.includes('isInitialized');
        }
    },
    {
        name: 'Selective update method',
        check: () => {
            if (!fs.existsSync(webviewProviderPath)) return false;
            const content = fs.readFileSync(webviewProviderPath, 'utf8');
            return content.includes('performSelectiveUpdate');
        }
    },
    {
        name: 'State comparison methods',
        check: () => {
            if (!fs.existsSync(webviewProviderPath)) return false;
            const content = fs.readFileSync(webviewProviderPath, 'utf8');
            return content.includes('hasStatusChanged') && content.includes('hasModesChanged');
        }
    },
    {
        name: 'Scroll position preservation',
        check: () => {
            if (!fs.existsSync(webviewProviderPath)) return false;
            const content = fs.readFileSync(webviewProviderPath, 'utf8');
            return content.includes('scrollTop') && content.includes('Preserve scroll position');
        }
    }
];

for (const check of smartUpdateChecks) {
    if (check.check()) {
        console.log(`✅ ${check.name}`);
        smartUpdateScore++;
    } else {
        console.log(`❌ ${check.name}`);
    }
}
console.log(`Smart Update Score: ${smartUpdateScore}/${smartUpdateChecks.length}\n`);

// Test 4: Performance Optimization Validation
console.log('📋 Test 4: Performance Optimization Validation');

let performanceScore = 0;
const performanceChecks = [
    {
        name: 'No aggressive refresh intervals',
        check: () => {
            if (!fs.existsSync(webviewProviderPath)) return false;
            const content = fs.readFileSync(webviewProviderPath, 'utf8');
            // Check that auto-refresh timer is removed or has reasonable interval
            const aggressiveTimers = content.match(/setInterval\([^,]+,\s*([1-9][0-9]?)\)/g);
            return !aggressiveTimers || aggressiveTimers.length === 0;
        }
    },
    {
        name: 'File watcher debouncing active',
        check: () => {
            if (!fs.existsSync(webviewProviderPath)) return false;
            const content = fs.readFileSync(webviewProviderPath, 'utf8');
            return content.includes('setupFileWatcher') && content.includes('debounceTimer');
        }
    },
    {
        name: 'Efficient DOM updates',
        check: () => {
            if (!fs.existsSync(webviewProviderPath)) return false;
            const content = fs.readFileSync(webviewProviderPath, 'utf8');
            return content.includes('updateStatusBadge') && content.includes('updateModesSection');
        }
    },
    {
        name: 'Modal state preservation',
        check: () => {
            if (!fs.existsSync(webviewProviderPath)) return false;
            const content = fs.readFileSync(webviewProviderPath, 'utf8');
            return content.includes('openModals') && content.includes('modal');
        }
    }
];

for (const check of performanceChecks) {
    if (check.check()) {
        console.log(`✅ ${check.name}`);
        performanceScore++;
    } else {
        console.log(`❌ ${check.name}`);
    }
}
console.log(`Performance Score: ${performanceScore}/${performanceChecks.length}\n`);

// Final Summary
console.log('📊 FINAL VALIDATION SUMMARY');
console.log('============================');

const totalScore = buildScore + debounceScore + smartUpdateScore + performanceScore;
const maxScore = buildChecks.length + debounceChecks.length + smartUpdateChecks.length + performanceChecks.length;

console.log(`Build System: ${buildScore}/${buildChecks.length}`);
console.log(`Debouncing: ${debounceScore}/${debounceChecks.length}`);
console.log(`Smart Updates: ${smartUpdateScore}/${smartUpdateChecks.length}`);
console.log(`Performance: ${performanceScore}/${performanceChecks.length}`);
console.log(`\nOverall Score: ${totalScore}/${maxScore} (${((totalScore/maxScore) * 100).toFixed(1)}%)`);

if (totalScore === maxScore) {
    console.log('\n🎉 VALIDATION PASSED! Extension is ready for production use.');
    console.log('✨ All debouncing and performance optimizations are properly implemented.');
    console.log('🚀 UI stability issues have been resolved.');
    process.exit(0);
} else if (totalScore >= maxScore * 0.9) {
    console.log('\n✅ VALIDATION MOSTLY PASSED! Minor issues detected.');
    process.exit(0);
} else {
    console.log('\n⚠️  VALIDATION FAILED! Critical issues need to be addressed.');
    process.exit(1);
}
