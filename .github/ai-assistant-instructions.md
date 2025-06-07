Stomach# AI ASSISTANT INSTRUCTIONS
**Universal Guidelines for Any AI Coding Assistant: GitHub Copilot, Cursor, Windsurf, Claude Dev, etc.**

## 🤖 **UNIVERSAL AI COMPATIBILITY**
These instructions work with **ANY AI coding assistant**:
- ✅ **GitHub Copilot** (VS Code, JetBrains, etc.)
- ✅ **Cursor** (AI-first code editor)
- ✅ **Windsurf** (Codeium's AI editor)
- ✅ **Claude Dev** (VS Code extension)
- ✅ **Aider** (Command line AI programmer)
- ✅ **Continue** (VS Code AI assistant)
- ✅ **Any other AI coding tool**

### Platform-Agnostic Design
- **📁 File Structure**: Standard directory organization works everywhere
- **📜 Validation Scripts**: Pure bash scripts, no IDE dependencies
- **📖 Documentation**: Markdown files readable by any tool
- **🔧 Build System**: Standard Flutter/npm/bash commands
- **🧪 Testing**: Framework-agnostic testing approach

## CRITICAL REQUIREMENTS
⚠️  **MANDATORY**: Always work with FRESH project structure information  
📍 **READ FIRST**: `.github/PROJECT_MAP.md` before making ANY changes  
🔄 **UPDATE ALWAYS**: `./.github/update_project_map.sh` after ANY file/folder modifications  

## ⚠️ .GITHUB/ FOLDER SECURITY PROTOCOL - TASK MANAGEMENT CORE
🔒 **MAXIMUM SECURITY ZONE**: The `.github/` folder is the **CENTRAL CONTROL HUB** for all project management business logic

### 🛡️ **MANDATORY PRE-CREATE VALIDATION** - NEVER SKIP
**BEFORE creating ANY file in `.github/`, ALWAYS ask these questions:**
1. ❓ **Is this a task management script?** (If NO → `docs/` or `scripts/`)
2. ❓ **Is this documentation?** (If YES → `docs/task-management/`)
3. ❓ **Is this a config/data file?** (If YES → `.tasks/system/`)
4. ❓ **Is this a utility script?** (If YES → `scripts/`)
5. ❓ **Is this project documentation?** (If YES → `docs/`)

### 📋 **ALLOWED ONLY (MAXIMUM 7 FILES + 1 SUBDIRECTORY)**: 
   - `copilot-instructions.md` (this file)  
   - `project-rules.md` (project rules)
   - `PROJECT_MAP.md` (structure snapshot)
   - `task-management.sh` (main orchestration entry point)
   - `setup_task_system.sh` (system initialization)
   - `update_project_map.sh` (structure automation)
   - `validate_security.sh` (security validation enforcement)
   - `task-management/` (secure business logic subdirectory - PERMANENT)
     - `scripts/` (core orchestration and business logic scripts)
     - `logs/` (system operation logs and monitoring)

### 🚨 **ABSOLUTELY FORBIDDEN** - IMMEDIATE VIOLATION
🚫 **ANY .md files except the 3 allowed above**
🚫 **ANY documentation files** (ALL go to `docs/`)
🚫 **ANY overview/summary files** (ALL go to `docs/`)
🚫 **ANY analysis files** (ALL go to `docs/analysis/`)
🚫 **ANY utility scripts** (ALL go to `scripts/`)
🚫 **ANY data/config files** (ALL go to `.tasks/system/`)
🚫 **ANY non-task-management business logic**

### 🔐 **VIOLATION PREVENTION PROTOCOL**
**STEP 1**: Before creating ANY file, check current `.github/` contents
**STEP 2**: If file count > 7 files + 1 subdirectory → VIOLATION
**STEP 3**: If filename not in allowed list → FIND CORRECT LOCATION
**STEP 4**: If unsure → DEFAULT to `docs/` or `.tasks/system/`

📊 **DATA LOCATION**: All task data goes to `.tasks/` folder (current.json, ACTIVE_TASK.md, epics/, completed/)
🛡️ **PROTECTION**: This folder contains ONLY task management business logic for complexity assessment, time estimation, system orchestration, and automated task processing
🔐 **PERMANENCE**: All task management logic stays in `.github/` forever - NEVER move to external locations

## MANDATORY WORKFLOW - NEVER SKIP STEPS
1. **READ**: `README.md`
2. **READ**: `.github/project-rules.md`  
3. **READ**: `.github/PROJECT_MAP.md` (current structure snapshot)
4. **CHECK**: `.github/` folder (all task management files)
5. **🚨 VALIDATE GITHUB SECURITY**: Before creating ANY file, check `.github/` folder security protocol above
6. **UPDATE**: Project map for fresh structure: `./.github/update_project_map.sh`
7. **VERIFY**: Project structure compliance against map and rules
8. **ASSESS**: Complexity: E(5-15min|≤3files) | M(15-60min|≤10files) | H(60min+|unlimited)
9. **UPDATE**: Task state in `.github/current.json` and `.github/ACTIVE_TASK.md`
10. **🎯 FOLDER CHECK**: BEFORE creating ANY file, determine correct destination:
   - **Task Management Business Logic** → `.github/` folder (ONLY if in allowed list)
   - **Temporary/Status files** → `.temp/` folder  
   - **Documentation** → `docs/` folder
   - **Scripts** → `scripts/` folder
   - **Data/Config** → `.tasks/system/` folder
   - **NEVER** create files in root unless essential project files
11. **FOLLOW**: File placement rules (use `.github/PROJECT_MAP.md` as reference)
12. **VALIDATE**: Test after each atomic change
13. **VERIFY**: Final validation before task completion  
14. **UPDATE**: Project map after ANY file/folder changes: `./.github/update_project_map.sh`
15. **CLEAN**: Remove unnecessary artifacts
16. **CHECK**: Ensure nothing is left unhandled (NEVER delete referenced files)

## PROJECT STRUCTURE AWARENESS
### Why Fresh Structure is VITAL
- **CONSISTENCY**: Outdated structure info leads to wrong file placement
- **PROGRESS**: Understanding current state prevents rework and conflicts  
- **SAFETY**: Knowing what exists prevents accidental overwrites
- **EFFICIENCY**: Quick reference eliminates time spent exploring directories
- **COMPLIANCE**: Map shows structure violations that need fixing
- **CONTEXT**: Essential for making informed architectural decisions

### Structure Update Triggers
- **CREATED**: New features, screens, or components
- **MOVED**: Files between directories
- **REFACTORED**: File organization
- **ADDED**: New layers or modules
- **REMOVED**: Obsolete code
- **CHANGED**: Directory structure

### Usage Protocol
- **BEFORE ANY WORK**: Fresh project map is VITAL for consistent progress
- **DURING WORK**: Use `.github/PROJECT_MAP.md` to understand current structure
- **AFTER CHANGES**: Update map immediately - stale structure info breaks workflow
- **DECISION MAKING**: All architectural decisions must reference current map

## SAFETY PROTOCOL - ATOMIC OPERATIONS
### Pre-Change Requirements
- **VERIFY**: Current state is clean (`flutter analyze` passes)
- **CONFIRM**: Fresh `.github/PROJECT_MAP.md` exists and is current
- **BACKUP**: Ensure `.history/` snapshots are auto-created by editor

### During Change Requirements
- **ATOMIC**: One logical change per commit
- **VALIDATION**: `flutter analyze && flutter build ios --simulator`
- **STRUCTURE**: Update project map if structure changed

### Post-Change Requirements
- **ROLLBACK READY**: Use `git stash` if validation fails
- **RECOVERY**: Use `.history/` files for catastrophic failure
- **MAP UPDATE**: Run `./.github/update_project_map.sh` after structural changes

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

## DEVELOPMENT STANDARDS
### Code Quality
- **FORMAT**: `dart format lib/` + organized imports
- **DI**: Use `.create()` factory methods
- **NAMING**: Consistent across codebase
- **TESTING**: Required for M/H complexity tasks

### Implementation Guidelines
- **SOLID**: Single responsibility, dependency injection, clean interfaces
- **PURE FUNCTIONS**: Same input = same output, no side effects
- **CLEAN ARCHITECTURE**: Domain-agnostic business logic, clear layer boundaries

## REFACTORING PROTOCOL
### Safety-First Approach
- **BACKUP**: Ensure editor creates `.history/` snapshots automatically
- **PRESERVE**: Keep originals in `.legacy/` folder (for refactored files)
- **SUFFIX**: New files with `_refactored.dart` or `_clean.dart`
- **GRADUAL**: Switch via imports gradually
- **TESTING**: NEVER delete originals until fully tested

### Naming Conventions
- **`_refactored.dart`**: Improved version with same interface
- **`_clean.dart`**: Complete rewrite with simplified architecture
- **`.create()`**: Factory method for proper dependency injection

### Migration Strategy
- **INCREMENTAL**: Small, self-contained units
- **ATOMIC**: One logical change per step
- **VALIDATED**: Test thoroughly between steps
- **REVERSIBLE**: Always maintain rollback capability

## RECOVERY STRATEGY
### Recovery Hierarchy (Priority Order)
1. **IMMEDIATE**: `git stash` - Quick rollback of current changes
2. **RECENT**: Use editor's `.history/` files for accidental changes/corruption
3. **REFACTORING**: Use `.legacy/` folder for original versions of refactored files
4. **CATASTROPHIC**: Restore from `.history/` + git reset
5. **VALIDATION**: Always test before proceeding to next change

### Backup System
- **`.history/`**: Auto-created by editor for all file changes
- **`.legacy/`**: Manual placement for original files during refactoring
- **`git stash`**: Immediate rollback for current session
- **Git commits**: Stable checkpoints

### Recovery Actions
- **ASSESS**: Determine recovery level needed
- **RESTORE**: Use appropriate backup source
- **VALIDATE**: `flutter analyze && flutter build ios --simulator`
- **VERIFY**: Application functionality intact
- **COMMIT**: Create new checkpoint after successful recovery

## FEATURE-BASED ARCHITECTURE ENFORCEMENT
### Clean Architecture Feature Separation - CRITICAL
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

## FUNCTION STANDARDS - MANDATORY COMPLIANCE
### Pure Function Requirements
- **SAME INPUT = SAME OUTPUT**: Functions must return consistent output for identical input
- **NO SIDE EFFECTS**: Functions cannot modify state outside their scope
- **NO MUTATION**: Never modify input parameters
- **PREDICTABLE BEHAVIOR**: Consistent and expected behavior always
- **EARLY VALIDATION**: Check inputs at function beginning
- **SERVICES FOR SIDE EFFECTS**: Use services/repositories for I/O operations

### Function Implementation Standards
- **SIZE LIMIT**: Maximum 20 lines per function
- **SINGLE PURPOSE**: Each function does exactly one thing well
- **EARLY RETURN**: Return early to avoid deep nesting
- **COMPOSITION**: Build complex functions by composing simpler ones
- **DEFAULT VALUES**: Provide sensible defaults for optional parameters
- **ERROR HANDLING**: Handle edge cases explicitly with meaningful messages

### Testing and Documentation
- **PURE FUNCTIONS**: Easier to test, minimize external state dependencies
- **TEST COVERAGE**: Normal operations, edge cases, error conditions
- **DOCUMENTATION**: Describe purpose, parameters, return values, and side effects
- **EXAMPLES**: Provide examples for complex functions

## DOCUMENTATION STANDARDS - ENFORCE HIERARCHY
### Documentation Structure Rules
- **HIERARCHICAL STRUCTURE**: Main README.md at project root with package-specific READMEs
- **CONNECTED DOCUMENTATION**: Package READMEs reference and connect to main README
- **AVOID REDUNDANCY**: NEVER duplicate general project info across multiple files
- **CONSOLIDATE**: Merge overlapping content, keep package-specific details separate

### Forbidden Documentation Patterns - NEVER CREATE
- **NO MULTIPLE OVERVIEWS**: PROJECT_SUMMARY.md, OVERVIEW.md, etc.
- **NO RULE DUPLICATES**: WORKING_RULES.md, GUIDELINES.md that duplicate README
- **NO PROCESS FILES**: METHODOLOGY.md, PROCESS.md belong in README
- **NO CROSS-REFERENCE WEBS**: Avoid interconnected documentation files

### Documentation Maintenance Protocol
- **PREVENT BLOAT**: Check if content belongs in README before creating new .md files
- **ELIMINATE CROSS-REFERENCES**: Don't create webs of interconnected docs
- **CLEAN REGULARLY**: Audit and consolidate during major milestones
- **TEMPORARY DOCS**: Use .temp/ folder for work-in-progress documentation

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

## TASK MANAGEMENT INTEGRATION
### Workflow Protocol - NEVER SKIP
- **MANDATORY READ**: README.md before starting ANY work
- **CHECK TASKS**: Always examine `.github/` folder contents first
- **CONTEXT FILES**: Read current.json and ACTIVE_TASK.md for full context

### Task File Management Protocol
- **CREATE**: .github/current.json at task initiation
- **MAINTAIN**: .github/ACTIVE_TASK.md with ongoing detailed updates
- **COMPLETE**: .github/completed/*.json upon task completion
- **CLEANUP**: Archive completed tasks to .github/completed/ folder

### Complexity Integration with Structure
- **EASY (E)**: 5-15min | ≤3 files | Simple config/single edits
- **MEDIUM (M)**: 15-60min | ≤10 files | Multi-file changes, new features
- **HIGH (H)**: 60min+ | Unlimited files | Architecture changes, complex patterns