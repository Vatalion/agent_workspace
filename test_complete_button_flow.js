#!/usr/bin/env node

/**
 * Complete Button Flow Test
 * 
 * This script tests the entire communication chain:
 * 1. Webview button click -> Extension message handler
 * 2. Extension -> MCP Server control methods
 * 3. Server status checking and response
 * 4. Status update back to webview
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🔍 COMPLETE BUTTON FLOW ANALYSIS');
console.log('='.repeat(50));

// Test 1: Check if MCP server is actually running
console.log('\n1. 🌐 Testing MCP Server Status');
function testServerHealth() {
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
                    console.log('   ✅ Server is running:', response);
                    resolve(true);
                } catch (e) {
                    console.log('   ❌ Invalid response:', data);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.log('   ❌ Server not responding:', error.message);
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

// Test 2: Check extension message handlers
console.log('\n2. 📝 Checking Extension Message Handlers');
const extensionPath = path.join(__dirname, 'flutter_debug_extension', 'src', 'extension.ts');

if (!fs.existsSync(extensionPath)) {
    console.log('   ❌ Extension file not found');
    process.exit(1);
}

const extensionContent = fs.readFileSync(extensionPath, 'utf8');

// Check for message handler structure
const messageHandlers = [
    'webviewView.webview.onDidReceiveMessage',
    'case \'startServer\':',
    'case \'stopServer\':',
    'case \'restartServer\':',
    'await this.assistant.startMCPServer();',
    'await this.assistant.stopMCPServer();',
    'await this.assistant.restartMCPServer();'
];

let handlersOK = true;
messageHandlers.forEach(handler => {
    if (extensionContent.includes(handler)) {
        console.log(`   ✅ Found: ${handler}`);
    } else {
        console.log(`   ❌ Missing: ${handler}`);
        handlersOK = false;
    }
});

// Test 3: Check webview JavaScript handlers
console.log('\n3. 🖱️ Checking Webview Button Handlers');
const jsHandlers = [
    'function handleServerAction(action)',
    'vscode.postMessage({ type: action + \'Server\'',
    'onclick="handleServerAction(\'start\')"',
    'onclick="handleServerAction(\'stop\')"',
    'onclick="handleServerAction(\'restart\')"'
];

let jsOK = true;
jsHandlers.forEach(handler => {
    if (extensionContent.includes(handler)) {
        console.log(`   ✅ Found: ${handler}`);
    } else {
        console.log(`   ❌ Missing: ${handler}`);
        jsOK = false;
    }
});

// Test 4: Check server control methods
console.log('\n4. ⚙️ Checking Server Control Methods');
const serverMethods = [
    'public async startMCPServer():',
    'public async stopMCPServer():',
    'public async restartMCPServer():',
    'private async checkServerStatus():',
    'public async getServerStatus():',
    'this.updateServerStatus('
];

let methodsOK = true;
serverMethods.forEach(method => {
    if (extensionContent.includes(method)) {
        console.log(`   ✅ Found: ${method}`);
    } else {
        console.log(`   ❌ Missing: ${method}`);
        methodsOK = false;
    }
});

// Test 5: Check status update flow
console.log('\n5. 🔄 Checking Status Update Flow');
const statusFlow = [
    'updateServerStatus(status',
    'this.serverControlProvider.updateStatus',
    'this._view.webview.postMessage',
    'type: \'updateStatus\'',
    'case \'updateStatus\':',
    'updateButtonStates(status)'
];

let statusOK = true;
statusFlow.forEach(flow => {
    if (extensionContent.includes(flow)) {
        console.log(`   ✅ Found: ${flow}`);
    } else {
        console.log(`   ❌ Missing: ${flow}`);
        statusOK = false;
    }
});

// Test 6: Check for potential blocking issues
console.log('\n6. 🚫 Checking for Potential Issues');

// Check for isProcessing logic
if (extensionContent.includes('isProcessing')) {
    console.log('   ⚠️ Found isProcessing logic - could be blocking buttons');
    
    // Check if there's proper reset logic
    if (extensionContent.includes('isProcessing = false')) {
        console.log('   ✅ Found isProcessing reset logic');
    } else {
        console.log('   ❌ Missing isProcessing reset - buttons may stay disabled');
    }
} else {
    console.log('   ✅ No isProcessing blocking logic found');
}

// Check for button disabled logic
if (extensionContent.includes('disabled = true')) {
    console.log('   ⚠️ Found button disabling logic');
    
    if (extensionContent.includes('disabled = false')) {
        console.log('   ✅ Found button enabling logic');
    } else {
        console.log('   ❌ Missing button enabling logic - buttons may stay disabled');
    }
}

// Check for timeout logic
if (extensionContent.includes('setTimeout')) {
    console.log('   ⚠️ Found timeout logic - check for proper cleanup');
}

// Test 7: Identify the most likely issue
console.log('\n7. 🎯 DIAGNOSIS');
console.log('='.repeat(30));

async function runDiagnosis() {
    const serverRunning = await testServerHealth();
    
    if (!serverRunning) {
        console.log('❌ PRIMARY ISSUE: MCP Server is not running');
        console.log('   Solution: Start the MCP server first');
        console.log('   Command: cd src && node index.js');
        return;
    }
    
    if (!handlersOK) {
        console.log('❌ PRIMARY ISSUE: Extension message handlers are incomplete');
        console.log('   Solution: Fix missing message handlers in extension.ts');
        return;
    }
    
    if (!jsOK) {
        console.log('❌ PRIMARY ISSUE: Webview JavaScript handlers are incomplete');
        console.log('   Solution: Fix missing JavaScript handlers in webview HTML');
        return;
    }
    
    if (!methodsOK) {
        console.log('❌ PRIMARY ISSUE: Server control methods are incomplete');
        console.log('   Solution: Implement missing server control methods');
        return;
    }
    
    if (!statusOK) {
        console.log('❌ PRIMARY ISSUE: Status update flow is broken');
        console.log('   Solution: Fix status update communication chain');
        return;
    }
    
    // If all basic checks pass, look for subtle issues
    console.log('✅ All basic components are present');
    console.log('🔍 Checking for subtle issues...');
    
    // Check for initialization issues
    if (extensionContent.includes('initializeStatuses')) {
        console.log('   ✅ Found status initialization');
        
        if (extensionContent.includes('setTimeout(async () => {')) {
            console.log('   ⚠️ Status initialization uses setTimeout - may have timing issues');
            console.log('   Suggestion: Check if initialization timeout is too short/long');
        }
    }
    
    // Check for proper error handling
    if (extensionContent.includes('try {') && extensionContent.includes('catch (error)')) {
        console.log('   ✅ Found error handling');
    } else {
        console.log('   ⚠️ Limited error handling - errors may be silently failing');
    }
    
    console.log('\n🎯 MOST LIKELY ISSUES:');
    console.log('1. Server is running but extension thinks it\'s stopped');
    console.log('2. Button state management is preventing clicks');
    console.log('3. Message passing between webview and extension is failing');
    console.log('4. Status checking has timing issues');
    
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('1. Add debug logging to trace message flow');
    console.log('2. Force enable buttons on initialization');
    console.log('3. Add manual status refresh button');
    console.log('4. Simplify button state management');
}

runDiagnosis().then(() => {
    console.log('\n✅ Analysis complete');
}); 