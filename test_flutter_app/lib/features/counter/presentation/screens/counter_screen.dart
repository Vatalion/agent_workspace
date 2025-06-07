import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/counter_bloc.dart';
import '../bloc/counter_event.dart';
import '../widgets/counter_display.dart';
import '../widgets/scrollable_boxes.dart';

class CounterScreen extends StatelessWidget {
  const CounterScreen({Key? key, required this.title}) : super(key: key);

  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const <Widget>[CounterDisplay(), ScrollableBoxes()],
        ),
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            onPressed: () =>
                context.read<CounterBloc>().add(const IncrementCounterEvent()),
            tooltip: 'Increment',
            heroTag: 'increment',
            child: const Icon(Icons.add),
          ),
          const SizedBox(height: 16),
          FloatingActionButton(
            onPressed: () =>
                context.read<CounterBloc>().add(const ResetCounterEvent()),
            tooltip: 'Reset',
            heroTag: 'reset',
            backgroundColor: Colors.red,
            child: const Icon(Icons.refresh),
          ),
        ],
      ),
    );
  }
}
