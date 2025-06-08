#!/bin/bash

# M5 Project Task System - Unified Entry Point
# Version: 2.0 (Simplified)
# Usage: ./scripts/task-system.sh [backup|recover|validate|update]

set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/.github/backups"
SCRIPTS_DIR="$PROJECT_ROOT/.github/scripts"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Create backup of current state
backup() {
    log "Creating project backup..."
    
    # Create backup directory
    BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
    mkdir -p "$BACKUP_PATH"
    
    # Backup critical directories
    if [ -d "$PROJECT_ROOT/lib" ]; then
        cp -r "$PROJECT_ROOT/lib" "$BACKUP_PATH/"
        success "Backed up lib/ directory"
    fi
    
    if [ -d "$PROJECT_ROOT/test" ]; then
        cp -r "$PROJECT_ROOT/test" "$BACKUP_PATH/"
        success "Backed up test/ directory"
    fi
    
    # Backup configuration files
    for file in pubspec.yaml analysis_options.yaml .gitignore; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            cp "$PROJECT_ROOT/$file" "$BACKUP_PATH/"
            success "Backed up $file"
        fi
    done
    
    # Create backup manifest
    cat > "$BACKUP_PATH/manifest.json" << EOF
{
    "timestamp": "$TIMESTAMP",
    "git_commit": "$(cd "$PROJECT_ROOT" && git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(cd "$PROJECT_ROOT" && git branch --show-current 2>/dev/null || echo 'unknown')",
    "backup_path": "$BACKUP_PATH"
}
EOF
    
    success "Backup created: backup_$TIMESTAMP"
    log "Backup location: $BACKUP_PATH"
}

# Recover from backup
recover() {
    local backup_id="${1:-}"
    
    if [ -z "$backup_id" ]; then
        log "Available backups:"
        ls -la "$BACKUP_DIR" 2>/dev/null | grep "^d" | grep "backup_" | awk '{print $NF}' || {
            error "No backups found in $BACKUP_DIR"
            exit 1
        }
        echo
        echo "Usage: $0 recover backup_YYYYMMDD_HHMMSS"
        exit 1
    fi
    
    local backup_path="$BACKUP_DIR/$backup_id"
    
    if [ ! -d "$backup_path" ]; then
        error "Backup not found: $backup_path"
        exit 1
    fi
    
    log "Recovering from backup: $backup_id"
    
    # Restore directories
    if [ -d "$backup_path/lib" ]; then
        rm -rf "$PROJECT_ROOT/lib"
        cp -r "$backup_path/lib" "$PROJECT_ROOT/"
        success "Restored lib/ directory"
    fi
    
    if [ -d "$backup_path/test" ]; then
        rm -rf "$PROJECT_ROOT/test"
        cp -r "$backup_path/test" "$PROJECT_ROOT/"
        success "Restored test/ directory"
    fi
    
    # Restore configuration files
    for file in pubspec.yaml analysis_options.yaml .gitignore; do
        if [ -f "$backup_path/$file" ]; then
            cp "$backup_path/$file" "$PROJECT_ROOT/"
            success "Restored $file"
        fi
    done
    
    success "Recovery completed from backup: $backup_id"
}

# Validate project structure
validate() {
    log "Validating project structure..."
    
    local errors=0
    
    # Check critical directories
    for dir in lib lib/core lib/data lib/domain lib/presentation; do
        if [ ! -d "$PROJECT_ROOT/$dir" ]; then
            error "Missing required directory: $dir"
            ((errors++))
        else
            success "Directory exists: $dir"
        fi
    done
    
    # Check pubspec.yaml
    if [ ! -f "$PROJECT_ROOT/pubspec.yaml" ]; then
        error "Missing pubspec.yaml"
        ((errors++))
    else
        success "pubspec.yaml exists"
    fi
    
    # Check for common anti-patterns
    if find "$PROJECT_ROOT/lib" -name "*.dart" -exec grep -l "import.*presentation.*;" {} \; 2>/dev/null | grep -E "(data|domain)" > /dev/null; then
        warning "Potential dependency violation: data/domain importing presentation"
        ((errors++))
    fi
    
    if [ $errors -eq 0 ]; then
        success "Project structure validation passed"
        return 0
    else
        error "Project structure validation failed with $errors errors"
        return 1
    fi
}

# Update project documentation
update() {
    log "Updating project documentation..."
    
    # Update PROJECT_MAP.md
    local map_file="$PROJECT_ROOT/.github/PROJECT_MAP.md"
    
    cat > "$map_file" << EOF
# M5 Flutter App - Project Map

**Generated**: $(date)  
**Version**: 2.0 (Simplified Rules System)

## Project Structure

\`\`\`
lib/
$(find "$PROJECT_ROOT/lib" -type d 2>/dev/null | sed "s|$PROJECT_ROOT/lib|.|" | sort | sed 's/^/├── /' || echo "├── (structure pending)")
\`\`\`

## Key Files

### Configuration
- \`pubspec.yaml\` - Project dependencies and metadata
- \`analysis_options.yaml\` - Dart analyzer configuration

### Core Architecture
- \`lib/core/\` - Shared utilities, DI, constants
- \`lib/data/\` - Data sources, repositories, models  
- \`lib/domain/\` - Entities, use cases, repository interfaces
- \`lib/presentation/\` - UI components, screens, state management

### Rules & Scripts
- \`.github/RULES.md\` - Unified project rules (3-tier priority)
- \`./scripts/task-system.sh\` - Main automation script
- \`./scripts/security-check.sh\` - Security validation
- \`./scripts/project-update.sh\` - Documentation updates

## Recent Changes

- **Simplified Rules System**: Reduced from 15+ files to unified 3-tier priority system
- **Unified Scripts**: Consolidated 15+ scripts into 3 core automation tools
- **Clean Architecture**: Enforced separation of concerns with dependency rules

## Quick Commands

\`\`\`bash
# Backup before changes
./scripts/task-system.sh backup

# Validate structure  
./scripts/task-system.sh validate

# Update documentation
./scripts/task-system.sh update

# Security check
./scripts/security-check.sh
\`\`\`

EOF
    
    success "Updated PROJECT_MAP.md"
    
    # Clean up old backup files (keep last 10)
    if [ -d "$BACKUP_DIR" ]; then
        local backup_count=$(ls -1 "$BACKUP_DIR" | grep "^backup_" | wc -l)
        if [ "$backup_count" -gt 10 ]; then
            local to_remove=$((backup_count - 10))
            ls -1t "$BACKUP_DIR" | grep "^backup_" | tail -n "$to_remove" | while read backup; do
                rm -rf "$BACKUP_DIR/$backup"
                log "Cleaned up old backup: $backup"
            done
        fi
    fi
    
    success "Project documentation updated"
}

# Main function
main() {
    local command="${1:-help}"
    
    case "$command" in
        backup)
            backup
            ;;
        recover)
            recover "$2"
            ;;
        validate)
            validate
            ;;
        update)
            update
            ;;
        help|--help|-h)
            echo "M5 Project Task System - Unified Entry Point"
            echo
            echo "Usage: $0 [command]"
            echo
            echo "Commands:"
            echo "  backup     Create backup of current project state"
            echo "  recover    Recover from backup (usage: recover backup_YYYYMMDD_HHMMSS)"
            echo "  validate   Validate project structure and dependencies" 
            echo "  update     Update project documentation"
            echo "  help       Show this help message"
            echo
            echo "Examples:"
            echo "  $0 backup"
            echo "  $0 validate"
            echo "  $0 recover backup_20240101_123456"
            ;;
        *)
            error "Unknown command: $command"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Create necessary directories
mkdir -p "$BACKUP_DIR"
mkdir -p "$SCRIPTS_DIR"

# Run main function
main "$@"
