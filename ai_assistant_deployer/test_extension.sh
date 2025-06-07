#!/bin/bash

# Test script for AI Assistant Deployer Extension
echo "🧪 Testing AI Assistant Deployer Extension..."

# Check if extension package exists
VSIX_FILE="ai-assistant-deployer-1.0.0.vsix"

if [ ! -f "$VSIX_FILE" ]; then
    echo "❌ Extension package not found. Run 'npm run package' first."
    exit 1
fi

echo "✅ Extension package found: $VSIX_FILE"

# Check package size
SIZE=$(ls -lh "$VSIX_FILE" | awk '{print $5}')
echo "📦 Package size: $SIZE"

# Install extension
echo "🚀 Installing extension for testing..."
code --install-extension "$VSIX_FILE" --force

if [ $? -eq 0 ]; then
    echo "✅ Extension installed successfully!"
    echo ""
    echo "🎯 Test Instructions:"
    echo "1. Open a project workspace in VS Code"
    echo "2. Open Command Palette (Cmd+Shift+P)"
    echo "3. Type 'AI Assistant: Deploy to Workspace'"
    echo "4. Follow the deployment wizard"
    echo ""
    echo "📍 Or right-click any folder and select 'Deploy AI Assistant to Workspace'"
    echo ""
    echo "🔍 Check the following after deployment:"
    echo "   - .ai-assistant/ directory created"
    echo "   - .vscode/settings.json updated"
    echo "   - Project-specific files deployed"
    echo ""
    echo "🧹 To uninstall: code --uninstall-extension ai-assistant-tools.ai-assistant-deployer"
else
    echo "❌ Failed to install extension"
    exit 1
fi
