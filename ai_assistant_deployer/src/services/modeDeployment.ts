import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ModeInfo } from './modeDiscovery';

export interface DeploymentResult {
    success: boolean;
    message: string;
    deployedFiles: string[];
    cleanedFiles: string[];
    mode: string;
}

export class ModeDeploymentService {
    private workspaceRoot: string;
    private sourcePath: string;
    private targetPath: string;
    private backupPath: string;

    constructor(workspaceRoot: string) {
        this.workspaceRoot = workspaceRoot;
        this.sourcePath = path.join(__dirname, '..', '..', 'out', '.github');
        this.targetPath = path.join(workspaceRoot, '.github');
        this.backupPath = path.join(workspaceRoot, '.github-backup');
    }

    /**
     * Deploy a specific mode with cleanup of conflicting modes
     */
    async deployMode(modeInfo: ModeInfo): Promise<DeploymentResult> {
        const result: DeploymentResult = {
            success: false,
            message: '',
            deployedFiles: [],
            cleanedFiles: [],
            mode: modeInfo.id
        };

        try {
            // Step 1: Create backup of current state
            await this.createBackup();

            // Step 2: Clean up any existing deployed files
            const cleanedFiles = await this.cleanupExistingDeployment();
            result.cleanedFiles = cleanedFiles;

            // Step 3: Deploy base configuration files
            const baseFiles = await this.deployBaseFiles();
            result.deployedFiles.push(...baseFiles);

            // Step 4: Deploy mode-specific files
            const modeFiles = await this.deployModeFiles(modeInfo);
            result.deployedFiles.push(...modeFiles);

            // Step 5: Update system configuration
            await this.updateSystemConfig(modeInfo.id);
            result.deployedFiles.push('system-config.json');

            result.success = true;
            result.message = `Successfully deployed ${modeInfo.name} mode`;
            
            console.log(`Mode deployment completed:`, result);
            return result;

        } catch (error) {
            result.success = false;
            result.message = `Failed to deploy ${modeInfo.name}: ${error}`;
            console.error('Mode deployment failed:', error);
            
            // Attempt to restore from backup on failure
            try {
                await this.restoreFromBackup();
                result.message += ' (Previous state restored)';
            } catch (restoreError) {
                result.message += ' (Failed to restore previous state)';
                console.error('Failed to restore backup:', restoreError);
            }

            return result;
        }
    }

    /**
     * Reset all deployed files and return to clean state
     */
    async resetDeployment(): Promise<DeploymentResult> {
        const result: DeploymentResult = {
            success: false,
            message: '',
            deployedFiles: [],
            cleanedFiles: [],
            mode: 'none'
        };

        try {
            // Clean up all deployed files
            const cleanedFiles = await this.cleanupExistingDeployment();
            result.cleanedFiles = cleanedFiles;

            // Remove system config to indicate no mode is active
            const systemConfigPath = path.join(this.targetPath, 'system-config.json');
            if (fs.existsSync(systemConfigPath)) {
                fs.unlinkSync(systemConfigPath);
                result.cleanedFiles.push('system-config.json');
            }

            result.success = true;
            result.message = 'Successfully reset deployment - all modes cleared';
            
            console.log('Deployment reset completed:', result);
            return result;

        } catch (error) {
            result.success = false;
            result.message = `Failed to reset deployment: ${error}`;
            console.error('Deployment reset failed:', error);
            return result;
        }
    }

    /**
     * Clean up existing deployed files
     */
    private async cleanupExistingDeployment(): Promise<string[]> {
        const cleanedFiles: string[] = [];

        try {
            if (!fs.existsSync(this.targetPath)) {
                return cleanedFiles;
            }

            const items = fs.readdirSync(this.targetPath, { withFileTypes: true });
            
            for (const item of items) {
                const itemPath = path.join(this.targetPath, item.name);
                
                if (item.isFile()) {
                    fs.unlinkSync(itemPath);
                    cleanedFiles.push(item.name);
                } else if (item.isDirectory()) {
                    this.removeDirectoryRecursive(itemPath);
                    cleanedFiles.push(`${item.name}/`);
                }
            }

            console.log(`Cleaned up ${cleanedFiles.length} items:`, cleanedFiles);
        } catch (error) {
            console.error('Error during cleanup:', error);
            throw error;
        }

        return cleanedFiles;
    }

    /**
     * Deploy base configuration files (common to all modes)
     */
    private async deployBaseFiles(): Promise<string[]> {
        const deployedFiles: string[] = [];
        const baseFiles = [
            'mode-manager.sh',
            'update_project_map.sh',
            'PROJECT_MAP.md'
        ];

        // Ensure target directory exists
        if (!fs.existsSync(this.targetPath)) {
            fs.mkdirSync(this.targetPath, { recursive: true });
        }

        for (const fileName of baseFiles) {
            const sourcePath = path.join(this.sourcePath, fileName);
            const targetPath = path.join(this.targetPath, fileName);

            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, targetPath);
                deployedFiles.push(fileName);
                console.log(`Deployed base file: ${fileName}`);
            }
        }

        return deployedFiles;
    }

    /**
     * Deploy mode-specific files
     */
    private async deployModeFiles(modeInfo: ModeInfo): Promise<string[]> {
        const deployedFiles: string[] = [];
        const modeSourcePath = path.join(this.sourcePath, 'modes', modeInfo.id);

        if (!fs.existsSync(modeSourcePath)) {
            throw new Error(`Mode source directory not found: ${modeSourcePath}`);
        }

        // Copy mode-specific files to target
        await this.copyDirectoryRecursive(modeSourcePath, this.targetPath, deployedFiles);

        console.log(`Deployed ${deployedFiles.length} mode-specific files for ${modeInfo.id}`);
        return deployedFiles;
    }

    /**
     * Update system configuration with the active mode
     */
    private async updateSystemConfig(modeId: string): Promise<void> {
        const systemConfig = {
            mode: modeId,
            first_time_setup: false,
            deployment_timestamp: new Date().toISOString(),
            deployed_by: 'AI Assistant Deployer Extension'
        };

        const configPath = path.join(this.targetPath, 'system-config.json');
        fs.writeFileSync(configPath, JSON.stringify(systemConfig, null, 2));
        
        console.log(`Updated system config for mode: ${modeId}`);
    }

    /**
     * Create backup of current deployment state
     */
    private async createBackup(): Promise<void> {
        if (!fs.existsSync(this.targetPath)) {
            return; // Nothing to backup
        }

        // Remove old backup if it exists
        if (fs.existsSync(this.backupPath)) {
            this.removeDirectoryRecursive(this.backupPath);
        }

        // Create new backup
        await this.copyDirectoryRecursive(this.targetPath, this.backupPath);
        console.log('Created backup of current deployment');
    }

    /**
     * Restore from backup
     */
    private async restoreFromBackup(): Promise<void> {
        if (!fs.existsSync(this.backupPath)) {
            throw new Error('No backup found to restore from');
        }

        // Remove current deployment
        if (fs.existsSync(this.targetPath)) {
            this.removeDirectoryRecursive(this.targetPath);
        }

        // Restore from backup
        await this.copyDirectoryRecursive(this.backupPath, this.targetPath);
        console.log('Restored from backup');
    }

    /**
     * Copy directory recursively
     */
    private async copyDirectoryRecursive(source: string, target: string, fileList?: string[]): Promise<void> {
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }

        const items = fs.readdirSync(source, { withFileTypes: true });

        for (const item of items) {
            const sourcePath = path.join(source, item.name);
            const targetPath = path.join(target, item.name);

            if (item.isDirectory()) {
                await this.copyDirectoryRecursive(sourcePath, targetPath, fileList);
                if (fileList) {
                    fileList.push(`${item.name}/`);
                }
            } else {
                fs.copyFileSync(sourcePath, targetPath);
                if (fileList) {
                    fileList.push(item.name);
                }
            }
        }
    }

    /**
     * Remove directory recursively
     */
    private removeDirectoryRecursive(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            return;
        }

        const items = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const item of items) {
            const itemPath = path.join(dirPath, item.name);

            if (item.isDirectory()) {
                this.removeDirectoryRecursive(itemPath);
            } else {
                fs.unlinkSync(itemPath);
            }
        }

        fs.rmdirSync(dirPath);
    }
}
