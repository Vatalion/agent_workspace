# Project Rules - ENTERPRISE MODE

## Flutter Development - Core Principles
- **SOLID**: Single responsibility, dependency injection, clean interfaces
- **Pure Functions**: Same input = same output, no side effects
- **Clean Architecture**: Domain-agnostic business logic, clear layer boundaries

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

### Test Types
- **UNIT**: Data layer business logic
- **WIDGET**: Presentation layer components  
- **INTEGRATION**: Auth flows and navigation
- **COVERAGE**: 70% critical paths minimum

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

## Enterprise Task Management Rules
1. **Epic Orchestration**: Break large tasks into manageable epics (10-500+ hours)
2. **Priority Interrupts**: Handle urgent interrupts with graceful suspension
3. **Cross-Machine Sync**: Maintain state across multiple development machines
4. **Milestone Tracking**: Automatic checkpointing and progress reporting
5. **Auto-Save**: 15-minute interval state preservation

## File Organization
- Use hierarchical structure for complex projects
- Implement comprehensive folder organization
- Maintain detailed metadata and tracking
- Leverage advanced automation scripts

## Development Workflow
1. **Epic Planning**: Define large-scale objectives and milestones
2. **Task Breakdown**: Decompose epics into manageable subtasks
3. **Priority Management**: Handle interrupts with graceful suspension
4. **Cross-Machine Sync**: Automatic git branching and state sync
5. **Progress Tracking**: Real-time monitoring and reporting
6. **Completion Archival**: Comprehensive completion documentation

## Enterprise Features
- **Real-Time Monitoring**: Daemon processes for continuous oversight
- **Scalability First**: Design for growth and complexity
- **Comprehensive Automation**: Leverage full automation capabilities
- **Enterprise Standards**: Follow enterprise-grade practices
- **Advanced Monitoring**: Implement continuous oversight

## Task Management Rules
1. **Epic Orchestration**: Break large tasks into manageable epics (10-500+ hours)
2. **Priority Interrupts**: Handle urgent interrupts with graceful suspension
3. **Cross-Machine Sync**: Maintain state across multiple development machines
4. **Milestone Tracking**: Automatic checkpointing and progress reporting
5. **Auto-Save**: 15-minute interval state preservation

## File Organization
- Use hierarchical structure for complex projects
- Implement comprehensive folder organization
- Maintain detailed metadata and tracking
- Leverage advanced automation scripts

## Development Workflow
1. **Epic Planning**: Define large-scale objectives and milestones
2. **Task Breakdown**: Decompose epics into manageable subtasks
3. **Priority Management**: Handle interrupts with graceful suspension
4. **Cross-Machine Sync**: Automatic git branching and state sync
5. **Progress Tracking**: Real-time monitoring and reporting
6. **Completion Archival**: Comprehensive completion documentation

## Enterprise Features
- **Real-Time Monitoring**: Daemon processes for continuous oversight
- **Automatic Backups**: Comprehensive state preservation every 15 minutes
- **Git Integration**: Automatic branching and cross-machine synchronization
- **Interrupt Handling**: Priority queue with graceful task suspension
- **Epic Management**: Handle projects spanning 10-500+ hours
- **Machine State Preservation**: Seamless switching between development machines

## Code Standards
- Implement enterprise-grade architecture patterns
- Use comprehensive error handling and logging
- Design for maintainability and scalability
- Follow advanced security practices
- Implement comprehensive testing strategies

## Security Rules
- Advanced security monitoring and validation
- Real-time threat detection
- Comprehensive file and system validation
- Automated security reporting
- Cross-machine security synchronization

## Performance Requirements
- Handle large codebases (500+ files)
- Support multiple concurrent development streams
- Maintain responsiveness under load
- Optimize for cross-machine operations

## Monitoring and Alerting
- Real-time progress monitoring
- Automatic alert generation for issues
- Performance metrics collection
- Comprehensive logging and reporting

## Switching to Simplified
When project requirements decrease or for maintenance:
- Simple bug fixes
- Basic feature additions
- Single-machine development
- Reduced complexity needs

Use: `./mode-manager.sh simplified`

---
*Enterprise Mode Rules - Scale with complexity, maintain reliability*
