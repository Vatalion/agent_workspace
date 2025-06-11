/**
 * Action creators for UI state management
 * Provides type-safe action creation with payload validation
 */

import { UIAction, UIActionType } from '../UIState';
import { ModeInfo } from '../../../services/modeDiscovery';
import { RuleSet, RuleFilter } from '../../../services/ruleTypes';

/**
 * Loading action creators
 */
export const loadingActions = {
    setLoading: (isLoading: boolean): UIAction => ({
        type: UIActionType.SET_LOADING,
        payload: isLoading
    }),

    setDeploying: (isDeploying: boolean): UIAction => ({
        type: UIActionType.SET_DEPLOYING,
        payload: isDeploying
    })
};

/**
 * Mode management action creators
 */
export const modeActions = {
    setAvailableModes: (modes: ModeInfo[]): UIAction => ({
        type: UIActionType.SET_AVAILABLE_MODES,
        payload: modes
    }),

    setCurrentMode: (mode: string | null): UIAction => ({
        type: UIActionType.SET_CURRENT_MODE,
        payload: mode
    }),

    setDeployed: (isDeployed: boolean): UIAction => ({
        type: UIActionType.SET_DEPLOYED,
        payload: isDeployed
    }),

    setSelectedModes: (modeIds: string[]): UIAction => ({
        type: UIActionType.SET_SELECTED_MODES,
        payload: modeIds
    })
};

/**
 * Rule management action creators
 */
export const ruleActions = {
    setRuleSet: (ruleSet: RuleSet): UIAction => ({
        type: UIActionType.SET_RULE_SET,
        payload: ruleSet
    }),

    setRuleFilter: (filter: RuleFilter): UIAction => ({
        type: UIActionType.SET_RULE_FILTER,
        payload: filter
    })
};

/**
 * UI navigation action creators
 */
export const navigationActions = {
    switchTab: (tab: 'modes' | 'rules' | 'custom'): UIAction => ({
        type: UIActionType.SWITCH_TAB,
        payload: tab
    })
};

/**
 * Message and status action creators
 */
export const messageActions = {
    setError: (error: string | undefined): UIAction => ({
        type: UIActionType.SET_ERROR,
        payload: error
    }),

    setSuccess: (message: string | undefined): UIAction => ({
        type: UIActionType.SET_SUCCESS,
        payload: message
    }),

    clearMessages: (): UIAction => ({
        type: UIActionType.CLEAR_MESSAGES
    })
};

/**
 * Custom mode builder action creators
 */
export const customModeActions = {
    toggleCustomModeBuilder: (): UIAction => ({
        type: UIActionType.TOGGLE_CUSTOM_MODE_BUILDER
    }),

    updateCustomMode: (updates: Partial<{
        selectedRules: string[];
        modeName: string;
        modeDescription: string;
        isOpen: boolean;
    }>): UIAction => ({
        type: UIActionType.UPDATE_CUSTOM_MODE,
        payload: updates
    })
};

/**
 * Generic action creators
 */
export const genericActions = {
    updateState: (updates: any): UIAction => ({
        type: UIActionType.UPDATE_STATE,
        payload: updates
    })
};

/**
 * Combined action creators export
 */
export const actionCreators = {
    loading: loadingActions,
    modes: modeActions,
    rules: ruleActions,
    navigation: navigationActions,
    messages: messageActions,
    customMode: customModeActions,
    generic: genericActions
};

/**
 * Async action creators for complex operations
 */
export class AsyncActionCreators {
    constructor(private dispatch: (action: UIAction) => void) {}

    /**
     * Load modes with loading state management
     */
    async loadModes(loadModesFn: () => Promise<ModeInfo[]>): Promise<void> {
        this.dispatch(loadingActions.setLoading(true));
        this.dispatch(messageActions.clearMessages());

        try {
            const modes = await loadModesFn();
            this.dispatch(modeActions.setAvailableModes(modes));
        } catch (error) {
            this.dispatch(messageActions.setError(`Failed to load modes: ${error}`));
        } finally {
            this.dispatch(loadingActions.setLoading(false));
        }
    }

    /**
     * Deploy mode with deployment state management
     */
    async deployMode(deployFn: (modeId: string) => Promise<any>, modeId: string): Promise<void> {
        this.dispatch(loadingActions.setDeploying(true));
        this.dispatch(messageActions.clearMessages());

        try {
            await deployFn(modeId);
            this.dispatch(modeActions.setCurrentMode(modeId));
            this.dispatch(modeActions.setDeployed(true));
            this.dispatch(messageActions.setSuccess(`Mode "${modeId}" deployed successfully`));
        } catch (error) {
            this.dispatch(messageActions.setError(`Failed to deploy mode: ${error}`));
        } finally {
            this.dispatch(loadingActions.setDeploying(false));
        }
    }

    /**
     * Reset deployment with state cleanup
     */
    async resetDeployment(resetFn: () => Promise<void>): Promise<void> {
        this.dispatch(loadingActions.setDeploying(true));
        this.dispatch(messageActions.clearMessages());

        try {
            await resetFn();
            this.dispatch(modeActions.setCurrentMode(null));
            this.dispatch(modeActions.setDeployed(false));
            this.dispatch(messageActions.setSuccess('Deployment reset successfully'));
        } catch (error) {
            this.dispatch(messageActions.setError(`Failed to reset deployment: ${error}`));
        } finally {
            this.dispatch(loadingActions.setDeploying(false));
        }
    }
}
