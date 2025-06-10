import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface ModeInfo {
    id: string;
    name: string;
    description: string;
    features: string[];
    targetProject: string;
    estimatedHours: string;
    isActive: boolean;
    hasConflicts: boolean;
    path: string;
}

export class ModeDiscoveryService {
    private workspaceRoot: string;
    private modesPath: string;
    private deployedPath: string;

    constructor(workspaceRoot: string, extensionPath?: string) {
        this.workspaceRoot = workspaceRoot;
        // Use extensionPath if provided, otherwise fall back to __dirname calculation
        if (extensionPath) {
            this.modesPath = path.join(extensionPath, 'out', '.github', 'modes');
        } else {
            this.modesPath = path.join(__dirname, '..', '..', 'out', '.github', 'modes');
        }
        this.deployedPath = path.join(workspaceRoot, '.github');
    }

    /**
     * Discover all available modes by scanning the modes directory
     */
    async discoverAvailableModes(): Promise<ModeInfo[]> {
        const modes: ModeInfo[] = [];

        try {
            if (!fs.existsSync(this.modesPath)) {
                console.log('Modes directory not found:', this.modesPath);
                return modes;
            }

            const modeDirectories = fs.readdirSync(this.modesPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const modeId of modeDirectories) {
                const modeInfo = await this.analyzeModeDirectory(modeId);
                if (modeInfo) {
                    modes.push(modeInfo);
                }
            }

            console.log(`Discovered ${modes.length} modes:`, modes.map(m => m.id));
            return modes;
        } catch (error) {
            console.error('Error discovering modes:', error);
            return modes;
        }
    }

    /**
     * Analyze a specific mode directory and extract metadata
     */
    private async analyzeModeDirectory(modeId: string): Promise<ModeInfo | null> {
        const modePath = path.join(this.modesPath, modeId);
        const instructionsPath = path.join(modePath, 'copilot-instructions.md');

        try {
            // Check if mode has required files
            if (!fs.existsSync(instructionsPath)) {
                console.log(`Mode ${modeId} missing copilot-instructions.md`);
                return null;
            }

            // Parse the copilot-instructions.md file for metadata
            const instructionsContent = fs.readFileSync(instructionsPath, 'utf8');
            const metadata = this.parseInstructionsMetadata(instructionsContent, modeId);

            // Check if this mode is currently active
            const isActive = await this.isModeActive(modeId);
            const hasConflicts = await this.checkModeConflicts(modeId);

            return {
                id: modeId,
                name: metadata.name || this.capitalizeModeName(modeId),
                description: metadata.description || `${modeId} mode configuration`,
                features: metadata.features || [],
                targetProject: metadata.targetProject || 'General projects',
                estimatedHours: metadata.estimatedHours || 'Unknown',
                isActive,
                hasConflicts,
                path: modePath
            };
        } catch (error) {
            console.error(`Error analyzing mode ${modeId}:`, error);
            return null;
        }
    }

    /**
     * Parse metadata from copilot-instructions.md content
     */
    private parseInstructionsMetadata(content: string, modeId: string): Partial<ModeInfo> {
        const metadata: Partial<ModeInfo> = {};

        // Extract mode name from headers
        const nameMatch = content.match(/# GitHub Copilot Instructions - (.+?)(?:\n|$)/i);
        if (nameMatch) {
            metadata.name = nameMatch[1].replace(/MODE$/, '').trim();
        }

        // Extract description from overview section
        const overviewMatch = content.match(/## Mode Overview\s*\n([\s\S]*?)(?=\n##|\n```|$)/i);
        if (overviewMatch) {
            const overviewText = overviewMatch[1].trim();
            const descMatch = overviewText.match(/- \*\*Target\*\*: (.+?)(?:\n|$)/);
            if (descMatch) {
                metadata.description = descMatch[1];
            }
        }

        // Extract features
        const featuresMatch = content.match(/- \*\*Features\*\*: (.+?)(?:\n|$)/);
        if (featuresMatch) {
            metadata.features = featuresMatch[1].split(',').map(f => f.trim());
        }

        // Extract target project info
        const targetMatch = content.match(/- \*\*Best For\*\*: (.+?)(?:\n|$)/);
        if (targetMatch) {
            metadata.targetProject = targetMatch[1];
        }

        // Extract estimated hours (look for patterns like "< 20 hours", "50+ hours", etc.)
        const hoursMatch = content.match(/([<>]?\s*\d+[+]?\s*hours?)/i);
        if (hoursMatch) {
            metadata.estimatedHours = hoursMatch[1];
        }

        return metadata;
    }

    /**
     * Check if a specific mode is currently active in the workspace
     */
    private async isModeActive(modeId: string): Promise<boolean> {
        const systemConfigPath = path.join(this.deployedPath, 'system-config.json');
        
        try {
            if (!fs.existsSync(systemConfigPath)) {
                return false;
            }

            const configContent = fs.readFileSync(systemConfigPath, 'utf8');
            const config = JSON.parse(configContent);
            return config.mode === modeId && config.first_time_setup === false;
        } catch (error) {
            console.error('Error checking active mode:', error);
            return false;
        }
    }

    /**
     * Check if deploying this mode would conflict with currently deployed files
     */
    private async checkModeConflicts(modeId: string): Promise<boolean> {
        try {
            // Check if there are deployed files that don't belong to this mode
            const deployedFiles = await this.getDeployedFiles();
            const currentActiveMode = await this.getCurrentActiveMode();
            
            // If there's an active mode and it's different from this one, there's a potential conflict
            return currentActiveMode !== null && currentActiveMode !== modeId && deployedFiles.length > 0;
        } catch (error) {
            console.error('Error checking mode conflicts:', error);
            return false;
        }
    }

    /**
     * Get list of currently deployed files
     */
    private async getDeployedFiles(): Promise<string[]> {
        const deployedFiles: string[] = [];
        
        try {
            if (!fs.existsSync(this.deployedPath)) {
                return deployedFiles;
            }

            const files = fs.readdirSync(this.deployedPath, { withFileTypes: true });
            for (const file of files) {
                if (file.isFile()) {
                    deployedFiles.push(file.name);
                }
            }
        } catch (error) {
            console.error('Error getting deployed files:', error);
        }

        return deployedFiles;
    }

    /**
     * Get the currently active mode
     */
    private async getCurrentActiveMode(): Promise<string | null> {
        const systemConfigPath = path.join(this.deployedPath, 'system-config.json');
        
        try {
            if (!fs.existsSync(systemConfigPath)) {
                return null;
            }

            const configContent = fs.readFileSync(systemConfigPath, 'utf8');
            const config = JSON.parse(configContent);
            return config.mode || null;
        } catch (error) {
            console.error('Error getting current active mode:', error);
            return null;
        }
    }

    /**
     * Capitalize mode name for display
     */
    private capitalizeModeName(modeId: string): string {
        return modeId.charAt(0).toUpperCase() + modeId.slice(1);
    }

    /**
     * Watch for changes in the workspace that might affect mode states
     */
    setupFileWatcher(callback: () => void): vscode.Disposable {
        const systemConfigPath = path.join(this.deployedPath, 'system-config.json');
        const watcher = vscode.workspace.createFileSystemWatcher(systemConfigPath);
        
        watcher.onDidChange(callback);
        watcher.onDidCreate(callback);
        watcher.onDidDelete(callback);
        
        return watcher;
    }
}
