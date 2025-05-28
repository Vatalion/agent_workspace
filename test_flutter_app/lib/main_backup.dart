import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'error_examples.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Debug Assistant Test',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Flutter Debug Assistant Test'),
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
      
      // Trigger an error for testing VS Code extension
      if (_counter > 2) {
        throw Exception('Test Flutter Error: Counter exceeded 2! Current value: $_counter. This error is intentional for testing the VS Code debug assistant extension.');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Intentional error to test VS Code debug console monitoring - Updated at 28 May 2025
    print('Debug: Building MyHomePage widget - Hot reload test');
    
    // Force a runtime error for testing
    try {
      var nullList = <String>[];
      nullList[999]; // This will throw RangeError
    } catch (e) {
      print('ERROR CAUGHT: $e');
      debugPrint('FLUTTER ERROR: $e');
    }
    
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Icon(
              Icons.bug_report,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 20),
            const Text(
              'Flutter Debug Assistant Test App',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              'Test your VS Code extension with real Flutter errors',
              style: TextStyle(fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const ErrorExamples(),
                  ),
                );
              },
              icon: const Icon(Icons.warning),
              label: const Text('Open Error Examples'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
            ),
            const SizedBox(height: 20),
            const Text('Counter (for basic functionality test):'),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headlineMedium,
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