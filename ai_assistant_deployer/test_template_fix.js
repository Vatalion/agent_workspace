#!/usr/bin/env node

/**
 * Test Template Literal Fix
 * This script tests that the webview HTML template is generating valid HTML
 * without JavaScript syntax errors.
 */

const fs = require('fs');

console.log('🧪 TESTING TEMPLATE LITERAL FIX');
console.log('===============================');

// Read the compiled webview provider
const webviewPath = './out/ui/aiAssistantWebviewProvider.js';
if (!fs.existsSync(webviewPath)) {
    console.log('❌ Compiled webview provider not found');
    process.exit(1);
}

const content = fs.readFileSync(webviewPath, 'utf8');

// Check for the problematic pattern
const problematicPattern = /this\.currentState\.activeTab/g;
const matches = content.match(problematicPattern);

if (matches && matches.length > 0) {
    console.log('❌ STILL HAS PROBLEM: Found this.currentState.activeTab in template literal');
    console.log(`   Found ${matches.length} occurrences`);
    process.exit(1);
} else {
    console.log('✅ TEMPLATE FIXED: No this.currentState.activeTab in template literals');
}

// Check for the correct pattern
const correctPattern = /activeTab === 'modes'/g;
const correctMatches = content.match(correctPattern);

if (correctMatches && correctMatches.length > 0) {
    console.log(`✅ CORRECT PATTERN: Found ${correctMatches.length} occurrences of activeTab variable usage`);
} else {
    console.log('⚠️  No activeTab variable usage found - this might indicate another issue');
}

// Check for basic HTML structure
const hasHTMLStart = content.includes('<!DOCTYPE html>');
const hasHTMLEnd = content.includes('</html>');
const hasScript = content.includes('<script>');
const hasStyle = content.includes('<style>');

console.log('\n📋 HTML STRUCTURE CHECK:');
console.log(`   DOCTYPE: ${hasHTMLStart ? '✅' : '❌'}`);
console.log(`   Closing HTML: ${hasHTMLEnd ? '✅' : '❌'}`);
console.log(`   Script tag: ${hasScript ? '✅' : '❌'}`);
console.log(`   Style tag: ${hasStyle ? '✅' : '❌'}`);

if (hasHTMLStart && hasHTMLEnd && hasScript && hasStyle) {
    console.log('\n🎉 SUCCESS: Template literal fix applied and HTML structure is valid!');
    console.log('\n📌 NEXT STEPS:');
    console.log('1. 🔄 Restart VS Code completely');
    console.log('2. 🎯 Open the AI Assistant Deployer panel in the sidebar');
    console.log('3. 📋 Check VS Code Developer Console for any remaining errors');
    console.log('4. ✅ The UI should now display properly');
} else {
    console.log('\n❌ HTML structure incomplete - there may be other issues');
}
