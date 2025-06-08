# Changelog

All notable changes to the AI Assistant Deployer extension will be documented in this file.

## [1.0.0] - 2025-06-07

### Added
- Initial release of AI Assistant Deployer
- Automatic project type detection for Flutter, React, Angular, Vue, Node.js, and Python
- One-click deployment with three deployment modes:
  - Full Deployment (all components)
  - Quick Setup (minimal configuration)  
  - Custom Deployment (choose specific components)
- Task Management System integration
- MCP (Model Context Protocol) server deployment
- Debug tools integration for supported project types
- Automatic backup and restore functionality
- VS Code settings and configuration management
- Context menu integration for easy access
- Comprehensive documentation and setup guides

### Features
- **Project Detection**: Smart detection of project type and configuration
- **Flexible Deployment**: Choose exactly which components to deploy
- **Backup System**: Automatic backup of existing files before deployment
- **Configuration Management**: Centralized configuration in `.ai-assistant/` directory
- **Multi-Platform Support**: Works with various project types and frameworks
- **VS Code Integration**: Seamless integration with VS Code workspace

### Components
- Core AI assistant integration
- Enhanced task management system
- Debug and error tracking tools
- MCP server for AI communication
- Project-specific configuration templates
- Documentation and usage guides

### Commands
- `aiAssistantDeployer.deployToWorkspace` - Deploy AI Assistant to workspace
- `aiAssistantDeployer.detectProjectType` - Detect and display project information
- `aiAssistantDeployer.setupConfiguration` - Setup/reset AI assistant configuration  
- `aiAssistantDeployer.removeAIAssistant` - Remove AI assistant from workspace

### Settings
- `aiAssistantDeployer.autoDetectProjectType` - Auto-detect project type
- `aiAssistantDeployer.includeTaskManagement` - Include task management
- `aiAssistantDeployer.includeMCPServer` - Include MCP server
- `aiAssistantDeployer.backupExistingFiles` - Create backups before deployment
