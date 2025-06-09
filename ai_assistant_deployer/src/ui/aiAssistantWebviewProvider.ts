import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ModeDiscoveryService, ModeInfo } from '../services/modeDiscovery';
import { ModeDeploymentService, DeploymentResult } from '../services/modeDeployment';
import { RuleDiscoveryService } from '../services/ruleDiscovery';
import { RuleManagementService } from '../services/ruleManagement';
import { Rule, RuleSet, RuleFilter, RuleCategory, RuleUrgency } from '../services/ruleTypes';

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

export class AIAssistantWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'aiAssistantDeployer.panel';
    private _view?: vscode.WebviewView;
    private modeDiscovery: ModeDiscoveryService;
    private modeDeployment: ModeDeploymentService;
    private ruleDiscovery: RuleDiscoveryService;
    private ruleManagement: RuleManagementService;
    private fileWatcher?: vscode.Disposable;
    private currentState: UIState;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly context: vscode.ExtensionContext
    ) {
        const workspaceRoot = this.getCurrentWorkspaceRoot();
        this.modeDiscovery = new ModeDiscoveryService(workspaceRoot, context.extensionPath);
        this.modeDeployment = new ModeDeploymentService(workspaceRoot, context.extensionPath);
        this.ruleDiscovery = new RuleDiscoveryService(workspaceRoot);
        this.ruleManagement = new RuleManagementService(workspaceRoot);
        
        this.currentState = {
            isLoading: true,
            availableModes: [],
            currentMode: null,
            isDeployed: false,
            lastUpdated: new Date(),
            activeTab: 'modes'
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
            console.log('📨 [Extension] Received webview message:', message);
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
                case 'switchTab':
                    console.log('🔄 [Extension] Handling switchTab to:', message.tab);
                    await this.handleSwitchTab(message.tab);
                    break;
                case 'loadRules':
                    console.log('📋 [Extension] Handling loadRules');
                    await this.handleLoadRules();
                    break;
                case 'toggleRule':
                    await this.handleToggleRule(message.ruleId);
                    break;
                case 'updateRuleUrgency':
                    await this.handleUpdateRuleUrgency(message.ruleId, message.urgency);
                    break;
                case 'filterRules':
                    await this.handleFilterRules(message.filter);
                    break;
                case 'addRule':
                    await this.handleAddRule(message.rule);
                    break;
                case 'removeRule':
                    await this.handleRemoveRule(message.ruleId);
                    break;
                case 'bulkOperation':
                    await this.handleBulkOperation(message.operation);
                    break;
                case 'exportRules':
                    await this.handleExportRules(message.ruleIds);
                    break;
                case 'importRules':
                    await this.handleImportRules();
                    break;
                case 'deployCustomMode':
                    await this.handleDeployCustomMode(message.customModeData);
                    break;
                case 'openCustomModeBuilder':
                    await this.openCustomModeBuilder();
                    break;
                case 'loadAvailableRules':
                    await this.handleLoadAvailableRules();
                    break;
                case 'createCustomMode':
                    await this.handleCreateCustomMode(message.customModeData);
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
            console.log('🔄 refreshState: Starting state refresh...');
            this.currentState.isLoading = true;
            this.updateUI();

            // Discover available modes
            const availableModes = await this.modeDiscovery.discoverAvailableModes();
            
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

    private async handleSwitchTab(tab: 'modes' | 'rules') {
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

    private async handleLoadRules() {
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

    private async handleToggleRule(ruleId: string) {
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

    private async handleUpdateRuleUrgency(ruleId: string, urgency: RuleUrgency) {
        try {
            const success = await this.ruleManagement.updateRule(ruleId, { urgency });
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

    private async handleFilterRules(filter: RuleFilter) {
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

    private async handleAddRule(rule: Omit<Rule, 'id' | 'createdAt' | 'modifiedAt'>) {
        try {
            const newRule = await this.ruleManagement.createRule(rule);
            await this.handleLoadRules(); // Refresh rules
            vscode.window.showInformationMessage(`Rule "${rule.title}" added successfully`);
        } catch (error) {
            console.error('Error adding rule:', error);
            vscode.window.showErrorMessage(`Error adding rule: ${error}`);
        }
    }

    private async handleRemoveRule(ruleId: string) {
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

    private async handleBulkOperation(operation: any) {
        try {
            // For now, disable bulk operations since the method doesn't exist
            vscode.window.showInformationMessage('Bulk operations are not yet implemented');
        } catch (error) {
            console.error('Error performing bulk operation:', error);
            vscode.window.showErrorMessage(`Error performing bulk operation: ${error}`);
        }
    }

    private async handleExportRules(ruleIds?: string[]) {
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

    private async handleImportRules() {
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

        this._view.webview.html = this.generateWebviewHTML();
        console.log('✅ updateUI: HTML generated and assigned to webview');
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
        html, body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            margin: 0;
            padding: 0;
            height: 100%;
            overflow-y: auto;
        }
        body {
            padding: 16px;
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
        
        /* Tab Navigation Styles */
        .tab-navigation {
            display: flex;
            border-bottom: 1px solid var(--vscode-widget-border);
            margin-bottom: 16px;
        }
        .tab-btn {
            background: transparent;
            border: none;
            color: var(--vscode-foreground);
            padding: 8px 16px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            font-size: 13px;
        }
        .tab-btn:hover {
            background: var(--vscode-list-hoverBackground);
        }
        .tab-btn.active {
            border-bottom-color: var(--vscode-focusBorder);
            background: var(--vscode-list-activeSelectionBackground);
        }
        .tab-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .tab-content {
            display: block;
        }
        .tab-content.hidden {
            display: none;
        }
        
        /* Rules Styles */
        .rules-container {
            padding: 0;
            width: 100%;
            height: auto;
            min-height: 0;
        }
        .rules-content {
            height: auto;
            min-height: 0;
        }
        .rules-header {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .rules-stats {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;
        }
        .stat {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }
        .rules-filters {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }
        .search-input, .filter-select {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 12px;
        }
        .rules-actions {
            display: flex;
            gap: 8px;
        }
        .btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 12px;
        }
        .btn:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .btn-secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .btn-secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
        }
        .rule-category {
            margin-bottom: 24px;
        }
        .category-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--vscode-widget-border);
        }
        .category-title {
            font-size: 14px;
            font-weight: bold;
            margin: 0;
        }
        .category-count {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }
        .rules-grid {
            display: grid;
            gap: 12px;
        }
        .rule-card {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 6px;
            padding: 12px;
            transition: all 0.2s;
        }
        .rule-card:hover {
            border-color: var(--vscode-focusBorder);
        }
        .rule-card.enabled {
            border-left: 3px solid var(--vscode-inputValidation-infoBackground);
        }
        .rule-card.disabled {
            opacity: 0.7;
            border-left: 3px solid var(--vscode-inputValidation-warningBackground);
        }
        .rule-header {
            margin-bottom: 8px;
        }
        .rule-title-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
        }
        .rule-icon {
            font-size: 14px;
        }
        .rule-title {
            font-size: 13px;
            font-weight: bold;
            margin: 0;
            flex: 1;
        }
        .rule-toggle {
            margin-left: auto;
        }
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 20px;
        }
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--vscode-inputValidation-warningBackground);
            transition: .4s;
            border-radius: 20px;
        }
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .toggle-slider {
            background-color: var(--vscode-inputValidation-infoBackground);
        }
        input:checked + .toggle-slider:before {
            transform: translateX(20px);
        }
        .rule-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 11px;
        }
        .rule-urgency {
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
        }
        .urgency-critical {
            background: var(--vscode-inputValidation-errorBackground);
            color: var(--vscode-inputValidation-errorForeground);
        }
        .urgency-high {
            background: var(--vscode-inputValidation-warningBackground);
            color: var(--vscode-inputValidation-warningForeground);
        }
        .urgency-medium {
            background: var(--vscode-inputValidation-infoBackground);
            color: var(--vscode-inputValidation-infoForeground);
        }
        .urgency-low, .urgency-info {
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
        }
        .rule-source {
            color: var(--vscode-descriptionForeground);
        }
        .rule-content {
            margin-bottom: 12px;
        }
        .rule-description {
            font-size: 12px;
            margin: 0 0 8px 0;
            color: var(--vscode-descriptionForeground);
        }
        .rule-code {
            margin: 8px 0;
        }
        .rule-code pre {
            background: var(--vscode-textBlockQuote-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 4px;
            padding: 8px;
            margin: 4px 0;
            font-size: 11px;
            overflow-x: auto;
        }
        .rule-tags {
            display: flex;
            gap: 4px;
            margin-top: 8px;
        }
        .tag {
            font-size: 10px;
            padding: 2px 6px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border-radius: 3px;
        }
        .rule-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }
        .urgency-select {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 11px;
        }
        
        /* Custom Mode Builder Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
        }
        .modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-content {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 8px;
            padding: 24px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-widget-border);
        }
        .modal-title {
            font-size: 18px;
            font-weight: bold;
        }
        .close-btn {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: var(--vscode-foreground);
            padding: 4px;
        }
        .close-btn:hover {
            background: var(--vscode-list-hoverBackground);
            border-radius: 4px;
        }
        .form-group {
            margin-bottom: 16px;
        }
        .form-label {
            display: block;
            margin-bottom: 6px;
            font-weight: bold;
            font-size: 13px;
        }
        .form-input, .form-textarea, .form-select {
            width: 100%;
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            padding: 8px;
            font-size: 13px;
            box-sizing: border-box;
        }
        .form-textarea {
            min-height: 80px;
            resize: vertical;
        }
        .rule-checkbox-list {
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid var(--vscode-widget-border);
            border-radius: 4px;
            padding: 8px;
        }
        .rule-checkbox-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            padding: 4px;
        }
        .rule-checkbox-item:hover {
            background: var(--vscode-list-hoverBackground);
            border-radius: 4px;
        }
        .rule-checkbox {
            margin-right: 8px;
        }
        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 20px;
        }
        }
        .btn-sm {
            padding: 4px 8px;
            font-size: 11px;
        }
        .btn-danger {
            background: var(--vscode-inputValidation-errorBackground);
            color: var(--vscode-inputValidation-errorForeground);
        }
        .btn-danger:hover {
            opacity: 0.8;
        }
        .rule-footer {
            border-top: 1px solid var(--vscode-widget-border);
            padding-top: 8px;
        }
        .rule-timestamp {
            font-size: 10px;
            color: var(--vscode-descriptionForeground);
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

        <!-- Tab Navigation -->
        <div class="tab-navigation">
            <button class="tab-btn ${this.currentState.activeTab === 'modes' ? 'active' : ''}" 
                    onclick="switchTab('modes')">
                📋 Modes
            </button>
            <button class="tab-btn ${this.currentState.activeTab === 'rules' ? 'active' : ''}" 
                    onclick="switchTab('rules')" 
                    ${!isDeployed ? 'disabled' : ''}>
                ⚙️ Rules ${!isDeployed ? '(Deploy a mode first)' : ''}
            </button>
        </div>

        <!-- Modes Tab Content -->
        <div class="tab-content ${this.currentState.activeTab !== 'modes' ? 'hidden' : ''}">
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
                    <div style="margin-top: 20px; padding: 16px; border: 1px solid var(--vscode-widget-border); border-radius: 4px; background: var(--vscode-textBlockQuote-background);">
                        <div style="margin-bottom: 12px;">
                            <strong>🛠️ Create Custom Mode</strong>
                        </div>
                        <div style="font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 12px;">
                            Build a custom mode with your own rules and settings.
                        </div>
                        <button class="deploy-btn" onclick="openCustomModeBuilder()" style="background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground);">
                            🚀 Open Custom Mode Builder
                        </button>
                    </div>
                </div>
            `}
        </div>

        <!-- Rules Tab Content -->
        <div class="tab-content ${this.currentState.activeTab !== 'rules' ? 'hidden' : ''}">
            ${this.generateRulesHTML()}
        </div>
    ` : ''}

    <!-- Custom Mode Builder Modal -->
    <div id="customModeBuilderModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Custom Mode Builder</h2>
                <button class="close-btn" onclick="closeCustomModeBuilder()">&times;</button>
            </div>
            <form id="customModeForm">
                <div class="form-group">
                    <label class="form-label" for="mode-name-input">Mode Name *</label>
                    <input type="text" id="mode-name-input" class="form-input" placeholder="Enter mode name" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="mode-description-input">Description *</label>
                    <textarea id="mode-description-input" class="form-textarea" placeholder="Describe your custom mode" required></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="target-project-input">Target Project Type</label>
                    <select id="target-project-input" class="form-select">
                        <option value="general">General</option>
                        <option value="web">Web Development</option>
                        <option value="mobile">Mobile Development</option>
                        <option value="backend">Backend Development</option>
                        <option value="data">Data Science</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Select Rules</label>
                    <div id="rulesCheckboxList" class="rule-checkbox-list">
                        <!-- Rules will be populated here dynamically -->
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeCustomModeBuilder()">Cancel</button>
                    <button type="submit" class="btn">Create Custom Mode</button>
                </div>
            </form>
        </div>
    </div>

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

        function switchTab(tab) {
            console.log('🎯 [Webview] switchTab called with:', tab);
            vscode.postMessage({ type: 'switchTab', tab: tab });
        }

        // Rule management functions
        function loadRules() {
            console.log('🎯 [Webview] loadRules called');
            vscode.postMessage({ type: 'loadRules' });
        }

        function toggleRule(ruleId) {
            vscode.postMessage({ type: 'toggleRule', ruleId: ruleId });
        }

        function updateRuleUrgency(ruleId, urgency) {
            vscode.postMessage({ type: 'updateRuleUrgency', ruleId: ruleId, urgency: urgency });
        }

        function filterRules(filter) {
            vscode.postMessage({ type: 'filterRules', filter: filter });
        }

        function showAddRuleModal() {
            // TODO: Implement add rule modal
            vscode.postMessage({ type: 'addRule', rule: {} });
        }

        function removeRule(ruleId) {
            if (confirm('Are you sure you want to remove this rule?')) {
                vscode.postMessage({ type: 'removeRule', ruleId: ruleId });
            }
        }

        function exportRules(ruleIds) {
            vscode.postMessage({ type: 'exportRules', ruleIds: ruleIds });
        }

        function importRules() {
            vscode.postMessage({ type: 'importRules' });
        }

        function bulkEnable() {
            vscode.postMessage({ type: 'bulkOperation', operation: { type: 'enable', ruleIds: [] } });
        }

        function bulkDisable() {
            vscode.postMessage({ type: 'bulkOperation', operation: { type: 'disable', ruleIds: [] } });
        }

        // Custom Mode Builder functions
        function openCustomModeBuilder() {
            console.log('🎯 [Webview] Opening Custom Mode Builder modal');
            const modal = document.getElementById('customModeBuilderModal');
            if (modal) {
                modal.classList.add('show');
                loadAvailableRules();
            }
        }

        function closeCustomModeBuilder() {
            console.log('🎯 [Webview] Closing Custom Mode Builder modal');
            const modal = document.getElementById('customModeBuilderModal');
            if (modal) {
                modal.classList.remove('show');
                // Clear form
                document.getElementById('customModeForm').reset();
            }
        }

        function loadAvailableRules() {
            console.log('📋 [Webview] Loading available rules for Custom Mode Builder');
            vscode.postMessage({ type: 'loadAvailableRules' });
        }

        function populateRulesCheckboxList(rules) {
            const container = document.getElementById('rulesCheckboxList');
            if (!container || !rules) return;
            
            container.innerHTML = '';
            rules.forEach(rule => {
                const item = document.createElement('div');
                item.className = 'rule-checkbox-item';
                item.innerHTML = \`
                    <input type="checkbox" id="rule-\${rule.id}" class="rule-checkbox" value="\${rule.id}">
                    <label for="rule-\${rule.id}">
                        <strong>\${rule.title}</strong>
                        <br><small>\${rule.description || 'No description'}</small>
                    </label>
                \`;
                container.appendChild(item);
            });
        }

        // Handle custom mode form submission
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('customModeForm');
            if (form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const formData = new FormData(form);
                    const selectedRules = Array.from(document.querySelectorAll('.rule-checkbox:checked'))
                        .map(checkbox => checkbox.value);
                    
                    const customModeData = {
                        name: document.getElementById('mode-name-input').value,
                        description: document.getElementById('mode-description-input').value,
                        targetProject: document.getElementById('target-project-input').value,
                        selectedRules: selectedRules
                    };
                    
                    console.log('🚀 [Webview] Submitting custom mode:', customModeData);
                    vscode.postMessage({ 
                        type: 'createCustomMode', 
                        customModeData: customModeData 
                    });
                    
                    closeCustomModeBuilder();
                });
            }
        });

        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            console.log('📨 [Webview] Received message:', message);
            
            switch (message.type) {
                case 'openCustomModeBuilder':
                    openCustomModeBuilder();
                    break;
                case 'populateAvailableRules':
                    populateRulesCheckboxList(message.rules);
                    break;
                case 'closeCustomModeBuilder':
                    closeCustomModeBuilder();
                    break;
                case 'showError':
                    alert('Error: ' + message.error);
                    break;
                case 'showSuccess':
                    alert('Success: ' + message.message);
                    break;
            }
        });

        // Auto-refresh every 10 seconds
        setInterval(refreshState, 10000);
    </script>
</body>
</html>`;
    }

    private generateRulesHTML(): string {
        console.log('🏗️ generateRulesHTML: Starting HTML generation...');
        const { currentRuleSet, ruleFilter } = this.currentState;
        
        console.log('📊 generateRulesHTML: Input data:', {
            hasCurrentRuleSet: !!currentRuleSet,
            ruleCount: currentRuleSet?.rules?.length || 0,
            ruleSetDetails: currentRuleSet ? {
                mode: currentRuleSet.mode,
                totalRules: currentRuleSet.totalRules,
                enabledRules: currentRuleSet.enabledRules,
                rulesArrayLength: currentRuleSet.rules.length
            } : null,
            hasRuleFilter: !!ruleFilter
        });
        
        if (!currentRuleSet) {
            console.log('❌ generateRulesHTML: No currentRuleSet, returning empty state');
            return `
                <div class="rules-container">
                    <div class="empty-state">
                        <h3>No Rules Loaded</h3>
                        <p>Deploy a mode first to see available rules</p>
                        <p style="font-size: 11px; color: var(--vscode-descriptionForeground);">Debug: currentRuleSet is null</p>
                    </div>
                </div>
            `;
        }

        console.log('✅ generateRulesHTML: currentRuleSet exists, processing rules...');

        // Apply filters
        let filteredRules = currentRuleSet.rules;
        console.log('🔍 generateRulesHTML: Initial rules count:', filteredRules.length);
        
        if (ruleFilter) {
            console.log('🔍 generateRulesHTML: Applying filters:', ruleFilter);
            filteredRules = filteredRules.filter(rule => {
                if (ruleFilter.categories && ruleFilter.categories.length > 0 && !ruleFilter.categories.includes(rule.category)) return false;
                if (ruleFilter.urgencies && ruleFilter.urgencies.length > 0 && !ruleFilter.urgencies.includes(rule.urgency)) return false;
                if (ruleFilter.enabled !== undefined && rule.isEnabled !== ruleFilter.enabled) return false;
                if (ruleFilter.searchText) {
                    const searchLower = ruleFilter.searchText.toLowerCase();
                    return rule.title.toLowerCase().includes(searchLower) || 
                           rule.description.toLowerCase().includes(searchLower);
                }
                return true;
            });
            console.log('🔍 generateRulesHTML: Filtered rules count:', filteredRules.length);
        }

        // Group rules by category
        const rulesByCategory = filteredRules.reduce((acc, rule) => {
            if (!acc[rule.category]) acc[rule.category] = [];
            acc[rule.category].push(rule);
            return acc;
        }, {} as Record<string, typeof filteredRules>);

        console.log('📂 generateRulesHTML: Rules grouped by category:', Object.keys(rulesByCategory).map(cat => ({
            category: cat,
            count: rulesByCategory[cat].length
        })));

        const html = `
            <div class="rules-container">
                <div class="rules-header">
                    <div class="rules-stats">
                        <span class="stat">
                            <strong>${currentRuleSet.rules.length}</strong> Total Rules
                        </span>
                        <span class="stat">
                            <strong>${currentRuleSet.rules.filter(r => r.isEnabled).length}</strong> Active
                        </span>
                        <span class="stat">
                            <strong>${Object.keys(rulesByCategory).length}</strong> Categories
                        </span>
                    </div>
                    
                    <div class="rules-filters">
                        <input type="text" placeholder="Search rules..." class="search-input" 
                               value="${ruleFilter?.searchText || ''}" 
                               onchange="filterRules({ searchText: this.value })">
                        
                        <select class="filter-select" onchange="filterRules({ categories: this.value ? [this.value] : undefined })">
                            <option value="">All Categories</option>
                            <option value="${RuleCategory.CODING_STANDARDS}" ${ruleFilter?.categories?.includes(RuleCategory.CODING_STANDARDS) ? 'selected' : ''}>Coding Standards</option>
                            <option value="${RuleCategory.WORKFLOW}" ${ruleFilter?.categories?.includes(RuleCategory.WORKFLOW) ? 'selected' : ''}>Workflow</option>
                            <option value="${RuleCategory.SECURITY}" ${ruleFilter?.categories?.includes(RuleCategory.SECURITY) ? 'selected' : ''}>Security</option>
                            <option value="${RuleCategory.TESTING}" ${ruleFilter?.categories?.includes(RuleCategory.TESTING) ? 'selected' : ''}>Testing</option>
                            <option value="${RuleCategory.DOCUMENTATION}" ${ruleFilter?.categories?.includes(RuleCategory.DOCUMENTATION) ? 'selected' : ''}>Documentation</option>
                            <option value="${RuleCategory.DEPLOYMENT}" ${ruleFilter?.categories?.includes(RuleCategory.DEPLOYMENT) ? 'selected' : ''}>Deployment</option>
                            <option value="${RuleCategory.PERFORMANCE}" ${ruleFilter?.categories?.includes(RuleCategory.PERFORMANCE) ? 'selected' : ''}>Performance</option>
                            <option value="${RuleCategory.CUSTOM}" ${ruleFilter?.categories?.includes(RuleCategory.CUSTOM) ? 'selected' : ''}>Custom</option>
                        </select>
                        
                        <select class="filter-select" onchange="filterRules({ urgencies: this.value ? [this.value] : undefined })">
                            <option value="">All Urgency</option>
                            <option value="${RuleUrgency.CRITICAL}" ${ruleFilter?.urgencies?.includes(RuleUrgency.CRITICAL) ? 'selected' : ''}>Critical</option>
                            <option value="${RuleUrgency.HIGH}" ${ruleFilter?.urgencies?.includes(RuleUrgency.HIGH) ? 'selected' : ''}>High</option>
                            <option value="${RuleUrgency.MEDIUM}" ${ruleFilter?.urgencies?.includes(RuleUrgency.MEDIUM) ? 'selected' : ''}>Medium</option>
                            <option value="${RuleUrgency.LOW}" ${ruleFilter?.urgencies?.includes(RuleUrgency.LOW) ? 'selected' : ''}>Low</option>
                            <option value="${RuleUrgency.INFO}" ${ruleFilter?.urgencies?.includes(RuleUrgency.INFO) ? 'selected' : ''}>Info</option>
                        </select>
                        
                        <select class="filter-select" onchange="filterRules({ enabled: this.value === '' ? undefined : this.value === 'true' })">
                            <option value="">All Status</option>
                            <option value="true" ${ruleFilter?.enabled === true ? 'selected' : ''}>Enabled</option>
                            <option value="false" ${ruleFilter?.enabled === false ? 'selected' : ''}>Disabled</option>
                        </select>
                    </div>
                    
                    <div class="rules-actions">
                        <button class="btn btn-primary" onclick="showAddRuleModal()">
                            <span class="icon">➕</span> Add Rule
                        </button>
                        <button class="btn btn-secondary" onclick="exportRules()">
                            <span class="icon">📤</span> Export
                        </button>
                        <button class="btn btn-secondary" onclick="importRules()">
                            <span class="icon">📥</span> Import
                        </button>
                    </div>
                </div>

                <div class="rules-content">
                    ${Object.entries(rulesByCategory).map(([category, rules]) => `
                        <div class="rule-category">
                            <div class="category-header">
                                <h3 class="category-title">${this.formatCategoryName(category as RuleCategory)}</h3>
                                <span class="category-count">${rules.length} rules</span>
                            </div>
                            
                            <div class="rules-grid">
                                ${rules.map(rule => this.generateRuleCard(rule)).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        console.log('✅ generateRulesHTML: HTML generation completed, length:', html.length);
        return html;
    }

    private generateRuleCard(rule: Rule): string {
        const urgencyClass = `urgency-${rule.urgency}`;
        const categoryIcon = this.getCategoryIcon(rule.category);
        
        return `
            <div class="rule-card ${rule.isEnabled ? 'enabled' : 'disabled'}">
                <div class="rule-header">
                    <div class="rule-title-row">
                        <span class="rule-icon">${categoryIcon}</span>
                        <h4 class="rule-title">${rule.title}</h4>
                        <div class="rule-toggle">
                            <label class="toggle-switch">
                                <input type="checkbox" ${rule.isEnabled ? 'checked' : ''} 
                                       onchange="toggleRule('${rule.id}')">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="rule-meta">
                        <span class="rule-urgency ${urgencyClass}">${rule.urgency.toUpperCase()}</span>
                        <span class="rule-source">${rule.source.file}</span>
                    </div>
                </div>
                
                <div class="rule-content">
                    <p class="rule-description">${rule.description}</p>
                    
                    <div class="rule-code">
                        <strong>Content:</strong>
                        <pre><code>${rule.content}</code></pre>
                    </div>
                    
                    ${rule.tags && rule.tags.length > 0 ? `
                        <div class="rule-tags">
                            ${rule.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="rule-actions">
                    <select class="urgency-select" onchange="updateRuleUrgency('${rule.id}', this.value)">
                        <option value="${RuleUrgency.CRITICAL}" ${rule.urgency === RuleUrgency.CRITICAL ? 'selected' : ''}>Critical</option>
                        <option value="${RuleUrgency.HIGH}" ${rule.urgency === RuleUrgency.HIGH ? 'selected' : ''}>High</option>
                        <option value="${RuleUrgency.MEDIUM}" ${rule.urgency === RuleUrgency.MEDIUM ? 'selected' : ''}>Medium</option>
                        <option value="${RuleUrgency.LOW}" ${rule.urgency === RuleUrgency.LOW ? 'selected' : ''}>Low</option>
                        <option value="${RuleUrgency.INFO}" ${rule.urgency === RuleUrgency.INFO ? 'selected' : ''}>Info</option>
                    </select>
                    
                    <button class="btn btn-sm btn-secondary" onclick="editRule('${rule.id}')">
                        <span class="icon">✏️</span> Edit
                    </button>
                    
                    <button class="btn btn-sm btn-danger" onclick="removeRule('${rule.id}')">
                        <span class="icon">🗑️</span> Remove
                    </button>
                </div>
                
                <div class="rule-footer">
                    <span class="rule-timestamp">
                        Created: ${new Date(rule.createdAt).toLocaleDateString()}
                        ${rule.modifiedAt !== rule.createdAt ? `| Modified: ${new Date(rule.modifiedAt).toLocaleDateString()}` : ''}
                    </span>
                </div>
            </div>
        `;
    }

    private formatCategoryName(category: RuleCategory): string {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    private getCategoryIcon(category: RuleCategory): string {
        const icons = {
            [RuleCategory.CODING_STANDARDS]: '📝',
            [RuleCategory.WORKFLOW]: '⚡',
            [RuleCategory.SECURITY]: '🔒',
            [RuleCategory.TESTING]: '🧪',
            [RuleCategory.DOCUMENTATION]: '📚',
            [RuleCategory.DEPLOYMENT]: '🚀',
            [RuleCategory.PERFORMANCE]: '⚡',
            [RuleCategory.ARCHITECTURE]: '🏗️',
            [RuleCategory.UI_UX]: '🎨',
            [RuleCategory.CUSTOM]: '🔧'
        };
        return icons[category] || '🔧';
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

    private async handleDeployCustomMode(customModeData: any) {
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
    private async handleLoadAvailableRules(): Promise<void> {
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
    private async handleCreateCustomMode(customModeData: any): Promise<void> {
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

    dispose() {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
    }
}
