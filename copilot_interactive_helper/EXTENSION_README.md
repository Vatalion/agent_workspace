# Copilot Helper - VS Code Extension

🤖 **Seamlessly manage terminal dialog automation directly from VS Code**

This VS Code extension provides a user-friendly interface for the Copilot Interactive Helper, allowing you to control and monitor the automatic dialog handling system without leaving your editor.

## 🎯 Perfect for VS Code + AI Assistant Workflows

When using AI assistants like Claude, Copilot, or ChatGPT that execute terminal commands, you often get interrupted by approval dialogs asking you to click "Continue" or "Cancel". This extension eliminates those interruptions!

## ✨ Features

### 🎛️ **Status Bar Integration**
- **Visual indicator** in VS Code status bar showing helper status
- **Click to view** detailed status information
- **Color-coded states**: Active (prominent), Ready (normal), Disabled (gray)

### 📋 **Command Palette Commands**
Access all functions via `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac):

- `Copilot Helper: Enable` - Enable the helper
- `Copilot Helper: Disable` - Disable the helper  
- `Copilot Helper: Start Monitoring` - Begin auto-clicking dialogs
- `Copilot Helper: Stop Monitoring` - Stop monitoring
- `Copilot Helper: Show Status` - Display detailed status
- `Copilot Helper: Open Settings` - Configure extension settings
- `Copilot Helper: Show Logs` - View helper activity logs
- `Copilot Helper: Test Dialog Detection` - Run test dialogs

### ⚙️ **Settings Integration**
Configure the helper directly in VS Code settings:

```json
{
  "copilotHelper.enabled": true,
  "copilotHelper.autoApprove": true,
  "copilotHelper.autoDeny": false,
  "copilotHelper.checkInterval": 0.5,
  "copilotHelper.logLevel": "INFO",
  "copilotHelper.showStatusBarItem": true,
  "copilotHelper.autoStartOnLaunch": false
}
```

## 🚀 Quick Start

### 1. Prerequisites

First, ensure the core Copilot Helper is installed:

```bash
# Install the core helper
./install.sh

# Enable it
copilot-helper enable
```

### 2. Install Extension

#### Option A: Development Mode
```bash
# Install dependencies
npm install

# Compile the extension
npm run compile

# Open in VS Code and press F5 to launch Extension Development Host
```

#### Option B: Package and Install
```bash
# Install VSCE (VS Code Extension packager)
npm install -g vsce

# Package the extension
vsce package

# Install the generated .vsix file
code --install-extension copilot-interactive-helper-*.vsix
```

### 3. Setup Permissions

⚠️ **IMPORTANT**: Grant accessibility permissions:

1. Open **System Settings** → **Privacy & Security** → **Accessibility**
2. Add **Visual Studio Code** to the list
3. **Enable** the checkbox for VS Code

## 🎮 Usage

### Status Bar Quick Actions

The **🤖 Helper** status bar item shows current state:

- **🤖 Helper Active** - Monitoring and auto-clicking dialogs
- **🤖 Helper Ready** - Enabled but not monitoring
- **🤖 Helper Off** - Disabled
- **🤖 Helper Error** - Problem detected

**Click the status bar item** for detailed status information.

### Command Palette Workflow

1. **Enable the helper**: `Ctrl+Shift+P` → "Copilot Helper: Enable"
2. **Start monitoring**: `Ctrl+Shift+P` → "Copilot Helper: Start Monitoring"
3. **Use your AI assistant** - dialogs will be auto-handled!
4. **Stop when done**: `Ctrl+Shift+P` → "Copilot Helper: Stop Monitoring"

### Settings Configuration

Open VS Code settings (`Ctrl+,`) and search for "copilot helper":

| Setting | Description | Default |
|---------|-------------|---------|
| `enabled` | Master enable/disable switch | `false` |
| `autoApprove` | Auto-click positive buttons (Continue, OK, etc.) | `true` |
| `autoDeny` | Auto-click negative buttons (Cancel, No, etc.) | `false` |
| `checkInterval` | Seconds between dialog checks | `0.5` |
| `logLevel` | Logging verbosity | `"INFO"` |
| `showStatusBarItem` | Show status in status bar | `true` |
| `autoStartOnLaunch` | Start monitoring when VS Code opens | `false` |

## 🔧 Advanced Features

### Log Viewing

View real-time activity logs:
- **Command**: "Copilot Helper: Show Logs"
- **File**: `~/.copilot_helper_logs/copilot_helper.log`

### Testing

Test the dialog detection system:
- **Command**: "Copilot Helper: Test Dialog Detection"
- Creates various dialogs to verify auto-clicking works

### Process Management

The extension can:
- **Start helper process** directly from VS Code
- **Monitor process status** and restart if needed
- **Kill processes** cleanly when stopping

## 🛠️ Troubleshooting

### Extension Not Working

1. **Check core helper installation**:
   ```bash
   copilot-helper status
   ```

2. **Verify accessibility permissions**:
   - System Settings → Privacy & Security → Accessibility
   - Ensure VS Code is listed and enabled

3. **Check extension logs**:
   - View → Output → Select "Copilot Helper" from dropdown

### Commands Not Available

- **Reload window**: `Ctrl+Shift+P` → "Developer: Reload Window"
- **Check extension is enabled**: Extensions panel → Search "Copilot Helper"

### Status Bar Not Showing

- **Check setting**: `copilotHelper.showStatusBarItem` should be `true`
- **Restart VS Code**: Sometimes required after setting changes

## 🎯 Integration with AI Assistants

### Claude/Copilot Chat Workflow

1. **Enable helper** before starting AI conversation
2. **Ask AI to run terminal commands** as usual
3. **Dialogs auto-approved** - no workflow interruption!
4. **Monitor via status bar** - see when helper is active

### Example Session

```
You: "Install the latest version of Node.js"
AI: "I'll help you install Node.js..."
     [Runs terminal command]
     [Dialog appears: "Continue with installation?"]
     [Helper auto-clicks "Continue"]
     [Installation proceeds without interruption]
You: [Continue conversation seamlessly]
```

## 🔄 Development

### File Structure

```
copilot_interactive_helper/
├── package.json          # Extension manifest
├── src/
│   └── extension.ts      # Main extension code
├── .vscode/
│   ├── launch.json       # Debug configuration
│   └── tasks.json        # Build tasks
├── tsconfig.json         # TypeScript config
└── out/                  # Compiled JavaScript
```

### Building

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch
```

### Debugging

1. **Open project in VS Code**
2. **Press F5** to launch Extension Development Host
3. **Test extension** in the new VS Code window
4. **Set breakpoints** in `src/extension.ts`

## 📦 Distribution

### Creating VSIX Package

```bash
# Install packaging tool
npm install -g vsce

# Package extension
vsce package

# Outputs: copilot-interactive-helper-1.0.0.vsix
```

### Installing Package

```bash
# Install from VSIX
code --install-extension copilot-interactive-helper-1.0.0.vsix

# Or use VS Code UI:
# Extensions → ... menu → Install from VSIX
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Test thoroughly** with different AI assistants
4. **Submit pull request**

## 📝 License

MIT License - Use freely in your projects!

---

**Made with ❤️ to enhance your AI-assisted coding workflow in VS Code!** 