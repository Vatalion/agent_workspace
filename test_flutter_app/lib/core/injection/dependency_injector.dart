import '../../features/counter/data/repositories/counter_repository_impl.dart';
import '../../features/counter/domain/repositories/counter_repository.dart';
import '../../features/counter/domain/usecases/get_counter_usecase.dart';
import '../../features/counter/domain/usecases/increment_counter_usecase.dart';
import '../../features/counter/domain/usecases/reset_counter_usecase.dart';
import '../../features/counter/presentation/bloc/counter_bloc.dart';

class DependencyInjector {
  // Singleton pattern
  static final DependencyInjector _instance = DependencyInjector._internal();
  factory DependencyInjector() => _instance;
  DependencyInjector._internal();

  // Lazy initialization of repositories
  CounterRepository? _counterRepository;
  CounterRepository get counterRepository {
    _counterRepository ??= CounterRepositoryImpl();
    return _counterRepository!;
  }

  // Lazy initialization of use cases
  GetCounterUseCase? _getCounterUseCase;
  GetCounterUseCase get getCounterUseCase {
    _getCounterUseCase ??= GetCounterUseCase(repository: counterRepository);
    return _getCounterUseCase!;
  }

  IncrementCounterUseCase? _incrementCounterUseCase;
  IncrementCounterUseCase get incrementCounterUseCase {
    _incrementCounterUseCase ??= IncrementCounterUseCase(
      repository: counterRepository,
    );
    return _incrementCounterUseCase!;
  }

  ResetCounterUseCase? _resetCounterUseCase;
  ResetCounterUseCase get resetCounterUseCase {
    _resetCounterUseCase ??= ResetCounterUseCase(repository: counterRepository);
    return _resetCounterUseCase!;
  }

  // Factory method for creating BLoCs
  CounterBloc createCounterBloc() {
    return CounterBloc.create(
      getCounterUseCase,
      incrementCounterUseCase,
      resetCounterUseCase,
    );
  }
}
