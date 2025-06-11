/**
 * Component Type Definitions for Modular UI System
 * Defines props and interfaces used by UI components
 */

import { UIState } from '../state/UIState';
import { ModeInfo } from '../../services/modeDiscovery';
import { Rule, RuleFilter } from '../../services/ruleTypes';

/**
 * Base component props that all components receive
 */
export interface BaseComponentProps {
    state: UIState;
    onAction: (action: ComponentAction) => void;
}

/**
 * Mode selector component props
 */
export interface ModeSelectorProps extends BaseComponentProps {
    showSearch?: boolean;
    allowMultiSelect?: boolean;
    compactView?: boolean;
}

/**
 * Rule manager component props
 */
export interface RuleManagerProps extends BaseComponentProps {
    showFilters?: boolean;
    allowBulkOperations?: boolean;
    compactView?: boolean;
}

/**
 * Component action types for inter-component communication
 */
export interface ComponentAction {
    type: string;
    payload?: any;
}

/**
 * Extended ModeInfo with additional properties for UI components
 */
export interface ExtendedModeInfo extends ModeInfo {
    complexity?: 'basic' | 'medium' | 'enterprise';
    ruleCount?: number;
    fileCount?: number;
    estimatedSize?: number;
}

/**
 * Extended Rule interface with backward compatibility
 */
export interface ExtendedRule extends Rule {
    enabled?: boolean; // Backward compatibility alias for isEnabled
    impact?: string;
    examples?: string[];
    version?: string;
    lastModified?: string;
}

/**
 * Extended RuleFilter with backward compatibility
 */
export interface ExtendedRuleFilter extends RuleFilter {
    searchTerm?: string; // Backward compatibility alias for searchText
    category?: string; // Single category filter (for UI convenience)
    urgency?: string; // Single urgency filter (for UI convenience)
}
