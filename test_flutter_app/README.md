# Flutter Debug Test App - Feature-Based Architecture

This Flutter application demonstrates clean architecture principles with a feature-based organization, specifically designed for testing error scenarios.

## Feature-Based Structure

This app is organized following clean architecture principles:

```
lib/
  ├── features/
  │   └── counter/
  │       ├── presentation/
  │       │   ├── screens/     # UI screens/pages
  │       │   ├── widgets/     # Feature-specific widgets
  │       │   └── bloc/        # State management (BLoC)
  │       ├── domain/
  │       │   ├── entities/    # Business objects
  │       │   ├── repositories/ # Repository interfaces
  │       │   └── usecases/    # Business logic
  │       └── data/
  │           ├── models/      # Data transfer objects
  │           └── repositories/ # Repository implementations
  ├── core/
  │   └── injection/           # Dependency injection
  └── main.dart
```

## Getting Started

This project demonstrates proper architecture and intentional error scenarios for testing.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
