#!/usr/bin/env node

/**
 * Test script to verify button functionality in Flutter Debug Assistant
 */

console.log('🧪 Testing Flutter Debug Assistant - Button Functionality');
console.log('=' .repeat(60));

const fs = require('fs');
const path = require('path');

// Test 1: Check if extension file exists and has the correct message handlers
console.log('\n1. ✅ Checking Message Handlers');

const extensionPath = path.join(__dirname, 'flutter_debug_extension', 'src', 'extension.ts');

if (!fs.existsSync(extensionPath)) {
    console.log('   ❌ Extension file not found');
    process.exit(1);
}

const extensionContent = fs.readFileSync(extensionPath, 'utf8');

// Check for required message handlers
const requiredHandlers = [
    'case \'startServer\':',
    'case \'stopServer\':',
    'case \'restartServer\':',
    'await this.assistant.startMCPServer();',
    'await this.assistant.stopMCPServer();',
    'await this.assistant.restartMCPServer();'
];

let allHandlersFound = true;
for (const handler of requiredHandlers) {
    if (!extensionContent.includes(handler)) {
        console.log(`   ❌ Missing handler: ${handler}`);
        allHandlersFound = false;
    } else {
        console.log(`   ✅ Found: ${handler}`);
    }
}

if (allHandlersFound) {
    console.log('   ✅ All message handlers are present');
} else {
    console.log('   ❌ Some message handlers are missing');
    process.exit(1);
}

// Test 2: Check JavaScript button handlers
console.log('\n2. ✅ Checking JavaScript Button Handlers');

const jsHandlers = [
    'function handleServerAction(action)',
    'vscode.postMessage({ type: action + \'Server\'',
    'onclick="handleServerAction(\'start\')"',
    'onclick="handleServerAction(\'stop\')"',
    'onclick="handleServerAction(\'restart\')"'
];

let allJSHandlersFound = true;
for (const handler of jsHandlers) {
    if (!extensionContent.includes(handler)) {
        console.log(`   ❌ Missing JS handler: ${handler}`);
        allJSHandlersFound = false;
    } else {
        console.log(`   ✅ Found: ${handler}`);
    }
}

if (allJSHandlersFound) {
    console.log('   ✅ All JavaScript handlers are present');
} else {
    console.log('   ❌ Some JavaScript handlers are missing');
}

// Test 3: Check button HTML structure
console.log('\n3. ✅ Checking Button HTML Structure');

const buttonChecks = [
    'id="startBtn"',
    'id="stopBtn"',
    'id="restartBtn"',
    'class="control-button primary"',
    'class="control-button danger"',
    'class="control-button secondary"'
];

let allButtonsFound = true;
for (const button of buttonChecks) {
    if (!extensionContent.includes(button)) {
        console.log(`   ❌ Missing button: ${button}`);
        allButtonsFound = false;
    } else {
        console.log(`   ✅ Found: ${button}`);
    }
}

if (allButtonsFound) {
    console.log('   ✅ All buttons are properly defined');
} else {
    console.log('   ❌ Some buttons are missing or malformed');
}

// Test 4: Check for disabled attributes (should not be present)
console.log('\n4. ✅ Checking Button States');

const disabledChecks = [
    'startBtn.*disabled',
    'stopBtn.*disabled',
    'restartBtn.*disabled'
];

let noDisabledButtons = true;
for (const check of disabledChecks) {
    const regex = new RegExp(check);
    if (regex.test(extensionContent)) {
        console.log(`   ⚠️  Found disabled button: ${check}`);
        noDisabledButtons = false;
    }
}

if (noDisabledButtons) {
    console.log('   ✅ No buttons are disabled by default');
} else {
    console.log('   ⚠️  Some buttons may be disabled');
}

// Summary
console.log('\n' + '=' .repeat(60));
console.log('📋 SUMMARY:');

if (allHandlersFound && allJSHandlersFound && allButtonsFound) {
    console.log('✅ All button functionality tests PASSED');
    console.log('✅ Buttons should be working correctly');
    console.log('\n🎯 Next Steps:');
    console.log('1. Open VS Code with the Flutter project');
    console.log('2. Look for the "Flutter AI Debug Assistant" panel in the sidebar');
    console.log('3. Try clicking the Start, Stop, and Restart buttons');
    console.log('4. Check the status updates in the UI');
} else {
    console.log('❌ Some button functionality tests FAILED');
    console.log('❌ Buttons may not work correctly');
}

console.log('\n🔧 Troubleshooting:');
console.log('- If buttons still don\'t work, check the VS Code Developer Console');
console.log('- Press F12 in VS Code and look for JavaScript errors');
console.log('- Make sure the extension is properly installed and activated'); 