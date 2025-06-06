#!/bin/bash

# Flutter Debug Assistant Extension Testing Script
# This script helps test the VS Code extension with various Flutter error scenarios

echo "🚀 Flutter Debug Assistant Extension Testing Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
PROJECT_DIR="/Users/vitalijsimko/workspace/projects/flutter/agent_workspace/test_flutter_app"
EXTENSION_DIR="/Users/vitalijsimko/workspace/projects/flutter/agent_workspace/flutter_debug_extension"
VSCODE_BIN="/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"

echo -e "${BLUE}📋 Testing Environment Setup${NC}"
echo "Project Directory: $PROJECT_DIR"
echo "Extension Directory: $EXTENSION_DIR"
echo "VS Code Binary: $VSCODE_BIN"
echo ""

# Check if VS Code is installed
if [[ ! -f "$VSCODE_BIN" ]]; then
    echo -e "${RED}❌ VS Code not found at expected location${NC}"
    exit 1
fi

# Check if extension is installed
echo -e "${BLUE}🔍 Checking Extension Installation${NC}"
EXTENSION_LIST=$("$VSCODE_BIN" --list-extensions)
if echo "$EXTENSION_LIST" | grep -q "flutter-debug-team.flutter-debug-assistant"; then
    echo -e "${GREEN}✅ Flutter Debug Assistant extension is installed${NC}"
else
    echo -e "${RED}❌ Extension not found. Installing...${NC}"
    cd "$EXTENSION_DIR"
    "$VSCODE_BIN" --install-extension flutter-debug-assistant-0.0.1.vsix
fi

echo ""

# Check Flutter app status
echo -e "${BLUE}📱 Checking Flutter App Status${NC}"
if pgrep -f "flutter run" > /dev/null; then
    echo -e "${GREEN}✅ Flutter app appears to be running${NC}"
else
    echo -e "${YELLOW}⚠️  Flutter app may not be running. Starting...${NC}"
    cd "$PROJECT_DIR"
    flutter run &
    sleep 5
fi

echo ""

# Test scenarios
echo -e "${BLUE}🧪 Available Test Scenarios${NC}"
echo "1. Widget Build Errors - RenderFlex overflow, constraint violations"
echo "2. State Management Errors - setState after dispose, null state access"
echo "3. Navigation Errors - invalid routes, missing arguments"
echo "4. HTTP/API Errors - network failures, JSON parsing"
echo "5. Memory/Performance Errors - memory leaks, infinite loops"
echo "6. Platform Channel Errors - missing platform methods"
echo "7. Animation/Controller Errors - ticker after dispose"
echo "8. Focus/Form Errors - focus node disposal, form validation"
echo "9. Async/Future Errors - unhandled futures, stream errors"
echo ""

# Testing instructions
echo -e "${BLUE}🎯 Testing Instructions${NC}"
echo "1. Open VS Code with the Flutter project:"
echo "   $VSCODE_BIN $PROJECT_DIR"
echo ""
echo "2. Navigate to lib/error_examples.dart"
echo ""
echo "3. Test the extension features:"
echo "   • Right-click in editor → Look for '🤖 Send Error to AI' option"
echo "   • Use Command Palette (Cmd+Shift+P) → Search 'Flutter Debug Assistant'"
echo "   • Check terminal output for error detection"
echo ""
echo "4. Trigger errors in the Flutter app:"
echo "   • Tap 'Widget Build Errors' in the app"
echo "   • Tap 'RenderFlex Overflow Error' to generate an error"
echo "   • Watch VS Code terminal for error capture"
echo ""

# Extension features validation
echo -e "${BLUE}🔧 Extension Features to Test${NC}"
echo "✓ Right-click context menu commands"
echo "✓ Command palette integration"
echo "✓ Terminal error detection"
echo "✓ Debug session monitoring"
echo "✓ AI integration prompts"
echo ""

# Open VS Code with project
echo -e "${BLUE}🚀 Opening VS Code with Flutter Project${NC}"
"$VSCODE_BIN" "$PROJECT_DIR"

echo ""
echo -e "${GREEN}✅ Testing environment ready!${NC}"
echo -e "${YELLOW}💡 Tip: Check the VS Code terminal and right-click menus to test extension features${NC}"
echo ""

# DevTools information
echo -e "${BLUE}🛠️  Development Tools${NC}"
echo "Flutter DevTools: http://127.0.0.1:9102"
echo "VM Service: http://127.0.0.1:59132"
echo ""

echo "🎉 Happy testing!"
