import '../../domain/entities/counter_entity.dart';
import '../../domain/repositories/counter_repository.dart';
import '../models/counter_model.dart';

class CounterRepositoryImpl implements CounterRepository {
  // In-memory storage for counter value
  CounterModel _counter = const CounterModel();

  @override
  CounterEntity getCounter() {
    return _counter.toEntity();
  }

  @override
  CounterEntity incrementCounter([int amount = 1]) {
    _counter = _counter.copyWith(value: _counter.value + amount);
    return _counter.toEntity();
  }

  @override
  CounterEntity resetCounter([int value = 0]) {
    _counter = CounterModel(value: value);
    return _counter.toEntity();
  }
}
