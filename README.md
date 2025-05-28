# Flutter Error Transport MCP Server

A comprehensive Model Context Protocol (MCP) server designed to transport Flutter runtime errors to AI systems with **real-time error streaming**, analysis, and debugging assistance capabilities.

## 🚀 Features

- **🔥 Real-time Error Streaming**: WebSocket-based streaming to AI systems for immediate error analysis
- **📡 AI-Powered Analysis**: Intelligent error analysis with root cause identification and fix suggestions  
- **⚡ Instant Error Detection**: Automatic error capture with immediate urgency assessment
- **🎯 Flutter-Specific Context**: Deep understanding of Flutter widget lifecycle, state management, and navigation
- **🔄 Pattern Recognition**: Identify recurring error patterns and provide proactive debugging insights
- **🌐 Multi-Client Support**: Connect multiple AI systems simultaneously for collaborative debugging
- **🧪 Production Ready**: Comprehensive error categorization and streaming infrastructure

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

## 🛠️ Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn  
- TypeScript (installed automatically as dev dependency)

### Setup

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run the MCP server:
   ```bash
   npm start
   ```

The server will start with **real-time streaming enabled** on port 8080.

## 📋 Available MCP Tools

### 1. `capture_flutter_error`
Captures and stores Flutter runtime errors with comprehensive context. **Automatically streams to connected AI systems in real-time.**

**Parameters:**
- `errorMessage` (string): The error message
- `stackTrace` (string): Full stack trace
- `errorType` (string): Category of error (widget_build, state_management, etc.)
- `severity` (string): Error severity level (low, medium, high, critical)
- `context` (object): Additional context (widget path, route, user action, etc.)
- `deviceInfo` (object): Device and app information
- `timestamp` (string): When the error occurred

### 2. `analyze_flutter_error`
Provides detailed analysis of captured Flutter errors.

**Parameters:**
- `errorId` (string): ID of the error to analyze

**Returns:**
- Root cause analysis
- Debugging steps
- Code fix suggestions
- Related Flutter documentation links

### 3. `get_error_summary`
Returns session-wide error statistics and patterns.

**Returns:**
- Error count by category
- Most frequent errors
- Severity distribution
- Pattern analysis

### 4. `flutter_debug_assistant`
General-purpose Flutter debugging assistance.

**Parameters:**
- `issue` (string): Your Flutter debugging question or issue description
- `errorType` (string, optional): Type of Flutter issue  
- `codeSnippet` (string, optional): Relevant code snippet

### 5. `streaming_control` 🔥 **NEW**
Control real-time error streaming to AI systems via WebSocket.

**Parameters:**
- `action` (string): Action to perform - `status`, `start`, `stop`, `restart`, `list_clients`
- `port` (number, optional): WebSocket server port (default: 8080)
- `filters` (object, optional): Error filters for streaming

**Examples:**
```json
// Check streaming status
{"action": "status"}

// Start real-time streaming
{"action": "start", "port": 8080}

// List connected AI clients
{"action": "list_clients"}
```

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

## 📚 Documentation

- **[REALTIME_GUIDE.md](REALTIME_GUIDE.md)** - Complete real-time streaming guide with WebSocket examples
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Flutter app integration instructions  
- **[examples/flutter_integration.dart](examples/flutter_integration.dart)** - Flutter client integration example
- **[examples/websocket_test_client.js](examples/websocket_test_client.js)** - WebSocket test client

## 🧪 Testing

### Build and Run
```bash
npm run build
npm start
```

### Real-time Streaming Tests
```bash
# Test WebSocket connectivity
node examples/websocket_test_client.js

# Run comprehensive real-time tests
./test_realtime.sh
```

### Development Mode
```bash
npm run dev
```

### Watch Mode
```bash
npm run build:watch
```

### Clean Build
```bash
npm run clean
npm run build
```

## 📁 Project Structure

```
├── src/
│   └── index.ts              # Main MCP server with real-time streaming
├── examples/
│   ├── flutter_integration.dart      # Flutter integration example
│   └── websocket_test_client.js      # WebSocket test client
├── dist/                     # Compiled JavaScript output
├── .vscode/
│   ├── tasks.json           # VS Code tasks for build/run
│   └── mcp.json             # MCP client configuration
├── REALTIME_GUIDE.md        # Real-time streaming documentation
├── INTEGRATION_GUIDE.md     # Flutter integration guide
├── test_realtime.sh         # Real-time testing script
├── package.json
├── tsconfig.json
└── README.md
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
