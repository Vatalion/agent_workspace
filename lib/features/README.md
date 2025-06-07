# Feature-Based Architecture

This directory follows a clean architecture approach with features organized as isolated modules.

## Structure

Each feature follows this structure:

```
feature_name/
  ├── presentation/
  │   ├── screens/     # UI screens/pages
  │   ├── widgets/     # Feature-specific widgets
  │   └── bloc/        # State management (BLoC/Cubit)
  ├── domain/
  │   ├── entities/    # Business objects
  │   └── usecases/    # Business logic
  └── data/
      ├── models/      # Data transfer objects
      └── repositories/ # Data access layer
```

## Guidelines

1. **Feature Isolation**: Each feature should be self-contained
2. **BLoC Location**: All BLoCs must be placed in the presentation/bloc directory
3. **Clean Architecture**: Domain layer should not depend on presentation or data layers
4. **State Management**: Each main screen requires a dedicated BLoC/Cubit
