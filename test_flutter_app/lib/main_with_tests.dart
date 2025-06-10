import 'package:flutter/material.dart';
import 'test_console_error.dart';
import 'test_breakpoint_errors.dart';

void main() {
  runApp(FlutterDebugTestApp());
}

class FlutterDebugTestApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Debug Assistant Test',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: DebugTestHomePage(),
    );
  }
}

class DebugTestHomePage extends StatefulWidget {
  @override
  State<DebugTestHomePage> createState() => _DebugTestHomePageState();
}

class _DebugTestHomePageState extends State<DebugTestHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
      
      // Trigger console errors for testing
      if (_counter == 3) {
        triggerConsoleErrors();
      }
      
      // Trigger exception for breakpoint testing
      if (_counter == 5) {
        try {
          BreakpointErrorTester.testNullPointerException();
        } catch (e) {
          print('Caught exception: $e');
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text('Flutter Debug Assistant Test'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'Flutter Debug Assistant Test Suite',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            SizedBox(height: 20),
            Text(
              'Tap count:',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            SizedBox(height: 30),
            ElevatedButton(
              onPressed: () => triggerConsoleErrors(),
              child: Text('🔥 Trigger Console Errors'),
            ),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: () {
                try {
                  BreakpointErrorTester.testNullPointerException();
                } catch (e) {
                  print('Exception caught: $e');
                }
              },
              child: Text('🔴 Test Null Pointer'),
            ),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: () {
                try {
                  BreakpointErrorTester.testRangeError();
                } catch (e) {
                  print('Exception caught: $e');
                }
              },
              child: Text('🔴 Test Range Error'),
            ),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: () {
                try {
                  BreakpointErrorTester.testAssertionError();
                } catch (e) {
                  print('Exception caught: $e');
                }
              },
              child: Text('🔴 Test Assertion'),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment (triggers at 3 & 5)',
        child: Icon(Icons.add),
      ),
    );
  }
}
