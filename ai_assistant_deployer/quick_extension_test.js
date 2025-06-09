#!/usr/bin/env node

/**
 * Quick Extension Test - Verify AI Assistant Deployer is working
 */

const { execSync } = require('child_process');

console.log('🧪 Quick Extension Test - AI Assistant Deployer');
console.log('===============================================\n');

try {
    // Test if extension is installed
    console.log('📋 Test 1: Extension Installation');
    const listOutput = execSync('code --list-extensions', { encoding: 'utf8' });
    
    if (listOutput.includes('ai-assistant-deployer') || listOutput.includes('undefined_publisher.ai-assistant-deployer')) {
        console.log('✅ Extension is installed in VS Code');
    } else {
        console.log('❌ Extension not found in VS Code');
        console.log('📍 Installed extensions:', listOutput);
    }

    // Check extension files
    console.log('\n📋 Test 2: Extension Files');
    const fs = require('fs');
    const path = require('path');
    
    const packagePath = path.join(__dirname, 'ai-assistant-deployer-1.0.0.vsix');
    if (fs.existsSync(packagePath)) {
        const stats = fs.statSync(packagePath);
        console.log('✅ Extension package exists');
        console.log(`📊 Package size: ${(stats.size / 1024).toFixed(1)} KB`);
    } else {
        console.log('❌ Extension package not found');
    }

    // Check main entry point
    const outPath = path.join(__dirname, 'out/extension.js');
    if (fs.existsSync(outPath)) {
        const stats = fs.statSync(outPath);
        console.log('✅ Main extension bundle exists');
        console.log(`📊 Bundle size: ${(stats.size / 1024).toFixed(1)} KB`);
    } else {
        console.log('❌ Main extension bundle missing');
    }

    console.log('\n🎯 Next Steps:');
    console.log('1. Reload VS Code window (Cmd+R or Ctrl+R)');
    console.log('2. Open Command Palette (Cmd+Shift+P)');
    console.log('3. Search for "AI Assistant" commands');
    console.log('4. Check the AI Assistant Deployer panel in the Explorer sidebar');

} catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
}

console.log('\n✅ Extension test completed successfully!');
