/**
 * Centralized UI State Definition
 * Reactive state management for the AI Assistant Deployer extension
 */

import { ModeInfo } from '../../services/modeDiscovery';
import { RuleSet, RuleFilter } from '../../services/ruleTypes';

/**
 * Core UI state interface - single source of truth
 */
export interface UIState {
    // Loading states
    isLoading: boolean;
    isDeploying: boolean;
    
    // Mode management
    availableModes: ModeInfo[];
    currentMode: string | null;
    isDeployed: boolean;
    
    // Rule management
    currentRuleSet?: RuleSet;
    ruleFilter?: RuleFilter;
    
    // UI state
    activeTab: 'modes' | 'rules' | 'custom';
    selectedModeIds: string[];
    selectedRuleIds: string[];
    
    // Status and feedback
    lastUpdated: Date;
    error?: string;
    successMessage?: string;
    
    // Custom mode builder
    customModeBuilder: {
        isOpen: boolean;
        selectedRules: string[];
        modeName: string;
        modeDescription: string;
    };
}

/**
 * Initial state factory
 */
export function createInitialUIState(): UIState {
    return {
        isLoading: false,
        isDeploying: false,
        availableModes: [],
        currentMode: null,
        isDeployed: false,
        activeTab: 'modes',
        selectedModeIds: [],
        selectedRuleIds: [],
        lastUpdated: new Date(),
        customModeBuilder: {
            isOpen: false,
            selectedRules: [],
            modeName: '',
            modeDescription: ''
        }
    };
}

/**
 * State update types for type-safe updates
 */
export type UIStateUpdate = Partial<UIState>;

/**
 * Action types for state mutations
 */
export enum UIActionType {
    // Loading actions
    SET_LOADING = 'SET_LOADING',
    SET_DEPLOYING = 'SET_DEPLOYING',
    
    // Mode actions
    SET_AVAILABLE_MODES = 'SET_AVAILABLE_MODES',
    SET_CURRENT_MODE = 'SET_CURRENT_MODE',
    SET_DEPLOYED = 'SET_DEPLOYED',
    
    // Rule actions
    SET_RULE_SET = 'SET_RULE_SET',
    SET_RULE_FILTER = 'SET_RULE_FILTER',
    
    // UI actions
    SWITCH_TAB = 'SWITCH_TAB',
    SET_SELECTED_MODES = 'SET_SELECTED_MODES',
    
    // Status actions
    SET_ERROR = 'SET_ERROR',
    SET_SUCCESS = 'SET_SUCCESS',
    CLEAR_MESSAGES = 'CLEAR_MESSAGES',
    
    // Custom mode actions
    TOGGLE_CUSTOM_MODE_BUILDER = 'TOGGLE_CUSTOM_MODE_BUILDER',
    UPDATE_CUSTOM_MODE = 'UPDATE_CUSTOM_MODE',
    
    // Bulk update
    UPDATE_STATE = 'UPDATE_STATE'
}

/**
 * Action interfaces for type-safe action dispatching
 */
export interface UIAction {
    type: UIActionType;
    payload?: any;
}

export interface SetLoadingAction extends UIAction {
    type: UIActionType.SET_LOADING;
    payload: boolean;
}

export interface SetAvailableModesAction extends UIAction {
    type: UIActionType.SET_AVAILABLE_MODES;
    payload: ModeInfo[];
}

export interface SwitchTabAction extends UIAction {
    type: UIActionType.SWITCH_TAB;
    payload: 'modes' | 'rules' | 'custom';
}

export interface SetErrorAction extends UIAction {
    type: UIActionType.SET_ERROR;
    payload: string | undefined;
}

export interface UpdateStateAction extends UIAction {
    type: UIActionType.UPDATE_STATE;
    payload: UIStateUpdate;
}

/**
 * Union type of all possible actions
 */
export type UIActions = 
    | SetLoadingAction
    | SetAvailableModesAction
    | SwitchTabAction
    | SetErrorAction
    | UpdateStateAction
    | UIAction;
