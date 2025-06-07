#!/bin/bash

# Manual test script for Flutter Debug Assistant VS Code Extension
# This script helps test the extension by creating various scenarios

echo "🔍 Testing Flutter Debug Assistant VS Code Extension"
echo "================================================"

# Check if VS Code is running
if pgrep -f "Visual Studio Code" > /dev/null; then
    echo "✅ VS Code is running"
else
    echo "❌ VS Code is not running"
    exit 1
fi

# Check if Flutter extension is installed
echo "📦 Checking for Flutter Debug Assistant extension..."
code --list-extensions | grep -i flutter

echo ""
echo "🚀 Available test commands:"
echo "1. Trigger Flutter hot reload: flutter hot reload"
echo "2. Check VS Code debug console: code --command workbench.debug.action.toggleDebugConsole"
echo "3. Open Command Palette: code --command workbench.action.showCommands"
echo "4. Test extension commands:"
echo "   - code --command flutter-debug-assistant.debugCurrentContext"
echo "   - code --command flutter-debug-assistant.sendTerminalToAI"
echo ""

# Test VS Code commands
echo "🔧 Testing VS Code extension commands..."
echo "Testing flutter-debug-assistant.debugCurrentContext command:"
code --command flutter-debug-assistant.debugCurrentContext &

sleep 2

echo "Testing flutter-debug-assistant.sendTerminalToAI command:"
code --command flutter-debug-assistant.sendTerminalToAI &

echo ""
echo "✅ Test script completed. Check VS Code for extension responses."
