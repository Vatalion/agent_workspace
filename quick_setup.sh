#!/bin/bash

# Flutter Error Transport - One Command Team Setup
# This script creates everything your team needs to get started quickly

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🚀 Flutter Error Transport - One Command Setup${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if we're in a Flutter project
if [ ! -f "pubspec.yaml" ]; then
    echo -e "${YELLOW}⚠️  Please run this script from your Flutter project root directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Flutter project detected${NC}"

# Create directory structure
mkdir -p lib/services .vscode

# Copy production-ready integration
cp "$SCRIPT_DIR/examples/flutter_error_transport_production.dart" lib/services/flutter_error_transport.dart
echo -e "${GREEN}✅ Added production-ready error transport${NC}"

# Add dependencies to pubspec.yaml
DEPS_ADDED=false

# Check if dependencies already exist
HAS_WS=$(grep -c "web_socket_channel:" pubspec.yaml || true)
HAS_HTTP=$(grep -c "^ *http:" pubspec.yaml || true)

# Only add missing dependencies
if [ "$HAS_WS" -eq 0 ] || [ "$HAS_HTTP" -eq 0 ]; then
    # Use Python for more reliable YAML manipulation
    python3 -c "
import sys
import re

with open('pubspec.yaml', 'r') as f:
    content = f.read()

lines = content.split('\n')
new_lines = []
deps_section = False
deps_added = False

for line in lines:
    if line.strip() == 'dependencies:':
        new_lines.append(line)
        deps_section = True
        # Add missing dependencies right after dependencies: line
        if $HAS_WS == 0:
            new_lines.append('  web_socket_channel: ^2.4.0')
        if $HAS_HTTP == 0:
            new_lines.append('  http: ^1.1.0')
        deps_added = True
    elif deps_section and line.strip() and not line.startswith(' ') and not line.startswith('\t'):
        # End of dependencies section
        deps_section = False
        new_lines.append(line)
    else:
        new_lines.append(line)

with open('pubspec.yaml', 'w') as f:
    f.write('\n'.join(new_lines))

print('Dependencies added successfully' if deps_added else 'No dependencies needed')
"
    DEPS_ADDED=true
fi

if [ "$DEPS_ADDED" = true ]; then
    echo -e "${GREEN}✅ Added required dependencies${NC}"
else
    echo -e "${GREEN}✅ Dependencies already present${NC}"
fi

# Create VS Code MCP configuration
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
echo -e "${GREEN}✅ Created VS Code MCP configuration${NC}"

# Create startup script
cat > start-mcp.sh << EOF
#!/bin/bash
echo "🚀 Starting Flutter Error Transport MCP Server..."
cd "$SCRIPT_DIR"
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi
if [ ! -f "dist/index.js" ]; then
    echo "🔨 Building server..."
    npm run build
fi
echo "✅ Starting MCP server on ports 3000 (HTTP) and 8080 (WebSocket)..."
npm start
EOF
chmod +x start-mcp.sh
echo -e "${GREEN}✅ Created MCP server startup script${NC}"

# Create team documentation
cat > README_FLUTTER_ERRORS.md << EOF
# 🤖 AI-Powered Flutter Debugging Setup

Your project now has AI-powered error detection and debugging assistance!

## 🚀 Quick Start

### 1. Install Dependencies
\`\`\`bash
flutter pub get
\`\`\`

### 2. Add to Your main.dart
\`\`\`dart
import 'services/flutter_error_transport.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize AI-powered error transport
  await FlutterErrorTransport.initialize();
  
  runApp(MyApp());
}
\`\`\`

### 3. Optional: Add Route Tracking
\`\`\`dart
MaterialApp(
  navigatorObservers: [
    FlutterErrorTransportNavigatorObserver(),
  ],
  // ... rest of your app
)
\`\`\`

### 4. Start MCP Server
\`\`\`bash
./start-mcp.sh
\`\`\`

### 5. Run Your App
\`\`\`bash
flutter run
\`\`\`

## 🧪 Test It Works

Add this test button anywhere in your app:
\`\`\`dart
ElevatedButton(
  onPressed: () {
    FlutterErrorTransport.captureError(
      errorMessage: "Test error - AI debugging active!",
      stackTrace: StackTrace.current.toString(),
      errorType: 'test',
      severity: 'medium',
    );
  },
  child: Text('Test AI Error Analysis'),
)
\`\`\`

## 🎯 Features Your Team Gets

- ✅ **Automatic Error Capture**: All Flutter errors are automatically detected
- ✅ **Real-time AI Analysis**: Instant analysis and fix suggestions
- ✅ **Multiple Error Types**: HTTP, State, Navigation, Widget errors
- ✅ **Team Collaboration**: Multiple developers can connect simultaneously
- ✅ **Production Ready**: Reliable with HTTP fallback

## 🔧 Manual Error Capture

\`\`\`dart
// Custom errors
FlutterErrorTransport.captureError(
  errorMessage: "Something went wrong",
  stackTrace: StackTrace.current.toString(),
  errorType: 'custom',
  severity: 'high',
);

// HTTP/API errors
FlutterErrorTransport.captureHttpError(
  'POST', '/api/login', 401,
  'Authentication failed', stackTrace.toString(),
);

// State management errors
FlutterErrorTransport.captureStateError(
  'UserState', 'Invalid transition',
  stackTrace.toString(),
  currentState: 'loading',
  action: 'login',
);
\`\`\`

## 🌐 Server Info

- **HTTP Endpoint**: http://localhost:3000
- **WebSocket**: ws://localhost:8080
- **Server Location**: \`$SCRIPT_DIR\`

## 🤝 Team Usage

1. **Each team member** runs \`./start-mcp.sh\` to start their local MCP server
2. **VS Code users** get automatic MCP integration for AI assistance
3. **Real-time collaboration** - multiple developers can connect simultaneously
4. **Shared debugging** - errors and solutions are immediately available to AI assistants

Enjoy AI-powered Flutter debugging! 🚀
EOF
echo -e "${GREEN}✅ Created team documentation${NC}"

echo ""
echo -e "${BLUE}🎉 Setup Complete! Next Steps:${NC}"
echo -e "${YELLOW}1. Run: flutter pub get${NC}"
echo -e "${YELLOW}2. Add FlutterErrorTransport.initialize() to your main.dart${NC}"
echo -e "${YELLOW}3. Start MCP server: ./start-mcp.sh${NC}"
echo -e "${YELLOW}4. Run your Flutter app: flutter run${NC}"
echo ""
echo -e "${GREEN}🤖 Your team now has AI-powered Flutter debugging!${NC}"
