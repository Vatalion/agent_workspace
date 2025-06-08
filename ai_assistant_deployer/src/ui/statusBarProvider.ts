import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

export class StatusBarProvider {
    private statusBarItem: vscode.StatusBarItem;
    private disposables: vscode.Disposable[] = [];

    constructor(private context: vscode.ExtensionContext) {
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            100
        );
        
        this.statusBarItem.command = 'aiAssistantDeployer.showQuickActions';
        this.context.subscriptions.push(this.statusBarItem);
        
        // Start monitoring
        this.startMonitoring();
        this.updateStatusBar();
    }

    private startMonitoring(): void {
        // Monitor workspace changes
        const watcher = vscode.workspace.createFileSystemWatcher('**/.github/system-config.json');
        
        watcher.onDidChange(() => this.updateStatusBar());
        watcher.onDidCreate(() => this.updateStatusBar());
        watcher.onDidDelete(() => this.updateStatusBar());
        
        this.disposables.push(watcher);
        
        // Update every 3 seconds
        const interval = setInterval(() => {
            this.updateStatusBar();
        }, 3000);
        
        this.disposables.push({
            dispose: () => clearInterval(interval)
        });
    }

    private async updateStatusBar(): Promise<void> {
        const workspaceFolder = this.getCurrentWorkspaceFolder();
        if (!workspaceFolder) {
            this.statusBarItem.hide();
            return;
        }

        const state = await this.getWorkspaceState(workspaceFolder.uri.fsPath);
        
        if (state.isDeployed) {
            this.statusBarItem.text = `$(check) AI Assistant: ${state.currentMode}`;
            this.statusBarItem.tooltip = `AI Assistant is deployed in ${state.currentMode} mode. Click for options.`;
            this.statusBarItem.backgroundColor = undefined;
        } else {
            this.statusBarItem.text = `$(warning) AI Assistant: Not Deployed`;
            this.statusBarItem.tooltip = 'AI Assistant is not deployed. Click to deploy.';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
        
        this.statusBarItem.show();
    }

    public async showQuickActions(): Promise<void> {
        const workspaceFolder = this.getCurrentWorkspaceFolder();
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

        const state = await this.getWorkspaceState(workspaceFolder.uri.fsPath);
        
        const items: vscode.QuickPickItem[] = [];
        
        if (!state.isDeployed) {
            items.push({
                label: '$(cloud-download) Deploy Simplified Mode',
                description: 'Basic task management for small projects',
                detail: 'Quick deployment with essential features'
            });
            items.push({
                label: '$(server) Deploy Enterprise Mode', 
                description: 'Full task management for large projects',
                detail: 'Advanced features with cross-machine sync'
            });
        } else {
            items.push({
                label: `$(info) Current Mode: ${state.currentMode}`,
                description: `Project: ${state.projectType}`,
                detail: 'AI Assistant is active'
            });
            
            if (state.currentMode !== 'simplified') {
                items.push({
                    label: '$(arrow-swap) Switch to Simplified Mode',
                    description: 'Change to basic task management',
                    detail: 'For smaller projects'
                });
            }
            
            if (state.currentMode !== 'enterprise') {
                items.push({
                    label: '$(arrow-swap) Switch to Enterprise Mode',
                    description: 'Change to advanced task management', 
                    detail: 'For larger projects'
                });
            }
            
            items.push({
                label: '$(trash) Remove AI Assistant',
                description: 'Remove from workspace',
                detail: 'Clean removal of all components'
            });
        }
        
        items.push({
            label: '$(refresh) Refresh Status',
            description: 'Update deployment status',
            detail: 'Check current state'
        });

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select an action for AI Assistant',
            ignoreFocusOut: true
        });

        if (!selected) return;

        await this.handleAction(selected.label, workspaceFolder.uri.fsPath, state);
    }

    private async handleAction(action: string, workspacePath: string, state: any): Promise<void> {
        try {
            if (action.includes('Deploy Simplified Mode')) {
                await this.deployMode(workspacePath, 'simplified');
            } else if (action.includes('Deploy Enterprise Mode')) {
                await this.deployMode(workspacePath, 'enterprise');
            } else if (action.includes('Switch to Simplified Mode')) {
                await this.switchMode(workspacePath, 'simplified');
            } else if (action.includes('Switch to Enterprise Mode')) {
                await this.switchMode(workspacePath, 'enterprise');
            } else if (action.includes('Remove AI Assistant')) {
                await this.removeAIAssistant(workspacePath);
            } else if (action.includes('Refresh Status')) {
                this.updateStatusBar();
                vscode.window.showInformationMessage('Status refreshed!');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Action failed: ${error}`);
        }
    }

    private async deployMode(workspacePath: string, mode: string): Promise<void> {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Deploying AI Assistant (${mode} mode)...`,
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 20, message: 'Preparing deployment...' });
            
            // Deploy from out folder
            const outPath = path.join(this.context.extensionPath, 'out', '.github');
            const workspaceGithubPath = path.join(workspacePath, '.github');
            
            progress.report({ increment: 40, message: 'Copying files...' });
            
            // Ensure target directory exists
            await fs.ensureDir(workspaceGithubPath);
            
            // Copy files from out/.github to workspace/.github
            if (await fs.pathExists(outPath)) {
                await fs.copy(outPath, workspaceGithubPath, { 
                    overwrite: true,
                    filter: (src: string, dest: string) => {
                        return !src.includes('.history');
                    }
                });
            }
            
            progress.report({ increment: 70, message: 'Setting mode...' });
            
            // Set the mode
            const systemConfigPath = path.join(workspaceGithubPath, 'system-config.json');
            if (await fs.pathExists(systemConfigPath)) {
                const config = await fs.readJson(systemConfigPath);
                config.current_mode = mode;
                config.first_time_setup = false;
                await fs.writeJson(systemConfigPath, config, { spaces: 2 });
            }
            
            progress.report({ increment: 100, message: 'Complete!' });
        });

        vscode.window.showInformationMessage(`AI Assistant deployed successfully in ${mode} mode! 🚀`);
        this.updateStatusBar();
    }

    private async switchMode(workspacePath: string, newMode: string): Promise<void> {
        const modeManagerPath = path.join(workspacePath, '.github', 'mode-manager.sh');
        
        if (await fs.pathExists(modeManagerPath)) {
            // Make executable
            await fs.chmod(modeManagerPath, 0o755);
            
            // Run in terminal
            const terminal = vscode.window.createTerminal('AI Assistant Mode Switch');
            terminal.sendText(`cd "${workspacePath}" && ./.github/mode-manager.sh ${newMode}`);
            terminal.show();
            
            // Update status after a short delay
            setTimeout(() => {
                this.updateStatusBar();
            }, 2000);
        } else {
            throw new Error('Mode manager script not found. Please redeploy AI Assistant.');
        }
    }

    private async removeAIAssistant(workspacePath: string): Promise<void> {
        const confirm = await vscode.window.showWarningMessage(
            'Remove AI Assistant from workspace?',
            { modal: true },
            'Remove',
            'Cancel'
        );

        if (confirm === 'Remove') {
            const githubPath = path.join(workspacePath, '.github');
            if (await fs.pathExists(githubPath)) {
                await fs.remove(githubPath);
            }
            
            vscode.window.showInformationMessage('AI Assistant removed successfully.');
            this.updateStatusBar();
        }
    }

    private async getWorkspaceState(workspacePath: string): Promise<any> {
        const githubPath = path.join(workspacePath, '.github');
        const systemConfigPath = path.join(githubPath, 'system-config.json');
        const modeManagerPath = path.join(githubPath, 'mode-manager.sh');
        
        const hasSystemConfig = await fs.pathExists(systemConfigPath);
        const hasModeManager = await fs.pathExists(modeManagerPath);
        
        const isDeployed = hasSystemConfig && hasModeManager;
        
        let currentMode = 'none';
        if (hasSystemConfig) {
            try {
                const config = await fs.readJson(systemConfigPath);
                currentMode = config.current_mode || 'none';
            } catch (error) {
                console.error('Error reading system config:', error);
            }
        }

        const projectType = await this.detectProjectType(workspacePath);

        return {
            isDeployed,
            currentMode,
            projectType,
            hasSystemConfig,
            hasModeManager
        };
    }

    private async detectProjectType(workspacePath: string): Promise<string> {
        if (await fs.pathExists(path.join(workspacePath, 'pubspec.yaml'))) {
            return 'Flutter';
        }
        
        if (await fs.pathExists(path.join(workspacePath, 'package.json'))) {
            try {
                const packageJson = await fs.readJson(path.join(workspacePath, 'package.json'));
                
                if (packageJson.engines && packageJson.engines.vscode) {
                    return 'VS Code Extension';
                }
                
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
                
                if (dependencies.react) return 'React';
                if (dependencies['@angular/core']) return 'Angular';
                if (dependencies.vue) return 'Vue';
                
                return 'Node.js';
            } catch {
                return 'Node.js';
            }
        }
        
        if (await fs.pathExists(path.join(workspacePath, 'requirements.txt'))) {
            return 'Python';
        }

        return 'Unknown';
    }

    private getCurrentWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            return vscode.workspace.workspaceFolders[0];
        }
        return undefined;
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.statusBarItem.dispose();
    }
}
