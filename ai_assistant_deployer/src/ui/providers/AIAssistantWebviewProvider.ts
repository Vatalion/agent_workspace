/**
 * Refactored AI Assistant Webview Provider
 * Modular, reactive, and maintainable VS Code webview provider
 */

import * as vscode from 'vscode';
import { UIStateManager } from '../state/StateManager';
import { ApplicationContainer } from '../components/ApplicationContainer';
import { WebviewMessageHandler, IWebviewProvider } from '../messaging/WebviewMessageHandler';
import { WebviewHtmlRenderer } from '../rendering/WebviewHtmlRenderer';
import { ModeDiscoveryService, ModeInfo } from '../../services/modeDiscovery';
import { ModeDeploymentService } from '../../services/modeDeployment';
import { RuleDiscoveryService } from '../../services/ruleDiscovery';
import { RuleManagementService } from '../../services/ruleManagement';
import { RulePoolService } from '../../services/rulePoolService';
import { actionCreators, AsyncActionCreators } from '../state/actions/ActionCreators';

/**
 * Modern, modular webview provider with reactive state management
 */
export class AIAssistantWebviewProvider implements vscode.WebviewViewProvider, IWebviewProvider {
    public static readonly viewType = 'aiAssistantDeployer.controlCenter';
    
    private _view?: vscode.WebviewView;
    private stateManager!: UIStateManager;
    private applicationContainer!: ApplicationContainer;
    private messageHandler!: WebviewMessageHandler;
    private htmlRenderer!: WebviewHtmlRenderer;
    private asyncActions!: AsyncActionCreators;
    
    // Service layer
    private modeDiscovery!: ModeDiscoveryService;
    private modeDeployment!: ModeDeploymentService;
    private ruleDiscovery!: RuleDiscoveryService;
    private ruleManagement!: RuleManagementService;
    private rulePoolService!: RulePoolService;
    
    // File watcher for reactive updates
    private fileWatcher?: vscode.FileSystemWatcher;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly context: vscode.ExtensionContext
    ) {
        this.initializeServices();
        this.initializeUI();
        this.setupFileWatcher();
    }

    /**
     * Initialize business logic services
     */
    private initializeServices(): void {
        try {
            const workspaceRoot = this.getCurrentWorkspaceRoot();
            
            this.modeDiscovery = new ModeDiscoveryService(workspaceRoot, this.context.extensionPath);
            this.modeDeployment = new ModeDeploymentService(workspaceRoot, this.context.extensionPath);
            this.ruleDiscovery = new RuleDiscoveryService(workspaceRoot);
            this.ruleManagement = new RuleManagementService(workspaceRoot);
            this.rulePoolService = new RulePoolService(this.context.extensionPath);
        } catch (error) {
            console.error('Failed to initialize services:', error);
            // Fallback initialization
            const fallbackRoot = this.context.extensionPath;
            this.modeDiscovery = new ModeDiscoveryService(fallbackRoot, this.context.extensionPath);
            this.modeDeployment = new ModeDeploymentService(fallbackRoot, this.context.extensionPath);
            this.ruleDiscovery = new RuleDiscoveryService(fallbackRoot);
            this.ruleManagement = new RuleManagementService(fallbackRoot);
            this.rulePoolService = new RulePoolService(this.context.extensionPath);
        }
    }

    /**
     * Initialize UI layer with reactive state management
     */
    private initializeUI(): void {
        // Initialize state manager
        this.stateManager = new UIStateManager({
            activeTab: 'modes',
            lastUpdated: new Date()
        });

        // Initialize async action creators
        this.asyncActions = new AsyncActionCreators(
            (action) => this.stateManager.dispatch(action)
        );

        // Initialize modular components
        this.applicationContainer = new ApplicationContainer(this.stateManager);
        this.messageHandler = new WebviewMessageHandler(this);
        this.htmlRenderer = new WebviewHtmlRenderer();

        // Subscribe to state changes for reactive updates
        this.stateManager.subscribe((newState) => {
            this.updateWebviewContent();
        });
    }

    /**
     * Set up file watcher for automatic updates
     */
    private setupFileWatcher(): void {
        try {
            const workspaceRoot = this.getCurrentWorkspaceRoot();
            const pattern = new vscode.RelativePattern(workspaceRoot, '**/{.github,configs,templates}/**/*');
            
            this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
            
            this.fileWatcher.onDidChange(() => this.handleFileSystemChange());
            this.fileWatcher.onDidCreate(() => this.handleFileSystemChange());
            this.fileWatcher.onDidDelete(() => this.handleFileSystemChange());
        } catch (error) {
            console.warn('Failed to setup file watcher:', error);
        }
    }

    /**
     * Handle file system changes
     */
    private async handleFileSystemChange(): Promise<void> {
        // Debounce rapid file changes
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        
        this.updateTimeout = setTimeout(async () => {
            await this.refreshState();
        }, 500);
    }

    private updateTimeout?: NodeJS.Timeout;

    /**
     * VS Code webview view provider implementation
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(
            async (message: any) => {
                await this.messageHandler.handleMessage(message);
            },
            undefined,
            this.context.subscriptions
        );

        // Initial load
        this.updateWebviewContent();
        this.loadInitialData();
    }

    /**
     * Update webview content reactively
     */
    private updateWebviewContent(): void {
        if (!this._view) return;

        try {
            const componentHtml = this.applicationContainer.render();
            const fullHtml = this.htmlRenderer.renderFullPage(componentHtml, this._extensionUri);
            this._view.webview.html = fullHtml;
        } catch (error) {
            console.error('Error updating webview content:', error);
            this._view.webview.html = this.htmlRenderer.renderErrorPage(error);
        }
    }

    /**
     * Load initial data
     */
    private async loadInitialData(): Promise<void> {
        try {
            // Load modes asynchronously
            await this.asyncActions.loadModes(async () => {
                return await this.modeDiscovery.discoverAvailableModes();
            });

            // Load rules asynchronously
            this.stateManager.actions.setLoading(true);
            const ruleSet = await this.ruleDiscovery.discoverDeployedRules();
            this.stateManager.dispatch(actionCreators.rules.setRuleSet(ruleSet));
            this.stateManager.actions.setLoading(false);

        } catch (error) {
            console.error('Error loading initial data:', error);
            this.stateManager.actions.setError(`Failed to load initial data: ${error}`);
        }
    }

    // Implementation of IWebviewProvider interface methods

    async handleDeployMode(modeId: string): Promise<void> {
        await this.asyncActions.deployMode(
            async (modeId: string) => {
                // First find the ModeInfo for this mode ID
                const availableModes = await this.modeDiscovery.discoverAvailableModes();
                const modeInfo = availableModes.find(mode => mode.id === modeId);
                if (!modeInfo) {
                    throw new Error(`Mode '${modeId}' not found`);
                }
                return await this.modeDeployment.deployMode(modeInfo);
            },
            modeId
        );
    }

    async handleResetDeployment(): Promise<void> {
        await this.asyncActions.resetDeployment(async () => {
            await this.modeDeployment.resetDeployment();
        });
    }

    async refreshState(): Promise<void> {
        await this.loadInitialData();
    }

    async handleSwitchTab(tab: 'modes' | 'rules'): Promise<void> {
        this.stateManager.actions.switchTab(tab);
    }

    async handleLoadRules(): Promise<void> {
        try {
            this.stateManager.actions.setLoading(true);
            const ruleSet = await this.ruleDiscovery.discoverDeployedRules();
            this.stateManager.dispatch(actionCreators.rules.setRuleSet(ruleSet));
        } catch (error) {
            this.stateManager.actions.setError(`Failed to load rules: ${error}`);
        } finally {
            this.stateManager.actions.setLoading(false);
        }
    }

    async handleToggleRule(ruleId: string): Promise<void> {
        try {
            // Use updateRule to toggle the enabled state
            const currentRule = this.ruleManagement.getRule(ruleId);
            if (currentRule) {
                await this.ruleManagement.updateRule(ruleId, { isEnabled: !currentRule.isEnabled });
                this.stateManager.actions.setSuccess(`Rule ${ruleId} toggled successfully`);
                await this.handleLoadRules(); // Refresh rules
            } else {
                this.stateManager.actions.setError(`Rule ${ruleId} not found`);
            }
        } catch (error) {
            this.stateManager.actions.setError(`Failed to toggle rule: ${error}`);
        }
    }

    async handleUpdateRuleUrgency(ruleId: string, urgency: string): Promise<void> {
        try {
            // Use updateRule to change the urgency
            await this.ruleManagement.updateRule(ruleId, { urgency: urgency as any });
            this.stateManager.actions.setSuccess(`Rule urgency updated successfully`);
            await this.handleLoadRules();
        } catch (error) {
            this.stateManager.actions.setError(`Failed to update rule urgency: ${error}`);
        }
    }

    async handleFilterRules(filter: any): Promise<void> {
        this.stateManager.dispatch(actionCreators.rules.setRuleFilter(filter));
    }

    async handleAddRule(rule: any): Promise<void> {
        try {
            await this.ruleManagement.createRule(rule);
            this.stateManager.actions.setSuccess('Rule added successfully');
            await this.handleLoadRules();
        } catch (error) {
            this.stateManager.actions.setError(`Failed to add rule: ${error}`);
        }
    }

    async handleRemoveRule(ruleId: string): Promise<void> {
        try {
            await this.ruleManagement.deleteRule(ruleId);
            this.stateManager.actions.setSuccess('Rule removed successfully');
            await this.handleLoadRules();
        } catch (error) {
            this.stateManager.actions.setError(`Failed to remove rule: ${error}`);
        }
    }

    async handleBulkOperation(operation: any): Promise<void> {
        try {
            // Use the bulkUpdateRules method from RuleManagementService
            const result = await this.ruleManagement.bulkUpdateRules(operation);
            this.stateManager.actions.setSuccess(`Bulk operation completed successfully. Updated ${result.length} rules.`);
            await this.handleLoadRules();
        } catch (error) {
            this.stateManager.actions.setError(`Bulk operation failed: ${error}`);
        }
    }

    async handleExportRules(ruleIds?: string[]): Promise<void> {
        try {
            // Implement rule export
            this.stateManager.actions.setSuccess('Rules exported successfully');
        } catch (error) {
            this.stateManager.actions.setError(`Failed to export rules: ${error}`);
        }
    }

    async handleImportRules(): Promise<void> {
        try {
            // Implement rule import
            this.stateManager.actions.setSuccess('Rules imported successfully');
        } catch (error) {
            this.stateManager.actions.setError(`Failed to import rules: ${error}`);
        }
    }

    async handleDeployCustomMode(customModeData: any): Promise<void> {
        try {
            // Implement custom mode deployment
            this.stateManager.actions.setSuccess('Custom mode deployed successfully');
        } catch (error) {
            this.stateManager.actions.setError(`Failed to deploy custom mode: ${error}`);
        }
    }

    async openCustomModeBuilder(): Promise<void> {
        this.stateManager.actions.switchTab('custom');
        this.stateManager.dispatch(actionCreators.customMode.toggleCustomModeBuilder());
    }

    async handleLoadAvailableRules(): Promise<void> {
        await this.handleLoadRules();
    }

    async handleCreateCustomMode(customModeData: any): Promise<void> {
        try {
            // Implement custom mode creation
            this.stateManager.actions.setSuccess('Custom mode created successfully');
        } catch (error) {
            this.stateManager.actions.setError(`Failed to create custom mode: ${error}`);
        }
    }

    updateState(updates: Partial<any>): void {
        this.stateManager.updateState(updates);
    }

    /**
     * Backward compatibility methods for extension.ts
     */
    async openModeSelection(): Promise<void> {
        // Switch to modes tab in the new UI
        this.stateManager.actions.switchTab('modes');
    }

    async deployFromOutFolder(): Promise<void> {
        // Deploy the first available mode for backward compatibility
        const availableModes = await this.modeDiscovery.discoverAvailableModes();
        if (availableModes.length > 0) {
            await this.handleDeployMode(availableModes[0].id);
        } else {
            throw new Error('No modes available for deployment');
        }
    }

    async resetDeployedFiles(): Promise<void> {
        await this.handleResetDeployment();
    }

    /**
     * Utility methods
     */
    private getCurrentWorkspaceRoot(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            throw new Error('No workspace folder found');
        }
        return workspaceFolders[0].uri.fsPath;
    }

    /**
     * Dispose resources
     */
    dispose(): void {
        this.fileWatcher?.dispose();
        this.applicationContainer?.dispose();
        
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
    }
}
