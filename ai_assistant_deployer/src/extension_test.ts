import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Assistant Deployer TEST VERSION is now active!');
    
    // Show a notification to confirm activation
    vscode.window.showInformationMessage('AI Assistant Deployer is now active! 🚀');
    
    // Create a simple status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = "$(rocket) AI Assistant";
    statusBarItem.tooltip = "AI Assistant Deployer is active";
    statusBarItem.command = 'aiAssistantDeployer.showQuickActions';
    statusBarItem.show();
    
    // Register a simple command
    const quickActionsCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.showQuickActions',
        () => {
            vscode.window.showInformationMessage(
                '🎯 AI Assistant Deployer is working!',
                'Deploy Files',
                'Show Status'
            ).then(selection => {
                if (selection === 'Deploy Files') {
                    vscode.window.showInformationMessage('Deploy functionality would run here');
                } else if (selection === 'Show Status') {
                    vscode.window.showInformationMessage('Status: Extension is active and working!');
                }
            });
        }
    );

    context.subscriptions.push(
        quickActionsCommand,
        statusBarItem
    );

    console.log('AI Assistant Deployer TEST VERSION activated successfully');
}

export function deactivate() {
    console.log('AI Assistant Deployer TEST VERSION deactivated');
}
