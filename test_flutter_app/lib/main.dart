import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'core/injection/dependency_injector.dart';
import 'features/counter/presentation/bloc/counter_event.dart';
import 'features/counter/presentation/screens/counter_screen.dart';

void main() {
  // Initialize the dependency injector
  final injector = DependencyInjector();

  runApp(MyApp(injector: injector));
}

class MyApp extends StatelessWidget {
  final DependencyInjector injector;

  const MyApp({Key? key, required this.injector}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Debug Test',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: BlocProvider(
        create: (_) => injector.createCounterBloc()..add(GetCounterEvent()),
        child: const CounterScreen(title: 'Test Copilot Chat Fix'),
      ),
    );
  }
}

// Old MyHomePage has been refactored into CounterScreen using clean architecture
