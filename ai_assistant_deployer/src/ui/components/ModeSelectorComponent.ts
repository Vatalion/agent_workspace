/**
 * Mode Selector Component
 * Handles mode discovery, selection, and deployment
 */

import { BaseUIComponent, ComponentProps } from './BaseComponent';
import { UIStateManager } from '../state/StateManager';
import { actionCreators } from '../state/actions/ActionCreators';
import { ModeInfo } from '../../services/modeDiscovery';
import { ModeSelectorProps, ExtendedModeInfo } from '../types/ComponentTypes';

export class ModeSelectorComponent extends BaseUIComponent {
    constructor(
        stateManager: UIStateManager,
        private modeSelectorProps: ModeSelectorProps
    ) {
        super(stateManager, modeSelectorProps);
    }

    render(): string {
        const { state } = this.props;
        const { availableModes, currentMode, isLoading, isDeploying, error } = state;

        if (isLoading) {
            return this.createLoadingSpinner('Loading available modes...');
        }

        if (error) {
            return this.createAlert(error, 'error');
        }

        return `
            <div class="mode-selector-container">
                ${this.renderHeader()}
                ${this.renderCurrentModeStatus()}
                ${this.renderModeList(availableModes)}
                ${this.renderActionButtons()}
            </div>
        `;
    }

    private renderHeader(): string {
        const { showSearch } = this.modeSelectorProps;
        
        return `
            <div class="mode-selector-header">
                <h2>Mode Selection</h2>
                ${showSearch ? this.renderSearchBar() : ''}
                <button 
                    class="btn btn-secondary"
                    onclick="sendMessage('refreshModes')"
                    title="Refresh available modes"
                >
                    🔄 Refresh
                </button>
            </div>
        `;
    }

    private renderSearchBar(): string {
        return `
            <div class="search-container">
                <input 
                    type="text" 
                    placeholder="Search modes..." 
                    class="search-input"
                    oninput="sendMessage('filterModes', this.value)"
                />
                <span class="search-icon">🔍</span>
            </div>
        `;
    }

    private renderCurrentModeStatus(): string {
        const { state } = this.props;
        const { currentMode, isDeployed } = state;

        if (!currentMode) {
            return `
                <div class="status-card info">
                    <span class="status-icon">ℹ️</span>
                    <span>No mode currently deployed</span>
                </div>
            `;
        }

        return `
            <div class="status-card ${isDeployed ? 'success' : 'warning'}">
                <span class="status-icon">${isDeployed ? '✅' : '⚠️'}</span>
                <span>Current mode: <strong>${currentMode}</strong></span>
                ${isDeployed ? 
                    '<span class="status-badge">Deployed</span>' : 
                    '<span class="status-badge">Pending</span>'
                }
            </div>
        `;
    }

    private renderModeList(modes: ModeInfo[]): string {
        if (modes.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>No Modes Available</h3>
                    <p>No deployment modes were found in the current workspace.</p>
                    <button 
                        class="btn btn-primary"
                        onclick="sendMessage('createCustomMode')"
                    >
                        Create Custom Mode
                    </button>
                </div>
            `;
        }

        const { compactView } = this.modeSelectorProps;
        
        return `
            <div class="mode-list ${compactView ? 'compact' : 'detailed'}">
                ${modes.map(mode => this.renderModeCard(mode)).join('')}
            </div>
        `;
    }

    private renderModeCard(mode: ModeInfo): string {
        const { state } = this.props;
        const { currentMode, isDeploying, selectedModeIds } = state;
        const { allowMultiSelect } = this.modeSelectorProps;
        
        const isSelected = currentMode === mode.id || selectedModeIds.includes(mode.id);
        const isCurrentMode = currentMode === mode.id;
        
        // Convert to ExtendedModeInfo for UI display
        const extendedMode = this.toExtendedModeInfo(mode);
        
        return `
            <div class="mode-card ${isSelected ? 'selected' : ''} ${isCurrentMode ? 'current' : ''}">
                <div class="mode-card-header">
                    ${allowMultiSelect ? `
                        <input 
                            type="checkbox" 
                            ${selectedModeIds.includes(mode.id) ? 'checked' : ''}
                            onchange="sendMessage('toggleModeSelection', '${mode.id}')"
                        />
                    ` : ''}
                    <h3>${mode.name}</h3>
                    <div class="mode-badges">
                        <span class="badge badge-${extendedMode.complexity}">${extendedMode.complexity}</span>
                        ${isCurrentMode ? '<span class="badge badge-current">Current</span>' : ''}
                    </div>
                </div>
                
                <div class="mode-card-content">
                    <p class="mode-description">${mode.description}</p>
                    
                    <div class="mode-details">
                        <div class="mode-stat">
                            <span class="stat-label">Rules:</span>
                            <span class="stat-value">${extendedMode.ruleCount || 0}</span>
                        </div>
                        <div class="mode-stat">
                            <span class="stat-label">Files:</span>
                            <span class="stat-value">${extendedMode.fileCount || 0}</span>
                        </div>
                        <div class="mode-stat">
                            <span class="stat-label">Size:</span>
                            <span class="stat-value">${this.formatSize(extendedMode.estimatedSize)}</span>
                        </div>
                    </div>
                    
                    ${mode.features ? this.renderFeatureList(mode.features) : ''}
                </div>
                
                <div class="mode-card-actions">
                    ${this.renderModeActions(mode)}
                </div>
            </div>
        `;
    }

    private renderFeatureList(features: string[]): string {
        return `
            <div class="feature-list">
                <h4>Features:</h4>
                <ul>
                    ${features.slice(0, 3).map(feature => `<li>${feature}</li>`).join('')}
                    ${features.length > 3 ? `<li class="more-features">+${features.length - 3} more...</li>` : ''}
                </ul>
            </div>
        `;
    }

    private renderModeActions(mode: ModeInfo): string {
        const { state } = this.props;
        const { currentMode, isDeploying } = state;
        const isCurrentMode = currentMode === mode.id;

        if (isCurrentMode) {
            return `
                <button 
                    class="btn btn-secondary btn-sm"
                    onclick="sendMessage('viewModeDetails', '${mode.id}')"
                >
                    View Details
                </button>
                <button 
                    class="btn btn-danger btn-sm"
                    onclick="sendMessage('resetDeployment')"
                    ${isDeploying ? 'disabled' : ''}
                >
                    ${isDeploying ? 'Resetting...' : 'Reset'}
                </button>
            `;
        }

        return `
            <button 
                class="btn btn-primary btn-sm"
                onclick="sendMessage('deployMode', '${mode.id}')"
                ${isDeploying ? 'disabled' : ''}
            >
                ${isDeploying ? 'Deploying...' : 'Deploy'}
            </button>
            <button 
                class="btn btn-secondary btn-sm"
                onclick="sendMessage('previewMode', '${mode.id}')"
            >
                Preview
            </button>
        `;
    }

    private renderActionButtons(): string {
        const { state } = this.props;
        const { selectedModeIds, isDeploying } = state;
        const { allowMultiSelect } = this.modeSelectorProps;

        if (!allowMultiSelect) {
            return `
                <div class="action-buttons">
                    <button 
                        class="btn btn-outline"
                        onclick="sendMessage('openCustomModeBuilder')"
                    >
                        Create Custom Mode
                    </button>
                </div>
            `;
        }

        return `
            <div class="action-buttons">
                <button 
                    class="btn btn-primary"
                    onclick="sendMessage('deploySelectedModes')"
                    ${selectedModeIds.length === 0 || isDeploying ? 'disabled' : ''}
                >
                    Deploy Selected (${selectedModeIds.length})
                </button>
                <button 
                    class="btn btn-secondary"
                    onclick="sendMessage('compareSelectedModes')"
                    ${selectedModeIds.length < 2 ? 'disabled' : ''}
                >
                    Compare Modes
                </button>
                <button 
                    class="btn btn-outline"
                    onclick="sendMessage('openCustomModeBuilder')"
                >
                    Create Custom Mode
                </button>
            </div>
        `;
    }

    async handleMessage(message: any): Promise<void> {
        const { type, data } = message;

        switch (type) {
            case 'deployMode':
                this.props.onAction(actionCreators.loading.setDeploying(true));
                // Actual deployment logic would be handled by the parent
                break;

            case 'resetDeployment':
                this.props.onAction(actionCreators.modes.setCurrentMode(null));
                this.props.onAction(actionCreators.modes.setDeployed(false));
                break;

            case 'toggleModeSelection':
                this.handleModeSelection(data);
                break;

            case 'filterModes':
                this.handleModeFilter(data);
                break;

            default:
                // Let parent handle unknown messages
                break;
        }
    }

    private handleModeSelection(modeId: string): void {
        const { selectedModeIds } = this.props.state;
        const newSelection = selectedModeIds.includes(modeId)
            ? selectedModeIds.filter(id => id !== modeId)
            : [...selectedModeIds, modeId];
            
        this.props.onAction(actionCreators.modes.setSelectedModes(newSelection));
    }

    private handleModeFilter(searchTerm: string): void {
        // This would typically update a filter state
        // For now, we'll just update the state with the search term
        this.props.onAction(actionCreators.generic.updateState({
            modeSearchTerm: searchTerm
        }));
    }

    private formatSize(bytes?: number): string {
        if (!bytes) return '0 B';
        
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    /**
     * Convert ModeInfo to ExtendedModeInfo with UI-friendly defaults
     */
    private toExtendedModeInfo(mode: ModeInfo): ExtendedModeInfo {
        const extendedMode: ExtendedModeInfo = {
            ...mode,
            complexity: this.inferComplexity(mode),
            ruleCount: this.estimateRuleCount(mode),
            fileCount: this.estimateFileCount(mode),
            estimatedSize: this.estimateSize(mode)
        };
        return extendedMode;
    }

    /**
     * Infer complexity level from mode characteristics
     */
    private inferComplexity(mode: ModeInfo): 'basic' | 'medium' | 'enterprise' {
        const id = mode.id.toLowerCase();
        if (id.includes('enterprise')) return 'enterprise';
        if (id.includes('simplified') || id.includes('basic')) return 'basic';
        return 'medium';
    }

    /**
     * Estimate rule count based on mode type
     */
    private estimateRuleCount(mode: ModeInfo): number {
        const complexity = this.inferComplexity(mode);
        switch (complexity) {
            case 'basic': return 15;
            case 'medium': return 25;
            case 'enterprise': return 40;
            default: return 20;
        }
    }

    /**
     * Estimate file count based on mode characteristics
     */
    private estimateFileCount(mode: ModeInfo): number {
        const complexity = this.inferComplexity(mode);
        switch (complexity) {
            case 'basic': return 5;
            case 'medium': return 8;
            case 'enterprise': return 12;
            default: return 6;
        }
    }

    /**
     * Estimate size in bytes based on mode characteristics
     */
    private estimateSize(mode: ModeInfo): number {
        const ruleCount = this.estimateRuleCount(mode);
        const fileCount = this.estimateFileCount(mode);
        // Rough estimate: rules ~1KB each, files ~2KB each
        return (ruleCount * 1024) + (fileCount * 2048);
    }
}
