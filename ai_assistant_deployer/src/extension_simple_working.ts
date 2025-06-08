import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 AI Assistant Deployer is now active!');

    // Create a simple status bar item that always shows
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left, 
        100
    );
    
    statusBarItem.text = "$(rocket) AI Assistant";
    statusBarItem.tooltip = "AI Assistant Deployer - Click to deploy";
    statusBarItem.command = 'aiAssistantDeployer.quickDeploy';
    statusBarItem.show();

    // Quick deploy command
    const quickDeployCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.quickDeploy', 
        async () => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('⚠️ No workspace folder found. Please open a project first.');
                return;
            }

            try {
                // Show deployment options
                const items = [
                    {
                        label: '$(cloud-download) Deploy Simplified Mode',
                        description: 'Basic task management for small projects'
                    },
                    {
                        label: '$(server) Deploy Enterprise Mode', 
                        description: 'Full task management for large projects'
                    },
                    {
                        label: '$(info) Show Status',
                        description: 'Check current deployment status'
                    }
                ];

                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Select AI Assistant action',
                    ignoreFocusOut: true
                });

                if (!selected) return;

                if (selected.label.includes('Deploy Simplified')) {
                    await deployMode(context, workspaceFolder.uri.fsPath, 'simplified');
                } else if (selected.label.includes('Deploy Enterprise')) {
                    await deployMode(context, workspaceFolder.uri.fsPath, 'enterprise');
                } else if (selected.label.includes('Show Status')) {
                    await showStatus(context, workspaceFolder.uri.fsPath);
                }

            } catch (error) {
                vscode.window.showErrorMessage(`❌ Error: ${error}`);
            }
        }
    );

    // Show quick actions command
    const showQuickActionsCommand = vscode.commands.registerCommand(
        'aiAssistantDeployer.showQuickActions',
        () => vscode.commands.executeCommand('aiAssistantDeployer.quickDeploy')
    );

    context.subscriptions.push(
        statusBarItem,
        quickDeployCommand,
        showQuickActionsCommand
    );

    console.log('✅ AI Assistant Deployer activated successfully!');
}

async function deployMode(context: vscode.ExtensionContext, workspacePath: string, mode: string) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Deploying AI Assistant (${mode} mode)...`,
        cancellable: false
    }, async (progress) => {
        progress.report({ increment: 25, message: 'Preparing deployment...' });
        
        const fs = require('fs-extra');
        const path = require('path');
        
        // Deploy from out folder
        const outPath = path.join(context.extensionPath, 'out', '.github');
        const workspaceGithubPath = path.join(workspacePath, '.github');
        
        progress.report({ increment: 50, message: 'Copying files...' });
        
        try {
            // Ensure target directory exists
            await fs.ensureDir(workspaceGithubPath);
            
            // Copy files from out/.github to workspace/.github
            if (await fs.pathExists(outPath)) {
                await fs.copy(outPath, workspaceGithubPath, { 
                    overwrite: true,
                    filter: (src: string) => !src.includes('.history')
                });
                
                // Make shell scripts executable
                const scripts = ['mode-manager.sh', 'task-system.sh', 'security-check.sh', 'project-update.sh'];
                for (const script of scripts) {
                    const scriptPath = path.join(workspaceGithubPath, script);
                    if (await fs.pathExists(scriptPath)) {
                        await fs.chmod(scriptPath, 0o755);
                    }
                }
            }
            
            progress.report({ increment: 75, message: 'Setting mode...' });
            
            // Set the mode
            const systemConfigPath = path.join(workspaceGithubPath, 'system-config.json');
            if (await fs.pathExists(systemConfigPath)) {
                const config = await fs.readJson(systemConfigPath);
                config.current_mode = mode;
                config.first_time_setup = false;
                await fs.writeJson(systemConfigPath, config, { spaces: 2 });
            }
            
            progress.report({ increment: 100, message: 'Complete!' });
            
        } catch (error) {
            throw new Error(`Deployment failed: ${error}`);
        }
    });

    vscode.window.showInformationMessage(`✅ AI Assistant deployed successfully in ${mode} mode! 🚀`);
}

async function showStatus(context: vscode.ExtensionContext, workspacePath: string) {
    const fs = require('fs-extra');
    const path = require('path');
    
    const githubPath = path.join(workspacePath, '.github');
    const systemConfigPath = path.join(githubPath, 'system-config.json');
    
    let mode = 'Not deployed';
    let filesCount = 0;
    
    if (await fs.pathExists(githubPath)) {
        const files = await fs.readdir(githubPath);
        filesCount = files.length;
        
        if (await fs.pathExists(systemConfigPath)) {
            try {
                const config = await fs.readJson(systemConfigPath);
                mode = config.current_mode || 'Unknown';
            } catch (error) {
                mode = 'Configuration error';
            }
        }
    }
    
    const outPath = path.join(context.extensionPath, 'out', '.github');
    const outExists = await fs.pathExists(outPath);
    
    const message = `📋 AI Assistant Status
    
Mode: ${mode}
Files in workspace: ${filesCount}
Deployment files available: ${outExists ? '✅' : '❌'}
Workspace: ${path.basename(workspacePath)}`;

    vscode.window.showInformationMessage(message, { modal: true });
}

export function deactivate() {
    console.log('🔄 AI Assistant Deployer deactivated');
}
