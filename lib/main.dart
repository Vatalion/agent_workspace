import 'package:flutter/material.dart';

import 'services/flutter_error_transport.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize error transport
  await FlutterErrorTransport.initialize();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Error Transport Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      navigatorObservers: [
        FlutterErrorTransportNavigatorObserver(),
      ],
      home: const MyHomePage(),
    );
  }
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Error Transport Demo'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () {
                // Simulate an error
                throw Exception('Test error from button press');
              },
              child: const Text('Trigger Test Error'),
            ),
          ],
        ),
      ),
    );
  }
}
