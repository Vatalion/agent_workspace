#!/bin/bash
#!/bin/bash
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns # Task Decomposition Script - Complete Implementation
# Breaks down large tasks into smaller manageable pieces
# Version 2.0.0 - Automatic complexity-based decomposition
#
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TASKS_DIR="$ROOT_DIR/../.tasks"
EPICS_DIR="$TASKS_DIR/epics"

# Ensure required directories exist
mkdir -p "$TASKS_DIR" "$EPICS_DIR"

# Task complexity thresholds
EASY_MAX_HOURS=2
EASY_MAX_FILES=5
MEDIUM_MAX_HOURS=8
MEDIUM_MAX_FILES=15
HIGH_MAX_HOURS=16
HIGH_MAX_FILES=50

print_usage() {
    cat << EOF
🔄 TASK DECOMPOSITION SYSTEM v2.0.0

USAGE:
    $0 <task_description> [options]

AUTOMATIC DECOMPOSITION FLOW:
    EASY      → 2hrs,  5 files  → Direct implementation
    MEDIUM    → 8hrs,  15 files → Break into 3-4 subtasks
    HIGH      → 16hrs, 50 files → Break into 5-8 subtasks
    ENORMOUS  → >16hrs, >50 files → Create Epic with milestones

OPTIONS:
    --complexity <E|M|H|ENORMOUS>  Force specific complexity level
    --force-epic                   Force epic creation regardless of size
    --interactive                  Interactive decomposition mode
    --dry-run                     Show decomposition without creating files

EXAMPLES:
    $0 "Implement user authentication system"
    $0 "Refactor entire codebase architecture" --complexity ENORMOUS
    $0 "Add simple login form" --complexity E --dry-run

EOF
}

analyze_task_complexity() {
    local task_desc="$1"
    local word_count=$(echo "$task_desc" | wc -w | tr -d ' ')
    local complexity_indicators=0
    
    # Check for complexity indicators
    if echo "$task_desc" | grep -iE "(system|architecture|refactor|entire|complete|comprehensive|full|all)" >/dev/null; then
        ((complexity_indicators += 2))
    fi
    
    if echo "$task_desc" | grep -iE "(implement|create|build|develop|design)" >/dev/null; then
        ((complexity_indicators += 1))
    fi
    
    if echo "$task_desc" | grep -iE "(multiple|various|several|many|different)" >/dev/null; then
        ((complexity_indicators += 1))
    fi
    
    if echo "$task_desc" | grep -iE "(integration|migration|transformation|verification)" >/dev/null; then
        ((complexity_indicators += 1))
    fi
    
    # Determine complexity
    if [[ $word_count -le 5 && $complexity_indicators -eq 0 ]]; then
        echo "EASY"
    elif [[ $word_count -le 10 && $complexity_indicators -le 2 ]]; then
        echo "MEDIUM"
    elif [[ $word_count -le 20 && $complexity_indicators -le 4 ]]; then
        echo "HIGH"
    else  
        echo "ENORMOUS"
    fi
}

create_subtasks() {
    local task_desc="$1"
    local complexity="$2"
    local task_id="$3"
    
    case "$complexity" in
        "EASY")
            echo "📝 EASY task - Direct implementation recommended"
            echo "Estimated: ${EASY_MAX_HOURS}hrs, ${EASY_MAX_FILES} files max"
            ;;
        "MEDIUM")
            echo "🔄 MEDIUM task - Breaking into 3-4 subtasks:"
            create_medium_subtasks "$task_desc" "$task_id"
            ;;
        "HIGH") 
            echo "⚡ HIGH task - Breaking into 5-8 subtasks:"
            create_high_subtasks "$task_desc" "$task_id"
            ;;
        "ENORMOUS")
            echo "🚀 ENORMOUS task - Creating Epic with milestones:"
            create_epic_from_task "$task_desc" "$task_id"
            ;;
    esac
}

create_medium_subtasks() {
    local task_desc="$1"
    local task_id="$2"
    local subtask_file="$TASKS_DIR/${task_id}_subtasks.md"
    
    cat > "$subtask_file" << EOF
# Medium Task Decomposition: $task_desc
Generated: $(date)
Parent Task ID: $task_id

## Subtasks (3-4 recommended):

### Subtask 1: Planning & Design
- [ ] Analyze requirements
- [ ] Create technical design
- [ ] Identify dependencies
**Estimated**: 1-2 hours

### Subtask 2: Core Implementation  
- [ ] Implement main functionality
- [ ] Basic error handling
- [ ] Unit tests
**Estimated**: 3-4 hours

### Subtask 3: Integration & Testing
- [ ] Integration with existing system
- [ ] End-to-end testing
- [ ] Performance validation
**Estimated**: 2-3 hours

### Subtask 4: Documentation & Cleanup
- [ ] Code documentation
- [ ] User documentation
- [ ] Code cleanup and review
**Estimated**: 1-2 hours

**Total Estimated**: 7-11 hours
EOF
    
    echo "  📄 Subtasks saved to: $subtask_file"
}

create_high_subtasks() {
    local task_desc="$1" 
    local task_id="$2"
    local subtask_file="$TASKS_DIR/${task_id}_subtasks.md"
    
    cat > "$subtask_file" << EOF
# High Complexity Task Decomposition: $task_desc
Generated: $(date)
Parent Task ID: $task_id

## Subtasks (5-8 recommended):

### Phase 1: Analysis & Architecture
- [ ] **Subtask 1**: Requirements analysis and documentation
- [ ] **Subtask 2**: System architecture design
- [ ] **Subtask 3**: Technical specification creation
**Estimated**: 3-4 hours

### Phase 2: Core Development
- [ ] **Subtask 4**: Core module implementation
- [ ] **Subtask 5**: Data layer implementation  
- [ ] **Subtask 6**: Business logic implementation
**Estimated**: 6-8 hours

### Phase 3: Integration & Quality
- [ ] **Subtask 7**: System integration
- [ ] **Subtask 8**: Comprehensive testing
- [ ] **Subtask 9**: Performance optimization
**Estimated**: 4-6 hours

### Phase 4: Finalization
- [ ] **Subtask 10**: Documentation
- [ ] **Subtask 11**: Code review and cleanup
**Estimated**: 2-3 hours

**Total Estimated**: 15-21 hours
EOF
    
    echo "  📄 Subtasks saved to: $subtask_file"
}

create_epic_from_task() {
    local task_desc="$1"
    local task_id="$2"
    
    # Generate epic ID
    local epic_id="EPIC_$(date +%Y%m%d_%H%M%S)"
    local epic_dir="$EPICS_DIR/$epic_id"
    mkdir -p "$epic_dir"
    
    # Create epic configuration
    cat > "$epic_dir/epic.json" << EOF
{
    "epic_id": "$epic_id",
    "title": "$task_desc",
    "description": "Enormous task automatically converted to epic",
    "created": "$(date -Iseconds)",
    "status": "planning",
    "parent_task_id": "$task_id",
    "estimated_duration": "4-8 weeks",
    "complexity": "ENORMOUS",
    "milestones": [
        {
            "id": "M1",
            "title": "Architecture & Planning",
            "status": "pending",
            "estimated_hours": 16
        },
        {
            "id": "M2", 
            "title": "Core Development",
            "status": "pending",
            "estimated_hours": 40
        },
        {
            "id": "M3",
            "title": "Integration & Testing", 
            "status": "pending",
            "estimated_hours": 24
        },
        {
            "id": "M4",
            "title": "Documentation & Deployment",
            "status": "pending",
            "estimated_hours": 12
        }
    ],
    "total_estimated_hours": 92
}
EOF
    
    # Create epic README
    cat > "$epic_dir/README.md" << EOF
# Epic: $task_desc

**Epic ID**: $epic_id  
**Status**: Planning  
**Created**: $(date)  
**Estimated Duration**: 4-8 weeks (92 hours)

## Overview
This enormous task has been automatically converted to an epic due to its complexity and scope.

## Milestones

### 🎯 Milestone 1: Architecture & Planning (16h)
- [ ] Requirements gathering and analysis
- [ ] System architecture design
- [ ] Technical specification
- [ ] Resource planning
- [ ] Risk assessment

### 🚀 Milestone 2: Core Development (40h)
- [ ] Infrastructure setup
- [ ] Core modules implementation
- [ ] Data models and repositories
- [ ] Business logic implementation
- [ ] API development

### 🔧 Milestone 3: Integration & Testing (24h)
- [ ] System integration
- [ ] Unit testing
- [ ] Integration testing
- [ ] Performance testing
- [ ] Security testing

### 📚 Milestone 4: Documentation & Deployment (12h)
- [ ] Code documentation
- [ ] User documentation
- [ ] Deployment procedures
- [ ] Training materials
- [ ] Final review

## Next Steps
1. Review and refine milestones
2. Assign resources to milestones
3. Create detailed tasks for Milestone 1
4. Begin execution

**Epic Management**: Use \`.shared-rules/task-system/epic-manager.sh\` to manage this epic.
EOF
    
    echo "  🚀 Epic created: $epic_dir"
    echo "  📋 Epic ID: $epic_id" 
    echo "  📄 Epic config: $epic_dir/epic.json"
    echo "  📖 Epic README: $epic_dir/README.md"
    
    # Integrate with monitoring if available
    if [[ -f "$ROOT_DIR/task-system/monitor-task.sh" ]]; then
        "$ROOT_DIR/task-system/monitor-task.sh" register-epic "$epic_id" "$task_desc"
    fi
}

# Main execution
main() {
    local task_desc=""
    local forced_complexity=""
    local force_epic=false
    local interactive=false
    local dry_run=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --complexity)
                forced_complexity="$2"
                shift 2
                ;;
            --force-epic)
                force_epic=true
                shift
                ;;
            --interactive)
                interactive=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --help|-h)
                print_usage
                exit 0
                ;;
            *)
                if [[ -z "$task_desc" ]]; then
                    task_desc="$1"
                else
                    task_desc="$task_desc $1"
                fi
                shift
                ;;
        esac
    done
    
    if [[ -z "$task_desc" ]]; then
        echo "❌ Error: Task description required"
        print_usage
        exit 1
    fi
    
    echo "🔄 TASK DECOMPOSITION SYSTEM"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 Task: $task_desc"
    echo ""
    
    # Determine complexity
    local complexity
    if [[ -n "$forced_complexity" ]]; then
        complexity="$forced_complexity"
        echo "🎯 Forced Complexity: $complexity"
    else
        complexity=$(analyze_task_complexity "$task_desc")
        echo "🤖 Auto-detected Complexity: $complexity"
    fi
    
    # Force epic if requested
    if [[ "$force_epic" == true ]]; then
        complexity="ENORMOUS"
        echo "🚀 Forced Epic Creation"
    fi
    
    # Generate task ID
    local task_id="TASK_$(date +%Y%m%d_%H%M%S)"
    echo "🆔 Task ID: $task_id"
    echo ""
    
    if [[ "$dry_run" == true ]]; then
        echo "🔍 DRY RUN - No files will be created"
        echo ""
    fi
    
    # Create decomposition
    if [[ "$dry_run" != true ]]; then
        create_subtasks "$task_desc" "$complexity" "$task_id"
    else
        echo "Would create $complexity decomposition for task: $task_desc"
    fi
    
    echo ""
    echo "✅ Task decomposition completed successfully"
}

# Execute main function with all arguments
main "$@"
