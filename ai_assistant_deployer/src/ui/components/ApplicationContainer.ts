/**
 * Application Container Component
 * Main orchestrator for the modular UI system
 */

import { BaseUIComponent, ComponentRegistry } from './BaseComponent';
import { ModeSelectorComponent } from './ModeSelectorComponent';
import { RuleManagerComponent } from './RuleManagerComponent';
import { UIStateManager } from '../state/StateManager';
import { actionCreators } from '../state/actions/ActionCreators';
import { ModeSelectorProps, RuleManagerProps } from '../types/ComponentTypes';

export class ApplicationContainer extends BaseUIComponent {
    private componentRegistry: ComponentRegistry;
    private modeSelector: ModeSelectorComponent;
    private ruleManager: RuleManagerComponent;

    constructor(stateManager: UIStateManager) {
        super(stateManager);
        
        this.componentRegistry = new ComponentRegistry();
        
        // Initialize child components with proper props
        const modeSelectorProps: ModeSelectorProps = {
            state: stateManager.getState(),
            onAction: (action) => this.handleComponentAction(action),
            showSearch: true,
            allowMultiSelect: true
        };
        
        const ruleManagerProps: RuleManagerProps = {
            state: stateManager.getState(),
            onAction: (action) => this.handleComponentAction(action),
            showFilters: true,
            allowBulkOperations: true
        };
        
        this.modeSelector = new ModeSelectorComponent(stateManager, modeSelectorProps);
        this.ruleManager = new RuleManagerComponent(stateManager, ruleManagerProps);
        
        // Register components
        this.componentRegistry.register('modeSelector', this.modeSelector);
        this.componentRegistry.register('ruleManager', this.ruleManager);
    }

    private handleComponentAction(action: any): void {
        // Delegate to parent action handler or handle locally
        if (this.props?.onAction) {
            this.props.onAction(action);
        }
    }

    render(): string {
        const { state } = this.props;
        const { activeTab, successMessage, error } = state;

        return `
            <div class="application-container">
                ${this.renderHeader()}
                ${this.renderGlobalMessages()}
                ${this.renderTabNavigation()}
                ${this.renderMainContent()}
                ${this.renderFooter()}
            </div>
        `;
    }

    private renderHeader(): string {
        const { state } = this.props;
        const { currentMode, isDeployed } = state;

        return `
            <header class="app-header">
                <div class="header-content">
                    <div class="app-title">
                        <h1>🚀 AI Assistant Deployer</h1>
                        <p class="app-subtitle">Modular Deployment Management</p>
                    </div>
                    <div class="header-status">
                        ${this.renderDeploymentStatus()}
                    </div>
                </div>
            </header>
        `;
    }

    private renderDeploymentStatus(): string {
        const { state } = this.props;
        const { currentMode, isDeployed, isDeploying } = state;

        if (isDeploying) {
            return `
                <div class="status-indicator deploying">
                    <div class="status-spinner"></div>
                    <span>Deploying...</span>
                </div>
            `;
        }

        if (currentMode && isDeployed) {
            return `
                <div class="status-indicator deployed">
                    <span class="status-icon">✅</span>
                    <span>Deployed: ${currentMode}</span>
                </div>
            `;
        }

        return `
            <div class="status-indicator idle">
                <span class="status-icon">⚪</span>
                <span>No active deployment</span>
            </div>
        `;
    }

    private renderGlobalMessages(): string {
        const { state } = this.props;
        const { error, successMessage } = state;

        if (!error && !successMessage) return '';

        return `
            <div class="global-messages">
                ${error ? this.createAlert(error, 'error') : ''}
                ${successMessage ? this.createAlert(successMessage, 'success') : ''}
            </div>
        `;
    }

    private renderTabNavigation(): string {
        const { state } = this.props;
        const { activeTab } = state;

        const tabs = [
            { id: 'modes', label: '📦 Modes', active: activeTab === 'modes' },
            { id: 'rules', label: '📋 Rules', active: activeTab === 'rules' },
            { id: 'custom', label: '🔧 Custom Builder', active: activeTab === 'custom' }
        ];

        return this.createTabNavigation(tabs, 'switchTab');
    }

    private renderMainContent(): string {
        const { state } = this.props;
        const { activeTab } = state;

        switch (activeTab) {
            case 'modes':
                return `
                    <main class="main-content">
                        <div class="content-section">
                            ${this.componentRegistry.render('modeSelector')}
                        </div>
                    </main>
                `;

            case 'rules':
                return `
                    <main class="main-content">
                        <div class="content-section">
                            ${this.componentRegistry.render('ruleManager')}
                        </div>
                    </main>
                `;

            case 'custom':
                return `
                    <main class="main-content">
                        <div class="content-section">
                            ${this.renderCustomModeBuilder()}
                        </div>
                    </main>
                `;

            default:
                return this.renderErrorContent('Unknown tab selected');
        }
    }

    private renderCustomModeBuilder(): string {
        const { state } = this.props;
        const { customModeBuilder } = state;

        return `
            <div class="custom-mode-builder">
                <div class="builder-header">
                    <h2>🔧 Custom Mode Builder</h2>
                    <p>Create your own deployment mode by selecting rules and configurations.</p>
                </div>
                
                <div class="builder-content">
                    <div class="builder-form">
                        <div class="form-group">
                            <label for="modeName">Mode Name:</label>
                            <input 
                                type="text" 
                                id="modeName"
                                value="${customModeBuilder.modeName}"
                                placeholder="Enter mode name..."
                                oninput="sendMessage('updateCustomMode', { modeName: this.value })"
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="modeDescription">Description:</label>
                            <textarea 
                                id="modeDescription"
                                placeholder="Describe your custom mode..."
                                oninput="sendMessage('updateCustomMode', { modeDescription: this.value })"
                            >${customModeBuilder.modeDescription}</textarea>
                        </div>
                    </div>
                    
                    <div class="rule-selector">
                        <h3>Select Rules</h3>
                        <div class="rule-categories">
                            ${this.renderRuleCategorySelector()}
                        </div>
                    </div>
                    
                    <div class="builder-preview">
                        <h3>Preview</h3>
                        <div class="preview-content">
                            ${this.renderCustomModePreview()}
                        </div>
                    </div>
                </div>
                
                <div class="builder-actions">
                    <button 
                        class="btn btn-secondary"
                        onclick="sendMessage('resetCustomMode')"
                    >
                        Reset
                    </button>
                    <button 
                        class="btn btn-primary"
                        onclick="sendMessage('saveCustomMode')"
                        ${!customModeBuilder.modeName ? 'disabled' : ''}
                    >
                        Save Mode
                    </button>
                    <button 
                        class="btn btn-success"
                        onclick="sendMessage('deployCustomMode')"
                        ${!customModeBuilder.modeName ? 'disabled' : ''}
                    >
                        Save & Deploy
                    </button>
                </div>
            </div>
        `;
    }

    private renderRuleCategorySelector(): string {
        const categories = ['core', 'development', 'enterprise', 'operations'];
        
        return categories.map(category => `
            <div class="category-selector">
                <h4>${category.charAt(0).toUpperCase() + category.slice(1)} Rules</h4>
                <div class="rule-checkboxes">
                    <!-- Rule checkboxes would be dynamically generated here -->
                    <p class="placeholder">Loading ${category} rules...</p>
                </div>
            </div>
        `).join('');
    }

    private renderCustomModePreview(): string {
        const { state } = this.props;
        const { customModeBuilder } = state;
        
        if (!customModeBuilder.modeName) {
            return '<p class="preview-placeholder">Enter a mode name to see preview</p>';
        }

        return `
            <div class="mode-preview-card">
                <h4>${customModeBuilder.modeName}</h4>
                <p>${customModeBuilder.modeDescription || 'No description provided'}</p>
                <div class="preview-stats">
                    <span>Selected Rules: ${customModeBuilder.selectedRules.length}</span>
                </div>
            </div>
        `;
    }

    private renderFooter(): string {
        const { state } = this.props;
        const { lastUpdated } = state;

        return `
            <footer class="app-footer">
                <div class="footer-content">
                    <div class="footer-info">
                        <span>Last updated: ${lastUpdated.toLocaleTimeString()}</span>
                    </div>
                    <div class="footer-actions">
                        <button 
                            class="btn btn-sm btn-outline"
                            onclick="sendMessage('refreshAll')"
                        >
                            🔄 Refresh All
                        </button>
                        <button 
                            class="btn btn-sm btn-outline"
                            onclick="sendMessage('openSettings')"
                        >
                            ⚙️ Settings
                        </button>
                    </div>
                </div>
            </footer>
        `;
    }

    private renderErrorContent(message: string): string {
        return `
            <main class="main-content">
                <div class="error-content">
                    <h2>⚠️ Error</h2>
                    <p>${message}</p>
                    <button 
                        class="btn btn-primary"
                        onclick="sendMessage('switchTab', 'modes')"
                    >
                        Go to Modes
                    </button>
                </div>
            </main>
        `;
    }

    async handleMessage(message: any): Promise<void> {
        const { type, data } = message;

        // Handle global actions
        switch (type) {
            case 'switchTab':
                this.props.onAction(actionCreators.navigation.switchTab(data));
                break;

            case 'clearMessages':
                this.props.onAction(actionCreators.messages.clearMessages());
                break;

            case 'refreshAll':
                await this.handleRefreshAll();
                break;

            case 'updateCustomMode':
                this.props.onAction(actionCreators.customMode.updateCustomMode(data));
                break;

            default:
                // Delegate to child components
                await this.delegateToChildComponents(message);
                break;
        }
    }

    private async handleRefreshAll(): Promise<void> {
        this.props.onAction(actionCreators.loading.setLoading(true));
        
        try {
            // Refresh all data sources
            this.props.onAction(actionCreators.messages.setSuccess('All data refreshed successfully'));
        } catch (error) {
            this.props.onAction(actionCreators.messages.setError(`Refresh failed: ${error}`));
        } finally {
            this.props.onAction(actionCreators.loading.setLoading(false));
        }
    }

    private async delegateToChildComponents(message: any): Promise<void> {
        const { activeTab } = this.props.state;
        
        switch (activeTab) {
            case 'modes':
                await this.componentRegistry.handleMessage('modeSelector', message);
                break;
                
            case 'rules':
                await this.componentRegistry.handleMessage('ruleManager', message);
                break;
        }
    }

    dispose(): void {
        super.dispose();
        this.componentRegistry.disposeAll();
    }
}
