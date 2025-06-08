import * as vscode from 'vscode';
import * as path from 'path';
import { ModeDiscoveryService, ModeInfo } from '../services/modeDiscovery';
import { ModeDeploymentService, DeploymentResult } from '../services/modeDeployment';

interface UIState {
    isLoading: boolean;
    availableModes: ModeInfo[];
    currentMode: string | null;
    isDeployed: boolean;
    lastUpdated: Date;
    error?: string;
}

export class AIAssistantWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'aiAssistantDeployer.panel';
    private _view?: vscode.WebviewView;
    private modeDiscovery: ModeDiscoveryService;
    private modeDeployment: ModeDeploymentService;
    private fileWatcher?: vscode.Disposable;
    private currentState: UIState;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly context: vscode.ExtensionContext
    ) {
        const workspaceRoot = this.getCurrentWorkspaceRoot();
        this.modeDiscovery = new ModeDiscoveryService(workspaceRoot);
        this.modeDeployment = new ModeDeploymentService(workspaceRoot);
        
        this.currentState = {
            isLoading: true,
            availableModes: [],
            currentMode: null,
            isDeployed: false,
            lastUpdated: new Date()
        };

        // Set up file watcher for reactive updates
        this.setupFileWatcher();
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

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(
            (message: any) => {
                this.handleWebviewMessage(message);
            },
            undefined,
            this.context.subscriptions
        );

        // Initial UI update
        this.refreshState();
    }

    private async handleWebviewMessage(message: any) {
        try {
            switch (message.type) {
                case 'deployMode':
                    await this.handleDeployMode(message.modeId);
                    break;
                case 'resetDeployment':
                    await this.handleResetDeployment();
                    break;
                case 'refreshState':
                    await this.refreshState();
                    break;
            }
        } catch (error) {
            console.error('Error handling webview message:', error);
            this.currentState.error = `Error: ${error}`;
            this.updateUI();
        }
    }

    private async handleDeployMode(modeId: string) {
        const modeInfo = this.currentState.availableModes.find(m => m.id === modeId);
        if (!modeInfo) {
            vscode.window.showErrorMessage(`Mode '${modeId}' not found`);
            return;
        }

        this.currentState.isLoading = true;
        this.updateUI();

        try {
            const result = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Deploying ${modeInfo.name} mode...`,
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 20, message: 'Preparing deployment...' });
                
                const result = await this.modeDeployment.deployMode(modeInfo);
                
                progress.report({ increment: 100, message: 'Complete!' });
                return result;
            });

            if (result.success) {
                vscode.window.showInformationMessage(
                    `🚀 ${modeInfo.name} mode deployed successfully!`
                );
            } else {
                vscode.window.showErrorMessage(result.message);
            }

            await this.refreshState();
        } catch (error) {
            console.error('Deployment error:', error);
            vscode.window.showErrorMessage(`Deployment failed: ${error}`);
        } finally {
            this.currentState.isLoading = false;
            this.updateUI();
        }
    }

    private async handleResetDeployment() {
        const confirm = await vscode.window.showWarningMessage(
            'Reset will remove all deployed AI Assistant files and return to mode selection. Continue?',
            { modal: true },
            'Reset',
            'Cancel'
        );

        if (confirm !== 'Reset') {
            return;
        }

        this.currentState.isLoading = true;
        this.updateUI();

        try {
            const result = await this.modeDeployment.resetDeployment();

            if (result.success) {
                vscode.window.showInformationMessage('🔄 Deployment reset successfully!');
            } else {
                vscode.window.showErrorMessage(result.message);
            }

            await this.refreshState();
        } catch (error) {
            console.error('Reset error:', error);
            vscode.window.showErrorMessage(`Reset failed: ${error}`);
        } finally {
            this.currentState.isLoading = false;
            this.updateUI();
        }
    }

    private async refreshState() {
        try {
            this.currentState.isLoading = true;
            this.updateUI();

            // Discover available modes
            const availableModes = await this.modeDiscovery.discoverAvailableModes();
            
            // Find currently active mode
            const activeMode = availableModes.find(mode => mode.isActive);
            const currentMode = activeMode ? activeMode.id : null;
            const isDeployed = activeMode !== undefined;

            this.currentState = {
                isLoading: false,
                availableModes,
                currentMode,
                isDeployed,
                lastUpdated: new Date(),
                error: undefined
            };

            console.log('State refreshed:', this.currentState);
            this.updateUI();
        } catch (error) {
            console.error('Error refreshing state:', error);
            this.currentState.isLoading = false;
            this.currentState.error = `Failed to refresh state: ${error}`;
            this.updateUI();
        }
    }

    private updateUI() {
        if (!this._view) {
            return;
        }

        this._view.webview.html = this.generateWebviewHTML();
    }

    private generateWebviewHTML(): string {
        const { isLoading, availableModes, currentMode, isDeployed, error } = this.currentState;

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
            margin: 0;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-widget-border);
        }
        .title {
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .refresh-btn {
            background: transparent;
            border: 1px solid var(--vscode-widget-border);
            color: var(--vscode-foreground);
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 12px;
        }
        .refresh-btn:hover {
            background: var(--vscode-list-hoverBackground);
        }
        .status-card {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .status-deployed {
            background: var(--vscode-inputValidation-infoBackground);
            color: var(--vscode-inputValidation-infoForeground);
        }
        .status-not-deployed {
            background: var(--vscode-inputValidation-warningBackground);
            color: var(--vscode-inputValidation-warningForeground);
        }
        .loading {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }
        .error {
            background: var(--vscode-inputValidation-errorBackground);
            color: var(--vscode-inputValidation-errorForeground);
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 16px;
            font-size: 13px;
        }
        .modes-section {
            margin: 16px 0;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .mode-card {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 8px;
            transition: all 0.2s;
        }
        .mode-card:hover {
            background: var(--vscode-list-hoverBackground);
            border-color: var(--vscode-focusBorder);
        }
        .mode-card.active {
            border-color: var(--vscode-focusBorder);
            background: var(--vscode-list-activeSelectionBackground);
        }
        .mode-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .mode-name {
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .mode-badge {
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 3px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
        }
        .mode-description {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
        }
        .mode-features {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-bottom: 8px;
        }
        .feature-tag {
            font-size: 10px;
            padding: 2px 4px;
            background: var(--vscode-textBlockQuote-background);
            border-radius: 2px;
            color: var(--vscode-descriptionForeground);
        }
        .mode-meta {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
        }
        .deploy-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 12px;
            width: 100%;
        }
        .deploy-btn:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .deploy-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .current-mode-section {
            margin-bottom: 16px;
        }
        .reset-btn {
            background: var(--vscode-inputValidation-warningBackground);
            color: var(--vscode-inputValidation-warningForeground);
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 13px;
            width: 100%;
            margin-top: 12px;
        }
        .reset-btn:hover {
            opacity: 0.8;
        }
        .spinner {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 2px solid var(--vscode-descriptionForeground);
            border-radius: 50%;
            border-top-color: var(--vscode-focusBorder);
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">
            🚀 AI Assistant Deployer
        </div>
        <button class="refresh-btn" onclick="refreshState()" ${isLoading ? 'disabled' : ''}>
            ${isLoading ? '<span class="spinner"></span>' : '🔄'} Refresh
        </button>
    </div>

    ${error ? `<div class="error">⚠️ ${error}</div>` : ''}

    ${isLoading ? `
        <div class="loading">
            <span class="spinner"></span>
            <p>Loading modes...</p>
        </div>
    ` : ''}

    ${!isLoading ? `
        <div class="status-card">
            <div class="status-badge ${isDeployed ? 'status-deployed' : 'status-not-deployed'}">
                ${isDeployed ? '✅' : '❌'} 
                ${isDeployed ? 'Deployed' : 'Not Deployed'}
            </div>
            ${isDeployed && currentMode ? `
                <div><strong>Active Mode:</strong> ${availableModes.find(m => m.id === currentMode)?.name || currentMode}</div>
            ` : ''}
        </div>

        ${isDeployed ? `
            <div class="current-mode-section">
                <div class="section-title">🎯 Current Deployment</div>
                ${availableModes.filter(mode => mode.isActive).map(mode => `
                    <div class="mode-card active">
                        <div class="mode-header">
                            <div class="mode-name">
                                ${mode.name}
                                <span class="mode-badge">ACTIVE</span>
                            </div>
                        </div>
                        <div class="mode-description">${mode.description}</div>
                        <div class="mode-meta">
                            <span>Target: ${mode.targetProject}</span>
                            <span>Estimated: ${mode.estimatedHours}</span>
                        </div>
                    </div>
                `).join('')}
                <button class="reset-btn" onclick="resetDeployment()">
                    🔄 Reset & Choose Different Mode
                </button>
            </div>
        ` : `
            <div class="modes-section">
                <div class="section-title">📋 Available Modes</div>
                ${availableModes.length === 0 ? `
                    <div style="text-align: center; padding: 20px; color: var(--vscode-descriptionForeground);">
                        No modes found. Please check your configuration.
                    </div>
                ` : availableModes.map(mode => `
                    <div class="mode-card">
                        <div class="mode-header">
                            <div class="mode-name">
                                ${mode.name}
                                ${mode.hasConflicts ? '<span class="mode-badge" style="background: var(--vscode-inputValidation-warningBackground);">CONFLICTS</span>' : ''}
                            </div>
                        </div>
                        <div class="mode-description">${mode.description}</div>
                        <div class="mode-features">
                            ${mode.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                        </div>
                        <div class="mode-meta">
                            <span>Target: ${mode.targetProject}</span>
                            <span>Estimated: ${mode.estimatedHours}</span>
                        </div>
                        <button class="deploy-btn" onclick="deployMode('${mode.id}')" ${mode.hasConflicts ? '' : ''}>
                            Deploy ${mode.name} Mode
                        </button>
                    </div>
                `).join('')}
            </div>
        `}
    ` : ''}

    <script>
        const vscode = acquireVsCodeApi();

        function deployMode(modeId) {
            vscode.postMessage({ type: 'deployMode', modeId: modeId });
        }

        function resetDeployment() {
            vscode.postMessage({ type: 'resetDeployment' });
        }

        function refreshState() {
            vscode.postMessage({ type: 'refreshState' });
        }

        // Auto-refresh every 10 seconds
        setInterval(refreshState, 10000);
    </script>
</body>
</html>`;
    }

    private getCurrentWorkspaceRoot(): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }
        return workspaceFolder.uri.fsPath;
    }

    private setupFileWatcher() {
        const workspaceRoot = this.getCurrentWorkspaceRoot();
        this.fileWatcher = this.modeDiscovery.setupFileWatcher(() => {
            console.log('File system change detected, refreshing state...');
            this.refreshState();
        });
    }

    // Public methods for external access
    public async deployFromOutFolder(): Promise<void> {
        // For backward compatibility - deploy first available mode
        const availableModes = await this.modeDiscovery.discoverAvailableModes();
        if (availableModes.length > 0) {
            await this.handleDeployMode(availableModes[0].id);
        } else {
            throw new Error('No modes available for deployment');
        }
    }

    public async resetDeployedFiles(): Promise<void> {
        await this.handleResetDeployment();
    }

    dispose() {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
    }
}
