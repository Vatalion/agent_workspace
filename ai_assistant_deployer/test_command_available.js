#!/usr/bin/env node

/**
 * Test script to verify if the Custom Mode Builder command is properly registered
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function testCommandAvailability() {
    console.log('🧪 Testing Custom Mode Builder Command Availability\n');
    
    try {
        // Test 1: Check if extension is installed
        console.log('📋 Test 1: Extension installation check');
        const extensions = execSync('code --list-extensions', { encoding: 'utf8' });
        const isInstalled = extensions.includes('ai-assistant-tools.ai-assistant-deployer');
        console.log(`Extension installed: ${isInstalled ? '✅ YES' : '❌ NO'}`);
        
        if (!isInstalled) {
            console.log('❌ Extension not properly installed. Run installation first.');
            return;
        }
        
        // Test 2: Check package.json command registration
        console.log('\n📋 Test 2: Package.json command registration');
        const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        const commands = packageJson.contributes?.commands || [];
        const customModeCommand = commands.find(cmd => 
            cmd.command === 'aiAssistantDeployer.customModeBuilder'
        );
        
        if (customModeCommand) {
            console.log('✅ Command registered in package.json:');
            console.log(`   Title: "${customModeCommand.title}"`);
            console.log(`   Command: "${customModeCommand.command}"`);
            console.log(`   Category: "${customModeCommand.category}"`);
        } else {
            console.log('❌ Command NOT found in package.json');
        }
        
        // Test 3: Check activation events
        console.log('\n📋 Test 3: Activation events check');
        const activationEvents = packageJson.activationEvents || [];
        const hasActivationEvent = activationEvents.includes('onCommand:aiAssistantDeployer.customModeBuilder');
        console.log(`Activation event registered: ${hasActivationEvent ? '✅ YES' : '❌ NO'}`);
        
        // Test 4: Check compiled extension file
        console.log('\n📋 Test 4: Compiled extension check');
        const distExists = fs.existsSync('./dist/extension.js');
        console.log(`Compiled extension exists: ${distExists ? '✅ YES' : '❌ NO'}`);
        
        if (distExists) {
            const extensionCode = fs.readFileSync('./dist/extension.js', 'utf8');
            const hasCustomModeBuilder = extensionCode.includes('customModeBuilder');
            console.log(`Contains customModeBuilder code: ${hasCustomModeBuilder ? '✅ YES' : '❌ NO'}`);
        }
        
        // Test 5: Check VSIX package
        console.log('\n📋 Test 5: VSIX package check');
        const vsixExists = fs.existsSync('./ai-assistant-deployer-1.0.0.vsix');
        console.log(`VSIX package exists: ${vsixExists ? '✅ YES' : '❌ NO'}`);
        
        if (vsixExists) {
            const stats = fs.statSync('./ai-assistant-deployer-1.0.0.vsix');
            console.log(`VSIX size: ${(stats.size / 1024).toFixed(2)}KB`);
        }
        
        console.log('\n🎯 MANUAL TESTING INSTRUCTIONS:');
        console.log('1. Open VS Code');
        console.log('2. Press Cmd+Shift+P (macOS) or Ctrl+Shift+P (Windows/Linux)');
        console.log('3. Type: "AI Assistant: Custom Mode Builder"');
        console.log('4. The command should appear in the list');
        console.log('5. Select it to open the Custom Mode Builder');
        
        console.log('\n🔍 TROUBLESHOOTING:');
        console.log('- If command not found: Restart VS Code completely');
        console.log('- If extension not working: Check VS Code Developer Tools for errors');
        console.log('- If still issues: Try uninstalling and reinstalling the extension');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCommandAvailability();
