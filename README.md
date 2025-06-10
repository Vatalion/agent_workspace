# Flutter Debug Assistant - Complete AI-Powered Debugging Solution

A **production-ready** Flutter debugging ecosystem combining IDE extensions, MCP server, and comprehensive test environment. Features real-time error detection, **universal AI assistant integration** (GitHub Copilot, Cursor, Windsurf, Claude Dev, etc.), and intelligent debugging assistance.

## 🎉 **PROJECT STATUS: PRODUCTION READY** ✅

✅ **Universal AI Support**: Works with ANY AI coding assistant  
✅ **IDE Extensions**: VS Code extension compiled and packaged  
✅ **MCP Server**: Complete with 7 debugging tools  
✅ **Flutter Test App**: 30+ error scenarios across 9 categories  
✅ **AI Integration**: Real-time streaming + universal compatibility  
✅ **Documentation**: Comprehensive guides and examples  

## 🤖 **Universal AI Assistant Support**

**Works seamlessly with ANY AI coding tool:**
- ✅ **GitHub Copilot** (VS Code, JetBrains, Vim)
- ✅ **Cursor** (AI-first code editor) 
- ✅ **Windsurf** (Codeium's AI editor)
- ✅ **Claude Dev** (VS Code extension)
- ✅ **Continue** (Open-source AI assistant)
- ✅ **Aider** (Command line AI programmer)
- ✅ **Any other AI coding assistant**

**See `docs/AI_COMPATIBILITY_GUIDE.md` for setup instructions with your preferred AI tool.**

## 🚀 Core Components

### 1. **VS Code Extension** (`flutter_debug_extension/`)
- **2,229 lines** of TypeScript implementation
- Real-time error detection with CodeLens integration
- Extension panel for server control and monitoring
- Integrated with VS Code debugging and terminal
- **Status**: Compiled, packaged, and ready to install

### 2. **MCP Server** (`src/`)
- 7 specialized Flutter debugging tools
- Real-time WebSocket streaming to AI systems
- Comprehensive error analysis and pattern recognition
- **Status**: Complete implementation with full tool suite

### 3. **Flutter Test App** (`test_flutter_app/`)
- 30+ predefined error scenarios
- Covers 9 error categories (widget_build, state_management, navigation, etc.)
- Ready-to-run testing environment
- **Status**: Dependencies installed, fully functional

## 🌟 Key Features

- **🔥 Real-time Error Detection**: Automatic capture with VS Code CodeLens integration
- **📡 AI-Powered Analysis**: GitHub Copilot Chat integration with MCP server tools
- **⚡ Extension Panel**: Control server, monitor status, test AI connection
- **🎯 Flutter-Specific Context**: Deep understanding of Flutter patterns and best practices
- **🔄 Pattern Recognition**: Identify recurring issues with intelligent suggestions
- **🌐 Multi-Client Support**: WebSocket streaming for multiple AI system connections
- **🧪 Comprehensive Testing**: 30+ error scenarios with automated testing infrastructure

## 🌐 Real-time Streaming

The MCP server includes a built-in **WebSocket server** that provides real-time streaming of Flutter errors to connected AI systems:

- **Connection URL**: `ws://localhost:8080`
- **Real-time Error Broadcasting**: Errors are immediately streamed to all connected AI clients
- **Automatic Analysis**: Each error includes instant analysis, urgency assessment, and suggested actions
- **Multi-Client Support**: Multiple AI systems can connect simultaneously
- **Production Ready**: Scalable streaming infrastructure with connection management

### Quick Start Real-time Testing

```bash
# Start the MCP server with streaming
npm start

# Test real-time streaming
node examples/websocket_test_client.js

# Run comprehensive real-time tests
./test_realtime.sh
```

## 🛠️ Quick Start Guide

### **Option 1: Install Pre-Built Extension**
```bash
# Install the packaged extension directly
code --install-extension flutter-ai-debug-assistant-1.0.0.vsix
```

### **Option 2: Full Development Setup**

#### Prerequisites
- Node.js 18 or higher
- Visual Studio Code 1.74.0+
- Flutter SDK (for test app)
- npm or yarn

#### Installation Steps

1. **Clone repository and install dependencies:**
   ```bash
   git clone <repository-url>
   cd agent_workspace
   npm install
   ```

2. **Build and package the VS Code extension:**
   ```bash
   cd flutter_debug_extension
   npm install
   npm run compile
   npm run package
   ```

3. **Install the extension:**
   ```bash
   code --install-extension flutter-ai-debug-assistant-1.0.0.vsix
   ```

4. **Start the MCP server:**
   ```bash
   cd ..
   npm run build
   npm start
   ```

5. **Test with Flutter app:**
   ```bash
   cd test_flutter_app
   flutter pub get
   flutter run
   ```

## 🎮 Using the Extension

### Extension Panel
- **Start/Stop MCP Server**: Control server lifecycle
- **Test AI Connection**: Verify GitHub Copilot Chat integration
- **Monitor Status**: Real-time server and connection status

### Real-time Error Detection
- Automatic error detection in Flutter projects
- CodeLens buttons appear inline with errors
- One-click debugging assistance via AI chat

### AI Integration
- Use GitHub Copilot Chat with `/flutter-debug` command
- Contextual debugging assistance with Flutter-specific knowledge
- Real-time error streaming and analysis

## 📋 MCP Server Tools

The MCP server provides 7 specialized tools for Flutter debugging:

### 1. `capture_flutter_error`
Captures and stores Flutter runtime errors with comprehensive context.

### 2. `analyze_flutter_error`
Provides detailed analysis of captured Flutter errors with root cause identification.

### 3. `get_error_summary`
Returns session-wide error statistics and patterns.

### 4. `flutter_debug_assistant`
General-purpose Flutter debugging assistance with contextual help.

### 5. `streaming_control`
Control real-time error streaming to AI systems via WebSocket.

### 6. `get_flutter_logs`
Retrieve and analyze Flutter application logs.

### 7. `suggest_flutter_fixes`
Generate targeted fix suggestions for Flutter-specific issues.

**Full API documentation available in [MCP_TOOLS.md](MCP_TOOLS.md)**

## 🌐 Real-time Error Streaming

### WebSocket Connection
Connect AI systems to: `ws://localhost:8080`

### Real-time Features
- **Instant Error Broadcasting**: Errors streamed immediately upon capture
- **Auto-Analysis**: Each error includes automatic analysis and urgency assessment
- **Suggested Actions**: Immediate debugging steps provided with each error
- **Multi-Client Support**: Multiple AI systems can connect simultaneously
- **Connection Management**: Automatic client connection/disconnection handling

### Streaming Message Format
```json
{
  "type": "flutter_error",
  "timestamp": "2025-05-27T10:30:00.000Z",
  "event": {
    "id": "error_1716804600000_abc123",
    "error": {
      "errorType": "widget_build",
      "severity": "high",
      "message": "RenderFlex overflowed by 42 pixels"
    },
    "autoAnalysis": "Widget rendering issue detected...",
    "urgency": "urgent",
    "suggested_actions": ["Check constraints", "Verify properties"]
  }
}
```

### Testing Real-time Streaming
```bash
# Start test WebSocket client
node examples/websocket_test_client.js

# Run comprehensive real-time tests  
./test_realtime.sh
```

## 🔧 Error Categories

The MCP server categorizes Flutter errors into specific types:

- **widget_build**: Widget building and rendering errors
- **state_management**: State management issues (Bloc/Cubit/Provider)
- **navigation**: Route and navigation problems
- **http_api**: Network and API-related errors
- **platform_channel**: Platform channel communication issues
- **memory_performance**: Memory leaks and performance problems
- **framework**: Flutter framework-level errors
- **general**: Other uncategorized errors

## 🚦 Severity Levels

- **low**: Minor issues that don't affect core functionality
- **medium**: Issues that impact user experience but app remains functional
- **high**: Significant problems that affect core features
- **critical**: App crashes or complete feature failures

## 🔌 Integration with Flutter Apps

### Basic Error Capture

```dart
import 'package:flutter/foundation.dart';

// Capture errors using FlutterError.onError
FlutterError.onError = (FlutterErrorDetails details) {
  // Send to MCP server (automatically streamed to AI systems)
  captureError(
    errorMessage: details.toString(),
    stackTrace: details.stack.toString(),
    errorType: 'widget_build',
    // ... other parameters
  );
};

// Capture async errors
PlatformDispatcher.instance.onError = (error, stack) {
  captureError(
    errorMessage: error.toString(),
    stackTrace: stack.toString(),
    errorType: 'general',
    // ... other parameters
  );
  return true;
};
```

### With HTTP Error Monitoring

```dart
// Dio interceptor example
class ErrorTransportInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    captureError(
      errorMessage: err.message ?? 'HTTP Error',
      stackTrace: err.stackTrace.toString(),
      errorType: 'http_api',
      context: {
        'endpoint': err.requestOptions.path,
        'method': err.requestOptions.method,
        'statusCode': err.response?.statusCode,
      },
    );
    super.onError(err, handler);
  }
}
```

## 🔨 Development

### Building

```bash
npm run build
```

### Development Mode

## 📚 **Documentation**

**Core Documentation:**
- **[docs/PROJECT_STATUS_REPORT_2025-06-06.md](docs/PROJECT_STATUS_REPORT_2025-06-06.md)** - Complete project status and feature analysis
- **[docs/INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md)** - Step-by-step installation instructions
- **[docs/USER_GUIDE.md](docs/USER_GUIDE.md)** - Complete user guide with examples  
- **[docs/MCP_TOOLS.md](docs/MCP_TOOLS.md)** - Detailed MCP server API reference

**Integration Guides:**
- **[docs/REALTIME_GUIDE.md](docs/REALTIME_GUIDE.md)** - WebSocket streaming setup and usage
- **[docs/INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md)** - Flutter app integration patterns
- **[docs/AI_INTEGRATION.md](docs/AI_INTEGRATION.md)** - GitHub Copilot Chat setup and usage

**Development Documentation:**
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development environment setup
- **[docs/TESTING.md](docs/TESTING.md)** - Testing procedures and guidelines
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🎯 **Quick Commands**

### **Extension Development**
```bash
# Build and package extension
cd flutter_debug_extension && npm run package

# Install extension
code --install-extension flutter-ai-debug-assistant-1.0.0.vsix

# Quick install script
./scripts/install_extension.sh
```

### **MCP Server**
```bash
# Start server
npm start

# Development mode
npm run dev

# Build server
npm run build
```

### **Flutter Test App**
```bash
# Run test app
cd test_flutter_app && flutter run

# Generate specific error
flutter run --dart-define=ERROR_TYPE=widget_build

# Quick setup script
./scripts/quick_setup.sh
```

## 🚀 **Production Deployment**

### **VS Code Marketplace** (Ready)
- Extension is compiled and packaged
- Manifest includes all required metadata  
- Icon and screenshots prepared
- Ready for marketplace submission

### **MCP Server Deployment**
```bash
# Build for production
npm run build

# Start with PM2 (recommended)
pm2 start npm --name "flutter-mcp-server" -- start

# Docker deployment
docker build -t flutter-mcp-server .
docker run -p 8080:8080 flutter-mcp-server
```

## 🧪 Testing Infrastructure

### **Flutter Test App** (`test_flutter_app/`)
Comprehensive testing environment with 30+ predefined error scenarios:

**Error Categories:**
- Widget Build Errors (7 scenarios)
- State Management Issues (4 scenarios)  
- Navigation Problems (3 scenarios)
- HTTP/API Errors (4 scenarios)
- Platform Channel Issues (3 scenarios)
- Memory/Performance Problems (3 scenarios)
- Framework Errors (3 scenarios)
- Animation Issues (2 scenarios)
- Custom Error Scenarios (2 scenarios)

**Running Tests:**
```bash
cd test_flutter_app
flutter pub get
flutter run
```

### **WebSocket Streaming Tests**
```bash
# Test real-time streaming
node examples/websocket_test_client.js

# Run comprehensive tests
./scripts/test_realtime.sh

# Complete working demo
./scripts/COMPLETE_WORKING_DEMO.sh
```

### **Extension Integration Tests**
- VS Code extension includes automated tests
- CodeLens integration testing
- Debug session integration verification
- Terminal command monitoring tests

## 📁 **Project Structure**

```
flutter-debug-assistant/
├── flutter_debug_extension/          # VS Code Extension
│   ├── src/                         # TypeScript source (2,229 lines)
│   ├── dist/extension.js            # Compiled extension (72.6 KB)
│   ├── flutter-ai-debug-assistant-1.0.0.vsix  # Packaged extension
│   └── package.json                 # Extension manifest
├── src/                             # MCP Server
│   ├── index.js                     # Main server implementation
│   └── tools/                       # Individual MCP tools
├── test_flutter_app/                # Flutter Test Application
│   ├── lib/                         # 30+ error scenarios
│   ├── test/                        # Unit tests
│   └── pubspec.yaml                 # Flutter dependencies
├── examples/                        # Integration examples
├── docs/                           # Comprehensive documentation
├── .tasks/                         # Project tracking
├── PROJECT_STATUS_REPORT_2025-06-06.md  # Latest status report
└── README.md                       # This file
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure you have Node.js 18+ and all dependencies installed
2. **Permission Denied**: Make sure the built executable has proper permissions
3. **WebSocket Connection Failed**: Verify MCP server is running and port 8080 is available
4. **No Real-time Events**: Check streaming server status with `streaming_control` tool

### Debugging

Enable verbose logging by setting the environment variable:
```bash
export DEBUG=flutter-error-transport:*
npm start
```

### Real-time Streaming Debug
```bash
# Check server status
{"name": "streaming_control", "arguments": {"action": "status"}}

# Test connection
node examples/websocket_test_client.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Related Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io/llms-full.txt)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/create-python-server)
- [Flutter Error Handling Guide](https://docs.flutter.dev/testing/errors)
- [Flutter State Management](https://docs.flutter.dev/development/data-and-backend/state-mgmt)

## 📞 Support

For questions, issues, or contributions, please open an issue in the repository or refer to the MCP community resources.
