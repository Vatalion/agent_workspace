import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/counter_bloc.dart';
import '../bloc/counter_state.dart';

class CounterDisplay extends StatelessWidget {
  const CounterDisplay({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CounterBloc, CounterState>(
      builder: (context, state) {
        if (state is CounterLoaded) {
          return Column(
            children: [
              const Text(
                'Testing Copilot Chat Integration',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              Text(
                'Counter: ${state.value}',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 20),
            ],
          );
        } else if (state is CounterLoading) {
          return const Center(child: CircularProgressIndicator());
        } else if (state is CounterError) {
          return Text(
            'Error: ${state.message}',
            style: const TextStyle(color: Colors.red),
          );
        } else {
          // Initial state or any unhandled state
          return const Text('Counter: -', style: TextStyle(fontSize: 24));
        }
      },
    );
  }
}
