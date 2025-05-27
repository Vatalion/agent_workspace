# Flutter Error Transport MCP Server

A comprehensive Model Context Protocol (MCP) server designed to transport Flutter runtime errors to AI systems with real-time error streaming, analysis, and debugging assistance capabilities.

## 🚀 Features

- **Real-time Error Capture**: Capture and categorize Flutter runtime errors with full context
- **AI-Powered Analysis**: Intelligent error analysis with root cause identification and fix suggestions
- **Error Pattern Recognition**: Identify recurring error patterns and provide proactive debugging insights
- **Flutter-Specific Context**: Deep understanding of Flutter widget lifecycle, state management, and navigation
- **Integration Ready**: Easy integration with existing Flutter error monitoring systems

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

## 📋 Available MCP Tools

### 1. `capture_flutter_error`
Captures and stores Flutter runtime errors with comprehensive context.

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
- `query` (string): Your Flutter debugging question
- `context` (object, optional): Additional context

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
  // Send to MCP server
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
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript output
├── .vscode/
│   ├── tasks.json        # VS Code tasks for build/run
│   └── mcp.json          # MCP client configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure you have Node.js 18+ and all dependencies installed
2. **Permission Denied**: Make sure the built executable has proper permissions
3. **Type Errors**: Verify @types/node is installed correctly

### Debugging

Enable verbose logging by setting the environment variable:
```bash
export DEBUG=flutter-error-transport:*
npm start
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
