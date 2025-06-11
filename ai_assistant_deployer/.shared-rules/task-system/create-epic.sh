#!/bin/bash
#!/bin/bash
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns 
# Epic Creation System
# Version: 1.0.0
# Purpose: Create and manage complex multi-task epics
#
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
EPICS_DIR="$PROJECT_ROOT/.tasks/epics"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                    EPIC CREATION SYSTEM                        ║"
    echo "║                       Version 1.0.0                           ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_usage() {
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 \"Epic Name\" [options]"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --complexity=EASY|MEDIUM|HIGH    Set epic complexity level"
    echo "  --estimated-hours=NUMBER         Set estimated hours"
    echo "  --max-tasks=NUMBER              Set maximum number of tasks"
    echo "  --description=\"text\"            Set epic description"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 \"Authentication System\" --complexity=HIGH --estimated-hours=40"
    echo "  $0 \"UI Improvements\" --complexity=MEDIUM --description=\"Improve user interface\""
}

log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  INFO: $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ SUCCESS: $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ERROR: $1${NC}"
}

create_epic() {
    local epic_name="$1"
    local complexity="${2:-MEDIUM}"
    local estimated_hours="${3:-8}"
    local max_tasks="${4:-10}"
    local description="${5:-No description provided}"
    
    # Generate epic ID
    local epic_id="epic_$(date +%Y-%m-%d_%H-%M-%S)_$(echo "$epic_name" | tr ' ' '_' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_]//g' | cut -c1-30)"
    local epic_dir="$EPICS_DIR/active/$epic_id"
    
    # Ensure directories exist
    mkdir -p "$EPICS_DIR/active"
    mkdir -p "$EPICS_DIR/completed"
    mkdir -p "$EPICS_DIR/suspended"
    mkdir -p "$epic_dir"
    
    # Create epic manifest
    cat > "$epic_dir/epic.json" <<EOF
{
  "epic": {
    "id": "$epic_id",
    "name": "$epic_name",
    "description": "$description",
    "complexity": "$complexity",
    "status": "active",
    "createdAt": "$(date '+%Y-%m-%d %H:%M:%S')",
    "updatedAt": "$(date '+%Y-%m-%d %H:%M:%S')"
  },
  "estimates": {
    "hours": $estimated_hours,
    "maxTasks": $max_tasks,
    "completedTasks": 0
  },
  "progress": {
    "phase": "planning",
    "completion": 0,
    "milestones": []
  },
  "tasks": {
    "planning": [],
    "active": [],
    "completed": [],
    "blocked": []
  },
  "metadata": {
    "tags": [],
    "priority": "medium",
    "assignee": null,
    "dependencies": []
  }
}
EOF

    # Create epic structure
    mkdir -p "$epic_dir/tasks"
    mkdir -p "$epic_dir/documentation"
    mkdir -p "$epic_dir/resources"
    
    # Create README for the epic
    cat > "$epic_dir/README.md" <<EOF
# Epic: $epic_name

**Epic ID**: $epic_id  
**Status**: Active  
**Complexity**: $complexity  
**Created**: $(date '+%Y-%m-%d %H:%M:%S')

## Description
$description

## Estimates
- **Hours**: $estimated_hours
- **Max Tasks**: $max_tasks
- **Completion**: 0%

## Progress Tracking
- [ ] Planning Phase
- [ ] Execution Phase  
- [ ] Review Phase
- [ ] Completion Phase

## Tasks
*Tasks will be tracked in epic.json*

## Resources
*Epic-related resources go in the resources/ directory*

## Documentation
*Epic documentation goes in the documentation/ directory*
EOF

    # Create task tracking file
    touch "$epic_dir/tasks/task_list.md"
    
    log_success "Epic created: $epic_name"
    log_info "Epic ID: $epic_id"
    log_info "Epic Directory: $epic_dir"
    log_info "Estimated Hours: $estimated_hours"
    log_info "Max Tasks: $max_tasks"
    
    return 0
}

# Parse command line arguments
if [[ $# -eq 0 ]]; then
    print_header
    print_usage
    exit 1
fi

epic_name="$1"
shift

# Handle legacy format: create-epic.sh "name" "description"
if [[ $# -gt 0 && "$1" != --* ]]; then
    description="$1"
    shift
fi

# Default values
complexity="MEDIUM"
estimated_hours="8"
max_tasks="10"
description="No description provided"

# Parse options
while [[ $# -gt 0 ]]; do
    case $1 in
        --complexity=*)
            complexity="${1#*=}"
            shift
            ;;
        --estimated-hours=*)
            estimated_hours="${1#*=}"
            shift
            ;;
        --max-tasks=*)
            max_tasks="${1#*=}"
            shift
            ;;
        --description=*)
            description="${1#*=}"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Validate complexity
if [[ ! "$complexity" =~ ^(EASY|MEDIUM|HIGH)$ ]]; then
    log_error "Invalid complexity: $complexity. Must be EASY, MEDIUM, or HIGH"
    exit 1
fi

print_header
log_info "Creating epic: $epic_name"
log_info "Complexity: $complexity"
log_info "Estimated Hours: $estimated_hours"
log_info "Max Tasks: $max_tasks"

create_epic "$epic_name" "$complexity" "$estimated_hours" "$max_tasks" "$description"

echo -e "\n${GREEN}🎉 Epic creation completed successfully!${NC}"
echo -e "${BLUE}Use the task management system to add tasks to this epic.${NC}"