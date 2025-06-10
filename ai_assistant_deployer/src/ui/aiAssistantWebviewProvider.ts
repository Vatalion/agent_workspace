import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ModeDiscoveryService, ModeInfo } from '../services/modeDiscovery';
import { ModeDeploymentService, DeploymentResult } from '../services/modeDeployment';
import { RuleDiscoveryService } from '../services/ruleDiscovery';
import { RuleManagementService } from '../services/ruleManagement';
import { Rule, RuleSet, RuleFilter, RuleCategory, RuleUrgency } from '../services/ruleTypes';
import { WebviewMessageHandler, IWebviewProvider } from './messaging/WebviewMessageHandler';
import { WebviewHtmlRenderer } from './rendering/WebviewHtmlRenderer';

interface UIState {
    isLoading: boolean;
    availableModes: ModeInfo[];
    currentMode: string | null;
    isDeployed: boolean;
    lastUpdated: Date;
    error?: string;
    currentRuleSet?: RuleSet;
    ruleFilter?: RuleFilter;
    activeTab: 'modes' | 'rules';
}

export class AIAssistantWebviewProvider implements vscode.WebviewViewProvider, IWebviewProvider {
    public static readonly viewType = 'aiAssistantDeployer.controlCenter';
    private _view?: vscode.WebviewView;
    private modeDiscovery: ModeDiscoveryService;
    private modeDeployment: ModeDeploymentService;
    private ruleDiscovery: RuleDiscoveryService;
    private ruleManagement: RuleManagementService;
    private fileWatcher?: vscode.Disposable;
    private currentState: UIState;
    
    // Extracted services
    private messageHandler: WebviewMessageHandler;
    private htmlRenderer: WebviewHtmlRenderer;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly context: vscode.ExtensionContext
    ) {
        try {
            const workspaceRoot = this.getCurrentWorkspaceRoot();
            this.modeDiscovery = new ModeDiscoveryService(workspaceRoot, context.extensionPath);
            this.modeDeployment = new ModeDeploymentService(workspaceRoot, context.extensionPath);
            this.ruleDiscovery = new RuleDiscoveryService(workspaceRoot);
            this.ruleManagement = new RuleManagementService(workspaceRoot);
        } catch (error) {
            console.error('Failed to initialize services:', error);
            // Initialize with fallback - use extension path as workspace root
            const fallbackWorkspaceRoot = context.extensionPath;
            this.modeDiscovery = new ModeDiscoveryService(fallbackWorkspaceRoot, context.extensionPath);
            this.modeDeployment = new ModeDeploymentService(fallbackWorkspaceRoot, context.extensionPath);
            this.ruleDiscovery = new RuleDiscoveryService(fallbackWorkspaceRoot);
            this.ruleManagement = new RuleManagementService(fallbackWorkspaceRoot);
        }
        
        this.currentState = {
            isLoading: false, // Start with false so we show something immediately
            availableModes: [],
            currentMode: null,
            isDeployed: false,
            lastUpdated: new Date(),
            activeTab: 'modes'
        };

        // Initialize extracted services
        this.messageHandler = new WebviewMessageHandler(this);
        this.htmlRenderer = new WebviewHtmlRenderer();

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
                this.messageHandler.handleMessage(message);
            },
            undefined,
            this.context.subscriptions
        );

        // Initial UI update - ensure we show something immediately
        this.updateUI();
        
        // Then refresh state asynchronously
        this.refreshState().catch(error => {
            console.error('Initial state refresh failed:', error);
            this.currentState.isLoading = false;
            this.currentState.error = `Failed to initialize: ${error}`;
            this.updateUI();
        });
    }

    // =============================================================================
    // IWebviewProvider INTERFACE IMPLEMENTATION
    // =============================================================================

    /**
     * Update the current UI state (required by IWebviewProvider interface)
     */
    updateState(updates: Partial<UIState>): void {
        this.currentState = { ...this.currentState, ...updates };
        this.updateUI();
    }

    // =============================================================================
    // IWebviewProvider INTERFACE METHODS - Made public for interface compliance
    // =============================================================================

    public async handleDeployMode(modeId: string): Promise<void> {
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

    public async handleResetDeployment(): Promise<void> {
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

    public async refreshState(): Promise<void> {
        try {
            console.log('🔄 refreshState: Starting state refresh...');
            this.currentState.isLoading = true;
            this.updateUI();

            // Discover available modes with timeout
            console.log('🔍 refreshState: Discovering modes...');
            const availableModes = await Promise.race([
                this.modeDiscovery.discoverAvailableModes(),
                new Promise<any[]>((_, reject) => 
                    setTimeout(() => reject(new Error('Mode discovery timeout')), 10000)
                )
            ]);
            
            console.log(`✅ refreshState: Found ${availableModes.length} modes`);
            
            // Find currently active mode
            const activeMode = availableModes.find(mode => mode.isActive);
            const currentMode = activeMode ? activeMode.id : null;
            const isDeployed = activeMode !== undefined;

            console.log('📊 refreshState: State discovery results:', {
                availableModes: availableModes.length,
                activeMode: activeMode?.name || 'none',
                currentMode,
                isDeployed,
                previousRuleSet: !!this.currentState.currentRuleSet,
                previousRuleCount: this.currentState.currentRuleSet?.rules?.length || 0
            });

            // Store previous rule set to avoid losing it
            const previousRuleSet = this.currentState.currentRuleSet;

            this.currentState = {
                isLoading: false,
                availableModes,
                currentMode,
                isDeployed,
                lastUpdated: new Date(),
                error: undefined,
                activeTab: this.currentState.activeTab || 'modes',
                // Preserve the current rule set if it exists
                currentRuleSet: previousRuleSet
            };

            console.log('✅ refreshState: State updated, preserved rule set:', {
                hasRuleSet: !!this.currentState.currentRuleSet,
                ruleCount: this.currentState.currentRuleSet?.rules?.length || 0
            });

            console.log('🎯 refreshState: Final state:', this.currentState);
            this.updateUI();
        } catch (error) {
            console.error('❌ Error refreshing state:', error);
            this.currentState.isLoading = false;
            this.currentState.error = `Failed to refresh state: ${error}`;
            this.updateUI();
        }
    }

    // Rule Management Handlers

    public async handleSwitchTab(tab: 'modes' | 'rules'): Promise<void> {
        console.log('🎯 [Extension] handleSwitchTab called with:', tab);
        console.log('📊 [Extension] Current state - isDeployed:', this.currentState.isDeployed);
        
        this.currentState.activeTab = tab;
        if (tab === 'rules' && this.currentState.isDeployed) {
            console.log('✅ [Extension] Conditions met, calling handleLoadRules()');
            await this.handleLoadRules();
        } else if (tab === 'rules' && !this.currentState.isDeployed) {
            console.log('❌ [Extension] Rules tab requested but not deployed');
        }
        this.updateUI();
        console.log('🎨 [Extension] handleSwitchTab completed, UI updated');
    }

    public async handleLoadRules(): Promise<void> {
        try {
            console.log('🔍 handleLoadRules: Starting rule discovery...');
            console.log('🏠 handleLoadRules: Workspace root:', this.ruleDiscovery);
            
            const ruleSet = await this.ruleDiscovery.discoverDeployedRules();
            console.log('✅ handleLoadRules: Rule discovery completed, found:', ruleSet);
            console.log('📊 Rule counts:', {
                totalRules: ruleSet.rules.length,
                enabledRules: ruleSet.enabledRules,
                categories: Object.keys(ruleSet.rulesByCategory).length,
                ruleSetObject: ruleSet
            });
            
            // Store the rule set
            this.currentState.currentRuleSet = ruleSet;
            console.log('💾 handleLoadRules: Updated currentState.currentRuleSet');
            console.log('🔄 handleLoadRules: Current state after update:', {
                hasCurrentRuleSet: !!this.currentState.currentRuleSet,
                ruleCount: this.currentState.currentRuleSet?.rules?.length || 0,
                isDeployed: this.currentState.isDeployed,
                activeTab: this.currentState.activeTab
            });
            
            this.updateUI();
            console.log('🎨 handleLoadRules: UI updated');
            
            // Verify the state is still intact after UI update
            setTimeout(() => {
                console.log('⏰ handleLoadRules: State check after 1 second:', {
                    hasCurrentRuleSet: !!this.currentState.currentRuleSet,
                    ruleCount: this.currentState.currentRuleSet?.rules?.length || 0
                });
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error loading rules:', error);
            this.currentState.error = `Failed to load rules: ${error}`;
            this.updateUI();
        }
    }

    public async handleToggleRule(ruleId: string): Promise<void> {
        try {
            const rule = this.ruleManagement.getRule(ruleId);
            if (!rule) {
                vscode.window.showErrorMessage('Rule not found');
                return;
            }
            const success = await this.ruleManagement.updateRule(ruleId, { isEnabled: !rule.isEnabled });
            if (success) {
                await this.handleLoadRules(); // Refresh rules
                vscode.window.showInformationMessage('Rule updated successfully');
            } else {
                vscode.window.showErrorMessage('Failed to toggle rule');
            }
        } catch (error) {
            console.error('Error toggling rule:', error);
            vscode.window.showErrorMessage(`Error toggling rule: ${error}`);
        }
    }

    public async handleUpdateRuleUrgency(ruleId: string, urgency: string): Promise<void> {
        try {
            const success = await this.ruleManagement.updateRule(ruleId, { urgency: urgency as RuleUrgency });
            if (success) {
                await this.handleLoadRules(); // Refresh rules
                vscode.window.showInformationMessage('Rule urgency updated successfully');
            } else {
                vscode.window.showErrorMessage('Failed to update rule urgency');
            }
        } catch (error) {
            console.error('Error updating rule urgency:', error);
            vscode.window.showErrorMessage(`Error updating rule urgency: ${error}`);
        }
    }

    public async handleFilterRules(filter: RuleFilter): Promise<void> {
        try {
            this.currentState.ruleFilter = filter;
            // Filter is applied in the UI generation
            this.updateUI();
        } catch (error) {
            console.error('Error filtering rules:', error);
            this.currentState.error = `Failed to filter rules: ${error}`;
            this.updateUI();
        }
    }

    public async handleAddRule(rule: Rule): Promise<void> {
        try {
            const newRule = await this.ruleManagement.createRule(rule);
            await this.handleLoadRules(); // Refresh rules
            vscode.window.showInformationMessage(`Rule "${rule.title}" added successfully`);
        } catch (error) {
            console.error('Error adding rule:', error);
            vscode.window.showErrorMessage(`Error adding rule: ${error}`);
        }
    }

    public async handleRemoveRule(ruleId: string): Promise<void> {
        try {
            const success = await this.ruleManagement.deleteRule(ruleId);
            if (success) {
                await this.handleLoadRules(); // Refresh rules
                vscode.window.showInformationMessage('Rule removed successfully');
            } else {
                vscode.window.showErrorMessage('Failed to remove rule');
            }
        } catch (error) {
            console.error('Error removing rule:', error);
            vscode.window.showErrorMessage(`Error removing rule: ${error}`);
        }
    }

    public async handleBulkOperation(operation: any): Promise<void> {
        try {
            // For now, disable bulk operations since the method doesn't exist
            vscode.window.showInformationMessage('Bulk operations are not yet implemented');
        } catch (error) {
            console.error('Error performing bulk operation:', error);
            vscode.window.showErrorMessage(`Error performing bulk operation: ${error}`);
        }
    }

    public async handleExportRules(ruleIds?: string[]): Promise<void> {
        try {
            // If specific rules are requested, get them individually and create JSON
            let exportData: string;
            if (ruleIds && ruleIds.length > 0) {
                const rules = ruleIds.map(id => this.ruleManagement.getRule(id)).filter(r => r !== null);
                exportData = JSON.stringify({
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                    rules: rules
                }, null, 2);
            } else {
                exportData = await this.ruleManagement.exportRules();
            }
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('exported-rules.json'),
                filters: { 'JSON Files': ['json'] }
            });
            
            if (uri) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(exportData, 'utf8'));
                vscode.window.showInformationMessage('Rules exported successfully');
            }
        } catch (error) {
            console.error('Error exporting rules:', error);
            vscode.window.showErrorMessage(`Error exporting rules: ${error}`);
        }
    }

    public async handleImportRules(): Promise<void> {
        try {
            vscode.window.showInformationMessage('Import feature is not yet implemented');
        } catch (error) {
            console.error('Error importing rules:', error);
            vscode.window.showErrorMessage(`Error importing rules: ${error}`);
        }
    }

    private updateUI() {
        if (!this._view) {
            console.log('⚠️ updateUI: No webview available');
            return;
        }

        console.log('🎨 updateUI: Starting UI update...');
        console.log('📊 updateUI: Current state:', {
            isLoading: this.currentState.isLoading,
            isDeployed: this.currentState.isDeployed,
            activeTab: this.currentState.activeTab,
            hasCurrentRuleSet: !!this.currentState.currentRuleSet,
            ruleCount: this.currentState.currentRuleSet?.rules?.length || 0,
            error: this.currentState.error
        });

        this._view.webview.html = this.htmlRenderer.generateWebviewHTML(this.currentState);
        console.log('✅ updateUI: HTML generated and assigned to webview');
    }

    private getCurrentWorkspaceRoot(): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            // Return a default workspace root if no workspace is open
            return this.context.extensionPath;
        }
        return workspaceFolder.uri.fsPath;
    }

    private setupFileWatcher() {
        try {
            const workspaceRoot = this.getCurrentWorkspaceRoot();
            this.fileWatcher = this.modeDiscovery.setupFileWatcher(() => {
                console.log('File system change detected, refreshing state...');
                this.refreshState();
            });
        } catch (error) {
            console.error('Failed to setup file watcher:', error);
            // Continue without file watcher
        }
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

    public async handleDeployCustomMode(customModeData: any): Promise<void> {
        try {
            console.log('🎯 handleDeployCustomMode: Starting custom mode deployment', customModeData);
            
            // Validate input data
            if (!customModeData?.name || !customModeData?.selectedRules || customModeData.selectedRules.length === 0) {
                vscode.window.showErrorMessage('❌ Invalid custom mode data. Name and at least one rule are required.');
                return;
            }

            // Show progress
            this.currentState.isLoading = true;
            this.updateUI();

            const result = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Deploying custom mode: ${customModeData.name}`,
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 10, message: 'Creating custom mode configuration...' });

                // Create mode configuration from user selection
                const customMode = await this.createCustomModeConfiguration(customModeData);
                
                progress.report({ increment: 30, message: 'Saving custom mode...' });

                // Save the custom mode configuration
                await this.saveCustomModeConfiguration(customMode);
                
                progress.report({ increment: 50, message: 'Deploying custom mode...' });

                // Create ModeInfo for deployment
                const modeInfo: ModeInfo = {
                    id: customMode.id,
                    name: customMode.name,
                    description: customMode.description,
                    features: [`${customModeData.selectedRules.length} custom rules`, 'User-configured mode'],
                    targetProject: customModeData.target || 'flutter',
                    estimatedHours: this.calculateComplexity(customModeData.selectedRules.length),
                    isActive: false,
                    hasConflicts: false,
                    path: '' // Will be set during deployment
                };

                // Deploy using existing infrastructure
                const deploymentResult = await this.modeDeployment.deployMode(modeInfo);
                
                progress.report({ increment: 100, message: 'Complete!' });
                return deploymentResult;
            });

            if (result.success) {
                vscode.window.showInformationMessage(
                    `🚀 Custom mode "${customModeData.name}" deployed successfully! ` +
                    `Deployed ${result.deployedFiles.length} files with ${customModeData.selectedRules.length} rules.`
                );
            } else {
                vscode.window.showErrorMessage(`❌ Custom mode deployment failed: ${result.message}`);
            }

            // Refresh the UI to show the new mode
            await this.refreshState();

        } catch (error) {
            console.error('❌ Error deploying custom mode:', error);
            vscode.window.showErrorMessage(`❌ Custom mode deployment failed: ${error}`);
        } finally {
            this.currentState.isLoading = false;
            this.updateUI();
        }
    }

    private async createCustomModeConfiguration(customModeData: any): Promise<any> {
        const modeId = `custom-${Date.now()}`;
        
        // Create a custom mode configuration based on user selection
        const customMode = {
            id: modeId,
            name: customModeData.name,
            description: customModeData.description || `Custom mode with ${customModeData.selectedRules.length} selected rules`,
            type: 'custom',
            metadata: {
                version: '1.0.0',
                author: 'user',
                createdAt: customModeData.createdAt || new Date().toISOString(),
                targetProject: customModeData.target || 'flutter',
                estimatedSetupTime: customModeData.estimatedHours || (customModeData.selectedRules.length * 0.03),
                complexity: this.calculateComplexity(customModeData.selectedRules.length),
                tags: ['custom', 'user-created', customModeData.target || 'flutter']
            },
            rules: {
                instructions: customModeData.selectedRules
            },
            structure: {
                targetDirectory: '.github',
                files: ['project-rules.md', 'PROJECT_MAP.md'],
                automation: {
                    scripts: [],
                    hooks: []
                }
            },
            templates: {
                instructionsTemplate: 'custom-instructions.md',
                projectMapTemplate: 'custom-project-map.md'
            },
            deployment: {
                mode: 'rule-based',
                requiresBackup: true,
                cleanupOnDeploy: true,
                validationSteps: ['rule-validation', 'file-generation']
            }
        };

        console.log('✅ Created custom mode configuration:', customMode);
        return customMode;
    }

    private async saveCustomModeConfiguration(customMode: any): Promise<void> {
        try {
            // Save to workspace custom modes directory
            const customModesDir = path.join(this.getCurrentWorkspaceRoot(), '.ai-assistant', 'custom-modes');
            
            // Ensure directory exists
            if (!fs.existsSync(customModesDir)) {
                fs.mkdirSync(customModesDir, { recursive: true });
            }

            const configPath = path.join(customModesDir, `${customMode.id}.json`);
            await fs.promises.writeFile(configPath, JSON.stringify(customMode, null, 2), 'utf-8');
            
            console.log(`✅ Saved custom mode configuration to: ${configPath}`);
        } catch (error) {
            console.error('❌ Error saving custom mode configuration:', error);
            throw error;
        }
    }

    private calculateComplexity(ruleCount: number): string {
        if (ruleCount <= 5) return 'simple';
        if (ruleCount <= 15) return 'medium';
        if (ruleCount <= 30) return 'complex';
        return 'advanced';
    }

    /**
     * Load available rules for Custom Mode Builder
     */
    public async handleLoadAvailableRules(): Promise<void> {
        try {
            console.log('📋 [Extension] Loading available rules for Custom Mode Builder');
            
            // Get all available rules from the rule pool
            const workspaceRoot = this.getCurrentWorkspaceRoot();
            const rulePoolPath = path.join(this.context.extensionPath, 'data', 'rule-pool.json');
            
            if (!fs.existsSync(rulePoolPath)) {
                console.error('❌ Rule pool not found at:', rulePoolPath);
                this.sendMessageToWebview({
                    type: 'showError',
                    error: 'Rule pool not found. Please ensure the extension is properly installed.'
                });
                return;
            }
            
            const rulePoolContent = fs.readFileSync(rulePoolPath, 'utf8');
            const rulePool = JSON.parse(rulePoolContent);
            
            // Convert rule pool to array format suitable for UI
            const rules = Object.values(rulePool).map((rule: any) => ({
                id: rule.id,
                title: rule.title,
                description: rule.description,
                category: rule.category,
                urgency: rule.urgency
            }));
            
            console.log(`✅ [Extension] Loaded ${rules.length} rules for Custom Mode Builder`);
            
            // Send rules to webview
            this.sendMessageToWebview({
                type: 'populateAvailableRules',
                rules: rules
            });
            
        } catch (error) {
            console.error('❌ Error loading available rules:', error);
            this.sendMessageToWebview({
                type: 'showError',
                error: `Failed to load available rules: ${error}`
            });
        }
    }

    /**
     * Handle creation of custom mode
     */
    public async handleCreateCustomMode(customModeData: any): Promise<void> {
        try {
            console.log('🚀 [Extension] Creating custom mode:', customModeData);
            
            if (!customModeData.name || !customModeData.description) {
                this.sendMessageToWebview({
                    type: 'showError',
                    error: 'Mode name and description are required'
                });
                return;
            }
            
            // Create custom mode configuration
            const modeConfig = {
                id: `custom-${Date.now()}`,
                name: customModeData.name,
                description: customModeData.description,
                version: '1.0.0',
                targetProject: customModeData.targetProject || 'general',
                features: ['Custom Mode', 'Rule-based'],
                estimatedHours: '1-3 hours',
                rules: customModeData.selectedRules || [],
                created: new Date().toISOString(),
                isCustom: true
            };
            
            // Save custom mode to workspace
            const workspaceRoot = this.getCurrentWorkspaceRoot();
            const customModesDir = path.join(workspaceRoot, '.vscode', 'custom-modes');
            
            if (!fs.existsSync(customModesDir)) {
                fs.mkdirSync(customModesDir, { recursive: true });
            }
            
            const modeFilePath = path.join(customModesDir, `${modeConfig.id}.json`);
            fs.writeFileSync(modeFilePath, JSON.stringify(modeConfig, null, 2));
            
            console.log(`✅ [Extension] Custom mode saved to: ${modeFilePath}`);
            
            // Deploy the custom mode immediately
            const modeInfo: ModeInfo = {
                id: modeConfig.id,
                name: modeConfig.name,
                description: modeConfig.description,
                targetProject: modeConfig.targetProject,
                features: modeConfig.features,
                estimatedHours: modeConfig.estimatedHours,
                isActive: false,
                hasConflicts: false,
                path: modeFilePath
            };
            
            await this.modeDeployment.deployMode(modeInfo);
            
            // Update state and UI
            await this.refreshState();
            
            this.sendMessageToWebview({
                type: 'showSuccess',
                message: `Custom mode "${customModeData.name}" created and deployed successfully!`
            });
            
        } catch (error) {
            console.error('❌ Error creating custom mode:', error);
            this.sendMessageToWebview({
                type: 'showError',
                error: `Failed to create custom mode: ${error}`
            });
        }
    }

    /**
     * Send message to webview safely
     */
    private sendMessageToWebview(message: any): void {
        if (this._view?.webview) {
            this._view.webview.postMessage(message);
        }
    }

    /**
     * Open the Custom Mode Builder interface
     */
    public async openCustomModeBuilder(): Promise<void> {
        try {
            console.log('🎯 Opening Custom Mode Builder');
            
            // Make sure the webview is visible
            if (this._view) {
                this._view.show(true);
            }
            
            // Send a message to the webview to open the Custom Mode Builder modal
            if (this._view?.webview) {
                await this._view.webview.postMessage({
                    type: 'openCustomModeBuilder'
                });
            }
            
            console.log('✅ Custom Mode Builder interface opened');
        } catch (error) {
            console.error('❌ Error opening Custom Mode Builder:', error);
            vscode.window.showErrorMessage(`Failed to open Custom Mode Builder: ${error}`);
        }
    }

    /**
     * Open the Mode Selection interface
     */
    public async openModeSelection(): Promise<void> {
        try {
            console.log('🎯 Opening Mode Selection');
            
            // Use VS Code quick pick for mode selection
            const modes = [
                {
                    label: '🏢 Enterprise Mode',
                    description: 'Full-featured deployment for large organizations',
                    detail: 'Includes comprehensive rules, documentation, and enterprise features'
                },
                {
                    label: '🔄 Hybrid Mode', 
                    description: 'Balanced approach with essential features',
                    detail: 'Mix of automation and manual control for flexibility'
                },
                {
                    label: '⚡ Simplified Mode',
                    description: 'Quick deployment with minimal configuration',
                    detail: 'Streamlined setup for fast development'
                },
                {
                    label: '🛠️ Custom Mode',
                    description: 'Create a tailored mode for your specific needs',
                    detail: 'Build and configure a custom mode from available components'
                }
            ];

            const selectedMode = await vscode.window.showQuickPick(modes, {
                placeHolder: 'Select a deployment mode for your AI Assistant',
                canPickMany: false
            });

            if (selectedMode) {
                const modeType = selectedMode.label.toLowerCase().includes('enterprise') ? 'enterprise' :
                              selectedMode.label.toLowerCase().includes('hybrid') ? 'hybrid' :
                              selectedMode.label.toLowerCase().includes('simplified') ? 'simplified' : 'custom';
                
                console.log(`✅ Mode selected: ${modeType}`);
                
                if (modeType === 'custom') {
                    // Open custom mode builder for custom mode
                    await this.openCustomModeBuilder();
                } else {
                    // Deploy the selected mode
                    await this.deploySelectedMode(modeType);
                }
            }
            
        } catch (error) {
            console.error('❌ Error opening Mode Selection:', error);
            vscode.window.showErrorMessage(`Failed to open Mode Selection: ${error}`);
        }
    }

    /**
     * Deploy the selected mode
     */
    private async deploySelectedMode(modeType: string): Promise<void> {
        try {
            console.log(`🚀 Deploying ${modeType} mode`);
            
            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Deploying ${modeType.charAt(0).toUpperCase() + modeType.slice(1)} Mode`,
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: "Preparing deployment..." });
                
                // Use existing deployment functionality
                const workspaceRoot = this.getCurrentWorkspaceRoot();
                const modePath = path.join(this.context.extensionPath, 'templates', 'modes', modeType);
                
                progress.report({ increment: 30, message: "Copying mode files..." });
                
                // Check if mode exists
                if (fs.existsSync(modePath)) {
                    // Deploy using existing mode deployment service
                    const availableModes = await this.modeDiscovery.discoverAvailableModes();
                    const modeInfo = availableModes.find(mode => mode.id === modeType);
                    if (modeInfo) {
                        progress.report({ increment: 60, message: "Configuring mode..." });
                        await this.modeDeployment.deployMode(modeInfo);
                        progress.report({ increment: 100, message: "Deployment complete!" });
                    } else {
                        throw new Error(`Mode info not found for ${modeType}`);
                    }
                } else {
                    // Fall back to deployment files if mode doesn't exist
                    progress.report({ increment: 50, message: "Using deployment template..." });
                    await this.deployFromOutFolder();
                    progress.report({ increment: 100, message: "Deployment complete!" });
                }
            });
            
            vscode.window.showInformationMessage(`✅ ${modeType.charAt(0).toUpperCase() + modeType.slice(1)} Mode deployed successfully! 🚀`);
            
            // Refresh the UI state
            await this.refreshState();
            
        } catch (error) {
            console.error(`❌ Error deploying ${modeType} mode:`, error);
            vscode.window.showErrorMessage(`Failed to deploy ${modeType} mode: ${error}`);
        }
    }

    dispose() {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
    }
}
