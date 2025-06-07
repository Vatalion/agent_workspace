#!/bin/bash

# Flutter Debug Assistant - Complete Demo Script
# This script demonstrates the full functionality of the extension

echo "🚀 Flutter Debug Assistant - Complete Demo"
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
    echo -e "${BLUE}📋 Step $1: $2${NC}"
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Please run this script from the agent_workspace directory"
    exit 1
fi

print_step "1" "Setting up the environment"

# Check Flutter installation
if ! command -v flutter &> /dev/null; then
    print_error "Flutter is not installed. Please install Flutter first."
    exit 1
fi

print_success "Flutter is installed"

# Check Node.js installation
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_success "Node.js is installed"

print_step "2" "Building the VS Code Extension"

cd flutter_debug_extension

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing extension dependencies..."
    npm install
fi

# Compile the extension
echo "Compiling the extension..."
npm run compile

if [ $? -eq 0 ]; then
    print_success "Extension compiled successfully"
else
    print_error "Extension compilation failed"
    exit 1
fi

# Package the extension
echo "Packaging the extension..."
npx vsce package --allow-missing-repository

if [ $? -eq 0 ]; then
    print_success "Extension packaged successfully"
else
    print_warning "Extension packaging had issues, but continuing..."
fi

cd ..

print_step "3" "Setting up the MCP Server"

cd src

# Install MCP server dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing MCP server dependencies..."
    npm install
fi

# Start the MCP server in background
echo "Starting MCP server..."
node index.ts > ../mcp_server.log 2>&1 &
MCP_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server is running
if ps -p $MCP_PID > /dev/null; then
    print_success "MCP Server started (PID: $MCP_PID)"
else
    print_error "MCP Server failed to start"
    cat ../mcp_server.log
    exit 1
fi

cd ..

print_step "4" "Preparing the Flutter Test App"

cd test_flutter_app

# Get Flutter dependencies
echo "Getting Flutter dependencies..."
flutter pub get

if [ $? -eq 0 ]; then
    print_success "Flutter dependencies installed"
else
    print_error "Failed to install Flutter dependencies"
    exit 1
fi

cd ..

print_step "5" "Extension Installation Instructions"

echo ""
echo "🎯 MANUAL INSTALLATION STEPS:"
echo "=============================="
echo ""
echo "1. Open VS Code"
echo "2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)"
echo "3. Type 'Extensions: Install from VSIX'"
echo "4. Select the file: flutter_debug_extension/flutter-debug-assistant-0.0.1.vsix"
echo "5. Restart VS Code when prompted"
echo ""

print_step "6" "Testing Instructions"

echo ""
echo "🧪 TESTING THE EXTENSION:"
echo "========================="
echo ""
echo "After installing the extension in VS Code:"
echo ""
echo "A. Open the test Flutter app:"
echo "   - Open VS Code"
echo "   - File > Open Folder"
echo "   - Select: $(pwd)/test_flutter_app"
echo ""
echo "B. Test Error Detection:"
echo "   1. Open lib/main.dart"
echo "   2. Look for '🤖 Send to Copilot Chat' buttons above error lines"
echo "   3. Click any button to send error to Copilot Chat"
echo ""
echo "C. Test Debug Console Monitoring:"
echo "   1. Press F5 to start debugging"
echo "   2. Navigate to different screens to trigger errors"
echo "   3. Watch for error notifications and CodeLens buttons"
echo ""
echo "D. Test Terminal Error Detection:"
echo "   1. Open Terminal in VS Code"
echo "   2. Run: flutter run"
echo "   3. Trigger errors in the app"
echo "   4. Watch for error detection in terminal output"
echo ""
echo "E. Test Extension Panel:"
echo "   1. Click the robot icon in the Activity Bar"
echo "   2. Use the MCP Server Control panel"
echo "   3. View Error History"
echo "   4. Adjust Settings"
echo ""

print_step "7" "Available Test Scenarios"

echo ""
echo "📱 TEST SCENARIOS IN THE FLUTTER APP:"
echo "====================================="
echo ""
echo "The test app includes these error scenarios:"
echo ""
echo "• Widget Errors (Null checks, type mismatches)"
echo "• State Management Errors (setState issues)"
echo "• Navigation Errors (Route problems)"
echo "• HTTP Request Errors (Network failures)"
echo "• Memory Errors (Large data handling)"
echo "• Platform Errors (Platform-specific issues)"
echo "• Animation Errors (Controller problems)"
echo "• Async Errors (Future/Stream issues)"
echo "• Build Context Errors (Context usage)"
echo "• Performance Issues (Heavy computations)"
echo ""

print_step "8" "Extension Features to Test"

echo ""
echo "🔧 EXTENSION FEATURES:"
echo "====================="
echo ""
echo "✅ Real-time error detection"
echo "✅ CodeLens buttons above error lines"
echo "✅ Right-click context menu integration"
echo "✅ Debug console monitoring"
echo "✅ Terminal output analysis"
echo "✅ Breakpoint error detection"
echo "✅ VS Code diagnostics integration"
echo "✅ GitHub Copilot Chat integration"
echo "✅ MCP server connectivity"
echo "✅ Error history tracking"
echo "✅ Customizable settings"
echo "✅ Status bar indicators"
echo ""

print_step "9" "Troubleshooting"

echo ""
echo "🔧 TROUBLESHOOTING:"
echo "=================="
echo ""
echo "If CodeLens buttons don't appear:"
echo "• Press Ctrl+Shift+P and run 'Flutter Debug: Refresh CodeLens Buttons'"
echo "• Check that you're in a .dart file"
echo "• Ensure the extension is activated (check status bar)"
echo ""
echo "If Copilot Chat doesn't work:"
echo "• Install GitHub Copilot extension"
echo "• Sign in to GitHub Copilot"
echo "• Run 'Flutter Debug: Test AI Connection'"
echo ""
echo "If MCP Server issues:"
echo "• Check the MCP server log: cat mcp_server.log"
echo "• Restart the server from the extension panel"
echo "• Verify port 8080 is available"
echo ""

print_step "10" "Demo Complete"

echo ""
echo "🎉 DEMO SETUP COMPLETE!"
echo "======================="
echo ""
echo "Your Flutter Debug Assistant is ready to use!"
echo ""
echo "Key files created:"
echo "• flutter_debug_extension/flutter-debug-assistant-0.0.1.vsix (Extension package)"
echo "• MCP Server running on port 8080 (PID: $MCP_PID)"
echo "• Test Flutter app ready in test_flutter_app/"
echo ""
echo "Next steps:"
echo "1. Install the extension in VS Code"
echo "2. Open the test Flutter app"
echo "3. Start testing the features"
echo ""
echo "To stop the MCP server later: kill $MCP_PID"
echo ""

# Save the PID for later cleanup
echo $MCP_PID > mcp_server.pid

print_success "Demo setup completed successfully!"

echo ""
echo "📚 For detailed documentation, see:"
echo "• README.md - Main documentation"
echo "• USAGE_GUIDE.md - Usage instructions"
echo "• TESTING_GUIDE.md - Testing procedures"
echo "" 