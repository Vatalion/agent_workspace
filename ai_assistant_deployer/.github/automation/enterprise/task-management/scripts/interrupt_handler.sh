#!/bin/bash
# Enterprise Task Management - Priority Interrupt Handler
# Location: .tasks/system/interrupt_handler.sh

PROJECT_ROOT="/Users/vitalijsimko/workspace/projects/flutter/m5"
TASKS_DIR="$PROJECT_ROOT/.tasks"
LOG_FILE="$TASKS_DIR/system/interrupt.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to add interrupt task to priority queue
add_interrupt_task() {
    local task_id="$1"
    local priority="$2"
    local estimated_time="$3"
    local description="$4"
    
    local queue_file="$TASKS_DIR/system/priority_queue.json"
    local current_time=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    
    # Create interrupt task JSON
    local interrupt_task=$(cat <<EOF
{
  "task_id": "$task_id",
  "priority": "$priority",
  "estimated_time": "$estimated_time",
  "description": "$description",
  "added_at": "$current_time",
  "interrupt_at": "next_atomic_operation",
  "requester": "user",
  "context_preservation_required": true
}
EOF
)
    
    log "Adding interrupt task: $task_id (Priority: $priority)"
    
    # Add to queue (simplified - in real implementation would properly modify JSON)
    echo "INTERRUPT_ADDED: $task_id" > "$TASKS_DIR/system/interrupt_signal"
    
    return 0
}

# Function to suspend current task
suspend_current_task() {
    local suspension_reason="$1"
    local primary_task=$(get_current_primary_task)
    
    if [ -z "$primary_task" ]; then
        log "No primary task to suspend"
        return 1
    fi
    
    log "Suspending primary task: $primary_task (Reason: $suspension_reason)"
    
    # Create suspension context
    local suspension_context=$(cat <<EOF
{
  "suspended_task": "$primary_task",
  "suspension_time": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "suspension_reason": "$suspension_reason",
  "context": {
    "current_subtask": "$(get_current_subtask $primary_task)",
    "files_in_progress": $(get_files_in_progress),
    "environment_state": "$(capture_environment_state)",
    "git_state": "$(git rev-parse HEAD)"
  },
  "resume_point": "after_interrupt_completion"
}
EOF
)
    
    # Save suspension context
    echo "$suspension_context" > "$TASKS_DIR/3_execution/suspended/${primary_task}_context.json"
    
    # Move task to suspended state
    if [ -d "$TASKS_DIR/3_execution/active/$primary_task" ]; then
        mv "$TASKS_DIR/3_execution/active/$primary_task" "$TASKS_DIR/3_execution/suspended/"
    fi
    
    log "Task $primary_task suspended successfully"
    return 0
}

# Function to resume suspended task
resume_suspended_task() {
    local task_id="$1"
    local context_file="$TASKS_DIR/3_execution/suspended/${task_id}_context.json"
    
    if [ ! -f "$context_file" ]; then
        log "ERROR: No suspension context found for task: $task_id"
        return 1
    fi
    
    log "Resuming suspended task: $task_id"
    
    # Restore context
    local git_state=$(jq -r '.context.git_state' "$context_file")
    local current_subtask=$(jq -r '.context.current_subtask' "$context_file")
    
    # Move task back to active
    if [ -d "$TASKS_DIR/3_execution/suspended/$task_id" ]; then
        mv "$TASKS_DIR/3_execution/suspended/$task_id" "$TASKS_DIR/3_execution/active/"
    fi
    
    # Update task status
    echo "RESUMING: $task_id from $current_subtask" > "$TASKS_DIR/system/resume_signal"
    
    # Clean up suspension context
    rm "$context_file"
    
    log "Task $task_id resumed successfully"
    return 0
}

# Helper functions
get_current_primary_task() {
    local queue_file="$TASKS_DIR/system/priority_queue.json"
    if [ -f "$queue_file" ]; then
        jq -r '.processing.primary_task' "$queue_file" 2>/dev/null || echo ""
    fi
}

get_current_subtask() {
    local task_id="$1"
    local monitoring_file="$TASKS_DIR/3_execution/active/$task_id/monitoring.json"
    if [ -f "$monitoring_file" ]; then
        jq -r '.current_subtask' "$monitoring_file" 2>/dev/null || echo ""
    fi
}

get_files_in_progress() {
    # Return list of files currently being modified
    echo '[]' # Simplified implementation
}

capture_environment_state() {
    # Capture current environment state
    echo "$(pwd):$(git branch --show-current):$(date)"
}

# Command-line interface
case "$1" in
    "add")
        add_interrupt_task "$2" "$3" "$4" "$5"
        ;;
    "suspend")
        suspend_current_task "$2"
        ;;
    "resume")
        resume_suspended_task "$2"
        ;;
    "status")
        echo "Current primary task: $(get_current_primary_task)"
        echo "Suspended tasks: $(ls -1 $TASKS_DIR/3_execution/suspended/ 2>/dev/null | wc -l)"
        ;;
    *)
        echo "Usage: $0 {add|suspend|resume|status}"
        echo "  add <task_id> <priority> <time> <description>"
        echo "  suspend <reason>"
        echo "  resume <task_id>"
        echo "  status"
        exit 1
        ;;
esac
