import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';

export interface WorkspaceState {
    isDeployed: boolean;
    currentMode: string;
    projectType: string;
    hasSystemConfig: boolean;
    hasModeManager: boolean;
    lastUpdated: Date;
}

export class StateMonitor {
    private _onStateChanged = new vscode.EventEmitter<WorkspaceState>();
    public readonly onStateChanged = this._onStateChanged.event;
    
    private currentState: WorkspaceState | null = null;
    private monitoringInterval: NodeJS.Timeout | null = null;

    constructor() {}

    public startMonitoring(): void {
        this.stopMonitoring();
        
        // Monitor every 2 seconds
        this.monitoringInterval = setInterval(() => {
            this.checkWorkspaceState();
        }, 2000);
        
        // Initial check
        this.checkWorkspaceState();
    }

    public stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    public async getWorkspaceState(workspacePath?: string): Promise<WorkspaceState | null> {
        if (!workspacePath) {
            const workspaceFolder = this.getCurrentWorkspaceFolder();
            if (!workspaceFolder) {
                return null;
            }
            workspacePath = workspaceFolder.uri.fsPath;
        }

        return await this.analyzeWorkspaceState(workspacePath);
    }

    private async checkWorkspaceState(): Promise<void> {
        const workspaceFolder = this.getCurrentWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }

        const newState = await this.analyzeWorkspaceState(workspaceFolder.uri.fsPath);
        
        if (!this.currentState || this.hasStateChanged(this.currentState, newState)) {
            this.currentState = newState;
            this._onStateChanged.fire(newState);
        }
    }

    private async analyzeWorkspaceState(workspacePath: string): Promise<WorkspaceState> {
        const githubPath = path.join(workspacePath, '.github');
        const systemConfigPath = path.join(githubPath, 'system-config.json');
        const modeManagerPath = path.join(githubPath, 'mode-manager.sh');
        const copilotInstructionsPath = path.join(githubPath, 'copilot-instructions.md');

        // Check if AI Assistant is deployed
        const hasSystemConfig = await fs.pathExists(systemConfigPath);
        const hasModeManager = await fs.pathExists(modeManagerPath);
        const hasCopilotInstructions = await fs.pathExists(copilotInstructionsPath);
        
        const isDeployed = hasSystemConfig && hasModeManager && hasCopilotInstructions;

        // Get current mode
        let currentMode = 'none';
        if (hasSystemConfig) {
            try {
                const config = await fs.readJson(systemConfigPath);
                currentMode = config.current_mode || 'none';
            } catch (error) {
                console.error('Error reading system config:', error);
            }
        }

        // Detect project type
        const projectType = await this.detectProjectType(workspacePath);

        return {
            isDeployed,
            currentMode,
            projectType,
            hasSystemConfig,
            hasModeManager,
            lastUpdated: new Date()
        };
    }

    private async detectProjectType(workspacePath: string): Promise<string> {
        // Check for Flutter
        if (await fs.pathExists(path.join(workspacePath, 'pubspec.yaml'))) {
            return 'Flutter';
        }
        
        // Check for React/Node.js
        if (await fs.pathExists(path.join(workspacePath, 'package.json'))) {
            try {
                const packageJson = await fs.readJson(path.join(workspacePath, 'package.json'));
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
                
                if (dependencies.react) return 'React';
                if (dependencies['@angular/core']) return 'Angular';
                if (dependencies.vue) return 'Vue';
                if (dependencies.express || dependencies.fastify) return 'Node.js API';
                
                return 'Node.js';
            } catch {
                return 'Node.js';
            }
        }
        
        // Check for Python
        if (await fs.pathExists(path.join(workspacePath, 'requirements.txt')) ||
            await fs.pathExists(path.join(workspacePath, 'pyproject.toml')) ||
            await fs.pathExists(path.join(workspacePath, 'setup.py'))) {
            return 'Python';
        }
        
        // Check for VS Code Extension
        if (await fs.pathExists(path.join(workspacePath, 'package.json'))) {
            try {
                const packageJson = await fs.readJson(path.join(workspacePath, 'package.json'));
                if (packageJson.engines && packageJson.engines.vscode) {
                    return 'VS Code Extension';
                }
            } catch {}
        }

        return 'Unknown';
    }

    private hasStateChanged(oldState: WorkspaceState, newState: WorkspaceState): boolean {
        return (
            oldState.isDeployed !== newState.isDeployed ||
            oldState.currentMode !== newState.currentMode ||
            oldState.projectType !== newState.projectType ||
            oldState.hasSystemConfig !== newState.hasSystemConfig ||
            oldState.hasModeManager !== newState.hasModeManager
        );
    }

    private getCurrentWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            return vscode.workspace.workspaceFolders[0];
        }
        return undefined;
    }

    public dispose(): void {
        this.stopMonitoring();
        this._onStateChanged.dispose();
    }
}
