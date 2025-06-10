#!/usr/bin/env node

/**
 * EMERGENCY DEBUG - Check Extension Activation
 */

console.log('🚨 EMERGENCY DEBUG - Extension Status Check');
console.log('==========================================\n');

const { execSync } = require('child_process');

try {
    // Check installed extensions
    console.log('📋 1. Checking installed extensions...');
    const extensions = execSync('code --list-extensions', { encoding: 'utf8' });
    console.log('Installed extensions:', extensions.split('\n').filter(e => e.includes('assistant')));

    // Check if the extension view is registered
    console.log('\n📋 2. Checking package.json view registration...');
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    console.log('View containers:', JSON.stringify(pkg.contributes?.viewsContainers, null, 2));
    console.log('Views:', JSON.stringify(pkg.contributes?.views, null, 2));

    // Check if extension bundle has webview provider
    console.log('\n📋 3. Checking compiled extension...');
    const extPath = './out/extension.js';
    if (fs.existsSync(extPath)) {
        const content = fs.readFileSync(extPath, 'utf8');
        const hasWebviewProvider = content.includes('WebviewProvider') || content.includes('registerWebviewViewProvider');
        const hasActivate = content.includes('function activate') || content.includes('activate(');
        
        console.log('Extension bundle analysis:');
        console.log('  - Size:', (content.length / 1024).toFixed(1), 'KB');
        console.log('  - Has activate function:', hasActivate);
        console.log('  - Has WebviewProvider:', hasWebviewProvider);
        
        if (!hasWebviewProvider) {
            console.log('❌ CRITICAL: WebviewProvider not found in bundle!');
        }
        if (!hasActivate) {
            console.log('❌ CRITICAL: activate function not found in bundle!');
        }
    }

    console.log('\n🎯 IMMEDIATE ACTIONS:');
    console.log('1. Reload VS Code (Cmd+R)');
    console.log('2. Check if "AI Assistant Deployer" appears in the Activity Bar (left sidebar)');
    console.log('3. Click on the rocket icon if visible');
    console.log('4. Look for "CONTROL CENTER" panel');

} catch (error) {
    console.error('❌ Debug failed:', error.message);
}

console.log('\n✅ Debug check completed!');
