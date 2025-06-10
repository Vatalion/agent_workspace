import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Show an immediate notification to confirm extension is loading
    vscode.window.showInformationMessage('🚀 AI Assistant Deployer is activating...');
    
    console.log('🚀 AI Assistant Deployer ACTIVATING NOW!');

    // Create status bar item - ALWAYS visible
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left, 
        1000  // High priority
    );
    
    statusBarItem.text = "🚀 AI Assistant";
    statusBarItem.tooltip = "AI Assistant Deployer - Click to use";
    statusBarItem.command = 'aiAssistantDeployer.test';
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
    
    // Force show the status bar
    statusBarItem.show();
    
    console.log('Status bar item created and shown');

    // Test command that just shows a message
    const testCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.test',
        () => {
            vscode.window.showInformationMessage('✅ AI Assistant extension is working! Status bar clicked.');
        }
    );

    // Quick deploy command for command palette
    const quickDeployCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.quickDeploy',
        () => {
            vscode.window.showInformationMessage('🚀 Quick Deploy command triggered!');
        }
    );

    // Quick actions command
    const quickActionsCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.showQuickActions',
        () => {
            vscode.window.showInformationMessage('📋 Quick Actions command triggered!');
        }
    );

    context.subscriptions.push(
        statusBarItem,
        testCommand,
        quickDeployCommand,
        quickActionsCommand
    );

    console.log('✅ AI Assistant Deployer FULLY ACTIVATED!');
    
    // Show success notification
    setTimeout(() => {
        vscode.window.showInformationMessage('✅ AI Assistant Deployer is ready! Check the status bar.');
    }, 1000);
}

export function deactivate() {
    console.log('🔄 AI Assistant Deployer deactivated');
}
