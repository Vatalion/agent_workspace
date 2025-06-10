# GitHub Copilot Instructions - ENTERPRISE MODE

## CRITICAL REQUIREMENTS
⚠️  **MANDATORY**: Always work with FRESH project structure information  
📍 **READ FIRST**: `.github/PROJECT_MAP.md` before making ANY changes  
🔄 **UPDATE ALWAYS**: `./update_project_map.sh` after ANY file/folder modifications  

## MANDATORY WORKFLOW - NEVER SKIP STEPS
1. **READ**: `README.md`
2. **READ**: `.github/project-rules.md`  
3. **READ**: `.github/PROJECT_MAP.md` (current structure snapshot)
4. **CHECK**: `.tasks/` folder (all files)
5. **UPDATE**: Project map for fresh structure: `./update_project_map.sh`
6. **VERIFY**: Project structure compliance against map and rules
7. **ASSESS**: Complexity: E(5-15min|≤3files) | M(15-60min|≤10files) | H(60min+|unlimited)
8. **CREATE**: Task file in `.tasks/`
9. **FOLLOW**: File placement rules (use `PROJECT_MAP.md` as reference)
10. **VALIDATE**: Test after each atomic change
11. **VERIFY**: Final validation before task completion  
12. **UPDATE**: Project map after ANY file/folder changes: `./update_project_map.sh`
13. **CLEAN**: Remove unnecessary artifacts
14. **CHECK**: Ensure nothing is left unhandled (NEVER delete referenced files)

## Current System Mode: ENTERPRISE
This project operates in **Enterprise Mode** - combining Flutter development best practices with comprehensive task management for large-scale projects (50+ hours).

## Enterprise Features
- Epic-scale task orchestration (10-500+ hours)
- Priority interrupt system with graceful suspension
- Cross-machine synchronization with automatic git branching
- Real-time monitoring and auto-save functionality
- Milestone tracking with automatic checkpointing

## Task Management Structure (Enterprise)
```
.tasks/
├── system/              # Core system files (monitoring, sync, priorities)
├── epics/              # Large-scale task orchestration
├── 1_planning/         # Task planning and milestone definition
├── 2_review/           # Task review and approval workflow
├── 3_execution/        # Active task execution with interrupt handling
├── 4_completion/       # Completion tracking and reporting
└── cross_machine/      # Multi-machine synchronization
```

## Available Commands
- `task-management.sh` - Main enterprise orchestrator
- `massive_task_orchestrator.sh` - Epic task management
- `interrupt_handler.sh` - Priority interrupt system
- `auto_save.sh` - Automatic state preservation
- `sync_check.sh` - Cross-machine synchronization

## Enterprise Features
- **Epic Task Orchestration**: Handle 10-500+ hour projects with automatic breakdown
- **Priority Interrupt System**: Graceful task suspension for urgent items
- **Cross-Machine Sync**: Automatic git branching and state synchronization
- **Auto-Save**: 15-minute interval snapshots with state preservation
- **Real-Time Monitoring**: Daemon processes for continuous oversight
- **Milestone Tracking**: Automatic checkpointing and progress reporting

## Flutter Development Workflow (MANDATORY)

### SOLID Principles Implementation (REQUIRED)
1. **Single Responsibility**: One class = one responsibility
2. **Open/Closed**: Open for extension, closed for modification
3. **Liskov Substitution**: Derived classes must be substitutable
4. **Interface Segregation**: No client forced to depend on unused interfaces
5. **Dependency Inversion**: Depend on abstractions, not concretions

### Feature-Layered Clean Architecture (ENFORCED)

## 🏗️ Feature-Layered Clean Architecture

### 📁 Project Structure
```
lib/
├── features/                    # Feature-based organization
│   ├── user_management/
│   │   ├── domain/             # Pure business logic (innermost)
│   │   │   ├── entities/       # Business objects (User, Profile)
│   │   │   ├── repositories/   # Abstract interfaces only
│   │   │   └── use_cases/      # Business rules & orchestration
│   │   ├── data/              # Data access layer
│   │   │   ├── repositories/   # Concrete repository implementations
│   │   │   ├── data_sources/   # Remote/Local data sources
│   │   │   └── models/        # Data transfer objects (DTOs)
│   │   └── presentation/      # UI layer (outermost)
│   │       ├── pages/         # Screen controllers
│   │       ├── widgets/       # UI components
│   │       └── state/         # State management (BLoC/Provider)
│   └── product_catalog/       # Another feature
│       ├── domain/
│       ├── data/
│       └── presentation/
├── shared/                     # Cross-cutting concerns
│   ├── core/                  # App-wide foundations
│   │   ├── error/            # Error handling
│   │   ├── network/          # HTTP client setup
│   │   └── constants/        # App constants
│   ├── infrastructure/        # External dependencies
│   │   ├── database/         # Local storage
│   │   └── services/         # Third-party integrations
│   └── utils/                # Helper functions
└── main.dart                  # App entry point
```

### 🔄 Layer Dependency Rules
**CRITICAL**: Dependencies flow INWARD ONLY
- **Presentation** → **Domain** (via use cases)
- **Data** → **Domain** (implements interfaces)
- **Domain** → NO external dependencies

### 🎯 Layer Responsibilities & Wrappers

#### 1. Domain Layer (Core)
- **Entities**: Pure business objects with no dependencies
- **Repositories**: Abstract contracts (interfaces only)
- **Use Cases**: Business logic orchestration, return `Result<T>`

#### 2. Data Layer (Infrastructure)  
- **Models/DTOs**: Data transfer objects that convert to entities
- **Repository Implementations**: Concrete implementations returning entities
- **Data Sources**: External API/database access returning DTOs

#### 3. Presentation Layer (UI)
- **State Management**: Handle UI state, consume use cases
- **Pages**: Screen controllers using BLoC/Provider
- **Widgets**: Pure UI components receiving entities

### 🛡️ Result Wrapper Pattern
**MANDATORY**: All operations return `Result<T>` for proper error handling

### ✅ Validation Rules
1. **Feature Independence**: Each feature folder is self-contained
2. **Layer Separation**: Domain never imports from data/presentation  
3. **Entity Purity**: Domain entities have no external dependencies
4. **Repository Pattern**: Data layer implements domain contracts
5. **Result Wrapping**: All async operations return `Result<T>`
6. **Error Handling**: Centralized error types in shared/core

### 🚫 Forbidden Patterns
- Direct database calls from use cases
- UI widgets importing data models
- Entities depending on external packages
- Repositories returning DTOs instead of entities

### Mandatory File Practices
- **NO SINGLE-FILE MONSTERS**: Max 200 lines per file
- **EXTRACT**: Move reusable code to `lib/shared/`
- **SEPARATE**: Business logic from UI components
- **ORGANIZE**: Related files in appropriate subdirectories

### Testing Requirements (NON-NEGOTIABLE)
- **Unit Tests**: All business logic classes
- **Widget Tests**: All custom widgets
- **Integration Tests**: Critical user flows
- **Coverage**: Minimum 80% for core functionality

### Backup Strategy (AUTOMATIC)
- **Every Change**: Git commit with descriptive message
- **Major Features**: Create feature branches
- **Before Refactoring**: Create backup branch
- **Daily**: Push to remote repository

### State Management Rules
- **Small Apps**: Provider or setState
- **Medium Apps**: Riverpod or Bloc
- **Large Apps**: Bloc with Clean Architecture
- **NEVER**: Global variables for state

### Performance Guidelines
- **Lazy Loading**: Implement for lists and heavy widgets
- **Image Optimization**: Use appropriate formats and caching
- **Memory Management**: Dispose controllers and streams
- **Build Optimization**: Use const constructors when possible

## Enterprise Code Preferences
- Design for scalability and maintainability
- Implement comprehensive error handling
- Use advanced patterns and architectures
- Focus on enterprise-grade solutions
- Prioritize robustness and reliability
- Follow Flutter best practices and Clean Architecture
- Maintain high test coverage and documentation

## Mode Switching
To simplify for basic tasks: `./mode-manager.sh simplified`

---
*Enterprise Mode Active - Full Flutter + Task Management feature set available*
