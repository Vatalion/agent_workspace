// Simple test script to check available VS Code commands
const vscode = require('vscode');

async function testProviderDetection() {
    try {
        console.log('🔍 Testing provider detection...');
        
        // Get all available commands
        const allCommands = await vscode.commands.getCommands();
        console.log('📊 Total available commands:', allCommands.length);
        
        // Filter AI-related commands
        const aiRelatedCommands = allCommands.filter(cmd => 
            cmd.includes('copilot') || 
            cmd.includes('codegpt') || 
            cmd.includes('chat') || 
            cmd.includes('ai') || 
            cmd.includes('claude') || 
            cmd.includes('openai') ||
            cmd.includes('gpt')
        );
        
        console.log('🤖 AI-related commands found:');
        aiRelatedCommands.forEach(cmd => console.log('  -', cmd));
        
        // Check specific providers
        const copilotCommands = [
            'github.copilot.interactiveEditor.explain',
            'github.copilot.openChat',
            'workbench.panel.chat.view.copilot.focus',
            'github.copilot.chat.open',
            'github.copilot.generate'
        ];
        
        const availableCopilotCommands = copilotCommands.filter(cmd => allCommands.includes(cmd));
        console.log('✅ Available Copilot commands:', availableCopilotCommands);
        
        const codeGptCommands = [
            'codegpt.ask',
            'codegpt.explain',
            'codegpt.refactor',
            'codegpt.chat',
            'codegpt.openChat'
        ];
        
        const availableCodeGptCommands = codeGptCommands.filter(cmd => allCommands.includes(cmd));
        console.log('✅ Available CodeGPT commands:', availableCodeGptCommands);
        
        // Check extensions
        const extensions = vscode.extensions.all;
        console.log('📦 Total extensions:', extensions.length);
        
        const aiExtensions = extensions.filter(ext => 
            ext.id.includes('copilot') || 
            ext.id.includes('codegpt') || 
            ext.id.includes('claude') ||
            ext.id.includes('openai')
        );
        
        console.log('🔌 AI-related extensions:');
        aiExtensions.forEach(ext => {
            console.log(`  - ${ext.id} (active: ${ext.isActive})`);
        });
        
    } catch (error) {
        console.error('❌ Error testing provider detection:', error);
    }
}

module.exports = { testProviderDetection }; 