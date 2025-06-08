#!/bin/bash

# Workspace Build System - Creates self-contained packages
# Usage: ./build.sh [package-name] [mode] [target]
# Examples:
#   ./build.sh                           # Build all packages for development
#   ./build.sh mcp-server production     # Build MCP server for production
#   ./build.sh --bundle-all production   # Build all packages with bundled dependencies

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}▶${NC} $1"; }
print_success() { echo -e "${GREEN}✅${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}❌${NC} $1"; }

# Configuration
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_MODE="${2:-development}"
BUILD_TARGET="${3:-default}"
BUNDLE_EXTERNAL="${BUNDLE_EXTERNAL:-true}"

# Parse arguments
PACKAGE_NAME="$1"
if [ "$1" = "--bundle-all" ]; then
    BUNDLE_EXTERNAL="true"
    BUILD_MODE="${2:-production}"
    PACKAGE_NAME=""
fi

# Packages configuration
declare -A PACKAGES=(
    ["flutter-error-transport"]="flutter"
    ["mcp-server"]="node"
    ["vscode-flutter-debug"]="vscode-extension"
    ["vscode-ai-deployer"]="vscode-extension" 
    ["test-app"]="flutter"
)

print_status "Flutter Error Transport Workspace Builder"
echo "Mode: $BUILD_MODE | Bundle External: $BUNDLE_EXTERNAL"
echo "==========================================="

# Function to install Node.js dependencies with bundling
install_node_deps() {
    local package_dir="$1"
    local bundle_mode="$2"
    
    cd "$package_dir"
    
    if [ "$bundle_mode" = "bundle" ] && [ "$BUILD_MODE" = "production" ]; then
        print_status "Installing production dependencies (bundling mode)"
        npm ci --only=production
        
        # Install bundling tools
        npm install --no-save esbuild @vercel/ncc webpack webpack-cli
        
    else
        print_status "Installing all dependencies (development mode)"
        npm install
    fi
    
    cd "$WORKSPACE_ROOT"
}

# Function to build Flutter package
build_flutter_package() {
    local package_dir="$1"
    local package_name="$(basename "$package_dir")"
    
    print_status "Building Flutter package: $package_name"
    cd "$package_dir"
    
    # Install dependencies
    flutter pub get
    
    if [ "$BUILD_MODE" = "production" ]; then
        print_status "Building Flutter for production (self-contained)"
        
        # Build for multiple platforms
        if [ "$BUNDLE_EXTERNAL" = "true" ]; then
            # Create self-contained builds
            mkdir -p "build/self-contained"
            
            # Web build (self-contained)
            flutter build web --release --output="build/self-contained/web"
            
            # Android build (self-contained APK)
            if command -v flutter &> /dev/null && flutter doctor | grep -q "Android"; then
                flutter build apk --release --target-platform=android-arm64
                cp "build/app/outputs/flutter-apk/app-release.apk" "build/self-contained/${package_name}-release.apk"
            fi
            
            # iOS build (if on macOS)
            if [[ "$OSTYPE" == "darwin"* ]] && command -v xcodebuild &> /dev/null; then
                flutter build ios --release --no-codesign
            fi
            
            print_success "Self-contained Flutter builds created in build/self-contained/"
        else
            flutter build web --release
            flutter build apk --release
        fi
    else
        print_status "Building Flutter for development"
        flutter build web --debug
    fi
    
    cd "$WORKSPACE_ROOT"
}

# Function to build Node.js package
build_node_package() {
    local package_dir="$1"
    local package_name="$(basename "$package_dir")"
    
    print_status "Building Node.js package: $package_name"
    cd "$package_dir"
    
    install_node_deps "$package_dir" "$([ "$BUNDLE_EXTERNAL" = "true" ] && echo "bundle" || echo "normal")"
    
    if [ "$BUILD_MODE" = "production" ] && [ "$BUNDLE_EXTERNAL" = "true" ]; then
        print_status "Creating self-contained Node.js build"
        
        # Create bundled version using esbuild
        npx esbuild src/index.ts \
            --bundle \
            --platform=node \
            --target=node16 \
            --format=cjs \
            --outfile=dist/index-bundled.js \
            --minify \
            --sourcemap=false \
            --external:vscode
            
        # Make bundled version executable
        echo '#!/usr/bin/env node' | cat - dist/index-bundled.js > dist/index-standalone.js
        chmod +x dist/index-standalone.js
        
        # Create package info
        cat > dist/package-info.json << EOF
{
  "name": "$package_name",
  "version": "1.0.0",
  "type": "self-contained",
  "bundled": true,
  "dependencies": "embedded",
  "executable": "index-standalone.js"
}
EOF
        
        print_success "Self-contained Node.js build created: dist/index-standalone.js"
    else
        # Standard TypeScript compilation
        npm run build
    fi
    
    cd "$WORKSPACE_ROOT"
}

# Function to build VS Code extension
build_vscode_extension() {
    local package_dir="$1"
    local package_name="$(basename "$package_dir")"
    
    print_status "Building VS Code extension: $package_name"
    cd "$package_dir"
    
    install_node_deps "$package_dir" "$([ "$BUNDLE_EXTERNAL" = "true" ] && echo "bundle" || echo "normal")"
    
    if [ "$BUILD_MODE" = "production" ] && [ "$BUNDLE_EXTERNAL" = "true" ]; then
        print_status "Creating self-contained VS Code extension"
        
        # Bundle the extension with all dependencies
        npx esbuild src/extension.ts \
            --bundle \
            --platform=node \
            --target=node16 \
            --format=cjs \
            --outfile=dist/extension.js \
            --minify \
            --sourcemap=false \
            --external:vscode
            
        # If this is the flutter-debug extension, bundle the MCP server too
        if [ "$package_name" = "vscode-flutter-debug" ] && [ -f "../mcp-server/dist/index-standalone.js" ]; then
            print_status "Bundling MCP server into extension"
            mkdir -p dist/bundled
            cp "../mcp-server/dist/index-standalone.js" "dist/bundled/mcp-server.js"
            cp "../mcp-server/dist/package-info.json" "dist/bundled/mcp-info.json"
        fi
        
        # Install vsce if not available
        if ! command -v vsce &> /dev/null; then
            npm install -g @vscode/vsce
        fi
        
        # Package into .vsix (self-contained)
        vsce package --no-dependencies --allow-star-activation
        
        # Find the generated .vsix file
        VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -n1)
        if [ -n "$VSIX_FILE" ]; then
            mkdir -p dist/self-contained
            mv "$VSIX_FILE" "dist/self-contained/"
            print_success "Self-contained extension package: dist/self-contained/$VSIX_FILE"
        fi
        
    else
        # Standard TypeScript compilation
        npm run build || npx tsc
    fi
    
    cd "$WORKSPACE_ROOT"
}

# Function to build a single package
build_package() {
    local package_name="$1"
    local package_type="${PACKAGES[$package_name]}"
    local package_dir="$WORKSPACE_ROOT/$package_name"
    
    if [ ! -d "$package_dir" ]; then
        print_error "Package directory not found: $package_dir"
        return 1
    fi
    
    print_status "Building $package_name ($package_type)"
    
    case "$package_type" in
        "flutter")
            build_flutter_package "$package_dir"
            ;;
        "node")
            build_node_package "$package_dir"
            ;;
        "vscode-extension")
            build_vscode_extension "$package_dir"
            ;;
        *)
            print_error "Unknown package type: $package_type"
            return 1
            ;;
    esac
}

# Function to create workspace distribution
create_workspace_distribution() {
    if [ "$BUILD_MODE" != "production" ] || [ "$BUNDLE_EXTERNAL" != "true" ]; then
        return 0
    fi
    
    print_status "Creating workspace distribution"
    
    DIST_DIR="$WORKSPACE_ROOT/dist/workspace-distribution"
    rm -rf "$DIST_DIR"
    mkdir -p "$DIST_DIR"
    
    # Copy self-contained builds
    for package_name in "${!PACKAGES[@]}"; do
        package_dir="$WORKSPACE_ROOT/$package_name"
        
        if [ -d "$package_dir/dist/self-contained" ]; then
            mkdir -p "$DIST_DIR/$package_name"
            cp -r "$package_dir/dist/self-contained/"* "$DIST_DIR/$package_name/"
        elif [ -f "$package_dir/dist/index-standalone.js" ]; then
            mkdir -p "$DIST_DIR/$package_name"
            cp "$package_dir/dist/index-standalone.js" "$DIST_DIR/$package_name/"
            cp "$package_dir/dist/package-info.json" "$DIST_DIR/$package_name/" 2>/dev/null || true
        fi
    done
    
    # Create distribution manifest
    cat > "$DIST_DIR/distribution-manifest.json" << EOF
{
  "name": "flutter-error-transport-workspace",
  "version": "1.0.0",
  "type": "self-contained-distribution",
  "buildMode": "$BUILD_MODE",
  "bundledExternal": true,
  "packages": {
$(for package_name in "${!PACKAGES[@]}"; do
    echo "    \"$package_name\": {\"type\": \"${PACKAGES[$package_name]}\", \"selfContained\": true},"
done | sed '$ s/,$//')
  },
  "installation": {
    "mcp-server": "Copy mcp-server/index-standalone.js and run with: node index-standalone.js",
    "vscode-extensions": "Install .vsix files with: code --install-extension package.vsix",
    "flutter-apps": "Self-contained builds ready for deployment"
  }
}
EOF
    
    # Create installation script
    cat > "$DIST_DIR/install.sh" << 'EOF'
#!/bin/bash
echo "🚀 Installing Flutter Error Transport Workspace"
echo "This will install all self-contained packages..."

# Install VS Code extensions
for vsix_file in */self-contained/*.vsix; do
    if [ -f "$vsix_file" ]; then
        echo "Installing VS Code extension: $vsix_file"
        code --install-extension "$vsix_file" || true
    fi
done

# Set up MCP server
if [ -f "mcp-server/index-standalone.js" ]; then
    echo "MCP server available at: mcp-server/index-standalone.js"
    echo "Run with: node mcp-server/index-standalone.js"
fi

echo "✅ Installation complete!"
EOF
    chmod +x "$DIST_DIR/install.sh"
    
    print_success "Workspace distribution created: dist/workspace-distribution/"
}

# Main build logic
main() {
    # Check prerequisites
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    # Build specific package or all packages
    if [ -n "$PACKAGE_NAME" ] && [ "$PACKAGE_NAME" != "--bundle-all" ]; then
        if [[ -v "PACKAGES[$PACKAGE_NAME]" ]]; then
            build_package "$PACKAGE_NAME"
        else
            print_error "Unknown package: $PACKAGE_NAME"
            print_status "Available packages: ${!PACKAGES[*]}"
            exit 1
        fi
    else
        # Build all packages
        for package_name in "${!PACKAGES[@]}"; do
            build_package "$package_name"
        done
    fi
    
    # Create distribution if in production mode
    create_workspace_distribution
    
    print_success "Build complete!"
    
    if [ "$BUILD_MODE" = "production" ] && [ "$BUNDLE_EXTERNAL" = "true" ]; then
        echo ""
        print_status "Self-contained builds created:"
        echo "• All packages are bundled with dependencies"
        echo "• No external dependencies required at runtime"
        echo "• Ready for distribution and deployment"
        echo ""
        echo "Distribution: dist/workspace-distribution/"
    fi
}

main "$@"
