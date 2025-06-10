# Project Rules - ENTERPRISE MODE


## Enterprise Features
















## Development Guidelines


{{#if (or (eq category 'FILE_PRACTICES') (eq category 'TESTING_REQUIREMENTS') (eq category 'BACKUP_STRATEGY'))}}
### Backup Strategy (AUTOMATIC)
- **Every Change**: Git commit with descriptive message
- **Major Features**: Create feature branches
- **Before Refactoring**: Create backup branch
- **Daily**: Push to remote repository



{{/if}}


## Architecture & Design


{{#if (or (eq category 'SOLID_PRINCIPLES') (eq category 'CLEAN_ARCHITECTURE'))}}
### SOLID Principles Implementation (REQUIRED)
1. **Single Responsibility**: One class = one responsibility
2. **Open/Closed**: Open for extension, closed for modification
3. **Liskov Substitution**: Derived classes must be substitutable
4. **Interface Segregation**: No client forced to depend on unused interfaces
5. **Dependency Inversion**: Depend on abstractions, not concretions



{{#if (or (eq category 'SOLID_PRINCIPLES') (eq category 'CLEAN_ARCHITECTURE'))}}
### Clean Architecture (ENFORCED)
```
lib/
├── core/               # Core business logic, entities, interfaces
├── data/              # Data layer (repositories, data sources, models)
├── presentation/      # UI layer (pages, widgets, state management)
└── domain/           # Domain layer (use cases, entities, repositories)
```



{{#if (or (eq category 'SOLID_PRINCIPLES') (eq category 'CLEAN_ARCHITECTURE'))}}
### State Management Rules
- **Small Apps**: Provider or setState
- **Medium Apps**: Riverpod or Bloc
- **Large Apps**: Bloc with Clean Architecture
- **NEVER**: Global variables for state



{{#if (or (eq category 'SOLID_PRINCIPLES') (eq category 'CLEAN_ARCHITECTURE'))}}
### Enterprise Code Preferences
- Design for scalability and maintainability
- Implement comprehensive error handling
- Use advanced patterns and architectures
- Focus on enterprise-grade solutions
- Prioritize robustness and reliability
- Follow Flutter best practices and Clean Architecture
- Maintain high test coverage and documentation



{{#if (or (eq category 'SOLID_PRINCIPLES') (eq category 'CLEAN_ARCHITECTURE'))}}
### Flutter Development - Core Principles
- **SOLID**: Single responsibility, dependency injection, clean interfaces
- **Pure Functions**: Same input = same output, no side effects
- **Clean Architecture**: Domain-agnostic business logic, clear layer boundaries



{{/if}}