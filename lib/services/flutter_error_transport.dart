// Flutter Error Transport - Production Ready Integration
//
// This is a production-ready Flutter integration that connects directly
// to the MCP server for real-time error streaming and AI-powered debugging.
//
// Dependencies to add to your Flutter project's pubspec.yaml:
// dependencies:
//   web_socket_channel: ^2.4.0
//   http: ^1.1.0
//
// Usage:
// 1. Add this file to your Flutter project at lib/services/
// 2. Call FlutterErrorTransport.initialize() in your main() function
// 3. Errors will be automatically captured and streamed in real-time

import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;
import 'package:web_socket_channel/html.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

/// A production-ready error transport implementation for Flutter applications
class FlutterErrorTransport {
  static final FlutterErrorTransport _instance =
      FlutterErrorTransport._internal();
  factory FlutterErrorTransport() => _instance;
  FlutterErrorTransport._internal();

  static const String _version = '1.0.0';
  static const String _wsUrl = 'ws://localhost:8080';
  static const String _httpUrl = 'http://localhost:8080';

  WebSocketChannel? _channel;
  Timer? _reconnectTimer;
  String? _currentRoute;
  bool _isInitialized = false;

  /// Initialize the error transport
  static Future<void> initialize() async {
    if (_instance._isInitialized) return;

    print(
        '🚀 [FlutterErrorTransport] Initializing production error transport...');

    // Set up error handlers
    FlutterError.onError = (FlutterErrorDetails details) {
      _instance._handleFlutterError(details);
    };

    // Set up zone error handler
    runZonedGuarded(() {
      // Your app's main() function should be called here
    }, (error, stack) {
      _instance._handleZoneError(error, stack);
    });

    print('🛡️ [FlutterErrorTransport] Production error handlers configured');

    // Connect to WebSocket
    await _instance._connectWebSocket();

    _instance._isInitialized = true;
    print('✅ [FlutterErrorTransport] Production error transport initialized');
  }

  /// Update the current route
  static void updateCurrentRoute(String? route) {
    _instance._currentRoute = route;
  }

  Future<void> _connectWebSocket() async {
    try {
      print('🔌 [FlutterErrorTransport] Connecting to WebSocket: $_wsUrl');

      if (kIsWeb) {
        // Web platform
        _channel = HtmlWebSocketChannel.connect(Uri.parse(_wsUrl));
      } else {
        // Native platforms
        _channel = IOWebSocketChannel.connect(Uri.parse(_wsUrl));
      }

      _channel?.stream.listen(
        (message) {
          // Handle incoming messages if needed
        },
        onError: (error) {
          print('❌ [FlutterErrorTransport] WebSocket error: $error');
          _scheduleReconnect();
        },
        onDone: () {
          print('🔌 [FlutterErrorTransport] WebSocket connection closed');
          _scheduleReconnect();
        },
      );
    } catch (e) {
      print('❌ [FlutterErrorTransport] WebSocket connection failed: $e');
      _scheduleReconnect();
    }
  }

  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 5), () {
      _connectWebSocket();
    });
  }

  void _handleFlutterError(FlutterErrorDetails details) {
    _sendError(
      error: details.exception,
      stackTrace: details.stack,
      context: {
        'library': details.library ?? 'unknown',
        'context': details.context?.toString() ?? 'unknown',
        'route': _currentRoute ?? 'unknown',
      },
    );
  }

  void _handleZoneError(dynamic error, StackTrace? stackTrace) {
    _sendError(
      error: error,
      stackTrace: stackTrace,
      context: {
        'route': _currentRoute ?? 'unknown',
      },
    );
  }

  Future<void> _sendError({
    required dynamic error,
    StackTrace? stackTrace,
    Map<String, dynamic>? context,
  }) async {
    final errorData = {
      'timestamp': DateTime.now().toIso8601String(),
      'version': _version,
      'error': error.toString(),
      'stackTrace': stackTrace?.toString(),
      'context': context,
      'platform': _getPlatformInfo(),
    };

    try {
      // Try WebSocket first
      if (_channel != null) {
        _channel!.sink.add(jsonEncode(errorData));
        return;
      }

      // Fallback to HTTP
      final response = await http.post(
        Uri.parse('$_httpUrl/error'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(errorData),
      );

      if (response.statusCode != 200) {
        print(
            '❌ [FlutterErrorTransport] Failed to send error via HTTP: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ [FlutterErrorTransport] Failed to send error: $e');
    }
  }

  String _getPlatformInfo() {
    if (kIsWeb) return 'web';

    // For native platforms, we'll use a simpler approach
    try {
      final platform = defaultTargetPlatform;
      switch (platform) {
        case TargetPlatform.android:
          return 'android';
        case TargetPlatform.iOS:
          return 'ios';
        case TargetPlatform.macOS:
          return 'macos';
        case TargetPlatform.windows:
          return 'windows';
        case TargetPlatform.linux:
          return 'linux';
        case TargetPlatform.fuchsia:
          return 'fuchsia';
        default:
          return 'unknown';
      }
    } catch (e) {
      return 'unknown';
    }
  }
}

/// NavigatorObserver for automatic route tracking
class FlutterErrorTransportNavigatorObserver extends NavigatorObserver {
  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    FlutterErrorTransport.updateCurrentRoute(route.settings.name);
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);
    FlutterErrorTransport.updateCurrentRoute(previousRoute?.settings.name);
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
    FlutterErrorTransport.updateCurrentRoute(newRoute?.settings.name);
  }
}
