#!/bin/bash
#!/bin/bash
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns 
# Task Management Integration API
# Version: 1.0.0
# Purpose: Provide integration API for rule-enforcer
#
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TASKS_DIR="$PROJECT_ROOT/.tasks"

# Check if task management is initialized
check_initialization() {
    # Check required files
    if [[ ! -f "$TASKS_DIR/system/task_management_state.json" ]]; then
        echo "TASK_MANAGEMENT_NOT_INITIALIZED"
        return 1
    fi
    
    if [[ ! -f "$TASKS_DIR/system/config.json" ]]; then
        echo "TASK_MANAGEMENT_NOT_INITIALIZED"
        return 1
    fi
    
    # Check if status is ready
    if command -v jq >/dev/null 2>&1; then
        local status=$(jq -r '.taskManagement.status // "unknown"' "$TASKS_DIR/system/task_management_state.json" 2>/dev/null || echo "unknown")
        if [[ "$status" != "ready" ]]; then
            echo "TASK_MANAGEMENT_NOT_READY"
            return 1
        fi
    fi
    
    echo "TASK_MANAGEMENT_READY"
    return 0
}

# Create task record
create_task_record() {
    local agent_name="${1:-UnknownAgent}"
    local task_description="${2:-No description}"
    local task_id="task_$(date '+%Y-%m-%d_%H-%M-%S')_$(echo "$task_description" | tr ' ' '_' | tr '[:upper:]' '[:lower:]' | head -c 30)"
    
    local task_file="$TASKS_DIR/1_planning/pending/${task_id}.json"
    
    # Create task record
    cat > "$task_file" <<EOF
{
  "task": {
    "id": "$task_id",
    "name": "$task_description",
    "agent": "$agent_name",
    "complexity": "MEDIUM",
    "status": "planning",
    "createdAt": "$(date '+%Y-%m-%d %H:%M:%S')",
    "updatedAt": "$(date '+%Y-%m-%d %H:%M:%S')"
  },
  "estimates": {
    "hours": 2,
    "maxFiles": 10
  },
  "progress": {
    "phase": "planning",
    "completion": 0
  },
  "cleanup": {
    "temporaryFiles": [],
    "generatedReports": [],
    "scriptsCreated": []
  }
}
EOF
    
    echo "TASK_RECORD_CREATED:$task_id"
    return 0
}

# Main function
case "${1:-status}" in
    "check")
        check_initialization
        ;;
    "create")
        create_task_record "$2" "$3"
        ;;
    "status")
        check_initialization
        ;;
    *)
        echo "Usage: $0 [check|create|status]"
        exit 1
        ;;
esac
