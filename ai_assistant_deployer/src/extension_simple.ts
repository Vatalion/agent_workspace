import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Assistant Deployer (Simple) is now active!');

    // Status Bar Items
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    const modeStatusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    
    // Initialize status bar
    updateStatusBar();
    updateModeStatus();
    
    statusBarItem.show();
    modeStatusItem.show();

    // Quick Deploy Command
    const quickDeployCommand = vscode.commands.registerCommand('aiAssistantDeployer.quickDeploy', async () => {
        try {
            statusBarItem.text = "$(sync~spin) Deploying...";
            
            const result = await deployFromOutFolder();
            
            if (result.success) {
                statusBarItem.text = "$(check) Deployed";
                vscode.window.showInformationMessage(`✅ Deployed ${result.filesDeployed} files successfully!`);
                setTimeout(() => updateStatusBar(), 3000);
            } else {
                statusBarItem.text = "$(error) Failed";
                vscode.window.showErrorMessage(`❌ Deployment failed: ${result.error}`);
                setTimeout(() => updateStatusBar(), 3000);
            }
        } catch (error) {
            statusBarItem.text = "$(error) Failed";
            vscode.window.showErrorMessage(`❌ Error: ${error}`);
            setTimeout(() => updateStatusBar(), 3000);
        }
    });

    // Toggle Mode Command
    const toggleModeCommand = vscode.commands.registerCommand('aiAssistantDeployer.toggleMode', async () => {
        try {
            const currentMode = await getCurrentMode();
            const newMode = currentMode === 'simplified' ? 'enterprise' : 'simplified';
            
            modeStatusItem.text = "$(sync~spin) Switching...";
            
            const result = await switchMode(newMode);
            
            if (result.success) {
                updateModeStatus();
                vscode.window.showInformationMessage(`✅ Switched to ${newMode} mode`);
            } else {
                vscode.window.showErrorMessage(`❌ Mode switch failed: ${result.error}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Error: ${error}`);
        }
    });

    // Show Status Command
    const showStatusCommand = vscode.commands.registerCommand('aiAssistantDeployer.showStatus', async () => {
        try {
            const status = await getDetailedStatus();
            
            const message = `
📋 AI Assistant Status
Mode: ${status.mode}
Files Available: ${status.outFolderExists ? '✅' : '❌'}
Workspace Setup: ${status.workspaceSetup ? '✅' : '❌'}
Last Deploy: ${status.lastDeploy || 'Never'}
            `.trim();

            vscode.window.showInformationMessage(message, { modal: true });
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Error getting status: ${error}`);
        }
    });

    // Register commands
    context.subscriptions.push(
        quickDeployCommand,
        toggleModeCommand,
        showStatusCommand,
        statusBarItem,
        modeStatusItem
    );

    // Auto-refresh status every 30 seconds
    const statusRefresh = setInterval(() => {
        updateStatusBar();
        updateModeStatus();
    }, 30000);

    context.subscriptions.push({
        dispose: () => clearInterval(statusRefresh)
    });

    async function updateStatusBar() {
        try {
            const status = await getDeploymentStatus();
            
            if (status.canDeploy) {
                statusBarItem.text = `$(rocket) Deploy (${status.fileCount} files)`;
                statusBarItem.command = 'aiAssistantDeployer.quickDeploy';
                statusBarItem.tooltip = 'Click to deploy AI Assistant files to workspace';
            } else {
                statusBarItem.text = "$(warning) No files to deploy";
                statusBarItem.command = 'aiAssistantDeployer.showStatus';
                statusBarItem.tooltip = 'No deployable files found in out folder';
            }
        } catch (error) {
            statusBarItem.text = "$(error) Error";
            statusBarItem.command = 'aiAssistantDeployer.showStatus';
            statusBarItem.tooltip = `Error: ${error}`;
        }
    }

    async function updateModeStatus() {
        try {
            const mode = await getCurrentMode();
            modeStatusItem.text = `$(gear) ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
            modeStatusItem.command = 'aiAssistantDeployer.toggleMode';
            modeStatusItem.tooltip = `Current mode: ${mode}. Click to toggle.`;
        } catch (error) {
            modeStatusItem.text = "$(gear) Unknown";
            modeStatusItem.command = 'aiAssistantDeployer.showStatus';
        }
    }

    async function deployFromOutFolder(): Promise<{success: boolean, filesDeployed?: number, error?: string}> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return {success: false, error: 'No workspace folder found'};
        }

        const extensionPath = context.extensionPath;
        const outGithubPath = path.join(extensionPath, 'out', '.github');
        const workspaceGithubPath = path.join(workspaceFolder.uri.fsPath, '.github');

        if (!await fs.pathExists(outGithubPath)) {
            return {success: false, error: 'No files found in out/.github folder'};
        }

        try {
            // Copy files from out/.github to workspace/.github
            await fs.copy(outGithubPath, workspaceGithubPath, { overwrite: true });

            // Make shell scripts executable
            const scriptFiles = ['mode-manager.sh', 'task-system.sh', 'security-check.sh', 'project-update.sh'];
            for (const script of scriptFiles) {
                const scriptPath = path.join(workspaceGithubPath, script);
                if (await fs.pathExists(scriptPath)) {
                    await fs.chmod(scriptPath, 0o755);
                }
            }

            // Count deployed files
            const files = await fs.readdir(outGithubPath);
            return {success: true, filesDeployed: files.length};

        } catch (error) {
            return {success: false, error: error instanceof Error ? error.message : String(error)};
        }
    }

    async function getCurrentMode(): Promise<string> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return 'unknown';

        const configPath = path.join(workspaceFolder.uri.fsPath, '.github', 'system-config.json');
        
        try {
            if (await fs.pathExists(configPath)) {
                const config = await fs.readJson(configPath);
                return config.current_mode || 'simplified';
            }
        } catch (error) {
            console.error('Error reading mode:', error);
        }
        
        return 'simplified';
    }

    async function switchMode(newMode: string): Promise<{success: boolean, error?: string}> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return {success: false, error: 'No workspace folder found'};
        }

        const modeManagerPath = path.join(workspaceFolder.uri.fsPath, '.github', 'mode-manager.sh');
        
        if (!await fs.pathExists(modeManagerPath)) {
            return {success: false, error: 'Mode manager not found. Deploy files first.'};
        }

        try {
            // Execute mode manager script
            const { spawn } = require('child_process');
            
            return new Promise((resolve) => {
                const process = spawn('bash', [modeManagerPath, newMode], {
                    cwd: workspaceFolder.uri.fsPath
                });

                process.on('close', (code: number) => {
                    if (code === 0) {
                        resolve({success: true});
                    } else {
                        resolve({success: false, error: `Mode switch failed with code ${code}`});
                    }
                });

                process.on('error', (error: Error) => {
                    resolve({success: false, error: error.message});
                });
            });

        } catch (error) {
            return {success: false, error: error instanceof Error ? error.message : String(error)};
        }
    }

    async function getDeploymentStatus() {
        const extensionPath = context.extensionPath;
        const outGithubPath = path.join(extensionPath, 'out', '.github');

        try {
            if (await fs.pathExists(outGithubPath)) {
                const files = await fs.readdir(outGithubPath);
                return {
                    canDeploy: files.length > 0,
                    fileCount: files.length
                };
            }
        } catch (error) {
            console.error('Error checking deployment status:', error);
        }

        return {canDeploy: false, fileCount: 0};
    }

    async function getDetailedStatus() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const extensionPath = context.extensionPath;
        
        const status = {
            mode: await getCurrentMode(),
            outFolderExists: await fs.pathExists(path.join(extensionPath, 'out', '.github')),
            workspaceSetup: false,
            lastDeploy: null as string | null
        };

        if (workspaceFolder) {
            const githubPath = path.join(workspaceFolder.uri.fsPath, '.github');
            status.workspaceSetup = await fs.pathExists(githubPath);

            // Try to get last deploy time
            try {
                const configPath = path.join(githubPath, 'system-config.json');
                if (await fs.pathExists(configPath)) {
                    const stat = await fs.stat(configPath);
                    status.lastDeploy = stat.mtime.toLocaleDateString();
                }
            } catch (error) {
                // Ignore error
            }
        }

        return status;
    }
}

export function deactivate() {
    console.log('AI Assistant Deployer deactivated');
}
