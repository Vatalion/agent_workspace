#!/usr/bin/env node

/**
 * REAL DEBUGGING - Let's actually find what's wrong with the UI
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 REAL DEBUG: AI Assistant Deployer Empty UI Issue');
console.log('==================================================\n');

// 1. Check extension package is correctly structured
console.log('1️⃣ Checking extension package structure...');
const packagePath = './ai-assistant-deployer-1.0.0.vsix';
if (fs.existsSync(packagePath)) {
    const stats = fs.statSync(packagePath);
    console.log(`   ✅ Extension package exists (${(stats.size / 1024).toFixed(1)} KB)`);
} else {
    console.log('   ❌ Extension package not found');
    console.log('   🔧 Run: npm run package');
    process.exit(1);
}

// 2. Check if main extension file exists and has proper structure
console.log('\n2️⃣ Checking main extension file...');
const extensionPath = './out/extension.js';
if (fs.existsSync(extensionPath)) {
    const content = fs.readFileSync(extensionPath, 'utf8');
    
    // Check for activation function
    const hasActivate = content.includes('function activate') || content.includes('activate(');
    console.log(`   Activate function: ${hasActivate ? '✅' : '❌'}`);
    
    // Check for webview registration
    const hasWebviewReg = content.includes('registerWebviewViewProvider');
    console.log(`   Webview registration: ${hasWebviewReg ? '✅' : '❌'}`);
    
    // Check viewType usage
    const viewTypeMatch = content.match(/AIAssistantWebviewProvider\.viewType/g);
    console.log(`   ViewType references: ${viewTypeMatch ? viewTypeMatch.length : 0}`);
    
} else {
    console.log('   ❌ Extension file not found');
    console.log('   🔧 Run: npm run compile');
    process.exit(1);
}

// 3. Check webview provider implementation
console.log('\n3️⃣ Checking webview provider implementation...');
const webviewPath = './out/ui/aiAssistantWebviewProvider.js';
if (fs.existsSync(webviewPath)) {
    const content = fs.readFileSync(webviewPath, 'utf8');
    
    // Check viewType value
    const viewTypeMatch = content.match(/viewType\s*=\s*['"']([^'"]+)['"']/);
    const viewType = viewTypeMatch ? viewTypeMatch[1] : 'not found';
    console.log(`   ViewType: ${viewType}`);
    
    // Check if generateWebviewHTML exists
    const hasGenerateHTML = content.includes('generateWebviewHTML');
    console.log(`   generateWebviewHTML method: ${hasGenerateHTML ? '✅' : '❌'}`);
    
    // Check if constructor exists
    const hasConstructor = content.includes('constructor(');
    console.log(`   Constructor: ${hasConstructor ? '✅' : '❌'}`);
    
    // Check if resolveWebviewView exists
    const hasResolve = content.includes('resolveWebviewView');
    console.log(`   resolveWebviewView method: ${hasResolve ? '✅' : '❌'}`);
    
} else {
    console.log('   ❌ Webview provider not found');
    process.exit(1);
}

// 4. Check package.json view configuration
console.log('\n4️⃣ Checking package.json configuration...');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Check views configuration
const views = pkg.contributes?.views?.['ai-assistant-deployer'];
if (views && views.length > 0) {
    const view = views[0];
    console.log(`   View ID: ${view.id}`);
    console.log(`   View Type: ${view.type}`);
    console.log(`   View Name: ${view.name}`);
    
    // Check if view ID matches webview provider viewType
    const webviewContent = fs.readFileSync(webviewPath, 'utf8');
    const viewTypeMatch = webviewContent.match(/viewType\s*=\s*['"']([^'"]+)['"']/);
    const codeViewType = viewTypeMatch ? viewTypeMatch[1] : 'not found';
    
    if (view.id === codeViewType) {
        console.log('   ✅ View ID matches code viewType');
    } else {
        console.log('   ❌ View ID mismatch!');
        console.log(`      Package.json: ${view.id}`);
        console.log(`      Code: ${codeViewType}`);
    }
} else {
    console.log('   ❌ No views found in package.json');
}

// Check activation events
const activationEvents = pkg.activationEvents || [];
console.log(`   Activation events: ${activationEvents.length}`);
if (activationEvents.length === 0) {
    console.log('   ⚠️  No activation events - extension may not start');
}

// 5. Test the actual webview generation
console.log('\n5️⃣ Testing webview HTML generation...');
try {
    // This is tricky because we need to mock vscode module
    console.log('   📝 Checking HTML generation capability...');
    
    // Read the webview provider and look for HTML generation
    const webviewContent = fs.readFileSync(webviewPath, 'utf8');
    
    // Check if HTML template is present
    const hasHTMLTemplate = webviewContent.includes('<!DOCTYPE html>');
    console.log(`   HTML template present: ${hasHTMLTemplate ? '✅' : '❌'}`);
    
    // Check for CSS styles
    const hasCSS = webviewContent.includes('<style>') || webviewContent.includes('var(--vscode-');
    console.log(`   CSS styles present: ${hasCSS ? '✅' : '❌'}`);
    
    // Check for JavaScript
    const hasJS = webviewContent.includes('<script>') || webviewContent.includes('vscode.postMessage');
    console.log(`   JavaScript present: ${hasJS ? '✅' : '❌'}`);
    
} catch (error) {
    console.log(`   ❌ Error testing HTML generation: ${error.message}`);
}

// 6. Check for common issues
console.log('\n6️⃣ Checking for common issues...');

// Check if there are multiple webview providers
const webviewFiles = fs.readdirSync('./out/ui/').filter(f => f.includes('WebviewProvider'));
console.log(`   Webview provider files: ${webviewFiles.length}`);
webviewFiles.forEach(file => {
    console.log(`     - ${file}`);
});

if (webviewFiles.length > 1) {
    console.log('   ⚠️  Multiple webview providers detected - potential conflict');
}

// Check TypeScript compilation errors
const hasMapFiles = fs.readdirSync('./out/ui/').filter(f => f.endsWith('.map')).length > 0;
console.log(`   Source maps present: ${hasMapFiles ? '✅' : '❌'}`);

console.log('\n🎯 DIAGNOSIS COMPLETE');
console.log('=====================');

// Provide specific recommendations
console.log('\n🔧 RECOMMENDED ACTIONS:');
console.log('1. 🔄 Restart VS Code completely');
console.log('2. 📋 Open VS Code Developer Console (Help > Toggle Developer Tools)');
console.log('3. 🔍 Look for red errors in Console tab');
console.log('4. 📱 Check if AI Assistant Deployer appears in Activity Bar');
console.log('5. 🎛️ If it appears, click it and check if webview loads');

console.log('\n🚨 IF STILL EMPTY:');
console.log('- Extension may be activating but webview not resolving');
console.log('- Check for JavaScript errors in Developer Console');
console.log('- Verify workspace has a folder open (required for many features)');
console.log('- Try command: "AI Assistant: Deploy" from Command Palette');
