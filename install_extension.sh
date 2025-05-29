#!/bin/bash

# Flutter Debug Assistant - One-Click Installation Script
# Supports: VS Code, Cursor, Windsurf, and other VS Code-based editors

set -e  # Exit on any error

echo "🚀 Flutter Debug Assistant - One-Click Installer"
echo "================================================="
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

# Function to install Node.js dependencies
install_dependencies() {
    print_info "Installing Node.js dependencies..."
    
    cd flutter_debug_extension
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in flutter_debug_extension directory"
        exit 1
    fi
    
    # Install dependencies
    if command -v npm &> /dev/null; then
        print_info "Using npm to install dependencies..."
        npm install
    elif command -v yarn &> /dev/null; then
        print_info "Using yarn to install dependencies..."
        yarn install
    else
        print_error "Neither npm nor yarn found. Please install Node.js first."
        print_info "Visit: https://nodejs.org/"
        exit 1
    fi
    
    print_status "Dependencies installed successfully"
    cd ..
}

# Function to build the extension
build_extension() {
    print_info "Building the extension..."
    
    cd flutter_debug_extension
    
    # Check if we have a build script
    if npm run --silent 2>/dev/null | grep -q "compile"; then
        npm run compile
        print_status "Extension compiled successfully"
    elif npm run --silent 2>/dev/null | grep -q "build"; then
        npm run build
        print_status "Extension built successfully"
    else
        print_warning "No build script found, proceeding with source files"
    fi
    
    cd ..
}

# Function to package the extension
package_extension() {
    print_info "Packaging the extension..."
    
    cd flutter_debug_extension
    
    # Install vsce if not available
    if ! command -v vsce &> /dev/null; then
        print_info "Installing vsce (Visual Studio Code Extension manager)..."
        npm install -g vsce
    fi
    
    # Package the extension
    vsce package --no-git-tag-version --no-update-package-json
    
    # Find the generated .vsix file
    VSIX_FILE=$(ls *.vsix 2>/dev/null | head -1)
    
    if [ -z "$VSIX_FILE" ]; then
        print_error "Failed to create .vsix package"
        exit 1
    fi
    
    print_status "Extension packaged as: $VSIX_FILE"
    cd ..
    
    echo "$VSIX_FILE"
}

# Function to install extension in specific editor
install_in_editor() {
    local editor=$1
    local vsix_file=$2
    local editor_name=$3
    
    print_info "Installing in $editor_name..."
    
    case $editor in
        "vscode")
            code --install-extension "flutter_debug_extension/$vsix_file" --force
            ;;
        "cursor")
            cursor --install-extension "flutter_debug_extension/$vsix_file" --force
            ;;
        "windsurf")
            windsurf --install-extension "flutter_debug_extension/$vsix_file" --force
            ;;
        "vscode-insiders")
            code-insiders --install-extension "flutter_debug_extension/$vsix_file" --force
            ;;
        "vscodium")
            codium --install-extension "flutter_debug_extension/$vsix_file" --force
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        print_status "Successfully installed in $editor_name"
    else
        print_warning "Installation in $editor_name may have failed"
    fi
}

# Function to copy extension manually (fallback)
manual_install() {
    local editor=$1
    local editor_name=$2
    local ext_dir=$(get_extension_dir $editor)
    
    if [ -z "$ext_dir" ]; then
        print_warning "Could not determine extension directory for $editor_name"
        return 1
    fi
    
    print_info "Manual installation in $editor_name..."
    print_info "Extension directory: $ext_dir"
    
    # Create extension directory if it doesn't exist
    mkdir -p "$ext_dir"
    
    # Create our extension folder
    local target_dir="$ext_dir/flutter-debug-assistant"
    
    # Remove existing installation
    if [ -d "$target_dir" ]; then
        print_info "Removing existing installation..."
        rm -rf "$target_dir"
    fi
    
    # Copy extension files
    print_info "Copying extension files..."
    cp -r flutter_debug_extension "$target_dir"
    
    print_status "Manual installation completed for $editor_name"
    print_info "Extension installed at: $target_dir"
}

# Main installation process
main() {
    print_info "Starting installation process..."
    
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
    
    # Install dependencies
    install_dependencies
    
    # Build extension
    build_extension
    
    # Package extension
    vsix_file=$(package_extension)
    
    # Install in each detected editor
    print_info "Installing extension in detected editors..."
    
    for editor in "${editors[@]}"; do
        case $editor in
            "vscode") editor_name="VS Code" ;;
            "cursor") editor_name="Cursor" ;;
            "windsurf") editor_name="Windsurf" ;;
            "vscode-insiders") editor_name="VS Code Insiders" ;;
            "vscodium") editor_name="VSCodium" ;;
        esac
        
        echo ""
        print_info "Installing in $editor_name..."
        
        # Try command-line installation first
        if install_in_editor "$editor" "$vsix_file" "$editor_name" 2>/dev/null; then
            print_status "Command-line installation successful for $editor_name"
        else
            print_warning "Command-line installation failed, trying manual installation..."
            manual_install "$editor" "$editor_name"
        fi
    done
    
    echo ""
    print_status "Installation completed!"
    
    # Post-installation instructions
    echo ""
    echo "📋 Post-Installation Steps:"
    echo "=========================="
    echo "1. Restart your editor(s)"
    echo "2. Open a Flutter project"
    echo "3. Look for 'Flutter Debug Assistant' in the extensions list"
    echo "4. The extension should appear in the activity bar"
    echo ""
    echo "🧪 To test the extension:"
    echo "========================"
    echo "1. Run: ./quick_cursor_test.sh"
    echo "2. Or manually test with: flutter run in test_flutter_app"
    echo ""
    echo "🔧 If you encounter issues:"
    echo "=========================="
    echo "1. Check the extension is enabled in your editor"
    echo "2. Look for error messages in the developer console"
    echo "3. Try reinstalling with: ./reinstall_extension.sh"
    echo ""
    
    # Show installation locations
    echo "📁 Extension installed in:"
    echo "========================="
    for editor in "${editors[@]}"; do
        case $editor in
            "vscode") editor_name="VS Code" ;;
            "cursor") editor_name="Cursor" ;;
            "windsurf") editor_name="Windsurf" ;;
            "vscode-insiders") editor_name="VS Code Insiders" ;;
            "vscodium") editor_name="VSCodium" ;;
        esac
        
        ext_dir=$(get_extension_dir $editor)
        if [ -n "$ext_dir" ]; then
            echo "  $editor_name: $ext_dir/flutter-debug-assistant"
        fi
    done
}

# Run main function
main "$@" 