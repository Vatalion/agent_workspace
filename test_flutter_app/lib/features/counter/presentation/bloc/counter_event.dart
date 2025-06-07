import 'package:equatable/equatable.dart';

// Base event class for CounterBloc
abstract class CounterEvent extends Equatable {
  const CounterEvent();

  @override
  List<Object?> get props => [];
}

// Event to increment the counter
class IncrementCounterEvent extends CounterEvent {
  final int amount;

  const IncrementCounterEvent({this.amount = 1});

  @override
  List<Object?> get props => [amount];
}

// Event to reset the counter
class ResetCounterEvent extends CounterEvent {
  final int value;

  const ResetCounterEvent({this.value = 0});

  @override
  List<Object?> get props => [value];
}

// Event to fetch the current counter value
class GetCounterEvent extends CounterEvent {}
