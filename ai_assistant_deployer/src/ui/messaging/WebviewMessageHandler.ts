
import * as vscode from 'vscode';
import { ModeInfo } from '../../services/modeDiscovery';
import { RuleFilter, Rule } from '../../services/ruleTypes';

/**
 * Interface for the webview provider that this message handler delegates to
 */
export interface IWebviewProvider {
    // Mode management methods
    handleDeployMode(modeId: string): Promise<void>;
    handleResetDeployment(): Promise<void>;
    refreshState(): Promise<void>;
    
    // Tab management
    handleSwitchTab(tab: 'modes' | 'rules'): Promise<void>;
    
    // Rule management methods
    handleLoadRules(): Promise<void>;
    handleToggleRule(ruleId: string): Promise<void>;
    handleUpdateRuleUrgency(ruleId: string, urgency: string): Promise<void>;
    handleFilterRules(filter: RuleFilter): Promise<void>;
    handleAddRule(rule: Rule): Promise<void>;
    handleRemoveRule(ruleId: string): Promise<void>;
    
    // Bulk operations
    handleBulkOperation(operation: any): Promise<void>;
    handleExportRules(ruleIds?: string[]): Promise<void>;
    handleImportRules(): Promise<void>;
    
    // Custom mode functionality
    handleDeployCustomMode(customModeData: any): Promise<void>;
    openCustomModeBuilder(): Promise<void>;
    handleLoadAvailableRules(): Promise<void>;
    handleCreateCustomMode(customModeData: any): Promise<void>;
    
    // State management
    updateState(updates: Partial<any>): void;
}

/**
 * Handles all webview message processing and routing
 * Following Single Responsibility Principle - focused only on message handling
 */
export class WebviewMessageHandler {
    constructor(
        private readonly webviewProvider: IWebviewProvider
    ) {}

    /**
     * Main message dispatcher - routes incoming messages to appropriate handlers
     * @param message The message received from the webview
     */
    async handleMessage(message: any): Promise<void> {
        try {
            console.log('📨 [MessageHandler] Received webview message:', message);
            
            switch (message.type) {
                // Mode deployment and management
                case 'deployMode':
                    await this.handleDeployMode(message);
                    break;
                case 'resetDeployment':
                    await this.handleResetDeployment(message);
                    break;
                case 'refreshState':
                    await this.handleRefreshState(message);
                    break;
                
                // Tab management
                case 'switchTab':
                    await this.handleSwitchTab(message);
                    break;
                
                // Rule management
                case 'loadRules':
                    await this.handleLoadRules(message);
                    break;
                case 'toggleRule':
                    await this.handleToggleRule(message);
                    break;
                case 'updateRuleUrgency':
                    await this.handleUpdateRuleUrgency(message);
                    break;
                case 'filterRules':
                    await this.handleFilterRules(message);
                    break;
                case 'addRule':
                    await this.handleAddRule(message);
                    break;
                case 'removeRule':
                    await this.handleRemoveRule(message);
                    break;
                
                // Bulk operations
                case 'bulkOperation':
                    await this.handleBulkOperation(message);
                    break;
                case 'exportRules':
                    await this.handleExportRules(message);
                    break;
                case 'importRules':
                    await this.handleImportRules(message);
                    break;
                
                // Custom mode functionality
                case 'deployCustomMode':
                    await this.handleDeployCustomMode(message);
                    break;
                case 'openCustomModeBuilder':
                    await this.handleOpenCustomModeBuilder(message);
                    break;
                case 'loadAvailableRules':
                    await this.handleLoadAvailableRules(message);
                    break;
                case 'createCustomMode':
                    await this.handleCreateCustomMode(message);
                    break;
                
                default:
                    console.warn('⚠️ [MessageHandler] Unknown message type:', message.type);
                    break;
            }
        } catch (error) {
            console.error('❌ [MessageHandler] Error handling webview message:', error);
            this.webviewProvider.updateState({ 
                error: `Message handling error: ${error}` 
            });
        }
    }

    // =============================================================================
    // MESSAGE HANDLER METHODS
    // =============================================================================

    /**
     * Handle mode deployment requests
     */
    private async handleDeployMode(message: any): Promise<void> {
        const { modeId } = message;
        if (!modeId) {
            throw new Error('Mode ID is required for deployment');
        }
        
        console.log('🚀 [MessageHandler] Handling deployMode for:', modeId);
        await this.webviewProvider.handleDeployMode(modeId);
    }

    /**
     * Handle deployment reset requests
     */
    private async handleResetDeployment(message: any): Promise<void> {
        console.log('🔄 [MessageHandler] Handling resetDeployment');
        await this.webviewProvider.handleResetDeployment();
    }

    /**
     * Handle state refresh requests
     */
    private async handleRefreshState(message: any): Promise<void> {
        console.log('🔃 [MessageHandler] Handling refreshState');
        await this.webviewProvider.refreshState();
    }

    /**
     * Handle tab switching requests
     */
    private async handleSwitchTab(message: any): Promise<void> {
        const { tab } = message;
        if (!tab || !['modes', 'rules'].includes(tab)) {
            throw new Error('Valid tab (modes|rules) is required');
        }
        
        console.log('🔄 [MessageHandler] Handling switchTab to:', tab);
        await this.webviewProvider.handleSwitchTab(tab);
    }

    /**
     * Handle rule loading requests
     */
    private async handleLoadRules(message: any): Promise<void> {
        console.log('📋 [MessageHandler] Handling loadRules');
        await this.webviewProvider.handleLoadRules();
    }

    /**
     * Handle rule toggle requests
     */
    private async handleToggleRule(message: any): Promise<void> {
        const { ruleId } = message;
        if (!ruleId) {
            throw new Error('Rule ID is required for toggle operation');
        }
        
        console.log('🎯 [MessageHandler] Handling toggleRule for:', ruleId);
        await this.webviewProvider.handleToggleRule(ruleId);
    }

    /**
     * Handle rule urgency update requests
     */
    private async handleUpdateRuleUrgency(message: any): Promise<void> {
        const { ruleId, urgency } = message;
        if (!ruleId || !urgency) {
            throw new Error('Both rule ID and urgency are required');
        }
        
        console.log('⚡ [MessageHandler] Handling updateRuleUrgency for:', ruleId, 'to:', urgency);
        await this.webviewProvider.handleUpdateRuleUrgency(ruleId, urgency);
    }

    /**
     * Handle rule filtering requests
     */
    private async handleFilterRules(message: any): Promise<void> {
        const { filter } = message;
        if (!filter) {
            throw new Error('Filter configuration is required');
        }
        
        console.log('🔍 [MessageHandler] Handling filterRules with:', filter);
        await this.webviewProvider.handleFilterRules(filter);
    }

    /**
     * Handle add rule requests
     */
    private async handleAddRule(message: any): Promise<void> {
        const { rule } = message;
        if (!rule) {
            throw new Error('Rule data is required for add operation');
        }
        
        console.log('➕ [MessageHandler] Handling addRule:', rule);
        await this.webviewProvider.handleAddRule(rule);
    }

    /**
     * Handle remove rule requests
     */
    private async handleRemoveRule(message: any): Promise<void> {
        const { ruleId } = message;
        if (!ruleId) {
            throw new Error('Rule ID is required for remove operation');
        }
        
        console.log('➖ [MessageHandler] Handling removeRule for:', ruleId);
        await this.webviewProvider.handleRemoveRule(ruleId);
    }

    /**
     * Handle bulk operation requests
     */
    private async handleBulkOperation(message: any): Promise<void> {
        const { operation } = message;
        if (!operation) {
            throw new Error('Operation configuration is required for bulk operations');
        }
        
        console.log('📦 [MessageHandler] Handling bulkOperation:', operation);
        await this.webviewProvider.handleBulkOperation(operation);
    }

    /**
     * Handle rule export requests
     */
    private async handleExportRules(message: any): Promise<void> {
        const { ruleIds } = message;
        
        console.log('📤 [MessageHandler] Handling exportRules for:', ruleIds || 'all rules');
        await this.webviewProvider.handleExportRules(ruleIds);
    }

    /**
     * Handle rule import requests
     */
    private async handleImportRules(message: any): Promise<void> {
        console.log('📥 [MessageHandler] Handling importRules');
        await this.webviewProvider.handleImportRules();
    }

    /**
     * Handle custom mode deployment requests
     */
    private async handleDeployCustomMode(message: any): Promise<void> {
        const { customModeData } = message;
        if (!customModeData) {
            throw new Error('Custom mode data is required for deployment');
        }
        
        console.log('🔧 [MessageHandler] Handling deployCustomMode:', customModeData);
        await this.webviewProvider.handleDeployCustomMode(customModeData);
    }

    /**
     * Handle custom mode builder opening requests
     */
    private async handleOpenCustomModeBuilder(message: any): Promise<void> {
        console.log('🏗️ [MessageHandler] Handling openCustomModeBuilder');
        await this.webviewProvider.openCustomModeBuilder();
    }

    /**
     * Handle available rules loading requests
     */
    private async handleLoadAvailableRules(message: any): Promise<void> {
        console.log('📋 [MessageHandler] Handling loadAvailableRules');
        await this.webviewProvider.handleLoadAvailableRules();
    }

    /**
     * Handle custom mode creation requests
     */
    private async handleCreateCustomMode(message: any): Promise<void> {
        const { customModeData } = message;
        if (!customModeData) {
            throw new Error('Custom mode data is required for creation');
        }
        
        console.log('🎨 [MessageHandler] Handling createCustomMode:', customModeData);
        await this.webviewProvider.handleCreateCustomMode(customModeData);
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    /**
     * Get supported message types for validation
     */
    getSupportedMessageTypes(): string[] {
        return [
            // Mode management
            'deployMode',
            'resetDeployment', 
            'refreshState',
            
            // Tab management
            'switchTab',
            
            // Rule management
            'loadRules',
            'toggleRule',
            'updateRuleUrgency',
            'filterRules',
            'addRule',
            'removeRule',
            
            // Bulk operations
            'bulkOperation',
            'exportRules',
            'importRules',
            
            // Custom mode functionality
            'deployCustomMode',
            'openCustomModeBuilder',
            'loadAvailableRules',
            'createCustomMode'
        ];
    }

    /**
     * Validate if a message type is supported
     */
    isMessageTypeSupported(messageType: string): boolean {
        return this.getSupportedMessageTypes().includes(messageType);
    }

    /**
     * Get message handler statistics
     */
    getHandlerStats(): { totalHandlers: number; categories: string[] } {
        return {
            totalHandlers: this.getSupportedMessageTypes().length,
            categories: [
                'Mode Management',
                'Tab Management', 
                'Rule Management',
                'Bulk Operations',
                'Custom Mode Functionality'
            ]
        };
    }
}
