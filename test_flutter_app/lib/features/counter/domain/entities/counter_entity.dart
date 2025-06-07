// Counter entity representing the domain state
class CounterEntity {
  final int value;

  const CounterEntity({this.value = 0});

  // Creates a copy of the entity with specified changes
  CounterEntity copyWith({int? value}) {
    return CounterEntity(value: value ?? this.value);
  }
}
