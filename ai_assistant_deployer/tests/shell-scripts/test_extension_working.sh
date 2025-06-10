#!/bin/bash

# Test if AI Assistant Deployer extension is working
echo "🧪 Testing AI Assistant Deployer Extension..."

# Check if extension is installed
if code --list-extensions | grep -q "ai-assistant-tools.ai-assistant-deployer"; then
    echo "✅ Extension is installed"
else
    echo "❌ Extension is NOT installed"
    exit 1
fi

# Check if the main command is available (this will open command palette but return immediately)
echo "🔍 Checking if extension commands are available..."

# Test if we can call the extension command programmatically
code --command "aiAssistantDeployer.showQuickActions" 2>/dev/null && echo "✅ Extension command is available" || echo "❌ Extension command not found"

echo "🎯 Extension test complete. If VS Code is open, check status bar for AI Assistant item."
