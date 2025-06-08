# AI Assistant Deployer

A VS Code extension that deploys AI assistant configuration and tools into any project workspace.

## Features

🚀 **One-Click Deployment** - Deploy AI assistant to any workspace with a single command

🔍 **Automatic Project Detection** - Detects Flutter, React, Angular, Vue, Node.js, and Python projects

📋 **Task Management System** - Optional enhanced task tracking and workflow management

🔧 **Debug Tools Integration** - Project-specific debugging and error tracking utilities

🤖 **MCP Server Support** - Model Context Protocol server for AI communication

📦 **Backup & Restore** - Automatic backup of existing files before deployment

⚙️ **Flexible Configuration** - Choose which components to deploy

## Installation

1. Install the extension from the VS Code marketplace
2. Or install manually from `.vsix` file

## Usage

### Deploy AI Assistant

1. Open the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run **"AI Assistant: Deploy to Workspace"**
3. Choose deployment options:
   - **Full Deployment** - All components
   - **Quick Setup** - Minimal setup
   - **Custom Deployment** - Choose specific components

### Context Menu

Right-click on any folder in the Explorer and select **"Deploy AI Assistant to Workspace"**

## Components

### Core Components
- VS Code settings and configuration
- Project-specific AI assistant integration
- Error tracking and debugging tools

### Optional Components
- **Task Management System** - Enhanced project workflow management
- **MCP Server** - AI communication protocol server
- **Debug Tools** - Project-specific debugging utilities
- **Documentation** - Integration guides and usage documentation

## Supported Project Types

- **Flutter** - Dart/Flutter mobile and web applications
- **React** - React web applications
- **Angular** - Angular web applications  
- **Vue** - Vue.js web applications
- **Node.js** - Node.js backend applications
- **Python** - Python applications and scripts

## Configuration

After deployment, configuration files are stored in `.ai-assistant/` directory:

- `config.json` - Main configuration
- `task-config.json` - Task management settings
- `debug-config.json` - Debug tools configuration
- `mcp-config.json` - MCP server settings

## Commands

| Command | Description |
|---------|-------------|
| `AI Assistant: Deploy to Workspace` | Deploy AI assistant components |
| `AI Assistant: Detect Project Type` | Show detected project information |
| `AI Assistant: Setup Configuration` | Setup/reset AI assistant configuration |
| `AI Assistant: Remove from Workspace` | Remove AI assistant from workspace |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `aiAssistantDeployer.autoDetectProjectType` | `true` | Automatically detect project type |
| `aiAssistantDeployer.includeTaskManagement` | `true` | Include task management system |
| `aiAssistantDeployer.includeMCPServer` | `true` | Include MCP server files |
| `aiAssistantDeployer.backupExistingFiles` | `true` | Create backup before deployment |

## Development

### Building the Extension

```bash
npm install
npm run compile
npm run package
```

### Testing

```bash
npm run test
```

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and feature requests, please use the GitHub issue tracker.
