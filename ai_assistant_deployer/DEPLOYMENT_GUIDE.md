# AI Assistant Deployment Guide

This guide explains how to use the AI Assistant Deployer extension to deploy AI assistant capabilities into any project workspace.

## Quick Start

1. **Install the Extension**
   ```bash
   code --install-extension ai-assistant-deployer-1.0.0.vsix
   ```

2. **Open Your Project**
   - Open any project workspace in VS Code
   - The extension supports Flutter, React, Angular, Vue, Node.js, and Python projects

3. **Deploy AI Assistant**
   - Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
   - Run **"AI Assistant: Deploy to Workspace"**
   - Choose your deployment option

## Deployment Options

### 🚀 Full Deployment
Deploys all AI assistant components:
- Task management system
- MCP server for AI communication
- Debug tools and error tracking
- VS Code configuration
- Documentation and guides

### ⚡ Quick Setup  
Minimal deployment for basic AI assistant functionality:
- Core VS Code settings
- Basic configuration files
- Essential debugging tools

### 🛠️ Custom Deployment
Choose specific components to deploy:
- Select individual features
- Customize based on project needs
- Granular control over deployment

## What Gets Deployed

### Core Files
- `.ai-assistant/config.json` - Main configuration
- `.vscode/settings.json` - VS Code settings (updated)
- Project-specific integration files

### Task Management System
- `.tasks/` directory structure
- Four-phase workflow system
- Task templates and automation
- Enhanced project organization

### Debug Tools
- Error tracking and reporting
- Performance monitoring  
- Project-specific debug utilities
- Integration with existing tools

### MCP Server
- Model Context Protocol server
- AI communication infrastructure
- API endpoints for AI tools
- Configuration and security settings

## Project-Specific Deployments

### Flutter Projects
- Integrates with `pubspec.yaml`
- Adds Flutter-specific debug tools
- Error transport mechanism
- Widget testing enhancements

### React/Node.js Projects
- Updates `package.json` with dependencies
- Adds React debugging middleware
- Performance monitoring tools
- Development server integration

### Python Projects
- Updates `requirements.txt`
- Adds Python debugging utilities
- Error handling and logging
- Virtual environment integration

### Other Projects
- Generic AI assistant integration
- Basic debugging and monitoring
- Configurable based on project structure

## Post-Deployment

### Configuration
After deployment, you can customize the AI assistant by editing:
- `.ai-assistant/config.json` - Main settings
- `.ai-assistant/task-config.json` - Task management
- `.ai-assistant/debug-config.json` - Debug tools
- `.ai-assistant/mcp-config.json` - MCP server

### Initialization
Run the initialization script to start AI assistant services:
```bash
./.ai-assistant/init.sh
```

### VS Code Integration
The extension automatically configures VS Code with:
- Recommended settings for AI development
- Debug configurations
- Task definitions
- Extension recommendations

## Commands Reference

| Command | Description | Usage |
|---------|-------------|-------|
| `AI Assistant: Deploy to Workspace` | Deploy AI assistant to current workspace | Main deployment command |
| `AI Assistant: Detect Project Type` | Show detected project information | Diagnostic tool |
| `AI Assistant: Setup Configuration` | Setup/reset AI assistant configuration | Configuration management |
| `AI Assistant: Remove from Workspace` | Remove AI assistant from workspace | Cleanup tool |

## Backup and Recovery

### Automatic Backup
The extension automatically creates backups of:
- Existing VS Code settings
- Project configuration files
- Package manifests (package.json, pubspec.yaml, etc.)

Backups are stored in `.ai-assistant/backups/` with timestamps.

### Manual Backup
Create a manual backup before deployment:
```bash
# Backup is created automatically by default
# Disable in settings if not needed
```

### Recovery
Restore from backup if needed:
- Use VS Code command palette
- Select backup from list
- Automatic restoration of original files

## Troubleshooting

### Common Issues

**Extension not found**
- Ensure VS Code is updated to latest version
- Check extension is properly installed: `code --list-extensions`

**Deployment fails**
- Check workspace permissions
- Ensure project directory is writable
- Review VS Code output panel for errors

**MCP server won't start**
- Check port 3000 is available
- Review MCP configuration in `.ai-assistant/mcp-config.json`
- Check Node.js is installed

**Task management not working**
- Verify `.tasks/` directory structure
- Check task templates are properly deployed
- Review task configuration settings

### Getting Help

1. **Check Documentation**
   - Review `.ai-assistant/docs/` directory
   - Check project-specific integration guides

2. **Debug Mode**
   - Enable debug logging in configuration
   - Check VS Code output panels
   - Review log files in `.ai-assistant/logs/`

3. **Reset Configuration**
   - Use "Setup Configuration" command
   - Remove and redeploy if needed
   - Check backup files for recovery

## Best Practices

### Before Deployment
- Commit your current work to version control
- Review project structure and requirements
- Choose appropriate deployment option

### After Deployment  
- Test AI assistant features gradually
- Customize configuration for your workflow
- Document any project-specific customizations

### Maintenance
- Regularly update AI assistant configuration
- Monitor performance and adjust settings
- Keep backups of working configurations

## Advanced Usage

### Custom Templates
- Modify templates in `.ai-assistant/templates/`
- Create project-specific configurations
- Share configurations across team

### Integration Scripts
- Customize initialization script
- Add project-specific setup steps
- Integrate with existing build processes

### CI/CD Integration
- Include AI assistant in deployment pipelines
- Automate configuration for different environments
- Use environment-specific settings

## Uninstalling

To remove AI assistant from a workspace:

1. **Using Extension**
   - Run "AI Assistant: Remove from Workspace"
   - Confirms removal and cleans up files

2. **Manual Removal**
   ```bash
   rm -rf .ai-assistant
   rm -rf .tasks
   rm -rf .github/task-management
   ```

3. **VS Code Cleanup**
   - Remove AI assistant settings from `.vscode/settings.json`
   - Reset any modified launch configurations

## Support

For issues, questions, or feature requests:
- Check the troubleshooting section above
- Review project documentation
- Submit issues to the project repository
