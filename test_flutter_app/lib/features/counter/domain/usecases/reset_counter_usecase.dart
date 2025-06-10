import '../entities/counter_entity.dart';
import '../repositories/counter_repository.dart';

class ResetCounterUseCase {
  final CounterRepository repository;

  ResetCounterUseCase({required this.repository});

  CounterEntity call([int value = 0]) {
    return repository.resetCounter(value);
  }
}
