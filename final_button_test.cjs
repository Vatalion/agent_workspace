#!/usr/bin/env node

/**
 * FINAL BUTTON TEST
 * This will determine exactly why the buttons aren't working
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🔍 FINAL BUTTON DIAGNOSIS');
console.log('='.repeat(50));

// Test 1: Verify server is running
console.log('\n1. 🌐 Testing MCP Server...');
function testServer() {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/health',
            method: 'GET',
            timeout: 2000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('   ✅ Server is running:', response.status);
                    resolve(true);
                } catch (e) {
                    console.log('   ❌ Invalid server response');
                    resolve(false);
                }
            });
        });

        req.on('error', () => {
            console.log('   ❌ Server not running');
            resolve(false);
        });

        req.on('timeout', () => {
            console.log('   ❌ Server timeout');
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}

// Test 2: Check compiled extension
console.log('\n2. 🔧 Checking Compiled Extension...');
const distPath = path.join(__dirname, 'flutter_debug_extension', 'dist', 'extension.js');
if (fs.existsSync(distPath)) {
    const content = fs.readFileSync(distPath, 'utf8');
    
    if (content.includes('Button clicked')) {
        console.log('   ✅ Compiled extension has button fixes');
    } else {
        console.log('   ❌ Compiled extension missing button fixes');
    }
    
    if (content.includes('handleServerAction')) {
        console.log('   ✅ handleServerAction function exists');
    } else {
        console.log('   ❌ handleServerAction function missing');
    }
} else {
    console.log('   ❌ Compiled extension not found');
}

// Test 3: Check installed extension
console.log('\n3. 📦 Checking Installed Extension...');
const { execSync } = require('child_process');
try {
    const extensions = execSync('code --list-extensions', { encoding: 'utf8' });
    if (extensions.includes('flutter-ai-debug-assistant')) {
        console.log('   ✅ Extension is installed');
    } else {
        console.log('   ❌ Extension not installed');
    }
} catch (error) {
    console.log('   ❌ Could not check installed extensions');
}

async function runTests() {
    const serverRunning = await testServer();
    
    console.log('\n🎯 DIAGNOSIS RESULTS:');
    console.log('='.repeat(30));
    
    if (!serverRunning) {
        console.log('❌ CRITICAL: MCP Server is not running');
        console.log('   → Start server: cd src && node index.cjs');
        return;
    }
    
    console.log('\n🔧 MANUAL DEBUGGING STEPS:');
    console.log('1. Open VS Code');
    console.log('2. Press Cmd+Shift+P');
    console.log('3. Type: "Flutter AI Debug Assistant"');
    console.log('4. Select: "Flutter AI Debug Assistant: Open Panel"');
    console.log('5. Open Developer Console: Help → Toggle Developer Tools');
    console.log('6. Go to Console tab');
    console.log('7. Click a button and look for:');
    console.log('   - "🔥 Button clicked: start" message');
    console.log('   - Any JavaScript errors');
    console.log('   - Network requests to localhost:3000');
    console.log('');
    console.log('🔍 IF BUTTONS STILL DON\'T WORK:');
    console.log('• Check if handleServerAction function exists in console:');
    console.log('  → Type: typeof handleServerAction');
    console.log('• Try calling function manually:');
    console.log('  → Type: handleServerAction("start")');
    console.log('• Check for Content Security Policy errors');
    console.log('• Verify webview is loading JavaScript');
    console.log('');
    console.log('🚨 LAST RESORT FIXES:');
    console.log('1. Completely restart VS Code (not just reload)');
    console.log('2. Clear VS Code extension cache');
    console.log('3. Reinstall extension from scratch');
    console.log('4. Check VS Code version compatibility');
}

runTests(); 