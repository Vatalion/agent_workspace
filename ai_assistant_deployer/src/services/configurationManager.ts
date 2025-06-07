import * as fs from 'fs-extra';
import * as path from 'path';

export class ConfigurationManager {
    async setupConfiguration(workspacePath: string): Promise<void> {
        // Create AI assistant configuration directory
        const configDir = path.join(workspacePath, '.ai-assistant');
        await fs.ensureDir(configDir);

        // Create main configuration file
        const mainConfig = {
            version: '1.0.0',
            enabled: true,
            features: {
                taskManagement: true,
                errorTracking: true,
                debugAssistant: true,
                mcpServer: true
            },
            settings: {
                autoStart: true,
                logLevel: 'info',
                maxLogFiles: 10
            },
            integrations: {
                vscode: true,
                git: true,
                ci: false
            }
        };

        await fs.writeJson(path.join(configDir, 'config.json'), mainConfig, { spaces: 2 });

        // Create task management configuration
        const taskConfig = {
            phases: {
                planning: { timePercentage: '5-15%' },
                preparation: { timePercentage: '5-10%' },
                execution: { timePercentage: '70-80%' },
                completion: { timePercentage: '10-15%' }
            },
            complexityLevels: {
                E: { name: 'Easy', timeRange: '5-15min', maxFiles: 3 },
                M: { name: 'Medium', timeRange: '15-60min', maxFiles: 10 },
                H: { name: 'High', timeRange: '60min+', maxFiles: 'unlimited' }
            },
            templates: {
                useDefaults: true,
                customPath: null
            }
        };

        await fs.writeJson(path.join(configDir, 'task-config.json'), taskConfig, { spaces: 2 });

        // Create debug configuration
        const debugConfig = {
            errorTracking: {
                enabled: true,
                autoReport: false,
                includeStackTrace: true,
                includeContext: true
            },
            logging: {
                level: 'debug',
                console: true,
                file: true,
                maxSize: '10MB'
            },
            performance: {
                monitoring: true,
                metrics: ['cpu', 'memory', 'network'],
                interval: 5000
            }
        };

        await fs.writeJson(path.join(configDir, 'debug-config.json'), debugConfig, { spaces: 2 });

        // Create MCP server configuration
        const mcpConfig = {
            server: {
                port: 3000,
                host: 'localhost',
                autoStart: true
            },
            features: {
                codeAnalysis: true,
                errorReporting: true,
                taskManagement: true,
                fileOperations: true
            },
            security: {
                authentication: false,
                cors: true,
                rateLimiting: true
            }
        };

        await fs.writeJson(path.join(configDir, 'mcp-config.json'), mcpConfig, { spaces: 2 });

        // Create initialization script
        const initScript = `#!/bin/bash
# AI Assistant Initialization Script
echo "🤖 Starting AI Assistant..."

# Check dependencies
echo "📦 Checking dependencies..."

# Start MCP server if enabled
if [ -f ".ai-assistant/mcp-config.json" ]; then
    echo "🚀 Starting MCP server..."
    # Add MCP server start command here
fi

# Initialize task management
if [ -d ".tasks" ]; then
    echo "📋 Initializing task management..."
    # Add task management initialization here
fi

echo "✅ AI Assistant initialized successfully!"
`;

        await fs.writeFile(path.join(configDir, 'init.sh'), initScript);
        await fs.chmod(path.join(configDir, 'init.sh'), 0o755);

        // Create README with setup instructions
        const readme = `# AI Assistant Configuration

This directory contains the configuration files for the AI Assistant deployed in this workspace.

## Files

- \`config.json\` - Main AI Assistant configuration
- \`task-config.json\` - Task management system configuration  
- \`debug-config.json\` - Debug and error tracking configuration
- \`mcp-config.json\` - Model Context Protocol server configuration
- \`init.sh\` - Initialization script

## Usage

The AI Assistant is automatically configured and ready to use. You can modify the configuration files to customize the behavior.

### Starting the AI Assistant

Run the initialization script:
\`\`\`bash
./.ai-assistant/init.sh
\`\`\`

### Configuration

Modify the JSON configuration files to adjust settings. After making changes, restart VS Code or reload the window.

### Task Management

If task management is enabled, you can find task templates and workflows in the \`.tasks\` directory.

### Debug Tools

Debug tools are integrated into your development environment. Check the debug configuration for monitoring and error tracking options.

### MCP Server

The Model Context Protocol server enables communication between AI tools and your development environment. Configuration options are available in \`mcp-config.json\`.

## Support

For more information, check the documentation in the \`.ai-assistant/docs\` directory.
`;

        await fs.writeFile(path.join(configDir, 'README.md'), readme);
    }

    async updateConfiguration(workspacePath: string, updates: any): Promise<void> {
        const configPath = path.join(workspacePath, '.ai-assistant', 'config.json');
        
        if (await fs.pathExists(configPath)) {
            const config = await fs.readJson(configPath);
            const updatedConfig = { ...config, ...updates };
            await fs.writeJson(configPath, updatedConfig, { spaces: 2 });
        }
    }

    async getConfiguration(workspacePath: string): Promise<any> {
        const configPath = path.join(workspacePath, '.ai-assistant', 'config.json');
        
        if (await fs.pathExists(configPath)) {
            return await fs.readJson(configPath);
        }
        
        return null;
    }
}
