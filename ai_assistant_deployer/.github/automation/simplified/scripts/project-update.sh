#!/bin/bash

# M5 Project Update Script - Simplified Version
# Version: 2.0
# Usage: ./scripts/project-update.sh

set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Update PROJECT_MAP.md
update_project_map() {
    log "Updating PROJECT_MAP.md..."
    
    local map_file="$PROJECT_ROOT/.github/PROJECT_MAP.md"
    
    # Generate current project structure
    local structure=""
    if [ -d "$PROJECT_ROOT/lib" ]; then
        structure=$(find "$PROJECT_ROOT/lib" -type d 2>/dev/null | sed "s|$PROJECT_ROOT/lib|.|" | sort | sed 's/^/├── /')
    else
        structure="├── (structure pending - run flutter create)"
    fi
    
    # Count files for statistics
    local dart_files=$(find "$PROJECT_ROOT/lib" -name "*.dart" 2>/dev/null | wc -l | tr -d ' ')
    local test_files=$(find "$PROJECT_ROOT/test" -name "*.dart" 2>/dev/null | wc -l | tr -d ' ')
    
    cat > "$map_file" << EOF
# M5 Flutter App - Project Map

**Generated**: $(date)  
**Version**: 2.0 (Simplified Rules System)  
**Files**: ${dart_files} Dart files, ${test_files} test files

## Project Structure

\`\`\`
lib/
${structure}
\`\`\`

## Architecture Overview

### Clean Architecture Layers
- **UI Layer** (\`lib/presentation/\`) - Widgets, screens, state management
- **Domain Layer** (\`lib/domain/\`) - Business logic, entities, use cases  
- **Data Layer** (\`lib/data/\`) - Repositories, data sources, models
- **Core Layer** (\`lib/core/\`) - Shared utilities, constants, dependencies

### Dependency Flow
\`\`\`
UI → Domain ← Data
     ↑
   Core
\`\`\`

## Key Files

### Configuration
- \`pubspec.yaml\` - Project dependencies and metadata
- \`analysis_options.yaml\` - Dart analyzer configuration

### Rules & Automation
- \`.github/RULES.md\` - Unified project rules (3-tier priority system)
- \`./scripts/task-system.sh\` - Main automation script
- \`./scripts/security-check.sh\` - Security validation
- \`./scripts/project-update.sh\` - Documentation updates

## Quick Start Commands

\`\`\`bash
# Essential workflow
./scripts/task-system.sh backup      # Always backup first
./scripts/task-system.sh validate    # Check project structure
./scripts/security-check.sh          # Security validation
./scripts/task-system.sh update      # Update documentation

# Development
flutter pub get                      # Install dependencies
flutter run                          # Run app
flutter test                         # Run tests
\`\`\`

## Rules Migration (v2.0)

### Before (Complex System)
- 15+ rule files in \`.github/\`
- 15+ automation scripts
- Complex multi-parameter commands
- High cognitive load for agents

### After (Simplified System)  
- **1 unified rules file** (\`RULES.md\`) with 3-tier priority
- **3 core scripts** (task-system, security-check, project-update)
- **Simple commands** with clear purpose
- **80% complexity reduction** while maintaining safety

### Priority System
1. **CRITICAL** - Must follow (Clean Architecture, File Structure, Dependencies, Auto-Backup)
2. **IMPORTANT** - Follow when possible (State Management, Security, Code Quality, Performance)  
3. **GUIDELINES** - Best practices (Documentation, Git Workflow, Testing)

## Backup System

Automated backups stored in \`.github/backups/\`:
- Created before structural changes
- Timestamped with git info
- Quick recovery available
- Automatic cleanup (keeps last 10)

## Emergency Procedures

### Quick Recovery
\`\`\`bash
./scripts/task-system.sh recover backup_YYYYMMDD_HHMMSS
\`\`\`

### Manual Recovery
\`\`\`bash
git stash
git checkout develop
git pull origin develop
\`\`\`

---

*This document is auto-generated. Last update: $(date)*
EOF
    
    success "PROJECT_MAP.md updated"
}

# Update README.md with current project info
update_readme() {
    log "Checking README.md..."
    
    local readme_file="$PROJECT_ROOT/README.md"
    
    if [ ! -f "$readme_file" ]; then
        log "Creating README.md..."
        cat > "$readme_file" << EOF
# M5 Flutter App

A modern Flutter application built with Clean Architecture principles.

## Project Structure

This project follows Clean Architecture with clear separation of concerns:

- **lib/presentation/** - UI components, screens, state management
- **lib/domain/** - Business logic, entities, use cases
- **lib/data/** - Data sources, repositories, models  
- **lib/core/** - Shared utilities, constants, dependencies

## Quick Start

\`\`\`bash
# Install dependencies
flutter pub get

# Run the app
flutter run

# Run tests
flutter test
\`\`\`

## Development Workflow

\`\`\`bash
# Before making changes
./scripts/task-system.sh backup

# Validate project structure
./scripts/task-system.sh validate

# Security check
./scripts/security-check.sh

# Update documentation
./scripts/task-system.sh update
\`\`\`

## Project Rules

See [.github/RULES.md](.github/RULES.md) for comprehensive project guidelines.

## Architecture

The app uses Clean Architecture with the following dependency flow:
\`\`\`
UI Layer → Domain Layer ← Data Layer
            ↑
         Core Layer
\`\`\`

This ensures:
- Separation of concerns
- Testability
- Maintainability
- Platform independence

## Contributing

1. Follow the rules in [.github/RULES.md](.github/RULES.md)
2. Create feature branches
3. Write tests for new functionality
4. Ensure all validations pass before merging

## Scripts

- \`./scripts/task-system.sh\` - Main project automation
- \`./scripts/security-check.sh\` - Security validation
- \`./scripts/project-update.sh\` - Documentation updates
EOF
        success "README.md created"
    else
        success "README.md already exists"
    fi
}

# Clean up old files from complex system
cleanup_old_system() {
    log "Cleaning up old complex system files..."
    
    local cleaned=0
    
    # Remove old rule files (keeping the new RULES.md)
    for file in project-rules.md copilot-instructions.md; do
        if [ -f "$PROJECT_ROOT/.github/$file" ]; then
            mv "$PROJECT_ROOT/.github/$file" "$PROJECT_ROOT/.github/backups/legacy_$file" 2>/dev/null || true
            success "Moved legacy file: $file"
            ((cleaned++))
        fi
    done
    
    # Archive old task-management directory
    if [ -d "$PROJECT_ROOT/.github/task-management" ]; then
        if [ ! -d "$PROJECT_ROOT/.github/backups/legacy_task_management" ]; then
            mv "$PROJECT_ROOT/.github/task-management" "$PROJECT_ROOT/.github/backups/legacy_task_management" 2>/dev/null || true
            success "Archived legacy task-management directory"
            ((cleaned++))
        fi
    fi
    
    # Remove old task-management.sh if it exists
    if [ -f "$PROJECT_ROOT/.github/task-management.sh" ]; then
        mv "$PROJECT_ROOT/.github/task-management.sh" "$PROJECT_ROOT/.github/backups/legacy_task-management.sh" 2>/dev/null || true
        success "Moved legacy task-management.sh"
        ((cleaned++))
    fi
    
    if [ $cleaned -gt 0 ]; then
        success "Cleaned up $cleaned legacy files"
    else
        log "No legacy files to clean up"
    fi
}

# Main function
main() {
    local command="${1:-all}"
    
    echo "M5 Project Update Script - Version 2.0"
    echo "======================================"
    echo
    
    case "$command" in
        all|--all)
            update_project_map
            echo
            update_readme
            echo
            cleanup_old_system
            ;;
        map|--map)
            update_project_map
            ;;
        readme|--readme)
            update_readme
            ;;
        cleanup|--cleanup)
            cleanup_old_system
            ;;
        help|--help|-h)
            echo "Usage: $0 [command]"
            echo
            echo "Commands:"
            echo "  all        Update all documentation and cleanup (default)"
            echo "  map        Update PROJECT_MAP.md only"
            echo "  readme     Update README.md only"
            echo "  cleanup    Clean up legacy files only"
            echo "  help       Show this help message"
            echo
            echo "Examples:"
            echo "  $0"
            echo "  $0 map"
            echo "  $0 cleanup"
            ;;
        *)
            error "Unknown command: $command"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
    
    echo
    success "Project update completed"
}

# Create necessary directories
mkdir -p "$PROJECT_ROOT/.github/backups"

# Run main function
main "$@"
