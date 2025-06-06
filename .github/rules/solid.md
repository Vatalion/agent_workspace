# SOLID Principles

## Overview

This document describes the SOLID principles for object-oriented design and how to apply them in your codebase.

## Single Responsibility Principle (S)

### Core Concept
A class or module should have one, and only one, reason to change.

### Guidelines
- Each class should focus on a single concern
- If a class has multiple responsibilities, split it into separate classes
- Consider what would cause the class to change; there should be only one reason

### Examples
- Separate data models from business logic
- Separate UI components from state management
- Separate network requests from data processing

## Open/Closed Principle (O)

### Core Concept
Software entities should be open for extension but closed for modification.

### Guidelines
- Design classes that can be extended without modifying the original code
- Use interfaces and abstract classes to define stable contracts
- Implement new functionality by creating new classes that implement or extend existing ones

### Examples
- Use plugins or strategy patterns for extensible behavior
- Define stable interfaces for core functionality
- Use composition over inheritance when appropriate

## Liskov Substitution Principle (L)

### Core Concept
Objects of a superclass should be replaceable with objects of a subclass without affecting the functionality of the program.

### Guidelines
- Subclasses should maintain the behavior expected by clients of the superclass
- Override methods should accept the same parameter types as the superclass method
- Override methods should return subtypes of the superclass method's return type
- Override methods should not throw new exceptions unless they are subtypes of exceptions thrown by the superclass method

### Examples
- Ensure that specific implementations maintain the contract of their interfaces
- Test substitutability by using base class references with derived class instances
- Avoid "refusing" to implement interface methods with exceptions or no-ops

## Interface Segregation Principle (I)

### Core Concept
Clients should not be forced to depend on interfaces they do not use.

### Guidelines
- Create specific, focused interfaces rather than large, general-purpose ones
- Split large interfaces into smaller, more specific ones
- Design interfaces based on client needs, not implementation details

### Examples
- Define role-specific interfaces (e.g., Readable, Writable) instead of a single interface (e.g., Storage)
- Allow clients to depend only on the methods they actually use
- Prefer multiple small interfaces over a few large ones

## Dependency Inversion Principle (D)

### Core Concept
High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions.

### Guidelines
- Depend on abstractions (interfaces or abstract classes), not concrete implementations
- Define interfaces in the high-level modules that are implemented by low-level modules
- Use dependency injection to provide implementations at runtime

### Examples
- Use service interfaces defined by business logic, implemented by infrastructure code
- Inject repositories, APIs, and services rather than instantiating them directly
- Define domain models independent of persistence or UI concerns
