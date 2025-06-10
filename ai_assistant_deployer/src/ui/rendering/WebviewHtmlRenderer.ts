import { Rule, RuleSet, RuleFilter, RuleCategory, RuleUrgency } from '../../services/ruleTypes';
import { ModeInfo } from '../../services/modeDiscovery';

export interface UIState {
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

/**
 * WebviewHtmlRenderer - Responsible for generating all HTML content for the webview
 * 
 * This service follows the Single Responsibility Principle by focusing solely on
 * HTML generation and rendering logic, extracted from the monolithic webview provider.
 * 
 * Responsibilities:
 * - Generate main webview HTML structure
 * - Generate rules HTML content
 * - Generate individual rule cards
 * - Format category names and provide category icons
 * - Handle CSS styling and JavaScript injection
 */
export class WebviewHtmlRenderer {
    
    /**
     * Generates the complete HTML content for the webview
     * @param state Current UI state containing all necessary data
     * @returns Complete HTML string for the webview
     */
    generateWebviewHTML(state: UIState): string {
        const { isLoading, availableModes, currentMode, isDeployed, error } = state;

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Assistant Deployer</title>
    <style>
        ${this.generateCSS()}
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
            <button class="tab-btn ${state.activeTab === 'modes' ? 'active' : ''}" 
                    onclick="switchTab('modes')">
                📋 Modes
            </button>
            <button class="tab-btn ${state.activeTab === 'rules' ? 'active' : ''}" 
                    onclick="switchTab('rules')" 
                    ${!isDeployed ? 'disabled' : ''}>
                ⚙️ Rules ${!isDeployed ? '(Deploy a mode first)' : ''}
            </button>
        </div>

        <!-- Modes Tab Content -->
        <div class="tab-content ${state.activeTab !== 'modes' ? 'hidden' : ''}">
            ${this.generateModesContent(state)}
        </div>

        <!-- Rules Tab Content -->
        <div class="tab-content ${state.activeTab !== 'rules' ? 'hidden' : ''}">
            ${this.generateRulesHTML(state)}
        </div>
    ` : ''}

    <!-- Custom Mode Builder Modal -->
    ${this.generateCustomModeBuilderModal()}

    <script>
        ${this.generateJavaScript()}
    </script>
</body>
</html>`;
    }

    /**
     * Generates the CSS styles for the webview
     * @returns CSS string
     */
    private generateCSS(): string {
        return `
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
        `;
    }

    /**
     * Generates the modes tab content
     * @param state Current UI state
     * @returns HTML string for modes content
     */
    private generateModesContent(state: UIState): string {
        const { availableModes, isDeployed } = state;

        if (isDeployed) {
            return `
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
            `;
        }

        return `
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
        `;
    }

    /**
     * Generates the rules HTML content
     * @param state Current UI state containing rule data
     * @returns HTML string for rules content
     */
    generateRulesHTML(state: UIState): string {
        console.log('🏗️ generateRulesHTML: Starting HTML generation...');
        const { currentRuleSet, ruleFilter } = state;
        
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

    /**
     * Generates HTML for an individual rule card
     * @param rule Rule data
     * @returns HTML string for the rule card
     */
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

    /**
     * Generates the custom mode builder modal HTML
     * @returns HTML string for the modal
     */
    private generateCustomModeBuilderModal(): string {
        return `
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
        `;
    }

    /**
     * Generates the JavaScript code for the webview
     * @returns JavaScript string
     */
    private generateJavaScript(): string {
        return `
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
        `;
    }

    /**
     * Formats a category name for display
     * @param category Rule category enum value
     * @returns Formatted category name
     */
    private formatCategoryName(category: RuleCategory): string {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    /**
     * Gets the icon for a rule category
     * @param category Rule category
     * @returns Icon string for the category
     */
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
}
