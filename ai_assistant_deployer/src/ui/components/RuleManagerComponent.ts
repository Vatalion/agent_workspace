/**
 * Rule Manager Component - Fixed Version
 * Handles rule discovery, filtering, and management
 */

import { BaseUIComponent, ComponentProps } from './BaseComponent';
import { UIStateManager } from '../state/StateManager';
import { actionCreators } from '../state/actions/ActionCreators';
import { Rule, RuleFilter, RuleCategory, RuleUrgency } from '../../services/ruleTypes';
import { RuleManagerProps, ExtendedRule, ExtendedRuleFilter } from '../types/ComponentTypes';

export class RuleManagerComponent extends BaseUIComponent {
    constructor(
        stateManager: UIStateManager,
        private ruleManagerProps: RuleManagerProps
    ) {
        super(stateManager, ruleManagerProps);
    }

    render(): string {
        const { state } = this.props;
        const { currentRuleSet, ruleFilter, isLoading, error } = state;

        if (isLoading) {
            return this.createLoadingSpinner('Loading rules...');
        }

        if (error) {
            return this.createAlert(error, 'error');
        }

        return `
            <div class="rule-manager-container">
                ${this.renderHeader()}
                ${this.renderFilters()}
                ${this.renderRuleStats()}
                ${this.renderRuleList()}
                ${this.renderBulkActions()}
            </div>
        `;
    }

    private renderHeader(): string {
        return `
            <div class="rule-manager-header">
                <h2>Rule Management</h2>
                <div class="header-actions">
                    <button 
                        class="btn btn-secondary"
                        onclick="sendMessage('refreshRules')"
                        title="Refresh rules"
                    >
                        🔄 Refresh
                    </button>
                    <button 
                        class="btn btn-primary"
                        onclick="sendMessage('addNewRule')"
                    >
                        ➕ Add Rule
                    </button>
                    <button 
                        class="btn btn-outline"
                        onclick="sendMessage('importRules')"
                    >
                        📥 Import
                    </button>
                </div>
            </div>
        `;
    }

    private renderFilters(): string {
        const { showFilters } = this.ruleManagerProps;
        if (!showFilters) return '';

        const { ruleFilter } = this.props.state;
        // Create an extended filter for template compatibility
        const extendedFilter = this.createExtendedRuleFilter(ruleFilter);

        return `
            <div class="rule-filters">
                <div class="filter-row">
                    <div class="filter-group">
                        <label>Category:</label>
                        <select onchange="sendMessage('updateFilter', { categories: [this.value] })">
                            <option value="">All Categories</option>
                            <option value="core" ${extendedFilter?.category === 'core' ? 'selected' : ''}>Core</option>
                            <option value="development" ${extendedFilter?.category === 'development' ? 'selected' : ''}>Development</option>
                            <option value="enterprise" ${extendedFilter?.category === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                            <option value="operations" ${extendedFilter?.category === 'operations' ? 'selected' : ''}>Operations</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Urgency:</label>
                        <select onchange="sendMessage('updateFilter', { urgencies: [this.value] })">
                            <option value="">All Urgencies</option>
                            <option value="low" ${extendedFilter?.urgency === 'low' ? 'selected' : ''}>Low</option>
                            <option value="medium" ${extendedFilter?.urgency === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="high" ${extendedFilter?.urgency === 'high' ? 'selected' : ''}>High</option>
                            <option value="critical" ${extendedFilter?.urgency === 'critical' ? 'selected' : ''}>Critical</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Status:</label>
                        <select onchange="sendMessage('updateFilter', { enabled: this.value === 'enabled' ? true : this.value === 'disabled' ? false : undefined })">
                            <option value="">All</option>
                            <option value="enabled" ${ruleFilter?.enabled === true ? 'selected' : ''}>Enabled</option>
                            <option value="disabled" ${ruleFilter?.enabled === false ? 'selected' : ''}>Disabled</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <input 
                            type="text" 
                            placeholder="Search rules..." 
                            value="${ruleFilter?.searchText || ''}"
                            oninput="sendMessage('updateFilter', { searchText: this.value })"
                            class="search-input"
                        />
                    </div>
                    
                    <button 
                        class="btn btn-secondary btn-sm"
                        onclick="sendMessage('clearFilters')"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        `;
    }

    private renderRuleStats(): string {
        const { currentRuleSet } = this.props.state;
        if (!currentRuleSet?.rules) return '';

        const rules = currentRuleSet.rules;
        const totalRules = rules.length;
        const enabledRules = rules.filter(r => r.isEnabled).length;
        const criticalRules = rules.filter(r => r.urgency === 'critical').length;
        const highRules = rules.filter(r => r.urgency === 'high').length;

        return `
            <div class="rule-stats">
                <div class="stat-card">
                    <div class="stat-number">${totalRules}</div>
                    <div class="stat-label">Total Rules</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-number">${enabledRules}</div>
                    <div class="stat-label">Enabled</div>
                </div>
                <div class="stat-card danger">
                    <div class="stat-number">${criticalRules}</div>
                    <div class="stat-label">Critical</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-number">${highRules}</div>
                    <div class="stat-label">High Priority</div>
                </div>
            </div>
        `;
    }

    private renderRuleList(): string {
        const { currentRuleSet } = this.props.state;
        if (!currentRuleSet?.rules || currentRuleSet.rules.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No Rules Found</h3>
                    <p>No rules match the current filter criteria.</p>
                    <button 
                        class="btn btn-primary"
                        onclick="sendMessage('addNewRule')"
                    >
                        Add Your First Rule
                    </button>
                </div>
            `;
        }

        const { compactView } = this.ruleManagerProps;
        const filteredRules = this.getFilteredRules(currentRuleSet.rules);

        return `
            <div class="rule-list ${compactView ? 'compact' : 'detailed'}">
                ${filteredRules.map(rule => this.renderRuleCard(rule)).join('')}
            </div>
        `;
    }

    private renderRuleCard(rule: Rule): string {
        const { allowBulkOperations } = this.ruleManagerProps;
        const extendedRule = this.createExtendedRule(rule);
        
        return `
            <div class="rule-card ${rule.isEnabled ? 'enabled' : 'disabled'}">
                <div class="rule-card-header">
                    ${allowBulkOperations ? `
                        <input 
                            type="checkbox" 
                            onchange="sendMessage('toggleRuleSelection', '${rule.id}')"
                            class="rule-checkbox"
                        />
                    ` : ''}
                    <div class="rule-title">
                        <h3>${rule.title}</h3>
                        <div class="rule-badges">
                            <span class="badge badge-${rule.category}">${rule.category}</span>
                            <span class="badge badge-urgency-${rule.urgency}">${rule.urgency}</span>
                            ${rule.isEnabled ? 
                                '<span class="badge badge-enabled">Enabled</span>' : 
                                '<span class="badge badge-disabled">Disabled</span>'
                            }
                        </div>
                    </div>
                    <div class="rule-actions">
                        <button 
                            class="btn btn-sm ${rule.isEnabled ? 'btn-warning' : 'btn-success'}"
                            onclick="sendMessage('toggleRule', '${rule.id}')"
                            title="${rule.isEnabled ? 'Disable' : 'Enable'} rule"
                        >
                            ${rule.isEnabled ? '⏸️' : '▶️'}
                        </button>
                        <button 
                            class="btn btn-sm btn-secondary"
                            onclick="sendMessage('editRule', '${rule.id}')"
                            title="Edit rule"
                        >
                            ✏️
                        </button>
                        <button 
                            class="btn btn-sm btn-danger"
                            onclick="sendMessage('deleteRule', '${rule.id}')"
                            title="Delete rule"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="rule-card-content">
                    <p class="rule-description">${rule.description}</p>
                    
                    ${extendedRule.impact ? `
                        <div class="rule-impact">
                            <strong>Impact:</strong> ${extendedRule.impact}
                        </div>
                    ` : ''}
                    
                    ${extendedRule.examples ? this.renderRuleExamples(extendedRule.examples) : ''}
                    
                    <div class="rule-metadata">
                        <div class="metadata-item">
                            <span class="label">Rule ID:</span>
                            <span class="value">${rule.id}</span>
                        </div>
                        ${extendedRule.version ? `
                            <div class="metadata-item">
                                <span class="label">Version:</span>
                                <span class="value">${extendedRule.version}</span>
                            </div>
                        ` : ''}
                        ${extendedRule.lastModified ? `
                            <div class="metadata-item">
                                <span class="label">Modified:</span>
                                <span class="value">${new Date(extendedRule.lastModified).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="rule-card-footer">
                    <button 
                        class="btn btn-sm btn-outline"
                        onclick="sendMessage('testRule', '${rule.id}')"
                    >
                        🧪 Test Rule
                    </button>
                    <button 
                        class="btn btn-sm btn-outline"
                        onclick="sendMessage('viewRuleDetails', '${rule.id}')"
                    >
                        📖 Details
                    </button>
                    <button 
                        class="btn btn-sm btn-outline"
                        onclick="sendMessage('duplicateRule', '${rule.id}')"
                    >
                        📄 Duplicate
                    </button>
                </div>
            </div>
        `;
    }

    private renderRuleExamples(examples: string[]): string {
        return `
            <div class="rule-examples">
                <strong>Examples:</strong>
                <ul>
                    ${examples.slice(0, 2).map(example => `<li>${example}</li>`).join('')}
                    ${examples.length > 2 ? `<li class="more-examples">+${examples.length - 2} more...</li>` : ''}
                </ul>
            </div>
        `;
    }

    private renderBulkActions(): string {
        const { allowBulkOperations } = this.ruleManagerProps;
        if (!allowBulkOperations) return '';

        return `
            <div class="bulk-actions">
                <div class="bulk-actions-header">
                    <span>Bulk Actions:</span>
                    <span class="selected-count" id="selectedRuleCount">0 selected</span>
                </div>
                <div class="bulk-actions-buttons">
                    <button 
                        class="btn btn-sm btn-success"
                        onclick="sendMessage('enableSelectedRules')"
                        disabled
                    >
                        ✅ Enable Selected
                    </button>
                    <button 
                        class="btn btn-sm btn-warning"
                        onclick="sendMessage('disableSelectedRules')"
                        disabled
                    >
                        ⏸️ Disable Selected
                    </button>
                    <button 
                        class="btn btn-sm btn-secondary"
                        onclick="sendMessage('exportSelectedRules')"
                        disabled
                    >
                        📤 Export Selected
                    </button>
                    <button 
                        class="btn btn-sm btn-danger"
                        onclick="sendMessage('deleteSelectedRules')"
                        disabled
                    >
                        🗑️ Delete Selected
                    </button>
                </div>
            </div>
        `;
    }

    private getFilteredRules(rules: Rule[]): Rule[] {
        const { ruleFilter } = this.props.state;
        const extendedFilter = this.createExtendedRuleFilter(ruleFilter);
        if (!ruleFilter && !extendedFilter) return rules;

        return rules.filter(rule => {
            // Category filter (using array-based or single value)
            if (ruleFilter?.categories?.length && !ruleFilter.categories.includes(rule.category)) {
                return false;
            }
            if (extendedFilter?.category && rule.category !== extendedFilter.category) {
                return false;
            }

            // Urgency filter (using array-based or single value)
            if (ruleFilter?.urgencies?.length && !ruleFilter.urgencies.includes(rule.urgency)) {
                return false;
            }
            if (extendedFilter?.urgency && rule.urgency !== extendedFilter.urgency) {
                return false;
            }

            // Enabled filter
            if (ruleFilter?.enabled !== undefined && rule.isEnabled !== ruleFilter.enabled) {
                return false;
            }

            // Search text filter
            if (ruleFilter?.searchText) {
                const searchTerm = ruleFilter.searchText.toLowerCase();
                const matchesTitle = rule.title.toLowerCase().includes(searchTerm);
                const matchesDescription = rule.description.toLowerCase().includes(searchTerm);
                const matchesId = rule.id.toLowerCase().includes(searchTerm);
                
                if (!matchesTitle && !matchesDescription && !matchesId) {
                    return false;
                }
            }

            return true;
        });
    }

    async handleMessage(message: any): Promise<void> {
        const { type, data } = message;

        switch (type) {
            case 'toggleRule':
                this.handleToggleRule(data);
                break;

            case 'updateFilter':
                this.handleUpdateFilter(data);
                break;

            case 'clearFilters':
                this.handleClearFilters();
                break;

            case 'toggleRuleSelection':
                this.handleToggleRuleSelection(data);
                break;

            default:
                // Let parent handle unknown messages
                break;
        }
    }

    private handleToggleRule(ruleId: string): void {
        // This would typically call the rule management service
        this.props.onAction(actionCreators.generic.updateState({
            lastAction: `Toggled rule ${ruleId}`
        }));
    }

    private handleUpdateFilter(filterUpdate: Partial<RuleFilter>): void {
        const currentFilter = this.props.state.ruleFilter || {};
        const newFilter = { ...currentFilter, ...filterUpdate };
        
        this.props.onAction(actionCreators.rules.setRuleFilter(newFilter));
    }

    private handleClearFilters(): void {
        this.props.onAction(actionCreators.rules.setRuleFilter({}));
    }

    private handleToggleRuleSelection(ruleId: string): void {
        // This would update selected rules state
        this.props.onAction(actionCreators.generic.updateState({
            selectedRuleIds: this.props.state.selectedRuleIds || []
        }));
    }

    /**
     * Create extended rule filter for backward compatibility in templates
     */
    private createExtendedRuleFilter(ruleFilter?: RuleFilter): ExtendedRuleFilter | undefined {
        if (!ruleFilter) return undefined;
        
        return {
            ...ruleFilter,
            searchTerm: ruleFilter.searchText, // Backward compatibility alias
            category: ruleFilter.categories?.[0], // Single category from array
            urgency: ruleFilter.urgencies?.[0] as string, // Single urgency from array
        };
    }

    /**
     * Create extended rule for backward compatibility in templates
     */
    private createExtendedRule(rule: Rule): ExtendedRule {
        return {
            ...rule,
            enabled: rule.isEnabled, // Backward compatibility alias
            impact: undefined, // Optional extended property
            examples: undefined, // Optional extended property
            version: undefined, // Optional extended property
            lastModified: undefined, // Optional extended property
        };
    }
}
