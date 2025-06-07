# Flutter Debug Assistant - One-Click Installation

This guide shows you how to install the Flutter Debug Assistant extension in **VS Code**, **Cursor**, **Windsurf**, and other compatible editors with just one click.

## 🚀 Quick Start (Recommended)

### Option 1: Interactive Menu (Easiest)
```bash
./extension_manager.sh
```

This opens an interactive menu where you can:
- Install the extension
- Reinstall if needed
- Test the installation
- Check status
- Get help

### Option 2: Direct Installation
```bash
./install_extension.sh
```

### Option 3: Clean Reinstall
```bash
./reinstall_extension.sh
```

## 📋 What These Scripts Do

### `extension_manager.sh` - Interactive Menu
- **Menu-driven interface** for all operations
- **Detects your editors** automatically (VS Code, Cursor, Windsurf, etc.)
- **Checks prerequisites** (Node.js, Flutter, npm)
- **Guides you through** installation and testing
- **Shows status** of current installation

### `install_extension.sh` - Fresh Installation
- **Detects all compatible editors** on your system
- **Installs Node.js dependencies** automatically
- **Builds and packages** the extension
- **Installs in all detected editors** simultaneously
- **Provides fallback methods** if command-line installation fails

### `reinstall_extension.sh` - Clean Reinstall
- **Removes existing installations** completely
- **Cleans build artifacts** and dependencies
- **Performs fresh installation** from scratch
- **Handles multiple editors** at once

## 🎯 Supported Editors

| Editor | Command | Extension Directory |
|--------|---------|-------------------|
| **VS Code** | `code` | `~/.vscode/extensions/` |
| **Cursor** | `cursor` | `~/.cursor/extensions/` |
| **Windsurf** | `windsurf` | `~/.windsurf/extensions/` |
| **VS Code Insiders** | `code-insiders` | `~/.vscode-insiders/extensions/` |
| **VSCodium** | `codium` | `~/.vscode-oss/extensions/` |

## 📦 Prerequisites

The scripts will check for these automatically:

1. **Node.js** (v14 or higher)
   - Download: https://nodejs.org/
   - Used for building the extension

2. **npm or yarn**
   - Usually comes with Node.js
   - Used for dependency management

3. **Flutter** (optional, for testing)
   - Download: https://flutter.dev/docs/get-started/install
   - Used for testing the extension

4. **At least one supported editor**
   - VS Code, Cursor, Windsurf, etc.

## 🔧 Installation Process

### What Happens During Installation:

1. **Detection Phase**
   ```
   ✅ Found VS Code
   ✅ Found Cursor
   ✅ Found Flutter
   ```

2. **Build Phase**
   ```
   📦 Installing dependencies...
   🔨 Building extension...
   📋 Packaging extension...
   ```

3. **Installation Phase**
   ```
   🚀 Installing in VS Code...
   🚀 Installing in Cursor...
   ✅ Installation completed!
   ```

### Installation Methods Used:

1. **Command-line installation** (preferred)
   ```bash
   code --install-extension flutter-debug-assistant.vsix
   cursor --install-extension flutter-debug-assistant.vsix
   ```

2. **Manual file copying** (fallback)
   ```bash
   cp -r extension ~/.vscode/extensions/flutter-debug-assistant
   ```

## 🧪 Testing the Installation

### Automatic Testing
```bash
./extension_manager.sh
# Choose option 3: Test Extension
```

### Manual Testing
1. **Open your editor** (VS Code, Cursor, etc.)
2. **Open a Flutter project** or create a new one
3. **Look for "Flutter Debug Assistant"** in the extensions list
4. **Run a Flutter app** with errors to test the "Send to Copilot Chat" feature

### Test with Sample App
```bash
./quick_cursor_test.sh
```

This creates a test Flutter app with intentional errors for testing.

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. "No supported editors found"
```bash
# Install at least one supported editor:
# - VS Code: https://code.visualstudio.com/
# - Cursor: https://cursor.sh/
# - Windsurf: https://windsurf.ai/
```

#### 2. "Node.js not found"
```bash
# Install Node.js from https://nodejs.org/
# Then run the script again
```

#### 3. "Extension not appearing"
- **Restart your editor** after installation
- **Check Extensions panel** (Cmd+Shift+X / Ctrl+Shift+X)
- **Enable the extension** if it's disabled
- **Try reinstalling**: `./reinstall_extension.sh`

#### 4. "Permission denied"
```bash
# Make scripts executable:
chmod +x *.sh
```

#### 5. "Installation failed"
```bash
# Try clean reinstall:
./reinstall_extension.sh
```

### Debug Information

#### Check Installation Status
```bash
./extension_manager.sh
# Choose option 4: Check Status
```

#### Manual Verification
```bash
# Check if extension is installed:
ls ~/.vscode/extensions/ | grep flutter
ls ~/.cursor/extensions/ | grep flutter

# Check extension in editor:
code --list-extensions | grep flutter
cursor --list-extensions | grep flutter
```

## 📁 File Structure

```
agent_workspace/
├── extension_manager.sh          # Interactive menu (recommended)
├── install_extension.sh          # Fresh installation
├── reinstall_extension.sh        # Clean reinstall
├── quick_cursor_test.sh          # Test setup
├── test_copilot_integration.js   # Test script
├── CURSOR_TESTING_GUIDE.md       # Testing guide
└── flutter_debug_extension/      # Extension source code
    ├── package.json
    ├── src/
    └── ...
```

## 🎯 Usage Examples

### First-time Installation
```bash
# Interactive (recommended)
./extension_manager.sh

# Or direct installation
./install_extension.sh
```

### Updating the Extension
```bash
# Clean reinstall (recommended for updates)
./reinstall_extension.sh
```

### Testing After Installation
```bash
# Run test suite
./extension_manager.sh
# Choose option 3

# Or setup test environment
./quick_cursor_test.sh
```

### Checking What's Installed
```bash
./extension_manager.sh
# Choose option 4
```

## ✅ Success Indicators

After successful installation, you should see:

1. **Extension in Extensions Panel**
   - Search for "Flutter Debug Assistant"
   - Should show as installed and enabled

2. **Extension Features Available**
   - Flutter Debug Assistant panel in sidebar
   - "Send to Copilot Chat" buttons on errors
   - Error detection and highlighting

3. **Test Results Pass**
   ```
   ✅ ALL TESTS PASSED! The Copilot Chat fix is working correctly.
   ```

## 🆘 Getting Help

If you encounter issues:

1. **Run the status check**: `./extension_manager.sh` → option 4
2. **Try clean reinstall**: `./reinstall_extension.sh`
3. **Check the testing guide**: `CURSOR_TESTING_GUIDE.md`
4. **Verify prerequisites** are installed
5. **Restart your editor** after installation

## 🔄 Uninstalling

To completely remove the extension:

```bash
# Uninstall from VS Code
code --uninstall-extension flutter-debug-assistant

# Uninstall from Cursor
cursor --uninstall-extension flutter-debug-assistant

# Manual removal
rm -rf ~/.vscode/extensions/flutter-debug-assistant*
rm -rf ~/.cursor/extensions/flutter-debug-assistant*
```

---

**Happy coding with Flutter Debug Assistant! 🚀** 