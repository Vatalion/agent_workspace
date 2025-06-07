import '../entities/counter_entity.dart';
import '../repositories/counter_repository.dart';

class GetCounterUseCase {
  final CounterRepository repository;

  GetCounterUseCase({required this.repository});

  CounterEntity call() {
    return repository.getCounter();
  }
}
