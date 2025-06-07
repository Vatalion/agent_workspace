#!/bin/bash

# MCP Server Integration Script for Flutter Projects
# This script helps integrate the Flutter Error Transport MCP Server with your Flutter project

echo "🚀 Flutter Error Transport MCP Server Integration"
echo "================================================="

# Check if we're in a Flutter project
if [ ! -f "pubspec.yaml" ]; then
    echo "❌ Error: This doesn't appear to be a Flutter project (no pubspec.yaml found)"
    echo "Please run this script from your Flutter project root directory"
    exit 1
fi

echo "✅ Flutter project detected"

# Get the MCP server path
MCP_SERVER_PATH="/Users/vitalijsimko/workspace/projects/flutter/agent_workspace"

if [ ! -d "$MCP_SERVER_PATH" ]; then
    echo "❌ Error: MCP server not found at $MCP_SERVER_PATH"
    echo "Please update the MCP_SERVER_PATH in this script"
    exit 1
fi

echo "✅ MCP server found at $MCP_SERVER_PATH"

# Check if MCP server is built
if [ ! -f "$MCP_SERVER_PATH/dist/index.js" ]; then
    echo "📦 Building MCP server..."
    cd "$MCP_SERVER_PATH"
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to build MCP server"
        exit 1
    fi
    cd - > /dev/null
fi

echo "✅ MCP server is built and ready"

# Create integration files directory
mkdir -p lib/services/error_transport

# Copy Flutter integration file
echo "📋 Setting up Flutter integration..."
cp "$MCP_SERVER_PATH/examples/flutter_integration.dart" "lib/services/error_transport/"

# Create MCP client configuration
echo "⚙️ Creating MCP client configuration..."
mkdir -p .vscode
cat > .vscode/mcp.json << 'EOF'
{
  "mcpServers": {
    "flutter-error-transport": {
      "command": "node",
      "args": ["/Users/vitalijsimko/workspace/projects/flutter/agent_workspace/dist/index.js"]
    }
  }
}
EOF

# Add error transport service
echo "🔧 Creating error transport service..."
cat > lib/services/error_transport/error_transport_service.dart << 'EOF'
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;

/// Service for transporting Flutter errors to MCP server
class ErrorTransportService {
  static const String _mcpServerUrl = 'http://localhost:3000'; // Adjust as needed
  static bool _isInitialized = false;
  
  /// Initialize the error transport service
  static void initialize() {
    if (_isInitialized) return;
    
    // Capture Flutter framework errors
    FlutterError.onError = (FlutterErrorDetails details) {
      _captureFlutterError(details);
    };

    // Capture async errors
    PlatformDispatcher.instance.onError = (error, stack) {
      _captureAsyncError(error, stack);
      return true;
    };
    
    _isInitialized = true;
    if (kDebugMode) {
      print('🚀 Error Transport Service initialized');
    }
  }
  
  /// Capture Flutter framework errors
  static void _captureFlutterError(FlutterErrorDetails details) {
    final errorData = {
      'errorMessage': details.toString(),
      'stackTrace': details.stack.toString(),
      'errorType': _categorizeFlutterError(details),
      'severity': _determineSeverity(details),
      'context': {
        'library': details.library ?? 'unknown',
        'context_description': details.context?.toString(),
        'widget_path': 'widget_hierarchy_placeholder',
        'current_route': 'current_route_placeholder',
      },
      'deviceInfo': {
        'platform': Platform.operatingSystem,
        'version': Platform.operatingSystemVersion,
        'is_debug': kDebugMode,
      },
      'timestamp': DateTime.now().toIso8601String(),
    };
    
    _sendToMCPServer('capture_flutter_error', errorData);
  }
  
  /// Capture async errors
  static void _captureAsyncError(Object error, StackTrace stack) {
    final errorData = {
      'errorMessage': error.toString(),
      'stackTrace': stack.toString(),
      'errorType': 'general',
      'severity': 'high',
      'context': {
        'source': 'async_error',
        'error_type': error.runtimeType.toString(),
      },
      'deviceInfo': {
        'platform': Platform.operatingSystem,
        'version': Platform.operatingSystemVersion,
        'is_debug': kDebugMode,
      },
      'timestamp': DateTime.now().toIso8601String(),
    };
    
    _sendToMCPServer('capture_flutter_error', errorData);
  }
  
  /// Categorize Flutter errors
  static String _categorizeFlutterError(FlutterErrorDetails details) {
    final error = details.toString().toLowerCase();
    
    if (error.contains('renderflex') || 
        error.contains('renderbox') || 
        error.contains('widget')) {
      return 'widget_build';
    }
    
    if (error.contains('navigator') || error.contains('route')) {
      return 'navigation';
    }
    
    return 'framework';
  }
  
  /// Determine error severity
  static String _determineSeverity(FlutterErrorDetails details) {
    final error = details.toString().toLowerCase();
    
    if (error.contains('fatal') || error.contains('crash')) {
      return 'critical';
    }
    
    if (error.contains('exception') || error.contains('null check')) {
      return 'high';
    }
    
    if (error.contains('overflow') || error.contains('constraint')) {
      return 'medium';
    }
    
    return 'low';
  }
  
  /// Send error data to MCP server
  static Future<void> _sendToMCPServer(String tool, Map<String, dynamic> data) async {
    try {
      // For now, just log the error data
      // In a real implementation, you would send this to your MCP server
      if (kDebugMode) {
        print('📨 Sending to MCP Server - Tool: $tool');
        print('📊 Error Data: ${jsonEncode(data)}');
      }
      
      // TODO: Implement actual HTTP/WebSocket communication with MCP server
      // Example HTTP implementation:
      /*
      final response = await http.post(
        Uri.parse('$_mcpServerUrl/api/$tool'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(data),
      );
      
      if (response.statusCode == 200) {
        if (kDebugMode) {
          print('✅ Error sent to MCP server successfully');
        }
      } else {
        if (kDebugMode) {
          print('❌ Failed to send error to MCP server: ${response.statusCode}');
        }
      }
      */
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error sending to MCP server: $e');
      }
    }
  }
  
  /// Manually capture custom errors
  static Future<void> captureError({
    required String errorMessage,
    required String stackTrace,
    String errorType = 'general',
    String severity = 'medium',
    Map<String, dynamic>? context,
  }) async {
    final errorData = {
      'errorMessage': errorMessage,
      'stackTrace': stackTrace,
      'errorType': errorType,
      'severity': severity,
      'context': context ?? {},
      'deviceInfo': {
        'platform': Platform.operatingSystem,
        'version': Platform.operatingSystemVersion,
        'is_debug': kDebugMode,
      },
      'timestamp': DateTime.now().toIso8601String(),
    };
    
    await _sendToMCPServer('capture_flutter_error', errorData);
  }
}
EOF

# Update pubspec.yaml to include http dependency
echo "📦 Adding HTTP dependency to pubspec.yaml..."
if ! grep -q "http:" pubspec.yaml; then
    # Add http dependency if not already present
    sed -i '' '/dependencies:/a\
  http: ^1.1.0' pubspec.yaml
    echo "✅ Added http dependency"
else
    echo "✅ HTTP dependency already present"
fi

# Create main.dart integration example
echo "📝 Creating main.dart integration example..."
cat > lib/main_with_error_transport.dart << 'EOF'
import 'package:flutter/material.dart';
import 'services/error_transport/error_transport_service.dart';

void main() {
  // Initialize error transport service BEFORE runApp
  ErrorTransportService.initialize();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter with Error Transport',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Flutter Error Transport Demo'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  void _triggerError() {
    // Example of manually capturing an error
    try {
      throw Exception('This is a test error for MCP server');
    } catch (e, stackTrace) {
      ErrorTransportService.captureError(
        errorMessage: e.toString(),
        stackTrace: stackTrace.toString(),
        errorType: 'general',
        severity: 'medium',
        context: {
          'user_action': 'button_press',
          'current_counter': _counter,
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text(
              'You have pushed the button this many times:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _triggerError,
              child: const Text('Trigger Test Error'),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}
EOF

echo ""
echo "🎉 Integration Complete!"
echo "======================="
echo ""
echo "✅ Flutter Error Transport MCP Server integration has been set up!"
echo ""
echo "📁 Files created:"
echo "   • lib/services/error_transport/flutter_integration.dart"
echo "   • lib/services/error_transport/error_transport_service.dart"
echo "   • lib/main_with_error_transport.dart"
echo "   • .vscode/mcp.json"
echo ""
echo "📦 Dependencies added:"
echo "   • http: ^1.1.0"
echo ""
echo "🚀 Next steps:"
echo "   1. Run 'flutter pub get' to install dependencies"
echo "   2. Start the MCP server: cd '$MCP_SERVER_PATH' && npm start"
echo "   3. Test with: flutter run lib/main_with_error_transport.dart"
echo "   4. Check VS Code MCP integration in Command Palette"
echo ""
echo "🔧 To integrate with your existing main.dart:"
echo "   Add this line at the beginning of your main() function:"
echo "   ErrorTransportService.initialize();"
echo ""
echo "📖 For more details, check the documentation in the created files."
