#!/usr/bin/env node

/**
 * Command Palette Visibility Test
 * Tests the Command Palette menu configuration to ensure Custom Mode Builder is visible
 */

const fs = require('fs');

function testCommandPaletteVisibility() {
    console.log('🎯 Testing Command Palette Visibility\n');
    
    try {
        // Check package.json menu configuration
        const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        
        console.log('📋 Command Palette Menu Configuration:');
        const commandPaletteMenus = packageJson.contributes?.menus?.commandPalette || [];
        
        commandPaletteMenus.forEach((menu, index) => {
            console.log(`${index + 1}. Command: "${menu.command}"`);
            if (menu.when) {
                console.log(`   When: ${menu.when}`);
            }
        });
        
        // Check specifically for Custom Mode Builder
        const customModeBuilderMenu = commandPaletteMenus.find(menu => 
            menu.command === 'aiAssistantDeployer.customModeBuilder'
        );
        
        console.log('\n🔍 Custom Mode Builder Status:');
        if (customModeBuilderMenu) {
            console.log('✅ Custom Mode Builder IS listed in Command Palette menus');
            console.log(`   Command: "${customModeBuilderMenu.command}"`);
            if (customModeBuilderMenu.when) {
                console.log(`   Condition: ${customModeBuilderMenu.when}`);
            } else {
                console.log('   Condition: Always visible (no "when" clause)');
            }
        } else {
            console.log('❌ Custom Mode Builder NOT found in Command Palette menus');
        }
        
        // Check all registered commands
        console.log('\n📋 All Registered Commands:');
        const commands = packageJson.contributes?.commands || [];
        commands.forEach((cmd, index) => {
            const isInPalette = commandPaletteMenus.some(menu => menu.command === cmd.command);
            console.log(`${index + 1}. "${cmd.title}" (${cmd.command}) - ${isInPalette ? '✅ In Palette' : '❌ Hidden'}`);
        });
        
        console.log('\n🎯 TESTING STEPS:');
        console.log('1. **RESTART VS CODE COMPLETELY** (Very Important!)');
        console.log('2. Press Cmd+Shift+P (macOS) or Ctrl+Shift+P (Windows/Linux)');
        console.log('3. Type: "AI Assistant"');
        console.log('4. You should see:');
        console.log('   - AI Assistant: Quick Actions');
        console.log('   - AI Assistant: Custom Mode Builder ← THIS ONE!');
        console.log('5. Select "AI Assistant: Custom Mode Builder"');
        
        console.log('\n⚠️  IMPORTANT NOTES:');
        console.log('- Command Palette changes require VS Code restart');
        console.log('- If not visible after restart, there may be a caching issue');
        console.log('- Try: Developer: Reload Window (Cmd/Ctrl+R)');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCommandPaletteVisibility();
