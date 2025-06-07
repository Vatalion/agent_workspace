# Refactoring Protocol Guide

This document outlines the procedures for safely refactoring code according to our project's clean architecture principles and feature-based organization.

## Safety-First Approach

### Backup Protocol
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

## Refactoring to Feature-Based Architecture

### Step 1: Identify Features
- Look for related screens, models and services
- Group functionality by business domain
- Create feature folders following the standard structure

### Step 2: Move BLoCs to Correct Location
- Move all BLoCs to `features/[feature]/presentation/bloc/`
- Ensure BLoCs are connected to their screens via proper providers
- Use `.create()` factory methods for dependency injection

### Step 3: Organize Domain Logic
- Move business logic to domain/usecases
- Ensure domain entities are separate from data models
- Domain should not depend on presentation or data layers

### Step 4: Refactor Data Layer
- Repositories should implement domain interfaces
- Data models should map to domain entities
- External services should be wrapped in repositories

## Emergency Recovery

### Recovery Hierarchy (Priority Order)
1. **IMMEDIATE**: `git stash` - Quick rollback of current changes
2. **RECENT**: Use editor's `.history/` files for accidental changes/corruption
3. **REFACTORING**: Use `.legacy/` folder for original versions of refactored files
4. **CATASTROPHIC**: Restore from `.history/` + git reset
5. **VALIDATION**: Always test before proceeding to next change

### Recovery Actions
- **ASSESS**: Determine recovery level needed
- **RESTORE**: Use appropriate backup source
- **VALIDATE**: `flutter analyze && flutter build ios --simulator`
- **VERIFY**: Application functionality intact
- **COMMIT**: Create new checkpoint after successful recovery
