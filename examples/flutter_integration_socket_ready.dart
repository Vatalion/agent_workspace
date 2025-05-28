// Flutter Error Transport - Socket Ready Integration
// 
// This is a complete Flutter integration example that connects directly
// to the MCP server's WebSocket endpoint for real-time error streaming.
//
// Dependencies to add to your Flutter project's pubspec.yaml:
// dependencies:
//   web_socket_channel: ^2.4.0
//   http: ^1.1.0
//
// Usage:
// 1. Add this file to your Flutter project
// 2. Call FlutterErrorTransport.initialize() in your main() function
// 3. Errors will be automatically captured and streamed in real-time

import 'dart:async';
import 'dart:convert';

// Note: In a real Flutter project, uncomment these imports:
// import 'package:flutter/foundation.dart';
// import 'package:flutter/services.dart';
// import 'package:web_socket_channel/web_socket_channel.dart';
// import 'package:web_socket_channel/io.dart';
// import 'package:http/http.dart' as http;

// Mock implementations for demonstration (remove in real Flutter project)
const bool kDebugMode = true;
class Platform {
  static String get operatingSystem => 'ios';
  static String get operatingSystemVersion => '17.0';
  static String get version => '3.0.0';
}

class FlutterErrorDetails {
  final String message;
  final String? library;
  final StackTrace? stack;
  FlutterErrorDetails(this.message, {this.library, this.stack});
  @override
  String toString() => message;
}

// Mock WebSocket implementation for demonstration
class MockWebSocketChannel {
  final String url;
  bool isConnected = false;
  final StreamController<String> _controller = StreamController<String>();
  
  MockWebSocketChannel.connect(this.url) {
    isConnected = true;
    if (kDebugMode) {
      print('🔌 [WebSocket] Connected to $url');
    }
  }
  
  Stream<String> get stream => _controller.stream;
  
  void add(String data) {
    if (isConnected && kDebugMode) {
      print('📡 [WebSocket] Sending: ${data.substring(0, 100)}...');
    }
  }
  
  void close() {
    isConnected = false;
    _controller.close();
    if (kDebugMode) {
      print('🔌 [WebSocket] Connection closed');
    }
  }
}

/// Flutter Error Transport - Socket Ready
/// 
/// Provides real-time error streaming to the MCP server via WebSocket
class FlutterErrorTransport {
  static const String _wsServerUrl = 'ws://localhost:8080';
  // Note: HTTP fallback available at 'http://localhost:3000/api/errors'
  
  static MockWebSocketChannel? _wsChannel;
  static bool _isConnected = false;
  static bool _isConnecting = false;
  static final List<Map<String, dynamic>> _errorQueue = [];
  static Timer? _reconnectTimer;
  static int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;
  static const Duration _reconnectDelay = Duration(seconds: 3);

  /// Initialize the error transport system
  /// Call this in your main() function
  static Future<void> initialize({bool autoConnect = true}) async {
    if (kDebugMode) {
      print('🚀 [FlutterErrorTransport] Initializing socket-ready error transport...');
    }
    
    // Set up Flutter error handlers
    _setupErrorHandlers();
    
    // Establish WebSocket connection if auto-connect is enabled
    if (autoConnect) {
      await connectToMCPServer();
    }
    
    if (kDebugMode) {
      print('✅ [FlutterErrorTransport] Socket-ready error transport initialized');
    }
  }

  /// Connect to the MCP server's WebSocket endpoint
  static Future<bool> connectToMCPServer() async {
    if (_isConnected || _isConnecting) {
      return _isConnected;
    }
    
    _isConnecting = true;
    
    try {
      if (kDebugMode) {
        print('🔌 [FlutterErrorTransport] Connecting to WebSocket: $_wsServerUrl');
      }
      
      // In a real Flutter project, use:
      // _wsChannel = IOWebSocketChannel.connect(Uri.parse(_wsServerUrl));
      _wsChannel = MockWebSocketChannel.connect(_wsServerUrl);
      
      // Set up connection handlers
      _setupWebSocketHandlers();
      
      _isConnected = true;
      _isConnecting = false;
      _reconnectAttempts = 0;
      
      // Send queued errors
      await _sendQueuedErrors();
      
      if (kDebugMode) {
        print('✅ [FlutterErrorTransport] Connected to MCP server via WebSocket');
      }
      
      return true;
      
    } catch (e) {
      _isConnecting = false;
      _isConnected = false;
      
      if (kDebugMode) {
        print('❌ [FlutterErrorTransport] WebSocket connection failed: $e');
      }
      
      // Schedule reconnection
      _scheduleReconnect();
      
      return false;
    }
  }

  /// Disconnect from the MCP server
  static void disconnect() {
    _wsChannel?.close();
    _wsChannel = null;
    _isConnected = false;
    _isConnecting = false;
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    
    if (kDebugMode) {
      print('🔌 [FlutterErrorTransport] Disconnected from MCP server');
    }
  }

  /// Get connection status
  static bool get isConnected => _isConnected;
  
  /// Get queued errors count
  static int get queuedErrorsCount => _errorQueue.length;

  /// Manually capture a custom error
  static Future<void> captureError({
    required String errorMessage,
    required String stackTrace,
    required String errorType,
    String severity = 'medium',
    Map<String, dynamic>? context,
    Map<String, dynamic>? deviceInfo,
  }) async {
    await _captureError(
      errorMessage: errorMessage,
      stackTrace: stackTrace,
      errorType: errorType,
      severity: severity,
      context: context ?? {},
      deviceInfo: deviceInfo,
    );
  }

  /// Capture HTTP/API errors (use with Dio interceptor)
  static Future<void> captureHttpError(
    String method,
    String endpoint,
    int? statusCode,
    String errorMessage,
    String stackTrace, {
    Map<String, dynamic>? headers,
    String? requestBody,
    String? responseBody,
  }) async {
    await _captureError(
      errorMessage: errorMessage,
      stackTrace: stackTrace,
      errorType: 'http_api',
      severity: _getHttpErrorSeverity(statusCode),
      context: {
        'endpoint': endpoint,
        'method': method,
        'status_code': statusCode,
        'request_headers': headers,
        'request_body': requestBody?.substring(0, 500), // Limit size
        'response_body': responseBody?.substring(0, 500), // Limit size
        'error_category': 'network',
      },
    );
  }

  /// Capture state management errors
  static Future<void> captureStateError(
    String stateType,
    String errorMessage,
    String stackTrace, {
    String? currentState,
    String? action,
    String? stateManager,
  }) async {
    await _captureError(
      errorMessage: errorMessage,
      stackTrace: stackTrace,
      errorType: 'state_management',
      severity: 'medium',
      context: {
        'state_type': stateType,
        'current_state': currentState,
        'action': action,
        'state_manager': stateManager ?? _detectStateManager(),
      },
    );
  }

  /// Capture navigation errors
  static Future<void> captureNavigationError(
    String routeName,
    String errorMessage,
    String stackTrace, {
    Map<String, dynamic>? routeArguments,
    String? previousRoute,
  }) async {
    await _captureError(
      errorMessage: errorMessage,
      stackTrace: stackTrace,
      errorType: 'navigation',
      severity: 'medium',
      context: {
        'route_name': routeName,
        'route_arguments': routeArguments,
        'previous_route': previousRoute,
        'navigation_stack': 'current_stack', // Implement route stack tracking
      },
    );
  }

  /// Capture widget build errors
  static Future<void> captureWidgetError(
    String widgetName,
    String errorMessage,
    String stackTrace, {
    String? widgetPath,
    Map<String, dynamic>? widgetProperties,
  }) async {
    await _captureError(
      errorMessage: errorMessage,
      stackTrace: stackTrace,
      errorType: 'widget_build',
      severity: _getWidgetErrorSeverity(errorMessage),
      context: {
        'widget_name': widgetName,
        'widget_path': widgetPath,
        'widget_properties': widgetProperties,
      },
    );
  }

  // Private methods

  static void _setupErrorHandlers() {
    // In a real Flutter project, uncomment these:
    /*
    FlutterError.onError = (FlutterErrorDetails details) {
      _captureError(
        errorMessage: details.toString(),
        stackTrace: details.stack.toString(),
        errorType: _categorizeFlutterError(details),
        severity: _determineSeverity(details),
        context: _extractFlutterContext(details),
      );
    };
    */
    
    if (kDebugMode) {
      print('🛡️ [FlutterErrorTransport] Error handlers configured');
    }
  }

  static void _setupWebSocketHandlers() {
    if (_wsChannel == null) return;
    
    // Listen for server messages
    _wsChannel!.stream.listen(
      (data) {
        try {
          final message = jsonDecode(data);
          _handleServerMessage(message);
        } catch (e) {
          if (kDebugMode) {
            print('❌ [FlutterErrorTransport] Failed to parse server message: $e');
          }
        }
      },
      onError: (error) {
        if (kDebugMode) {
          print('❌ [FlutterErrorTransport] WebSocket error: $error');
        }
        _handleConnectionLost();
      },
      onDone: () {
        if (kDebugMode) {
          print('🔌 [FlutterErrorTransport] WebSocket connection closed');
        }
        _handleConnectionLost();
      },
    );
    
    // Send connection handshake
    _sendHandshake();
  }

  static void _sendHandshake() {
    final handshake = {
      'type': 'client_handshake',
      'timestamp': DateTime.now().toIso8601String(),
      'client_info': {
        'type': 'flutter_app',
        'platform': Platform.operatingSystem,
        'version': '1.0.0',
        'capabilities': ['error_capture', 'real_time_streaming']
      }
    };
    
    _sendWebSocketMessage(handshake);
  }

  static void _handleServerMessage(Map<String, dynamic> message) {
    switch (message['type']) {
      case 'connection_established':
        if (kDebugMode) {
          print('🤝 [FlutterErrorTransport] Server handshake received');
        }
        break;
        
      case 'error_acknowledgment':
        if (kDebugMode) {
          print('✅ [FlutterErrorTransport] Error acknowledged by server: ${message['error_id']}');
        }
        break;
        
      case 'streaming_stats':
        if (kDebugMode) {
          print('📊 [FlutterErrorTransport] Server stats: ${message['stats']}');
        }
        break;
        
      default:
        if (kDebugMode) {
          print('📨 [FlutterErrorTransport] Unknown server message: ${message['type']}');
        }
    }
  }

  static void _handleConnectionLost() {
    _isConnected = false;
    _wsChannel = null;
    
    if (kDebugMode) {
      print('🔌 [FlutterErrorTransport] Connection lost, scheduling reconnect...');
    }
    
    _scheduleReconnect();
  }

  static void _scheduleReconnect() {
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      if (kDebugMode) {
        print('❌ [FlutterErrorTransport] Max reconnect attempts reached');
      }
      return;
    }
    
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(_reconnectDelay, () async {
      _reconnectAttempts++;
      if (kDebugMode) {
        print('🔄 [FlutterErrorTransport] Reconnect attempt $_reconnectAttempts/$_maxReconnectAttempts');
      }
      await connectToMCPServer();
    });
  }

  static Future<void> _captureError({
    required String errorMessage,
    required String stackTrace,
    required String errorType,
    required String severity,
    required Map<String, dynamic> context,
    Map<String, dynamic>? deviceInfo,
  }) async {
    try {
      final errorData = {
        'timestamp': DateTime.now().toIso8601String(),
        'errorType': errorType,
        'severity': severity,
        'message': errorMessage,
        'stackTrace': stackTrace,
        'context': {
          ...context,
          'widget_path': _getCurrentWidgetPath(),
          'current_route': _getCurrentRoute(),
          'user_action': _getLastUserAction(),
          'app_lifecycle_state': _getAppLifecycleState(),
        },
        'deviceInfo': deviceInfo ?? await _getDeviceInfo(),
        'reproduction': {
          'frequency': 'unknown',
          'conditions': 'runtime_error',
        },
      };

      // Try to send via WebSocket first
      if (_isConnected && _wsChannel != null) {
        await _sendErrorViaWebSocket(errorData);
      } else {
        // Queue error for later sending
        _errorQueue.add(errorData);
        
        // Try to establish connection
        if (!_isConnecting) {
          connectToMCPServer();
        }
        
        if (kDebugMode) {
          print('📝 [FlutterErrorTransport] Error queued (connection unavailable): $errorType');
        }
      }
      
    } catch (e) {
      if (kDebugMode) {
        print('❌ [FlutterErrorTransport] Failed to capture error: $e');
      }
    }
  }

  static Future<void> _sendErrorViaWebSocket(Map<String, dynamic> errorData) async {
    final message = {
      'type': 'flutter_error_stream',
      'timestamp': DateTime.now().toIso8601String(),
      'error_data': errorData,
    };
    
    _sendWebSocketMessage(message);
    
    if (kDebugMode) {
      print('📡 [FlutterErrorTransport] Error streamed: ${errorData['errorType']}');
    }
  }

  static void _sendWebSocketMessage(Map<String, dynamic> message) {
    if (_wsChannel != null && _isConnected) {
      _wsChannel!.add(jsonEncode(message));
    }
  }

  static Future<void> _sendQueuedErrors() async {
    if (_errorQueue.isEmpty) return;
    
    if (kDebugMode) {
      print('📤 [FlutterErrorTransport] Sending ${_errorQueue.length} queued errors...');
    }
    
    final errors = List<Map<String, dynamic>>.from(_errorQueue);
    _errorQueue.clear();
    
    for (final errorData in errors) {
      await _sendErrorViaWebSocket(errorData);
      // Add small delay to avoid overwhelming the server
      await Future.delayed(const Duration(milliseconds: 100));
    }
    
    if (kDebugMode) {
      print('✅ [FlutterErrorTransport] All queued errors sent');
    }
  }

  // Helper methods

  static String _getHttpErrorSeverity(int? statusCode) {
    if (statusCode == null) return 'high';
    if (statusCode >= 500) return 'critical';
    if (statusCode >= 400) return 'high';
    return 'medium';
  }

  static String _getWidgetErrorSeverity(String errorMessage) {
    final error = errorMessage.toLowerCase();
    if (error.contains('overflow') || error.contains('constraint')) return 'medium';
    if (error.contains('null') || error.contains('assertion')) return 'high';
    if (error.contains('exception')) return 'critical';
    return 'low';
  }

  // Helper methods for Flutter error categorization (used in production Flutter setup)

  // Used by FlutterError.onError handler in real Flutter apps
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
    
    if (error.contains('bloc') || 
        error.contains('cubit') || 
        error.contains('provider') ||
        error.contains('state')) {
      return 'state_management';
    }
    
    if (error.contains('platform') || error.contains('channel')) {
      return 'platform_channel';
    }
    
    return 'framework';
  }

  // Used by FlutterError.onError handler in real Flutter apps
  static String _determineSeverity(FlutterErrorDetails details) {
    final error = details.toString().toLowerCase();
    
    if (error.contains('fatal') || 
        error.contains('crash') ||
        error.contains('assertion failed')) {
      return 'critical';
    }
    
    if (error.contains('exception') || 
        error.contains('null check operator') ||
        error.contains('range error')) {
      return 'high';
    }
    
    if (error.contains('overflow') || 
        error.contains('constraint') ||
        error.contains('layout')) {
      return 'medium';
    }
    
    return 'low';
  }

  // Used by FlutterError.onError handler in real Flutter apps  
  static Map<String, dynamic> _extractFlutterContext(FlutterErrorDetails details) {
    return {
      'library': details.library ?? 'unknown',
      'context_description': 'flutter_error_details',
      'source': 'flutter_framework',
    };
  }

  static String? _getCurrentWidgetPath() {
    return 'widget_path_placeholder';
  }

  static String? _getCurrentRoute() {
    return 'current_route_placeholder';
  }

  static String? _getLastUserAction() {
    return 'last_action_placeholder';
  }

  static String _getAppLifecycleState() {
    // In real Flutter app: WidgetsBinding.instance.lifecycleState?.name ?? 'unknown'
    return 'resumed';
  }

  static Future<Map<String, dynamic>> _getDeviceInfo() async {
    return {
      'platform': Platform.operatingSystem,
      'osVersion': Platform.operatingSystemVersion,
      'appVersion': '1.0.0',
      'flutterVersion': '3.16.0',
      'dartVersion': Platform.version,
      'isDebug': kDebugMode,
      'deviceModel': 'simulator', // Add actual device detection
    };
  }

  static String _detectStateManager() {
    return 'unknown'; // Implement based on your app's dependencies
  }
}

// Example usage in main.dart:
/*
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize socket-ready error transport
  await FlutterErrorTransport.initialize();
  
  runApp(MyApp());
}
*/

// Example Dio Interceptor for HTTP errors
/*
class MCPErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    FlutterErrorTransport.captureHttpError(
      err.requestOptions.method,
      err.requestOptions.path,
      err.response?.statusCode,
      err.message ?? 'Unknown HTTP error',
      err.stackTrace.toString(),
      headers: err.requestOptions.headers,
      requestBody: err.requestOptions.data?.toString(),
      responseBody: err.response?.data?.toString(),
    );
    
    super.onError(err, handler);
  }
}
*/

// Example NavigatorObserver for route tracking
/*
class MCPNavigatorObserver extends NavigatorObserver {
  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    // Update current route tracking
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);
    // Update current route tracking
  }
}
*/
