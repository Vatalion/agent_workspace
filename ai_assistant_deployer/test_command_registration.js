/**
 * Test Script: Custom Mode Builder Command Registration
 * This script verifies that the Custom Mode Builder command is properly registered
 * and accessible through VS Code's Command Palette.
 */

const vscode = require('vscode');

async function testCommandRegistration() {
    console.log('🧪 Testing Custom Mode Builder Command Registration...\n');
    
    // Test 1: Check if command is registered
    console.log('Test 1: Command Registration Check');
    try {
        const commands = await vscode.commands.getCommands();
        const customModeBuilderCommand = commands.find(cmd => 
            cmd === 'aiAssistantDeployer.customModeBuilder'
        );
        
        if (customModeBuilderCommand) {
            console.log('✅ Command "aiAssistantDeployer.customModeBuilder" is registered');
        } else {
            console.log('❌ Command "aiAssistantDeployer.customModeBuilder" is NOT registered');
            console.log('Available AI Assistant commands:');
            const aiCommands = commands.filter(cmd => cmd.includes('aiAssistantDeployer'));
            aiCommands.forEach(cmd => console.log(`  - ${cmd}`));
        }
    } catch (error) {
        console.log(`❌ Error checking command registration: ${error.message}`);
    }
    
    // Test 2: Check extension activation
    console.log('\nTest 2: Extension Activation Check');
    try {
        const extension = vscode.extensions.getExtension('ai-assistant-tools.ai-assistant-deployer');
        if (extension) {
            console.log('✅ Extension found');
            console.log(`   Active: ${extension.isActive}`);
            console.log(`   Version: ${extension.packageJSON.version}`);
            
            if (!extension.isActive) {
                console.log('🔄 Activating extension...');
                await extension.activate();
                console.log('✅ Extension activated');
            }
        } else {
            console.log('❌ Extension not found');
        }
    } catch (error) {
        console.log(`❌ Error checking extension: ${error.message}`);
    }
    
    // Test 3: Try to execute the command
    console.log('\nTest 3: Command Execution Test');
    try {
        await vscode.commands.executeCommand('aiAssistantDeployer.customModeBuilder');
        console.log('✅ Custom Mode Builder command executed successfully');
    } catch (error) {
        console.log(`❌ Error executing command: ${error.message}`);
    }
    
    console.log('\n🏁 Command registration test completed!');
}

// Export for potential use in VS Code extension context
module.exports = { testCommandRegistration };

// If running directly (for manual testing)
if (require.main === module) {
    console.log('⚠️  This script is meant to run within VS Code extension context');
    console.log('   Commands to manually verify:');
    console.log('   1. Open VS Code Command Palette (Ctrl+Shift+P / Cmd+Shift+P)');
    console.log('   2. Type "AI Assistant: Custom Mode Builder"');
    console.log('   3. The command should appear and be executable');
    console.log('   4. If command appears but doesn\'t work, check VS Code Developer Console (F12)');
}
