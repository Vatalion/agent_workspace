#!/bin/bash

# 🚀 Flutter Debug Assistant - Quick Demo
# Run this script for a fast demonstration of the extension

echo "🎯 Flutter Debug Assistant - Quick Demo"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 Quick Setup:${NC}"
echo "1. Building extension..."
cd flutter_debug_extension
npm run compile

echo ""
echo "2. Installing extension..."
code --install-extension . --force

echo ""
echo "3. Starting MCP server..."
npm start &
MCP_PID=$!
echo "MCP Server PID: $MCP_PID"

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""

echo -e "${YELLOW}🎮 Now test the extension:${NC}"
echo ""
echo "1. Open VS Code in the test Flutter app:"
echo "   code test_flutter_app"
echo ""
echo "2. Start debugging (F5) and select a device"
echo ""
echo "3. Open lib/error_examples.dart and trigger errors"
echo ""
echo "4. Look for:"
echo "   - 🤖 CodeLens buttons above error lines"
echo "   - Error notifications with 'Fix This Error' buttons"
echo "   - Status bar: '🤖 Flutter Debug Assistant'"
echo ""
echo "5. Click any '🤖 Send to Copilot Chat' button to test AI integration"
echo ""

echo -e "${BLUE}📋 Expected Features:${NC}"
echo "✅ Real-time error detection"
echo "✅ One-click Copilot Chat integration"
echo "✅ CodeLens buttons on error lines"
echo "✅ Right-click context menu options"
echo "✅ Breakpoint exception handling"
echo "✅ MCP server integration"
echo ""

echo "🛑 To stop MCP server: kill $MCP_PID"
echo ""
echo "Happy testing! 🚀"
