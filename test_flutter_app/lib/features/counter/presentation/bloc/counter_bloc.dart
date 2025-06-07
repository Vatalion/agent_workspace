import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/counter_entity.dart';
import '../../domain/usecases/get_counter_usecase.dart';
import '../../domain/usecases/increment_counter_usecase.dart';
import '../../domain/usecases/reset_counter_usecase.dart';
import 'counter_event.dart';
import 'counter_state.dart';

class CounterBloc extends Bloc<CounterEvent, CounterState> {
  final GetCounterUseCase getCounter;
  final IncrementCounterUseCase incrementCounter;
  final ResetCounterUseCase resetCounter;

  CounterBloc({
    required this.getCounter,
    required this.incrementCounter,
    required this.resetCounter,
  }) : super(CounterInitial()) {
    on<GetCounterEvent>(_onGetCounter);
    on<IncrementCounterEvent>(_onIncrementCounter);
    on<ResetCounterEvent>(_onResetCounter);
  }

  // Factory method for dependency injection
  static CounterBloc create(
    GetCounterUseCase getCounter,
    IncrementCounterUseCase incrementCounter,
    ResetCounterUseCase resetCounter,
  ) {
    return CounterBloc(
      getCounter: getCounter,
      incrementCounter: incrementCounter,
      resetCounter: resetCounter,
    );
  }

  void _onGetCounter(GetCounterEvent event, Emitter<CounterState> emit) {
    try {
      final CounterEntity counter = getCounter();
      emit(CounterLoaded(value: counter.value));
    } catch (e) {
      emit(CounterError(message: e.toString()));
    }
  }

  void _onIncrementCounter(
    IncrementCounterEvent event,
    Emitter<CounterState> emit,
  ) {
    try {
      emit(CounterLoading());
      final CounterEntity counter = incrementCounter(event.amount);
      emit(CounterLoaded(value: counter.value));
    } catch (e) {
      emit(CounterError(message: e.toString()));
    }
  }

  void _onResetCounter(ResetCounterEvent event, Emitter<CounterState> emit) {
    try {
      emit(CounterLoading());
      final CounterEntity counter = resetCounter(event.value);
      emit(CounterLoaded(value: counter.value));
    } catch (e) {
      emit(CounterError(message: e.toString()));
    }
  }
}
