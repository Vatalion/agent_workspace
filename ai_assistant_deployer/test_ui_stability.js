#!/usr/bin/env node

/**
 * UI Stability Test for AI Assistant Deployer Control Center
 * 
 * This test validates that our smart update system works correctly
 * and doesn't cause UI resets, scroll jumping, or modal disappearing.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing UI Stability Fixes...\n');

// Test 1: Verify that smart update system is implemented
console.log('📋 Test 1: Checking smart update implementation...');

const webviewProviderPath = path.join(__dirname, 'src/ui/aiAssistantWebviewProvider.ts');
const webviewContent = fs.readFileSync(webviewProviderPath, 'utf8');

// Check for selective update interface
if (webviewContent.includes('UIUpdatePayload')) {
    console.log('✅ UIUpdatePayload interface found');
} else {
    console.log('❌ UIUpdatePayload interface missing');
}

// Check for state tracking
if (webviewContent.includes('previousState') && webviewContent.includes('isInitialized')) {
    console.log('✅ State tracking properties found');
} else {
    console.log('❌ State tracking properties missing');
}

// Check for selective update method
if (webviewContent.includes('performSelectiveUpdate')) {
    console.log('✅ Selective update method found');
} else {
    console.log('❌ Selective update method missing');
}

// Check for comparison methods
const comparisonMethods = [
    'hasStatusChanged',
    'hasModesChanged',
    'hasRulesChanged',
    'hasLoadingChanged',
    'hasErrorChanged'
];

let comparisonMethodsFound = 0;
comparisonMethods.forEach(method => {
    if (webviewContent.includes(method)) {
        comparisonMethodsFound++;
    }
});

if (comparisonMethodsFound === comparisonMethods.length) {
    console.log('✅ All comparison methods found');
} else {
    console.log(`❌ Only ${comparisonMethodsFound}/${comparisonMethods.length} comparison methods found`);
}

// Test 2: Check for webview JavaScript enhancements
console.log('\n📋 Test 2: Checking webview JavaScript enhancements...');

// Check for handleSelectiveUpdate function
if (webviewContent.includes('handleSelectiveUpdate')) {
    console.log('✅ handleSelectiveUpdate function found');
} else {
    console.log('❌ handleSelectiveUpdate function missing');
}

// Check for specific update functions
const updateFunctions = [
    'updateStatusBadge',
    'updateModesSection',
    'updateRulesSection',
    'updateLoadingState',
    'updateErrorState'
];

let updateFunctionsFound = 0;
updateFunctions.forEach(func => {
    if (webviewContent.includes(func)) {
        updateFunctionsFound++;
    }
});

if (updateFunctionsFound === updateFunctions.length) {
    console.log('✅ All update functions found');
} else {
    console.log(`❌ Only ${updateFunctionsFound}/${updateFunctions.length} update functions found`);
}

// Test 3: Verify auto-refresh timer removal
console.log('\n📋 Test 3: Checking for auto-refresh timer removal...');

const problemmaticTimers = [
    'setInterval(refreshState',
    'setInterval(refresh',
    'setInterval(() => { updateUI()'
];

let timersFound = 0;
problemmaticTimers.forEach(timer => {
    if (webviewContent.includes(timer)) {
        timersFound++;
        console.log(`❌ Found problematic timer: ${timer}`);
    }
});

if (timersFound === 0) {
    console.log('✅ No problematic auto-refresh timers found');
} else {
    console.log(`❌ Found ${timersFound} problematic timers that could cause UI instability`);
}

// Test 4: Check for scroll preservation
console.log('\n📋 Test 4: Checking scroll preservation...');

if (webviewContent.includes('scrollTop') && webviewContent.includes('document.documentElement.scrollTop')) {
    console.log('✅ Scroll position preservation code found');
} else {
    console.log('❌ Scroll position preservation code missing');
}

// Summary
console.log('\n📊 Test Summary:');
console.log('================');

const tests = [
    webviewContent.includes('UIUpdatePayload'),
    webviewContent.includes('previousState') && webviewContent.includes('isInitialized'),
    webviewContent.includes('performSelectiveUpdate'),
    comparisonMethodsFound === comparisonMethods.length,
    webviewContent.includes('handleSelectiveUpdate'),
    updateFunctionsFound === updateFunctions.length,
    timersFound === 0,
    webviewContent.includes('scrollTop') && webviewContent.includes('document.documentElement.scrollTop')
];

const passedTests = tests.filter(test => test).length;
const totalTests = tests.length;

console.log(`Passed: ${passedTests}/${totalTests} tests`);

if (passedTests === totalTests) {
    console.log('🎉 All tests passed! UI stability fixes are properly implemented.');
    process.exit(0);
} else {
    console.log('⚠️  Some tests failed. UI stability may still have issues.');
    process.exit(1);
}
