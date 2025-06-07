# Project Rules

## Core Principles
- **SOLID**: Single responsibility, dependency injection, clean interfaces
- **Pure Functions**: Same input = same output, no side effects
- **Clean Architecture**: Domain-agnostic business logic, clear layer boundaries
- **Feature-Based Structure**: Each feature must be completely self-contained
- **Consistent Organization**: Proper file placement based on responsibility

## SOLID Principles Implementation
- **Single Responsibility (S)**: One reason to change per class | Separate data models from business logic | UI ≠ state management
- **Open/Closed (O)**: Open for extension, closed for modification | Use interfaces for stable contracts | Extend, don't modify
- **Liskov Substitution (L)**: Subclasses replaceable with superclass | Maintain expected behavior | Preserve parameter/return types
- **Interface Segregation (I)**: Specific focused interfaces | Role-based (Readable/Writable) vs monolithic (Storage)
- **Dependency Inversion (D)**: Depend on abstractions, not concretions | High-level defines interfaces | Domain-independent models

## Function Guidelines
### Pure Functions Requirements
- **SAME INPUT = SAME OUTPUT**: Functions return consistent output for same input
- **NO SIDE EFFECTS**: Functions don't modify state outside their scope
- **NO MUTATION**: Don't modify input parameters
- **PREDICTABLE**: Behavior should be consistent and expected

### Function Standards
- **SIZE LIMIT**: Maximum 20 lines per function
- **SINGLE PURPOSE**: Each function does exactly one thing well
- **EARLY RETURN**: Return early to avoid deep nesting
- **VALIDATION**: Check inputs at function beginning
- **COMPOSITION**: Build complex functions by composing simpler ones
- **DEFAULT VALUES**: Provide sensible defaults for optional parameters
- **COMPOSITION**: Build complex functions by composing simpler ones

### Services for Side Effects
- **SEPARATION**: Use services or repositories for I/O and side effects
- **TESTABILITY**: Pure functions are easier to test
- **DEPENDENCY INJECTION**: Use DI for required dependencies

## Backup Strategy - DUAL SYSTEM
### Automatic Backup
- **SYSTEM**: Editor creates `.history/{path}/{filename}_{timestamp}.ext` on changes
- **TRIGGER**: Every file modification automatically
- **LOCATION**: `.history/` folder structure mirrors source

### Manual Backup
- **SYSTEM**: Place original files in `.legacy/{path}/{filename}.dart` during refactoring
- **TRIGGER**: Before major refactoring operations
- **LOCATION**: `.legacy/` folder preserves original implementations

### Backup Requirements
- **VERIFY**: Ensure both `.history/` and `.legacy/` folders exist
- **PRESERVE**: Do not delete files from either backup location
- **RELY ON**: Appropriate backup system based on situation

## Testing Requirements
### Coverage by Complexity
- **EASY (E)**: Basic validation only
- **MEDIUM (M)**: Unit + Widget tests required
- **HIGH (H)**: Unit + Widget + Integration tests required

### Test Types & Focus Areas
- **UNIT TESTS**: Focus on data/ layer business logic, pure functions, domain entities
- **WIDGET TESTS**: Test presentation/ layer components, BLoC interactions, UI behavior
- **INTEGRATION TESTS**: Cover auth flows, navigation, end-to-end user journeys
- **COVERAGE TARGET**: 70% critical paths minimum, 100% for business logic

### Testing Standards & Quality Gates
- **COMPREHENSIVE**: New functionality must include appropriate test coverage
- **REGRESSION**: Tests must prevent regression of existing functionality
- **PERFORMANCE**: Include performance tests for critical paths
- **BUILD GATES**: All tests must pass before any commit
- **REQUIRED TESTING**: M/H complexity tasks MUST include comprehensive tests
- **TEST ORGANIZATION**: Tests mirror source structure (unit tests for domain, widget tests for presentation)

## PERFORMANCE & QUALITY GATES
### Performance Benchmarks - MANDATORY COMPLIANCE
- **STARTUP TIME**: <2s cold start (must be maintained)
- **NAVIGATION**: <300ms between screens (critical user experience)
- **MEMORY USAGE**: <100MB baseline (monitor growth)
- **APP SIZE**: Track and control app size growth
- **FRAME RATES**: Maintain 60fps during normal operation
- **CRASH RATE**: <1% crash rate in production

### Quality Gates - ALL MUST PASS
- **BUILD VALIDATION**: iOS/Android builds must pass completely
- **TEST COVERAGE**: 70% critical paths minimum coverage
- **ANALYSIS**: `flutter analyze` must pass with zero errors
- **PERFORMANCE**: Frame rate profiling for complex screens
- **MEMORY**: Memory leak detection and profiling
- **CRASH TRACKING**: Implement comprehensive crash tracking

### Monitoring Requirements
- **CONTINUOUS**: Crash tracking + frame rates + memory profiling
- **REGRESSION**: Tests to prevent performance regression
- **BENCHMARKING**: Regular performance benchmarking against targets
- **ALERTING**: Automated alerts for performance degradation

## Refactoring Guidelines
### Safety-First Approach
- **BACKUP**: Editor auto-creates `.history/{path}/{filename}_{timestamp}.ext` backups
- **PRESERVE**: Move original files to `.legacy/{path}/{filename}.dart`
- **SUFFIX**: Create new files with `_refactored` or `_clean` suffix
- **GRADUAL**: Switch via imports gradually
- **INCREMENTAL**: Migration with full testing between steps
- **NEVER**: Delete originals until 100% confident in replacement

### Naming Conventions
- **`_refactored.dart`**: Improved version with same interface
- **`_clean.dart`**: Complete rewrite with simplified architecture
- **`.create()`**: Factory method standard for proper dependency injection

### Clean Architecture Migration Steps
1. **Analysis & Foundation**: Assess dependencies and identify domain entities
2. **Domain Layer Creation**: Implement use cases and entities
3. **Screen Usage Migration**: Create screen-specific state management
4. **Navigation Integration**: Update navigation to use refactored components
5. **Legacy Cleanup**: Remove references to original implementation

### Implementation Strategy
1. **IDENTIFY**: Small, self-contained unit
2. **CREATE**: New file with appropriate suffix
3. **IMPLEMENT**: Refactored version
4. **TEST**: Thoroughly validate functionality
5. **UPDATE**: Import statements
6. **REPEAT**: For next unit

## Git Workflow
### Error Recovery & Commits
- **BACKUP**: Editor automatically creates `.history/` snapshots
- **ROLLBACK**: `git stash` on breaks
- **VALIDATION**: `flutter analyze && flutter build ios --simulator`
- **ATOMIC**: Each commit = deployable state
- **PRE-COMMIT**: Analyze + test required
- **RECOVERY**: Use `.history/` files for catastrophic failures

### Branch Strategy
- **MAIN**: Production only
- **DEVELOP**: Integration branch
- **FEATURE**: Short-lived feature branches
- **HOTFIX**: Critical bug fixes

### Dependency & Security
- **PACKAGES**: Pin critical packages
- **SCANS**: Regular vulnerability scans
- **STORAGE**: Secure token storage
- **COMPLIANCE**: Privacy compliance
- **VALIDATION**: Input validation

## Efficiency Guidelines
### Parallel Execution Strategy
- **IDENTIFY**: Independent operations that can run simultaneously
- **BATCH**: Group similar changes across multiple files for efficiency
- **EXECUTE**: Multiple independent operations in parallel when possible
- **SEQUENCE**: Dependent operations must follow proper prerequisites

### Operation Classification
- **INDEPENDENT**: Can execute in parallel (formatting, documentation updates)
- **DEPENDENT**: Require sequential execution (model changes before view implementation)
- **HYBRID**: Partially dependent operations with independent subtasks

### Maximizing Development Throughput
- **ANALYZE FIRST**: Identify critical paths and dependencies before starting
- **GROUP OPERATIONS**: Batch similar operations for maximum efficiency
- **TEST INCREMENTALLY**: Validate each group of changes before proceeding
- **OPTIMIZE SEQUENCE**: Prioritize operations that unblock other tasks
- **MULTI-TASK**: Perform multiple independent operations simultaneously when possible

### File Management Efficiency  
- **TEMPORARY FILES**: Use .temp/ folder for drafts/experimental code
- **HISTORY SNAPSHOTS**: Leverage .history/{path}/{filename}_{timestamp}.ext for recovery
- **CATASTROPHIC RECOVERY**: Use .history/ when workspace breaks completely
- **STRUCTURED CLEANUP**: Remove temporary files after successful integration

## Recovery Procedures
### Recovery Decision Matrix
| Situation | Primary Source | Secondary Source | Action |
|-----------|----------------|------------------|---------|
| Accidental edit/corruption | `.history/` | Git stash | Restore recent auto-backup |
| Refactoring gone wrong | `.legacy/` | `.history/` | Restore original pre-refactor |
| Build breaking | Git reset | `.history/` | Reset to last working commit |
| Complete disaster | `.legacy/` + `.history/` | Git history | Manual reconstruction |

### Recovery Levels (Priority Order)
1. **IMMEDIATE**: `git stash` - Quick rollback of current changes
2. **RECENT CORRUPTION**: Restore from `.history/{path}/{filename}_{timestamp}.ext`
3. **REFACTORING REVERT**: Restore from `.legacy/{path}/{filename}.dart`
4. **RESET TO COMMIT**: Git reset to last known good commit
5. **CATASTROPHIC**: Combined restore from `.legacy/` + `.history/` + manual cleanup

### Recovery Commands
```bash
# Level 1: Quick stash (immediate)
git stash push -m "rollback: broken changes"

# Level 2: Restore from .history/ (corruption/accidental changes)
ls -la .history/lib/path/ | grep filename | tail -1
cp .history/lib/path/file_20250606_143022.dart lib/path/file.dart

# Level 3: Restore from .legacy/ (revert refactoring)
cp .legacy/lib/path/original_file.dart lib/path/file.dart

# Level 4: Reset to last commit  
git reset --hard HEAD~1

# Level 5: Find all backup sources
find .history/ -name "*filename*" -type f | sort
find .legacy/ -name "*filename*" -type f | sort
```

### Validation After Recovery
- **VERIFY**: `flutter analyze` (no errors)
- **BUILD**: `flutter build ios --simulator` (successful)
- **TEST**: Run relevant tests if available
- **CONFIRM**: Application starts without crashes
- **COMMIT**: Create checkpoint after successful recovery

## Project Structure Management
### Directory Structure Rules - Feature-Layered Architecture
```
lib/
├── core/                    # Shared infrastructure
│   ├── constants/          # App-wide constants
│   ├── exceptions/         # Custom exceptions
│   ├── extensions/         # Dart extensions
│   └── utils/             # Utility classes
├── shared/                 # Shared across features
│   ├── services/          # Cross-cutting services
│   └── widgets/           # Reusable UI components
├── features/              # Feature modules - EACH FEATURE SEPARATED
│   └── [feature_name]/
│       ├── data/
│       │   ├── datasources/    # External data sources
│       │   ├── models/         # Data models (JSON serialization)
│       │   └── repositories/   # Repository implementations
│       ├── domain/
│       │   ├── entities/       # Business entities
│       │   ├── repositories/   # Repository contracts
│       │   └── usecases/      # Business logic
│       └── presentation/
│           ├── bloc/          # State management (BLoC/Cubit) - MAIN SCREENS HAVE OWN BLOCS
│           ├── screens/       # Screen widgets
│           ├── widgets/       # Feature-specific widgets
│           └── templates/     # Screen templates
└── main.dart
```

### Clean Architecture Feature Separation
- **FEATURE ISOLATION**: Each feature must be completely self-contained
- **MAIN SCREEN BLOCS**: ALL main screens and important secondary screens MUST have dedicated BLoCs
- **BLoC LOCATION**: `features/[feature]/presentation/bloc/` - NEVER beside screens
- **STATE MANAGEMENT**: Each screen manages state through dedicated BLoCs, not shared state
- **DOMAIN INDEPENDENCE**: Business logic never depends on presentation or data layers
- **NO CROSS-FEATURE**: Features only communicate through shared domain contracts

### BLoC/State Management Protocol
- **MANDATORY BLOCS**: Main screens REQUIRE dedicated BLoCs in correct location
- **SECONDARY SCREENS**: Important secondary screens also need dedicated BLoCs  
- **FACTORY PATTERN**: Use `.create()` factory methods for proper BLoC instantiation
- **PROVIDER WRAPPING**: Always wrap screens in BlocProvider for state management
- **STATE AGGREGATION**: BLoCs combine multiple domain entities for screen-specific state
- **DEPENDENCY INJECTION**: Proper DI through BLoC constructors and .create() methods

## FILE PLACEMENT RULES - NEVER DEVIATE
### Feature-Based Structure
- **BLoC/Cubit**: `features/[feature]/presentation/bloc/` - NEVER beside screens
- **Screens/Pages**: `features/[feature]/presentation/screens/`
- **Widgets**: `features/[feature]/presentation/widgets/` OR `shared/widgets/`
- **Templates**: `features/[feature]/presentation/templates/`
- **Models**: `features/[feature]/data/models/`
- **Entities**: `features/[feature]/domain/entities/`
- **Repositories**: `features/[feature]/data/repositories/`
- **Use Cases**: `features/[feature]/domain/usecases/`

### Shared Infrastructure
- **Services**: `shared/services/` OR `features/[feature]/data/datasources/`
- **Constants**: `core/constants/`
- **Extensions**: `core/extensions/`
- **Utils**: `core/utils/`
- **Exceptions**: `core/exceptions/`
- **Unstructured Classes**: `core/utils/` OR create feature