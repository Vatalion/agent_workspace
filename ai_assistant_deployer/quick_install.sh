#!/bin/bash

# AI Assistant Deployer - Quick Install Script
# Builds and installs the extension for development and testing

echo "🔧 Building AI Assistant Deployer Extension..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if vsce is installed
if ! command -v vsce &> /dev/null; then
    echo "📦 Installing vsce (Visual Studio Code Extension manager)..."
    npm install -g vsce
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

# Check for compilation errors
if [ $? -ne 0 ]; then
    echo "❌ Compilation failed. Please fix the errors and try again."
    exit 1
fi

# Create .vsix package
echo "📦 Creating extension package..."
vsce package

# Find the .vsix file
VSIX_FILE=$(ls *.vsix 2>/dev/null | head -n 1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ Failed to create .vsix package."
    exit 1
fi

echo "✅ Extension package created: $VSIX_FILE"

# Install the extension
echo "🚀 Installing extension in VS Code..."
code --install-extension "$VSIX_FILE"

if [ $? -eq 0 ]; then
    echo "✅ AI Assistant Deployer extension installed successfully!"
    echo "📍 You may need to reload VS Code to activate the extension."
    echo ""
    echo "🎯 Usage:"
    echo "   1. Open any project in VS Code"
    echo "   2. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)"
    echo "   3. Run 'AI Assistant: Deploy to Workspace'"
    echo ""
    echo "💡 Or right-click any folder in Explorer and select 'Deploy AI Assistant to Workspace'"
else
    echo "❌ Failed to install extension. Please install manually:"
    echo "   code --install-extension $VSIX_FILE"
fi

echo ""
echo "🔍 Extension file: $(pwd)/$VSIX_FILE"
