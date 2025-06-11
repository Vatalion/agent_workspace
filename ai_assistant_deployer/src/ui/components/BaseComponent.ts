/**
 * Base UI Component System
 * Provides foundation for modular, reactive components
 */

import { UIStateManager } from '../state/StateManager';
import { UIState } from '../state/UIState';

/**
 * Base component interface
 */
export interface IUIComponent {
    render(): string;
    handleMessage?(message: any): Promise<void>;
    dispose?(): void;
}

/**
 * Component props interface
 */
export interface ComponentProps {
    state: UIState;
    onAction: (action: any) => void;
    className?: string;
    id?: string;
}

/**
 * Abstract base component class
 * Provides common functionality for all UI components
 */
export abstract class BaseUIComponent implements IUIComponent {
    protected props: ComponentProps;
    protected unsubscribe?: () => void;

    constructor(
        protected stateManager: UIStateManager,
        props: Partial<ComponentProps> = {}
    ) {
        this.props = {
            state: stateManager.getState(),
            onAction: (action) => stateManager.dispatch(action),
            ...props
        };

        // Subscribe to state changes
        this.unsubscribe = stateManager.subscribe((newState) => {
            this.props.state = newState;
            this.onStateChange(newState);
        });
    }

    /**
     * Abstract render method - must be implemented by subclasses
     */
    abstract render(): string;

    /**
     * Handle incoming messages (optional)
     */
    async handleMessage(message: any): Promise<void> {
        // Default implementation - can be overridden
    }

    /**
     * Called when state changes (optional)
     */
    protected onStateChange(newState: UIState): void {
        // Default implementation - can be overridden
    }

    /**
     * Cleanup method
     */
    dispose(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    /**
     * Utility methods for HTML generation
     */
    protected createButton(
        text: string,
        action: string,
        className = '',
        disabled = false
    ): string {
        return `
            <button 
                class="btn ${className}" 
                onclick="sendMessage('${action}')"
                ${disabled ? 'disabled' : ''}
            >
                ${text}
            </button>
        `;
    }

    protected createCard(title: string, content: string, className = ''): string {
        return `
            <div class="card ${className}">
                <div class="card-header">
                    <h3>${title}</h3>
                </div>
                <div class="card-content">
                    ${content}
                </div>
            </div>
        `;
    }

    protected createLoadingSpinner(text = 'Loading...'): string {
        return `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <span>${text}</span>
            </div>
        `;
    }

    protected createAlert(message: string, type: 'error' | 'success' | 'warning' = 'error'): string {
        return `
            <div class="alert alert-${type}">
                <span class="alert-icon">${type === 'error' ? '⚠️' : type === 'success' ? '✅' : '⚠️'}</span>
                <span class="alert-message">${message}</span>
                <button class="alert-close" onclick="sendMessage('clearMessages')">×</button>
            </div>
        `;
    }

    protected createTabNavigation(
        tabs: Array<{ id: string; label: string; active?: boolean }>,
        onTabChange: string
    ): string {
        return `
            <div class="tab-navigation">
                ${tabs.map(tab => `
                    <button 
                        class="tab-button ${tab.active ? 'active' : ''}"
                        onclick="sendMessage('${onTabChange}', '${tab.id}')"
                    >
                        ${tab.label}
                    </button>
                `).join('')}
            </div>
        `;
    }
}

/**
 * Component registry for managing component instances
 */
export class ComponentRegistry {
    private components = new Map<string, IUIComponent>();

    register(id: string, component: IUIComponent): void {
        // Dispose existing component if present
        if (this.components.has(id)) {
            this.components.get(id)?.dispose?.();
        }
        
        this.components.set(id, component);
    }

    get(id: string): IUIComponent | undefined {
        return this.components.get(id);
    }

    unregister(id: string): void {
        const component = this.components.get(id);
        if (component) {
            component.dispose?.();
            this.components.delete(id);
        }
    }

    disposeAll(): void {
        this.components.forEach(component => component.dispose?.());
        this.components.clear();
    }

    render(id: string): string {
        const component = this.components.get(id);
        return component?.render() || '';
    }

    async handleMessage(id: string, message: any): Promise<void> {
        const component = this.components.get(id);
        if (component?.handleMessage) {
            await component.handleMessage(message);
        }
    }
}

/**
 * Component factory for creating component instances
 */
export interface ComponentFactory<T extends IUIComponent> {
    create(stateManager: UIStateManager, props?: Partial<ComponentProps>): T;
}

/**
 * Higher-order component for adding common functionality
 */
export function withErrorBoundary<T extends IUIComponent>(
    ComponentClass: new (...args: any[]) => T
) {
    return class ErrorBoundaryComponent extends (ComponentClass as any) implements IUIComponent {
        render(): string {
            try {
                return super.render();
            } catch (error) {
                console.error('Component render error:', error);
                return `
                    <div class="error-boundary">
                        <h3>⚠️ Component Error</h3>
                        <p>An error occurred while rendering this component.</p>
                        <details>
                            <summary>Error Details</summary>
                            <pre>${error}</pre>
                        </details>
                    </div>
                `;
            }
        }
    } as new (...args: any[]) => T;
}
