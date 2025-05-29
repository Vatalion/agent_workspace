#!/bin/bash

# Flutter Debug Assistant - Extension Manager
# One-click installer/reinstaller/tester for VS Code, Cursor, Windsurf, and more

echo "🎯 Flutter Debug Assistant - Extension Manager"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_title() {
    echo -e "${CYAN}$1${NC}"
}

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

# Function to show menu
show_menu() {
    echo ""
    print_title "What would you like to do?"
    echo ""
    echo "1) 🚀 Install Extension (Fresh installation)"
    echo "2) 🔄 Reinstall Extension (Clean reinstall)"
    echo "3) 🧪 Test Extension (Run test suite)"
    echo "4) 📋 Check Status (See what's installed)"
    echo "5) 🔧 Setup Test Environment"
    echo "6) 📖 Show Installation Guide"
    echo "7) ❌ Exit"
    echo ""
}

# Function to detect installed editors
detect_editors() {
    local editors=()
    
    print_info "Detecting installed editors..."
    
    # Check for VS Code
    if command -v code &> /dev/null; then
        editors+=("VS Code")
    fi
    
    # Check for Cursor
    if command -v cursor &> /dev/null; then
        editors+=("Cursor")
    fi
    
    # Check for Windsurf
    if command -v windsurf &> /dev/null; then
        editors+=("Windsurf")
    fi
    
    # Check for other common VS Code variants
    if command -v code-insiders &> /dev/null; then
        editors+=("VS Code Insiders")
    fi
    
    if command -v codium &> /dev/null; then
        editors+=("VSCodium")
    fi
    
    if [ ${#editors[@]} -eq 0 ]; then
        print_warning "No supported editors found!"
        print_info "Supported editors: VS Code, Cursor, Windsurf, VS Code Insiders, VSCodium"
        return 1
    else
        print_status "Found ${#editors[@]} editor(s): ${editors[*]}"
        return 0
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    local missing=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing+=("Node.js")
    else
        print_status "Node.js found: $(node --version)"
    fi
    
    # Check npm or yarn
    if ! command -v npm &> /dev/null && ! command -v yarn &> /dev/null; then
        missing+=("npm or yarn")
    else
        if command -v npm &> /dev/null; then
            print_status "npm found: $(npm --version)"
        fi
        if command -v yarn &> /dev/null; then
            print_status "yarn found: $(yarn --version)"
        fi
    fi
    
    # Check Flutter
    if ! command -v flutter &> /dev/null; then
        missing+=("Flutter")
    else
        print_status "Flutter found: $(flutter --version | head -1)"
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        print_warning "Missing prerequisites: ${missing[*]}"
        print_info "Please install the missing tools before continuing"
        return 1
    else
        print_status "All prerequisites found!"
        return 0
    fi
}

# Function to install extension
install_extension() {
    print_title "Installing Flutter Debug Assistant Extension"
    echo ""
    
    if [ ! -f "install_extension.sh" ]; then
        print_error "install_extension.sh not found!"
        return 1
    fi
    
    chmod +x install_extension.sh
    ./install_extension.sh
}

# Function to reinstall extension
reinstall_extension() {
    print_title "Reinstalling Flutter Debug Assistant Extension"
    echo ""
    
    if [ ! -f "reinstall_extension.sh" ]; then
        print_error "reinstall_extension.sh not found!"
        return 1
    fi
    
    chmod +x reinstall_extension.sh
    ./reinstall_extension.sh
}

# Function to test extension
test_extension() {
    print_title "Testing Flutter Debug Assistant Extension"
    echo ""
    
    print_info "Running test suite..."
    
    # Run the test script
    if [ -f "test_copilot_integration.js" ]; then
        node test_copilot_integration.js
    else
        print_warning "test_copilot_integration.js not found"
    fi
    
    echo ""
    print_info "Setting up test environment..."
    
    # Run the quick test setup
    if [ -f "quick_cursor_test.sh" ]; then
        chmod +x quick_cursor_test.sh
        ./quick_cursor_test.sh
    else
        print_warning "quick_cursor_test.sh not found"
    fi
}

# Function to check status
check_status() {
    print_title "Checking Extension Status"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    echo ""
    
    # Detect editors
    detect_editors
    echo ""
    
    # Check if extension files exist
    print_info "Checking extension files..."
    
    if [ -f "flutter_debug_extension/package.json" ]; then
        print_status "Extension source found"
        
        # Show version from package.json
        if command -v node &> /dev/null; then
            local version=$(node -p "require('./flutter_debug_extension/package.json').version" 2>/dev/null)
            if [ -n "$version" ]; then
                print_info "Extension version: $version"
            fi
        fi
    else
        print_error "Extension source not found"
    fi
    
    # Check for built extension
    if ls flutter_debug_extension/*.vsix 1> /dev/null 2>&1; then
        print_status "Packaged extension found"
        ls flutter_debug_extension/*.vsix | while read file; do
            print_info "Package: $(basename "$file")"
        done
    else
        print_warning "No packaged extension found"
    fi
}

# Function to setup test environment
setup_test_environment() {
    print_title "Setting up Test Environment"
    echo ""
    
    print_info "Creating test Flutter app with intentional errors..."
    
    if [ -f "quick_cursor_test.sh" ]; then
        chmod +x quick_cursor_test.sh
        ./quick_cursor_test.sh
    else
        print_error "quick_cursor_test.sh not found!"
        return 1
    fi
}

# Function to show installation guide
show_installation_guide() {
    print_title "Installation Guide"
    echo ""
    
    echo "📋 Manual Installation Steps:"
    echo "============================="
    echo ""
    echo "1. Prerequisites:"
    echo "   - Install Node.js (https://nodejs.org/)"
    echo "   - Install Flutter (https://flutter.dev/docs/get-started/install)"
    echo "   - Install VS Code, Cursor, or Windsurf"
    echo ""
    echo "2. Automatic Installation:"
    echo "   - Run: ./extension_manager.sh"
    echo "   - Choose option 1 (Install Extension)"
    echo ""
    echo "3. Manual Installation:"
    echo "   - cd flutter_debug_extension"
    echo "   - npm install"
    echo "   - npm install -g vsce"
    echo "   - vsce package"
    echo "   - code --install-extension *.vsix"
    echo ""
    echo "4. Testing:"
    echo "   - Run: ./extension_manager.sh"
    echo "   - Choose option 3 (Test Extension)"
    echo ""
    echo "📁 Extension Locations:"
    echo "======================"
    echo "   VS Code: ~/.vscode/extensions/"
    echo "   Cursor: ~/.cursor/extensions/"
    echo "   Windsurf: ~/.windsurf/extensions/"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "=================="
    echo "   - If installation fails, try option 2 (Reinstall)"
    echo "   - Check that all prerequisites are installed"
    echo "   - Restart your editor after installation"
    echo "   - Check extension is enabled in editor settings"
    echo ""
}

# Main menu loop
main() {
    while true; do
        show_menu
        read -p "Enter your choice (1-7): " choice
        
        case $choice in
            1)
                install_extension
                ;;
            2)
                reinstall_extension
                ;;
            3)
                test_extension
                ;;
            4)
                check_status
                ;;
            5)
                setup_test_environment
                ;;
            6)
                show_installation_guide
                ;;
            7)
                print_info "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1-7."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Welcome message
print_title "Welcome to Flutter Debug Assistant Extension Manager!"
echo ""
print_info "This tool helps you install, manage, and test the Flutter Debug Assistant extension"
print_info "for VS Code, Cursor, Windsurf, and other compatible editors."
echo ""

# Run main menu
main 