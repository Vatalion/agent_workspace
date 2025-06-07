#!/bin/bash

# 🎯 Create Run Button Extension
echo "🎯 Creating Run Button Extension..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}▶${NC} $1"; }
print_success() { echo -e "${GREEN}✅${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# Create extension directory
EXT_DIR="run_button_extension"
rm -rf "$EXT_DIR"
mkdir -p "$EXT_DIR/dist"

print_status "Creating Run Button Extension..."

# Create package.json
cat > "$EXT_DIR/package.json" << 'EOF'
{
  "name": "run-button-extension",
  "displayName": "Run Button Extension",
  "description": "Adds run buttons to shell scripts and other files",
  "version": "1.0.0",
  "publisher": "dev-tools",
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "runButton.executeScript",
        "title": "Run Script"
      },
      {
        "command": "runButton.executeInTerminal",
        "title": "Run in Terminal"
      }
    ]
  }
}
EOF

# Create the extension.js
cat > "$EXT_DIR/dist/extension.js" << 'EOF'
const vscode = require('vscode');

function activate(context) {
    console.log('🚀 Run Button Extension activated');

    // Create a code lens provider for executable files
    const runButtonProvider = {
        provideCodeLenses(document) {
            const codeLenses = [];
            const fileName = document.fileName;
            
            // Show run button for shell scripts, Python files, Node.js files, etc.
            const executableExtensions = ['.sh', '.py', '.js', '.ts', '.rb', '.pl'];
            const isExecutable = executableExtensions.some(ext => fileName.endsWith(ext));
            
            if (isExecutable || fileName.includes('install') || fileName.includes('run')) {
                // Add run button at the top of the file
                const range = new vscode.Range(0, 0, 0, 0);
                
                // Different commands based on file type
                if (fileName.endsWith('.sh')) {
                    const runCommand = {
                        title: "▶️ Run Script",
                        command: 'runButton.executeScript',
                        arguments: [fileName]
                    };
                    codeLenses.push(new vscode.CodeLens(range, runCommand));
                    
                    const terminalCommand = {
                        title: "🖥️ Open in Terminal",
                        command: 'runButton.executeInTerminal',
                        arguments: [fileName]
                    };
                    codeLenses.push(new vscode.CodeLens(range, terminalCommand));
                } else if (fileName.endsWith('.py')) {
                    const pythonCommand = {
                        title: "🐍 Run Python",
                        command: 'runButton.executePython',
                        arguments: [fileName]
                    };
                    codeLenses.push(new vscode.CodeLens(range, pythonCommand));
                } else if (fileName.endsWith('.js')) {
                    const nodeCommand = {
                        title: "🟢 Run Node.js",
                        command: 'runButton.executeNode',
                        arguments: [fileName]
                    };
                    codeLenses.push(new vscode.CodeLens(range, nodeCommand));
                }
            }
            
            return codeLenses;
        }
    };

    // Register the code lens provider
    const disposable1 = vscode.languages.registerCodeLensProvider('*', runButtonProvider);

    // Register command to execute shell script
    const disposable2 = vscode.commands.registerCommand('runButton.executeScript', async (fileName) => {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            const scriptName = fileName.split('/').pop();
            const relativePath = fileName.replace(workspaceFolder.uri.fsPath + '/', '');
            
            vscode.window.showInformationMessage(`🚀 Running ${scriptName}...`);
            
            // Execute the script
            const terminal = vscode.window.createTerminal(`▶️ ${scriptName}`);
            terminal.show();
            terminal.sendText(`cd "${workspaceFolder.uri.fsPath}"`);
            terminal.sendText(`chmod +x "${relativePath}"`);
            terminal.sendText(`./${relativePath}`);
            
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Error running script: ${error.message}`);
        }
    });

    // Register command to open in terminal
    const disposable3 = vscode.commands.registerCommand('runButton.executeInTerminal', async (fileName) => {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            const scriptName = fileName.split('/').pop();
            const relativePath = fileName.replace(workspaceFolder.uri.fsPath + '/', '');
            
            // Create a new terminal
            const terminal = vscode.window.createTerminal(`🖥️ ${scriptName}`);
            terminal.show();
            terminal.sendText(`cd "${workspaceFolder.uri.fsPath}"`);
            terminal.sendText(`chmod +x "${relativePath}"`);
            terminal.sendText(`# Ready to run: ./${relativePath}`);
            
            vscode.window.showInformationMessage(`🖥️ Terminal ready! Type: ./${relativePath}`);
            
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
        }
    });

    // Register command to execute Python
    const disposable4 = vscode.commands.registerCommand('runButton.executePython', async (fileName) => {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            const scriptName = fileName.split('/').pop();
            const relativePath = fileName.replace(workspaceFolder.uri.fsPath + '/', '');
            
            vscode.window.showInformationMessage(`🐍 Running Python: ${scriptName}...`);
            
            const terminal = vscode.window.createTerminal(`🐍 ${scriptName}`);
            terminal.show();
            terminal.sendText(`cd "${workspaceFolder.uri.fsPath}"`);
            terminal.sendText(`python3 "${relativePath}"`);
            
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Error running Python: ${error.message}`);
        }
    });

    // Register command to execute Node.js
    const disposable5 = vscode.commands.registerCommand('runButton.executeNode', async (fileName) => {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            const scriptName = fileName.split('/').pop();
            const relativePath = fileName.replace(workspaceFolder.uri.fsPath + '/', '');
            
            vscode.window.showInformationMessage(`🟢 Running Node.js: ${scriptName}...`);
            
            const terminal = vscode.window.createTerminal(`🟢 ${scriptName}`);
            terminal.show();
            terminal.sendText(`cd "${workspaceFolder.uri.fsPath}"`);
            terminal.sendText(`node "${relativePath}"`);
            
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Error running Node.js: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable1, disposable2, disposable3, disposable4, disposable5);
    
    vscode.window.showInformationMessage('🎯 Run Button Extension ready! Open any executable file to see run buttons.');
}

function deactivate() {}

module.exports = { activate, deactivate };
EOF

print_success "Created Run Button Extension files"

# Change to extension directory and package
cd "$EXT_DIR"

print_status "Packaging Run Button Extension..."
npx vsce package --no-dependencies --allow-star-activation &>/dev/null || {
    print_warning "Installing vsce..."
    npm install -g @vscode/vsce &>/dev/null
    npx vsce package --no-dependencies --allow-star-activation &>/dev/null
}

VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -n1)
if [ -z "$VSIX_FILE" ]; then
    echo "❌ No .vsix file found"
    cd ..
    rm -rf "$EXT_DIR"
    exit 1
fi

print_success "Packaged: $VSIX_FILE"

# Move back and install
cd ..
mv "$EXT_DIR/$VSIX_FILE" .

print_status "Installing Run Button Extension in VS Code..."
code --uninstall-extension dev-tools.run-button-extension &>/dev/null || true
code --install-extension "$VSIX_FILE" --force &>/dev/null

if [ $? -eq 0 ]; then
    print_success "Run Button Extension installed successfully!"
    echo ""
    echo "🎉 Run Button Extension Ready!"
    echo "=============================="
    echo "✅ Extension: $VSIX_FILE"
    echo ""
    echo "🎯 How to use:"
    echo "   1. Open any .sh file (like working_install.sh)"
    echo "   2. You'll see run buttons at the top of the file:"
    echo "      • ▶️ Run Script - Executes immediately"
    echo "      • 🖥️ Open in Terminal - Opens terminal ready to run"
    echo ""
    echo "📝 Supported file types:"
    echo "   • .sh files (Shell scripts)"
    echo "   • .py files (Python)"
    echo "   • .js files (Node.js)"
    echo "   • Any file with 'install' or 'run' in the name"
    
    # Clean up temp directory
    rm -rf "$EXT_DIR"
    
    # Auto-activate VS Code
    osascript -e 'tell application "Visual Studio Code" to activate' 2>/dev/null || true
    
    echo ""
    echo "🚀 Now open working_install.sh and you'll see run buttons!"
    
else
    echo "❌ Installation failed"
    rm -rf "$EXT_DIR"
    exit 1
fi 