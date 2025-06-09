import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ModeInfo } from './modeDiscovery';
import { ModeGenerationPipeline, GenerationResult } from './modeGenerationPipeline';
import { ModeConfigurationService } from './modeConfigurationService';
import { RulePoolService } from './rulePoolService';

export interface DeploymentResult {
    success: boolean;
    message: string;
    deployedFiles: string[];
    cleanedFiles: string[];
    mode: string;
    deploymentMethod?: 'template-based' | 'rule-based';
    generationResult?: GenerationResult;
}

export class ModeDeploymentService {
    private workspaceRoot: string;
    private sourcePath: string;
    private targetPath: string;
    private backupPath: string;
    private extensionPath?: string;
    private generationPipeline?: ModeGenerationPipeline;

    constructor(workspaceRoot: string, extensionPath?: string) {
        this.workspaceRoot = workspaceRoot;
        this.extensionPath = extensionPath;
        // Use extensionPath if provided, otherwise fall back to __dirname calculation
        if (extensionPath) {
            this.sourcePath = path.join(extensionPath, 'out', '.github');
        } else {
            this.sourcePath = path.join(__dirname, '..', '..', 'out', '.github');
        }
        this.targetPath = path.join(workspaceRoot, '.github');
        this.backupPath = path.join(workspaceRoot, '.github-backup');
    }

    /**
     * Initialize the generation pipeline for rule-based deployment
     */
    async initializeGenerationPipeline(): Promise<void> {
        if (!this.extensionPath) {
            console.warn('[ModeDeployment] Extension path not provided, rule-based deployment unavailable');
            return;
        }

        try {
            const rulePoolService = new RulePoolService(this.extensionPath);
            await rulePoolService.initialize();
            
            const modeConfigService = new ModeConfigurationService(rulePoolService);
            
            this.generationPipeline = new ModeGenerationPipeline(
                modeConfigService, 
                rulePoolService, 
                this.extensionPath
            );
            
            console.log('[ModeDeployment] Generation pipeline initialized successfully');
        } catch (error) {
            console.error('[ModeDeployment] Failed to initialize generation pipeline:', error);
        }
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

            // Step 3: Check if this is a migrated configuration (rule-based deployment)
            const migratedConfigPath = await this.findMigratedConfiguration(modeInfo.id);
            
            if (migratedConfigPath && this.generationPipeline) {
                // Use rule-based deployment
                result.deploymentMethod = 'rule-based';
                const generationResult = await this.deployModeFromConfiguration(migratedConfigPath, modeInfo);
                result.generationResult = generationResult;
                result.deployedFiles = generationResult.generatedFiles;
                result.success = generationResult.success;
                result.message = generationResult.message;
            } else {
                // Fall back to template-based deployment
                result.deploymentMethod = 'template-based';
                
                // Deploy base configuration files
                const baseFiles = await this.deployBaseFiles();
                result.deployedFiles.push(...baseFiles);

                // Deploy mode-specific files
                const modeFiles = await this.deployModeFiles(modeInfo);
                result.deployedFiles.push(...modeFiles);

                result.success = true;
                result.message = `Successfully deployed ${modeInfo.name} mode (template-based)`;
            }

            // Step 4: Update system configuration
            await this.updateSystemConfig(modeInfo.id, result.deploymentMethod);
            result.deployedFiles.push('system-config.json');
            
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
     * Deploy mode from migrated configuration using rule-based generation
     */
    async deployModeFromConfiguration(configPath: string, modeInfo: ModeInfo): Promise<GenerationResult> {
        if (!this.generationPipeline) {
            throw new Error('Generation pipeline not initialized');
        }

        console.log(`[ModeDeployment] Deploying ${modeInfo.name} from configuration: ${configPath}`);

        // Generate mode files directly to target directory
        const generationResult = await this.generationPipeline.generateModeFromMigratedConfig(
            configPath,
            this.targetPath
        );

        console.log(`[ModeDeployment] Rule-based generation completed:`, generationResult);
        return generationResult;
    }

    /**
     * Find migrated configuration for a mode
     */
    private async findMigratedConfiguration(modeId: string): Promise<string | null> {
        if (!this.extensionPath) {
            return null;
        }

        const migratedConfigsPath = path.join(this.extensionPath, 'migrated-configs');
        
        if (!fs.existsSync(migratedConfigsPath)) {
            return null;
        }

        // Check for exact match first
        const exactMatch = path.join(migratedConfigsPath, `${modeId}-migrated.json`);
        if (fs.existsSync(exactMatch)) {
            return exactMatch;
        }

        // Check for partial matches (enterprise, simplified, hybrid)
        const partialMatches = [
            `${modeId}-migrated.json`,
            `${modeId.toLowerCase()}-migrated.json`,
            `${modeId.replace('_', '-')}-migrated.json`
        ];

        for (const filename of partialMatches) {
            const filePath = path.join(migratedConfigsPath, filename);
            if (fs.existsSync(filePath)) {
                return filePath;
            }
        }

        // Look for any configuration that might match this mode
        try {
            const configFiles = fs.readdirSync(migratedConfigsPath).filter(f => f.endsWith('-migrated.json'));
            
            for (const configFile of configFiles) {
                const configPath = path.join(migratedConfigsPath, configFile);
                try {
                    const configContent = await fs.promises.readFile(configPath, 'utf-8');
                    const config = JSON.parse(configContent);
                    
                    // Check if this configuration matches the mode
                    if (config.type === modeId || config.name?.toLowerCase().includes(modeId.toLowerCase())) {
                        console.log(`[ModeDeployment] Found matching configuration: ${configFile}`);
                        return configPath;
                    }
                } catch (error) {
                    console.warn(`[ModeDeployment] Could not read config file ${configFile}:`, error);
                }
            }
        } catch (error) {
            console.warn(`[ModeDeployment] Error scanning migrated configs:`, error);
        }

        return null;
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
    private async updateSystemConfig(modeId: string, deploymentMethod?: string): Promise<void> {
        const systemConfig = {
            mode: modeId,
            first_time_setup: false,
            deployment_timestamp: new Date().toISOString(),
            deployed_by: 'AI Assistant Deployer Extension',
            deployment_method: deploymentMethod || 'template-based'
        };

        const configPath = path.join(this.targetPath, 'system-config.json');
        fs.writeFileSync(configPath, JSON.stringify(systemConfig, null, 2));
        
        console.log(`Updated system config for mode: ${modeId} (${deploymentMethod || 'template-based'})`);
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

    /**
     * Create instructions file for custom modes
     */
    async createInstructions(customModeData: any): Promise<string> {
        try {
            console.log('📝 Creating instructions for custom mode:', customModeData.name);
            
            const instructionsContent = this.generateInstructionsContent(customModeData);
            const instructionsPath = path.join(this.workspaceRoot, '.github', 'ai-assistant-instructions.md');
            
            // Ensure .github directory exists
            const githubDir = path.dirname(instructionsPath);
            if (!fs.existsSync(githubDir)) {
                fs.mkdirSync(githubDir, { recursive: true });
            }
            
            fs.writeFileSync(instructionsPath, instructionsContent, 'utf8');
            console.log('✅ Instructions created at:', instructionsPath);
            
            return instructionsPath;
        } catch (error) {
            console.error('❌ Error creating instructions:', error);
            throw error;
        }
    }

    /**
     * Generate instructions content for custom mode
     */
    private generateInstructionsContent(customModeData: any): string {
        const timestamp = new Date().toISOString();
        const rules = customModeData.rules || [];
        const features = customModeData.features || [];
        
        let rulesContent = '';
        if (rules.length > 0) {
            rulesContent = rules.map((rule: any, index: number) => {
                const title = rule.title || `Rule ${index + 1}`;
                const description = rule.description || rule.content || 'No description provided';
                const category = rule.category ? `\n**Category:** ${rule.category}` : '';
                const urgency = rule.urgency ? `\n**Priority:** ${rule.urgency}` : '';
                const examples = rule.examples ? `\n**Examples:**\n${rule.examples}` : '';
                
                return `## ${index + 1}. ${title}\n${description}${category}${urgency}${examples}\n`;
            }).join('\n');
        } else {
            rulesContent = `## General Guidelines
- Follow best practices for the target technology
- Write clean, maintainable code
- Include proper error handling
- Add comprehensive documentation`;
        }

        let featuresContent = '';
        if (features.length > 0) {
            featuresContent = features.map((feature: string) => `- ${feature}`).join('\n');
        } else {
            featuresContent = `- Custom rule-based development assistance
- Project-specific guidance
- Best practice enforcement`;
        }
        
        return `# ${customModeData.name} - AI Assistant Instructions

> Generated on: ${timestamp}
> Mode Type: Custom
> Target Project: ${customModeData.targetProject || 'General'}

## Description
${customModeData.description}

## Instructions
When generating code, please follow these user provided coding instructions. You can ignore an instruction if it contradicts a system message.

<instructions>
# ${customModeData.name} Mode

${rulesContent}

## Estimated Setup Time
Approximately ${customModeData.estimatedHours || 2} hours

## Mode Features
${featuresContent}

</instructions>

---
*Generated by AI Assistant Deployer - Custom Mode Builder*
`;
    }
}
