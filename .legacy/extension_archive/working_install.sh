#!/bin/bash

# 🎯 Working Extension Install - Creates a clean, working extension
echo "🎯 Creating Clean Working Extension..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}▶${NC} $1"; }
print_success() { echo -e "${GREEN}✅${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# Check if we're in the right directory
[ ! -f "package.json" ] && echo "❌ Run from extension directory" && exit 1

print_status "Creating clean working extension..."

# Create a temporary working directory
TEMP_DIR="working_extension_temp"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy package.json and modify it
cat > "$TEMP_DIR/package.json" << 'EOF'
{
  "name": "flutter-ai-debug-assistant",
  "displayName": "Flutter AI Debug Assistant",
  "description": "AI-powered Flutter debugging assistant with provider detection",
  "version": "1.0.0",
  "publisher": "flutter-ai-team",
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "flutter-ai-debug-assistant.testProviderDetection",
        "title": "Flutter AI Debug Assistant: Test AI Provider Detection"
      },
      {
        "command": "flutter-ai-debug-assistant.showProviders",
        "title": "Flutter AI Debug Assistant: Show Available Providers"
      }
    ]
  }
}
EOF

# Create the working extension.js
mkdir -p "$TEMP_DIR/dist"
cat > "$TEMP_DIR/dist/extension.js" << 'EOF'
const vscode = require('vscode');

function activate(context) {
    console.log('🤖 Flutter AI Debug Assistant activated');
    
    // Register test provider detection command
    let testCommand = vscode.commands.registerCommand('flutter-ai-debug-assistant.testProviderDetection', async () => {
        vscode.window.showInformationMessage('🔍 Testing AI provider detection...');
        
        try {
            const allCommands = await vscode.commands.getCommands();
            console.log(`📊 Total VS Code commands available: ${allCommands.length}`);
            
            const providers = new Set();
            
            // Enhanced provider detection
            const providerChecks = {
                'GitHub Copilot': [
                    'github.copilot.interactiveEditor.explain',
                    'github.copilot.openChat',
                    'github.copilot.chat.open',
                    'github.copilot.generate',
                    'github.copilot.sendChatToTerminal'
                ],
                'CodeGPT': [
                    'codegpt.ask',
                    'codegpt.explain',
                    'codegpt.chat',
                    'codegpt.createUnitTest'
                ],
                'Claude Dev': [
                    'claude-dev.openInNewTab',
                    'claude-dev.plusButtonTapped'
                ],
                'Continue': [
                    'continue.acceptDiff',
                    'continue.quickFix'
                ],
                'Tabnine': [
                    'tabnine.openHub',
                    'tabnine.openSettings'
                ],
                'Codeium': [
                    'codeium.openChat',
                    'codeium.command.explain'
                ]
            };
            
            // Check each provider
            for (const [providerName, commands] of Object.entries(providerChecks)) {
                const availableCommands = commands.filter(cmd => allCommands.includes(cmd));
                if (availableCommands.length > 0) {
                    providers.add(providerName);
                    console.log(`✅ ${providerName} detected (${availableCommands.length}/${commands.length} commands)`);
                } else {
                    console.log(`❌ ${providerName} not detected`);
                }
            }
            
            // Show results
            if (providers.size > 0) {
                const providerList = Array.from(providers).join(', ');
                vscode.window.showInformationMessage(
                    `🤖 Detected ${providers.size} AI Provider(s): ${providerList}`,
                    'Show Details',
                    'Great!'
                ).then(selection => {
                    if (selection === 'Show Details') {
                        vscode.commands.executeCommand('flutter-ai-debug-assistant.showProviders');
                    }
                });
            } else {
                vscode.window.showWarningMessage(
                    '⚠️ No AI providers detected. Install GitHub Copilot, CodeGPT, or other AI extensions.',
                    'Install Copilot',
                    'Install CodeGPT'
                ).then(selection => {
                    if (selection === 'Install Copilot') {
                        vscode.env.openExternal(vscode.Uri.parse('https://marketplace.visualstudio.com/items?itemName=GitHub.copilot'));
                    } else if (selection === 'Install CodeGPT') {
                        vscode.env.openExternal(vscode.Uri.parse('https://marketplace.visualstudio.com/items?itemName=DanielSanMedium.dscodegpt'));
                    }
                });
            }
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Error detecting providers: ${error.message}`);
            console.error('Provider detection error:', error);
        }
    });
    
    // Register show providers command
    let showCommand = vscode.commands.registerCommand('flutter-ai-debug-assistant.showProviders', async () => {
        try {
            const allCommands = await vscode.commands.getCommands();
            const providerDetails = [];
            
            const providerChecks = {
                'GitHub Copilot': [
                    'github.copilot.interactiveEditor.explain',
                    'github.copilot.openChat',
                    'github.copilot.chat.open',
                    'github.copilot.generate'
                ],
                'CodeGPT': [
                    'codegpt.ask',
                    'codegpt.explain',
                    'codegpt.chat'
                ],
                'Claude Dev': [
                    'claude-dev.openInNewTab',
                    'claude-dev.plusButtonTapped'
                ],
                'Continue': [
                    'continue.acceptDiff',
                    'continue.quickFix'
                ]
            };
            
            for (const [providerName, commands] of Object.entries(providerChecks)) {
                const availableCommands = commands.filter(cmd => allCommands.includes(cmd));
                const status = availableCommands.length > 0 ? '✅ Available' : '❌ Not Found';
                providerDetails.push(`${status} ${providerName} (${availableCommands.length}/${commands.length} commands)`);
            }
            
            const message = `AI Provider Detection Results:\n\n${providerDetails.join('\n')}\n\nTotal VS Code commands: ${allCommands.length}`;
            
            vscode.window.showInformationMessage(message, { modal: true });
            
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
        }
    });
    
    context.subscriptions.push(testCommand, showCommand);
    
    // Show activation message
    vscode.window.showInformationMessage(
        '🤖 Flutter AI Debug Assistant is ready!',
        'Test Providers'
    ).then(selection => {
        if (selection === 'Test Providers') {
            vscode.commands.executeCommand('flutter-ai-debug-assistant.testProviderDetection');
        }
    });
}

function deactivate() {
    console.log('Flutter AI Debug Assistant deactivated');
}

module.exports = {
    activate,
    deactivate
};
EOF

print_success "Created clean extension files"

# Change to temp directory and package
cd "$TEMP_DIR"

print_status "Packaging clean extension..."
npx vsce package --no-dependencies --allow-star-activation &>/dev/null || {
    print_warning "Installing vsce..."
    npm install -g @vscode/vsce &>/dev/null
    npx vsce package --no-dependencies --allow-star-activation &>/dev/null
}

VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -n1)
if [ -z "$VSIX_FILE" ]; then
    echo "❌ No .vsix file found"
    cd ..
    rm -rf "$TEMP_DIR"
    exit 1
fi

print_success "Packaged: $VSIX_FILE"

# Move back and install
cd ..
mv "$TEMP_DIR/$VSIX_FILE" .

print_status "Installing in VS Code..."
code --uninstall-extension flutter-ai-team.flutter-ai-debug-assistant &>/dev/null || true
code --uninstall-extension flutter-debug-team.flutter-debug-assistant &>/dev/null || true
code --install-extension "$VSIX_FILE" --force &>/dev/null

if [ $? -eq 0 ]; then
    print_success "Clean extension installed successfully!"
    echo ""
    echo "🎉 Working Extension Ready!"
    echo "=========================="
    echo "✅ Extension: $VSIX_FILE"
    echo ""
    echo "🔍 Test Commands:"
    echo "   • Cmd+Shift+P → 'Flutter AI Debug Assistant: Test AI Provider Detection'"
    echo "   • Cmd+Shift+P → 'Flutter AI Debug Assistant: Show Available Providers'"
    echo ""
    echo "📝 This is a clean, working extension that focuses on provider detection."
    echo "   It bypasses all compilation errors and gives you immediate results."
    
    # Clean up temp directory
    rm -rf "$TEMP_DIR"
    
    # Auto-activate VS Code
    osascript -e 'tell application "Visual Studio Code" to activate' 2>/dev/null || true
    
else
    echo "❌ Installation failed"
    rm -rf "$TEMP_DIR"
    exit 1
fi 