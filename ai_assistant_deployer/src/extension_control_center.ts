import * as vscode from 'vscode';
import { AIAssistantWebviewProvider } from './ui/aiAssistantWebviewProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 AI Assistant Deployer is now active!');

    // Create the AI Assistant WebView Provider for the control center
    const webviewProvider = new AIAssistantWebviewProvider(
        vscode.Uri.file(context.extensionPath),
        context
    );
    
    // Register the WebView Provider for the activity bar panel
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'aiAssistantDeployer.controlCenter',
            webviewProvider
        )
    );

    // Register commands
    const showQuickActionsCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.showQuickActions',
        async () => {
            // Show the AI Assistant activity bar and focus the control center
            await vscode.commands.executeCommand('workbench.view.extension.ai-assistant-deployer');
            vscode.window.showInformationMessage('AI Assistant Control Center opened!');
        }
    );

    const quickDeployCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.quickDeploy',
        async () => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('⚠️ No workspace folder found. Please open a project first.');
                return;
            }

            try {
                // Use the webview provider's deploy functionality
                await webviewProvider.deployFromOutFolder();
                vscode.window.showInformationMessage('✅ AI Assistant deployed successfully! 🚀');
            } catch (error) {
                vscode.window.showErrorMessage(`❌ Deployment failed: ${error}`);
            }
        }
    );

    const testCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.test',
        () => {
            vscode.window.showInformationMessage('✅ AI Assistant extension is working!');
        }
    );

    // Add Custom Mode Builder command
    const customModeBuilderCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.customModeBuilder',
        async () => {
            // Open custom mode builder webview
            await webviewProvider.openCustomModeBuilder();
        }
    );

    // Add Select Mode command
    const selectModeCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.selectMode',
        async () => {
            // Open mode selection interface
            await webviewProvider.openModeSelection();
        }
    );

    const resetCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.reset',
        async () => {
            const confirmation = await vscode.window.showWarningMessage(
                '⚠️ Reset AI Assistant files? This will remove all deployed files and create a backup.',
                { modal: true },
                'Reset',
                'Cancel'
            );

            if (confirmation === 'Reset') {
                try {
                    await webviewProvider.resetDeployedFiles();
                } catch (error) {
                    vscode.window.showErrorMessage(`❌ Reset failed: ${error}`);
                }
            }
        }
    );

    context.subscriptions.push(
        showQuickActionsCommand,
        quickDeployCommand,
        testCommand,
        customModeBuilderCommand,
        selectModeCommand,
        resetCommand
    );

    console.log('✅ AI Assistant Deployer activated with Control Center!');
    
    // Show welcome message
    vscode.window.showInformationMessage(
        '🚀 AI Assistant Deployer is ready! Check the Activity Bar for the rocket icon.',
        'Open Control Center'
    ).then(selection => {
        if (selection === 'Open Control Center') {
            vscode.commands.executeCommand('workbench.view.extension.ai-assistant-deployer');
        }
    });
}

export function deactivate() {
    console.log('🔄 AI Assistant Deployer deactivated');
}
