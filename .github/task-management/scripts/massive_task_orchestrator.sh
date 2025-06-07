#!/bin/bash
# Enterprise Task Management - Massive Task Orchestrator
# Location: .github/task-management/scripts/massive_task_orchestrator.sh

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"
TASKS_DIR="$PROJECT_ROOT/.tasks"
GITHUB_DIR="$PROJECT_ROOT/.github"
TASK_MGMT_DIR="$GITHUB_DIR/task-management"
CONFIG_DIR="$TASK_MGMT_DIR/config"
SCRIPTS_DIR="$TASK_MGMT_DIR/scripts"
LOG_FILE="$TASK_MGMT_DIR/logs/massive_task.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "$1"
}

# Initialize massive task with epic-scale support
initialize_massive_task() {
    local task_file="$1"
    local task_id=$(jq -r '.epic_id' "$task_file")
    
    log "🚀 INITIALIZING MASSIVE TASK: $task_id"
    
    # Create epic-scale directory structure
    mkdir -p "$TASKS_DIR/epics/$task_id"
    mkdir -p "$TASKS_DIR/epics/$task_id/milestones"
    mkdir -p "$TASKS_DIR/epics/$task_id/snapshots"
    mkdir -p "$TASKS_DIR/epics/$task_id/machine_states"
    
    # Initialize git branch for task state
    cd "$PROJECT_ROOT"
    local branch_name="epic-$(echo $task_id | tr '_' '-')"
    git checkout -b "$branch_name" 2>/dev/null || git checkout "$branch_name"
    
    # Create initial state snapshot
    cp "$task_file" "$TASKS_DIR/epics/$task_id/epic_config.json"
    
    # Initialize progress tracking
    cat > "$TASKS_DIR/epics/$task_id/progress.json" << EOF
{
  "epic_id": "$task_id",
  "status": "initialized",
  "start_time": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "machine_initiated": "$(hostname)",
  "current_milestone": null,
  "milestones_completed": [],
  "total_commits": 0,
  "interruption_history": [],
  "machine_switches": []
}
EOF
    
    log "✅ Epic-scale task initialized with unlimited duration support"
}

# Checkpoint system for massive tasks
create_massive_checkpoint() {
    local epic_id="$1"
    local checkpoint_type="$2"  # milestone, task, emergency, manual
    
    log "📍 CREATING CHECKPOINT: $checkpoint_type for epic $epic_id"
    
    local epic_dir="$TASKS_DIR/epics/$epic_id"
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local checkpoint_dir="$epic_dir/snapshots/checkpoint_${timestamp}_${checkpoint_type}"
    
    mkdir -p "$checkpoint_dir"
    
    # Capture complete state - copy from new .github location
    cp -r "$TASK_MGMT_DIR" "$checkpoint_dir/task_management_state"
    cp "$epic_dir/progress.json" "$checkpoint_dir/"
    
    # Capture git state
    cd "$PROJECT_ROOT"
    git stash push -m "Checkpoint: $checkpoint_type - $timestamp" --include-untracked
    echo "$(git rev-parse HEAD)" > "$checkpoint_dir/git_commit_hash.txt"
    git stash pop
    
    # Commit current state
    git add .tasks/
    git commit -m "CHECKPOINT [$checkpoint_type]: Epic $epic_id - $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Update checkpoint count
    local checkpoint_count=$(find "$epic_dir/snapshots" -name "checkpoint_*" | wc -l | tr -d ' ')
    jq ".checkpoint_count = $checkpoint_count" "$epic_dir/progress.json" > "$epic_dir/progress.json.tmp"
    mv "$epic_dir/progress.json.tmp" "$epic_dir/progress.json"
    
    log "✅ Checkpoint created: $checkpoint_dir"
}

# Interrupt handling for massive tasks
interrupt_massive_task() {
    local epic_id="$1"
    local interrupt_priority="$2"  # CRITICAL, HIGH, MEDIUM, LOW
    local interrupt_reason="$3"
    
    log "⚠️  INTERRUPTING MASSIVE TASK: $epic_id (Priority: $interrupt_priority)"
    
    # Create emergency checkpoint
    create_massive_checkpoint "$epic_id" "emergency"
    
    # Update interruption history
    local epic_dir="$TASKS_DIR/epics/$epic_id"
    local interrupt_time=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    
    jq ".interruption_history += [{
        \"timestamp\": \"$interrupt_time\",
        \"priority\": \"$interrupt_priority\", 
        \"reason\": \"$interrupt_reason\",
        \"machine\": \"$(hostname)\"
    }]" "$epic_dir/progress.json" > "$epic_dir/progress.json.tmp"
    mv "$epic_dir/progress.json.tmp" "$epic_dir/progress.json"
    
    # Push state to remote for cross-machine access
    cd "$PROJECT_ROOT"
    git push origin HEAD --force-with-lease
    
    log "✅ Massive task interrupted and state preserved"
}

# Resume massive task (potentially on different machine)
resume_massive_task() {
    local epic_id="$1"
    local from_machine="$2"
    
    log "🔄 RESUMING MASSIVE TASK: $epic_id (from machine: $from_machine)"
    
    # Sync from remote
    cd "$PROJECT_ROOT"
    local branch_name="epic-$(echo $epic_id | tr '_' '-')"
    git fetch origin "$branch_name"
    git checkout "$branch_name"
    git pull origin "$branch_name"
    
    # Validate state integrity
    local epic_dir="$TASKS_DIR/epics/$epic_id"
    if [[ ! -f "$epic_dir/progress.json" ]]; then
        log "❌ ERROR: Cannot find epic progress file"
        return 1
    fi
    
    # Record machine switch
    local switch_time=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    jq ".machine_switches += [{
        \"timestamp\": \"$switch_time\",
        \"from_machine\": \"$from_machine\",
        \"to_machine\": \"$(hostname)\"
    }]" "$epic_dir/progress.json" > "$epic_dir/progress.json.tmp"
    mv "$epic_dir/progress.json.tmp" "$epic_dir/progress.json"
    
    log "✅ Massive task resumed on $(hostname)"
    
    # Display current state
    echo "📊 EPIC STATUS:"
    jq -r '
        "Epic ID: " + .epic_id + "\n" +
        "Status: " + .status + "\n" + 
        "Current Milestone: " + (.current_milestone // "None") + "\n" +
        "Interruptions: " + (.interruption_history | length | tostring) + "\n" +
        "Machine Switches: " + (.machine_switches | length | tostring)
    ' "$epic_dir/progress.json"
}

# Progress milestone completion
complete_milestone() {
    local epic_id="$1"
    local milestone_name="$2"
    
    log "🎯 COMPLETING MILESTONE: $milestone_name for epic $epic_id"
    
    # Create milestone checkpoint
    create_massive_checkpoint "$epic_id" "milestone"
    
    # Update progress
    local epic_dir="$TASKS_DIR/epics/$epic_id"
    local completion_time=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    
    jq ".milestones_completed += [\"$milestone_name\"] | 
        .milestone_completion_times += {\"$milestone_name\": \"$completion_time\"}" \
        "$epic_dir/progress.json" > "$epic_dir/progress.json.tmp"
    mv "$epic_dir/progress.json.tmp" "$epic_dir/progress.json"
    
    # Push milestone completion
    cd "$PROJECT_ROOT"
    git add .tasks/
    git commit -m "MILESTONE COMPLETE: $milestone_name - Epic $epic_id"
    git push origin HEAD
    
    log "✅ Milestone $milestone_name completed and synchronized"
}

# Show epic status
show_epic_status() {
    local epic_id="$1"
    local epic_dir="$TASKS_DIR/epics/$epic_id"
    
    if [[ ! -f "$epic_dir/progress.json" ]]; then
        echo "❌ Epic $epic_id not found"
        return 1
    fi
    
    echo "🏗️  MASSIVE TASK STATUS: $epic_id"
    echo "=================================="
    jq -r '
        "📅 Started: " + .start_time + "\n" +
        "🖥️  Machine: " + .machine_initiated + "\n" +
        "📍 Status: " + .status + "\n" +
        "🎯 Current Milestone: " + (.current_milestone // "Planning") + "\n" +
        "✅ Milestones Complete: " + (.milestones_completed | length | tostring) + "\n" +
        "📊 Total Commits: " + (.total_commits | tostring) + "\n" +
        "⚠️  Interruptions: " + (.interruption_history | length | tostring) + "\n" +
        "🔄 Machine Switches: " + (.machine_switches | length | tostring)
    ' "$epic_dir/progress.json"
    
    # Show recent activity
    echo ""
    echo "📈 RECENT ACTIVITY:"
    echo "=================="
    if jq -e '.interruption_history | length > 0' "$epic_dir/progress.json" >/dev/null; then
        echo "Last Interruption:"
        jq -r '.interruption_history[-1] | "  " + .timestamp + " - " + .priority + ": " + .reason' "$epic_dir/progress.json"
    fi
    
    if jq -e '.machine_switches | length > 0' "$epic_dir/progress.json" >/dev/null; then
        echo "Last Machine Switch:"
        jq -r '.machine_switches[-1] | "  " + .timestamp + " - " + .from_machine + " → " + .to_machine' "$epic_dir/progress.json"
    fi
}

# Main command handler
case "$1" in
    "init")
        initialize_massive_task "$2"
        ;;
    "checkpoint")
        create_massive_checkpoint "$2" "$3"
        ;;
    "interrupt")
        interrupt_massive_task "$2" "$3" "$4"
        ;;
    "resume")
        resume_massive_task "$2" "$3"
        ;;
    "milestone")
        complete_milestone "$2" "$3"
        ;;
    "status")
        show_epic_status "$2"
        ;;
    *)
        echo "Usage: $0 {init|checkpoint|interrupt|resume|milestone|status} [args...]"
        echo ""
        echo "Commands:"
        echo "  init <task_file>              - Initialize massive task"
        echo "  checkpoint <epic_id> <type>   - Create checkpoint"
        echo "  interrupt <epic_id> <priority> <reason> - Interrupt task"
        echo "  resume <epic_id> <from_machine> - Resume on current machine"
        echo "  milestone <epic_id> <name>    - Complete milestone"
        echo "  status <epic_id>              - Show epic status"
        exit 1
        ;;
esac
