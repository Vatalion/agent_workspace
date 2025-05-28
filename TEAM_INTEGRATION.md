# 🤖 Flutter Error Transport - Team Integration Guide

Welcome to AI-powered Flutter debugging! This repository provides real-time error streaming and analysis for your Flutter projects, making it easy for your entire team to get instant debugging assistance.

## 🎯 What This Gives Your Team

- **🤖 AI-Powered Debugging**: Instant error analysis and fix suggestions
- **⚡ Real-time Error Streaming**: Errors are captured and analyzed as they happen
- **👥 Team Collaboration**: Multiple developers can connect simultaneously
- **📱 Production Ready**: Comprehensive error handling with fallbacks
- **🔄 Auto-Detection**: Automatic capture of Flutter framework errors
- **🌐 Multi-Platform**: Works on iOS, Android, Web, Desktop

## 🚀 Super Quick Setup (30 seconds)

### Option 1: One Command Setup
From your Flutter project root:
```bash
curl -s https://raw.githubusercontent.com/Vatalion/agent_workspace/main/quick_setup.sh | bash
```

### Option 2: Local Setup
If you have this repository locally:
```bash
cd /path/to/your/flutter/project
/Users/vitalijsimko/workspace/projects/flutter/agent_workspace/quick_setup.sh
```

## 🛠️ Manual Integration (Full Control)

### Step 1: Copy Integration File
```bash
# From your Flutter project root
mkdir -p lib/services
cp /Users/vitalijsimko/workspace/projects/flutter/agent_workspace/examples/flutter_error_transport_production.dart lib/services/flutter_error_transport.dart
```

### Step 2: Add Dependencies
Add to your `pubspec.yaml`:
```yaml
dependencies:
  web_socket_channel: ^2.4.0
  http: ^1.1.0
```

### Step 3: Initialize in main.dart
```dart
import 'services/flutter_error_transport.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize AI-powered error transport
  await FlutterErrorTransport.initialize();
  
  runApp(MyApp());
}
```

### Step 4: Optional Route Tracking
```dart
MaterialApp(
  navigatorObservers: [
    FlutterErrorTransportNavigatorObserver(),
  ],
  // ... your app
)
```

## 🏃‍♂️ Getting Started

### 1. Install Dependencies
```bash
flutter pub get
```

### 2. Start MCP Server
```bash
./start-mcp.sh  # Created by setup script
# OR manually:
cd /Users/vitalijsimko/workspace/projects/flutter/agent_workspace
npm start
```

### 3. Run Your Flutter App
```bash
flutter run
```

### 4. Test AI Error Analysis
Add this test button to verify everything works:
```dart
ElevatedButton(
  onPressed: () {
    FlutterErrorTransport.captureError(
      errorMessage: "Test error - AI is analyzing this!",
      stackTrace: StackTrace.current.toString(),
      errorType: 'test',
      severity: 'medium',
    );
  },
  child: Text('Test AI Debugging'),
)
```

## 📡 How It Works

1. **Error Detection**: Flutter errors are automatically captured
2. **Real-time Streaming**: Errors are sent via WebSocket to the MCP server
3. **AI Analysis**: Connected AI systems immediately analyze errors
4. **Instant Feedback**: Get debugging suggestions in real-time
5. **Team Collaboration**: Multiple developers can connect to the same server

## 🎛️ Advanced Usage

### Manual Error Capture
```dart
// Custom application errors
FlutterErrorTransport.captureError(
  errorMessage: "User authentication failed",
  stackTrace: StackTrace.current.toString(),
  errorType: 'authentication',
  severity: 'high',
  context: {'userId': '123', 'action': 'login'},
);

// HTTP/API errors (great with Dio interceptor)
FlutterErrorTransport.captureHttpError(
  'POST', '/api/users', 500,
  'Server error during user creation',
  stackTrace.toString(),
  headers: {'Authorization': 'Bearer token'},
);

// State management errors
FlutterErrorTransport.captureStateError(
  'UserBloc', 'Invalid state transition',
  stackTrace.toString(),
  currentState: 'loading',
  action: 'LoginRequested',
  stateManager: 'bloc',
);

// Navigation errors
FlutterErrorTransport.captureNavigationError(
  '/profile', 'Route not found',
  stackTrace.toString(),
  routeArguments: {'userId': '123'},
  previousRoute: '/home',
);

// Widget build errors
FlutterErrorTransport.captureWidgetError(
  'UserProfileWidget', 'RenderFlex overflow',
  stackTrace.toString(),
  widgetPath: 'MaterialApp > Scaffold > Column',
  widgetProperties: {'flex': 1, 'crossAxisAlignment': 'center'},
);
```

### Dio HTTP Interceptor Example
```dart
class FlutterErrorTransportInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    FlutterErrorTransport.captureHttpError(
      err.requestOptions.method,
      err.requestOptions.path,
      err.response?.statusCode,
      err.message ?? 'HTTP Error',
      err.stackTrace.toString(),
      headers: err.requestOptions.headers,
      requestBody: err.requestOptions.data?.toString(),
      responseBody: err.response?.data?.toString(),
    );
    
    super.onError(err, handler);
  }
}

// Add to your Dio instance
final dio = Dio();
dio.interceptors.add(FlutterErrorTransportInterceptor());
```

### User Action Tracking
```dart
// Track user actions for better error context
void onButtonPressed() {
  FlutterErrorTransport.updateLastUserAction('login_button_pressed');
  // ... your button logic
}
```

## 🌐 Server Configuration

The MCP server runs on:
- **HTTP API**: http://localhost:3000
- **WebSocket**: ws://localhost:8080
- **Health Check**: http://localhost:3000/health

### Connection Status
```dart
// Check if connected to MCP server
bool isConnected = FlutterErrorTransport.isConnected;

// Get queued errors count (for offline scenarios)
int queuedCount = FlutterErrorTransport.queuedErrorsCount;
```

## 👥 Team Workflow

### For Each Team Member:

1. **Clone/Pull** the latest project code
2. **Run Setup**: Use quick_setup.sh or manual integration
3. **Start MCP Server**: `./start-mcp.sh`
4. **Develop Normally**: Errors are automatically captured
5. **Get AI Help**: Connected AI assistants provide instant debugging

### For Team Leads:

1. **Share Repository**: Ensure everyone has access to the MCP server repo
2. **Document Custom Errors**: Add project-specific error capture patterns
3. **Monitor Usage**: Check server logs for team error patterns
4. **Share Solutions**: AI-generated solutions benefit the whole team

## 🔧 VS Code Integration

The setup automatically creates `.vscode/mcp.json` for VS Code MCP integration:
```json
{
  "mcpServers": {
    "flutter-error-transport": {
      "command": "node",
      "args": ["/path/to/mcp/server/dist/index.js"]
    }
  }
}
```

This enables:
- **MCP Tools**: Access via Command Palette
- **Error Analysis**: Direct AI debugging assistance
- **Real-time Streaming**: Instant error notifications

## 🐛 Troubleshooting

### Server Won't Start
```bash
cd /Users/vitalijsimko/workspace/projects/flutter/agent_workspace
npm install  # Reinstall dependencies
npm run build  # Rebuild TypeScript
npm start
```

### Flutter Integration Issues
```bash
flutter clean
flutter pub get
# Check that imports are correct in your Dart files
```

### Connection Problems
- Verify ports 3000 and 8080 are available
- Check firewall settings
- Restart the MCP server
- Use HTTP fallback mode if WebSocket fails

### Missing Dependencies
```bash
# Add to pubspec.yaml if missing
flutter pub add web_socket_channel http
flutter pub get
```

## 📊 Error Categories

The system automatically categorizes errors:

- **widget_build**: UI rendering issues
- **navigation**: Route and navigation problems  
- **state_management**: Bloc/Provider/Riverpod errors
- **http_api**: Network and API failures
- **platform_channel**: Native platform integration
- **async_error**: Asynchronous operation failures
- **framework**: General Flutter framework errors

## 🎯 Benefits for Your Team

### Developers Get:
- ✅ **Instant Error Analysis**: No more manual debugging
- ✅ **Context-Aware Solutions**: AI understands your app structure
- ✅ **Pattern Recognition**: Learn from recurring issues
- ✅ **Real-time Feedback**: Immediate debugging assistance

### Team Gets:
- ✅ **Shared Knowledge**: Solutions benefit everyone
- ✅ **Faster Development**: Reduce debugging time
- ✅ **Better Code Quality**: Proactive error prevention
- ✅ **Collaborative Debugging**: Multiple developers can assist

### Project Gets:
- ✅ **Production Monitoring**: Real error tracking
- ✅ **Quality Insights**: Understanding error patterns
- ✅ **Automated Documentation**: AI-generated solutions
- ✅ **Continuous Improvement**: Data-driven development

## 🚀 Next Steps

1. **Set up your first project** using the quick setup
2. **Test with sample errors** to verify everything works
3. **Add custom error capture** for your specific use cases
4. **Share with your team** and enjoy collaborative AI debugging!

---

**Need Help?** Check the full documentation at `/Users/vitalijsimko/workspace/projects/flutter/agent_workspace/README.md` or create an issue in the repository.

**Happy Debugging!** 🤖✨
