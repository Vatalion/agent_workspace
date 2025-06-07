#!/bin/bash

# Flutter Debug Assistant - One-Click Reinstallation Script
# Cleans up existing installations and reinstalls fresh

set -e  # Exit on any error

echo "🔄 Flutter Debug Assistant - One-Click Reinstaller"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "flutter_debug_extension" ]; then
    print_error "Please run this script from the agent_workspace directory"
    print_info "Current directory: $(pwd)"
    print_info "Expected: Should contain flutter_debug_extension folder"
    exit 1
fi

print_status "Found flutter_debug_extension directory"

# Function to detect installed editors
detect_editors() {
    local editors=()
    
    # Check for VS Code
    if command -v code &> /dev/null; then
        editors+=("vscode")
        print_status "Found VS Code"
    fi
    
    # Check for Cursor
    if command -v cursor &> /dev/null; then
        editors+=("cursor")
        print_status "Found Cursor"
    fi
    
    # Check for Windsurf
    if command -v windsurf &> /dev/null; then
        editors+=("windsurf")
        print_status "Found Windsurf"
    fi
    
    # Check for other common VS Code variants
    if command -v code-insiders &> /dev/null; then
        editors+=("vscode-insiders")
        print_status "Found VS Code Insiders"
    fi
    
    if command -v codium &> /dev/null; then
        editors+=("vscodium")
        print_status "Found VSCodium"
    fi
    
    echo "${editors[@]}"
}

# Function to get extension directory for each editor
get_extension_dir() {
    local editor=$1
    local os=$(uname -s)
    
    case $editor in
        "vscode")
            case $os in
                "Darwin") echo "$HOME/.vscode/extensions" ;;
                "Linux") echo "$HOME/.vscode/extensions" ;;
                "MINGW"*|"CYGWIN"*|"MSYS"*) echo "$APPDATA/Code/User/extensions" ;;
            esac
            ;;
        "cursor")
            case $os in
                "Darwin") echo "$HOME/.cursor/extensions" ;;
                "Linux") echo "$HOME/.cursor/extensions" ;;
                "MINGW"*|"CYGWIN"*|"MSYS"*) echo "$APPDATA/Cursor/User/extensions" ;;
            esac
            ;;
        "windsurf")
            case $os in
                "Darwin") echo "$HOME/.windsurf/extensions" ;;
                "Linux") echo "$HOME/.windsurf/extensions" ;;
                "MINGW"*|"CYGWIN"*|"MSYS"*) echo "$APPDATA/Windsurf/User/extensions" ;;
            esac
            ;;
        "vscode-insiders")
            case $os in
                "Darwin") echo "$HOME/.vscode-insiders/extensions" ;;
                "Linux") echo "$HOME/.vscode-insiders/extensions" ;;
                "MINGW"*|"CYGWIN"*|"MSYS"*) echo "$APPDATA/Code - Insiders/User/extensions" ;;
            esac
            ;;
        "vscodium")
            case $os in
                "Darwin") echo "$HOME/.vscode-oss/extensions" ;;
                "Linux") echo "$HOME/.vscode-oss/extensions" ;;
                "MINGW"*|"CYGWIN"*|"MSYS"*) echo "$APPDATA/VSCodium/User/extensions" ;;
            esac
            ;;
    esac
}

# Function to uninstall extension from specific editor
uninstall_from_editor() {
    local editor=$1
    local editor_name=$2
    
    print_info "Uninstalling from $editor_name..."
    
    # Try command-line uninstallation first
    case $editor in
        "vscode")
            code --uninstall-extension flutter-debug-assistant 2>/dev/null || true
            ;;
        "cursor")
            cursor --uninstall-extension flutter-debug-assistant 2>/dev/null || true
            ;;
        "windsurf")
            windsurf --uninstall-extension flutter-debug-assistant 2>/dev/null || true
            ;;
        "vscode-insiders")
            code-insiders --uninstall-extension flutter-debug-assistant 2>/dev/null || true
            ;;
        "vscodium")
            codium --uninstall-extension flutter-debug-assistant 2>/dev/null || true
            ;;
    esac
    
    # Manual cleanup
    local ext_dir=$(get_extension_dir $editor)
    if [ -n "$ext_dir" ]; then
        # Look for various possible extension folder names
        local possible_dirs=(
            "$ext_dir/flutter-debug-assistant"
            "$ext_dir/flutter-debug-assistant-*"
            "$ext_dir/vitalijsimko.flutter-debug-assistant"
            "$ext_dir/vitalijsimko.flutter-debug-assistant-*"
        )
        
        for dir_pattern in "${possible_dirs[@]}"; do
            for dir in $dir_pattern; do
                if [ -d "$dir" ]; then
                    print_info "Removing: $dir"
                    rm -rf "$dir"
                fi
            done
        done
    fi
    
    print_status "Cleanup completed for $editor_name"
}

# Function to clean build artifacts
clean_build_artifacts() {
    print_info "Cleaning build artifacts..."
    
    cd flutter_debug_extension
    
    # Remove node_modules
    if [ -d "node_modules" ]; then
        print_info "Removing node_modules..."
        rm -rf node_modules
    fi
    
    # Remove build outputs
    if [ -d "out" ]; then
        print_info "Removing out directory..."
        rm -rf out
    fi
    
    if [ -d "dist" ]; then
        print_info "Removing dist directory..."
        rm -rf dist
    fi
    
    # Remove .vsix files
    if ls *.vsix 1> /dev/null 2>&1; then
        print_info "Removing old .vsix files..."
        rm -f *.vsix
    fi
    
    # Remove package-lock.json to ensure fresh install
    if [ -f "package-lock.json" ]; then
        print_info "Removing package-lock.json for fresh install..."
        rm -f package-lock.json
    fi
    
    cd ..
    
    print_status "Build artifacts cleaned"
}

# Function to kill editor processes (optional)
kill_editor_processes() {
    print_warning "Attempting to close editor processes for clean reinstall..."
    
    # Kill VS Code processes
    pkill -f "Visual Studio Code" 2>/dev/null || true
    pkill -f "code" 2>/dev/null || true
    
    # Kill Cursor processes
    pkill -f "Cursor" 2>/dev/null || true
    pkill -f "cursor" 2>/dev/null || true
    
    # Kill Windsurf processes
    pkill -f "Windsurf" 2>/dev/null || true
    pkill -f "windsurf" 2>/dev/null || true
    
    # Give processes time to close
    sleep 2
    
    print_info "Editor processes closed (if any were running)"
}

# Main reinstallation process
main() {
    print_info "Starting reinstallation process..."
    
    # Ask user if they want to close editors
    echo ""
    read -p "Do you want to close all editor processes for a clean reinstall? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_editor_processes
    fi
    
    # Detect available editors
    print_info "Detecting installed editors..."
    editors=($(detect_editors))
    
    if [ ${#editors[@]} -eq 0 ]; then
        print_error "No supported editors found!"
        print_info "Supported editors: VS Code, Cursor, Windsurf, VS Code Insiders, VSCodium"
        print_info "Please install at least one of these editors first."
        exit 1
    fi
    
    print_status "Found ${#editors[@]} editor(s): ${editors[*]}"
    
    # Uninstall from each detected editor
    print_info "Uninstalling existing installations..."
    
    for editor in "${editors[@]}"; do
        case $editor in
            "vscode") editor_name="VS Code" ;;
            "cursor") editor_name="Cursor" ;;
            "windsurf") editor_name="Windsurf" ;;
            "vscode-insiders") editor_name="VS Code Insiders" ;;
            "vscodium") editor_name="VSCodium" ;;
        esac
        
        uninstall_from_editor "$editor" "$editor_name"
    done
    
    # Clean build artifacts
    clean_build_artifacts
    
    echo ""
    print_status "Cleanup completed! Now running fresh installation..."
    echo ""
    
    # Run the installation script
    if [ -f "install_extension.sh" ]; then
        chmod +x install_extension.sh
        ./install_extension.sh
    else
        print_error "install_extension.sh not found!"
        print_info "Please make sure install_extension.sh is in the same directory"
        exit 1
    fi
}

# Show warning and get confirmation
echo "⚠️  This script will:"
echo "   1. Uninstall existing Flutter Debug Assistant extensions"
echo "   2. Clean all build artifacts and dependencies"
echo "   3. Reinstall the extension fresh in all detected editors"
echo ""
read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    main "$@"
else
    print_info "Reinstallation cancelled"
    exit 0
fi 