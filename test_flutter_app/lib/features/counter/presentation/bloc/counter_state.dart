import 'package:equatable/equatable.dart';

// States for the CounterBloc
abstract class CounterState extends Equatable {
  const CounterState();

  @override
  List<Object?> get props => [];
}

// Initial state of the counter
class CounterInitial extends CounterState {}

// Loading state when counter is being updated
class CounterLoading extends CounterState {}

// State when counter value is available
class CounterLoaded extends CounterState {
  final int value;

  const CounterLoaded({required this.value});

  @override
  List<Object?> get props => [value];
}

// Error state for the counter
class CounterError extends CounterState {
  final String message;

  const CounterError({required this.message});

  @override
  List<Object?> get props => [message];
}
