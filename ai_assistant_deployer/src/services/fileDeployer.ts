import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectType } from './projectDetector';

interface DeploymentOptions {
    includeTaskManagement: boolean;
    includeMCPServer: boolean;
    includeDebugTools: boolean;
    includeDocumentation: boolean;
    createBackup: boolean;
    deploymentType: 'full' | 'minimal' | 'custom';
}

export class FileDeployer {
    private extensionPath: string;

    constructor(context: vscode.ExtensionContext) {
        this.extensionPath = context.extensionPath;
    }

    async deployFromOutFolder(workspacePath: string, outPath: string, mode: string): Promise<void> {
        try {
            // Ensure the workspace .github directory exists
            const workspaceGithubPath = path.join(workspacePath, '.github');
            await fs.ensureDir(workspaceGithubPath);

            // Copy all files from out/.github to workspace/.github
            if (await fs.pathExists(outPath)) {
                await fs.copy(outPath, workspaceGithubPath, { 
                    overwrite: true,
                    filter: (src: string, dest: string) => {
                        // Don't copy .history folder
                        return !src.includes('.history');
                    }
                });
            }

            // Make scripts executable
            const scripts = [
                path.join(workspaceGithubPath, 'mode-manager.sh'),
                path.join(workspaceGithubPath, 'update_project_map.sh')
            ];

            for (const script of scripts) {
                if (await fs.pathExists(script)) {
                    await fs.chmod(script, 0o755);
                }
            }

            // Make mode-specific scripts executable
            const modeScriptsPath = path.join(workspaceGithubPath, 'modes', mode, 'scripts');
            if (await fs.pathExists(modeScriptsPath)) {
                const modeScripts = await fs.readdir(modeScriptsPath);
                for (const script of modeScripts) {
                    if (script.endsWith('.sh')) {
                        const scriptPath = path.join(modeScriptsPath, script);
                        await fs.chmod(scriptPath, 0o755);
                    }
                }
            }

            // Set the selected mode in system-config.json
            const systemConfigPath = path.join(workspaceGithubPath, 'system-config.json');
            if (await fs.pathExists(systemConfigPath)) {
                const config = await fs.readJson(systemConfigPath);
                config.current_mode = mode;
                config.first_time_setup = false;
                await fs.writeJson(systemConfigPath, config, { spaces: 2 });
            }

        } catch (error) {
            throw new Error(`Failed to deploy from out folder: ${error}`);
        }
    }

    async deployToWorkspace(workspacePath: string, projectType: ProjectType, options: DeploymentOptions): Promise<void> {
        const sourceBasePath = path.join(this.extensionPath, '..', '..');

        // Deploy core AI assistant files
        await this.deployCoreFiles(workspacePath, sourceBasePath, projectType);

        // Deploy optional components based on options
        if (options.includeTaskManagement) {
            await this.deployTaskManagement(workspacePath, sourceBasePath);
        }

        if (options.includeMCPServer) {
            await this.deployMCPServer(workspacePath, sourceBasePath);
        }

        if (options.includeDebugTools) {
            await this.deployDebugTools(workspacePath, sourceBasePath, projectType);
        }

        if (options.includeDocumentation) {
            await this.deployDocumentation(workspacePath, sourceBasePath);
        }

        // Setup project-specific configuration
        await this.setupProjectConfiguration(workspacePath, projectType, options);

        // Create workspace settings
        await this.createWorkspaceSettings(workspacePath, projectType, options);
    }

    private async deployCoreFiles(workspacePath: string, sourceBasePath: string, projectType: ProjectType): Promise<void> {
        const coreFiles = [
            '.vscode/settings.json',
            '.vscode/launch.json',
            '.vscode/extensions.json'
        ];

        for (const file of coreFiles) {
            await this.copyFileIfExists(sourceBasePath, workspacePath, file);
        }

        // Create AI assistant configuration
        const aiConfigPath = path.join(workspacePath, '.ai-assistant');
        await fs.ensureDir(aiConfigPath);

        const config = {
            version: '1.0.0',
            projectType,
            deployedAt: new Date().toISOString(),
            components: {
                taskManagement: false,
                mcpServer: false,
                debugTools: false,
                documentation: false
            }
        };

        await fs.writeJson(path.join(aiConfigPath, 'config.json'), config, { spaces: 2 });
    }

    private async deployTaskManagement(workspacePath: string, sourceBasePath: string): Promise<void> {
        const taskMgmtSource = path.join(sourceBasePath, '.github', 'task-management');
        const taskMgmtDest = path.join(workspacePath, '.github', 'task-management');

        if (await fs.pathExists(taskMgmtSource)) {
            await fs.copy(taskMgmtSource, taskMgmtDest, { overwrite: true });
        }

        // Setup tasks folder structure
        const tasksPath = path.join(workspacePath, '.tasks');
        await fs.ensureDir(tasksPath);

        const structure = [
            '1_planning/active',
            '1_planning/approved', 
            '1_planning/templates',
            '2_preparation/active',
            '2_preparation/ready',
            '2_preparation/templates',
            '3_execution/active',
            '3_execution/pending',
            '3_execution/completed',
            '3_execution/blocked',
            '3_execution/suspended',
            '3_execution/templates',
            '4_completion/validating',
            '4_completion/completed',
            '4_completion/failed',
            '4_completion/templates',
            'system/scripts',
            'system/templates',
            'archives'
        ];

        for (const dir of structure) {
            await fs.ensureDir(path.join(tasksPath, dir));
        }

        // Update AI assistant config
        await this.updateAIConfig(workspacePath, { taskManagement: true });
    }

    private async deployMCPServer(workspacePath: string, sourceBasePath: string): Promise<void> {
        const mcpFiles = [
            'flutter_debug_extension/mcp-server.js',
            'flutter_debug_extension/package.json'
        ];

        const mcpDir = path.join(workspacePath, '.ai-assistant', 'mcp');
        await fs.ensureDir(mcpDir);

        for (const file of mcpFiles) {
            const sourcePath = path.join(sourceBasePath, file);
            const destPath = path.join(mcpDir, path.basename(file));
            
            if (await fs.pathExists(sourcePath)) {
                await fs.copy(sourcePath, destPath);
            }
        }

        // Create MCP configuration
        const mcpConfig = {
            name: 'ai-assistant-mcp',
            version: '1.0.0',
            port: 3000,
            enabled: true
        };

        await fs.writeJson(path.join(mcpDir, 'config.json'), mcpConfig, { spaces: 2 });

        // Update AI assistant config
        await this.updateAIConfig(workspacePath, { mcpServer: true });
    }

    private async deployDebugTools(workspacePath: string, sourceBasePath: string, projectType: ProjectType): Promise<void> {
        const debugDir = path.join(workspacePath, '.ai-assistant', 'debug');
        await fs.ensureDir(debugDir);

        if (projectType === 'flutter') {
            // Copy Flutter-specific debug tools
            const flutterDebugFiles = [
                'lib/core/error_transport.dart',
                'lib/services/error_service.dart'
            ];

            for (const file of flutterDebugFiles) {
                await this.copyFileIfExists(sourceBasePath, workspacePath, file);
            }

            // Copy Flutter debug extension
            const extensionSource = path.join(sourceBasePath, 'flutter_debug_extension');
            const extensionDest = path.join(debugDir, 'flutter_extension');
            
            if (await fs.pathExists(extensionSource)) {
                await fs.copy(extensionSource, extensionDest);
            }
        }

        // Update AI assistant config
        await this.updateAIConfig(workspacePath, { debugTools: true });
    }

    private async deployDocumentation(workspacePath: string, sourceBasePath: string): Promise<void> {
        const docsSource = path.join(sourceBasePath, 'docs');
        const docsDest = path.join(workspacePath, '.ai-assistant', 'docs');

        if (await fs.pathExists(docsSource)) {
            await fs.copy(docsSource, docsDest);
        }

        // Update AI assistant config
        await this.updateAIConfig(workspacePath, { documentation: true });
    }

    private async setupProjectConfiguration(workspacePath: string, projectType: ProjectType, options: DeploymentOptions): Promise<void> {
        switch (projectType) {
            case 'flutter':
                await this.setupFlutterConfiguration(workspacePath, options);
                break;
            case 'react':
            case 'angular':
            case 'vue':
            case 'node':
                await this.setupNodeConfiguration(workspacePath, options);
                break;
            case 'python':
                await this.setupPythonConfiguration(workspacePath, options);
                break;
        }
    }

    private async setupFlutterConfiguration(workspacePath: string, options: DeploymentOptions): Promise<void> {
        // Add AI assistant dependency to pubspec.yaml if it doesn't exist
        const pubspecPath = path.join(workspacePath, 'pubspec.yaml');
        if (await fs.pathExists(pubspecPath)) {
            const content = await fs.readFile(pubspecPath, 'utf8');
            
            if (!content.includes('flutter_error_transport:')) {
                const lines = content.split('\n');
                const depIndex = lines.findIndex((line: string) => line.trim() === 'dependencies:');
                
                if (depIndex !== -1) {
                    lines.splice(depIndex + 2, 0, '  flutter_error_transport: ^1.0.0');
                    await fs.writeFile(pubspecPath, lines.join('\n'));
                }
            }
        }
    }

    private async setupNodeConfiguration(workspacePath: string, options: DeploymentOptions): Promise<void> {
        const packageJsonPath = path.join(workspacePath, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            
            if (!packageJson.devDependencies) {
                packageJson.devDependencies = {};
            }
            
            // Add AI assistant related dependencies
            packageJson.devDependencies['@ai-assistant/debug-tools'] = '^1.0.0';
            
            await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        }
    }

    private async setupPythonConfiguration(workspacePath: string, options: DeploymentOptions): Promise<void> {
        const reqPath = path.join(workspacePath, 'requirements.txt');
        let requirements = '';
        
        if (await fs.pathExists(reqPath)) {
            requirements = await fs.readFile(reqPath, 'utf8');
        }
        
        if (!requirements.includes('ai-assistant-debug-tools')) {
            requirements += '\nai-assistant-debug-tools>=1.0.0\n';
            await fs.writeFile(reqPath, requirements);
        }
    }

    private async createWorkspaceSettings(workspacePath: string, projectType: ProjectType, options: DeploymentOptions): Promise<void> {
        const vscodeDir = path.join(workspacePath, '.vscode');
        await fs.ensureDir(vscodeDir);

        const settings = {
            'ai-assistant.enabled': true,
            'ai-assistant.projectType': projectType,
            'ai-assistant.taskManagement.enabled': options.includeTaskManagement,
            'ai-assistant.mcp.enabled': options.includeMCPServer,
            'ai-assistant.debug.enabled': options.includeDebugTools,
            'files.exclude': {
                '**/.ai-assistant/temp/**': true
            }
        };

        const settingsPath = path.join(vscodeDir, 'settings.json');
        let existingSettings = {};
        
        if (await fs.pathExists(settingsPath)) {
            try {
                existingSettings = await fs.readJson(settingsPath);
            } catch {
                // If parsing fails, start with empty object
            }
        }

        const mergedSettings = { ...existingSettings, ...settings };
        await fs.writeJson(settingsPath, mergedSettings, { spaces: 2 });
    }

    async removeFromWorkspace(workspacePath: string): Promise<void> {
        const itemsToRemove = [
            '.ai-assistant',
            '.tasks',
            '.github/task-management'
        ];

        for (const item of itemsToRemove) {
            const itemPath = path.join(workspacePath, item);
            if (await fs.pathExists(itemPath)) {
                await fs.remove(itemPath);
            }
        }

        // Clean up VS Code settings
        const settingsPath = path.join(workspacePath, '.vscode', 'settings.json');
        if (await fs.pathExists(settingsPath)) {
            try {
                const settings = await fs.readJson(settingsPath);
                
                // Remove AI assistant related settings
                Object.keys(settings).forEach(key => {
                    if (key.startsWith('ai-assistant.')) {
                        delete settings[key];
                    }
                });

                await fs.writeJson(settingsPath, settings, { spaces: 2 });
            } catch {
                // Ignore errors in settings cleanup
            }
        }
    }

    private async copyFileIfExists(sourcePath: string, destPath: string, relativePath: string): Promise<void> {
        const source = path.join(sourcePath, relativePath);
        const dest = path.join(destPath, relativePath);
        
        if (await fs.pathExists(source)) {
            await fs.ensureDir(path.dirname(dest));
            await fs.copy(source, dest);
        }
    }

    private async updateAIConfig(workspacePath: string, components: Partial<Record<string, boolean>>): Promise<void> {
        const configPath = path.join(workspacePath, '.ai-assistant', 'config.json');
        
        if (await fs.pathExists(configPath)) {
            const config = await fs.readJson(configPath);
            config.components = { ...config.components, ...components };
            await fs.writeJson(configPath, config, { spaces: 2 });
        }
    }
}
