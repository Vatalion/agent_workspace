#!/usr/bin/env node

/**
 * Direct Extension Debug
 * 
 * This will help us understand exactly what's happening with the buttons
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIRECT EXTENSION DEBUG');
console.log('='.repeat(40));

const extensionPath = path.join(__dirname, 'flutter_debug_extension', 'src', 'extension.ts');
const content = fs.readFileSync(extensionPath, 'utf8');

console.log('\n1. 🔧 Checking handleServerAction function:');
const handleServerActionMatch = content.match(/function handleServerAction\(action\) \{[\s\S]*?\n\t\}/);
if (handleServerActionMatch) {
    console.log('✅ Found handleServerAction:');
    console.log(handleServerActionMatch[0]);
} else {
    console.log('❌ handleServerAction function not found!');
}

console.log('\n2. 🔧 Checking button HTML:');
const buttonMatches = content.match(/<button[^>]*onclick="handleServerAction[^>]*>/g);
if (buttonMatches) {
    console.log('✅ Found buttons:');
    buttonMatches.forEach((button, i) => {
        console.log(`   ${i + 1}. ${button}`);
    });
} else {
    console.log('❌ No buttons with handleServerAction found!');
}

console.log('\n3. 🔧 Checking for disabled attributes:');
const disabledButtons = content.match(/<button[^>]*disabled[^>]*>/g);
if (disabledButtons) {
    console.log('⚠️ Found disabled buttons:');
    disabledButtons.forEach((button, i) => {
        console.log(`   ${i + 1}. ${button}`);
    });
} else {
    console.log('✅ No disabled buttons found');
}

console.log('\n4. 🔧 Checking initialization:');
if (content.includes('Force enable all buttons on startup')) {
    console.log('✅ Found button force-enable logic');
} else {
    console.log('❌ Button force-enable logic missing');
}

console.log('\n5. 🔧 Checking for blocking logic:');
if (content.includes('isProcessing')) {
    console.log('⚠️ Still found isProcessing references');
    const processingMatches = content.match(/isProcessing[^;]*/g);
    if (processingMatches) {
        processingMatches.slice(0, 5).forEach(match => {
            console.log(`   - ${match}`);
        });
    }
} else {
    console.log('✅ No isProcessing blocking logic found');
}

console.log('\n6. 🔧 Checking message sending:');
if (content.includes('vscode.postMessage({')) {
    console.log('✅ Found vscode.postMessage calls');
    const messageMatches = content.match(/vscode\.postMessage\(\{[^}]*\}/g);
    if (messageMatches) {
        console.log('   Message patterns:');
        messageMatches.slice(0, 3).forEach((msg, i) => {
            console.log(`   ${i + 1}. ${msg}`);
        });
    }
} else {
    console.log('❌ No vscode.postMessage calls found!');
}

console.log('\n🎯 DIAGNOSIS:');
console.log('='.repeat(20));

// Check if the compiled version exists
const distPath = path.join(__dirname, 'flutter_debug_extension', 'dist', 'extension.js');
if (fs.existsSync(distPath)) {
    console.log('✅ Compiled extension.js exists');
    const distContent = fs.readFileSync(distPath, 'utf8');
    
    if (distContent.includes('🔥 Button clicked:')) {
        console.log('✅ Compiled version contains our fixes');
    } else {
        console.log('❌ Compiled version does NOT contain our fixes!');
        console.log('   → Need to recompile the extension');
    }
    
    if (distContent.includes('handleServerAction')) {
        console.log('✅ Compiled version has handleServerAction');
    } else {
        console.log('❌ Compiled version missing handleServerAction!');
    }
} else {
    console.log('❌ Compiled extension.js not found!');
    console.log('   → Need to run: npm run compile');
}

console.log('\n🔧 NEXT STEPS:');
if (!fs.existsSync(distPath)) {
    console.log('1. Run: cd flutter_debug_extension && npm run compile');
    console.log('2. Rebuild extension: npx vsce package');
    console.log('3. Reinstall extension');
} else {
    console.log('1. Open VS Code Developer Console (Help → Toggle Developer Tools)');
    console.log('2. Look for JavaScript errors in Console tab');
    console.log('3. Check if handleServerAction function is defined');
    console.log('4. Try manually calling: handleServerAction("start")');
}

console.log('\n💡 POSSIBLE ISSUES:');
console.log('• Extension not properly reloaded after reinstall');
console.log('• Webview security policy blocking JavaScript');
console.log('• Extension running old cached version');
console.log('• VS Code needs full restart (not just reload)'); 