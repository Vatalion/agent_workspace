#!/bin/bash

# Flutter Error Transport MCP - Team Integration Script
# This script makes it easy for team members to integrate the MCP server into any Flutter project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🚀 Flutter Error Transport MCP - Team Integration${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Function to print colored output
print_step() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in a Flutter project
check_flutter_project() {
    if [ ! -f "pubspec.yaml" ]; then
        print_error "This doesn't appear to be a Flutter project (no pubspec.yaml found)"
        echo "Please run this script from your Flutter project root directory"
        exit 1
    fi
    print_step "Flutter project detected"
}

# Get project path from user
get_project_path() {
    if [ $# -eq 0 ]; then
        echo -e "${YELLOW}Usage: $0 [flutter-project-path]${NC}"
        echo "Or run from within your Flutter project directory"
        read -p "Enter path to your Flutter project (or press Enter for current directory): " PROJECT_PATH
        if [ -z "$PROJECT_PATH" ]; then
            PROJECT_PATH="."
        fi
    else
        PROJECT_PATH="$1"
    fi
    
    cd "$PROJECT_PATH"
    PROJECT_PATH="$(pwd)"
    print_info "Working with Flutter project at: $PROJECT_PATH"
}

# Create services directory
create_services_dir() {
    mkdir -p lib/services
    print_step "Created lib/services directory"
}

# Copy integration files
copy_integration_files() {
    print_info "Choose integration type:"
    echo "1) Basic Integration (HTTP-based, simple setup)"
    echo "2) Real-time Integration (WebSocket-based, advanced features)"
    echo "3) Both (recommended for team flexibility)"
    
    read -p "Enter choice (1/2/3): " CHOICE
    
    case $CHOICE in
        1)
            cp "$SCRIPT_DIR/examples/flutter_integration.dart" lib/services/
            print_step "Copied basic integration file"
            INTEGRATION_TYPE="basic"
            ;;
        2)
            cp "$SCRIPT_DIR/examples/flutter_integration_socket_ready.dart" lib/services/flutter_error_transport.dart
            print_step "Copied real-time integration file"
            INTEGRATION_TYPE="realtime"
            ;;
        3)
            cp "$SCRIPT_DIR/examples/flutter_integration.dart" lib/services/flutter_error_transport_basic.dart
            cp "$SCRIPT_DIR/examples/flutter_integration_socket_ready.dart" lib/services/flutter_error_transport.dart
            print_step "Copied both integration files"
            INTEGRATION_TYPE="both"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Update pubspec.yaml
update_pubspec() {
    print_info "Updating pubspec.yaml with required dependencies..."
    
    # Check if dependencies already exist
    if grep -q "web_socket_channel:" pubspec.yaml 2>/dev/null; then
        print_info "Dependencies already exist in pubspec.yaml"
        return
    fi
    
    # Add dependencies to pubspec.yaml
    if [ "$INTEGRATION_TYPE" = "basic" ]; then
        # Add only http dependency
        if ! grep -q "http:" pubspec.yaml; then
            sed -i '' '/dependencies:/a\
  http: ^1.1.0' pubspec.yaml
            print_step "Added http dependency"
        fi
    else
        # Add both http and web_socket_channel
        if ! grep -q "http:" pubspec.yaml; then
            sed -i '' '/dependencies:/a\
  http: ^1.1.0' pubspec.yaml
        fi
        if ! grep -q "web_socket_channel:" pubspec.yaml; then
            sed -i '' '/dependencies:/a\
  web_socket_channel: ^2.4.0' pubspec.yaml
        fi
        print_step "Added http and web_socket_channel dependencies"
    fi
}

# Create or update main.dart
update_main_dart() {
    print_info "Do you want to automatically update your main.dart file? (y/n)"
    read -p "This will add FlutterErrorTransport.initialize() to your main function: " UPDATE_MAIN
    
    if [ "$UPDATE_MAIN" = "y" ] || [ "$UPDATE_MAIN" = "Y" ]; then
        # Backup main.dart
        cp lib/main.dart lib/main.dart.backup
        print_step "Backed up main.dart to main.dart.backup"
        
        # Create updated main.dart
        cat > lib/main.dart.new << EOF
import 'package:flutter/material.dart';
import 'services/flutter_error_transport.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Flutter Error Transport for team debugging
  await FlutterErrorTransport.initialize();
  
  runApp(MyApp());
}

// Your existing app code goes here
$(tail -n +1 lib/main.dart | grep -v "void main()" | grep -v "runApp")
EOF
        
        mv lib/main.dart.new lib/main.dart
        print_step "Updated main.dart with error transport initialization"
    else
        print_info "Skipped main.dart update. You'll need to manually add:"
        echo -e "${YELLOW}  import 'services/flutter_error_transport.dart';${NC}"
        echo -e "${YELLOW}  await FlutterErrorTransport.initialize();${NC}"
    fi
}

# Create VS Code MCP configuration
create_vscode_config() {
    mkdir -p .vscode
    
    cat > .vscode/mcp.json << EOF
{
  "mcpServers": {
    "flutter-error-transport": {
      "command": "node",
      "args": ["$SCRIPT_DIR/dist/index.js"]
    }
  }
}
EOF
    
    print_step "Created VS Code MCP configuration"
}

# Create team documentation
create_team_docs() {
    cat > FLUTTER_ERROR_TRANSPORT.md << EOF
# Flutter Error Transport - Team Setup

This project uses the Flutter Error Transport MCP server for AI-powered debugging assistance.

## 🚀 Quick Start for Team Members

### 1. Start the MCP Server
\`\`\`bash
cd $SCRIPT_DIR
npm install  # First time only
npm start
\`\`\`

### 2. Run the Flutter App
\`\`\`bash
flutter pub get  # If dependencies changed
flutter run
\`\`\`

### 3. Test Error Capture
Add this test button to any widget:
\`\`\`dart
ElevatedButton(
  onPressed: () {
    FlutterErrorTransport.captureError(
      errorMessage: "Test error from \${widget.runtimeType}",
      stackTrace: StackTrace.current.toString(),
      errorType: 'test',
      severity: 'medium',
    );
  },
  child: Text('Test Error Capture'),
)
\`\`\`

## 🛠️ Available Features

### Manual Error Capture
\`\`\`dart
// Custom errors
FlutterErrorTransport.captureError(
  errorMessage: "Something went wrong",
  stackTrace: StackTrace.current.toString(),
  errorType: 'custom',
  severity: 'high',
);

// HTTP errors (use with Dio interceptor)
FlutterErrorTransport.captureHttpError(
  'GET', '/api/data', 500,
  'Server error', stackTrace.toString(),
);

// State management errors
FlutterErrorTransport.captureStateError(
  'UserState', 'Invalid state transition',
  stackTrace.toString(),
  currentState: 'loading',
  action: 'fetchUser',
);
\`\`\`

### Real-time Features (if using socket-ready version)
- ✅ Real-time error streaming to AI systems
- ✅ Automatic error analysis and suggestions
- ✅ Connection status monitoring
- ✅ Error queuing for offline scenarios

## 🔧 MCP Server Management

### Check Server Status
\`\`\`bash
# Check if server is running
curl http://localhost:3000/health

# Check WebSocket connection (real-time version)
node $SCRIPT_DIR/examples/websocket_test_client.js
\`\`\`

### VS Code Integration
The server is automatically configured for VS Code MCP integration. After starting the server:
1. Open Command Palette (Cmd+Shift+P)
2. Look for MCP-related commands
3. Access Flutter error analysis tools

## 🐛 Troubleshooting

### Server Won't Start
\`\`\`bash
cd $SCRIPT_DIR
npm install  # Reinstall dependencies
npm run build  # Rebuild if needed
npm start
\`\`\`

### Connection Issues
- Check that port 3000 (HTTP) and 8080 (WebSocket) are available
- Verify firewall settings
- Restart the MCP server

### Flutter Integration Issues
- Run \`flutter clean && flutter pub get\`
- Check that dependencies are properly added to pubspec.yaml
- Verify import statements in your Dart files

## 📊 Team Benefits

- **🤖 AI-Powered Debugging**: Get instant analysis and fix suggestions
- **⚡ Real-time Error Detection**: Catch issues as they happen
- **📈 Error Pattern Recognition**: Identify recurring problems
- **🔄 Collaborative Debugging**: Multiple team members can connect simultaneously
- **📱 Production Ready**: Comprehensive error categorization and handling

## 🔗 Server Location
MCP Server: \`$SCRIPT_DIR\`

For more details, see the full documentation in the MCP server repository.
EOF
    
    print_step "Created team documentation (FLUTTER_ERROR_TRANSPORT.md)"
}

# Create startup scripts for team members
create_startup_scripts() {
    # Create start-mcp.sh script
    cat > start-mcp.sh << 'EOF'
#!/bin/bash
# Quick script to start the MCP server for team members

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd FLUTTER_ERROR_TRANSPORT_PATH && pwd)"

echo "🚀 Starting Flutter Error Transport MCP Server..."
echo "Server location: $SCRIPT_DIR"

cd "$SCRIPT_DIR"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build if needed
if [ ! -f "dist/index.js" ]; then
    echo "🔨 Building server..."
    npm run build
fi

echo "✅ Starting MCP server..."
npm start
EOF

    # Replace placeholder with actual path
    sed -i '' "s|FLUTTER_ERROR_TRANSPORT_PATH|$SCRIPT_DIR|g" start-mcp.sh
    chmod +x start-mcp.sh
    
    print_step "Created start-mcp.sh script for easy server startup"
}

# Add gitignore entries
update_gitignore() {
    if [ -f ".gitignore" ]; then
        if ! grep -q "# Flutter Error Transport" .gitignore; then
            cat >> .gitignore << EOF

# Flutter Error Transport
lib/main.dart.backup
EOF
            print_step "Updated .gitignore"
        fi
    fi
}

# Main execution
main() {
    echo -e "${BLUE}This script will integrate Flutter Error Transport into your Flutter project${NC}"
    echo -e "${BLUE}Making it easy for your entire team to use AI-powered debugging!${NC}"
    echo ""
    
    get_project_path "$@"
    check_flutter_project
    create_services_dir
    copy_integration_files
    update_pubspec
    update_main_dart
    create_vscode_config
    create_team_docs
    create_startup_scripts
    update_gitignore
    
    echo ""
    echo -e "${GREEN}🎉 Team Integration Complete!${NC}"
    echo ""
    echo -e "${BLUE}Next Steps for Your Team:${NC}"
    echo -e "${YELLOW}1. Run 'flutter pub get' to install dependencies${NC}"
    echo -e "${YELLOW}2. Start MCP server: './start-mcp.sh'${NC}"
    echo -e "${YELLOW}3. Run your Flutter app: 'flutter run'${NC}"
    echo -e "${YELLOW}4. Share FLUTTER_ERROR_TRANSPORT.md with your team${NC}"
    echo ""
    echo -e "${GREEN}🤝 Your team now has AI-powered Flutter debugging!${NC}"
}

# Run main function
main "$@"
