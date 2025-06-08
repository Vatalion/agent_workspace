#!/bin/bash
# Enterprise Task Management - Cross-Machine Sync
# Location: .tasks/system/sync_check.sh

PROJECT_ROOT="/Users/vitalijsimko/workspace/projects/flutter/m5"
TASKS_DIR="$PROJECT_ROOT/.tasks"
LOG_FILE="$TASKS_DIR/system/sync_check.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

update_machine_registry() {
    local registry_file="$TASKS_DIR/system/machine_registry.json"
    local current_time=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    local machine_id=$(hostname)
    
    # Update last seen time for current machine
    sed -i '' "s/\"last_seen\": \"[^\"]*\"/\"last_seen\": \"$current_time\"/" "$registry_file"
    
    log "Updated machine registry for $machine_id"
}

check_remote_changes() {
    cd "$PROJECT_ROOT"
    
    # Fetch latest changes
    git fetch origin task-management-state 2>/dev/null
    
    # Check if there are remote changes
    local behind_count=$(git rev-list HEAD..origin/task-management-state --count 2>/dev/null || echo "0")
    
    if [ "$behind_count" -gt 0 ]; then
        log "Remote changes detected: $behind_count commits behind"
        return 0
    else
        log "No remote changes detected"
        return 1
    fi
}

sync_remote_changes() {
    cd "$PROJECT_ROOT"
    
    # Check for local uncommitted changes
    if ! git diff --quiet .tasks/ || ! git diff --cached --quiet .tasks/; then
        log "Local changes detected, committing before sync"
        
        # Commit local changes first
        git add .tasks/
        git commit -m "Pre-sync: Local changes $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    # Pull remote changes
    if git pull origin task-management-state; then
        log "Successfully synced remote changes"
        
        # Update sync status
        local status_file="$TASKS_DIR/system/sync_status.json"
        local current_time=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
        sed -i '' "s/\"last_successful_sync\": \"[^\"]*\"/\"last_successful_sync\": \"$current_time\"/" "$status_file"
        
        return 0
    else
        log "Failed to sync remote changes - conflicts may exist"
        return 1
    fi
}

detect_conflicts() {
    cd "$PROJECT_ROOT"
    
    # Check for merge conflicts
    if git diff --name-only --diff-filter=U | grep -q ".tasks/"; then
        log "Merge conflicts detected in .tasks/ directory"
        
        # List conflicted files
        local conflicted_files=$(git diff --name-only --diff-filter=U | grep ".tasks/")
        log "Conflicted files: $conflicted_files"
        
        # Update conflict status
        local status_file="$TASKS_DIR/system/sync_status.json"
        sed -i '' 's/"conflict_resolution_needed": false/"conflict_resolution_needed": true/' "$status_file"
        
        return 0
    else
        return 1
    fi
}

validate_state() {
    # Validate critical system files exist and are valid JSON
    local critical_files=(
        "$TASKS_DIR/system/enterprise_config.json"
        "$TASKS_DIR/system/priority_queue.json"
        "$TASKS_DIR/system/machine_registry.json"
        "$TASKS_DIR/system/sync_status.json"
    )
    
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            log "CRITICAL: Missing system file: $file"
            return 1
        fi
        
        # Validate JSON
        if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
            log "CRITICAL: Invalid JSON in: $file"
            return 1
        fi
    done
    
    log "State validation passed"
    return 0
}

# Main sync check
log "Starting cross-machine sync check"

# Update machine registry
update_machine_registry

# Check for remote changes
if check_remote_changes; then
    # Sync remote changes
    if sync_remote_changes; then
        # Check for conflicts
        if detect_conflicts; then
            log "ATTENTION: Manual conflict resolution required"
            echo "CONFLICT" > "$TASKS_DIR/system/sync_alert"
        fi
    fi
fi

# Validate system state
if ! validate_state; then
    log "CRITICAL: State validation failed"
    echo "VALIDATION_FAILED" > "$TASKS_DIR/system/sync_alert"
fi

log "Sync check completed"
