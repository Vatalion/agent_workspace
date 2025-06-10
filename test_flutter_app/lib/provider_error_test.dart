// Test file for Provider error detection
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// This file contains the exact Provider error you encountered
class InitializeAppUseCase {
  void initialize() {
    print('App initialized');
  }
}

class HomeScreenCubit {
  String get state => 'home';
}

class TestProviderError extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // This will cause the exact error you're seeing:
    // ProviderNotFoundException: Could not find the correct Provider<InitializeAppUseCase>
    
    return Scaffold(
      appBar: AppBar(title: Text('Provider Error Test')),
      body: Column(
        children: [
          // This line will throw the ProviderNotFoundException
          Consumer<InitializeAppUseCase>(
            builder: (context, useCase, child) {
              return Text('This will cause Provider error');
            },
          ),
          
          // Alternative that will also cause the error
          Builder(
            builder: (context) {
              // This line causes: Could not find the correct Provider<InitializeAppUseCase>
              final useCase = context.read<InitializeAppUseCase>();
              return Text('Another Provider error');
            },
          ),
        ],
      ),
    );
  }
}

// Example of the error in console:
// flutter: Exception has occurred.
// flutter: ProviderNotFoundException (Error: Could not find the correct Provider<InitializeAppUseCase> above this _InheritedProviderScope<HomeScreenCubit?> Widget
// flutter: This happens because you used a BuildContext that does not include the provider
// flutter: of your choice. There are a few common scenarios:
// flutter: - You added a new provider in your main.dart and performed a hot-reload.
// flutter:   To fix, perform a hot-restart.
// flutter: - The provider you are trying to read is in a different route.
// flutter: - You used a BuildContext that is an ancestor of the provider you are trying to read.

class CorrectProviderSetup extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<InitializeAppUseCase>(
          create: (_) => InitializeAppUseCase(),
        ),
        Provider<HomeScreenCubit>(
          create: (_) => HomeScreenCubit(),
        ),
      ],
      child: TestProviderError(),
    );
  }
}