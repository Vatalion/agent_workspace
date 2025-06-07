#!/bin/bash

# ⚡ Flutter AI Debug Assistant - Super Fast Dev Install
# Ultra-fast development installation (skips type checking)

echo "⚡ Super Fast Dev Install"
echo "========================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}▶${NC} $1"; }
print_success() { echo -e "${GREEN}✅${NC} $1"; }

# Quick checks
[ ! -f "package.json" ] && echo "❌ Run from extension directory" && exit 1
! command -v code &> /dev/null && echo "❌ VS Code CLI not found" && exit 1

print_status "Fast building..."

# Clean and build (no type checking)
rm -f *.vsix
node esbuild.js --production &>/dev/null || { echo "❌ Build failed"; exit 1; }

print_status "Packaging..."
npx vsce package --no-dependencies --allow-star-activation &>/dev/null || { 
    npm install -g @vscode/vsce &>/dev/null
    npx vsce package --no-dependencies --allow-star-activation &>/dev/null
}

VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -n1)
[ -z "$VSIX_FILE" ] && echo "❌ No .vsix file found" && exit 1

print_status "Installing..."
code --uninstall-extension flutter-ai-team.flutter-ai-debug-assistant &>/dev/null || true
code --uninstall-extension flutter-debug-team.flutter-debug-assistant &>/dev/null || true
code --install-extension "$VSIX_FILE" --force &>/dev/null

if [ $? -eq 0 ]; then
    print_success "Installed: $VSIX_FILE"
    echo ""
    echo "🚀 Ready! Press Cmd+Shift+P → 'Flutter AI Debug Assistant: Test AI Provider Detection'"
    
    # Auto-reload VS Code if running
    osascript -e 'tell application "Visual Studio Code" to activate' 2>/dev/null || true
else
    echo "❌ Installation failed"
    exit 1
fi 