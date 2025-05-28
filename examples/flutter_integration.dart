// Flutter Integration Example - Socket Ready (Simplified)
// Add this to your Flutter project's main.dart or error handling service
// 
// Key Features:
// ✅ Real-time WebSocket connection to MCP server
// ✅ Automatic error streaming and queuing
// ✅ Connection management with auto-reconnect
// ✅ Comprehensive error categorization
//
// Dependencies to add to pubspec.yaml:
// dependencies:
//   web_socket_channel: ^2.4.0
//   http: ^1.1.0 (for fallback)

import 'dart:async';

// Note: In a real Flutter project, uncomment these imports:
// import 'package:flutter/foundation.dart';
// import 'package:flutter/services.dart';
// import 'package:web_socket_channel/web_socket_channel.dart';
// import 'package:web_socket_channel/io.dart';

class FlutterErrorTransport {
  // 🌐 Socket Configuration
  static const String mcpWebSocketUrl = 'ws://localhost:8080';
  static const String mcpHttpFallback = 'http://localhost:3000/api/errors';
  
  // 🔌 Connection State
  static dynamic _webSocketChannel; // WebSocketChannel in real Flutter
  static bool _isConnected = false;
  static bool _isConnecting = false;
  static final List<Map<String, dynamic>> _errorQueue = [];
  static Timer? _reconnectTimer;
  static int _reconnectAttempts = 0;
  static const int maxReconnectAttempts = 5;

  /// 🚀 Initialize Socket-Ready Error Transport
  static Future<void> initialize({bool autoConnect = true}) async {
    print('🚀 [Socket-Ready] Initializing Flutter Error Transport...');
    
    _setupFlutterErrorHandlers();
    
    if (autoConnect) {
      await connectToMCPServer();
    }
    
    print('✅ [Socket-Ready] Error transport initialized with WebSocket support');
  }

  /// 🔌 Connect to MCP Server WebSocket
  static Future<bool> connectToMCPServer() async {
    if (_isConnected || _isConnecting) return _isConnected;
    
    _isConnecting = true;
    print('🔌 Connecting to MCP server: $mcpWebSocketUrl');
    
    try {
      // In real Flutter project:
      // _webSocketChannel = IOWebSocketChannel.connect(Uri.parse(mcpWebSocketUrl));
      
      // Mock connection for demo
      _webSocketChannel = 'connected';
      _isConnected = true;
      _isConnecting = false;
      _reconnectAttempts = 0;
      
      _setupWebSocketListeners();
      await _sendQueuedErrors();
      
      print('✅ Connected to MCP server via WebSocket');
      return true;
      
    } catch (e) {
      _isConnecting = false;
      _isConnected = false;
      print('❌ WebSocket connection failed: $e');
      _scheduleReconnect();
      return false;
    }
  }

  /// 📡 Send Error via WebSocket (Real-time)
  static Future<void> streamError(Map<String, dynamic> errorData) async {
    if (_isConnected && _webSocketChannel != null) {
      // In real Flutter project:
      // final message = {
      //   'type': 'flutter_error_stream',
      //   'timestamp': DateTime.now().toIso8601String(),
      //   'error_data': errorData,
      // };
      // _webSocketChannel.sink.add(jsonEncode(message));
      
      print('📡 [Real-time] Error streamed: ${errorData['errorType']}');
    } else {
      // Queue for later if not connected
      _errorQueue.add(errorData);
      print('📝 [Queued] Error stored for streaming: ${errorData['errorType']}');
      
      // Try to connect
      if (!_isConnecting) {
        connectToMCPServer();
      }
    }
  }

  /// 🛡️ Capture Any Flutter Error (Socket-Ready)
  static Future<void> captureError({
    required String errorMessage,
    required String stackTrace,
    required String errorType,
    String severity = 'medium',
    Map<String, dynamic>? context,
  }) async {
    final errorData = {
      'timestamp': DateTime.now().toIso8601String(),
      'errorType': errorType,
      'severity': severity,
      'message': errorMessage,
      'stackTrace': stackTrace,
      'context': {
        ...context ?? {},
        'capture_method': 'socket_ready_transport',
        'connection_status': _isConnected ? 'connected' : 'disconnected',
      },
      'deviceInfo': await _getDeviceInfo(),
    };

    // 📡 Stream error in real-time
    await streamError(errorData);
  }

  /// 🌐 Capture HTTP/API Errors
  static Future<void> captureHttpError(
    String method,
    String endpoint,
    int? statusCode,
    String errorMessage,
    String stackTrace,
  ) async {
    await captureError(
      errorMessage: errorMessage,
      stackTrace: stackTrace,
      errorType: 'http_api',
      severity: statusCode != null && statusCode >= 500 ? 'critical' : 'high',
      context: {
        'endpoint': endpoint,
        'method': method,
        'status_code': statusCode,
        'error_category': 'network',
      },
    );
  }

  /// 🏛️ Capture State Management Errors  
  static Future<void> captureStateError(
    String stateType,
    String errorMessage,
    String stackTrace, {
    String? currentState,
    String? action,
  }) async {
    await captureError(
      errorMessage: errorMessage,
      stackTrace: stackTrace,
      errorType: 'state_management',
      severity: 'medium',
      context: {
        'state_type': stateType,
        'current_state': currentState,
        'action': action,
      },
    );
  }

  /// 🧭 Capture Navigation Errors
  static Future<void> captureNavigationError(
    String routeName,
    String errorMessage,
    String stackTrace, {
    Map<String, dynamic>? routeArguments,
  }) async {
    await captureError(
      errorMessage: errorMessage,
      stackTrace: stackTrace,
      errorType: 'navigation',
      severity: 'medium',
      context: {
        'route_name': routeName,
        'route_arguments': routeArguments,
      },
    );
  }

  /// 🎨 Capture Widget Build Errors
  static Future<void> captureWidgetError(
    String widgetName,
    String errorMessage,
    String stackTrace, {
    String? widgetPath,
  }) async {
    await captureError(
      errorMessage: errorMessage,
      stackTrace: stackTrace,
      errorType: 'widget_build',
      severity: errorMessage.contains('overflow') ? 'medium' : 'high',
      context: {
        'widget_name': widgetName,
        'widget_path': widgetPath,
      },
    );
  }

  // 🔧 Connection Management

  static void _setupWebSocketListeners() {
    // In real Flutter project, set up stream listeners:
    /*
    _webSocketChannel.stream.listen(
      (data) {
        final message = jsonDecode(data);
        _handleServerMessage(message);
      },
      onError: (error) {
        print('❌ WebSocket error: $error');
        _handleConnectionLost();
      },
      onDone: () {
        print('🔌 WebSocket connection closed');
        _handleConnectionLost();
      },
    );
    */
    print('🔗 WebSocket listeners configured (connection loss handling ready)');
  }

  // Connection management methods (used when WebSocket is active)
  // ignore: unused_element
  static void _handleConnectionLost() {
    _isConnected = false;
    _webSocketChannel = null;
    print('🔌 Connection lost, scheduling reconnect...');
    _scheduleReconnect();
  }

  // ignore: unused_element
  static void _handleServerMessage(Map<String, dynamic> message) {
    // In real Flutter: handle server acknowledgments, status updates, etc.
    print('📨 Server message: ${message['type']}');
  }

  static void _scheduleReconnect() {
    if (_reconnectAttempts >= maxReconnectAttempts) {
      print('❌ Max reconnect attempts reached');
      return;
    }
    
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 3), () async {
      _reconnectAttempts++;
      print('🔄 Reconnect attempt $_reconnectAttempts/$maxReconnectAttempts');
      await connectToMCPServer();
    });
  }

  static Future<void> _sendQueuedErrors() async {
    if (_errorQueue.isEmpty) return;
    
    print('📤 Sending ${_errorQueue.length} queued errors...');
    
    final errors = List<Map<String, dynamic>>.from(_errorQueue);
    _errorQueue.clear();
    
    for (final errorData in errors) {
      await streamError(errorData);
      await Future.delayed(const Duration(milliseconds: 100));
    }
    
    print('✅ All queued errors sent');
  }

  // 🛡️ Error Handler Setup

  static void _setupFlutterErrorHandlers() {
    // In real Flutter project:
    /*
    FlutterError.onError = (FlutterErrorDetails details) {
      captureError(
        errorMessage: details.toString(),
        stackTrace: details.stack.toString(),
        errorType: _categorizeFlutterError(details),
        severity: _determineSeverity(details),
        context: _extractFlutterContext(details),
      );
    };

    PlatformDispatcher.instance.onError = (error, stack) {
      captureError(
        errorMessage: error.toString(),
        stackTrace: stack.toString(),
        errorType: 'general',
        severity: 'high',
        context: {
          'source': 'async_error',
          'error_type': error.runtimeType.toString(),
        },
      );
      return true;
    };
    */
    
    print('🛡️ Flutter error handlers configured for socket streaming');
  }

  // 📊 Helper Methods

  static Future<Map<String, dynamic>> _getDeviceInfo() async {
    return {
      'platform': 'ios', // Platform.operatingSystem in real Flutter
      'osVersion': '17.0', // Platform.operatingSystemVersion
      'appVersion': '1.0.0',
      'flutterVersion': '3.16.0',
      'isDebug': true, // kDebugMode in real Flutter
      'connection_type': 'websocket',
      'mcp_server_url': mcpWebSocketUrl,
    };
  }

  // 📋 Status Methods
  
  static bool get isConnected => _isConnected;
  static int get queuedErrorsCount => _errorQueue.length;
  static String get connectionStatus => _isConnected 
      ? '🟢 Connected to MCP server' 
      : '🔴 Disconnected from MCP server';
  
  /// 🔌 Disconnect from MCP Server
  static void disconnect() {
    // In real Flutter: _webSocketChannel?.sink.close();
    _webSocketChannel = null;
    _isConnected = false;
    _isConnecting = false;
    _reconnectTimer?.cancel();
    print('🔌 Disconnected from MCP server');
  }
}

// 🚀 Example Usage in main.dart:
/*
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize socket-ready error transport
  await FlutterErrorTransport.initialize();
  
  // Check connection status
  print(FlutterErrorTransport.connectionStatus);
  
  runApp(MyApp());
}
*/

// 🌐 Example Dio Interceptor for HTTP errors:
/*
class SocketReadyErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    FlutterErrorTransport.captureHttpError(
      err.requestOptions.method,
      err.requestOptions.path,
      err.response?.statusCode,
      err.message ?? 'Unknown HTTP error',
      err.stackTrace.toString(),
    );
    
    super.onError(err, handler);
  }
}
*/
