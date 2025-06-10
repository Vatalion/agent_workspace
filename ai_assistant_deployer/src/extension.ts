import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectDetector } from './services/projectDetector';
import { FileDeployer } from './services/fileDeployer';
import { ConfigurationManager } from './services/configurationManager';
import { BackupManager } from './services/backupManager';
import { AIAssistantWebviewProvider } from './ui/aiAssistantWebviewProvider';
import { runModeGenerationIntegrationTests } from './services/modeGenerationIntegrationTest';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Assistant Deployer extension is now active!');

    const projectDetector = new ProjectDetector();
    const fileDeployer = new FileDeployer(context);
    const configManager = new ConfigurationManager();
    const backupManager = new BackupManager();

    // Register WebView Provider for the sidebar panel
    const webviewProvider = new AIAssistantWebviewProvider(
        vscode.Uri.file(context.extensionPath),
        context
    );
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            AIAssistantWebviewProvider.viewType,
            webviewProvider
        )
    );

    // Deploy AI Assistant to Workspace
    const deployCommand = vscode.commands.registerCommand('aiAssistantDeployer.deployToWorkspace', async (uri?: vscode.Uri) => {
        try {
            const workspaceFolder = getWorkspaceFolder(uri);
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found. Please open a workspace first.');
                return;
            }

            // Show deployment options
            const deploymentOptions = await showDeploymentOptions();
            if (!deploymentOptions) {
                return; // User cancelled
            }

            // Create backup if enabled
            if (deploymentOptions.createBackup) {
                await backupManager.createBackup(workspaceFolder.uri.fsPath);
                vscode.window.showInformationMessage('Backup created successfully.');
            }

            // Detect project type
            const projectType = await projectDetector.detectProjectType(workspaceFolder.uri.fsPath);
            vscode.window.showInformationMessage(`Detected project type: ${projectType}`);

            // Deploy files based on project type and options
            await fileDeployer.deployToWorkspace(workspaceFolder.uri.fsPath, projectType, deploymentOptions);

            vscode.window.showInformationMessage('AI Assistant deployed successfully! 🚀');

            // Offer to reload workspace
            const reload = await vscode.window.showInformationMessage(
                'Reload workspace to activate AI Assistant features?',
                'Reload',
                'Later'
            );
            
            if (reload === 'Reload') {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Deployment failed: ${error}`);
            console.error('Deployment error:', error);
        }
    });

    // Detect Project Type
    const detectCommand = vscode.commands.registerCommand('aiAssistantDeployer.detectProjectType', async (uri?: vscode.Uri) => {
        try {
            const workspaceFolder = getWorkspaceFolder(uri);
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found.');
                return;
            }

            const projectType = await projectDetector.detectProjectType(workspaceFolder.uri.fsPath);
            const details = await projectDetector.getProjectDetails(workspaceFolder.uri.fsPath);

            vscode.window.showInformationMessage(
                `Project Type: ${projectType}\\nFramework: ${details.framework}\\nLanguage: ${details.language}`,
                { modal: true }
            );

        } catch (error) {
            vscode.window.showErrorMessage(`Detection failed: ${error}`);
        }
    });

    // Setup Configuration
    const setupConfigCommand = vscode.commands.registerCommand('aiAssistantDeployer.setupConfiguration', async (uri?: vscode.Uri) => {
        try {
            const workspaceFolder = getWorkspaceFolder(uri);
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found.');
                return;
            }

            await configManager.setupConfiguration(workspaceFolder.uri.fsPath);
            vscode.window.showInformationMessage('AI Assistant configuration setup completed!');

        } catch (error) {
            vscode.window.showErrorMessage(`Configuration setup failed: ${error}`);
        }
    });

    // Remove AI Assistant
    const removeCommand = vscode.commands.registerCommand('aiAssistantDeployer.removeAIAssistant', async (uri?: vscode.Uri) => {
        try {
            const workspaceFolder = getWorkspaceFolder(uri);
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found.');
                return;
            }

            const confirm = await vscode.window.showWarningMessage(
                'Are you sure you want to remove AI Assistant from this workspace?',
                { modal: true },
                'Remove',
                'Cancel'
            );

            if (confirm === 'Remove') {
                await fileDeployer.removeFromWorkspace(workspaceFolder.uri.fsPath);
                vscode.window.showInformationMessage('AI Assistant removed successfully.');
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Removal failed: ${error}`);
        }
    });

    // Test Mode Generation Pipeline Integration
    const testModeGenerationCommand = vscode.commands.registerCommand('aiAssistantDeployer.testModeGeneration', async () => {
        try {
            vscode.window.showInformationMessage('Running Mode Generation Pipeline Integration Tests...');
            await runModeGenerationIntegrationTests(context.extensionPath);
        } catch (error) {
            vscode.window.showErrorMessage(`Integration test failed: ${error}`);
        }
    });

    // Mode Selection Command
    const selectModeCommand = vscode.commands.registerCommand('aiAssistantDeployer.selectMode', async () => {
        try {
            await webviewProvider.openModeSelection();
        } catch (error) {
            vscode.window.showErrorMessage(`Mode selection failed: ${error}`);
        }
    });

    // Custom Mode Builder Command
    const customModeBuilderCommand = vscode.commands.registerCommand('aiAssistantDeployer.customModeBuilder', async () => {
        try {
            await webviewProvider.openCustomModeBuilder();
        } catch (error) {
            vscode.window.showErrorMessage(`Custom mode builder failed: ${error}`);
        }
    });

    // Quick Actions Command
    const showQuickActionsCommand = vscode.commands.registerCommand('aiAssistantDeployer.showQuickActions', async () => {
        try {
            // Trigger refresh of the webview state
            await webviewProvider.refreshState();
            vscode.window.showInformationMessage('AI Assistant Quick Actions panel refreshed!');
        } catch (error) {
            vscode.window.showErrorMessage(`Quick actions failed: ${error}`);
        }
    });

    // Quick Deploy Command
    const quickDeployCommand = vscode.commands.registerCommand('aiAssistantDeployer.quickDeploy', async () => {
        try {
            await webviewProvider.deployFromOutFolder();
        } catch (error) {
            vscode.window.showErrorMessage(`Quick deploy failed: ${error}`);
        }
    });

    // Test Command
    const testCommand = vscode.commands.registerCommand('aiAssistantDeployer.test', async () => {
        try {
            vscode.window.showInformationMessage('AI Assistant test command executed!');
        } catch (error) {
            vscode.window.showErrorMessage(`Test command failed: ${error}`);
        }
    });

    // Reset Command
    const resetCommand = vscode.commands.registerCommand('aiAssistantDeployer.reset', async () => {
        try {
            await webviewProvider.resetDeployedFiles();
        } catch (error) {
            vscode.window.showErrorMessage(`Reset failed: ${error}`);
        }
    });

    context.subscriptions.push(
        deployCommand, 
        detectCommand, 
        setupConfigCommand, 
        removeCommand, 
        testModeGenerationCommand, 
        selectModeCommand, 
        customModeBuilderCommand,
        showQuickActionsCommand,
        quickDeployCommand,
        testCommand,
        resetCommand
    );
}

function getWorkspaceFolder(uri?: vscode.Uri): vscode.WorkspaceFolder | undefined {
    if (uri) {
        return vscode.workspace.getWorkspaceFolder(uri);
    }
    
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        return vscode.workspace.workspaceFolders[0];
    }
    
    return undefined;
}

async function showDeploymentOptions(): Promise<DeploymentOptions | undefined> {
    const config = vscode.workspace.getConfiguration('aiAssistantDeployer');
    
    const items: vscode.QuickPickItem[] = [
        {
            label: '🚀 Full Deployment',
            description: 'Deploy all AI Assistant components',
            detail: 'Includes task management, MCP server, debug tools, and configuration'
        },
        {
            label: '⚡ Quick Setup',
            description: 'Deploy minimal AI Assistant setup',
            detail: 'Basic configuration and essential files only'
        },
        {
            label: '🛠️ Custom Deployment',
            description: 'Choose specific components to deploy',
            detail: 'Select individual components manually'
        }
    ];

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select deployment type',
        ignoreFocusOut: true
    });

    if (!selected) {
        return undefined;
    }

    let options: DeploymentOptions = {
        includeTaskManagement: config.get('includeTaskManagement', true),
        includeMCPServer: config.get('includeMCPServer', true),
        includeDebugTools: true,
        includeDocumentation: true,
        createBackup: config.get('backupExistingFiles', true),
        deploymentType: 'full'
    };

    switch (selected.label) {
        case '🚀 Full Deployment':
            options.deploymentType = 'full';
            break;
        case '⚡ Quick Setup':
            options.deploymentType = 'minimal';
            options.includeTaskManagement = false;
            options.includeMCPServer = false;
            options.includeDocumentation = false;
            break;
        case '🛠️ Custom Deployment':
            options = await showCustomDeploymentOptions(options);
            break;
    }

    return options;
}

async function showCustomDeploymentOptions(defaultOptions: DeploymentOptions): Promise<DeploymentOptions> {
    const items = [
        {
            label: 'Task Management System',
            description: 'Enhanced task tracking and workflow management',
            picked: defaultOptions.includeTaskManagement
        },
        {
            label: 'MCP Server',
            description: 'Model Context Protocol server for AI communication',
            picked: defaultOptions.includeMCPServer
        },
        {
            label: 'Debug Tools',
            description: 'Flutter and general debugging utilities',
            picked: defaultOptions.includeDebugTools
        },
        {
            label: 'Documentation',
            description: 'Integration guides and usage documentation',
            picked: defaultOptions.includeDocumentation
        },
        {
            label: 'Create Backup',
            description: 'Backup existing files before deployment',
            picked: defaultOptions.createBackup
        }
    ];

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select components to deploy',
        canPickMany: true,
        ignoreFocusOut: true
    });

    if (!selected) {
        return defaultOptions;
    }

    const selectedLabels = selected.map((item: vscode.QuickPickItem) => item.label);

    return {
        includeTaskManagement: selectedLabels.includes('Task Management System'),
        includeMCPServer: selectedLabels.includes('MCP Server'),
        includeDebugTools: selectedLabels.includes('Debug Tools'),
        includeDocumentation: selectedLabels.includes('Documentation'),
        createBackup: selectedLabels.includes('Create Backup'),
        deploymentType: 'custom'
    };
}

interface DeploymentOptions {
    includeTaskManagement: boolean;
    includeMCPServer: boolean;
    includeDebugTools: boolean;
    includeDocumentation: boolean;
    createBackup: boolean;
    deploymentType: 'full' | 'minimal' | 'custom';
}

export function deactivate() {
    console.log('AI Assistant Deployer extension deactivated');
}
