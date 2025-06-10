import * as vscode from 'vscode';
import { StatusBarProvider } from './ui/statusBarProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Assistant Deployer is now active!');

    // Initialize the StatusBar UI Provider
    const statusBarProvider = new StatusBarProvider(context);

    // Register the quick actions command that the StatusBarProvider uses
    const quickActionsCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.showQuickActions',
        () => statusBarProvider.showQuickActions()
    );

    // Add to subscriptions for proper cleanup
    context.subscriptions.push(
        quickActionsCommand,
        statusBarProvider
    );

    console.log('AI Assistant Deployer activated with StatusBar UI');
}

export function deactivate() {
    console.log('AI Assistant Deployer deactivated');
}
