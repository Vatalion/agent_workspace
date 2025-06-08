#!/bin/bash

# Copilot Helper Quick Start
# This script helps you quickly test and configure the helper

set -e

echo "🚀 Copilot Helper Quick Start"
echo "=============================="

# Check if already installed
if command -v copilot-helper &> /dev/null; then
    echo "✅ Copilot Helper is already installed!"
    echo ""
    echo "📊 Current Status:"
    copilot-helper status
    echo ""
    
    read -p "Do you want to enable the helper? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        copilot-helper enable
        echo "✅ Helper enabled!"
    fi
    
    echo ""
    read -p "Do you want to start the helper now for testing? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔧 Starting helper in foreground mode..."
        echo "Press Ctrl+C to stop testing"
        echo ""
        copilot-helper start
    fi
    
    exit 0
fi

echo "📦 Installing Copilot Helper..."
echo ""

# Run the main installer
if [ -f "./install.sh" ]; then
    ./install.sh
else
    echo "❌ install.sh not found. Please run this script from the project directory."
    exit 1
fi

echo ""
echo "🔧 Quick Configuration"
echo "====================="

# Enable the helper
copilot-helper enable

# Show current status
echo ""
echo "📊 Current configuration:"
copilot-helper status

echo ""
echo "🧪 Testing the Helper"
echo "===================="
echo ""
echo "The helper is now installed but needs accessibility permissions to work."
echo ""
echo "To test the helper:"
echo "1. Grant accessibility permissions (System Settings > Privacy & Security > Accessibility)"
echo "2. Add Terminal/iTerm2 to the accessibility list"
echo "3. Run: copilot-helper start"
echo ""

read -p "Have you granted accessibility permissions? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🎯 Testing dialog detection..."
    echo ""
    echo "I'll create a test dialog in 3 seconds. The helper should auto-click 'OK'."
    echo "Press Ctrl+C to cancel test."
    sleep 3
    
    # Start helper in background
    copilot-helper daemon &
    HELPER_PID=$!
    
    sleep 2
    
    # Create a test dialog
    osascript -e 'display dialog "Test Dialog - Helper should auto-click OK" buttons {"Cancel", "OK"} default button "OK"' &
    
    sleep 3
    
    # Stop the helper
    kill $HELPER_PID 2>/dev/null || true
    
    echo ""
    echo "✅ Test complete!"
    echo ""
    echo "If the dialog was automatically dismissed, the helper is working correctly!"
    echo "If not, check the logs: tail -f ~/.copilot_helper_logs/copilot_helper.log"
    
else
    echo ""
    echo "⚠️  Please grant accessibility permissions first:"
    echo "   1. Open System Settings"
    echo "   2. Go to Privacy & Security > Accessibility"
    echo "   3. Add Terminal (or your terminal app)"
    echo "   4. Enable it"
    echo "   5. Run this script again"
fi

echo ""
echo "🚀 Next Steps"
echo "============="
echo ""
echo "1. Test the helper: copilot-helper start"
echo "2. Enable auto-start: launchctl load ~/Library/LaunchAgents/com.copilot.helper.plist"
echo "3. Check logs: tail -f ~/.copilot_helper_logs/copilot_helper.log"
echo "4. Configure as needed: copilot-helper configure --help"
echo ""
echo "📖 Full documentation: cat README.md" 