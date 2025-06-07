import '../entities/counter_entity.dart';
import '../repositories/counter_repository.dart';

class IncrementCounterUseCase {
  final CounterRepository repository;

  IncrementCounterUseCase({required this.repository});

  CounterEntity call([int amount = 1]) {
    return repository.incrementCounter(amount);
  }
}
