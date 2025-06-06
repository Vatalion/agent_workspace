# MCP Server Integration Guide

## Quick Integration for Your Flutter Project

### Option 1: Automated Setup (Recommended)

1. **Navigate to your Flutter project** in terminal
2. **Run the integration script**:
   ```bash
   /Users/vitalijsimko/workspace/projects/flutter/agent_workspace/integration_script.sh
   ```
3. **Install dependencies**:
   ```bash
   flutter pub get
   ```
4. **Start the MCP server** (in a separate terminal):
   ```bash
   cd /Users/vitalijsimko/workspace/projects/flutter/agent_workspace
   npm start
   ```

### Option 2: Manual Integration

#### Step 1: Add Error Transport Service
Copy the file `examples/flutter_integration.dart` to your Flutter project:
```bash
cp /Users/vitalijsimko/workspace/projects/flutter/agent_workspace/examples/flutter_integration.dart your_flutter_project/lib/services/
```

#### Step 2: Initialize in main.dart
Add this to the beginning of your `main()` function:
```dart
import 'services/flutter_integration.dart';

void main() {
  // Initialize error transport BEFORE runApp
  FlutterErrorTransport.initialize();
  
  runApp(MyApp());
}
```

#### Step 3: Add HTTP dependency
Add to your `pubspec.yaml`:
```yaml
dependencies:
  http: ^1.1.0
```

#### Step 4: Configure VS Code MCP
Create `.vscode/mcp.json` in your Flutter project:
```json
{
  "mcpServers": {
    "flutter-error-transport": {
      "command": "node",
      "args": ["/Users/vitalijsimko/workspace/projects/flutter/agent_workspace/dist/index.js"]
    }
  }
}
```

## Testing the Integration

### 1. Start MCP Server
```bash
cd /Users/vitalijsimko/workspace/projects/flutter/agent_workspace
npm start
```

### 2. Run Flutter App
```bash
cd your_flutter_project
flutter run
```

### 3. Trigger Test Errors
Use the provided test buttons or manually trigger errors to see them captured and sent to the MCP server.

### 4. Check MCP Integration in VS Code
- Open Command Palette (Cmd+Shift+P)
- Search for "MCP" commands
- You should see Flutter error transport tools available

## Available MCP Tools After Integration

Once connected, you'll have access to these AI-powered tools through your MCP client:

### `capture_flutter_error`
Manually capture and analyze specific errors:
```dart
FlutterErrorTransport.captureError(
  errorMessage: "Widget build failed",
  stackTrace: stackTrace.toString(),
  errorType: 'widget_build',
  severity: 'high',
);
```

### `analyze_flutter_error` 
Get AI-powered analysis of captured errors:
- Root cause identification
- Step-by-step debugging guide
- Code fix suggestions
- Related documentation links

### `get_error_summary`
View session-wide error statistics:
- Error count by category
- Most frequent issues
- Severity distribution
- Pattern analysis

### `flutter_debug_assistant`
Ask questions about Flutter development:
- Widget lifecycle issues
- State management problems
- Performance optimization
- Best practices

## Real-time Error Monitoring

Once integrated, every error in your Flutter app will be:
1. ✅ **Automatically captured** with full context
2. 🧠 **Analyzed by AI** for root cause and solutions
3. 📊 **Tracked for patterns** across your development session
4. 🚀 **Available for instant debugging** through MCP tools

## Troubleshooting

### MCP Server Not Starting
```bash
cd /Users/vitalijsimko/workspace/projects/flutter/agent_workspace
npm run build
npm start
```

### Flutter Integration Issues
- Make sure `http` dependency is installed: `flutter pub get`
- Check that `FlutterErrorTransport.initialize()` is called before `runApp()`
- Verify VS Code has MCP extension installed

### No Errors Being Captured
- Check console output for "Error Transport Service initialized" message
- Trigger test errors using the provided example buttons
- Verify MCP server is running and accessible

## Next Steps

1. **Customize Error Categories**: Modify error categorization logic for your specific app
2. **Add Custom Context**: Include app-specific context (user ID, app state, etc.)
3. **Set Up Real-time Streaming**: Implement WebSocket connection for instant error analysis
4. **Integrate with Team Tools**: Connect to your existing error monitoring and alerting systems

Your Flutter app is now connected to AI-powered error analysis and debugging assistance! 🎉
