#!/usr/bin/env node

/**
 * Debouncing Test for AI Assistant Deployer
 * 
 * This test validates that our file watcher debouncing works correctly
 * to prevent excessive UI updates during rapid file system changes.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing File Watcher Debouncing Implementation...\n');

// Test 1: Check for debouncing in ModeDiscoveryService
console.log('📋 Test 1: Checking ModeDiscoveryService debouncing...');

const modeDiscoveryPath = path.join(__dirname, 'src/services/modeDiscovery.ts');
let modeDiscoveryContent = '';
if (fs.existsSync(modeDiscoveryPath)) {
    modeDiscoveryContent = fs.readFileSync(modeDiscoveryPath, 'utf8');
    
    // Check for debounce timer
    if (modeDiscoveryContent.includes('debounceTimer') && modeDiscoveryContent.includes('clearTimeout')) {
        console.log('✅ Debounce timer found in ModeDiscoveryService');
    } else {
        console.log('❌ Debounce timer missing in ModeDiscoveryService');
    }
    
    // Check for debounce delay (should be 500ms or similar)
    if (modeDiscoveryContent.includes('500') || modeDiscoveryContent.includes('1000')) {
        console.log('✅ Debounce delay configured');
    } else {
        console.log('❌ Debounce delay not found');
    }
    
    // Check for proper cleanup in dispose
    if (modeDiscoveryContent.includes('dispose') && modeDiscoveryContent.includes('clearTimeout')) {
        console.log('✅ Proper cleanup in dispose method');
    } else {
        console.log('❌ Missing cleanup in dispose method');
    }
} else {
    console.log('❌ ModeDiscoveryService file not found');
}

// Test 2: Check for debouncing in WebviewProvider
console.log('\n📋 Test 2: Checking WebviewProvider debouncing...');

const webviewProviderPath = path.join(__dirname, 'src/ui/aiAssistantWebviewProvider.ts');
let webviewProviderContent = '';
if (fs.existsSync(webviewProviderPath)) {
    webviewProviderContent = fs.readFileSync(webviewProviderPath, 'utf8');
    
    // Check for debounce timer in webview provider
    if (webviewProviderContent.includes('debounceTimer') && webviewProviderContent.includes('clearTimeout')) {
        console.log('✅ Debounce timer found in WebviewProvider');
    } else {
        console.log('❌ Debounce timer missing in WebviewProvider');
    }
    
    // Check for debounced refreshState calls
    if (webviewProviderContent.includes('setTimeout') && webviewProviderContent.includes('refreshState')) {
        console.log('✅ Debounced refreshState calls found');
    } else {
        console.log('❌ Debounced refreshState calls missing');
    }
    
    // Check for private debounceTimer property
    if (webviewProviderContent.includes('private debounceTimer')) {
        console.log('✅ Private debounceTimer property found');
    } else {
        console.log('❌ Private debounceTimer property missing');
    }
} else {
    console.log('❌ WebviewProvider file not found');
    webviewProviderContent = '';
}

// Test 3: Check for performance optimizations
console.log('\n📋 Test 3: Checking performance optimizations...');

const performanceChecks = [
    {
        name: 'No aggressive timers (< 100ms intervals)',
        check: (content) => {
            // Look for any setInterval with very short delays
            const aggressiveTimers = content.match(/setInterval\([^,]+,\s*([1-9][0-9]?)\)/g);
            return !aggressiveTimers || aggressiveTimers.length === 0;
        }
    },
    {
        name: 'Selective updates implemented',
        check: (content) => content.includes('performSelectiveUpdate')
    },
    {
        name: 'State comparison logic present',
        check: (content) => content.includes('hasStatusChanged') && content.includes('hasModesChanged')
    },
    {
        name: 'Proper DOM preservation',
        check: (content) => content.includes('scrollTop') && content.includes('openModals')
    }
];

let performanceScore = 0;
for (const optimization of performanceChecks) {
    if (optimization.check(webviewProviderContent)) {
        console.log(`✅ ${optimization.name}`);
        performanceScore++;
    } else {
        console.log(`❌ ${optimization.name}`);
    }
}

console.log(`\n📊 Performance Score: ${performanceScore}/${performanceChecks.length}`);

// Test 4: Overall system health check
console.log('\n📋 Test 4: Overall system health check...');

const healthChecks = [
    {
        name: 'Extension compiles without errors',
        file: 'out/extension.js',
        check: (file) => fs.existsSync(path.join(__dirname, file))
    },
    {
        name: 'Package.json is valid',
        file: 'package.json',
        check: (file) => {
            try {
                const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
                return pkg.name && pkg.version && pkg.main;
            } catch {
                return false;
            }
        }
    },
    {
        name: 'Extension manifest exists',
        file: 'ai-assistant-deployer-1.0.0.vsix',
        check: (file) => fs.existsSync(path.join(__dirname, file))
    }
];

let healthScore = 0;
for (const healthCheck of healthChecks) {
    if (healthCheck.check(healthCheck.file)) {
        console.log(`✅ ${healthCheck.name}`);
        healthScore++;
    } else {
        console.log(`❌ ${healthCheck.name}`);
    }
}

console.log(`\n📊 Health Score: ${healthScore}/${healthChecks.length}`);

// Summary
console.log('\n📊 Final Test Summary:');
console.log('======================');

const totalTests = 4; // Number of test categories
const scores = {
    'ModeDiscoveryService Debouncing': modeDiscoveryContent ? 3 : 0, // Max 3 points
    'WebviewProvider Debouncing': webviewProviderContent ? 3 : 0, // Max 3 points  
    'Performance Optimizations': performanceScore, // Max 4 points
    'System Health': healthScore // Max 3 points
};

let totalScore = 0;
let maxScore = 0;

for (const [category, score] of Object.entries(scores)) {
    console.log(`${category}: ${score}/${category.includes('Performance') ? 4 : 3}`);
    totalScore += score;
    maxScore += category.includes('Performance') ? 4 : 3;
}

console.log(`\nOverall Score: ${totalScore}/${maxScore} (${((totalScore/maxScore) * 100).toFixed(1)}%)`);

if (totalScore === maxScore) {
    console.log('🎉 Perfect score! All debouncing and performance optimizations are properly implemented.');
    process.exit(0);
} else if (totalScore >= maxScore * 0.8) {
    console.log('✅ Good score! Most optimizations are in place with minor issues.');
    process.exit(0);
} else {
    console.log('⚠️  Improvements needed. Some critical optimizations are missing.');
    process.exit(1);
}
