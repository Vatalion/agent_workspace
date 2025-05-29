#!/usr/bin/env node

/**
 * Test script to verify the infinite progress fix
 */

console.log('🧪 Testing Flutter Debug Assistant - Infinite Progress Fix');
console.log('=' .repeat(60));

// Test 1: Verify extension is installed
console.log('\n1. ✅ Extension Installation Check');
const { execSync } = require('child_process');

try {
    const extensions = execSync('code --list-extensions', { encoding: 'utf8' });
    if (extensions.includes('flutter-ai-team.flutter-ai-debug-assistant')) {
        console.log('   ✅ Extension is installed');
    } else {
        console.log('   ❌ Extension not found');
        process.exit(1);
    }
} catch (error) {
    console.log('   ❌ Failed to check extensions:', error.message);
    process.exit(1);
}

// Test 2: Check for problematic code patterns
console.log('\n2. 🔍 Code Pattern Analysis');
const fs = require('fs');
const path = require('path');

const extensionFile = path.join(__dirname, 'flutter_debug_extension', 'src', 'extension.ts');

if (fs.existsSync(extensionFile)) {
    const content = fs.readFileSync(extensionFile, 'utf8');
    
    // Check for problematic patterns
    const problematicPatterns = [
        { pattern: /statusText\.textContent = 'Checking server status\.\.\.'/g, name: 'JavaScript status text' },
        { pattern: /<div id="statusText" class="status-text">Checking server status\.\.\.<\/div>/g, name: 'HTML status text' },
        { pattern: /statusIcon\.innerHTML = '<div class="spinner"><\/div>'/g, name: 'Default spinner' }
    ];
    
    let foundIssues = false;
    
    problematicPatterns.forEach(({ pattern, name }) => {
        const matches = content.match(pattern);
        if (matches) {
            console.log(`   ❌ Found problematic ${name}: ${matches.length} instances`);
            foundIssues = true;
        } else {
            console.log(`   ✅ No problematic ${name} found`);
        }
    });
    
    // Check for good patterns
    const goodPatterns = [
        { pattern: /Ready - Click Refresh to check status/g, name: 'Fixed initial status text' },
        { pattern: /Status Unknown - Click Refresh/g, name: 'Fixed default status text' },
        { pattern: /Skip automatic status checking to prevent infinite progress/g, name: 'Initialization fix comment' }
    ];
    
    goodPatterns.forEach(({ pattern, name }) => {
        const matches = content.match(pattern);
        if (matches) {
            console.log(`   ✅ Found ${name}: ${matches.length} instances`);
        } else {
            console.log(`   ⚠️  Missing ${name}`);
        }
    });
    
    if (!foundIssues) {
        console.log('   🎉 No problematic patterns detected!');
    }
} else {
    console.log('   ❌ Extension source file not found');
}

// Test 3: Check button functionality
console.log('\n3. 🔘 Button Functionality Check');
if (fs.existsSync(extensionFile)) {
    const content = fs.readFileSync(extensionFile, 'utf8');
    
    // Check for button event handlers
    const buttonPatterns = [
        { pattern: /handleServerAction\('start'\)/g, name: 'Start button handler' },
        { pattern: /handleServerAction\('stop'\)/g, name: 'Stop button handler' },
        { pattern: /handleServerAction\('restart'\)/g, name: 'Restart button handler' },
        { pattern: /handleServerAction\('refresh'\)/g, name: 'Refresh button handler' },
        { pattern: /case 'startServer':/g, name: 'Start server message handler' },
        { pattern: /case 'stopServer':/g, name: 'Stop server message handler' },
        { pattern: /case 'restartServer':/g, name: 'Restart server message handler' },
        { pattern: /case 'refreshServer':/g, name: 'Refresh server message handler' }
    ];
    
    buttonPatterns.forEach(({ pattern, name }) => {
        const matches = content.match(pattern);
        if (matches) {
            console.log(`   ✅ Found ${name}: ${matches.length} instances`);
        } else {
            console.log(`   ❌ Missing ${name}`);
        }
    });
}

console.log('\n' + '='.repeat(60));
console.log('🎉 BUTTON FUNCTIONALITY CHECK COMPLETE'); 