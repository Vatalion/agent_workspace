/**
 * Reactive State Manager
 * Implements observable pattern for UI state management
 */

import { UIState, UIAction, UIActionType, UIStateUpdate, createInitialUIState } from './UIState';

type StateChangeListener = (state: UIState) => void;
type StateSelector<T> = (state: UIState) => T;

/**
 * Reactive state manager with observer pattern
 * Provides centralized, predictable state management
 */
export class UIStateManager {
    private state: UIState;
    private listeners: Set<StateChangeListener> = new Set();
    private selectorCache = new Map<string, any>();

    constructor(initialState?: Partial<UIState>) {
        this.state = {
            ...createInitialUIState(),
            ...initialState
        };
    }

    /**
     * Get current state snapshot
     */
    getState(): UIState {
        return { ...this.state };
    }

    /**
     * Subscribe to state changes
     */
    subscribe(listener: StateChangeListener): () => void {
        this.listeners.add(listener);
        
        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Dispatch action to update state
     */
    dispatch(action: UIAction): void {
        const newState = this.reducer(this.state, action);
        
        if (newState !== this.state) {
            this.state = newState;
            this.notifyListeners();
            this.clearSelectorCache();
        }
    }

    /**
     * Select specific part of state with memoization
     */
    select<T>(selector: StateSelector<T>): T {
        const cacheKey = selector.toString();
        
        if (this.selectorCache.has(cacheKey)) {
            return this.selectorCache.get(cacheKey);
        }
        
        const result = selector(this.state);
        this.selectorCache.set(cacheKey, result);
        return result;
    }

    /**
     * Direct state update (for convenience)
     */
    updateState(updates: UIStateUpdate): void {
        this.dispatch({
            type: UIActionType.UPDATE_STATE,
            payload: updates
        });
    }

    /**
     * Action creators for common operations
     */
    actions = {
        setLoading: (isLoading: boolean) => 
            this.dispatch({ type: UIActionType.SET_LOADING, payload: isLoading }),
            
        setDeploying: (isDeploying: boolean) => 
            this.dispatch({ type: UIActionType.SET_DEPLOYING, payload: isDeploying }),
            
        setAvailableModes: (modes: any[]) => 
            this.dispatch({ type: UIActionType.SET_AVAILABLE_MODES, payload: modes }),
            
        setCurrentMode: (mode: string | null) => 
            this.dispatch({ type: UIActionType.SET_CURRENT_MODE, payload: mode }),
            
        switchTab: (tab: 'modes' | 'rules' | 'custom') => 
            this.dispatch({ type: UIActionType.SWITCH_TAB, payload: tab }),
            
        setError: (error: string | undefined) => 
            this.dispatch({ type: UIActionType.SET_ERROR, payload: error }),
            
        setSuccess: (message: string | undefined) => 
            this.dispatch({ type: UIActionType.SET_SUCCESS, payload: message }),
            
        clearMessages: () => 
            this.dispatch({ type: UIActionType.CLEAR_MESSAGES }),
            
        toggleCustomModeBuilder: () => 
            this.dispatch({ type: UIActionType.TOGGLE_CUSTOM_MODE_BUILDER })
    };

    /**
     * State reducer - handles all state mutations
     */
    private reducer(state: UIState, action: UIAction): UIState {
        switch (action.type) {
            case UIActionType.SET_LOADING:
                return { ...state, isLoading: action.payload };
                
            case UIActionType.SET_DEPLOYING:
                return { ...state, isDeploying: action.payload };
                
            case UIActionType.SET_AVAILABLE_MODES:
                return { ...state, availableModes: action.payload };
                
            case UIActionType.SET_CURRENT_MODE:
                return { ...state, currentMode: action.payload };
                
            case UIActionType.SET_DEPLOYED:
                return { ...state, isDeployed: action.payload };
                
            case UIActionType.SET_RULE_SET:
                return { ...state, currentRuleSet: action.payload };
                
            case UIActionType.SET_RULE_FILTER:
                return { ...state, ruleFilter: action.payload };
                
            case UIActionType.SWITCH_TAB:
                return { ...state, activeTab: action.payload };
                
            case UIActionType.SET_SELECTED_MODES:
                return { ...state, selectedModeIds: action.payload };
                
            case UIActionType.SET_ERROR:
                return { 
                    ...state, 
                    error: action.payload,
                    successMessage: undefined // Clear success when error occurs
                };
                
            case UIActionType.SET_SUCCESS:
                return { 
                    ...state, 
                    successMessage: action.payload,
                    error: undefined // Clear error when success occurs
                };
                
            case UIActionType.CLEAR_MESSAGES:
                return { 
                    ...state, 
                    error: undefined, 
                    successMessage: undefined 
                };
                
            case UIActionType.TOGGLE_CUSTOM_MODE_BUILDER:
                return {
                    ...state,
                    customModeBuilder: {
                        ...state.customModeBuilder,
                        isOpen: !state.customModeBuilder.isOpen
                    }
                };
                
            case UIActionType.UPDATE_CUSTOM_MODE:
                return {
                    ...state,
                    customModeBuilder: {
                        ...state.customModeBuilder,
                        ...action.payload
                    }
                };
                
            case UIActionType.UPDATE_STATE:
                return {
                    ...state,
                    ...action.payload,
                    lastUpdated: new Date()
                };
                
            default:
                return state;
        }
    }

    /**
     * Notify all subscribers of state changes
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener(this.state);
            } catch (error) {
                console.error('Error in state change listener:', error);
            }
        });
    }

    /**
     * Clear selector cache on state changes
     */
    private clearSelectorCache(): void {
        this.selectorCache.clear();
    }

    /**
     * Development helpers
     */
    getDebugInfo() {
        return {
            state: this.state,
            listenerCount: this.listeners.size,
            cacheSize: this.selectorCache.size
        };
    }
}
