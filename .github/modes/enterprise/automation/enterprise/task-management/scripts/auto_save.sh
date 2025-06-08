#!/bin/bash
# Enterprise Task Management - Auto Save & Git Integration
# Location: .github/task-management/scripts/auto_save.sh

PROJECT_ROOT="/Users/vitalijsimko/workspace/projects/flutter/m5"
TASKS_DIR="$PROJECT_ROOT/.tasks"
GITHUB_DIR="$PROJECT_ROOT/.github"
TASK_MGMT_DIR="$GITHUB_DIR/task-management"
CONFIG_DIR="$TASK_MGMT_DIR/config"
LOG_FILE="$TASK_MGMT_DIR/logs/auto_save.log"

# Configuration
COMMIT_INTERVAL=900  # 15 minutes
PUSH_TRIGGERS=("milestone_complete" "suspension" "critical_checkpoint" "daily_backup")

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

update_sync_status() {
    local status_file="$CONFIG_DIR/sync_status.json"
    local current_time=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    
    # Update last commit time
    sed -i '' "s/\"last_commit\": \"[^\"]*\"/\"last_commit\": \"$current_time\"/" "$status_file"
    
    # Calculate next commit time (15 minutes from now)
    local next_time=$(date -u -v +15M '+%Y-%m-%dT%H:%M:%SZ')
    sed -i '' "s/\"next_commit\": \"[^\"]*\"/\"next_commit\": \"$next_time\"/" "$status_file"
}

auto_commit() {
    cd "$PROJECT_ROOT"
    
    # Check if there are changes in .tasks directory
    if git diff --quiet .tasks/ && git diff --cached --quiet .tasks/; then
        log "No changes to commit"
        return 0
    fi
    
    # Add all .tasks changes
    git add .tasks/
    
    # Create meaningful commit message
    local active_tasks=$(find "$TASKS_DIR/3_execution/active" -name "*.json" | wc -l | tr -d ' ')
    local completed_tasks=$(find "$TASKS_DIR/4_completion/archived" -name "*.json" | wc -l | tr -d ' ')
    
    local commit_msg="Auto-save: Task state $(date '+%Y-%m-%d %H:%M:%S') | Active: $active_tasks | Completed: $completed_tasks"
    
    # Commit changes
    if git commit -m "$commit_msg"; then
        log "Successfully committed changes: $commit_msg"
        update_sync_status
        return 0
    else
        log "Failed to commit changes"
        return 1
    fi
}

auto_push() {
    local trigger=$1
    cd "$PROJECT_ROOT"
    
    # Check if we should push based on trigger
    case "$trigger" in
        "interval"|"milestone_complete"|"suspension"|"critical_checkpoint"|"daily_backup")
            if git push origin task-management-state 2>/dev/null; then
                log "Successfully pushed to remote: $trigger"
                
                # Update sync status
                local status_file="$TASKS_DIR/system/sync_status.json"
                local current_time=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
                sed -i '' "s/\"last_push\": \"[^\"]*\"/\"last_push\": \"$current_time\"/" "$status_file"
                
                return 0
            else
                log "Failed to push to remote: $trigger"
                return 1
            fi
            ;;
        *)
            log "Invalid push trigger: $trigger"
            return 1
            ;;
    esac
}

check_triggers() {
    # Check for trigger files that indicate special events
    for trigger in "${PUSH_TRIGGERS[@]}"; do
        if [ -f "$TASKS_DIR/system/triggers/$trigger" ]; then
            log "Found trigger: $trigger"
            auto_push "$trigger"
            rm "$TASKS_DIR/system/triggers/$trigger"
        fi
    done
}

# Create necessary directories
mkdir -p "$TASKS_DIR/system/triggers"
mkdir -p "$(dirname "$LOG_FILE")"

# Initialize git branch if it doesn't exist
cd "$PROJECT_ROOT"
if ! git show-ref --verify --quiet refs/heads/task-management-state; then
    log "Creating task-management-state branch"
    git checkout -b task-management-state
    git push -u origin task-management-state
fi

# Main auto-save loop
log "Starting enterprise auto-save daemon"
while true; do
    # Auto-commit every 15 minutes
    auto_commit
    
    # Check for special triggers
    check_triggers
    
    # Push on interval (every hour)
    if [ $(($(date +%M) % 60)) -eq 0 ]; then
        auto_push "interval"
    fi
    
    # Sleep for commit interval
    sleep $COMMIT_INTERVAL
done
