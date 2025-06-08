# AI Assistant Deployer Extension - Installation & Testing

## Quick Installation

```bash
# Install the pre-built extension
cd ai_assistant_deployer
./quick_install.sh
```

Or install manually:
```bash
code --install-extension ai-assistant-deployer-1.0.0.vsix --force
```

## Testing the Extension

1. **Run the test script:**
   ```bash
   cd ai_assistant_deployer
   ./test_extension.sh
   ```

2. **Manual testing:**
   - Open VS Code
   - Open any project workspace (Flutter, React, Python, etc.)
   - Open Command Palette (`Cmd+Shift+P`)
   - Type "AI Assistant: Deploy to Workspace"
   - Follow the deployment wizard

3. **Context menu testing:**
   - Right-click any folder in Explorer
   - Select "Deploy AI Assistant to Workspace"

## Verification Steps

After deployment, verify these files were created:
- `.ai-assistant/` directory with configuration files
- `.vscode/settings.json` updated with AI assistant settings
- Project-specific integration files
- Optional: `.tasks/` directory (if task management was selected)

## Available Commands

- `AI Assistant: Deploy to Workspace` - Main deployment command
- `AI Assistant: Detect Project Type` - Show project information
- `AI Assistant: Setup Configuration` - Reset/configure AI assistant
- `AI Assistant: Remove from Workspace` - Clean removal

## Deployment Options

1. **🚀 Full Deployment** - All components (recommended)
2. **⚡ Quick Setup** - Minimal configuration
3. **🛠️ Custom Deployment** - Choose specific components

## Extension Development

To modify and rebuild the extension:

```bash
cd ai_assistant_deployer
npm install
npm run compile
npm run package
```

## Troubleshooting

- Ensure VS Code is updated to latest version
- Check workspace has write permissions
- Review VS Code output panel for errors
- Use "Detect Project Type" to verify project detection

For detailed instructions, see `DEPLOYMENT_GUIDE.md`.
