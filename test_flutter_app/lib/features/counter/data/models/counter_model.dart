import 'package:equatable/equatable.dart';

import '../../domain/entities/counter_entity.dart';

// Data model for Counter that extends the CounterEntity
class CounterModel extends Equatable {
  final int value;

  const CounterModel({this.value = 0});

  // Convert from domain entity to model
  factory CounterModel.fromEntity(CounterEntity entity) {
    return CounterModel(value: entity.value);
  }

  // Convert to domain entity
  CounterEntity toEntity() {
    return CounterEntity(value: value);
  }

  // Creates a copy of the model with specified changes
  CounterModel copyWith({int? value}) {
    return CounterModel(value: value ?? this.value);
  }

  @override
  List<Object?> get props => [value];
}
