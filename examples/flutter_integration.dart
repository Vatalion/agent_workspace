// Flutter Integration Example
// Add this to your Flutter project's main.dart or error handling service

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import 'dart:io';

class FlutterErrorTransport {
  static const String _mcpServerEndpoint = 'your-mcp-server-endpoint';
  
  /// Initialize error transport in your main() function
  static void initialize() {
    // Capture Flutter framework errors
    FlutterError.onError = (FlutterErrorDetails details) {
      _captureError(
        errorMessage: details.toString(),
        stackTrace: details.stack.toString(),
        errorType: _categorizeFlutterError(details),
        severity: _determineSeverity(details),
        context: _extractFlutterContext(details),
      );
    };

    // Capture async errors
    PlatformDispatcher.instance.onError = (error, stack) {
      _captureError(
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
  }

  /// Manually capture custom errors
  static Future<void> captureError({
    required String errorMessage,
    required String stackTrace,
    required String errorType,
    String severity = 'medium',
    Map<String, dynamic>? context,
  }) async {
    await _captureError(
      errorMessage: errorMessage,
      stackTrace: stackTrace,
      errorType: errorType,
      severity: severity,
      context: context ?? {},
    );
  }

  /// Capture HTTP/API errors (use with Dio interceptor)
  static Future<void> captureHttpError(
    String method,
    String endpoint,
    int? statusCode,
    String errorMessage,
    String stackTrace,
  ) async {
    await _captureError(
      errorMessage: errorMessage,
      stackTrace: stackTrace,
      errorType: 'http_api',
      severity: statusCode != null && statusCode >= 500 ? 'high' : 'medium',
      context: {
        'endpoint': endpoint,
        'method': method,
        'status_code': statusCode,
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
        'state_manager': _detectStateManager(),
      },
    );
  }

  /// Capture navigation errors
  static Future<void> captureNavigationError(
    String routeName,
    String errorMessage,
    String stackTrace, {
    Map<String, dynamic>? routeArguments,
  }) async {
    await _captureError(
      errorMessage: errorMessage,
      stackTrace: stackTrace,
      errorType: 'navigation',
      severity: 'medium',
      context: {
        'route_name': routeName,
        'route_arguments': routeArguments,
        'navigation_stack': 'current_stack', // Implement route stack tracking
      },
    );
  }

  // Private methods

  static Future<void> _captureError({
    required String errorMessage,
    required String stackTrace,
    required String errorType,
    required String severity,
    required Map<String, dynamic> context,
  }) async {
    try {
      final errorData = {
        'errorMessage': errorMessage,
        'stackTrace': stackTrace,
        'errorType': errorType,
        'severity': severity,
        'context': {
          ...context,
          'widget_path': _getCurrentWidgetPath(),
          'current_route': _getCurrentRoute(),
          'user_action': _getLastUserAction(),
          'app_lifecycle_state': _getAppLifecycleState(),
        },
        'deviceInfo': await _getDeviceInfo(),
        'timestamp': DateTime.now().toIso8601String(),
      };

      // Send to MCP server (implement your preferred method)
      await _sendToMCPServer(errorData);
      
      // Log locally for debugging
      if (kDebugMode) {
        print('📨 Error captured and sent to MCP server: $errorType');
      }
    } catch (e) {
      // Fallback: don't let error handling cause more errors
      if (kDebugMode) {
        print('❌ Failed to capture error: $e');
      }
    }
  }

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

  static String _determineSeverity(FlutterErrorDetails details) {
    final error = details.toString().toLowerCase();
    
    // Critical: App crashes or complete failures
    if (error.contains('fatal') || 
        error.contains('crash') ||
        error.contains('assertion failed')) {
      return 'critical';
    }
    
    // High: Major functionality broken
    if (error.contains('exception') || 
        error.contains('null check operator') ||
        error.contains('range error')) {
      return 'high';
    }
    
    // Medium: User experience issues
    if (error.contains('overflow') || 
        error.contains('constraint') ||
        error.contains('layout')) {
      return 'medium';
    }
    
    // Default to low for other cases
    return 'low';
  }

  static Map<String, dynamic> _extractFlutterContext(FlutterErrorDetails details) {
    return {
      'library': details.library ?? 'unknown',
      'context_description': details.context?.toString(),
      'information_collector': details.informationCollector?.toString(),
      'stack_filter': details.stackFilter != null ? 'present' : 'absent',
    };
  }

  static String? _getCurrentWidgetPath() {
    // Implement widget hierarchy tracking
    // This would require custom implementation in your app
    return 'widget_path_placeholder';
  }

  static String? _getCurrentRoute() {
    // Implement current route tracking
    // You can use NavigatorObserver for this
    return 'current_route_placeholder';
  }

  static String? _getLastUserAction() {
    // Implement user action tracking
    // Track button taps, gestures, etc.
    return 'last_action_placeholder';
  }

  static String _getAppLifecycleState() {
    return WidgetsBinding.instance.lifecycleState?.name ?? 'unknown';
  }

  static Future<Map<String, dynamic>> _getDeviceInfo() async {
    return {
      'platform': Platform.operatingSystem,
      'version': Platform.operatingSystemVersion,
      'is_debug': kDebugMode,
      'dart_version': Platform.version,
      // Add more device info as needed
    };
  }

  static String _detectStateManager() {
    // Detect which state management solution is being used
    // This would need to be implemented based on your app's dependencies
    return 'unknown';
  }

  static Future<void> _sendToMCPServer(Map<String, dynamic> errorData) async {
    // Implement the actual sending mechanism
    // This could be HTTP, WebSocket, or other transport method
    // depending on how you integrate with the MCP server
    
    // Example HTTP implementation:
    /*
    try {
      final response = await http.post(
        Uri.parse('$_mcpServerEndpoint/capture_flutter_error'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(errorData),
      );
      
      if (response.statusCode != 200) {
        throw Exception('Failed to send error: ${response.statusCode}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Failed to send error to MCP server: $e');
      }
    }
    */
  }
}

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
    // Track route changes for error context
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);
    // Track route changes for error context
  }
}
*/
