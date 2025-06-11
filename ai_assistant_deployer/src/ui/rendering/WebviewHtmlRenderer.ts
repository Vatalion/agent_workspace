/**
 * Modern WebView HTML Renderer for Modular UI System
 * Generates responsive, accessible HTML with modern CSS and reactive JavaScript
 */

import * as vscode from 'vscode';
import { UIState } from '../state/UIState';
import { RuleCategory, RuleUrgency, Rule } from '../../services/ruleTypes';

export class WebviewHtmlRenderer {
    
    /**
     * Render the complete HTML page with modern styling and reactive features
     */
    renderFullPage(componentHtml: string, extensionUri: vscode.Uri): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Assistant Deployer</title>
    <style>
        ${this.generateModernCSS()}
    </style>
</head>
<body>
    ${componentHtml}
    <script>
        ${this.generateReactiveJavaScript()}
    </script>
</body>
</html>`;
    }

    /**
     * Render error page
     */
    renderErrorPage(error: any): string {
        const errorMessage = error?.message || error || 'Unknown error occurred';
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - AI Assistant Deployer</title>
    <style>
        ${this.generateErrorPageCSS()}
    </style>
</head>
<body>
    <div class="error-page">
        <div class="error-icon">⚠️</div>
        <h1>Something went wrong</h1>
        <p class="error-message">${errorMessage}</p>
        <button onclick="sendMessage('refreshAll')" class="retry-btn">
            🔄 Try Again
        </button>
    </div>
    <script>
        ${this.generateBasicJavaScript()}
    </script>
</body>
</html>`;
    }

    /**
     * Render application UI based on current state
     */
    renderApplicationUI(state: UIState): string {
        const { isLoading, error, availableModes, isDeployed, currentMode } = state;
        
        return `<div class="application-container">
        <div class="app-header">
            <div class="header-content">
                <div class="app-title">
                    <h1>🚀 AI Assistant Deployer</h1>
                    <p class="app-subtitle">Deploy and manage AI assistant configurations</p>
                </div>
                <div class="header-controls">
                    <button class="refresh-btn" onclick="refreshState()" ${isLoading ? 'disabled' : ''}>
                        ${isLoading ? '<span class="spinner"></span>' : '🔄'} Refresh
                    </button>
                </div>
            </div>
        </div>
        
        ${error ? `<div class="error">⚠️ ${error}</div>` : ''}
        
        ${isLoading ? `
            <div class="loading-overlay">
                <div class="loading-spinner"></div>
                <p>Loading assistant configurations...</p>
            </div>
        ` : ''}
        
        ${!isLoading ? `
            <div class="status-section">
                <div class="status-badge ${isDeployed ? 'status-deployed' : 'status-not-deployed'}">
                    ${isDeployed ? '✅' : '❌'}
                    ${isDeployed ? 'Deployed' : 'Not Deployed'}
                </div>
                ${isDeployed && currentMode ? `
                    <div><strong>Active Mode:</strong> ${availableModes.find(m => m.id === currentMode)?.name || currentMode}</div>
                ` : ''}
            </div>
            
            <div class="tab-navigation">
                <button class="tab-btn ${state.activeTab === 'modes' ? 'active' : ''}"
                        onclick="switchTab('modes')">
                    🎯 Modes
                </button>
                <button class="tab-btn ${state.activeTab === 'rules' ? 'active' : ''}"
                        onclick="switchTab('rules')"
                        ${!isDeployed ? 'disabled' : ''}>
                    ⚙️ Rules ${!isDeployed ? '(Deploy a mode first)' : ''}
                </button>
            </div>
            
            <div class="tab-content ${state.activeTab !== 'modes' ? 'hidden' : ''}">
                ${this.generateModesContent(state)}
            </div>
            
            <div class="tab-content ${state.activeTab !== 'rules' ? 'hidden' : ''}">
                ${this.generateRulesHTML(state)}
            </div>
        ` : ''}
    </div>
    
    ${this.generateCustomModeBuilderModal()}`;
    }

    /**
     * Generate modern CSS with VS Code theme integration
     */
    private generateModernCSS(): string {
        return `
        /* VS Code Theme Variables */
        :root {
            --vscode-font-family: var(--vscode-font-family);
            --vscode-font-size: var(--vscode-font-size);
            --vscode-editor-background: var(--vscode-editor-background);
            --vscode-editor-foreground: var(--vscode-editor-foreground);
            --vscode-button-background: var(--vscode-button-background);
            --vscode-button-foreground: var(--vscode-button-foreground);
            --vscode-button-hoverBackground: var(--vscode-button-hoverBackground);
            --vscode-input-background: var(--vscode-input-background);
            --vscode-input-foreground: var(--vscode-input-foreground);
            --vscode-input-border: var(--vscode-input-border);
            --vscode-list-activeSelectionBackground: var(--vscode-list-activeSelectionBackground);
            --vscode-list-hoverBackground: var(--vscode-list-hoverBackground);
            --vscode-badge-background: var(--vscode-badge-background);
            --vscode-badge-foreground: var(--vscode-badge-foreground);
            --vscode-notificationsErrorIcon-foreground: var(--vscode-notificationsErrorIcon-foreground);
            --vscode-notificationsWarningIcon-foreground: var(--vscode-notificationsWarningIcon-foreground);
            --vscode-notificationsInfoIcon-foreground: var(--vscode-notificationsInfoIcon-foreground);
            
            /* Custom properties */
            --border-radius: 6px;
            --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            --transition: all 0.2s ease;
            --spacing-xs: 4px;
            --spacing-sm: 8px;
            --spacing-md: 16px;
            --spacing-lg: 24px;
            --spacing-xl: 32px;
        }

        /* Reset and Base Styles */
        * {
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 0;
            line-height: 1.5;
        }

        /* Application Container */
        .application-container {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            max-width: 100%;
            overflow-x: hidden;
        }

        /* Header Styles */
        .app-header {
            background: var(--vscode-editor-background);
            border-bottom: 1px solid var(--vscode-input-border);
            padding: var(--spacing-md);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }

        .app-title h1 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
        }

        .app-subtitle {
            margin: 0;
            opacity: 0.7;
            font-size: 0.9rem;
        }

        /* Button Styles */
        .refresh-btn, .deploy-btn, .stop-btn, .retry-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--border-radius);
            cursor: pointer;
            font-size: 0.9rem;
            transition: var(--transition);
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-xs);
        }

        .refresh-btn:hover, .deploy-btn:hover, .stop-btn:hover, .retry-btn:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .refresh-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Status and Error Styles */
        .status-section {
            padding: var(--spacing-md);
            text-align: center;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-xs);
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--border-radius);
            font-weight: 600;
            margin-bottom: var(--spacing-sm);
        }

        .status-deployed {
            background: rgba(0, 128, 0, 0.1);
            color: #00b300;
        }

        .status-not-deployed {
            background: rgba(128, 128, 128, 0.1);
            opacity: 0.7;
        }

        .error {
            background: rgba(255, 0, 0, 0.1);
            color: var(--vscode-notificationsErrorIcon-foreground);
            padding: var(--spacing-md);
            border-radius: var(--border-radius);
            margin: var(--spacing-md);
            text-align: center;
        }

        /* Tab Navigation */
        .tab-navigation {
            display: flex;
            background: var(--vscode-editor-background);
            border-bottom: 1px solid var(--vscode-input-border);
            padding: 0 var(--spacing-md);
        }

        .tab-btn {
            background: transparent;
            border: none;
            color: var(--vscode-editor-foreground);
            padding: var(--spacing-md) var(--spacing-lg);
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: var(--transition);
            font-size: 0.9rem;
        }

        .tab-btn:hover {
            background: var(--vscode-list-hoverBackground);
        }

        .tab-btn.active {
            border-bottom-color: var(--vscode-button-background);
            background: var(--vscode-list-activeSelectionBackground);
        }

        .tab-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Tab Content */
        .tab-content {
            padding: var(--spacing-lg);
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }

        .tab-content.hidden {
            display: none;
        }

        /* Loading States */
        .loading-overlay {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-xl);
            text-align: center;
        }

        .loading-spinner, .spinner {
            width: 24px;
            height: 24px;
            border: 2px solid transparent;
            border-top: 2px solid var(--vscode-button-background);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Mode Cards */
        .modes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: var(--spacing-md);
            margin-top: var(--spacing-md);
        }

        .mode-card {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: var(--border-radius);
            padding: var(--spacing-md);
            cursor: pointer;
            transition: var(--transition);
        }

        .mode-card:hover {
            background: var(--vscode-list-hoverBackground);
            transform: translateY(-2px);
            box-shadow: var(--shadow);
        }

        .mode-card.selected {
            border-color: var(--vscode-button-background);
            background: var(--vscode-list-activeSelectionBackground);
        }

        .mode-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: var(--spacing-sm);
        }

        .mode-description {
            opacity: 0.8;
            margin-bottom: var(--spacing-md);
        }

        /* Error Page Styles */
        .error-page {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: var(--spacing-xl);
            text-align: center;
        }

        .error-icon {
            font-size: 4rem;
            margin-bottom: var(--spacing-lg);
        }

        .error-message {
            margin: var(--spacing-lg) 0;
            opacity: 0.8;
        }
        `;
    }

    /**
     * Generate reactive JavaScript for state management
     */
    private generateReactiveJavaScript(): string {
        return `
        const vscode = acquireVsCodeApi();
        
        // State management
        let currentState = null;
        
        function sendMessage(type, payload = {}) {
            vscode.postMessage({ type, payload });
        }
        
        function refreshState() {
            sendMessage('refreshAll');
        }
        
        function switchTab(tab) {
            sendMessage('switchTab', { tab });
        }
        
        function deployMode(modeId) {
            sendMessage('deployMode', { modeId });
        }
        
        function stopDeployment() {
            sendMessage('stopDeployment');
        }
        
        function toggleRule(ruleId, enabled) {
            sendMessage('toggleRule', { ruleId, enabled });
        }
        
        function updateRuleFilter(filter) {
            sendMessage('updateRuleFilter', { filter });
        }
        
        function selectMode(modeId) {
            const card = document.querySelector(\`[data-mode-id="\${modeId}"]\`);
            if (card) {
                // Toggle selection
                card.classList.toggle('selected');
                
                // Get all selected modes
                const selectedCards = document.querySelectorAll('.mode-card.selected');
                const selectedModeIds = Array.from(selectedCards).map(card => card.dataset.modeId);
                
                sendMessage('selectModes', { modeIds: selectedModeIds });
            }
        }
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'updateState':
                    currentState = message.payload;
                    updateUI(currentState);
                    break;
                case 'showError':
                    showError(message.payload.error);
                    break;
                case 'showSuccess':
                    showSuccess(message.payload.message);
                    break;
            }
        });
        
        function updateUI(state) {
            // Update loading states
            const loadingElements = document.querySelectorAll('.loading-spinner');
            loadingElements.forEach(el => {
                el.style.display = state.isLoading ? 'block' : 'none';
            });
            
            // Update button states
            const refreshBtn = document.querySelector('.refresh-btn');
            if (refreshBtn) {
                refreshBtn.disabled = state.isLoading;
            }
        }
        
        function showError(error) {
            // Create or update error display
            let errorEl = document.querySelector('.error');
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.className = 'error';
                document.querySelector('.application-container').prepend(errorEl);
            }
            errorEl.innerHTML = \`⚠️ \${error}\`;
            errorEl.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (errorEl) {
                    errorEl.style.display = 'none';
                }
            }, 5000);
        }
        
        function showSuccess(message) {
            // Simple success notification
            console.log('Success:', message);
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            refreshState();
        });
        `;
    }

    /**
     * Generate error page CSS
     */
    private generateErrorPageCSS(): string {
        return `
        :root {
            --vscode-font-family: var(--vscode-font-family);
            --vscode-font-size: var(--vscode-font-size);
            --vscode-editor-background: var(--vscode-editor-background);
            --vscode-editor-foreground: var(--vscode-editor-foreground);
            --vscode-button-background: var(--vscode-button-background);
            --vscode-button-foreground: var(--vscode-button-foreground);
            --vscode-button-hoverBackground: var(--vscode-button-hoverBackground);
            --border-radius: 6px;
            --spacing-sm: 8px;
            --spacing-md: 16px;
            --spacing-lg: 24px;
            --spacing-xl: 32px;
        }
        
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 0;
        }
        
        .error-page {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: var(--spacing-xl);
            text-align: center;
        }
        
        .error-icon {
            font-size: 4rem;
            margin-bottom: var(--spacing-lg);
        }
        
        .error-message {
            margin: var(--spacing-lg) 0;
            opacity: 0.8;
        }
        
        .retry-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--border-radius);
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .retry-btn:hover {
            background: var(--vscode-button-hoverBackground);
        }
        `;
    }

    /**
     * Generate basic JavaScript for error page
     */
    private generateBasicJavaScript(): string {
        return `
        const vscode = acquireVsCodeApi();
        
        function sendMessage(type, payload = {}) {
            vscode.postMessage({ type, payload });
        }
        `;
    }

    /**
     * Generate modes content section
     */
    private generateModesContent(state: UIState): string {
        const { availableModes, isDeployed } = state;
        
        if (availableModes.length === 0) {
            return `
                <div class="no-modes">
                    <h3>No modes available</h3>
                    <p>No assistant modes found. Please check your configuration.</p>
                </div>
            `;
        }
        
        const modesHTML = availableModes.map(mode => `
            <div class="mode-card" data-mode-id="${mode.id}" onclick="selectMode('${mode.id}')">
                <div class="mode-title">${mode.name}</div>
                <div class="mode-description">${mode.description || 'No description available'}</div>
                <div class="mode-actions">
                    <button onclick="event.stopPropagation(); deployMode('${mode.id}')" 
                            class="deploy-btn" ${isDeployed ? 'disabled' : ''}>
                        🚀 Deploy
                    </button>
                </div>
            </div>
        `).join('');
        
        return `
            <div class="modes-section">
                <h2>Available Assistant Modes</h2>
                <p>Select and deploy an AI assistant configuration:</p>
                <div class="modes-grid">
                    ${modesHTML}
                </div>
            </div>
        `;
    }

    /**
     * Generate rules HTML content
     */
    generateRulesHTML(state: UIState): string {
        const { currentRuleSet, ruleFilter } = state;
        
        if (!currentRuleSet) {
            return `
                <div class="no-rules">
                    <h3>No rules available</h3>
                    <p>Deploy a mode first to manage its rules.</p>
                </div>
            `;
        }
        
        let filteredRules = currentRuleSet.rules;
        
        // Apply filters
        if (ruleFilter) {
            filteredRules = filteredRules.filter(rule => {
                if (ruleFilter.categories && ruleFilter.categories.length > 0) {
                    if (!ruleFilter.categories.includes(rule.category)) return false;
                }
                if (ruleFilter.urgencies && ruleFilter.urgencies.length > 0) {
                    if (!ruleFilter.urgencies.includes(rule.urgency)) return false;
                }
                if (ruleFilter.searchText) {
                    const searchLower = ruleFilter.searchText.toLowerCase();
                    if (!rule.title.toLowerCase().includes(searchLower) && 
                        !rule.description.toLowerCase().includes(searchLower)) {
                        return false;
                    }
                }
                return true;
            });
        }
        
        const rulesByCategory = filteredRules.reduce((acc, rule) => {
            if (!acc[rule.category]) {
                acc[rule.category] = [];
            }
            acc[rule.category].push(rule);
            return acc;
        }, {} as Record<string, Rule[]>);
        
        const categoriesHTML = Object.entries(rulesByCategory).map(([category, rules]) => `
            <div class="rule-category">
                <div class="category-header">
                    <h3 class="category-title">${this.formatCategoryName(category as RuleCategory)}</h3>
                    <span class="category-count">${rules.length} rules</span>
                </div>
                <div class="rules-list">
                    ${rules.map(rule => this.generateRuleCard(rule)).join('')}
                </div>
            </div>
        `).join('');
        
        return `
            <div class="rules-section">
                <div class="rules-header">
                    <h2>Rule Management</h2>
                    <div class="rules-stats">
                        <span class="stat">
                            <strong>${currentRuleSet.rules.filter(r => r.isEnabled).length}</strong> Active
                        </span>
                        <span class="stat">
                            <strong>${currentRuleSet.rules.length}</strong> Total
                        </span>
                    </div>
                </div>
                
                <div class="rules-filters">
                    <div class="filter-group">
                        <label>Category:</label>
                        <select onchange="updateRuleFilter({categories: this.value ? [this.value] : []})">
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
                    </div>
                    
                    <div class="filter-group">
                        <label>Urgency:</label>
                        <select onchange="updateRuleFilter({urgencies: this.value ? [this.value] : []})">
                            <option value="">All Urgencies</option>
                            <option value="${RuleUrgency.CRITICAL}" ${ruleFilter?.urgencies?.includes(RuleUrgency.CRITICAL) ? 'selected' : ''}>Critical</option>
                            <option value="${RuleUrgency.HIGH}" ${ruleFilter?.urgencies?.includes(RuleUrgency.HIGH) ? 'selected' : ''}>High</option>
                            <option value="${RuleUrgency.MEDIUM}" ${ruleFilter?.urgencies?.includes(RuleUrgency.MEDIUM) ? 'selected' : ''}>Medium</option>
                            <option value="${RuleUrgency.LOW}" ${ruleFilter?.urgencies?.includes(RuleUrgency.LOW) ? 'selected' : ''}>Low</option>
                            <option value="${RuleUrgency.INFO}" ${ruleFilter?.urgencies?.includes(RuleUrgency.INFO) ? 'selected' : ''}>Info</option>
                        </select>
                    </div>
                </div>
                
                <div class="rules-content">
                    ${categoriesHTML}
                </div>
            </div>
        `;
    }

    /**
     * Generate individual rule card
     */
    private generateRuleCard(rule: Rule): string {
        const urgencyClass = `urgency-${rule.urgency}`;
        const categoryIcon = this.getCategoryIcon(rule.category);
        
        return `
            <div class="rule-card ${urgencyClass}">
                <div class="rule-header">
                    <div class="rule-info">
                        <span class="rule-icon">${categoryIcon}</span>
                        <h4 class="rule-name">${rule.title}</h4>
                        <span class="rule-urgency ${urgencyClass}">${rule.urgency}</span>
                    </div>
                    <label class="rule-toggle">
                        <input type="checkbox" ${rule.isEnabled ? 'checked' : ''} 
                               onchange="toggleRule('${rule.id}', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <p class="rule-description">${rule.description}</p>
            </div>
        `;
    }

    /**
     * Generate custom mode builder modal
     */
    private generateCustomModeBuilderModal(): string {
        return `
            <div id="customModeModal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Create Custom Mode</h3>
                        <button onclick="closeCustomModeBuilder()" class="close-btn">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Mode Name:</label>
                            <input type="text" id="customModeName" placeholder="Enter mode name">
                        </div>
                        <div class="form-group">
                            <label>Description:</label>
                            <textarea id="customModeDescription" placeholder="Describe your custom mode"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Select Rules:</label>
                            <div id="customModeRules" class="rules-selector">
                                <!-- Rules will be populated dynamically -->
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button onclick="closeCustomModeBuilder()" class="cancel-btn">Cancel</button>
                        <button onclick="saveCustomMode()" class="save-btn">Create Mode</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Format category name for display
     */
    private formatCategoryName(category: RuleCategory): string {
        return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Get icon for rule category
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
        return icons[category] || '📋';
    }
}
