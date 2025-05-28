import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

/// Flutter Error Examples for Testing the Debug Assistant Extension
/// 
/// This file contains various common Flutter errors that developers encounter.
/// Use these examples to test the AI debugging assistant features.

class ErrorExamples extends StatefulWidget {
  const ErrorExamples({super.key});

  @override
  State<ErrorExamples> createState() => _ErrorExamplesState();
}

class _ErrorExamplesState extends State<ErrorExamples> {
  List<String> items = [];
  bool isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flutter Error Examples'),
        backgroundColor: Colors.red,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              '🔥 Flutter Error Test Cases',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            
            // Widget Build Errors Section
            _buildErrorSection(
              '🎨 Widget Build Errors',
              [
                _buildErrorButton('RenderFlex Overflow', _triggerRenderFlexOverflow),
                _buildErrorButton('Constraint Violation', _triggerConstraintViolation),
                _buildErrorButton('Invalid Widget Tree', _triggerInvalidWidgetTree),
              ],
            ),
            
            // State Management Errors Section
            _buildErrorSection(
              '🔄 State Management Errors',
              [
                _buildErrorButton('setState After Dispose', _triggerSetStateAfterDispose),
                _buildErrorButton('Null State Access', _triggerNullStateAccess),
                _buildErrorButton('Invalid State Update', _triggerInvalidStateUpdate),
              ],
            ),
            
            // Navigation Errors Section
            _buildErrorSection(
              '🧭 Navigation Errors',
              [
                _buildErrorButton('Invalid Route', _triggerInvalidRoute),
                _buildErrorButton('Missing Route Arguments', _triggerMissingRouteArgs),
                _buildErrorButton('Navigator Stack Error', _triggerNavigatorStackError),
              ],
            ),
            
            // HTTP/API Errors Section
            _buildErrorSection(
              '🌐 HTTP/API Errors',
              [
                _buildErrorButton('Network Request Failure', _triggerNetworkError),
                _buildErrorButton('JSON Parse Error', _triggerJsonParseError),
                _buildErrorButton('Timeout Error', _triggerTimeoutError),
              ],
            ),
            
            // Memory/Performance Errors Section
            _buildErrorSection(
              '⚡ Memory/Performance Errors',
              [
                _buildErrorButton('Memory Leak Simulation', _triggerMemoryLeak),
                _buildErrorButton('Infinite Loop', _triggerInfiniteLoop),
                _buildErrorButton('Heavy Computation', _triggerHeavyComputation),
              ],
            ),
            
            // Platform Channel Errors Section
            _buildErrorSection(
              '📱 Platform Channel Errors',
              [
                _buildErrorButton('Missing Platform Method', _triggerMissingPlatformMethod),
                _buildErrorButton('Platform Exception', _triggerPlatformException),
              ],
            ),
            
            // Animation/Controller Errors Section
            _buildErrorSection(
              '🎬 Animation/Controller Errors',
              [
                _buildErrorButton('Ticker After Dispose', _triggerTickerAfterDispose),
                _buildErrorButton('Animation Controller Leak', _triggerAnimationControllerLeak),
                _buildErrorButton('Invalid Animation Value', _triggerInvalidAnimationValue),
              ],
            ),
            
            // Focus/Form Errors Section
            _buildErrorSection(
              '📝 Focus/Form Errors',
              [
                _buildErrorButton('Focus Node After Dispose', _triggerFocusNodeAfterDispose),
                _buildErrorButton('Form Validation Error', _triggerFormValidationError),
                _buildErrorButton('Text Controller Leak', _triggerTextControllerLeak),
              ],
            ),
            
            // Async/Future Errors Section
            _buildErrorSection(
              '⏰ Async/Future Errors',
              [
                _buildErrorButton('Unhandled Future Error', _triggerUnhandledFutureError),
                _buildErrorButton('Stream Error', _triggerStreamError),
                _buildErrorButton('Completer Error', _triggerCompleterError),
              ],
            ),
            
            const SizedBox(height: 20),
            const Card(
              color: Colors.blue,
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '💡 How to Test the Extension:',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      '1. Tap any error button to trigger an error\n'
                      '2. When error appears, select the error text\n'
                      '3. Right-click → "🤖 Send Error to AI"\n'
                      '4. Debug session → Right-click call stack → "🤖 Send Debug Context to AI"\n'
                      '5. Terminal failures → Right-click terminal → "🤖 Send Terminal Output to AI"',
                      style: TextStyle(color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorSection(String title, List<Widget> buttons) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ...buttons,
          ],
        ),
      ),
    );
  }

  Widget _buildErrorButton(String label, VoidCallback onPressed) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.red,
          foregroundColor: Colors.white,
        ),
        child: Text(label),
      ),
    );
  }

  // ===========================================
  // WIDGET BUILD ERRORS
  // ===========================================

  void _triggerRenderFlexOverflow() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const RenderFlexOverflowExample(),
      ),
    );
  }

  void _triggerConstraintViolation() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const ConstraintViolationExample(),
      ),
    );
  }

  void _triggerInvalidWidgetTree() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const InvalidWidgetTreeExample(),
      ),
    );
  }

  // ===========================================
  // STATE MANAGEMENT ERRORS
  // ===========================================

  void _triggerSetStateAfterDispose() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const SetStateAfterDisposeExample(),
      ),
    );
  }

  void _triggerNullStateAccess() {
    // This will cause a null reference error
    setState(() {
      // Accessing items before initialization
      items.add('Item ${items.length}'); // This line will cause error if items is null
    });
  }

  void _triggerInvalidStateUpdate() {
    // Force an invalid state update
    setState(() {
      throw StateError('Invalid state update triggered for testing');
    });
  }

  // ===========================================
  // NAVIGATION ERRORS
  // ===========================================

  void _triggerInvalidRoute() {
    // Try to navigate to non-existent route
    Navigator.pushNamed(context, '/nonexistent-route');
  }

  void _triggerMissingRouteArgs() {
    // Navigate to route expecting arguments but don't provide them
    Navigator.pushNamed(context, '/route-with-args');
  }

  void _triggerNavigatorStackError() {
    // Try to pop when no routes are available
    try {
      Navigator.pop(context);
      Navigator.pop(context);
      Navigator.pop(context); // This will cause an error
    } catch (e) {
      throw FlutterError('Navigator stack error: $e');
    }
  }

  // ===========================================
  // HTTP/API ERRORS
  // ===========================================

  Future<void> _triggerNetworkError() async {
    try {
      setState(() => isLoading = true);
      
      // This will fail - invalid URL
      final response = await http.get(Uri.parse('https://invalid-url-that-does-not-exist.com/api/data'));
      
      if (response.statusCode == 200) {
        // This won't execute due to network error
        final data = json.decode(response.body);
        setState(() {
          items = List<String>.from(data['items']);
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() => isLoading = false);
      throw Exception('Network request failed: $e');
    }
  }

  Future<void> _triggerJsonParseError() async {
    try {
      setState(() => isLoading = true);
      
      // Simulate invalid JSON response
      const invalidJson = '{"invalid": json, "missing": quotes}';
      final data = json.decode(invalidJson); // This will throw FormatException
      
      setState(() {
        items = List<String>.from(data['items']);
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      throw FormatException('JSON parsing failed: $e');
    }
  }

  Future<void> _triggerTimeoutError() async {
    try {
      setState(() => isLoading = true);
      
      // This will timeout
      final client = http.Client();
      await client.get(
        Uri.parse('https://httpstat.us/200?sleep=10000'), // 10 second delay
      ).timeout(const Duration(seconds: 2)); // 2 second timeout
      
      setState(() => isLoading = false);
    } catch (e) {
      setState(() => isLoading = false);
      throw Exception('Request timeout: $e');
    }
  }

  // ===========================================
  // MEMORY/PERFORMANCE ERRORS
  // ===========================================

  void _triggerMemoryLeak() {
    // Simulate memory leak by creating large objects without cleanup
    final List<List<int>> memoryHog = [];
    for (int i = 0; i < 1000; i++) {
      memoryHog.add(List.filled(10000, i)); // Create large lists
    }
    
    // Store in state to prevent garbage collection
    setState(() {
      items.add('Memory leak created: ${memoryHog.length} large objects');
    });
  }

  void _triggerInfiniteLoop() {
    // This will cause the app to freeze
    int counter = 0;
    while (counter < 1000000) {
      counter++;
      // Infinite loop simulation
      if (counter == 999999) {
        counter = 0; // Reset to create infinite loop
      }
    }
  }

  void _triggerHeavyComputation() {
    // Heavy computation on main thread - will cause ANR
    DateTime start = DateTime.now();
    double result = 0;
    
    for (int i = 0; i < 10000000; i++) {
      result += i * 3.14159 / 2.71828; // Heavy math operation
    }
    
    DateTime end = DateTime.now();
    setState(() {
      items.add('Heavy computation result: $result, took: ${end.difference(start).inMilliseconds}ms');
    });
  }

  // ===========================================
  // PLATFORM CHANNEL ERRORS
  // ===========================================

  void _triggerMissingPlatformMethod() {
    // Try to call non-existent platform method
    throw MissingPluginException('No implementation found for method getNonExistentData on channel com.example/test');
  }

  void _triggerPlatformException() {
    // Simulate platform-specific error
    throw PlatformException(
      code: 'PLATFORM_ERROR',
      message: 'Platform-specific error occurred',
      details: 'This error simulates iOS/Android platform issues',
    );
  }

  // ===========================================
  // ANIMATION/CONTROLLER ERRORS
  // ===========================================

  void _triggerTickerAfterDispose() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const TickerAfterDisposeExample(),
      ),
    );
  }

  void _triggerAnimationControllerLeak() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const AnimationControllerLeakExample(),
      ),
    );
  }

  void _triggerInvalidAnimationValue() {
    // Create animation with invalid value
    try {
      // This will cause an error with invalid animation values
      throw FlutterError('Animation value out of bounds: -0.5 is not between 0.0 and 1.0');
    } catch (e) {
      setState(() {
        items.add('Animation error: $e');
      });
    }
  }

  // ===========================================
  // FOCUS/FORM ERRORS
  // ===========================================

  void _triggerFocusNodeAfterDispose() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const FocusNodeAfterDisposeExample(),
      ),
    );
  }

  void _triggerFormValidationError() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const FormValidationErrorExample(),
      ),
    );
  }

  void _triggerTextControllerLeak() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const TextControllerLeakExample(),
      ),
    );
  }

  // ===========================================
  // ASYNC/FUTURE ERRORS
  // ===========================================

  void _triggerUnhandledFutureError() {
    // Create a future that will error without being caught
    Future.delayed(const Duration(milliseconds: 100), () {
      throw Exception('Unhandled future error - this will show up in console');
    });
  }

  void _triggerStreamError() {
    // Create a stream that emits an error
    final streamController = StreamController<String>();
    
    streamController.stream.listen(
      (data) => print('Stream data: $data'),
      onError: (error) {
        throw Exception('Stream error: $error');
      },
    );
    
    // Emit an error
    streamController.addError('Stream error for testing');
    streamController.close();
  }

  void _triggerCompleterError() {
    final completer = Completer<String>();
    
    // Complete with error
    completer.completeError('Completer error for testing');
    
    // Try to use the future
    completer.future.then((value) {
      setState(() {
        items.add('Completer value: $value');
      });
    }).catchError((error) {
      throw Exception('Completer error: $error');
    });
  }
}

// ===========================================
// SPECIFIC ERROR EXAMPLE SCREENS
// ===========================================

class RenderFlexOverflowExample extends StatelessWidget {
  const RenderFlexOverflowExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('RenderFlex Overflow')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            // These containers will cause overflow
            Expanded(
              child: Container(
                width: 300,
                height: 100,
                color: Colors.red,
                child: Text('This container is too wide and will cause overflow'),
              ),
            ),
            Expanded(
              child: Container(
                width: 300,
                height: 100,
                color: Colors.blue,
                child: Text('Another wide container that will overflow'),
              ),
            ),
            Expanded(
              child: Container(
                width: 300,
                height: 100,
                color: Colors.green,
                child: Text('Third container causing more overflow'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ConstraintViolationExample extends StatelessWidget {
  const ConstraintViolationExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Constraint Violation')),
      body: Container(
        width: 100,
        height: 100,
        child: const SizedBox(
          width: 200, // Child is larger than parent - constraint violation
          height: 200,
          child: ColoredBox(
            color: Colors.red,
            child: Text('This will violate constraints'),
          ),
        ),
      ),
    );
  }
}

class InvalidWidgetTreeExample extends StatelessWidget {
  const InvalidWidgetTreeExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Invalid Widget Tree')),
      body: ListView(
        children: const [
          // This will cause error - Scaffold inside ScrollView
          Scaffold(
            body: Text('Invalid: Scaffold inside ListView'),
          ),
        ],
      ),
    );
  }
}

class SetStateAfterDisposeExample extends StatefulWidget {
  const SetStateAfterDisposeExample({super.key});

  @override
  State<SetStateAfterDisposeExample> createState() => _SetStateAfterDisposeExampleState();
}

class _SetStateAfterDisposeExampleState extends State<SetStateAfterDisposeExample> {
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _startAsyncOperation();
  }

  void _startAsyncOperation() async {
    // Navigate away immediately
    Future.delayed(const Duration(milliseconds: 100), () {
      Navigator.pop(context);
    });

    // This will try to call setState after widget is disposed
    await Future.delayed(const Duration(seconds: 2));
    
    if (mounted) { // This check would prevent the error, but we'll skip it for testing
      setState(() {
        _isLoading = true; // This will cause "setState called after dispose" error
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('setState After Dispose')),
      body: Center(
        child: _isLoading
            ? const CircularProgressIndicator()
            : const Text('Loading will cause setState after dispose error'),
      ),
    );
  }
}

class TickerAfterDisposeExample extends StatefulWidget {
  const TickerAfterDisposeExample({super.key});

  @override
  State<TickerAfterDisposeExample> createState() => _TickerAfterDisposeExampleState();
}

class _TickerAfterDisposeExampleState extends State<TickerAfterDisposeExample> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    // Forgetting to dispose the controller will cause ticker error
    // _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ticker After Dispose')),
      body: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Transform.rotate(
              angle: _controller.value * 6.28319, // Rotate from 0 to 2*pi
              child: child,
            );
          },
          child: const FlutterLogo(size: 100),
        ),
      ),
    );
  }
}

class AnimationControllerLeakExample extends StatefulWidget {
  const AnimationControllerLeakExample({super.key});

  @override
  State<AnimationControllerLeakExample> createState() => _AnimationControllerLeakExampleState();
}

class _AnimationControllerLeakExampleState extends State<AnimationControllerLeakExample> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    );
  }

  void _startAnimation() {
    _controller.forward();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Animation Controller Leak')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ElevatedButton(
              onPressed: _startAnimation,
              child: const Text('Start Animation'),
            ),
            const SizedBox(height: 20),
            // This widget will cause the animation controller to leak
            AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return Opacity(
                  opacity: _controller.value,
                  child: const FlutterLogo(size: 100),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class FocusNodeAfterDisposeExample extends StatefulWidget {
  const FocusNodeAfterDisposeExample({super.key});

  @override
  State<FocusNodeAfterDisposeExample> createState() => _FocusNodeAfterDisposeExampleState();
}

class _FocusNodeAfterDisposeExampleState extends State<FocusNodeAfterDisposeExample> {
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _focusNode.requestFocus();
  }

  @override
  void dispose() {
    // Forgetting to dispose the focus node will cause error
    // _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Focus Node After Dispose')),
      body: Center(
        child: TextField(
          focusNode: _focusNode,
          decoration: const InputDecoration(
            hintText: 'Focus node will cause error on dispose',
          ),
        ),
      ),
    );
  }
}

class FormValidationErrorExample extends StatefulWidget {
  const FormValidationErrorExample({super.key});

  @override
  State<FormValidationErrorExample> createState() => _FormValidationErrorExampleState();
}

class _FormValidationErrorExampleState extends State<FormValidationErrorExample> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Form Validation Error')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                validator: (value) {
                  // This will throw an error
                  throw Exception('Validation error for testing');
                },
                decoration: const InputDecoration(
                  labelText: 'Enter text (will cause validation error)',
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  _formKey.currentState?.validate();
                },
                child: const Text('Validate Form'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class TextControllerLeakExample extends StatefulWidget {
  const TextControllerLeakExample({super.key});

  @override
  State<TextControllerLeakExample> createState() => _TextControllerLeakExampleState();
}

class _TextControllerLeakExampleState extends State<TextControllerLeakExample> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    // Forgetting to dispose the text controller will cause leak
    // _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Text Controller Leak')),
      body: Center(
        child: TextField(
          controller: _controller,
          decoration: const InputDecoration(
            hintText: 'Text controller will leak memory',
          ),
        ),
      ),
    );
  }
}
