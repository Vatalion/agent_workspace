import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
// import { StateMonitor } from '../services/stateMonitor';
import { FileDeployer } from '../services/fileDeployer';

interface WorkspaceState {
    isDeployed: boolean;
    currentMode: string;
    projectType: string;
    hasSystemConfig: boolean;
    hasModeManager: boolean;
    lastUpdated: Date;
}

// Temporary StateMonitor class with improved state detection
class StateMonitor {
    private _onStateChanged = new vscode.EventEmitter<WorkspaceState>();
    public readonly onStateChanged = this._onStateChanged.event;
    
    startMonitoring() {}
    stopMonitoring() {}
    
    async getWorkspaceState(workspacePath?: string): Promise<WorkspaceState | null> {
        if (!workspacePath) {
            const workspaceFolder = this.getCurrentWorkspaceFolder();
            if (!workspaceFolder) {
                return null;
            }
            workspacePath = workspaceFolder.uri.fsPath;
        }

        // Check for AI Assistant deployment
        const githubPath = path.join(workspacePath, '.github');
        const systemConfigPath = path.join(githubPath, 'system-config.json');
        const modeManagerPath = path.join(githubPath, 'mode-manager.sh');
        const copilotInstructionsPath = path.join(githubPath, 'copilot-instructions.md');

        const hasSystemConfig = await fs.pathExists(systemConfigPath);
        const hasModeManager = await fs.pathExists(modeManagerPath);
        const hasCopilotInstructions = await fs.pathExists(copilotInstructionsPath);
        
        const isDeployed = hasSystemConfig && hasModeManager && hasCopilotInstructions;

        // Get current mode
        let currentMode = 'none';
        if (hasSystemConfig) {
            try {
                const config = await fs.readJson(systemConfigPath);
                currentMode = config.current_mode || 'none';
            } catch (error) {
                console.error('Error reading system config:', error);
            }
        }

        // Detect project type
        const projectType = await this.detectProjectType(workspacePath);

        return {
            isDeployed,
            currentMode,
            projectType,
            hasSystemConfig,
            hasModeManager,
            lastUpdated: new Date()
        };
    }

    private async detectProjectType(workspacePath: string): Promise<string> {
        // Check for Flutter
        if (await fs.pathExists(path.join(workspacePath, 'pubspec.yaml'))) {
            return 'Flutter';
        }
        
        // Check for React/Node.js
        if (await fs.pathExists(path.join(workspacePath, 'package.json'))) {
            try {
                const packageJson = await fs.readJson(path.join(workspacePath, 'package.json'));
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
                
                if (dependencies.react) return 'React';
                if (dependencies['@angular/core']) return 'Angular';
                if (dependencies.vue) return 'Vue';
                if (packageJson.engines && packageJson.engines.vscode) return 'VS Code Extension';
                if (dependencies.express || dependencies.fastify) return 'Node.js API';
                
                return 'Node.js';
            } catch {
                return 'Node.js';
            }
        }
        
        // Check for Python
        if (await fs.pathExists(path.join(workspacePath, 'requirements.txt')) ||
            await fs.pathExists(path.join(workspacePath, 'pyproject.toml')) ||
            await fs.pathExists(path.join(workspacePath, 'setup.py'))) {
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
    
    dispose() {
        this._onStateChanged.dispose();
    }
}

export class AIAssistantWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'aiAssistantDeployer.panel';
    private _view?: vscode.WebviewView;
    private stateMonitor: StateMonitor;
    private fileDeployer: FileDeployer;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly context: vscode.ExtensionContext
    ) {
        this.stateMonitor = new StateMonitor();
        this.fileDeployer = new FileDeployer(context);
        
        // Monitor state changes and update UI
        this.stateMonitor.onStateChanged(() => {
            this.updateUI();
        });
        
        // Start monitoring
        this.stateMonitor.startMonitoring();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        this.updateUI();

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(
            (message: any) => {
                this.handleWebviewMessage(message);
            },
            undefined,
            this.context.subscriptions
        );
    }

    private async handleWebviewMessage(message: any) {
        const workspaceFolder = this.getCurrentWorkspaceFolder();
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

        switch (message.type) {
            case 'deploy':
                await this.deployAIAssistant(workspaceFolder.uri.fsPath, message.mode);
                break;
            case 'remove':
                await this.removeAIAssistant(workspaceFolder.uri.fsPath);
                break;
            case 'switchMode':
                await this.switchMode(workspaceFolder.uri.fsPath, message.mode);
                break;
            case 'reset':
                await this.resetDeployedFiles();
                break;
            case 'refresh':
                this.updateUI();
                break;
        }
    }

    private async deployAIAssistant(workspacePath: string, mode: string) {
        try {
            // Show progress
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Deploying AI Assistant (${mode} mode)...`,
                cancellable: false
            }, async (progress: any) => {
                progress.report({ increment: 20, message: 'Preparing deployment...' });
                
                // Deploy from out folder
                const outPath = path.join(this.context.extensionPath, 'out', '.github');
                progress.report({ increment: 40, message: 'Copying files...' });
                
                await this.fileDeployer.deployFromOutFolder(workspacePath, outPath, mode);
                progress.report({ increment: 80, message: 'Configuring mode...' });
                
                // Set the mode
                await this.setWorkspaceMode(workspacePath, mode);
                progress.report({ increment: 100, message: 'Complete!' });
            });

            vscode.window.showInformationMessage(`AI Assistant deployed successfully in ${mode} mode! 🚀`);
            this.updateUI();
        } catch (error) {
            vscode.window.showErrorMessage(`Deployment failed: ${error}`);
        }
    }

    private async removeAIAssistant(workspacePath: string) {
        try {
            const confirm = await vscode.window.showWarningMessage(
                'Remove AI Assistant from workspace?',
                { modal: true },
                'Remove',
                'Cancel'
            );

            if (confirm === 'Remove') {
                await this.fileDeployer.removeFromWorkspace(workspacePath);
                vscode.window.showInformationMessage('AI Assistant removed successfully.');
                this.updateUI();
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Removal failed: ${error}`);
        }
    }

    private async switchMode(workspacePath: string, newMode: string) {
        try {
            // Run mode manager script
            const modeManagerPath = path.join(workspacePath, '.github', 'mode-manager.sh');
            if (await fs.pathExists(modeManagerPath)) {
                await vscode.commands.executeCommand('workbench.action.terminal.new');
                const terminal = vscode.window.activeTerminal;
                if (terminal) {
                    terminal.sendText(`cd "${workspacePath}" && ./.github/mode-manager.sh ${newMode}`);
                }
            }
            this.updateUI();
        } catch (error) {
            vscode.window.showErrorMessage(`Mode switch failed: ${error}`);
        }
    }

    private async setWorkspaceMode(workspacePath: string, mode: string) {
        const configPath = path.join(workspacePath, '.github', 'system-config.json');
        if (await fs.pathExists(configPath)) {
            const config = await fs.readJson(configPath);
            config.current_mode = mode;
            config.first_time_setup = false;
            await fs.writeJson(configPath, config, { spaces: 2 });
        }
    }

    private getCurrentWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            return vscode.workspace.workspaceFolders[0];
        }
        return undefined;
    }

    private async updateUI() {
        if (!this._view) {
            return;
        }

        const workspaceFolder = this.getCurrentWorkspaceFolder();
        const state = workspaceFolder ? 
            await this.stateMonitor.getWorkspaceState(workspaceFolder.uri.fsPath) : 
            null;

        this._view.webview.html = this.getHtmlForWebview(state);
    }

    private getHtmlForWebview(state: any): string {
        const isDeployed = state?.isDeployed || false;
        const currentMode = state?.currentMode || 'none';
        const projectType = state?.projectType || 'unknown';
        
        const statusIcon = isDeployed ? '✅' : '❌';
        const statusText = isDeployed ? 'Deployed' : 'Not Deployed';
        const statusColor = isDeployed ? '#4CAF50' : '#F44336';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Assistant Deployer</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 16px;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
        }
        .status-card {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .status-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }
        .status-icon {
            font-size: 18px;
        }
        .status-text {
            font-weight: bold;
            color: ${statusColor};
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-size: 13px;
        }
        .button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            margin: 4px;
            cursor: pointer;
            font-size: 13px;
            width: calc(50% - 8px);
        }
        .button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .button-row {
            display: flex;
            gap: 8px;
            margin: 8px 0;
        }
        .mode-selector {
            margin: 12px 0;
        }
        .mode-button {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 4px;
            padding: 6px 12px;
            margin: 2px;
            cursor: pointer;
            font-size: 12px;
            width: calc(50% - 4px);
        }
        .mode-button.active {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        .refresh-button {
            float: right;
            background: transparent;
            border: 1px solid var(--vscode-widget-border);
            color: var(--vscode-foreground);
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="status-card">
        <div class="status-header">
            <span class="status-icon">${statusIcon}</span>
            <span class="status-text">${statusText}</span>
            <button class="refresh-button" onclick="refresh()">🔄</button>
        </div>
        <div class="info-row">
            <span>Mode:</span>
            <span><strong>${currentMode}</strong></span>
        </div>
        <div class="info-row">
            <span>Project:</span>
            <span><strong>${projectType}</strong></span>
        </div>
    </div>

    ${!isDeployed ? `
    <div class="mode-selector">
        <h4>Select Mode to Deploy:</h4>
        <div class="button-row">
            <button class="mode-button" onclick="deploy('simplified')">
                🟢 Simplified
            </button>
            <button class="mode-button" onclick="deploy('enterprise')">
                🟠 Enterprise
            </button>
        </div>
    </div>
    ` : `
    <div class="button-row">
        <button class="button" onclick="switchMode('simplified')" ${currentMode === 'simplified' ? 'disabled' : ''}>
            Switch to Simplified
        </button>
        <button class="button" onclick="switchMode('enterprise')" ${currentMode === 'enterprise' ? 'disabled' : ''}>
            Switch to Enterprise
        </button>
    </div>
    <div class="button-row">
        <button class="button" onclick="reset()" style="background: var(--vscode-inputValidation-warningBackground); width: calc(50% - 4px);">
            🔄 Reset Files
        </button>
        <button class="button" onclick="remove()" style="background: var(--vscode-inputValidation-errorBackground); width: calc(50% - 4px);">
            🗑️ Remove AI Assistant
        </button>
    </div>
    `}

    <script>
        const vscode = acquireVsCodeApi();

        function deploy(mode) {
            vscode.postMessage({ type: 'deploy', mode: mode });
        }

        function remove() {
            vscode.postMessage({ type: 'remove' });
        }

        function reset() {
            vscode.postMessage({ type: 'reset' });
        }

        function switchMode(mode) {
            vscode.postMessage({ type: 'switchMode', mode: mode });
        }

        function refresh() {
            vscode.postMessage({ type: 'refresh' });
        }

        // Auto-refresh every 5 seconds
        setInterval(refresh, 5000);
    </script>
</body>
</html>`;
    }

    // Public method to deploy from out folder
    public async deployFromOutFolder(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const workspacePath = workspaceFolder.uri.fsPath;
        const outPath = path.join(this.context.extensionPath, 'out', '.github');
        
        // Deploy in simplified mode by default
        await this.fileDeployer.deployFromOutFolder(workspacePath, outPath, 'simplified');
        
        // Refresh the UI
        this.updateUI();
    }

    // Public method to reset deployed files
    public async resetDeployedFiles(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const workspacePath = workspaceFolder.uri.fsPath;
        const githubPath = path.join(workspacePath, '.github');

        // Check if .github folder exists
        if (!await fs.pathExists(githubPath)) {
            throw new Error('No AI Assistant files found to reset');
        }

        // Create backup before reset
        const backupPath = path.join(githubPath, 'backups', `reset_backup_${new Date().toISOString().replace(/[:.]/g, '-')}`);
        await fs.ensureDir(backupPath);
        
        // Copy current .github contents to backup (excluding backups folder)
        const items = await fs.readdir(githubPath);
        for (const item of items) {
            if (item !== 'backups') {
                const sourcePath = path.join(githubPath, item);
                const backupItemPath = path.join(backupPath, item);
                await fs.copy(sourcePath, backupItemPath);
            }
        }

        // Remove all AI Assistant files except backups
        for (const item of items) {
            if (item !== 'backups') {
                const itemPath = path.join(githubPath, item);
                await fs.remove(itemPath);
            }
        }

        // Refresh the UI
        this.updateUI();
        
        vscode.window.showInformationMessage(`🔄 AI Assistant files reset successfully! Backup created in .github/backups/`);
    }
}
