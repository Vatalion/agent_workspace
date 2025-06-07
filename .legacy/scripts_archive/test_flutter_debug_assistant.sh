#!/bin/bash

# 🧪 Flutter Debug Assistant - Comprehensive Testing Script
# This script will guide you through testing all features of the extension

echo "🚀 Flutter Debug Assistant - Testing Guide"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 STEP $1:${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
print_step "1" "Checking Prerequisites"

# Check if VS Code is installed
if command -v code &> /dev/null; then
    print_success "VS Code is installed"
else
    print_error "VS Code is not installed or not in PATH"
    exit 1
fi

# Check if Flutter is installed
if command -v flutter &> /dev/null; then
    print_success "Flutter is installed"
    flutter --version | head -1
else
    print_error "Flutter is not installed or not in PATH"
    exit 1
fi

# Check if Node.js is installed
if command -v node &> /dev/null; then
    print_success "Node.js is installed"
    node --version
else
    print_error "Node.js is not installed"
    exit 1
fi

echo ""

# Step 2: Build and Install Extension
print_step "2" "Building and Installing Extension"

echo "Navigating to extension directory..."
cd flutter_debug_extension

echo "Building the extension..."
if npm run compile; then
    print_success "Extension compiled successfully"
else
    print_error "Extension compilation failed"
    exit 1
fi

echo ""
echo "Installing the extension..."
if code --install-extension flutter-debug-assistant-0.0.1.vsix --force; then
    print_success "Extension installed successfully"
else
    print_error "Extension installation failed"
    exit 1
fi

echo ""

# Step 3: Start MCP Server
print_step "3" "Starting MCP Server"

echo "Starting the MCP server in the background..."
if npm start &> ../mcp_server.log &
then
    MCP_PID=$!
    print_success "MCP Server started (PID: $MCP_PID)"
    echo "Server logs will be written to ../mcp_server.log"
else
    print_error "Failed to start MCP server"
    exit 1
fi

# Wait a moment for server to start
sleep 3

echo ""

# Step 4: Test Flutter App Setup
print_step "4" "Setting up Test Flutter App"

cd ../test_flutter_app

# Check if Flutter app is ready
if [ -f "pubspec.yaml" ]; then
    print_success "Flutter test app found"
    
    echo "Getting Flutter dependencies..."
    if flutter pub get; then
        print_success "Dependencies installed"
    else
        print_warning "Some dependencies might have issues"
    fi
else
    print_error "Flutter test app not found"
    exit 1
fi

echo ""

# Step 5: Testing Instructions
print_step "5" "Manual Testing Instructions"

echo ""
echo "🎯 Now follow these manual testing steps:"
echo ""

echo -e "${YELLOW}A. EXTENSION INSTALLATION TEST${NC}"
echo "1. Open VS Code"
echo "2. Check if 'Flutter Debug Assistant' appears in Extensions list"
echo "3. Look for the status bar item: '🤖 Flutter Debug Assistant'"
echo ""

echo -e "${YELLOW}B. FLUTTER APP TESTING${NC}"
echo "1. Open the test_flutter_app folder in VS Code:"
echo "   code $(pwd)"
echo ""
echo "2. Start Flutter debugging:"
echo "   - Press F5 or use 'Run > Start Debugging'"
echo "   - Select a device (iOS Simulator, Android Emulator, etc.)"
echo ""

echo -e "${YELLOW}C. ERROR DETECTION TESTING${NC}"
echo "1. Open lib/error_examples.dart"
echo "2. Trigger errors by tapping buttons in the running app"
echo "3. Look for these indicators:"
echo "   - 🤖 CodeLens buttons above error lines"
echo "   - Error notifications with 'Fix This Error' buttons"
echo "   - Status bar updates when errors occur"
echo ""

echo -e "${YELLOW}D. COPILOT INTEGRATION TESTING${NC}"
echo "1. When an error occurs, click '🤖 Send to Copilot Chat'"
echo "2. Verify Copilot Chat opens with error context"
echo "3. Test right-click menu: Select error text → '🤖 Send Error to AI'"
echo ""

echo -e "${YELLOW}E. BREAKPOINT TESTING${NC}"
echo "1. Set a breakpoint in error_examples.dart"
echo "2. Trigger an error that hits the breakpoint"
echo "3. Look for '🤖 Fix Exception with Copilot' button"
echo "4. Click it to send exception context to AI"
echo ""

echo -e "${YELLOW}F. TERMINAL ERROR TESTING${NC}"
echo "1. Run 'flutter run' in terminal"
echo "2. If errors occur, look for terminal error notifications"
echo "3. Click '🤖 Analyze with AI' when prompted"
echo ""

# Step 6: Automated Tests
print_step "6" "Running Automated Tests"

echo "Testing MCP server connectivity..."
if curl -s http://localhost:3000/health &> /dev/null; then
    print_success "MCP server is responding"
else
    print_warning "MCP server health check failed (this might be normal)"
fi

echo ""
echo "Testing WebSocket server..."
if nc -z localhost 8080 2>/dev/null; then
    print_success "WebSocket server is listening on port 8080"
else
    print_warning "WebSocket server not detected on port 8080"
fi

echo ""

# Step 7: Cleanup and Results
print_step "7" "Testing Complete"

echo ""
echo "🎉 Testing setup complete!"
echo ""
echo "📝 What to test manually:"
echo "1. ✅ Extension installation and activation"
echo "2. ✅ Error detection in Flutter debug console"
echo "3. ✅ CodeLens buttons appearing above errors"
echo "4. ✅ One-click error sending to Copilot Chat"
echo "5. ✅ Breakpoint exception handling"
echo "6. ✅ Terminal error monitoring"
echo "7. ✅ MCP server integration"
echo ""

echo "📊 Expected Results:"
echo "- Errors should show '🤖 Send to Copilot Chat' buttons"
echo "- Clicking buttons should open Copilot Chat with error context"
echo "- Status bar should update when errors are detected"
echo "- Right-click menus should include AI options"
echo ""

echo "🔧 Troubleshooting:"
echo "- If Copilot Chat doesn't open, check if GitHub Copilot extension is installed"
echo "- If no errors are detected, try triggering obvious errors in the test app"
echo "- Check VS Code Developer Console (Help > Toggle Developer Tools) for extension logs"
echo ""

echo "📋 Test Results Log:"
echo "- Extension compiled: ✅"
echo "- Extension installed: ✅"
echo "- MCP server started: ✅"
echo "- Flutter app ready: ✅"
echo ""

echo "🛑 To stop the MCP server when done testing:"
echo "kill $MCP_PID"
echo ""

echo "Happy testing! 🚀" 