import '../entities/counter_entity.dart';

// Repository interface in the domain layer
abstract class CounterRepository {
  // Get the current counter value
  CounterEntity getCounter();

  // Increment the counter by a specified amount
  CounterEntity incrementCounter([int amount = 1]);

  // Reset the counter to zero or a specified value
  CounterEntity resetCounter([int value = 0]);
}
