const { ModeDiscoveryService } = require('./out/services/modeDiscovery');
const path = require('path');

// Simple test to verify mode discovery works
async function testModeDiscovery() {
    const workspaceRoot = '/Users/vitalijsimko/workspace/projects/other/agent_workspace/ai_assistant_deployer';
    const extensionPath = '/Users/vitalijsimko/workspace/projects/other/agent_workspace/ai_assistant_deployer';
    
    const modeDiscovery = new ModeDiscoveryService(workspaceRoot, extensionPath);
    
    console.log('🔍 Testing mode discovery...');
    
    try {
        const modes = await modeDiscovery.discoverAvailableModes();
        console.log(`✅ Discovered ${modes.length} modes:`);
        
        modes.forEach(mode => {
            console.log(`  - ${mode.name} (${mode.id})`);
            console.log(`    Description: ${mode.description}`);
            console.log(`    Features: ${mode.features.join(', ')}`);
            console.log(`    Estimated hours: ${mode.estimatedHours}`);
            console.log(`    Is active: ${mode.isActive}`);
            console.log(`    Has conflicts: ${mode.hasConflicts}`);
            console.log('');
        });
        
        return modes;
    } catch (error) {
        console.error('❌ Error testing mode discovery:', error);
        return [];
    }
}

testModeDiscovery().then(modes => {
    console.log(`\n🎯 Test completed. Found ${modes.length} modes.`);
    process.exit(0);
}).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
