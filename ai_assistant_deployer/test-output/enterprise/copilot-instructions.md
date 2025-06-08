When generating code, please follow these user provided coding instructions. You can ignore an instruction if it contradicts a system message.
<instructions>

# GitHub Copilot Instructions - ENTERPRISE MODE

















## Flutter Development Workflow (MANDATORY)


{{#if (or (eq category 'SOLID_PRINCIPLES') (eq category 'CLEAN_ARCHITECTURE'))}}
### SOLID Principles Implementation (REQUIRED) ()
1. **Single Responsibility**: One class = one responsibility
2. **Open/Closed**: Open for extension, closed for modification
3. **Liskov Substitution**: Derived classes must be substitutable
4. **Interface Segregation**: No client forced to depend on unused interfaces
5. **Dependency Inversion**: Depend on abstractions, not concretions



{{#if (or (eq category 'SOLID_PRINCIPLES') (eq category 'CLEAN_ARCHITECTURE'))}}
### Clean Architecture (ENFORCED) ()
```
lib/
├── core/               # Core business logic, entities, interfaces
├── data/              # Data layer (repositories, data sources, models)
├── presentation/      # UI layer (pages, widgets, state management)
└── domain/           # Domain layer (use cases, entities, repositories)
```



{{#if (or (eq category 'SOLID_PRINCIPLES') (eq category 'CLEAN_ARCHITECTURE'))}}
### State Management Rules ()
- **Small Apps**: Provider or setState
- **Medium Apps**: Riverpod or Bloc
- **Large Apps**: Bloc with Clean Architecture
- **NEVER**: Global variables for state



{{#if (or (eq category 'SOLID_PRINCIPLES') (eq category 'CLEAN_ARCHITECTURE'))}}
### Enterprise Code Preferences ()
- Design for scalability and maintainability
- Implement comprehensive error handling
- Use advanced patterns and architectures
- Focus on enterprise-grade solutions
- Prioritize robustness and reliability
- Follow Flutter best practices and Clean Architecture
- Maintain high test coverage and documentation



{{#if (or (eq category 'SOLID_PRINCIPLES') (eq category 'CLEAN_ARCHITECTURE'))}}
### Flutter Development - Core Principles ()
- **SOLID**: Single responsibility, dependency injection, clean interfaces
- **Pure Functions**: Same input = same output, no side effects
- **Clean Architecture**: Domain-agnostic business logic, clear layer boundaries



{{/if}}


### Mandatory File Practices










### Testing Requirements (NON-NEGOTIABLE)






### Performance Guidelines






## ENTERPRISE Code Preferences

- ⚠️  **MANDATORY**: Always work with FRESH project structure information  
📍 **READ FIRST**: `.github/PROJECT_MAP.md` before making ANY changes  
🔄 **UPDATE ALWAYS**: `./update_project_map.sh` after ANY file/folder modifications

- 1. **READ**: `README.md`
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

- - **VERIFY**: Ensure both `.history/` and `.legacy/` folders exist
- **PRESERVE**: Do not delete files from either backup location
- **RELY ON**: Appropriate backup system based on situation

- - **EASY (E)**: Basic validation only
- **MEDIUM (M)**: Unit + Widget tests required
- **HIGH (H)**: Unit + Widget + Integration tests required

- - Implement enterprise-grade architecture patterns
- Use comprehensive error handling and logging
- Design for maintainability and scalability
- Follow advanced security practices
- Implement comprehensive testing strategies

- - Advanced security monitoring and validation
- Real-time threat detection
- Comprehensive file and system validation
- Automated security reporting
- Cross-machine security synchronization

- - Handle large codebases (500+ files)
- Support multiple concurrent development streams
- Maintain responsiveness under load
- Optimize for cross-machine operations




## Mode Switching


</instructions>