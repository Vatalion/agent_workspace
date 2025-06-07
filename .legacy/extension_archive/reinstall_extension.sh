#!/bin/bash

echo "🔄 Reinstalling Flutter AI Debug Assistant Extension..."

# Get the extension ID
EXTENSION_ID="flutter-ai-debug-assistant"

# Check if extension is currently installed
if code --list-extensions | grep -q "$EXTENSION_ID"; then
    echo "📦 Uninstalling current extension..."
    code --uninstall-extension "$EXTENSION_ID"
    
    # Wait a moment for uninstall to complete
    sleep 2
    
    echo "✅ Current extension uninstalled"
else
    echo "ℹ️  No existing extension found to uninstall"
fi

# Install the new VSIX package
echo "📦 Installing new extension from VSIX..."
if [ -f "flutter-ai-debug-assistant-1.0.0.vsix" ]; then
    code --install-extension flutter-ai-debug-assistant-1.0.0.vsix --force
    
    echo "✅ New extension installed successfully!"
    echo ""
    echo "🎉 Installation complete! Please:"
    echo "1. Reload VS Code window (Cmd+R or Ctrl+R)"
    echo "2. Open the Flutter Debug Assistant panel from the Activity Bar"
    echo "3. Test the new provider selection functionality"
    echo ""
    echo "📍 The extension panel should now show the new AI Connection section"
    echo "   with provider selection cards instead of simple text."
else
    echo "❌ VSIX file not found! Please run 'npm run package' first."
    exit 1
fi 